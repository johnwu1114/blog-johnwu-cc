---
title: '[鐵人賽 Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite)'
author: John Wu
tags:
  - ASP.NET Core
  - Middleware
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-27 12:00
featured_image: /images/i08-1.png
---

路由跟 URL 重寫的功能性略有不同。路由是將 Request 找到對應的服務，而 URL 重寫是為了~~推卸責任 XD~~轉送 Request。  
本篇將介紹 ASP.NET Core 的 URL 重寫 (URL Rewrite)。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite)](https://ithelp.ithome.com.tw/articles/10194104)  
 
<!-- more -->

## URL Rewrite 註冊

> URL Rewriting Middleware 需要 `Microsoft.AspNetCore.Rewrite` 套件。  
 ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.Rewrite`，所以不用再安裝。  
 URL 重寫功能是在 ASP.NET Core 1.1 之後的版本才有，如果是 ASP.NET Core 2.0 以前版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
 ```sh
dotnet add package Microsoft.AspNetCore.Rewrite
 ```

要使用 URL 重寫，在 *Startup.cs* 的 `Configure` 對 `IApplicationBuilder` 使用 `UseRewriter` 方法註冊 URL Rewriting Middleware：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        var rewrite = new RewriteOptions()
            .AddRewrite("about.aspx", "home/about", skipRemainingRules: true)
            .AddRedirect("first", "home/index");
        app.UseRewriter(rewrite);
        // ...
    }
}
```
透過 `RewriteOptions` 建立 URL 重寫規則後，傳入給 URL Rewriting Middleware。  
URL 重寫規則，主要有分兩種方式：  
* **URL 重寫 (URL Rewrite)**  
 上例的 `AddRewrite` 就是 URL 重寫。  
* **URL 轉址 (URL Redirect)**  
 上例的 `AddRedirect` 就是 URL 轉址。  

### URL 重寫

URL 重寫是屬於 Server 端的轉換事件，當 Client 端 Request 來的時候，發現原網址已經被換掉了，就會自動回傳新網址的內容。情境如下：  

![[鐵人賽 Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite) - URL 重寫情境](/images/i08-3.png)  

上例 `AddRewrite` 有用到三個參數，當 URL 符合 **參數 1** 時，就將 **參數 2** 路由的內容回傳給 Client。  
而 **參數 3** 是用來加速 URL 匹配的參數，類似 switch 的 break。若將 `skipRemainingRules` 設為 **true**，當找到匹配條件，就不再繼續往下找符合其他 **參數 1** 的規則。  
* **參數 1** 支援正規表示式(Regular Expressions)。  

範例結果：  

![[鐵人賽 Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite) - URL 重寫 - 範例結果](/images/i08-2.png)  


### URL 轉址

URL 重寫是屬於 Client 端的轉換事件，當 Client 端 Request 來的時候，發現原網址已經被換掉了，Server 會先回傳給 Client 告知新網址，再由 Client 重新 Request 新網址。情境如下：  

![[鐵人賽 Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite) - URL 轉址情境](/images/i08-4.png)  

`AddRedirect` 的使用方式類似 `AddRewrite`，當 URL 符合 **參數 1** 時，就會回傳 **參數 2** 的 URL 給 Client。  
* **參數 1** 同樣支援正規表示式(Regular Expressions)。  

URL 轉址預設都是回傳 HTTP Status Code 302，也可以在 **參數 3** 指定回傳的 HTTP Status Code。  
通常轉址的 HTTP Status Code 都是用 301 或 302 ，URL 轉址對 **"人"** 的行為來說沒有什麼意義，反正就是幫忙從 A 轉到 B；主要差異是給 **"搜尋引擎"** 理解的。  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        var rewrite = new RewriteOptions()
            .AddRedirect("first", "home/index", 301);
        app.UseRewriter(rewrite);
        // ...
    }
}
```

* **HTTP Status Code 301**  
 **301** 是要讓搜尋引擎知道，該網址已經永久轉移到另一個地方。  
 通常用於網站搬家或網站改版，新舊版本路徑不相同，要重新對應的情況。  
 範例結果：  
 ![[鐵人賽 Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite) - URL 重寫 - HTTP Status Code 301 範例結果](/images/i08-5.png)  
* **HTTP Status Code 302**  
 **302** 是告知搜尋引擎，雖然這次被轉址，但只是暫時性的。  
 通常用於網站維護時，暫時原網址轉移到別的地方，如維修公告頁面。  
 範例結果：  
 ![[鐵人賽 Day08] ASP.NET Core 2 系列 - URL 重寫 (URL Rewrite) - URL 重寫 - HTTP Status Code 302 範例結果](/images/i08-1.png)  

## 正規表示式

`AddRewrite` 及 `AddRedirect` 都支援正規表示式的使用，且能把來源的 URL 透過正規表示式變成參數，帶入新 URL。

範例程式：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        var rewrite = new RewriteOptions()
            .AddRedirect("products.aspx?id=(\w+)", "prosucts/$1", 301);
            .AddRedirect("api/(.*)/(.*)/(.*)", "api?p1=$1&p2=$2&p3=$3", 301);
        app.UseRewriter(rewrite);
        // ...
    }
}
```
* 當連到 `http://localhost:5000/products.aspx?id=p123`  
 轉址到 `http://localhost:5000/products/p123`  
* 當連到 `http://localhost:5000/api/first/second/third`  
 轉址到 `http://localhost:5000/api?p1=first&p2=second&p3=third`  

透過正規表示式做 URL 轉址，對於網站新舊改版來說，非常好用。  

## 參考

[URL Rewriting Middleware in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/url-rewriting?tabs=aspnetcore2x)  