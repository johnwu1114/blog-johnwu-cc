---
title: '[鐵人賽 Day20] ASP.NET Core 2 系列 - 快取機制及 Redis Session'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - Redis
  - Session
  - Cache
categories:
  - ASP.NET Core
date: 2018-01-08 12:00
featured_image: /images/pasted-113p.png
---

本篇將介紹 ASP.NET Core 用 Redis Cache 存放 Session，避免 Web Application 重啟後，用戶要重新登入。  

<!-- more -->

## 快取機制

### 本機快取

### 分散式快取

## Redis Session 運行方式

ASP.NET Core 用的 Redis Session 套件是 `Microsoft.Extensions.Caching.Redis.Core`，跟 ASP.NET MVC 普遍用的 `StackExchange.Redis` 不一樣，兩者的運行方式也略有不同。  

* **ASP.NET MVC Redis Session**  
 `StackExchange.Redis` 在使用 Redis 時，是把 Website 的 Session 備份到 Redis，讀取還是在 Website 的記憶體，寫入的話會再度備份到 Redis。  
 也就是說 Session 會存在於 Website 及 Redis Cache 中，HA 的概念。  
 可以試著把 Redis Cache 中 Session 清掉，當使用者下一個 Requset 來的時候，又會重新出現在  Redis Cache 中。  
 運行方式如下圖：  
 ![[鐵人賽 Day24] ASP.NET Core 2 系列 - 快取機制及 Redis Session - ASP.NET MVC - Redis Session 運行方式](/images/pasted-112.gif)

* **ASP.NET Core Redis Session**  
 `Microsoft.Extensions.Caching.Redis.Core` 運做方式變成 Session 直接在 Redis Cache 存取，如果把 Redis Cache 中 Session 清掉，當使用者下一個 Requset 來的時候，就會發現 Session 被清空了。  
 運行方式如下圖：  
 ![[鐵人賽 Day24] ASP.NET Core 2 系列 - 快取機制及 Redis Session - ASP.NET Core - Redis Session 運行方式](/images/pasted-113.gif)

### 安裝套件

要在 ASP.NET Core 使用 Redis Cache，可以安裝 Microsoft 提供的套件 `Microsoft.Extensions.Caching.Redis.Core`。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.Extensions.Caching.Redis.Core
```

### 設定 Redis Cache

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


## 參考

[In-memory caching in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/memory)  
[Working with a distributed cache in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/distributed)  