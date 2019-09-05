---
title: ASP.NET Core 教學 - 取得網站根目錄
author: John Wu
tags:
  - ASP.NET Core
  - ASP.NET
categories:
  - ASP.NET Core
date: 2017-09-03 09:54:00
featured_image: /images/a/320.png
---
![ASP.NET Core 教學 - 取得網站根目錄 - 範例執行結果](/images/a/320.png)

過去在 ASP.NET 中要取得網站根目錄，可以透過 `Server.MapPath()`，但 ASP.NET Core 大量拋棄靜態方法降低依賴，所以沒有 `Server.MapPath()` 方法可用了。  
本篇將介紹如何在 ASP.NET Core 取得網站根目錄。  

<!-- more -->

## ASP.NET

在 ASP.NET 中取得網站根目錄範例如下：  
```cs
public class HomeController : Controller
{
    public ActionResult Index()
    {
        var webRootPath = Server.MapPath("~/");
        return Content(webRootPath);
    }
}
```

## ASP.NET Core

在 ASP.NET Core 要取得網站根目錄的話，需要注入 `IHostingEnvironment`，範例如下：
```cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        public HomeController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        public ActionResult Index()
        {
            return Content($"WebRootPath = {_hostingEnvironment.WebRootPath}\n" +
                           $"ContentRootPath = {_hostingEnvironment.ContentRootPath}");
        }
    }
}
```

## ASP.NET Core - View

如果是要在 `*.cshtml` 使用的話，範例如下：
```html
@using Microsoft.AspNetCore.Hosting

@inject IHostingEnvironment hostingEnvironment

WebRootPath = @hostingEnvironment.WebRootPath <br />
ContentRootPath = @hostingEnvironment.ContentRootPath 
```

## 執行結果

![ASP.NET Core 教學 - 取得網站根目錄 - 範例執行結果](/images/a/320.png)