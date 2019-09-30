---
title: '[鐵人賽 Day21] ASP.NET Core 2 系列 - 多國語言 (Localization)'
author: John Wu
tags:
  - ASP.NET Core
  - Localization
  - Routing
  - Middleware
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2018-01-09 12:00
updated: 2019-09-30 23:40
featured_image: /images/ironman/i21-1.png
---

全球化的網站不免都要做多國語言，ASP.NET Core 的多國語言設定方式跟 ASP.NET MVC 有很大的落差。  
本篇將介紹 ASP.NET Core 多國語言 (Localization) 的設定方式。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day21] ASP.NET Core 2 系列 - 多國語言 (Localization)](https://ithelp.ithome.com.tw/articles/10196463)  

<!-- more -->

## 建立多國語言檔

過去 ASP.NET 語系檔都是用 `*.resx` 格式，現在 ASP.NET Core 也是沿用此格式，但檔案結構確很不一樣。ASP.NET Core 語系檔命名規則**必須**要與類別的 `namespace` 階層相互對應。例如 Controllers、Views、Models 要用的語系檔跟類別對應如下：  
* *Controllers\HomeController.cs* 要用的 en-GB 語系檔名稱：  
  * *Resources\Controllers\HomeController.en-GB.resx*  
  * 或 *Resources\Controllers.HomeController.en-GB.resx*  
* *Controllers\HomeController.cs* 要用的 zh-TW 語系檔名稱：  
  * *Resources\Controllers\HomeController.zh-TW.resx*  
  * 或 *Resources\Controllers.HomeController.zh-TW.resx*   
* *Views\Home\Index.cshtml* 要用的 en-GB 語系檔名稱：  
  * *Resources\Views\Home\Index.en-GB.resx*  
  * 或 *Resources\Views.Home.Index.en-GB.resx*   
* *Views\Home\Index.cshtml* 要用的 zh-TW 語系檔名稱：  
  * *Resources\Views\Home\Index.zh-TW.resx*  
  * 或 *Resources\Views.Home.Index.zh-TW.resx*   

多國語言檔建立規則跟 ASP.NET MVC 有很大的差別。  
* `*.resx` 檔案**必須**對應使用的路徑位置。  
* `*.resx` 檔案的語系帶在**後綴**。如：`*.en-GB.resx`。  

`*.resx` 語系檔內容大致如下：  

*Resources\Controllers.HomeController.en-GB.resx*  
```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
  <data name="Hello">
    <value>Hello~ This message from Resources\Controllers.HomeController.en-GB.resx</value>
  </data>
</root>
```

若以 Visual Studio IDE 開發 (如 Visual Studio 2017)，可以從 UI 新增資源檔 `*.resx`。在網站目錄中建立 Resources 的資料夾，並新增資源檔 `*.resx`。如下：  

![[鐵人賽 Day21] ASP.NET Core 2 系列 - 多國語言 (Localization) - 新增資源檔 1](/images/a/200.png)  

![[鐵人賽 Day21] ASP.NET Core 2 系列 - 多國語言 (Localization) - 新增資源檔 2](/images/a/201.png)  

### 註冊服務  

ASP.NET Core 使用多國語言，需要 `Microsoft.AspNetCore.Localization` 套件。  
在此範例中我還需要從 Routing 抓取語系的資訊，所以也需要 `Microsoft.AspNetCore.Localization.Routing` 套件。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.AspNetCore.Localization
dotnet add package Microsoft.AspNetCore.Routing
```
> ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.Localization` 及 `Microsoft.AspNetCore.Routing`，所以不用再安裝。  

在 `Startup.ConfigureServices` 註冊多國語言需要的服務，以及修改多國語的 Routing 方式。如下：  

*Startup.cs*
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

* **AddLocalization**  
  主要的多國語言服務，ResourcesPath 是指定**資源檔的目錄位置**。  
* **AddViewLocalization**  
  為了在 cshtml 中使用多國語言，如果沒有需要在 View 中使用多國語言，可以不需要註冊它。  
* **AddDataAnnotationsLocalization**  
  為了在 Model 中使用多國語言，如果沒有需要在 Model 中使用多國語言，可以不需要註冊它。  
* **MapRoute**  
  在 Routing 中增加 culture 語系資訊，用來判斷多國語言。  
  > 如果不想用 Routing 的方式，也可以改用 QueryString 帶入語系資訊。  

### Middleware

建立一個 CultureMiddleware 來包裝 Localization 的 Middleware，可以做支援語言的管理。   

*Middlewares\CultureMiddleware.cs*  
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
每個 Requset 都會執行 `RequestCultureProviders` 中的 `CultureProvider`，用來判斷語系資訊，套用正確的資源檔。  
`Microsoft.AspNetCore.Localization` 套件支援的 CultureProvider 有三種：  
* **QueryStringRequestCultureProvider**  
  從 QueryString 判斷語系資訊。如：`http://localhost:500/?culture=zh-TW`  
* **CookieRequestCultureProvider**  
  從 Cookie 判斷語系資訊。  
* **AcceptLanguageHeaderRequestCultureProvider**  
  從 HTTP Header 判斷語系資訊。  

而我是用 Routing 判斷語系資訊，以上三種都不合我用。  
Routing 判斷語系可以用 `Microsoft.AspNetCore.Localization.Routing` 套件的 `RouteDataRequestCultureProvider`。  

把 CultureMiddleware 註冊在需要用到的 Controller 或 Action。如下：  

*Controllers\HomeController.cs*  
```cs
[MiddlewareFilter(typeof(CultureMiddleware))]
public class HomeController : Controller
{
    // ...
}
```
> 通常 ASP.NET Core 網站會伴隨著 API，API 不需要語系資訊，所以不建議註冊在全域。  

## 套用多國語言

### Controller

在 Controller 要使用多國語言的話，需要在建構子加入 `IStringLocalizer` 參數，執行期間會把 _localizer 的實體注入近來。  
把 Resource Key 丟入 _localizer，就可以得到該語系的值。

*Controllers\HomeController.cs*  
```cs
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using MyWebsite.Middlewares;

namespace MyWebsite
{
    [MiddlewareFilter(typeof(CultureMiddleware))]
    public class HomeController : Controller
    {
        private readonly IStringLocalizer _localizer;

        public HomeController(IStringLocalizer<HomeController> localizer)
        {
            _localizer = localizer;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Content()
        {
            return Content($"CurrentCulture: {CultureInfo.CurrentCulture.Name}\r\n"
                         + $"CurrentUICulture: {CultureInfo.CurrentUICulture.Name}\r\n"
                         + $"{_localizer["Hello"]}");
        }
    }
}
```

### View

要在 cshtml 使用多國語言的話，要先在 Services 中加入 `ViewLocalization`。  
注入 `IViewLocalizer`，同上把 Resource Key 丟入 Localizer，就可以得到值。  

*Views\Home\Index.cshtml*
```html
@using System.Globalization
@using Microsoft.AspNetCore.Mvc.Localization

@inject IViewLocalizer localizer

CurrentCulture: @CultureInfo.CurrentCulture.Name <br />
CurrentUICulture: @CultureInfo.CurrentUICulture.Name <br />
@localizer["Hello"]<br />
```

### Model

要在 Model 使用多國語言的話，要先在 Services 中加入 `DataAnnotationsLocalization`。  

*Models\SampleModel.cs*
```cs
using System.ComponentModel.DataAnnotations;

namespace MyWebsite.Models
{
    public class SampleModel
    {
        [Display(Name = "Hello")]
        public string Content { get; set; }
    }
}
```

*Controllers\HomeController.cs*  
```cs
// ...
[MiddlewareFilter(typeof(CultureMiddleware))]
public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View(model: new SampleModel());
    }
}
```

*Views\Home\Index.cshtml*
```html
@using System.Globalization
@using MyWebsite.Models

@model SampleModel

CurrentCulture: @CultureInfo.CurrentCulture.Name <br />
CurrentUICulture: @CultureInfo.CurrentUICulture.Name <br />
@Html.DisplayNameFor(m => m.Content)<br />
```

### 執行結果

![[鐵人賽 Day21] ASP.NET Core 2 系列 - 多國語言 (Localization) - 範例執行結果](/images/ironman/i21-1.png)  

## 共用語系檔

ASP.NET Core 語系檔命名規則為了與 Controllers、Views、Models 相互對應，可能會產生一大堆檔案，造成維護上的困擾。
因此，可以利用 ASP.NET Core DI 的特性，建立一個共用的語系檔，再將該語系資訊注入至 DI 容器。

建立共用的語系檔 *Resources\SharedResource.en-GB.resx*，同時建立一個對應的 *SharedResource.cs* 檔案，內容如下：  

*Resources\SharedResource.en-GB.resx*
```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
  <data name="Hello">
    <value>Hello~ This message from Resources\SharedResource.en-GB.resx</value>
  </data>
</root>
```

*SharedResource.cs*
```cs
using Microsoft.Extensions.Localization;

namespace MyWebsite
{
    public class SharedResource
    {
        private readonly IStringLocalizer _localizer;

        public SharedResource(IStringLocalizer<SharedResource> localizer)
        {
            _localizer = localizer;
        }
    }
}
```

### Controller

`IStringLocalizer` 注入的型別改成 SharedResource，如下：  

*Controllers\HomeController.cs*  
```cs
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using MyWebsite.Middlewares;
using MyWebsite.Models;

namespace MyWebsite
{
    [MiddlewareFilter(typeof(CultureMiddleware))]
    public class HomeController : Controller
    {
        private readonly IStringLocalizer _localizer;
        private readonly IStringLocalizer _sharedLocalizer;

        public HomeController(IStringLocalizer<HomeController> localizer,
            IStringLocalizer<SharedResource> sharedLocalizer)
        {
            _localizer = localizer;
            _sharedLocalizer = sharedLocalizer;
        }

        public IActionResult Index()
        {
            return View(model: new SampleModel());
        }

        public string Content()
        {
            return $"CurrentCulture: {CultureInfo.CurrentCulture.Name}\r\n"
                 + $"CurrentUICulture: {CultureInfo.CurrentUICulture.Name}\r\n"
                 + $"{_localizer["Hello"]}\r\n"
                 + $"{_sharedLocalizer["Hello"]}";
        }
    }
}
```

### View

注入 `IViewLocalizer` 改成注入 `IHtmlLocalizer`，並指派型別，如下：  

*Views\Home\Index.cshtml*
```cs
@using System.Globalization
@using Microsoft.AspNetCore.Mvc.Localization
@using MyWebsite.Models

@model SampleModel

@inject IViewLocalizer localizer
@inject IHtmlLocalizer<MyWebsite.SharedResource> sharedLocalizer

CurrentCulture: @CultureInfo.CurrentCulture.Name <br />
CurrentUICulture: @CultureInfo.CurrentUICulture.Name <br />
@localizer["Hello"]<br />
@Html.DisplayNameFor(m => m.Content)<br />
@sharedLocalizer["Hello"]<br />
```

### Model (2019/09/30 補充)

有網友問到在 Model 使用共用語系檔不會生效，所以補充一下。  

在註冊 `AddDataAnnotationsLocalization` 時，要一併宣告 DataAnnotation 所使用的 LocalizerProvider，如下：  

*Startup.cs*
```cs
namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // ...
            services.AddDataAnnotationsLocalization(options => {
                options.DataAnnotationLocalizerProvider = (type, factory) =>
                factory.Create(typeof(SharedResource));
            });
        }
    }
}
```

### 執行結果

![[鐵人賽 Day21] ASP.NET Core 2 系列 - 多國語言 (Localization) - 共用語系檔範例執行結果](/images/ironman/i21-2.png)  

## 參考

[ASP.NET Core Globalization and localization](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/localization)  