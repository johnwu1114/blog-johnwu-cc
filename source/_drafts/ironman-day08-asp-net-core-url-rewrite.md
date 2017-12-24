---
title: '[鐵人賽 Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite)'
author: John Wu
tags:
  - ASP.NET Core
  - Middleware
  - Routing
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-27 12:00
featured_image: /images/i08-1.png
---

路由跟 URL 重寫的功能性略有不同。路由比較像是地圖，而 URL 重寫~~是為了推卸責任 XD~~比較像是修改地圖。  
本篇將介紹 ASP.NET Core 的 URL 重寫 (URL Rewrite)。  

<!-- more -->

## URL Rewrite 註冊

> URL Rewriting Middleware 需要 `Microsoft.AspNetCore.Rewrite` 套件。  
 ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.Rewrite`，所以不用再安裝。  
 如果是 ASP.NET Core 1.0 的版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
 ```sh
dotnet add package Microsoft.AspNetCore.Rewrite
 ```

在 *Startup.cs* 的 `Configure` 對 `IApplicationBuilder` 使用 `UseRewriter` 方法註冊 URL Rewriting Middleware：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        var rewrite = new RewriteOptions()
            .AddRewrite("about.aspx", "home/about", true)
            .AddRedirect("first", "home/index");
        app.UseRewriter(rewrite);
        // ...
    }
}
```

HTTP 301 / 302 轉址對人的行為來說沒有什麼意義，反正就是幫忙從 A 轉到 B。  
主要差異是給搜尋引擎理解的。  

* **HTTP 301**  
 HTTP 301 是要讓搜尋引擎知道，該網址已經永久轉移到另一個地方。  
 通常用於網站搬家或網站改版，新舊版本路徑不相同，要重新對應的情況。  
* **HTTP 302**  
 HTTP 302 是告知搜尋引擎，雖然這次被轉址，但只是暫時性的。  
 通常用於網站維護時，暫時原網址轉移到別的地方，如維修公告頁面。  

## 參考

[URL Rewriting Middleware in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/url-rewriting?tabs=aspnetcore2x)  