---
title: ASP.NET Core 教學 - 忽略 Global Filter
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Filter
categories:
  - ASP.NET Core
date: 2017-07-30 23:21:00
featured_image: /images/a/247.png
---
![ASP.NET Core 教學 - 忽略 Global Filter](/images/a/247.png)

本篇將介紹 ASP.NET Core 註冊全域 Global Filter 時，如何在特定的 Action 略過或取代 Global Filter。  

<!-- more -->

## 前言

註冊成全域的 Global Filter 通常都是為了處理每個 Requset 的一致性邏輯。  
如果少數 Action 邏輯不一致，不能套用 Global Filter 的話，有以下處理方式：  
1. 在 Global Filter 針對特定的 Action 做例外處理。  
 但這種寫法沒彈性，又不符合單一職責原則。  
2. 放棄不用 Global Filter，改為各個 Controller 區域註冊。  
 有符合單一職責原則，但同樣是沒彈性的處理方式又費工。  
3. 讓 Global Filter 排除區域註冊的 Filter。  
 又有彈性，又符合單一職責原則。  

第三種作法就是本篇要介紹的方法了，當使用 Global Filter 時，讓大部分的 Action 都可以保持一致性的邏輯，遇到特殊區域註冊的 Filter 時，就忽略 Global Filter 的邏輯處理。如下圖所示：
![ASP.NET Core 教學 - 忽略 Global Filter](/images/a/247.png)

## 1. Igonre Filter

先建立一個 Action Filter，當作是要被忽略執行 Global Filter 的 Filter，如下：
```cs
public class IgonreGlobalActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        await context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");

        await next();

        await context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
    }
}
```

## 2. 區域註冊

在要被忽略執行 Global Filter 的 Controller 或 Action 上面加上 `[TypeFilter(typeof(IgonreGlobalActionFilter))]`。如下：
```cs
// ...
public class HomeController : Controller
{
    public void First()
    {
        Response.WriteAsync("First Action! \r\n");
    }

    [TypeFilter(typeof(IgonreGlobalActionFilter))]
    public void Special()
    {
        Response.WriteAsync("Special Action! \r\n");
    }
}
```

## 3. Global Filter

在 Global Filter 加入忽略 `IgonreGlobalActionFilter` 的邏輯，如下：
```cs
public class GlobalActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var ignore = context.ActionDescriptor.FilterDescriptors
            .Select(f => f.Filter)
            .OfType<TypeFilterAttribute>()
            .Any(f => f.ImplementationType.Equals(typeof(IgonreGlobalActionFilter)));

        if (ignore)
        {
            await next();
            return;
        }

        await context.HttpContext.Response.WriteAsync($"{GetType().Name} in. \r\n");

        await next();

        await context.HttpContext.Response.WriteAsync($"{GetType().Name} out. \r\n");
    }
}
```

## 執行結果

![ASP.NET Core 教學 - 忽略 Global Filter - 範例執行結果](/images/a/248.png)

## 相關文章

[ASP.NET Core 教學 - Filters](/article/asp-net-core-filters.html)  