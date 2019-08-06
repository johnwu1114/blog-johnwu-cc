---
title: '.NET Core 測試報告'
author: John Wu
tags:
  - ASP.NET Core
  - Middleware
categories:
  - ASP.NET Core
date: 2019-08-06 23:24
featured_image: /images/logo-net-core.png
---

<!-- more -->

```sh
dotnet tool install --global dotnet-reportgenerator-globaltool --version 4.0.0-rc4
```


```sh
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
reportgenerator "-reports:coverage.opencover.xml" "-targetdir:coverage"
```

* [Coverlet](https://github.com/tonerdo/coverlet/)  
  這是 .NET Core 的 Code Coverage 工具，可透過以下指令安裝：  

```bash
dotnet tool install --global coverlet.console
```

`build-unit-test.dockerfile`

```Dockerfile
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS dotnet-test-env
WORKDIR /
COPY . .
RUN dotnet tool install --global coverlet.console
RUN dotnet test UnitTest.sln \
    /p:CollectCoverage=true \
    /p:CoverletOutputFormat=opencover \
    /p:CoverletOutput=/coverage/
RUN dotnet ~/.nuget/packages/reportgenerator/*/tools/netcoreapp2.0/ReportGenerator.dll \
    "-reports:/coverage/coverage.opencover.xml" "-targetdir:/coverage"

FROM nginx:alpine
RUN rm /usr/share/nginx/html/index.html
COPY --from=dotnet-test-env /coverage /usr/share/nginx/html
```

https://github.com/danielpalme/ReportGenerator  
https://www.nuget.org/packages/dotnet-reportgenerator-globaltool  
