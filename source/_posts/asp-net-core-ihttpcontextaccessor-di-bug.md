---
title: ASP.NET Core 2.2 - IHttpContextAccessor DI Bug
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
categories:
  - ASP.NET Core
date: 2019-03-17 12:26:00
---
![ASP.NET Core 2.2 - IHttpContextAccessor DI Bug](/images/featured/net-core.png)

最近把 ASP.NET Core 專案從 2.1 升級到 2.2，原本正常的 Integration Test 跑不過了；  
追根究底後才發現是，ASP.NET Core 2.2 的 Bug，用到注入 `IHttpContextAccessor` 發生 `HttpContext` 是 `null`。  

<!-- more -->

又踩到雷，還是踩到大地雷，搞了我好幾天！！！  

在本機開發，直接運行 Integration Test 是正常的，但只要放到 Docker 裡運行 Integration Test 就跑不過；  
Deploy 出去服務也都正常，想破頭都想不出來，覺得怎麼會這樣，還暫時改 Build Flow 跳過 Integration Test。  

最後只好進到 Docker 下一大堆 Log 除錯，終於找到原因，DI 的 `IHttpContextAccessor`，取用 `HttpContext` 竟然是 `null`，導致拿不到 Session。  

不查就算了，一查差點嘔了幾十兩血，沒想到是 dotnet core 2.2 的 BUG...  
> [https://github.com/aspnet/AspNetCore/issues/6080](https://github.com/aspnet/AspNetCore/issues/6080)  

我們的情境偏偏只在 Docker + WebApplicationFactory 才會發生。雷阿～～～  

## 解法

不要注入 IHttpContextAccessor，改成注入 ISession。如圖：  
![ASP.NET Core 2.2 - IHttpContextAccessor DI Bug - 解法](/images/b/27.png)

## 參考

* [DI IHttpContextAccessor.HttpContext is null after upgrade to 2.2.0](https://github.com/aspnet/AspNetCore/issues/6080)