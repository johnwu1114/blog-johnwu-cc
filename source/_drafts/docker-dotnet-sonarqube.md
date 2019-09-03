---
title: 'Docker 教學 - .NET Core 程式碼分析報告 (Sonarqube)'
author: John Wu
tags:
  - Docker
  - .NET Core
  - Sonarqube
categories:
  - Docker
date: 2019-09-04 00:15
featured_image: /images/x443.png
---

Sonarqube 是常見的程式碼分析工具，本篇介紹如何透過 Docker 進行 .NET Core 程式碼分析；  
並搭配 Coverlet 產生程式碼覆蓋率分析，一併傳送至 Sonarqube。  

<!-- more -->

## Sonarqube

可透過以下 docker 指令，快速啟動 Sonarqube：  

```sh
docker run --name sonarqube -p 9000:9000 sonarqube
```

啟動後，用瀏覽器打開 http://localhost:9000/ 就能看到 Sonarqube 站台。  
預設帳號/密碼為：`admin` / `admin`  

登入後，可新增 Sonarqube 分析專案，步驟如下：  

![Docker 教學 - .NET Core 程式碼分析報告 (Sonarqube) - 新增 Sonarqube 分析專案 1](/images/x441.png)  

![Docker 教學 - .NET Core 程式碼分析報告 (Sonarqube) - 新增 Sonarqube 分析專案 2](/images/x442.png)  

## Dockerfile

`build-unit-test.dockerfile`

```Dockerfile
FROM mcr.microsoft.com/dotnet/core/sdk:2.2
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk
RUN dotnet tool install --global coverlet.console && \
    dotnet tool install --global dotnet-sonarscanner
ENV PATH=$PATH:/root/.dotnet/tools/
WORKDIR /
COPY . .
RUN dotnet sonarscanner begin /k:"my-project" \
    /d:sonar.host.url=http://192.168.1.11:9000 \
    /d:sonar.login=<sonarqube_project_token> \
    /d:sonar.cs.opencover.reportsPaths=/coverage/coverage.opencover.xml \
    /d:sonar.exclusions=**/*.js,**/*.ts \
    /d:sonar.test.exclusions=**/MyProject.ExcludeExample/**/*
RUN dotnet test \
    /p:CollectCoverage=true \
    /p:CoverletOutputFormat=opencover \
    /p:CoverletOutput=/coverage/ \
    UnitTest.sln
RUN dotnet sonarscanner end /d:sonar.login=<sonarqube_project_token>
```

前一篇文章 [Docker 教學 - .NET Core 測試報告 (Coverlet + ReportGenerator)](/article/docker-dotnet-coverage-report-generator.html) 有基本介紹一下 Coverlet，本篇就不再贅述。  

Docker Image 建置指令：  

```sh
docker build -f build-unit-test.dockerfile -t my-project-coverage .
```

## 執行結果

![Docker 教學 - .NET Core 程式碼分析報告 (Sonarqube) - 執行結果 1](/images/x443.png)  

![Docker 教學 - .NET Core 程式碼分析報告 (Sonarqube) - 執行結果 2](/images/x444.png)  


## 參考

* [Coverlet](https://github.com/tonerdo/coverlet/)  
* [SonarQube - ReportGenSonarScanner for MSBuilderator](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner-for-msbuild/)  
* [SonarQube - Narrowing the Focus](https://docs.sonarqube.org/latest/project-administration/narrowing-the-focus/)  
* [SonarCloud - Test Coverage & Execution](https://sonarcloud.io/documentation/analysis/coverage/)  
