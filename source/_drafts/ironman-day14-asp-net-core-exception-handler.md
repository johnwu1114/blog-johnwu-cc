---
title: '[鐵人賽 Day14] ASP.NET Core 2 系列 - 例外處理 (Exception Handler)'
author: John Wu
tags:
  - ASP.NET Core
  - Filter
  - Middleware
  - 2018 iT 邦幫忙鐵人賽
categories:
  - ASP.NET Core
date: 2018-01-02 23:17
featured_image: /images/pasted-206.png
---

例外處理(Exception Handler)算是程式開發蠻重要的一件事，尤其程式暴露在外，要是不小心顯示了什麼不該讓使用者看到的東西就糟糕了。  
要在 ASP.NET Core 做一個通用的 Exception Handler 可以透過 Middleware 或 Filter，但兩者之間的執行週期確大不相同。  
本篇將介紹 ASP.NET Core 透過 Middleware 及 Filter 異常處理的差異。  

<!-- more -->

> 實做 Exception Handler 前，需要先了解 **Middleware** 及 **Filter** 的特性。  
可以參考這兩篇：
* [[鐵人賽 Day03] ASP.NET Core 2 系列 - Middleware](/article/ironman-day03-asp-net-core-middleware.html)  
* [[鐵人賽 Day10] ASP.NET Core 2 系列 - Filters](/article/ironman-day10-asp-net-core-filters.html)  

## Exception Filter

Exception Filter 僅能補捉到 Action 及 Action Filter 所發出的 Exception。  
其它的類型的 Filter 或 Middleware 產生的 Exception，並沒有辦法透過 Exception Filter 攔截。  
如果要做全站的通用的 Exception Handler，可能就沒有這麼合適。  

Exception Filter 範例：  
*ExceptionFilter.cs*
```cs
// ...
public class ExceptionFilter : IAsyncExceptionFilter
{
    public Task OnExceptionAsync(ExceptionContext context)
    {
        context.HttpContext.Response
            .WriteAsync($"{GetType().Name} catch exception. Message: {context.Exception.Message}");
        return Task.CompletedTask;
    }
}
```

Exception Filter 全域註冊：  
*Startup.cs*
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc(config =>
        {
            config.Filters.Add(new ExceptionFilter());
        });
    }
}
```
> 除非你註冊了兩個以上的 Exception Filter，不然 Filter 註冊的先後順序並不重要，執行順序是依照 Filter 的類型，同類型的 Filter 才會關係到註冊的先後順序。

## Exception Middleware

Middleware 註冊的層級可以在 Filters 的外層，也就是說所有的 Filter 都會經過 Middleware。  
如果再把 Exception Middleware 註冊在所有 Middleware 的最外層，就可以變成全站的 Exception Handler。  
Exception Handler 層級示意圖如下:
![ASP.NET Core 教學 - Exception Handler 層級](/images/pasted-206.png)

Exception Middleware 範例：  
*ExceptionMiddleware.cs*
```cs
// ...
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await context.Response
                .WriteAsync($"{GetType().Name} catch exception. Message: {ex.Message}");
        }
    }
}
```

Exception Middleware 全域註冊：  
*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseMiddleware<ExceptionMiddleware>();
        // Other Middleware...
    }
}
```
> Middleware 的註冊順序很重要，越先註冊的會包在越外層。  
 把 ExceptionMiddleware 註冊在越外層，能涵蓋的範圍就越多。  

## Exception Handler

ASP.NET Core 也有提供 Exception Handler，底層就是用上述 Exception Middleware 的做法，在 Application Builder 使用 `UseExceptionHandler` 指定錯誤頁面。  
*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseExceptionHandler("/error");
        // Other Middleware...
    }
}
```

用以下範例模擬錯誤發生：  
*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        public void Index()
        {
            throw new System.Exception("This is exception sample from Index().");
        }

        [Route("/api/test")]
        public string Test()
        {
            throw new System.Exception("This is exception sample from Test().");
        }

        [Route("/Error")]
        public string Error()
        {
            return "This is error page.";
        }
    }
}
```
當連入 `http://localhost:5000/` 發生錯誤後，就會回傳 **This is error page.**。  
> 注意！不會轉址到 `http://localhost:5000/error`，是直接回傳 `HomeController.Error()` 的內容。

### ExceptionHandlerOptions

如果網站中混用 Web API，當 API 發生錯誤時，依然回傳 `HomeController.Error()` 的內容，就會顯得很奇怪。  
`UseExceptionHandler` 除了可以指派錯誤頁面外，也可以自己實作錯誤發生的事件。  
*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseExceptionHandler(new ExceptionHandlerOptions()
        {
            ExceptionHandler = async context =>
            {
                bool isApi = Regex.IsMatch(context.Request.Path.Value, "^/api/", RegexOptions.IgnoreCase);
                if (isApi)
                {
                    context.Response.ContentType = "application/json";
                    var json = @"{ ""Message"": ""Internal Server Error"" }";
                    await context.Response.WriteAsync(json);
                    return;
                }
                context.Response.Redirect("/error");
            }
        });
        // Other Middleware...
    }
}
```
這次特別處理了 API 的錯誤，當連入 `http://localhost:5000/api/*` 發生錯誤時，就會回傳 JSON 格式的錯誤。  
```json
{ 
    "Message": "Internal Server Error" 
}
```
一般 MVC 頁面發生錯誤，改用 302 轉址到 `http://localhost:5000/error`。

### UseDeveloperExceptionPage

通常在開發期間，還是希望能直接看到錯誤資訊，會比較方便除錯。  
`UseDeveloperExceptionPage` 是 ASP.NET Core 提供的錯誤資訊頁面服務，可以在 Application Builder 注入。  
在 `Startup.Configure` 注入 `IHostingEnvironment` 取得環境變數，判斷在開發階段才套用，反之則用 Exception Handler。  
*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        // 暫時測試可以直接指派環境名稱
        // env.EnvironmentName = EnvironmentName.Development;
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/error");
        }
        // Other Middleware...
    }
}
```
> `env.IsDevelopment()` 是從 `ASPNETCORE_ENVIRONMENT` 而來。  
 詳細情參考這篇：[[鐵人賽 Day12] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments)](/article/ironman-day12-asp-net-core-multiple-environments.html)

開發環境的錯誤資訊頁面如下：  

![[鐵人賽 Day13] ASP.NET Core 2 系列 - 例外處理(Exception Handler) - UseDeveloperExceptionPage](/images/i14-1.png)  

## 參考

[Introduction to Error Handling in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/error-handling)  