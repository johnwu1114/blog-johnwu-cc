---
title: '[鐵人賽 Day14] ASP.NET Core 2 系列 - Filters'
author: John Wu
tags:
  - ASP.NET Core
  - Filter
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2018-01-02 12:00
featured_image: /images/pasted-198.png
---

Filter 是延續 ASP.NET MVC 的產物，同樣保留了五種的 Filter，分別是 *Authorization Filter*、*Resource Filter*、*Action Filter*、*Exception Filter* 及 *Result Filter*。  
透過不同的 Filter 可以有效處理封包進出的加工，本篇將介紹 ASP.NET Core 的五種 Filter 運作方式。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day14] ASP.NET Core 2 系列 - Filters](https://ithelp.ithome.com.tw/articles/10195407)  
 
<!-- more -->

## Filter 介紹

Filter 的作用是在 Action **執行前**或**執行後**做一些加工處理。  
某種程度來看，會跟 Middleware 很像，但執行的順序略有不同，用對 Filter 不僅可以減少程式碼，還可以減省執行效率。  

ASP.NET Core 有以下五種 Filter 可以使用：  
* **Authorization Filter**  
Authorization 是五種 Filter 中優先序最高的，通常用於驗證 Request 合不合法，不合法後面就直接跳過。  
* **Resource Filter**  
Resource 是第二優先，會在 Authorization 之後，Model Binding 之前執行。通常會是需要對 Model 加工處裡才用。  
* **Action Filter**  
最容易使用的 Filter，封包進出都會經過它，使用上沒什麼需要特別注意的。跟 Resource Filter 很類似，但並不會經過 Model Binding。  
* **Exception Filter**  
異常處理的 Exception。  
* **Result Filter**  
當 Action 完成後，最終會經過的 Filter。

## Filter 運作方式

ASP.NET Core 的每個 Request 都會先經過已註冊的 Middleware 接著才會執行 Filter，除了會依照上述的順序外，同類型的 Filter 預設都會以先進後出的方式處裡封包。  
Response 在某些 Filter 並不會做處理，會值接 Bypass。Request 及 Response 的運作流程如下圖：  

![[鐵人賽 Day14] ASP.NET Core 2 系列 - Filter - 運作方式](/images/pasted-198.png)
* 黃色箭頭是正常情況流程  
* 灰色箭頭是異常處理流程  

## 建立 Filter

ASP.NET Core 的 Filter 基本上跟 ASP.NET MVC 的差不多。  
上述的五種 Filter 範例分別如下：  

### Authorization Filter

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

### Resource Filter

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

### Action Filter

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

### Result Filter

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

### Exception Filter

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

## 註冊 Filter

Filter 有兩種註冊方式，一種是全域註冊，另一種是用 `[Attribute]` 區域註冊的方式，只套用在特定的 Controller 或 Action。  

### 全域註冊

在 `Startup.ConfigureServices` 的 MVC 服務中註冊 Filter，這樣就可以套用到所有的 Request。如下：
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc(config =>
        {
            config.Filters.Add(new ResultFilter());
            config.Filters.Add(new ExceptionFilter());
            config.Filters.Add(new ResourceFilter());
        });
    }
}
```

### 區域註冊

ASP.NET Core 在區域註冊 Filter 的方式跟 ASP.NET MVC 有一點不一樣，要透過 `[TypeFilter(type)]`。  
在 Controller 或 Action 上面加上 `[TypeFilter(type)]` 就可以區域註冊 Filter。如下：
```cs
// ...
namespace MyWebsite.Controllers
{
    [TypeFilter(typeof(AuthorizationFilter))]
    public class HomeController : Controller
    {
        [TypeFilter(typeof(ActionFilter))]
        public void Index()
        {
            Response.WriteAsync("Hello World! \r\n");
        }
        
        [TypeFilter(typeof(ActionFilter))]
        public void Error()
        {
            throw new System.Exception("Error");
        }
    }
}
```

`[TypeFilter(type)]` 用起來有點冗長，想要像過去 ASP.NET MVC 用 `[Attribute]` 註冊 Filter 的話，只要將 Filter 繼承 `Attribute` 即可。如下：  
```cs
public class AuthorizationFilter : Attribute, IAuthorizationFilter
{
    // ...
}
public class ActionFilter : Attribute, IActionFilter
{
    // ...
}
```

`[Attribute]` 註冊就可以改成如下方式：
```cs
// ...
namespace MyWebsite.Controllers
{
    [AuthorizationFilter]
    public class HomeController : Controller
    {
        [ActionFilter]
        public void Index()
        {
            Response.WriteAsync("Hello World! \r\n");
        }
        
        [ActionFilter]
        public void Error()
        {
            throw new System.Exception("Error");
        }
    }
}
```

### 執行結果

`http://localhost:5000/Home/Index` 輸出結果如下：
```
AuthorizationFilter in.
ResourceFilter in.
ActionFilter in.
Hello World!
ActionFilter out.
ResultFilter in.
ResultFilter out.
ResourceFilter out.
```

`http://localhost:5000/Home/Error` 輸出結果如下：
```
AuthorizationFilter in.
ResourceFilter in.
ActionFilter in.
ActionFilter out.
ExceptionFilter in.
ResourceFilter out.
```

## 執行順序

預設註冊同類型的 Filter 是以先進後出的方式處裡封包，註冊層級也會影響執行順序。  

![[鐵人賽 Day14] ASP.NET Core 2 系列 - Filter - 執行順序](/images/i14-1.png)

但也可以透過實作 IOrderedFilter 更改執行順序。例如：  
```cs
public class ActionFilter : Attribute, IActionFilter, IOrderedFilter
{
    public string Name { get; set; }

    public int Order { get; set; } = 0;

    public void OnActionExecuting(ActionExecutingContext context)
    {
        context.HttpContext.Response.WriteAsync($"{GetType().Name}({Name}) in. \r\n");
    }
    public void OnActionExecuted(ActionExecutedContext context)
    {
        context.HttpContext.Response.WriteAsync($"{GetType().Name}({Name}) out. \r\n");
    }
}
```

在註冊 Filter 時帶上 Order，數值越小優先權越高。
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc(config =>
        {
            config.Filters.Add(new ActionFilter() { Name = "Global", Order = 3 });
        });
    }
}
```

```cs
// ...
namespace MyWebsite.Controllers
{
    [ActionFilter(Name = "Controller", Order = 2)]
    public class HomeController : Controller
    {
        [ActionFilter(Name = "Action", Order = 1)]
        public void Index()
        {
            Response.WriteAsync("Hello World! \r\n");
        }
    }
}
```

變更執行順序後的輸出內容：
```
ActionFilter(Action) in. 
ActionFilter(Controller) in. 
ActionFilter(Global) in. 
Hello World! 
ActionFilter(Global) out. 
ActionFilter(Controller) out. 
ActionFilter(Action) out. 
```

## 參考

[ASP.NET Core Filters](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/filters)