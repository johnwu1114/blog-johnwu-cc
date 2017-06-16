title: ASP.NET Core - Filters
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Filters
categories:
  - ASP.NET Core
date: 2017-06-16 12:07:00
---
![ASP.NET Core - Filters - 運作方式](/images/pasted-198.png)

本篇將介紹 ASP.NET Core 的 Filters 的運作方式。

<!-- more -->

## 1. Filter 介紹

ASP.NET Core 有以下五種 Filters 可以使用：  
1. Authorization Filters  
Authorization 是五種 Filters 中優先序最高的，通常用於驗證 Requert 合不合法，不合法後面就直接跳過。  
2. Resource Filters  
Resource 是第二優先，會在 Authorization 之後， Model Binding 之前執行。通常會是需要對 Model 加工處裡才用。  
3. Action Filters  
最常使用的 Filters，封包進處都會經過它。  
4. Exception Filters  
異常處理的 Exception。  
5. Result Filters  
當 Action 完成後，最終會經過的 Filters。

## 2. Filters 運作方式

ASP.NET Core 的每個 Request 都會經過所有註冊的 Middleware 及 Filters (Exception Filters 除外)，以先進後出的方式處裡封包。  
Response 在某些 Filters 並不會做處理，會值接 Bypass，所以 

Request 流程如下圖：
![ASP.NET Core - Filters - 運作方式](/images/pasted-198.png)
> 黃色箭頭是正常情況流程  
> 灰色箭頭是異常處理流程  

## 3. 建立 Filters

Filter 基本上跟 ASP.NET MVC 的差不多。  
以上五種 Filter 各建立了一個範例，在 Request 及 Response 的部分輸出訊息。  

### 3.1. Authorization Filter

AuthorizationFilter.cs
```cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MyWebsite.Filters
{
    public class AuthorizationFilter : IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");
        }
    }
}
```

非同步的方式：
```cs
// ...
public class AuthorizationFilter : IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        await context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");
    }
}
```

### 3.2. Resource Filter

ResourceFilter.cs
```cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MyWebsite.Filters
{
    public class ResourceFilter : IResourceFilter
    {
        public void OnResourceExecuting(ResourceExecutingContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");
        }

        public void OnResourceExecuted(ResourceExecutedContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
        }
    }
}
```

非同步的方式：
```cs
// ...
public class ResourceFilter : IAsyncResourceFilter
{
    public async Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
    {
        await context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");

        await next();

        await context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
    }
}
```

### 3.3. Action Filter

ActionFilter.cs
```cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MyWebsite.Filters
{
    public class ActionFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
        }
    }
}
```

非同步的方式：
```cs
// ...
public class ActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        await context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");

        await next();

        await context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
    }
}
```

### 3.4. Result Filter

ResultFilter.cs
```cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MyWebsite.Filters
{
    public class ResultFilter : IResultFilter
    {
        public void OnResultExecuting(ResultExecutingContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");
        }

        public void OnResultExecuted(ResultExecutedContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
        }
    }
}
```

非同步的方式：
```cs
// ...
public class ResultFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        await context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");

        await next();

        await context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
    }
}
```

### 3.5. Exception Filter

ExceptionFilter.cs
```cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MyWebsite.Filters
{
    public class ExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");
        }
    }
}
```

非同步的方式：
```cs
// ...
public class ExceptionFilter : IAsyncExceptionFilter
{
    public Task OnExceptionAsync(ExceptionContext context)
    {
        context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");
        return Task.CompletedTask;
    }
}
```

## 4. 註冊 Filter

Filter 有兩種註冊方式，第一種是全域註冊，另一種是用 Attribute 區域註冊的方式，只套用在特定的 Action。  

### 4.1. 全域註冊

在 Startup.cs 註冊 Filters，這樣就可以套用到所有的 Request。如下：
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc(config =>
        {
            config.Filters.Add(new ActionFilter());
            config.Filters.Add(new ResultFilter());
            config.Filters.Add(new ExceptionFilter());
            config.Filters.Add(new ResourceFilter());
        });
    }
}
```

### 4.2. 區域註冊

ASP.NET Core 在 Attribute 註冊 Filter 的方式跟 ASP.NET MVC 有一點不一樣，要透過 `[TypeFilter(type)]`。  
在 Controller 或 Action 上面加上 `[TypeFilter(type)]` 就可以區域註冊 Filter。如下：
```cs
// ...
namespace MyWebsite.Controllers
{
    [TypeFilter(typeof(AuthorizationFilter))]
    [TypeFilter(typeof(ExceptionFilter))]
    public class HomeController : Controller
    {
        [MiddlewareFilter(typeof(ActionFilter))]
        [MiddlewareFilter(typeof(ResultFilter))]
        public void Index()
        {
            Response.WriteAsync("Hello World! \r\n");
        }
    }
}
```

## 執行結果

![ASP.NET Core - Filters - 範例執行結果](/images/pasted-199.png)

## 程式碼下載

[asp-net-core-filters](https://github.com/johnwu1114/asp-net-core-filters)

## 參考

[ASP.NET Core Filters](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/filters)