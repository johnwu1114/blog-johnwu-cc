---
title: ASP.NET Core 教學 - 多國語言
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Localization
  - Routing
  - Middleware
categories:
  - ASP.NET Core
date: 2017-06-17 21:03:00
---
![ASP.NET Core 教學 - 多國語言 - 運作方式](/images/pasted-202.png)

全球化的網站不免都要做多國語言，ASP.NET Core 的多國語言設定方式跟 ASP.NET MVC 有很大的落差。  
本篇將介紹 ASP.NET Core 多國語言設定方式。  

<!-- more -->

## 1. 安裝 NuGet 套件

要在 ASP.NET Core 使用多國語言，需要安裝 `Microsoft.AspNetCore.Localization` 套件。  
在此範例中我還需要從 Routing 抓取語系的資訊，所以要再安裝 `Microsoft.AspNetCore.Localization.Routing` 套件。  
> `Microsoft.AspNetCore.Localization.Routing` 也可以自己實作。  

## 2. 建立多國語言檔

在網站目錄中建立 Resources 的資料夾，在裡面新增資源檔 `*.resx`。如下：
![ASP.NET Core 教學 - 多國語言 - 新增資源檔 1](/images/pasted-200.png)
![ASP.NET Core 教學 - 多國語言 - 新增資源檔 2](/images/pasted-201.png)

ASP.NET Core 語系檔命名規則**必須**要與 Controllers / Views / Models 相互對應。如下：
1. Resources\Controllers\HomeController.en-GB.resx  
或 Resources\Controllers.HomeController.en-GB.resx  
2. Resources\Controllers\HomeController.zh-TW.resx  
或 Resources\Controllers.HomeController.zh-TW.resx   
3. Resources\Views\Home\Index.en-GB.resx  
或 Resources\Views.Home.Index.en-GB.resx   
4. Resources\Views\Home\Index.zh-TW.resx  
或 Resources\Views.Home.Index.zh-TW.resx   

多國語言檔建立規則跟 ASP.NET MVC 有很大的差別。  
1. `*.resx` 檔案**必須**對應使用的路徑位置。  
2. `*.resx` 檔案**必須**要帶語系在後綴。如：`*.en-GB.resx`。  

## 3. Startup

在 Startup 註冊多國語言需要服務，以及修改多國語的 Routing 方式。如下：
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLocalization(options => options.ResourcesPath = "Resources");
            services.AddMvc()
                    .AddViewLocalization()
                    .AddDataAnnotationsLocalization();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{culture=en-GB}/{controller=Home}/{action=Index}/{id?}"
                );
            });
        }
    }
}
```
* `AddLocalization` 是主要的多國語言服務，ResourcesPath 是指定*資源檔*的目錄位置。  
* `AddViewLocalization` 是為了在 cshtml 中使用多國語言，如果沒有需要在 cshtml 中使用多國語言，可以不需要註冊它。  
* `AddDataAnnotationsLocalization` 是為了在 Model 中使用多國語言，如果沒有需要可以不需要註冊它。  
* `MapRoute` 我在 Routing 中增加 culture 語系資訊，用來判斷多國語言。  
如果不想用 Routing 的方式，也可以改用 QueryString 帶入語系資訊。  

## 4. Middleware

建立一個 CultureMiddleware 來包裝 Localization 的 Middleware，因為我要順便做支援語言的管理。   

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Localization.Routing;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace MyWebsite.Middlewares
{
    public class CultureMiddleware
    {
        private static readonly List<CultureInfo> _supportedCultures = new List<CultureInfo>
        {
            new CultureInfo("en-GB"),
            new CultureInfo("zh-TW")
        };

        private static readonly RequestLocalizationOptions _localizationOptions = new RequestLocalizationOptions()
        {
            DefaultRequestCulture = new RequestCulture(_supportedCultures.First()),
            SupportedCultures = _supportedCultures,
            SupportedUICultures = _supportedCultures,
            RequestCultureProviders = new[]
            {
                new RouteDataRequestCultureProvider() { Options = _localizationOptions }
            }
        };

        public void Configure(IApplicationBuilder app)
        {
            app.UseRequestLocalization(_localizationOptions);
        }
    }
}
```
每個 Requset 都會執行 RequestCultureProviders 中的 CultureProvider，用來判斷語系資訊，套用正確的資源檔。  
`Microsoft.AspNetCore.Localization` 套件支援的 CultureProvider 有三種：  
* `QueryStringRequestCultureProvider` 從 QueryString 判斷語系資訊。  
* `CookieRequestCultureProvider` 從 Cookie 判斷語系資訊。  
* `AcceptLanguageHeaderRequestCultureProvider` 從 HTTP Header 判斷語系資訊。  

而我是用 Routing 判斷語系資訊，以上三種都不合我用，所以才需要另外安裝 `Microsoft.AspNetCore.Localization.Routing`，使用 RouteDataRequestCultureProvider。  

把 CultureMiddleware 註冊在需要用到的 Controller 或 Action。如下：
```cs
[MiddlewareFilter(typeof(CultureMiddleware))]
public class HomeController : Controller
{
    // ...
}
```
> 通常 ASP.NET 網站會伴隨著 API，API 不需要語系資訊，所以不建議註冊在全域。  

## 5. 使用多國語言

### 5.1. Controller

在 Controller 要使用多國語言的話，需要在建構子加入 IStringLocalizer 參數，執行期間會把 Localizer 的實體注入近來。  
把 Resource Key 丟入 Localizer，就可以得到值。

```cs
// ***
[MiddlewareFilter(typeof(CultureMiddleware))]
public class HomeController : Controller
{
    private readonly IStringLocalizer _localizer;

    public HomeController(IStringLocalizer<HomeController> localizer)
    {
        _localizer = localizer;
    }

    public IActionResult Content()
    {
        return Content($"CurrentCulture: {CultureInfo.CurrentCulture.Name}\r\n"
                     + $"CurrentUICulture: {CultureInfo.CurrentUICulture.Name}\r\n"
                     + $"{_localizer["Hello"]}");
    }
}
```

### 5.2. View

要在 cshtml 使用多國語言的話，要先在 Setup 的 Services 中加入 ViewLocalization。  
注入 IViewLocalizer，把 Resource Key 丟入 Localizer，就可以得到值。  

```html
@using System.Globalization
@using Microsoft.AspNetCore.Mvc.Localization
@using MyWebsite.Models

@inject IViewLocalizer Localizer

CurrentCulture: @CultureInfo.CurrentCulture.Name <br />
CurrentUICulture: @CultureInfo.CurrentUICulture.Name <br />
@Localizer["Hello"]<br />
```

### 5.3. Model

要在 Model 使用多國語言的話，要先在 Setup 的 Services 中加入 DataAnnotationsLocalization。  

```cs
public class SampleModel
{
    [Display(Name = "Hello")]
    public string Content { get; set; }
}
```

```html
@using System.Globalization
@using MyWebsite.Models

@model SampleModel

CurrentCulture: @CultureInfo.CurrentCulture.Name <br />
CurrentUICulture: @CultureInfo.CurrentUICulture.Name <br />
@Html.DisplayNameFor(m => m.Content)<br />
```

## 執行結果

![ASP.NET Core 教學 - 多國語言 - 範例執行結果](/images/pasted-202.png)

## 程式碼下載

[asp-net-core-localization](https://github.com/johnwu1114/asp-net-core-localization)

## 參考

[ASP.NET Core Globalization and localization](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/localization)