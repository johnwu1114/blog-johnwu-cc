---
title: '[鐵人賽 Day26] ASP.NET Core 2 系列 - 跨域請求 (Cross-Origin Requests)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - CORS
  - Security
categories:
  - ASP.NET Core
date: 2018-01-14 12:00
featured_image: /images/i26-2.png
---



有些團隊會把前後端專案切開，放在不同的網域執行，如此一來就會遇到瀏覽器安全性問題，禁止不同網域的請求。  
本篇將介紹 ASP.NET Core 啟用跨域請求 Cross-Origin Requests (CORS)。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day26] ASP.NET Core 2 系列 - 跨域請求 (Cross-Origin Requests)](https://ithelp.ithome.com.tw/articles/xxxxxxx)  

<!-- more -->

假設有兩個 Domain：  
1. blog.johnwu.cc  
  用於提供使用者瀏覽，存放 HTML、JS、CSS 等檔案。  
2. api.johnwu.cc  
  提供 Web API 給 JavaScript 調用。  

當瀏覽器開啟 `http://blog.johnwu.cc` 頁面後，接著透過 AJAX 呼叫了 `http://api.johnwu.cc/cors-sample`，此時就形成的 A Domain 呼叫了 B Domain 的跨域請求 Cross-Origin Requests (CORS)，瀏覽器基於安全性考量，並不允許這種情況發生。情境圖如下：  

![[鐵人賽 Day26] ASP.NET Core 2 系列 - 跨域請求 (Cross-Origin Requests) - 情境 1](/images/i26-1.png)  

因此，瀏覽器會拋出錯誤訊息如下：  
> Failed to load `http://api.johnwu.cc/cors-sample`: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin '`http://blog.johnwu.cc`' is therefore not allowed access.  

![[鐵人賽 Day26] ASP.NET Core 2 系列 - 跨域請求 (Cross-Origin Requests) - 錯誤訊息](/images/i26-3.png)  

## 註冊 Policy

> 在 ASP.NET Core 中使用 CORS，需要 `Microsoft.AspNetCore.Cors` 套件。  
ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 Microsoft.AspNetCore.Cors，所以不用再安裝。  
如果是 ASP.NET Core 1.0 的版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```
dotnet add package Microsoft.AspNetCore.Cors
```

ASP.NET Core 中使用 CORS 只要在 `Startup.ConfigureServices` 呼叫 `AddCors`，就能透過註冊 CORS 的 Policy 規則，如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            // CorsPolicy 是自訂的 Policy 名稱
            options.AddPolicy("CorsPolicy", policy =>
            {
                policy.WithOrigins("http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });
        // ...
    }
    // ...
}
```
* **WithOrigins**  
  設定允許跨域的來源，有多個的話可以用 `,` 隔開。  
  若要同意所有跨域來源都能呼叫的話，可以把 `WithOrigins()` 改為 `AllowAnyOrigin()`。  
* **AllowAnyHeader**  
  允許任何的 Request Header。若要限制 Header，可以改用 `WithHeaders`，有多個的話可以用 `,` 隔開。  
* **AllowAnyMethod**  
  允許任何的 HTTP Method。若要限制 Method，可以改用 `WithMethods`，有多個的話可以用 `,` 隔開。  
* **AllowCredentials**  
  預設瀏覽器不會發送 CORS 的憑證(如：Cookies)，如果 JavaScript 使用 `withCredentials = true` 把 CORS 的憑證帶入，ASP.NET Core 這邊也要允取，才可以正常使用。  

## 套用 Policy

套用 Policy 有兩種方式：  
1. 全域套用  
2. 區域套用  

### 全域套用

在 `Startup.Configure` 呼叫 `UseCors` 註冊 Middleware，並指定要套用的 Policy 名稱，就可以套用到所有的 Request。如下：  

*Startup.cs*
```cs
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseCors("CorsPolicy");
        // ...
    }
}
```

### 區域套用 

可以在 Controller 或 Action 掛上 `[EnableCors("Policy 名稱")]`，套用 Policy 到 Controller 或 Action 上。

* **Controller**
  ```cs
// ...
[EnableCors("CorsPolicy")]
public class HomeController : Controller
{
    // ...
}
  ```
* **Action**
  ```cs
// ...
public class HomeController : Controller
{
    [EnableCors("CorsPolicy")]
    [Route("cors-sample")]
    public ResultModel Test()
    {
        // ...
    }
}
  ```

在 ASP.NET Core 允取 CROS 後，完整的情境如下：  

![[鐵人賽 Day26] ASP.NET Core 2 系列 - 跨域請求 (Cross-Origin Requests) - 情境 2](/images/i26-2.png)  

## 參考

[Enabling Cross-Origin Requests (CORS)](https://docs.microsoft.com/en-us/aspnet/core/security/cors)  
[ASP.NET Core and CORS Gotchas](https://weblog.west-wind.com/posts/2016/Sep/26/ASPNET-Core-and-CORS-Gotchas)  