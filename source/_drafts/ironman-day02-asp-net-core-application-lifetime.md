---
title: '[鐵人賽 Day02] ASP.NET Core 2 系列 - 程式生命週期 (Application Lifetime)'
author: John Wu
tags:
  - ASP.NET Core
  - 2018 iT 邦幫忙鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-21 23:17
featured_image: /images/i02-1.png
---

要了解程式的運作原理，需要先知道程式的進入點及生命週期。  
過往 ASP.NET MVC 啟動方式，是從繼承 `HttpApplication` 的 `Global.asax` 檔案開始。  
ASP.NET Core 改變了網站啟動的方式，變的比較像是 Console Application。  
本篇將介紹 ASP.NET Core 的程式生命週期 (Application Lifetime) 及補捉 Application 停啟事件。  

<!-- more -->
