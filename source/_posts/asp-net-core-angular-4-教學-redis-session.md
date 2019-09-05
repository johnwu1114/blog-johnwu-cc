---
title: ASP.NET Core + Angular 4 教學 - Redis Session
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - TypeScript
  - 'C#'
  - Web API
  - Redis
  - Session
categories:
  - ASP.NET Core
  - Angular
date: 2017-05-09 17:15:00
featured_image: /images/a/113p.png
---
![ASP.NET Core + Angular 4 教學 - Redis Session 運行方式](/images/a/113p.png)

本篇將介紹 ASP.NET Core 用 Redis Cache 存放 Session，避免 Web Application 重啟後，用戶要重新登入。  

<!-- more -->

程式碼延續之前範例：  
[ASP.NET Core + Angular 4 教學 - Captcha](/article/asp-net-core-angular-4-教學-captcha.html)  

## 1. Redis Session 運行方式

ASP.NET Core 用的 Redis Session 套件是 Microsoft.Extensions.Caching.Redis.Core，跟 ASP.NET MVC 普遍用的 StackExchange.Redis 不一樣，兩者的運行方式也略有不同。  

### 1.1 ASP.NET MVC Redis Session

StackExchange.Redis 在使用 Redis 時，是把 Website 的 Session 備份到 Redis，讀取還是在 Website 的記憶體，寫入的話會再度備份到 Redis。  
也就是說 Session 會存在於 Website 及 Redis Cache 中，HA 的概念。  
可以試著把 Redis Cache 中 Session 清掉，當使用者下一個 Requset 來的時候，又會重新出現在  Redis Cache 中。  

運行方式如下圖：  
![ASP.NET MVC - Redis Session 運行方式](/images/a/112.gif)

### 1.2 ASP.NET Core Redis Session

Microsoft.Extensions.Caching.Redis.Core 運做方式變成 Session 直接在 Redis Cache 存取，如果把 Redis Cache 中 Session 清掉，當使用者下一個 Requset 來的時候，就會發現 Session 被清空了。  

運行方式如下圖：  
![ASP.NET Core - Redis Session 運行方式](/images/a/113.gif)

## 2. 安裝 NuGet 套件

NuGet 套件管理搜尋 Microsoft.Extensions.Caching.Redis.Core，然後安裝：
![ASP.NET Core + Angular 4 教學 - Redis Session 安裝 NuGet 套件](/images/a/111.png)

## 3. 設定 Redis Cache

Startup.cs 程式碼如下：
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDistributedRedisCache(options =>
            {
                // Redis Server 的 IP 跟 Port
                options.Configuration = "192.168.99.100:6379";
            });
            services.AddSession(options =>
            {
                // 預設是 Session 存活時間是 20 分鐘
                options.IdleTimeout = TimeSpan.FromMinutes(10);
            });
            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseSession();
            app.UseMvc();
        }
    }
}
```

只要設定 AddDistributedRedisCache 就可以使用 Redis Session 了，輕鬆簡單。 

## 執行結果

![ASP.NET Core + Angular 4 教學 - Redis Session 範例執行結果](/images/a/111.gif)

## 程式碼下載

[asp-net-core-angular-redis-cache](https://github.com/johnwu1114/asp-net-core-angular-redis-cache)