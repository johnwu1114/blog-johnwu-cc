---
title: ASP.NET - 基本優化設定
author: John Wu
tags:
  - ASP.NET
  - HTTP Modules
  - Web.config
categories:
  - ASP.NET
date: 2017-08-27 10:01:00
---
![ASP.NET - 基本優化設定 - HTTP Modules 運作方式](/images/x312.png)

ASP.NET 有些基本的預設值是不必要的，既然不會用到，建議就把它移除。  
本篇將介紹 ASP.NET 基本優化設定，把不必要的 `HTTP Modules`、`View Engines` 及 `HTTP Headers` 移除。  

<!-- more -->

## 1. HTTP Modules

每個 Request 都會經過所有註冊的 HTTP Modules，Response 也是逐一回傳，以先進後出的方式處裡封包。如上圖。  
ASP.NET 預設註冊的 HTTP Modules 有 16 個，取得已註冊 HTTP Modules 的程式碼如下：  
```cs
var httpModules = HttpContext.ApplicationInstance.Modules;
```

輸出內容如下：
![ASP.NET - 基本優化設定 - 預設 HTTP Modules](/images/x313.png)

可以看到有 16 個 HTTP Modules，但並不是每一個都會需要，例如驗證相關的邏輯都自己實作，完全不會用到 `WindowsAuthentication`、`FormsAuthentication`、`DefaultAuthentication`，那這三個 HTTP Modules 就應該把它移除，省的在每個 Request 及 Response 都會經過它們。  

可以在網站根目錄的 Web.config 編輯，移除預設的 HTTP Modules。範例如下：
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- ... -->
    <modules>
      <remove name="OutputCache" />
      <remove name="WindowsAuthentication" />
      <remove name="FormsAuthentication" />
      <remove name="DefaultAuthentication" />
      <remove name="RoleManager" />
      <remove name="AnonymousIdentification" />
    </modules>
  </system.webServer>
</configuration>
```
> 此例我移除了 6 個沒用到的 HTTP Modules

再次查看 `HttpContext.ApplicationInstance.Modules`，就只剩下 10 個 HTTP Modules 了。
![ASP.NET - 基本優化設定 - 移除預設 HTTP Modules](/images/x314.png)
> 每個網站用到的 HTTP Modules 不同，請依照各自的需求移除，如果全照我的範例用，網站可能會發生錯誤。

## 2. View Engines

ASP.NET MVC 網站中，預設會有兩種 View Engines：  
1. ASPX View Engine  
2. Razor View Engine  

View Engines 在實際執行時，是用 Trial and Error 的方式找 View File，如果只用到一種 View Engine，建議就把用不到的 View Engines 移除，可以加快找 View File 的速度。  
建立一個 Action 而不建立 View File，輸出的錯誤會如下：  
![ASP.NET - 基本優化設定 - 預設 View Engines Error](/images/x315.png)

### RazorViewEngine

在 Application_Start 的時候，把所有的 View Engines 都刪除，再把需要的 View Engines 加回去。如下：
```cs
using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace MyWebsite
{
    public class Global : HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            // ...
            ViewEngines.Engines.Clear();
            ViewEngines.Engines.Add(new RazorViewEngine());
        }

        // ...
    }
}
```

我只用到 Razor View Engine，所以就只加入 Razor View Engine，再次查看輸出的錯誤。如下：  
![ASP.NET - 基本優化設定 - Razor View Engines Error](/images/x316.png)

### CSharpViewEngine

ASPX 的 View File 都被忽略了，但還是有點美中不足的部分，我只用到 `C#`，但 View Engine 卻去找 Visual Basic 的 View File。  
我們在小改一下程式，建立一個 CSharpViewEngine 繼承 RazorViewEngine，改寫一下 View Engine 的規則。

```cs
using System.Web.Mvc;

namespace MyWebsite
{
    public class CSharpViewEngine : RazorViewEngine
    {
        private const string _fileExtensions = "cshtml";

        public CSharpViewEngine()
        {
            base.AreaViewLocationFormats = new string[] { "~/Areas/{2}/Views/{1}/{0}." + _fileExtensions, "~/Areas/{2}/Views/Shared/{0}." + _fileExtensions };
            base.AreaMasterLocationFormats = new string[] { "~/Areas/{2}/Views/{1}/{0}." + _fileExtensions, "~/Areas/{2}/Views/Shared/{0}." + _fileExtensions };
            base.AreaPartialViewLocationFormats = new string[] { "~/Areas/{2}/Views/{1}/{0}." + _fileExtensions, "~/Areas/{2}/Views/Shared/{0}." + _fileExtensions };
            base.ViewLocationFormats = new string[] { "~/Views/{1}/{0}." + _fileExtensions, "~/Views/Shared/{0}." + _fileExtensions };
            base.MasterLocationFormats = new string[] { "~/Views/{1}/{0}." + _fileExtensions, "~/Views/Shared/{0}." + _fileExtensions };
            base.PartialViewLocationFormats = new string[] { "~/Views/{1}/{0}." + _fileExtensions, "~/Views/Shared/{0}." + _fileExtensions };
            base.FileExtensions = new string[] { _fileExtensions };
        }
    }
}
```
> 如果是用 Visual Basic 的 `*.vbhtml`，只要把 `_fileExtensions = "cshtml";` 改成 `_fileExtensions = "vbhtml";` 即可。

再次查看輸出的錯誤。如下：  
![ASP.NET - 基本優化設定 - Razor View Engines + C# Error](/images/x317.png)

## 3. HTTP Headers

ASP.NET 預設會在每個 Response 的 Header 帶上 Server 資訊。看似沒什麼影響，但存在兩個小問題：  
1. 資安問題：讓別人知道使用的技術，有可能會針對該技術的漏洞攻擊。  
2. 浪費流量：每個 Response 都帶有不必要的內容時，就是積沙成塔的浪費。  

HTTP Headers 如下：
![ASP.NET - 基本優化設定 - HTTP Headers](/images/x318.png)

此外，靜態檔案都會被加上 [ETag](https://zh.wikipedia.org/wiki/HTTP_ETag)，用來讓瀏覽器識別 Cache 的機制。但現在一些網站分析工具都不建議使用(如: [YSlow](http://yslow.org/))。  

靜態檔 HTTP Headers 如下：
![ASP.NET - 基本優化設定 - HTTP Headers](/images/x319.png)

### RemoveHeaderModule

可以建立一個 HTTP Modules 處理這些無用的 HTTP Headers：
```cs
using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;
using MyWebsite;

// 把 RemoveHeaderModule 註冊在 ApplicationStart 之前
[assembly: PreApplicationStartMethod(typeof(RemoveHeaderModule), "Register")]

namespace MyWebsite
{
    public class RemoveHeaderModule : IHttpModule
    {
        private static readonly List<string> _removeHeaders = new List<string>
        {
            "Server",
            "X-AspNet-Version",
            //"X-AspNetMvc-Version",
            "ETag"
        };

        public static void Register()
        {
            DynamicModuleUtility.RegisterModule(typeof(RemoveHeaderModule));
            // HTTP Headers 中的 X-AspNetMvc-Version，一開始就直接 Disable，效率更勝每次都移除。
            MvcHandler.DisableMvcResponseHeader = true;
        }

        public void Init(HttpApplication context)
        {
            context.PreSendRequestHeaders += OnPreSendRequestHeaders;
        }

        public void Dispose()
        {
        }

        private void OnPreSendRequestHeaders(object sender, EventArgs e)
        {
            if (HttpContext.Current != null)
            {
                var response = HttpContext.Current.Response;
                _removeHeaders.ForEach(header => { response.Headers.Remove(header); });
            }
        }
    }
}
```

### X-Powered-By

移除 `X-Powered-By`，但 `X-Powered-By` 並不是在 ASP.NET 中產生出來的內容！  
`X-Powered-By` 是由 IIS 加入的資訊，有兩種移除方式：  
1. 從 IIS 移除  
2. 從 Web.config 移除  

以 Web.config 為例，在網站根目錄的 Web.config 編輯，移除預設的 HTTP Modules。範例如下：
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <!-- ... -->
        <httpProtocol>
            <customHeaders>
                <remove name="X-Powered-By" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
```

## 程式碼下載

[asp-net-optimized-setting](https://github.com/johnwu1114/asp-net-optimized-setting)

## 參考

[12 tips to increase the performance of your ASP.NET application drastically – Part 1](https://www.infragistics.com/community/blogs/devtoolsguy/archive/2015/08/07/12-tips-to-increase-the-performance-of-asp-net-application-drastically-part-1.aspx)  
[12 tips to increase the performance of your ASP.NET application drastically – Part 2](https://www.infragistics.com/community/blogs/brijmishra/archive/2015/08/21/12-tips-to-increase-the-performance-of-asp-net-application-drastically-part-2.aspx)
