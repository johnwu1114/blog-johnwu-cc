title: ASP.NET Core 教學 - Exception Handler
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Filter
  - Middleware
categories:
  - ASP.NET Core
date: 2017-06-20 09:45:00
---
![ASP.NET Core 教學 - Exception Handler 層級](/images/pasted-206.png)

ASP.NET Core 要做一個通用的 Exception Handler 可以透過 Middleware 或 Filter，但兩者之間的執行週期確大不相同。  
本篇將介紹 ASP.NET Core 透過 Middleware 及 Filter 異常處理的差異。  

<!-- more -->

實做 Exception Handler 前，需要先了解 Middleware 及 Filter 的特性。  
可以參考這兩篇：
* [ASP.NET Core 教學 - Middleware](/article/asp-net-core-middleware.html)  
* [ASP.NET Core 教學 - Filters](/article/asp-net-core-filters.html)  

## Exception Filter

Exception Filter 僅能補捉到 Action 及 Action Filter 所發出的 Exception。  
其它的類型的 Filter 或 Middleware 產生的 Exception，並沒有辦法透過 Exception Filter 攔截。  
如果要做全站的通用的 Exception Handler，可能就沒有這麼合適。  

Exception Filter 實做範例：
```cs
// ...
public class ExceptionFilter : IAsyncExceptionFilter
{
    public Task OnExceptionAsync(ExceptionContext context)
    {
        context.HttpContext.Response.WriteAsync($"{GetType().Name} catch exception. Message: {context.Exception.Message}");
        return Task.CompletedTask;
    }
}
```

Exception Filter 全域註冊：
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

Exception Middleware 實做範例：
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
            await context.Response.WriteAsync($"{GetType().Name} catch exception. Message: {ex.Message}");
        }
    }
}
```

Exception Middleware 全域註冊：
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

## 執行結果

我做了一個簡單的範例，從不同類型的 Filter 及 Middleware 丟出 Exception，攔截 Exception 的結果如下：
![ASP.NET Core 教學 - Exception Handler - 範例執行結果](/images/pasted-206.gif)

## 程式碼下載

[asp-net-core-Exception Handler](https://github.com/johnwu1114/asp-net-core-exception-handler)
