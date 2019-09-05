---
title: '[鐵人賽 Day06] ASP.NET Core 2 系列 - MVC'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - MVC
categories:
  - ASP.NET Core
date: 2017-12-25 12:00
featured_image: /images/ironman/i06-3.png
---

ASP.NET Core MVC 跟 ASP.NET MVC 觀念是一致的，使用上也沒有什麼太大的變化。  
過往 ASP.NET MVC 把 MVC 及 Web API 的套件分開，但在 ASP.NET Core 中 MVC 及 Web API 用的套件是相同的。  
本篇將介紹 ASP.NET Core MVC 設定方式。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day06] ASP.NET Core 2 系列 - MVC](https://ithelp.ithome.com.tw/articles/10193590)  
 
<!-- more -->

## MVC 簡介

ASP.NET Core 的 MVC(Model-View-Controller) 架構模式延續 ASP.NET MVC，把網站分成三大元件 **Model**、**View**及**Controller**，相依關係如下圖：  

![[鐵人賽 Day06] ASP.NET Core 2 系列 - MVC - 相依關係](/images/ironman/i06-2.png)  

* **Model**  
 負責資料處理，包含資料存取、商業邏輯、定義資料物件及驗證資料。  
* **View**  
 負責 UI 顯示，如 HTML、CSS 等介面設計配置。  
* **Controller**  
 負責將使用者 Requset 找到相對應的 Model 及 View，做為控制流程的角色。  

> 在 ASP.NET Core 中使用 MVC 或 Web API，需要 `Microsoft.AspNetCore.Mvc` 套件。  
 ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.Mvc`，所以不用再安裝。  
 如果是 ASP.NET Core 1.0 的版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
 ```sh
dotnet add package Microsoft.AspNetCore.Mvc
 ```

## 註冊 MVC 服務

安裝完成後，在 *Startup.cs* 的 `ConfigureServices` 加入 MVC 的服務，並在 `Configure` 對 `IApplicationBuilder` 使用 `UseMvcWithDefaultRoute` 方法註冊 MVC 預設路由的 Middleware。如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc();
    }

    public void Configure(IApplicationBuilder app)
    {
        app.UseMvcWithDefaultRoute();
    }
}
```
* **UseMvcWithDefaultRoute**  
 這個是 ASP.NET Core 的預設路由，會將 Request 來的 URL 找到對應的 Controller 及 Action。  
 *(路由可以參考這篇：[[鐵人賽 Day07] ASP.NET Core 2 系列 - 路由 (Routing)](/article/ironman-day07-asp-net-core-routing.html))*  

## MVC 範例

### Model 

建立一個簡單的 Model 用於 Controller 跟 View 互動。  

*Models\UserModel.cs*
```cs
public class UserModel
{
    public string Name { get; set; } = "John Wu";
}
```

### Controller

在專案目錄下建立一個 Controllers 資料夾，把 Controller 都放這個目錄。  
過去 ASP.NET 把 MVC 及 Web API 用的 Controller 分為 `Controller` 及 `ApiController`，現在 ASP.NET Core 把兩者合一，不再區分 `ApiController`。  
所以要建立一個類別，名稱後綴 **Controller** 即可，如下：  

*Controllers\HomeController.cs*
```cs
public class HomeController
{
    public string Index()
    {
        return "This is HomeController.Index()";
    }
}
```

但要讓 Controller 跟 View 互動，還是需要繼承 `Controller` 比較方便，如下：  

*Controllers\HomeController.cs*
```cs
public class HomeController : Controller
{
    public IActionResult Index()
    {
        var user = new UserModel();
        return View(model: user);
    }
}
```

`IActionResult` 回傳的方式可以有很多種，透過繼承 `Controller` 後，就可以使用 `Controller` 的方法：  
* **View**  
 以上例來說，透過回傳 `View` 方法，可以找到該 Controller & Action 對應的 `*.cshtml`， 並且把 UserModel 傳給 View 使用。  
* **HTTP Status Code**  
 回應包含 HTTP Status。常用的回應有 `Ok`、`BadRequest`、`NotFound` 等。  
 例如：`return BadRequest("Internal Server Error")`，會回應 HTTP Status 400 及 **Internal Server Error** 字串。   
* **Redirect**  
 可以把 Request 轉給其他的 Action 或 URL。轉向的方法有 `Redirect`、`LocalRedirect`、`RedirectToAction`、`RedirectToRoute` 等。  
 例如：`return RedirectToAction("Login", "Authentication")`，就會把 Request 轉向到 **AuthenticationController** 的 **Login()**。    
* **Formatted Response**  
 回應時指定 **Content-Type**。Web API 的回傳通常都用這種方式，序列化物件順便標註 **Content-Type**。  
 例如：`return Json(user)`，會將物件序列化成 JSON 字串，並在 HTTP Headers 帶上 **Content-Type=application/json**。  

### View

View 跟 Controller 有相互的對應關係，預設在 Controller 使用 `View` 方法回傳結果，會從以下目錄尋找對應的 `*.cshtml`：  
1. *Views\\{ControllerName}\\{ActionName}.cshtml*  
 尋找與 Controller 同名的子目錄，再找到與 Action 同名的 `*.cshtml`。  
 如上例 `HomeController.Index()`，就會找專案目錄下的 `Views\Home\Index.cshtml` 檔案。  
2. *Views\Shared\\{ActionName}.cshtml*  
 如果 Controller 同名的子目錄，找不到 Action 同名的 `*.cshtml`。就會到 Shared 目錄找。
 如上例 `HomeController.Index()`，就會找專案目錄下的 `Views\Shared\Index.cshtml` 檔案。  

*Views\Home\Index.cshtml*
```html
@model MyWebsite.Models.UserModel

Hello~ 我是 @Model.Name
```

在 `*.cshtml` 用 `@model` 綁定 Model 的型別，才可以使用 `@Model` 取得 Controller 傳入的物件。  

### 範例結果

![[鐵人賽 Day06] ASP.NET Core 2 系列 - MVC - 範例結果](/images/ironman/i06-1.png)

資料流動畫如下：  

![[鐵人賽 Day06] ASP.NET Core 2 系列 - MVC - 資料流](/images/ironman/i06-3.gif)  

## 參考

[Overview of ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/overview)  
[ASP.NET Core - Setup MVC](https://www.tutorialspoint.com/asp.net_core/asp.net_core_setup_mvc.htm)  