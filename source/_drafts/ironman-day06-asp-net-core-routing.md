---
title: '[鐵人賽 Day06] ASP.NET Core 系列 - 路由(Routing)'
author: John Wu
tags:
  - ASP.NET Core
  - Middleware
  - Routing
  - 2018 iT 邦幫忙鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-25 23:17
featured_image: /images/i16.png
---

ASP.NET Core 透過路由(Routing)設定，將定義的 URL 規則找到相對應的行為；當使用者 Request 的 URL 滿足特定規則條件時，則自動對應到的相符的行為處理。  
從 ASP.NET 就已經存在的架構，而且用法也很相似，只有些許的不同。  
本篇將介紹 ASP.NET Core 的 RouterMiddleware 用法。  

<!-- more -->

## 簡單路由

前篇 Day03 有介紹到，可以透過 `Map` 處理一些簡單路由，例如：
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        // ...
        app.Map("/first", mapApp =>
        {
            mapApp.Run(async context =>
            {
                await context.Response.WriteAsync("First. \r\n");
            });
        });
        app.Map("/second", mapApp =>
        {
            mapApp.Run(async context =>
            {
                await context.Response.WriteAsync("Second. \r\n");
            });
        });
    }
}
```
但要搭配 ASP.NET Core MVC 的話，簡單路由就沒這麼好用了。  
RouterMiddleware 除了方便搭配 ASP.NET Core MVC 外，也可以比較彈性的使用路由定義。  

## 路由

RouterMiddleware 的路由註冊方式大致分為兩種：  
* 廣域註冊。如：`MapRoute`。  
* 區域註冊。如：`RouteAttribute`。

預設路由的順序如下：  

![[鐵人賽 Day06] ASP.NET Core 系列 - 路由(Routing) - 流程](/images/i16.png)

### 安裝套件

要使用 ASP.NET Core 路由的 Middleware 需要安裝 `Microsoft.AspNetCore.Routing` 套件。  
透過 dotnet cli 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.AspNetCore.Routing
```
> 如果是用 .NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.Routing`，所以不用再安裝。  

## 註冊路由

在 `Startup.cs` 的 `ConfigureServices` 加入 Routing 的服務，並在 `Configure` 定義路由規則：
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddRouting();
    }

    public void Configure(IApplicationBuilder app)
    {
        var defaultRouteHandler = new RouteHandler(context =>
        {
            var routeValues = context.GetRouteData().Values;
            return context.Response.WriteAsync($"Route values: {string.Join(", ", routeValues)}");
        });

        var routeBuilder = new RouteBuilder(app, defaultRouteHandler);
        routeBuilder.MapRoute("default", "{first:regex(^(default|home)$)}/{second?}");

        routeBuilder.MapGet("user/{name}", context => {
            var name = context.GetRouteValue("name");
            return context.Response.WriteAsync($"Get user. name: {name}");
        });

        routeBuilder.MapPost("user/{name}", context => {
            var name = context.GetRouteValue("name");
            return context.Response.WriteAsync($"Create user. name: {name}");
        });

        var routes = routeBuilder.Build();
        app.UseRouter(routes);
    }
}
```
可以看到上面程式碼，建立了兩個物件：  
* `RouteHandler`：這個物件如同簡單路由的 `Run` 事件，當路由成立的時候，就會執行這個事件。  
* `RouteBuilder`：在這個物件定義路由規則，當 Requset URL 符合規則就會執行該事件。  
 * `MapRoute`：預設的路由規則，可以支援正規表示式(Regular Expressions)。
 * HTTP Method 路由：同樣的 URL 可以透過不同的 HTTP Method，對應不同的事件。  

第一個路由 `MapRoute` 定義：  
* URL 第一層透過正規表示式必需是 **default** 或 **home**，並放到路由變數 *first* 中。
* URL 第二層可有可無，如果有的話，放到路由變數 *second* 中。  

第二個路由 `MapGet` 定義： 
* 指定要是 HTTP Get
* URL 第一層必需是 **user**。  
* URL 第二層必需要有值，放到路由變數 *name* 中。 

第三個路由 `MapPost` 定義： 
* 指定要是 HTTP Post
* URL 第一層必需是 **user**。  
* URL 第二層必需要有值，放到路由變數 *name* 中。 

以上設定的路由結果如下：  
* `http://localhost:5000/default` 會顯示：  
 Route values: [first, default]  
* `http://localhost:5000/home/about` 會顯示：  
 Route values: [first, home], [second, about]  
* `http://localhost:5000/user/john` 透過 HTTP Get 會顯示：  
 Get user. name: john
* `http://localhost:5000/user/john` 透過 HTTP Post 會顯示：  
 Create user. name: john

## MVC 路由

MVC 路由使用跟上面範例差不多，只是把事件指向 `Controller` 及 `Action`。  
ASP.NET Core MVC 註冊路由規則的方式跟 ASP.NET MVC 差不多。  
可以註冊多個 MapRoute，每個 Request 會經過這些 RouterMiddleware 找到對應 Action。  
先被執行到的路由，後面就會被跳過，所以越廣域的寫越下面。  
如下：
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc();
    }
    public void Configure(IApplicationBuilder app)
    {
        app.UseMvc(routes =>
        {
            routes.MapRoute(
                name: "about",
                template: "about",
                defaults: new { controller = "Home", action = "About" }
            );
            routes.MapRoute(
                name: "default",
                template: "{controller=Home}/{action=Index}/{id?}"
            );
            // 跟上面設定的 default 效果一樣
            //routes.MapRoute(
            //    name: "default",
            //    template: "{controller}/{action}/{id?}",
            //    defaults: new { controller = "Home", action = "Index" }
            //);
        });
    }
}
```
以上設定的路由結果如下：  
* `http://localhost:5000` 會對應到 HomeController 的 Index()。
* `http://localhost:5000/about` 會對應到 HomeController 的 About()。
* `http://localhost:5000/home/test` 會對應到 HomeController 的 Test()。

## RouteAttribute

預設 RouteAttribute 的優先順序高於 Startup 註冊的 MapRoute，所以當使用 `[Route]` 後，原本的 MapRoute 將不再對 Controller 或 Action 產生作用。  

```cs
[Route("[controller]")]
public class UserController : Controller
{
    [Route("")]
    public IActionResult Profile()
    {
        return View();
    }

    [Route("change-password")]
    public IActionResult ChangePassword()
    {
        return View();
    }

    [Route("[action]")]
    public IActionResult Other()
    {
        return View();
    }
}
```

以上設定的路由結果如下：  
* `http://localhost:5000/user` 會對應到 UserController 的 Profile()。  
* `http://localhost:5000/user/change-password` 會對應到 UserController 的 ChangePassword()。  
* `http://localhost:5000/user/other` 會對應到 UserController 的 Other()。  

> 若 Controller 設定了 `[Route]`，Action 就要跟著加 `[Route]`，不然會發生錯誤。  

如果只有特定的 Action 需要改路由，也可以只加 Action。如下：
```cs
public class UserController : Controller
{
    public IActionResult Profile()
    {
        return View();
    }

    [Route("change-password")]
    public IActionResult ChangePassword()
    {
        return View();
    }

    public IActionResult Other()
    {
        return View();
    }
}
```
* `http://localhost:5000/profile/profile` 會對應到 UserController 的 Profile()。  
* `http://localhost:5000/change-password` 會對應到 UserController 的 ChangePassword()。  
* `http://localhost:5000/user/other` 會對應到 UserController 的 Other()。  

> 注意！如果 `[Route]` 是設定在 Action，路徑是由網站根路徑開始算。  

## 參考

[Routing in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing)  