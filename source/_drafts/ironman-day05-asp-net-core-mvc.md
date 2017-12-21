---
title: '[鐵人賽 Day05] ASP.NET Core 2 系列 - MVC'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - MVC
categories:
  - ASP.NET Core
date: 2017-12-24 23:17
featured_image: /images/i05-1.png
---

ASP.NET Core MVC 跟 ASP.NET MVC 觀念是一致的，使用上也沒有什麼太大的變化。  
過往 ASP.NET MVC 把 MVC 及 Web API 的套件分開，但在 ASP.NET Core 中 MVC 及 Web API 用的套件是相同的。  
本篇將介紹 ASP.NET Core MVC 設定方式。  

<!-- more -->

## MVC 簡介

ASP.NET Core 的 MVC(Model-View-Controller) 架構模式延續 ASP.NET MVC，把網站分成三大元件 **Model**、**View**及**Controller**，相依關係如下圖：  

![[鐵人賽 Day05] ASP.NET Core 2 系列 - MVC - 相依關係](/images/i05-2.png)  

* **Model**  
 負責資料處理，包含資料存取、商業邏輯、定義資料物件及驗證資料。  
* **View**  
 負責 UI 顯示，如 HTML、CSS 等介面設計配置。  
* **Controller**  
 負責將使用者 Requset 找到相對應的 Model 及 View，做為控制流程的角色。  

## 安裝套件

要在 ASP.NET Core 中使用 MVC 或 Web API，需要安裝 `Microsoft.AspNetCore.Mvc` 套件。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.AspNetCore.Mvc
```
> ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.Mvc`，所以不用再安裝。  

## 註冊 MVC 服務

安裝完成後，在 `Startup.cs` 的 `ConfigureServices` 加入 MVC 的服務，並在 `Configure` 註冊 `UseMvcWithDefaultRoute` Middleware。如下：
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
 *(之後的文章會介紹路由)*  

## MVC 範例

### Model 

建立一個簡單的 Model 讓 Controller 跟 View 互動。  

*Models/UserModel.cs*
```cs
public class UserModel
{
    public string Name { get; set; } = "John Wu";
}
```

### Controller

在專案目錄下建立一個 Controllers 資料夾，把 Controller 都放這個目錄。  
過去 ASP.NET 把 MVC 及 Web API 用的 Controller 分為 `Controller` 及 `ApiController`，現在 ASP.NET Core 把兩者合一，不再區分 `ApiController`。  
所以要建立 Controller 都只要繼承 `Controller`即可。如下：

*Controllers/HomeController.cs*
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
* **View**  
 透過回傳 View 方法，可以找到該 Controller & Action 對應的 `*.cshtml`。  
 View 方法中可以帶入要傳到 View 的 Model。  

### View

View 跟 Controller 有相互的對應關係，預設 Controller 會到 Views 目錄尋找與 Controller 同名的子目錄，再找到與 Action 同名的 `*.cshtml`。  
如上面 HomeController.Index()，就會找專案目錄下的 `Views/Home/Index.cshtml` 檔案。  

*Views/Home/Index.cshtml*
```html
@model MyWebsite.Models.UserModel

Hello~ 我是 @Model.Name
```

在 `*.cshtml` 用 `@model` 綁定 Model 的型別，才可以使用 `@Model` 取得 Controller 傳入的物件。

### 範例結果

![[鐵人賽 Day05] ASP.NET Core 2 系列 - MVC - 範例結果](/images/i05-1.png)

資料流動畫如下：  

![[鐵人賽 Day05] ASP.NET Core 2 系列 - MVC - 資料流](/images/i05-3.gif)  

## 參考

[Overview of ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/overview)  
[ASP.NET Core - Setup MVC](https://www.tutorialspoint.com/asp.net_core/asp.net_core_setup_mvc.htm)  