title: ASP.NET Core - Middleware
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Middleware
categories:
  - ASP.NET Core
date: 2017-05-11 11:07:00
---
![ASP.NET Core - Middleware - 運作方式](/images/pasted-114p.png)

本篇將介紹 ASP.NET Core 的 Middleware，透過 Middleware 掌握封包的進出。

<!-- more -->

## Middleware 運作方式

ASP.NET Core 的每個 Request 都會經過所有註冊的 Middleware，Response 也是逐一回傳，以先進後出的方式處裡封包。  

Request 流程如下圖：
![ASP.NET Core - Middleware - 運作方式](/images/pasted-114.gif)

## 1. 建立 Middleware

Middleware 取代了 ASP.NET MVC 的 HTTP modules 及 handlers，使用方式更為簡潔。  
此範例我建立了三個 Middleware，分別在 Request 及 Response 的部分輸出訊息。  
如下：

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

SecondMiddleware.cs
```cs
public class SecondMiddleware
{
    private readonly RequestDelegate _next;

    public SecondMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        await context.Response.WriteAsync($"{nameof(SecondMiddleware)} in. \r\n");

        await _next(context);

        await context.Response.WriteAsync($"{nameof(SecondMiddleware)} out. \r\n");
    }
}
```

ThirdMiddleware.cs
```cs
public class ThirdMiddleware
{
    private readonly RequestDelegate _next;

    public ThirdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        await context.Response.WriteAsync($"{nameof(ThirdMiddleware)} in. \r\n");

        await _next(context);

        await context.Response.WriteAsync($"{nameof(ThirdMiddleware)} out. \r\n");
    }
}
```

## 2. 註冊 Middleware

在 Startup.cs 註冊 Middleware：
```cs
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseMiddleware<FirstMiddleware>();
        app.UseMiddleware<SecondMiddleware>();
        app.UseMiddleware<ThirdMiddleware>();

        app.Run(async (context) =>
        {
            await context.Response.WriteAsync("Hello World! \r\n");
        });
    }
}
```

## 執行結果

![ASP.NET Core - Middleware - 範例執行結果](/images/pasted-114.png)

## 程式碼下載

[asp-net-core-middleware](https://github.com/johnwu1114/asp-net-core-middleware)

## 參考

[ASP.NET Core Middleware Fundamentals](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware)