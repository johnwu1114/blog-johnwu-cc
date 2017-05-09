title: ASP.NET Core + Angular 4 教學 - Redis Session
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - TypeScript
  - 'C#'
  - Web Api
  - Redis
  - Session
categories:
  - ASP.NET Core
  - Angular
date: 2017-05-09 17:15:00
---
![ASP.NET Core + Angular 4 教學 - Redis Session 範例執行結果](/images/pasted-111.gif)

本篇將介紹 ASP.NET Core 用 Redis Cache 存放 Session，避免 Web Application 重啟後，用戶要重新登入。  

<!-- more -->

程式碼延續之前範例：  
[ASP.NET Core + Angular 4 教學 - Captcha](/article/asp-net-core-angular-4-教學-captcha.html)  

## 1. 安裝 NuGet 套件

NuGet 套件管理搜尋 Microsoft.Extensions.Caching.Redis.Core，然後安裝：
![ASP.NET Core + Angular 4 教學 - Redis Session 安裝 NuGet 套件](/images/pasted-111.png)

## 2. 設定 Redis Cache

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

![ASP.NET Core + Angular 4 教學 - Redis Session 範例執行結果](/images/pasted-111.gif)

## 程式碼下載

[asp-net-core-angular-redis-cache](https://github.com/johnwu1114/asp-net-core-angular-redis-cache)