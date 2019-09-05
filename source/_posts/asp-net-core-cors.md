---
title: ASP.NET Core 教學 - 跨域請求 Cross-Origin Requests (CORS)
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Middleware
  - CORS
  - Security
categories:
  - ASP.NET Core
date: 2017-07-21 13:58:00
featured_image: /images/a/240.png
---
![ASP.NET Core 教學 - 跨域請求 Cross-Origin Requests (CORS)](/images/a/240.png)

有些團隊會把前後端專案切開，放在不同的網域執行，如此一來就會遇到瀏覽器安全性問題，禁止不同網域的請求。如上圖。  
本篇將介紹 ASP.NET Core 啟用跨域請求 Cross-Origin Requests (CORS)。  

<!-- more -->

## 1. 安裝 NuGet 套件

ASP.NET Core 有針對 CORS 出套件。  
打開 NuGet 找到 `Microsoft.AspNetCore.Cors` 並安裝。  

## 2. Startup

安裝完 CORS 套件後，在 Services 註冊 CORS 的 Policy，如下：

Startup.cs
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            // Policy 名稱 CorsPolicy 是自訂的，可以自己改
            options.AddPolicy("CorsPolicy", policy =>
            {
                // 設定允許跨域的來源，有多個的話可以用 `,` 隔開
                policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
            });
        });
        services.AddMvc();
    }
}
```
> 若要同意所有跨域來源都能呼叫的話，可以把 `WithOrigins()` 改為 `AllowAnyOrigin()`  

## 3. 套用 Policy

套用 Policy 有兩種方式：  
1. 全域套用  
2. 區域套用  

### 3.1. 全域套用

在 Configure 註冊 Policy，所有的 Request 都會套用。

Startup.cs
```cs
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        // 套用 Policy 到 Middleware
        app.UseCors("CorsPolicy");
        app.UseMvc();
    }
}
```

### 3.2. 區域套用 

可以在 Controller 或 Action 掛上 `[EnableCors("PolicyName")]`，套用 Policy 到 Controller 或 Action 上。

Controller
```cs
[EnableCors("CorsPolicy")]
[Route("api/[controller]")]
public class ContactController : Controller
{
    // ...
}
```

Action
```cs
[Route("api/[controller]")]
public class ContactController : Controller
{
    [EnableCors("CorsPolicy")]
    [HttpGet("{id}")]
    public ResultModel Get(int id)
    {
        // ...
    }
}
```

## 執行結果

![ASP.NET Core 教學 - 跨域請求 Cross-Origin Requests (CORS) - 範例執行結果](/images/a/241.png)

## 程式碼下載

[asp-net-core-cors](https://github.com/johnwu1114/asp-net-core-cors)

## 參考

[Enabling Cross-Origin Requests (CORS)](https://docs.microsoft.com/en-us/aspnet/core/security/cors)  
[ASP.NET Core and CORS Gotchas](https://weblog.west-wind.com/posts/2016/Sep/26/ASPNET-Core-and-CORS-Gotchas)  