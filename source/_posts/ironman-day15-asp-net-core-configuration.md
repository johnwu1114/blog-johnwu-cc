---
title: '[鐵人賽 Day15] ASP.NET Core 2 系列 - 組態設定 (Configuration)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - Configuration
categories:
  - ASP.NET Core
date: 2018-01-03 12:00
featured_image: /images/i15-1.png
---

ASP.NET Core 不再把 Web.config 當作預設的組態設定，而且 .NET Core 讀取組態設定的方式也跟過去不同，不再使用 ConfigurationManager 讀組態設定值。除了從檔案取得組態設定，還有多種不同的組態設定方式。  
本篇將介紹 ASP.NET Core 的組態設定(Configuration)方式。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day15] ASP.NET Core 2 系列 - 組態設定 (Configuration)](https://ithelp.ithome.com.tw/articles/10195417)  
 
<!-- more -->

ASP.NET Core 的組態設定可以有以下幾種來源：  
* 組態設定檔。如：`*.json`、`*.xml`、`*.ini`等。  
* 指令參數  
* 環境變數 
* 記憶體物件  
* 自訂組態來源 (實作 IConfigurationSource)  
* Azure Key Vault  
* Safe Storage  

> 本篇不會介紹 [Azure Key Vault](https://docs.microsoft.com/en-gb/aspnet/core/security/key-vault-configuration?tabs=aspnetcore2x) 及 [Safe Storage](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?tabs=visual-studio-code)，有需要的話可以點擊超連結至官網查看。  

## 組態設定檔

可依照個人喜好或團隊習慣的方式建立組態檔，檔名跟路徑並沒有特別的規則。  
此例，我在專案當中建立一個 Configuration 的資料夾，並建立 settings.json。  

*Configuration\settings.json*
```json
{
  "SupportedCultures": [
    "en-GB",
    "zh-TW",
    "zh-CN"
  ],
  "CustomObject": {
    "Property": {
      "SubProperty1": 1,
      "SubProperty2": true,
      "SubProperty3": "This is sub property."
    }
  }
}
```

> 過去 ASP.NET MVC、.NET Framework 的組態設定檔，預設用 Web.config 或 App.config，採用 XML 格式。  
> 現在 .NET Core 建議採用 JSON 格式，比較簡潔易讀。  

在 WebHost Builder 用 `ConfigureAppConfiguration` 載入組態設定，讓組態設定之後可以被 DI。  

*Startup.cs*
```cs
using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }
        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) =>
                {
                    var env = hostContext.HostingEnvironment;
                    config.SetBasePath(Path.Combine(env.ContentRootPath, "Configuration"))
                          .AddJsonFile(path: "settings.json", optional: false, reloadOnChange: true);
                })
                .UseStartup<Startup>()
                .Build();
        }
    }
}
```
`ConfigureAppConfiguration` 會提供 `IConfigurationBuilder` 的實例 **config**，透過 `IConfigurationBuilder` 載入組態的相關設定。  
* **SetBasePath**：設定 Configuration 的目錄位置，如果是放在不同目錄，再把路徑換掉即可。  
* **AddJsonFile**：
  * **path**：組態檔案的路徑位置。  
  * **optional**：如果是必要的組態檔，optional 就要設定為 false，當檔案不存在就會拋出 FileNotFoundException。  
  * **reloadOnChange**：如果檔案被更新，就同步更新 `IConfiguration` 實例的值。  

`IConfigurationBuilder` 在 WebHost 實例化後，就會建立 `IConfiguration` 實例，並將 `IConfiguration` 放入 DI 容器供注入使用，並以 Dictionary 的方式取用組態設定的值。  
*(DI 可以參考這篇：[[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入 (Dependency Injection)](/article/ironman-day04-asp-net-core-dependency-injection.html))*  

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration _config;

        public HomeController(IConfiguration config)
        {
            _config = config;
        }

        public string Index()
        {             
            var defaultCulture = _config["SupportedCultures:1"];
            var subProperty1 = _config["CustomObject:Property:SubProperty1"];
            var subProperty2 = _config["CustomObject:Property:SubProperty2"];
            var subProperty3 = _config["CustomObject:Property:SubProperty3"];

            return $"defaultCulture({defaultCulture.GetType()}): {defaultCulture}\r\n"
                + $"subProperty1({subProperty1.GetType()}): {subProperty1}\r\n"
                + $"subProperty2({subProperty2.GetType()}): {subProperty2}\r\n"
                + $"subProperty3({subProperty3.GetType()}): {subProperty3}\r\n";
        }
    }
}
```
> 從上述範例可以看出，Key 值就是 *settings.json* 內容的 Node 名稱，並以 `:` 符號區分階層。  

輸出結果如下：
```
defaultCulture(System.String): zh-TW
subProperty1(System.String): 1
subProperty2(System.String): True
subProperty3(System.String): This is sub property.
```

`IConfiguration` 是以 `Dictionary` 的方式取用組態設定，所以 `*.json` 的最外層不能直接用集合的格式，在最外層用集合會變成沒有對應的 Key 值。錯誤的格式如下：  

*Configuration\wrong.json*
```json
[
    "en-GB",
    "zh-TW",
    "zh-CN"
]
```

### 強型別及型態

上面範例有兩個很大的問題：  
1. 使用字串當做 Key 是弱型別，沒辦法在編譯期間檢查出打錯字。  
2. 型態不符合預期，不管是數值或布林值全都是變字串型態。  

要使用強型別，首先要建立相對應的類別，*settings.json* 的對應類別如下：
```cs
public class Settings
{
    public string[] SupportedCultures { get; set; }
    public CustomObject CustomObject { get; set; }
}

public class CustomObject
{
    public Property1 Property { get; set; }
}

public class Property1
{
    public int SubProperty1 { get; set; }
    public bool SubProperty2 { get; set; }
    public string SubProperty3 { get; set; }
}
```

在 `Startup.ConfigureServices` 透過 `services.Configure<T>()`以強型別對應 `IConfiguration` 實例的方式，加入至 DI 容器：   

*Startup.cs*  
```cs
// ...
public class Startup
{
    private IConfiguration _config;
    
    public Startup(IConfiguration config)
    {
        _config = config;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.Configure<Settings>(_config);
    }

    // ...
}
```

使用的 DI 型別改成 `IOptions<T>`，如下：  

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly Settings _settings;

        public HomeController(IOptions<Settings> settings)
        {
            _settings = settings.Value;
        }

        public string Index()
        {
            var defaultCulture = _settings.SupportedCultures[1];
            var subProperty1 = _settings.CustomObject.Property.SubProperty1;
            var subProperty2 = _settings.CustomObject.Property.SubProperty2;
            var subProperty3 = _settings.CustomObject.Property.SubProperty3;

            return $"defaultCulture({defaultCulture.GetType()}): {defaultCulture}\r\n"
                + $"subProperty1({subProperty1.GetType()}): {subProperty1}\r\n"
                + $"subProperty2({subProperty2.GetType()}): {subProperty2}\r\n"
                + $"subProperty3({subProperty3.GetType()}): {subProperty3}\r\n";
        }
    }
}
```

輸出結果如下：
```
defaultCulture(System.String): zh-TW
subProperty1(System.Int32): 1
subProperty2(System.Boolean): True
subProperty3(System.String): This is sub property.
```
這樣就可以是強型別，且有明確的型態。

## 指令參數

ASP.NET Core 用 `dotnet run` 啟動時，可以在指令後面帶入參數，並把該參數變成組態設定。例如：  
```
dotnet run SiteName="John Wu's Blog" Domain="blog.johnwu.cc"
```

程式啟動指令參數會從 `Main(string[] args)` 取得，再將 **args** 傳給 `IConfigurationBuilder.AddCommandLine()` 載入指令參數。  

*Program.cs*  
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) => config.AddCommandLine(args))
                .UseStartup<Startup>()
                .Build();
        }
    }
}
```

同樣以 DI 方式注入 `IConfiguration` 實例，以 Dictionary 的方式取用組態檔的值。  

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration _config;

        public HomeController(IConfiguration config)
        {
            _config = config;
        }

        public string Index()
        {
            var siteName = _config["SiteName"];
            var domain = _config["Domain"];

            return $"SiteName({siteName.GetType()}): {siteName}\r\n"
                 + $"Domain({domain.GetType()}): {domain}\r\n";
        }
    }
}
```

輸出結果如下：
```
SiteName(System.String): John Wu's Blog
Domain(System.String): blog.johnwu.cc
```

## 環境變數

ASP.NET Core 可以取用系統的環境變數。以 Windows 為例：  
 **控制台** -> **系統及安全性**  -> **系統**
![[鐵人賽 Day15] ASP.NET Core 2 系列 - 組態設定(Configuration) - 環境變數1](/images/i15-1.png)  
![[鐵人賽 Day15] ASP.NET Core 2 系列 - 組態設定(Configuration) - 環境變數2](/images/i15-2.png)  

Windows 也可以用指令：
```sh
SETX Sample "This is environment variable sample." /M
```
> 需要用**系統管理員**權限執行。  
> 如果設定完沒有生效，試著重新登入或重開機。  

Linux\macOS 可以在 `/etc/profile` 加入環境變數：
```sh
export Sample="This is environment variable sample."
```

在 WebHost Builder 用 `IConfigurationBuilder.AddEnvironmentVariables()` 載入環境變數。  

*Program.cs*
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) => config.AddEnvironmentVariables())
                .UseStartup<Startup>()
                .Build();
        }
    }
}
```

同樣以 DI 方式注入 `IConfiguration` 實例，以 Dictionary 的方式取用組態檔的值。  

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration _config;

        public HomeController(IConfiguration config)
        {
            _config = config;
        }

        public string Index()
        {
            var sample = _config["Sample"];
            return $"sample({sample.GetType()}): {sample}\r\n";
        }
    }
}
```

輸出結果如下：
```
sample(System.String): This is environment variable sample.
```

## 記憶體物件

這種做法比較像是 Hardcode，直接在 `ConfigureAppConfiguration` 宣告 Dictionary，然後用 `IConfigurationBuilder.AddInMemoryCollection()` 載入記憶體物件。如下：  

*Program.cs*
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) => {
                    var dictionary =  new Dictionary<string, string>
                    {
                        { "Site:Name", "John Wu's Blog" },
                        { "Site:Domain", "blog.johnwu.cc" }
                    };
                    config.AddInMemoryCollection(dictionary);
                })
                .UseStartup<Startup>()
                .Build();
        }
    }
}
```

同樣以 DI 方式注入 `IConfiguration` 實例，以 Dictionary 的方式取用組態檔的值。  

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration _config;

        public HomeController(IConfiguration config)
        {
            _config = config;
        }

        public string Index()
        {
            var siteName = _config["Site:Name"];
            var domain = _config["Site:Domain"];

            return $"Site.Name({siteName.GetType()}): {siteName}\r\n"
                 + $"Site.Domain({domain.GetType()}): {domain}\r\n";
        }
    }
}
```

輸出結果如下：
```
Site.Name(System.String): John Wu's Blog
Site.Domain(System.String): blog.johnwu.cc
```

## 自訂組態來源

自訂組態來源是透過實作 `IConfigurationSource` 以及 `ConfigurationProvider` 來載入組態設定。  
實作範例如下：  
```cs
public class CustomConfigurationSource : IConfigurationSource
{
    public IConfigurationProvider Build(IConfigurationBuilder builder)
    {
        return new CustomConfigurationProvider();
    }
}

public class CustomConfigurationProvider : ConfigurationProvider 
{
    public override void Load()
    {
        Data = new Dictionary<string, string>
            {
                { "Custom:Site:Name", "John Wu's Blog" },
                { "Custom:Site:Domain", "blog.johnwu.cc" }
            };
    }
}
```
> **Data** 的內容可依需求填入，例如：  
> * 從 SQL Server 取得內容後，轉成 Dictionary 填入  
> * 從 Redis 取得內容後，轉成 Dictionary 填入  
> * 其它外部資源等

把 CustomConfigurationSource 加入至 `IConfigurationBuilder`。  

*Program.cs*
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) => config.Add(new CustomConfigurationSource()))
                .UseStartup<Startup>()
                .Build();
        }
    }
}
```

同樣以 DI 方式注入 `IConfiguration` 實例，以 Dictionary 的方式取用組態檔的值。  

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration _config;

        public HomeController(IConfiguration config)
        {
            _config = config;
        }

        public string Index()
        {
            var siteName = _config["Custom:Site:Name"];
            var domain = _config["Custom:Site:Domain"];

            return $"Custom.Site.Name({siteName.GetType()}): {siteName}\r\n"
                 + $"Custom.Site.Domain({domain.GetType()}): {domain}\r\n";
        }
    }
}
```

輸出結果如下：
```
Custom.Site.Name(System.String): John Wu's Blog
Custom.Site.Domain(System.String): blog.johnwu.cc
```

## 參考

[Configuration in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/index?tabs=basicconfiguration)  