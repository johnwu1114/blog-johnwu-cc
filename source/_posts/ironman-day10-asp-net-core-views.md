---
title: '[鐵人賽 Day10] ASP.NET Core 2 系列 - Views'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - MVC
  - Razor
categories:
  - ASP.NET Core
date: 2017-12-29 12:00
featured_image: /images/i10-1.png
---

ASP.NET Core MVC 中的 Views 是負責網頁顯示，將資料一併渲染至 UI 包含 HTML、CSS 等。並能透過 Razor 語法在 `*.cshtml` 撰寫渲染畫面的程式邏輯。  
本篇將介紹 ASP.NET Core MVC 的 Views。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day10] ASP.NET Core 2 系列 - Views](https://ithelp.ithome.com.tw/articles/10194523)  
 
<!-- more -->

之前 [[鐵人賽 Day06] ASP.NET Core 2 系列 - MVC](/article/ironman-day06-asp-net-core-mvc.html) 有稍微介紹到 Views 及 Controller 的對應關係，這邊就不重複說明。  

## Razor 語法

ASP.NET Core MVC 的 Views 預設是使用 Razor 引擎，Views 的副檔名是用 `*.cshtml`。  
檔案內容以 HTML 為主，但可以透過 `@` Razor 語法撰寫 C# 程式。  
可以假想一下 `*.cshmtl` 就是一般的 HTML，而 Razor 語法是 C# 程式跟靜態 HTML 溝同的媒介。  

`@` 就是 Razor 語法最重要的溝同媒介，在 C# 變數前面冠上 `@`，就可以將 C# 程式混合制 HTML 輸出。  
如果要在 HTML 顯示 `@` 符號的話，可以連用兩個 `@` 符號，就可以把 `@` 字元輸出，範例如下：

```html
<div>@@DateTime.Now @DateTime.Now</div>
<div>
    @@(DateTime.Now - TimeSpan.FromDays(7)) 
    @(DateTime.Now - TimeSpan.FromDays(7))
</div>
```

實際輸出的 HTML 結果：  
```html
<div>@DateTime.Now 2017/12/29 上午 01:23:45</div>
<div>
    @(DateTime.Now - TimeSpan.FromDays(7)) 
    2017/12/22 上午 01:23:45
</div>
```

### 控制結構 (Control Structures)

如果有需要也可以在 Views 撰寫 C# 程式，透過 `@{ }` 定義程式區塊，便可以在 Views 中寫 C# 程式，如下：  
```html
@{
    var date = DateTime.Now;
    date -= TimeSpan.FromDays(7);
}
<div>@date</div>
```

也可以在迴圈、判斷式或 C# 區塊的關鍵字前加上 `@` 宣告程式區塊，如：`@if`、`@switch`、`@for`、`@foreach`、`@while`、`@do{ }while()`、`@try`、`@using`、`@lock`。  
範例如下：  
```html
@{
    bool flag = true;
    int number = 3;
}

@if(flag)
{
  <div>flag is true</div>
} 
else
{
  <div>flag is false</div>
}

@switch(number)
{
    case 3:
        <div>number is lucky 3!!!!</div>
        break;
    default:
        <div>number is @number</div>
        break;
}

@for(var i = 0; i < number; i++)
{
    <div>For sample: @i</div>
}

@try
{
    throw new Exception("something wrong");
}
catch(Exception ex)
{
    <div>@ex.Message</div>
}
```

輸出畫面：  
![[鐵人賽 Day10] ASP.NET Core 2 系列 - Views - Razor 語法](/images/i10-1.png)  

### 指令 (Directives)

Razor Views 會被 Razor 引擎動態轉換成 Class，所以也有些類似 C# Class 的方法可以使用。  
* `@using`  
 同 C# Class 的 `using`，載入不同 namespaces，簡化使用時的名稱。例：  
 ```html
@using System.IO
@{
    var dir = Directory.GetCurrentDirectory();
}
<p>@dir</p>
 ```
* `@model`  
 用來綁定 Controller 傳來的 Model 型別，並填入 `Model` 屬性中，在 Views 中就可以透過 `Model` 取得 Controller 傳來的 Model。例：  
 ```html
@using MyWebsite.Models
@model UserModel
Hello~ 我是 @Model.Name
 ```
* `@inherits`  
 讓 Razor View 繼承其他自訂的 RazorPage 類別。例：  
 *CustomRazorPage.cs*
 ```cs
using Microsoft.AspNetCore.Mvc.Razor;

public abstract class CustomRazorPage<TModel> : RazorPage<TModel>
{
    public string CustomText { get; } = "CustomRazorPage.CustomText";
}
 ```
 *Sample.cshtml*
 ```html
@inherits CustomRazorPage<TModel>
<div>Custom text: @CustomText</div>
 ```
* `@inject`  
 將 DI 容器的 Service 注入至 Razor View 使用。  
 *(DI 可以參考這篇：[[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入 (Dependency Injection)](/article/ironman-day04-asp-net-core-dependency-injection.html))*  
* `@functions`  
 在 Razor View 定義方法。例：  
 ```html
@functions {
    public string GetHello()
    {
        return "Hello";
    }
}
<div>From method: @GetHello()</div> 
 ```
* `@section`  
 配合 Layout 排版使用，下面會介紹。  

## Layout

通常同網站的頁面都有類似的風格，可能只有部分的內容會不一樣，這種清況很適合用 Layout。  
以下圖為例，網站的每頁都會有 **Header** 及 **Footer** 而且都長的一樣，就只有 **Content** 會不同。  

![[鐵人賽 Day10] ASP.NET Core 2 系列 - Views - Layout](/images/i10-2.png)

通常 Layout 都會放在 *Views\Shared* 資料夾，建立一個 *_Layout.cshtml*：  

*Views\Shared\\_Layout.cshtml*
```html
<!DOCTYPE html>
<html>
<head>
    <title>@ViewBag.Title</title>
    @RenderSection("styles", required: false)
</head>
<body>
    <header>
        Layout Header
    </header>
    <div>
        <h1>@ViewBag.Title</h1>
        @RenderBody()
    </div>
    <footer>
        Layout footer
    </footer>
    @RenderSection("scripts", required: false)
</body>
</html>
```

在要套用 Layout 的 Views，指派要套用的 Layout 名稱，如下：  

*Views\Home\Index.cshtml*
```html
@using MyWebsite.Models
@model UserModel
@{
    Layout = "_Layout";
    ViewBag.Title = "Sample";
}

<div>Hello~ 我是 @Model.Name</div>

@section styles {
  <link rel="stylesheet" type="text/css" href="/css/theme.css">
}
@section scripts {
  <script type="text/javascript" src="/js/jquery.js"></script>
}
```
* **Layout**  
 Layout 是指定要套用 Layout 的名稱，預設會在資料夾 *Views\Shared* 尋找 `{Layout 名稱}.cshtml`。  
 也可以指定完整路徑，如：`Layout = "/Views/Shared/_Layout.cshtml"`。
* **ViewBag**  
 ViewBag 是 Dynamic 類型的物件，可以在同一個 Request 中，跨 Controller 及 Views 存取資料。  
* **@section**  
 在使用 Layout 時，並不一定會將 Razor View 全部填入至 `RenderBody`，可能會有需求將某些內容填入至 Layout 的其他地方。如：`*.css` 的引用填入至 `<head></head>` 中；`*.js` 的引用填入至 `</body>` 之前。  

當打開 `http://localhost:5000/home/index` 時，Razor 引擎會將 *Index.cshtml* 的結果都填入 *Views\Shared\\_Layout.cshtml* 的 `@RenderBody()`。  
實際輸出的 HTML 結果：  
```html
<!DOCTYPE html>
<html>
<head>
    <title>Sample</title>
    <link rel="stylesheet" type="text/css" href="/css/theme.css">
</head>
<body>
    <header>
        Layout Header
    </header>
    <div>
        <h1>Sample</h1>
        <div>Hello~ 我是 John</div>
    </div>
    <footer>
        Layout footer
    </footer>
    <script type="text/javascript" src="/js/jquery.js"></script>
</body>
</html>
```

### _ViewImports

上例 *Views\Home\Index.cshtml* 有用到 `@using MyWebsite.Models`，實務上可能每個 Razor View 都會用到 `@using MyWebsite.Models`，如果每個 `*.cshtml` 都加上這行就會顯得有點笨拙。  
可以透過 *_ViewImports.cshtml* 把通用性的 `@using` 都加到這邊，如此一來就可以套用到全部的 Razor View，如：  

*Views\\_ViewImports.cshtml*
```html
@using System.IO
@using System.Collections.Generic
@using MyWebsite
@using MyWebsite.Models
```

如此一來就能將 *Views\Home\Index.cshtml* 第一行的 `@using MyWebsite.Models` 移除。  

### _ViewStart

指定 Layout 也會有套用全部 Razor View 的需求，可以透過 *_ViewStart.cshtml*，在 Razor View 的第一個渲染事件指派預設 Layout，如：

*Views\\_ViewStart.cshtml*
```html
@{
    Layout = "_Layout";
}
```

## Partial Views

有些重複性很高的畫面，如果散落在各個 Razor View，在維護上就會比較麻煩。  
可以透過 Partial Views 把重複的內容變成組件，再重複使用。範例如下：  

*Controllers\HomeController.cs*
```cs
// ...
public class HomeController : Controller
{
    public IActionResult Index(int id)
    {
        return View(new List<UserModel>()
        {
            new UserModel()
            {
                Id = 1,
                Name = "John",
                Email = "john@xxx.xxx",
            },
            new UserModel()
            {
                Id = 2,
                Name = "Blackie",
                Email = "blackie@xxx.xxx"
            },
            new UserModel()
            {
                Id = 3,
                Name = "Claire",
                Email = "claire@xxx.xxx"
            }
        });
    }
}
```

*Views\Home\\_UserInfo.cshtml*
```html
@model UserModel
<div>
    <label>Id：</label>@Model.Id <br />
    <label>Name：</label>@Model.Name <br />
    <label>Email：</label>@Model.Email <br />
</div>
```

*Views\Home\Index.cshtml*
```html
@model List<UserModel>
@{
    ViewBag.Title = "User List";
}

@foreach(var user in Model)
{
    @Html.Partial("_UserInfo", user)
    <hr />
}
```

實際輸出的 HTML 結果：  
```html
<!DOCTYPE html>
<html>
<head>
    <title>User List</title>
</head>
<body>
    <header>
        Layout Header
    </header>
    <div>
        <h1>User List</h1>
        <div>
            <label>Id：</label>1 <br />
            <label>Name：</label>John <br />
            <label>Email：</label>john@xxx.xxx <br />
        </div>
        <hr />
        <div>
            <label>Id：</label>2 <br />
            <label>Name：</label>Blackie <br />
            <label>Email：</label>blackie@xxx.xxx <br />
        </div>
        <hr />
        <div>
            <label>Id：</label>3 <br />
            <label>Name：</label>Claire <br />
            <label>Email：</label>claire@xxx.xxx <br />
        </div>
        <hr />
    </div>
    <footer>
        Layout footer
    </footer>
</body>
</html>
```

## 後記

Views 的渲染過程都還是在 Server 端，所以可以透過 Razor 撰寫 C# 程式。  
Razor 引擎最終會將渲染的結果以 HTML 的方式回傳給 Client。  
回顧 Day06 資料流動畫：  

![[鐵人賽 Day06] ASP.NET Core 2 系列 - MVC - 資料流](/images/i06-3.gif)  

要注意的是，Razor 的渲染是耗用 Server 的 CPU 資源，如果有多筆數的資料透過迴圈產生 HTML，也會變成網路傳輸的負擔。如果要注重效能，建議用 Single Page Application(SPA) 的方式取代 Razor。  

## 參考

[Views in ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/views/overview)  
[Razor syntax for ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/mvc/views/razor)  
[Partial Views](https://docs.microsoft.com/en-us/aspnet/core/mvc/views/partial)  