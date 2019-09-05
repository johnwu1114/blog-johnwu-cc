---
title: '[鐵人賽 Day28] ASP.NET Core 2 系列 - Response 快取'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - Middleware
  - Cache
categories:
  - ASP.NET Core
date: 2018-01-16 12:00
featured_image: /images/ironman/i28-1.png
---

對 Response 回傳結果適時的使用快取機制，可以有助於效能提升，避免重複的運算浪費。  
本篇將介紹 ASP.NET Core 如何設定 Response 的 Client 端暫存及Server 端快取。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
  [[Day28] ASP.NET Core 2 系列 - Response 快取](https://ithelp.ithome.com.tw/articles/10197317)  

<!-- more -->

ASP.NET Core 對於網頁的 Response 快取有分兩種：  
* Client 端暫存  
* Server 端快取  

ASP.NET Core 可以透過 `[ResponseCache]` 設定 Response 的暫存方式。並套用到要使用 Response 快取的 Controller 或 Action。  

## Client 端暫存

透過 HTTP Header 的 `Cache-Control` 告知瀏覽器，把頁面存在瀏覽器暫存區。如下圖：  

![[鐵人賽 Day28] ASP.NET Core 2 系列 - Response 快取 - Client 端暫存](/images/ironman/i28-1.png)  

Client 端暫存只要套用 `[ResponseCache]` 即可，不需要多註冊額外的服務，如下：  

*Controllers\HomeController.cs*
```cs
public class HomeController : Controller
{
    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Client)]
    public IActionResult Index()
    {
        return View();
    }
}
```
`[ResponseCache]` 可以設定的參數如下：  
* `Duration`  
  設定快取有效時間(單位是秒)。  
* `Location`  
  設定快取方式，有三種選項：  
  * `ResponseCacheLocation.Any`  
    可與不同使用者共用的暫存。  
    HTTP Header 會設定成 `Cache-Control: public`。  
  * `ResponseCacheLocation.Client`  
    不可共用的暫存，以使用者區分 (如：依照 Cookies 區分)。  
    HTTP Header 會設定成 `Cache-Control: private`。  
  * `ResponseCacheLocation.None`  
    不使用暫存功能。  
    HTTP Header 會設定成 `Cache-Control: no-cache`。  
* `NoStore`  
  告知瀏覽器，不要把 Response 結果存起來。  
  HTTP Header 會設定成 `Cache-Control: no-store`。  
* `VaryByHeader`  
  設定暫存依照設定的 HTTP Header 區分。  
  例如：`VaryByHeader="Cookie"`。  
  雖然是同一台電腦連上同一個 URL，但因為 Cookie 不同，所以 Response 暫存的內容也會有所不同。  
* `VaryByQueryKeys`  
  設定暫存依照設定的 URL Query String 區分。  
  例如：`VaryByQueryKeys = new string[] { "q" }`。  
  `http://localhost:5000/?q=123` 及 `http://localhost:5000/?q=456` 雖然是連上同一個 URL，但因為設定的 URL Query String 的 `q` 不同，所以 Response 暫存的內容也會有所不同。  
* `CacheProfileName`  
  可以在 MVC Service 設定 CacheProfile，然透套用到多個地方如：  
```cs
// Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc(options =>
    {
        options.CacheProfiles.Add("Default",
            new CacheProfile()
            {
                Duration = 60,
                Location = ResponseCacheLocation.Client
            });
    });
}

// Controllers\HomeController.cs
public class HomeController : Controller
{
    [ResponseCache(CacheProfileName  = "Default")]
    public IActionResult Index()
    {
        return View();
    }
}
```

## Server 端快取

> Server 端 Response 快取需要 `Microsoft.AspNetCore.ResponseCaching` 套件。  
 ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.ResponseCaching`，所以不用再安裝。  
 Server 端 Response 快取功能是在 ASP.NET Core 1.1 之後的版本才有，如果是 ASP.NET Core 2.0 以前版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```
dotnet add package Microsoft.AspNetCore.ResponseCaching
```

Server 端 Response 快取適合用在常被呼叫的頁面或 API，且資料是 **可共用的資料** ，也就是所有網頁使用者看到的資料都一樣。當請求相同頁面時，會把上次的處理結果從 Server 的快取回傳給 Client，省去後續一連串的行為。如下圖：  

![[鐵人賽 Day28] ASP.NET Core 2 系列 - Response 快取 - Server 端快取](/images/ironman/i28-2.png)  

* 第一次呼叫 Action 時，會經過重重運算，甚至連到資料庫取值等等。  
* 第二次呼叫 Action 時，由於上次回傳結果已經存在 Server 快取，因此就直接從快取回傳上次的結果，省去其他運算步驟。  

如果要搭配 Server 端 Response 快取，除了套用 `[ResponseCache]` 外，還需要在 DI 容器注入 ResponseCaching 服務及註冊 ResponseCaching 的 Middleware，如下：  

*Startup.cs*
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddResponseCaching(options =>
            {
                options.UseCaseSensitivePaths = false;
                options.MaximumBodySize = 1024;
                options.SizeLimit = 100 * 1024 * 1024;
            });
            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseResponseCaching();
            app.UseMvcWithDefaultRoute();
        }
    }
}
```
Server 快取可以設定的參數如下：  
* `UseCaseSensitivePaths`  
  URL 是否區分大小寫為不同的 Response 快取。  
  *(預設為 true)*  
* `MaximumBodySize`  
  單個 Response 快取的大小限制(單位是 Bytes)。  
  *(預設為 64 MB)*  
* `SizeLimit`  
  Response 快取的總大小限制(單位是 Bytes)。  
  *(預設為 100 MB)*  

建立一個簡單的範例：  

*Controllers\HomeController.cs*
```cs
public class HomeController : Controller
{
    private readonly ILogger _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    [ResponseCache(Duration = 360)]
    public IActionResult Index()
    {
        var request = HttpContext.Request;
        _logger.LogDebug($"URL: {request.Host}{request.Path}{request.QueryString}");
        return View(model: DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss"));
    }
}
```

*Views\Home\Index.cshtml*
```html
@model string
<p>Server Time: @Model</p>
<a href="?q=1">Link 1</a> |
<a href="?q=2">Link 2</a> |
<a href="?q=3">Link 3</a>
```

執行結果：  

![[鐵人賽 Day28] ASP.NET Core 2 系列 - Response 快取 - Server 端快取 - 執行結果動畫](/images/ironman/i28-3.gif)  

第一次連入 `http://localhost:5000/` 時，就被放入 Server 快取中，後續的 Request 全部都是從 Server 快取回應，所以不會進到 Action，自然不會有 Action 中的 Log 資訊。  

![[鐵人賽 Day28] ASP.NET Core 2 系列 - Response 快取 - Server 端快取 - 執行結果](/images/ironman/i28-3.png)  

### Server 快取條件

嘗試在瀏覽器一直按 `F5` 刷新頁面，會發現根本不從 Server 快取拿結果，而是每次都重新跟 Action 拿新資料。這是正常的行為，因為要使用 Server 快取有條件的限制。  

要使用 Server 快取，必須要達成以下條件：  
1. 回傳的狀態必須是 HTTP Status 200 (OK)。  
2. Request 的 HTTP Methods 必須是 `GET` 或 `HEAD`。  
3. 不能有其他的 Middleware 在加工 ResponseCachingMiddleware 之前異動 Response。  
4. HTTP Header 不能用 `Authorization`。  
5. HTTP Header 的 `Cache-Control` 值必須是 `public`。  
  *(`F5` 刷新頁面不會帶 `Cache-Control`，所以使用 Server 快取條件不成立)*
6. HTTP Header 不能用 `Set-Cookie`。  
7. HTTP Header 的 `Vary` 值不能為 `*`。  
8. 不能使用 `IHttpSendFileFeature`。  
9. 不能設定 `no-store`。  
10. 單一回傳快取不能大於 `MaximumBodySize`。  
11. 總體快取不能大於 `SizeLimit`。  

> 如果用過 ASP.NET 的 `[OutputCache]`，千萬不要以為 `[ResponseCache]` 跟它是一樣的東西。  
> `[ResponseCache]` 多了上面一連串的必備條件...  
> *(我也為此卡了一陣子，還把 Source Code Checkout 下來 Debug...)*

## 參考

[Response caching in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/response)  