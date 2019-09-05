---
title: 'Docker 教學 - .NET Core 程式碼分析報告 (SonarQube)'
author: John Wu
tags:
  - Docker
  - .NET Core
  - SonarQube
categories:
  - Docker
date: 2019-09-04 23:02
featured_image: /images/b/43.png
---

SonarQube 是常見的程式碼分析工具，本篇介紹如何透過 Docker 進行 .NET Core 程式碼分析；  
並搭配 Coverlet 產生程式碼測試覆蓋率分析，一併傳送至 SonarQube。  

<!-- more -->

## SonarQube

如果沒有 SonarQube 環境的話，可透過以下 docker 指令，快速啟動 SonarQube：  

```sh
docker run --name SonarQube -p 9000:9000 sonarqube
```

啟動後，用瀏覽器打開 http://localhost:9000/ 就能看到 SonarQube 站台。  
預設帳號/密碼為：`admin` / `admin`  

登入後，可新增 SonarQube 專案，步驟如下：  

![Docker 教學 - .NET Core 程式碼分析報告 (SonarQube) - 新增 SonarQube 專案 1](/images/b/41.png)  

![Docker 教學 - .NET Core 程式碼分析報告 (SonarQube) - 新增 SonarQube 專案 2](/images/b/42.png)  

> 分析報告要上傳到 SonarQube Server 時，需要用到 `Project Key` 及步驟 8 的 `Token`。  

## Dockerfile

`build-unit-test.dockerfile`

```Dockerfile
FROM mcr.microsoft.com/dotnet/core/sdk:2.2
# 安裝 Coverlet 及 SonarScanner
RUN dotnet tool install --global coverlet.console && \
    dotnet tool install --global dotnet-sonarscanner
ENV PATH=$PATH:/root/.dotnet/tools/
# 安裝 JRE，SonarScanner 是基於 Java 撰寫，所以需要 JRE
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk
WORKDIR /
COPY . .
# 啟動 SonarScanner
RUN dotnet sonarscanner begin /k:"<sonarqube_project_key>" \
    /d:sonar.host.url=http://192.168.1.11:9000 \
    /d:sonar.login=<sonarqube_project_token> \
    /d:sonar.exclusions=**/*.js,**/*.ts,**/*.css,bin/**/*,obj/**/*,wwwroot/**/*,ClientApp/**/* \
    /d:sonar.cs.opencover.reportsPaths=/coverage/coverage.opencover.xml \
    /d:sonar.coverage.exclusions=**/*Model.cs,MyProject.Test/**/*
# 執行 dotnet test
RUN dotnet test \
    /p:CollectCoverage=true \
    /p:CoverletOutputFormat=opencover \
    /p:CoverletOutput=/coverage/ \
    UnitTest.sln
# 結束 SonarScanner
RUN dotnet sonarscanner end /d:sonar.login=<sonarqube_project_token>
```

Docker Image 建置指令：  

```sh
docker build -f build-unit-test.dockerfile .
```

> 前一篇文章 [Docker 教學 - .NET Core 測試報告 (Coverlet + ReportGenerator)](/article/docker-dotnet-coverage-report-generator.html) 有基本介紹一下 Coverlet，本篇就不再贅述。  

* 啟動 SonarScanner  
  * **/k**  
    SonarQube 的 `Project Key` 是必填欄位。  
  * **/d:sonar.host.url**  
    是 SonarQube Server 的位置。  
  * **/d:sonar.login**  
    SonarQube 的 `Token`，錯誤的話無法成功上傳到 SonarQube Server。  
  * **/d:sonar.exclusions**  
    忽略程式碼分析的檔案或目錄。可用 `,` 隔開指定多個 Patterns。  
    此例忽略 `*.js`、`*.ts` 及 `*.css` 的檔案，如果要分析 `*.js`、`*.ts` 或 `*.css`，還需要在 `Dockerfile` 安裝 `node.js`。  
  * **/d:sonar.cs.opencover.reportsPaths**  
    指定匯入 OpenCover 格式的測試報告路徑。可用 `,` 隔開匯入多個檔案。  
  * **/d:sonar.coverage.exclusions**  
    忽略測試覆蓋率分析報告的檔案或目錄。可用 `,` 隔開指定多個 Patterns。  
* 結束 SonarScanner  
  * **/d:sonar.login**  
    SonarQube 的 `Token`，錯誤的話無法成功上傳到 SonarQube Server。  

## 執行結果

![Docker 教學 - .NET Core 程式碼分析報告 (SonarQube) - 執行結果 1](/images/b/43.png)  

![Docker 教學 - .NET Core 程式碼分析報告 (SonarQube) - 執行結果 2](/images/b/44.png)  


## 參考

* [Coverlet](https://github.com/tonerdo/coverlet/)  
* [SonarQube - ReportGenSonarScanner for MSBuilderator](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner-for-msbuild/)  
* [SonarQube - Narrowing the Focus](https://docs.sonarqube.org/latest/project-administration/narrowing-the-focus/)  
* [SonarCloud - Test Coverage & Execution](https://sonarcloud.io/documentation/analysis/coverage/)  
