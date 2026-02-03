---
title: 'Docker 教學 - 打包 ASP.NET Core 前後端專案 Docker Image'
author: John Wu
tags:
  - Docker
  - ASP.NET Core
  - npm
categories:
  - Docker
date: 2019-07-30 23:14
featured_image: /images/b/28.png
---

本篇將介紹如何透過 Dockerfile 製作 ASP.NET Core 的 Docker Image。  
並透過 `.dockerignore` 及 `docker` 指令參數等小技巧，讓專案目錄整理得比較乾淨。  

<!-- more -->

## 前置說明

這個範例有使用到前端及後端的專案，目錄結構大致長成這樣：  

```yml
build/                      # 存放建置 docker image 所需的檔案
doc/                        # 專案相關的文件
scripts/                    # 開發環境所需的腳本
src/                        # dotnet 的專案目錄
    XXXX.Domain/            # 函式庫專案目錄
    XXXX.WebPortal/         # ASP.NET Core 專案目錄
        ClientApp/          # 前端的專案
            node_modules/   # 前端專案的相依目錄
            package.json    # 前端專案的相依設定
        wwwroot/            # 前端專案打包的結果
test/                       # dotnet 的測試專案目錄
    XXXX.IntegrationTest/   # 整合測試專案目錄
    XXXX.UnitTest/          # 單元測試專案目錄
XXXX.sln                    # dotnet 的方案檔
```

## Dockerfile

### dotnet core

大部分的 `Dockerfile` 範例，會把這個檔案放在方案根目錄；  
但此檔跟建置相關，放到 `build` 目錄會比較是適合，同時改一下檔案名稱，比較容易識別。如：  

`build/build-image.dockerfile` 內容如下：  

```Dockerfile
### Build Stage
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS dotnet-build-env
ARG project_name
COPY ./src /src
WORKDIR /src
RUN dotnet publish $project_name -o /publish --configuration Release

### Publish Stage
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2
ARG project_name
WORKDIR /app
COPY --from=dotnet-build-env /publish .
ENV project_dll="${project_name}.dll"
ENTRYPOINT dotnet $project_dll
```

> * 檔案名稱可以自訂，附檔名也沒有任何限制；但可透過修改 IDE 自動偵測附檔名，把 `*.dockerfile` 都以 `Dockerfile` 的格式開啟會比較方便。  
> * ASPNET_PROJECT_NAME  
  名稱從外部帶入有個好處，就是大部分的 dotnet core 專案都適用這個 `Dockerfile` 建置 Docker Image。  

建置指令：

```sh
docker build -f [DOCKERFILE_PATH] -t [IMAGE_NAME]:[TAG] --build-arg project_name=[ASPNET_PROJECT_NAME] .
# 範例： docker build -f build/build-image.dockerfile -t web-portal:develop --build-arg project_name=XXXX.WebPortal .
```

以上 `Dockerfile` 共分為兩個階段：  
1. 第一階段產生名稱為 *dotnet-build-env* 的暫存 Container，然後把方案根目錄的 `src` 複製到 *dotnet-build-env*，執行 `dotnet publish` 把建置的結果放到 `/publish` 目錄。  
   `mcr.microsoft.com/dotnet/core/sdk:2.2` 是拿來編譯用的，大小約 1.74 GB。  
2. 第二階段把 *dotnet-build-env* `/publish` 目錄內的檔案，全部複製到最終階段 Container 的 `/app` 目錄，並指定 Docker 啟動時要執行的指令。  
  `mcr.microsoft.com/dotnet/core/aspnet:2.2` 是執行階段用的，大小約 260 MB。  
  若要追求最小化 Docker Image，可選用 `alpine` 版本。  

建置流程如下：

![Docker 教學 - 打包 ASP.NET Core 前後端專案 Docker Image - Dockerfile dotnet core](/images/b/28.png)

### npm

此範例除了有 ASP.NET Core 專案，同時也包含了前端專案在裡面，前端專案如果是用 *TypeScript* 編寫或其它需要 *Webpack* 打包等動作，都會需要 *node.js*。  
因此，可以透過另一個暫存 Container，負責打包前端專案。  

`build/build-image.dockerfile` 內容如下：  

```Dockerfile
### Build Stage - dotnet
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS dotnet-build-env
ARG project_name
COPY ./src /src
WORKDIR /src
RUN dotnet publish $project_name -o /publish --configuration Release

### Build Stage - npm
FROM node:11 AS npm-build-env
ARG project_name
RUN mkdir -p /publish
RUN npm set progress=false;
COPY ./src /src
WORKDIR /src/$project_name
RUN if [ -f "package.json" ]; then \
        npm i; \
        npm run build; \
        if [ -d "wwwroot" ]; then cp -R wwwroot /publish; fi; \
    fi

### Publish Stage
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2
ARG project_name
WORKDIR /app
COPY --from=dotnet-build-env /publish .
COPY --from=npm-build-env /publish .
ENV project_dll="${project_name}.dll"
ENTRYPOINT dotnet $project_dll
```

> * *npm-build-env* 先判斷專案目錄內是否有 `package.json` 檔案，若存在才會執行 npm build。這樣做的好處是，不管 dotnet core 專案是否有前端專案，都可共用此 `Dockerfile` 建置 Docker Image。  
> * 以此範例來說，`src/XXXX.WebPortal/wwwroot` 目錄為前端專案打包的結果，ASP.NET Core 執行根路徑的 `wwwroot` 目錄為靜態檔案的位置。若實作上的目錄名稱不同，需自行更改位置。  

以上 `Dockerfile` 分為三個階段，在中間又插入了 `npm run build` 的動作，然後把最終結果複製到 *Publish Stage*。  

建置流程如下：

![Docker 教學 - 打包 ASP.NET Core 前後端專案 Docker Image - Dockerfile npm](/images/b/29.png)  

## .dockerignore

從 Host 複製 `src` 目錄到 Container 時，可能會複製到不必要的檔案，如開發階段所產生的目錄： `bin`、`obj` 及 `node_modules` 等。  
為了加速複製檔案，我們可以在方案根目錄新增 `.dockerignore`，告知 **COPY** 忽略這些目錄或檔案，例：  

```yml
.git/
.vs/
.vscode/
build/
docs/
scripts/
**/bin/
**/obj/
**/packages/
**/node_modules/
**/publish/
**/coverage/
**/TestResults/
```

## 清除 Temp images

`Dockerfile` 執行建置後，只會把最後一個 Container 賦予名稱當作最終結果，其它的 Stage 並不會消失，若執行 `docker images` 指令，會發現有一大堆顯示為 **&lt;none&gt;** 的 Docker Image。  
可透過以下指令快速移除：

```sh
# Linux / MacOS
containers=`docker images -f "dangling=true" -q`; if [ -n "$containers" ] ; then docker rmi -f $containers; fi

# Windows
FOR /f "tokens=*" %i IN ('docker images -f "dangling=true" -q') DO docker rmi -f %i
```

## 參考

* [Docker 官方文件 - Dockerfile reference](https://docs.docker.com/engine/reference/builder/)