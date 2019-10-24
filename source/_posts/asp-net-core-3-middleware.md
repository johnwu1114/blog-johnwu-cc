---
title: 'ASP.NET Core 3 系列 - Middleware'
author: John Wu
tags:
  - ASP.NET Core
  - ASP.NET Core 3
  - Middleware
categories:
  - ASP.NET Core
date: 2019-10-24 21:39
featured_image: /images/ironman/i03-1.png
---

過去 ASP.NET 中使用的 HTTP Modules 及 HTTP Handlers，在 ASP.NET Core 中已不復存在，取而代之的是 Middleware。  
Middleware 除了簡化了 HTTP Modules/Handlers 的使用方式，還帶入了 Pipeline 的概念。  
本篇將介紹 ASP.NET Core 3 的 Middleware 概念及用法。  

<!-- more -->

## Middleware 概念

ASP.NET Core 在 Middleware 的官方說明中，使用了 Pipeline 這個名詞，意旨 Middleware 像水管一樣可以串聯在一起，所有的 Request 及 Response 都會層層經過這些水管。  
用圖例可以很容易理解，如下圖：  

![ASP.NET Core 3 系列 - Middleware - 概念](/images/ironman/i03-1.png)

## App.Use

Middleware 的註冊方式是在 *Startup.cs* 的 `Configure` 對 `IApplicationBuilder` 使用 `Use` 方法註冊。  
大部分擴充的 Middleware 也都是以 **Use** 開頭的方法註冊，例如：  

* **UseRouting()**：Request 路由使用的 Middleware  
* **UseRewriter()**：URL rewriting 的 Middleware  

一個簡單的 Middleware 範例。*Startup.cs* 如下：  

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class Startup
    {
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

            app.Run(async context =>
            {
                await context.Response.WriteAsync("Hello World! \r\n");
            });
        }
    }
}
```

用瀏覽器打開網站任意連結，輸出結果：  

```text
First Middleware in.
Second Middleware in.
Third Middleware in.
Hello World!
Third Middleware out.
Second Middleware out.
First Middleware out.
```

> 在 Pipeline 的概念中，註冊順序是很重要的事情。資料經過的順序一定是**先進後出**。  

Request 流程如下圖：  

![ASP.NET Core 3 系列 - Middleware](https://blog.johnwu.cc/images/a/114.gif)  

Middleware 也可以作為攔截使用，*Startup.cs* 如下：  

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class Startup
    {
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

                // 水管阻塞，封包不往後送
                var condition = false;
                if(condition) {
                    await next.Invoke();
                }

                await context.Response.WriteAsync("Second Middleware out. \r\n");
            });

            app.Use(async (context, next) =>
            {
                await context.Response.WriteAsync("Third Middleware in. \r\n");
                await next.Invoke();
                await context.Response.WriteAsync("Third Middleware out. \r\n");
            });

            app.Run(async context =>
            {
                await context.Response.WriteAsync("Hello World! \r\n");
            });
        }
    }
}
```

輸出結果：  

```text
First Middleware in.
Second Middleware in.
Second Middleware out.
First Middleware out.
```

在 Second Middleware 中，因為沒有達成條件，所以封包也就不在往後面的水管傳送。流程如圖：  

![ASP.NET Core 3 系列 - Middleware - 概念](/images/ironman/i03-2.png)  

## App.Run

`Run` 是 Middleware 的最後一個行為，以上面圖例來說，就是最末端的 Action。  
它不像 `Use` 能串聯其他 Middleware，但 `Run` 還是能完整的使用 Request 及 Response。  

## App.Map

`Map` 是能用來處理一些簡單路由的 Middleware，可依照不同的 URL 指向不同的 `Run` 及註冊不同的 `Use`。  
新增一個路由，*Startup.cs* 如下：  

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app)
        {
            app.Use(async (context, next) =>
            {
                await context.Response.WriteAsync("First Middleware in. \r\n");
                await next.Invoke();
                await context.Response.WriteAsync("First Middleware out. \r\n");
            });

            app.Map("/second", mapApp =>
            {
                mapApp.Use(async (context, next) =>
                {
                    await context.Response.WriteAsync("Second Middleware in. \r\n");
                    await next.Invoke();
                    await context.Response.WriteAsync("Second Middleware out. \r\n");
                });
                mapApp.Run(async context =>
                {
                    await context.Response.WriteAsync("Second. \r\n");
                });
            });

            app.Run(async context =>
            {
                await context.Response.WriteAsync("Hello World! \r\n");
            });
        }
    }
}
```

開啟網站任意連結，會顯示：

```text
First Middleware in.
Hello World!
First Middleware out.
```

開啟網站 `http://localhost:5000/second`，則會顯示：

```text
First Middleware in.
Second Middleware in.
Second.
Second Middleware out.
First Middleware out.
```

## 建立 Middleware 類別

如果 Middleware 全部都寫在 *Startup.cs*，程式碼應該很難維護，所以應該把自製的 Middleware 邏輯獨立出來。  
建立 Middleware 類別不需要額外繼承其它類別或介面，一般的類別即可，*FirstMiddleware.cs* 範例如下：  

```cs
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
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
}
```

### 全域註冊

在 *Startup.cs* 的 `Configure` 註冊 Middleware 就可以套用到所有的 Request。如下：

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app)
        {
            app.UseMiddleware<FirstMiddleware>();

            app.Run(async context =>
            {
                await context.Response.WriteAsync("Hello World! \r\n");
            });
        }
    }
}
```

### 區域註冊

Middleware 也可以只套用在特定的 Controller 或 Action。註冊方式如 *Controllers\HomeController.cs*：  

```cs
// ..
[MiddlewareFilter(typeof(FirstMiddleware))]
public class HomeController : Controller
{
    // ...

    [MiddlewareFilter(typeof(SecondMiddleware))]
    public IActionResult Index()
    {
        // ...
    }
}
```

### Extensions

大部分擴充的 Middleware 都會用一個靜態方法包裝，如：`UseRouting()`、`UseRewriter()`等。  
自製的 Middleware 當然也可以透過靜態方法包，範例 *CustomMiddlewareExtensions.cs* 如下：  

```cs
using Microsoft.AspNetCore.Builder;

namespace MyWebsite
{
    public static class CustomMiddlewareExtensions
    {
        public static IApplicationBuilder UseFirstMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<FirstMiddleware>();
        }
    }
}
```

註冊 Extension Middleware 的方式如下：  

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app)
        {
            app.UseFirstMiddleware();

            app.Run(async context =>
            {
                await context.Response.WriteAsync("Hello World! \r\n");
            });
        }
    }
}
```

## 參考

* [ASP.NET Core Middleware Fundamentals](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware)  
* [Creating Custom Middleware In ASP.Net Core](https://dotnetcoretutorials.com/2017/03/10/creating-custom-middleware-asp-net-core/)  
