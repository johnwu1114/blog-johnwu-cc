---
title: '[鐵人賽 Day03] ASP.NET Core 系列 - Middleware'
author: John Wu
tags:
  - ASP.NET Core
  - Middleware
  - 2018 iT 邦幫忙鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-15 23:17
featured_image: /images/i10.png
---

過去 ASP.NET 中使用的 HTTP Modules 及 HTTP Handlers，在 ASP.NET Core 中已不復存在，取而代之的是 Middleware。  
Middleware 除了簡化了 HTTP Modules/Handlers 的使用方式，還帶入了 Pipeline 的概念。  
本篇將介紹 ASP.NET Core 的 Middleware 概念及用法。  

<!-- more -->

## Middleware 概念

ASP.NET Core 在 Middleware 的官方說明中，使用了 Pipeline 這個名詞，意旨 Middleware 像水管一樣，所有的 Request 及 Response 都會層層經過這些水管。  
用圖例可以很容易理解，如下圖：  

![[鐵人賽 Day03] ASP.NET Core 系列 - Middleware - 概念](/images/i10.png)

## App.Use

Middleware 的註冊方式是在啟動網站設定的 `IApplicationBuilder` 使用 `.Use` 方法註冊。  
大部分擴充的 Middleware 也都是以 `.Use` 開頭的方法註冊，例如：  
* `.UseMvc()`：MVC 的 Middleware  
* `.UseRewriter()`：URL rewriting 的 Middleware  

一個簡單的 Middleware 範例。如下：
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        app.Use(async (context, next) => 
        {
            await context.Response.WriteAsync("First Middleware in. \r\n");
            await next.Invoke();
            await context.Response.WriteAsync("First Middleware out. \r\n");
        });

        app.Use(async (context, next) => 
        {
            await context.Response.WriteAsync("Second Middleware in. \r\n");
            await next.Invoke();
            await context.Response.WriteAsync("Second Middleware out. \r\n");
        });

        app.Use(async (context, next) => 
        {
            await context.Response.WriteAsync("Third Middleware in. \r\n");
            await next.Invoke();
            await context.Response.WriteAsync("Third Middleware out. \r\n");
        });

        app.Run(async (context) =>
        {
            await context.Response.WriteAsync("Hello World! \r\n");
        });
    }
}
```

Output：
```
First Middleware in. 
Second Middleware in. 
Third Middleware in. 
Hello World! 
Third Middleware out. 
Second Middleware out. 
First Middleware out. 
```

> 在 Pipeline 的概念中，註冊順序是很重要的事情。資料經過的順序一定是**先進後出**。

## 建立 Middleware 類別

如果 Middleware 全部都寫在 `Startup.cs`，程式碼應該很難維護，所以應該把自製的 Middleware 邏輯獨立出來。  
建立 Middleware 類別不需要額外繼承其它類別或介面，一般的 Class 即可，範例如下：

FirstMiddleware.cs
```cs
public class FirstMiddleware
{
    private readonly RequestDelegate _next;

    public FirstMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        await context.Response.WriteAsync($"{nameof(FirstMiddleware)} in. \r\n");

        await _next(context);

        await context.Response.WriteAsync($"{nameof(FirstMiddleware)} out. \r\n");
    }
}
```

註冊 Middleware 的方式如下：
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        app.UseMiddleware<FirstMiddleware>();
        // ...
    }
}
```

### Extensions

大部分擴充的 Middleware 都會用一個靜態方法包裝，如：`.UseMvc()`、`.UseRewriter()`等。  
自製的 Middleware 當然也可以透過靜態方法包，範例如下：
```cs
public static class CustomMiddlewareExtensions
{
    public static IApplicationBuilder UseFirstMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<FirstMiddleware>();
    }
}
```

註冊 Extension Middleware 的方式如下：
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        app.UseFirstMiddleware();
        // ...
    }
}
```

## 參考

[ASP.NET Core Middleware Fundamentals](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware)  
[Creating Custom Middleware In ASP.Net Core](https://dotnetcoretutorials.com/2017/03/10/creating-custom-middleware-asp-net-core/)  