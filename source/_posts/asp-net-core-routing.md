---
title: ASP.NET Core 教學 - Routing
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Routing
  - RouterMiddleware
categories:
  - ASP.NET Core
date: 2017-05-15 11:06:00
featured_image: /images/pasted-115.png
---
![ASP.NET Core 教學 - Routing - 運作方式](/images/pasted-115.png)

本篇將介紹 ASP.NET Core 的 Routing，大致上跟 ASP.NET MVC Routing 的設定差不多，但有些小差異。

<!-- more -->

## 1. Startup

在 Startup 註冊路由規則，這邊設定方式跟 ASP.NET MVC 差不多。  
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
* `http://localhost:33333` 會對應到 HomeController 的 Index()。  
* `http://localhost:33333/about` 會對應到 HomeController 的 About()。  
* `http://localhost:33333/home/test` 會對應到 HomeController 的 Test()。  

## 2. RouteAttribute

## 2.1. Default Pattern

透過 RouteAttribute 綁定 Controller 的路由。  
使用 RouteAttribute 後，Startup 註冊的 MapRoute 就不會對這個 Controller 產生作用。
```cs
[Route("[controller]")]
public class AccountController : Controller
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
    public IActionResult Sample()
    {
        return View();
    }
}
```
以上設定的路由結果如下：
* `http://localhost:33333/account` 會對應到 AccountController 的 Profile()。  
* `http://localhost:33333/account/change-password` 會對應到 AccountController 的 ChangePassword()。  
* `http://localhost:33333/account/sample` 會對應到 AccountController 的 Sample()。  

> 若 Controller 設定了 RouteAttribute，Action 就要跟著加，不然會發生錯誤。  

如果只加 Action 如：
```cs
public class AccountController : Controller
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

    public IActionResult Sample()
    {
        return View();
    }
}
```
以上設定的路由結果如下：
* `http://localhost:33333/account/profile` 會對應到 AccountController 的 Profile()。  
* `http://localhost:33333/change-password` 會對應到 AccountController 的 ChangePassword()。  
* `http://localhost:33333/account/sample` 會對應到 AccountController 的 Sample()。  

## 2.2. RESTful Pattern

若要符合 RESTful 原則路由，設定方式如下：
```cs
[Route("api/[controller]")]
public class ContactsController : Controller
{
    private static List<ContactModel> _contacts;

    [HttpGet]
    public List<ContactModel> Get()
    {
        // Logic
        return _contacts;
    }

    [HttpGet("{id}")]
    public ContactModel Get(int id)
    {
        // Logic
        return _contacts.SingleOrDefault(c => c.Id == id); ;
    }

    [HttpPost]
    public int Post([FromBody]ContactModel contact)
    {
        // Logic
        return contact.Id;
    }

    [HttpPut("{id}")]
    public void Put(int id, [FromBody]ContactModel contact)
    {
        // Logic
    }

    [HttpDelete("{id}")]
    public void Delete(int id)
    {
        // Logic
    }
}
```
> 目前 ASP.NET Core 還沒有像 ASP.NET MVC 的 MapHttpAttributeRoutes 可以綁 Http Method 的全域路由，都要在 Action 加上 HttpMethodAttribute。  

## 參考

[Routing in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing)