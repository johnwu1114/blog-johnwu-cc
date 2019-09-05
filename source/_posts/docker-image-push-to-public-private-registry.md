---
title: 'Docker 教學 - Docker Image 混合公有及私有 Docker Registry'
author: John Wu
tags:
  - Docker
categories:
  - Docker
date: 2019-08-05 23:02
featured_image: /images/b/32.png
---

本篇介紹如何依照不同的資料類型分層建置 Docker Image；  
並把開放性資料及敏感資料的分層，分別推上公有和私有 Docker Registry。  

<!-- more -->

## 情境描述

最近在一個特殊的網路環境下，因流量限制及安全性考量，產生了這個特別的需求，網路架構如下圖：  

![Docker 教學 - Docker Image 混合公有及私有 Docker Registry - 情境描述網路架構圖](/images/b/31.png)  

開發環境跟生產環境都可以連到外網，但兩邊的網路互不相通，只能透過 Cleanroom 存取兩邊的網路環境。  
但上圖紅線部分，Cleanroom 連到生產環境有以下問題：  

1. 網路速度慢  
2. 連線品質不佳  
3. 網路費昂貴依流量計價  
4. 不能把原始碼放到生產環境

若直接將 Docker Images 從 Cleanroom 推上生產環境，每次佈署都會產生驚人的費用。  
生產環境雖然可以連外網，但因安全性考量**不能在外網建立私有 Docker Registry**，所以只能在開發環境跟生產環境內部架設私有 Docker Registry。  

## 製作 Docker Image

在建置 Docker Image 時，可利用 Docker Layer 的特性，將非敏感資料及敏感資料分層，把敏感資料的 Layer Size 降至最低，透過 Cleanroom 傳送到生產環境，其餘則直接退送到外部公開的 Docker Registry。  

Docker Image 分為以下三個階段，分別建置出三個 Docker Image，再拼裝成可直接被運行的 Docker Image。  
此範例主要是以 ASP.NET Core 作為建置範例，但此範例不侷限於 ASP.NET Core 專案。  

ASP.NET Core 編譯出來的專案，會依照 namespase 區分出對應的 DLL，例如：  

1. MyProject.Website 專案，會生成 MyProject.Website.dll  
2. MyProject.Common 專案，會生成 MyProject.Common.dll  

而外部參考的第三方套件，會有自己所屬名稱的 DLL，利用此特性將內部開發的 DLL 及外部參考的 DLL 分離。  

### Build Artifacts

首先建立一個專門編譯的 Container，將編譯後的結果依照名稱特性，區分到不同目錄：  

檔案 `artifacts.dockerfile`：

```Dockerfile
FROM mcr.microsoft.com/dotnet/core/sdk:2.2
WORKDIR /src
COPY ./src .
# 編譯 ASP.NET Core，並將編譯結果輸出到 /publish 目錄
RUN dotnet publish -o /publish --configuration Release
# 把名稱為 MyProject 開頭的檔案，都複製到 /sensitive 目錄
RUN mkdir /sensitive; \
    cp -R /publish/MyProject* /sensitive
# 把 /publish 目錄中 MyProject 開頭的檔案全部移除
RUN rm -rf /publish/MyProject*
```

建置 Docker Image，並打上一個自訂的 Tag 名稱：  

```sh
docker build -f artifacts.dockerfile -t artifacts:latest .
```

> `artifacts.dockerfile` 所產出的 Docker Image 包含的原始碼及編譯後的 DLL，只用在以下兩個 Docker Image 建置時使用。  
> 使用完畢**應立即刪除**，最好不要推上 Docker Registry。  

### Build Third-Party Reference

製作 ASP.NET Core Runtime 環境的 Docker Image，並以 Artifacts Image 作為檔案來源：  

檔案 `third-party.dockerfile`：

```Dockerfile
FROM artifacts:latest as artifacts

FROM mcr.microsoft.com/dotnet/core/aspnet:2.2
WORKDIR /app
COPY --from=artifacts /publish .
```

建置 Third-Party DLL 的 Docker Image，作為基底 Image：  

```sh
docker build -f third-party.dockerfile -t third-party:latest .
```

> `third-party.dockerfile` 產出的 Docker Image，是基於微軟官方所提供，隨處可得的公開資料內容；  
> 而從 Artifacts 所複製進來的檔案，也都是第三方套件，並沒有什麼敏感性資訊。  
> 由於此 Docker Image 不帶有敏感資訊，所以推上 Docker Hub 也無所謂。  

### Build Final Image

最後以 `third-party.dockerfile` 為運行環境的基底，做出最後可被執行的 Docker Image。  

檔案 `app.dockerfile`：

```Dockerfile
FROM artifacts:latest as artifacts

FROM third-party:latest
COPY --from=artifacts /sensitive .
ENTRYPOINT dotnet MyProject.Website.dll
```

建置運行環境的 Docker Image：  

```sh
docker build -f app.dockerfile -t my-project:latest .
```

> `app.dockerfile` 產出的 Docker Image，就是 Artifacts 當初編譯後的結果，只是將資料分在兩個 Dockre Image。  

## Push to Docker Registry

將以上 Docker Image 準備好後，就可以開始時實作此範例流程了：  

![Docker 教學 - Docker Image 混合公有及私有 Docker Registry - 範例實作結果流程圖](/images/b/32.png)

```sh
# 1. 把 my-project 推上開發環境的 Registry
docker tag my-project:latest dev-private-registry/my-project:latest
docker push dev-private-registry/my-project:latest

# 2. 把 third-party 推上外部的 Registry
docker tag third-party:latest public-registry/third-party:latest
docker push public-registry/third-party:latest

# 3. 在生產環境把第二步的 Image 拉下來
docker pull public-registry/third-party:latest

# 4. 把 third-party 推上生產環境的 Registry
docker tag public-registry/third-party:latest prod-private-registry/third-party:latest
docker push prod-private-registry/third-party:latest

# 5. 從 Cleanroom 拉下開發環境的 my-project
docker pull dev-private-registry/my-project:latest

# 6. 從 Cleanroom 把 my-project 推上生產環境的 Registry
docker tag dev-private-registry/my-project:latest prod-private-registry/my-project:latest
docker push prod-private-registry/my-project:latest

# 7. Server 從生產環境的 Registry 取得可執行的 Docker Image
docker run prod-private-registry/my-project:latest
```

步驟 6 在推送的時候，會先比對目標 Docker Registry 使否已經有 Image 相依 Layers，如果有就不會傳送。  
而 Layers 的比較依據是 sha，所以 Docker Image 名稱或 Tag 改變，也不會受影響。

> `dev-private-registry`、`prod-private-registry`及`public-registry`請記得換上實際的 Docker Registry URL。

## 參考

* [Docker 官方文件 - Dockerfile reference](https://docs.docker.com/engine/reference/builder/)