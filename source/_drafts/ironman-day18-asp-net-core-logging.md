---
title: '[鐵人賽 Day18] ASP.NET Core 2 系列 - Logging'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - NLog
categories:
  - ASP.NET Core
date: 2018-01-06 12:00
featured_image: /images/i18-1.png
---

ASP.NET Core 提供了好用的 Logging API，預設就已經將 Logger 物件放進 DI 容器，能直接透過 DI 取用輸出 Log 的物件使用。  
本篇將介紹 ASP.NET Core 的 Logging 使用方式。  

<!-- more -->

## Logger

ASP.NET Core 2 預設就把 Logger 放進 DI 容器，能直接透過 DI 取用 ILogger 實例。如下：  
*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger _logger;
        
        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }
        public string Index() {
            _logger.LogTrace("This trace log from Home.Index()");     
            _logger.LogDebug("This debug log from Home.Index()");                                 
            _logger.LogInformation("This information log from Home.Index()");                        
            _logger.LogWarning("This warning log from Home.Index()");                    
            _logger.LogError("This error log from Home.Index()");                    
            _logger.LogCritical("This critical log from Home.Index()");
            return "Home.Index()";
        }
    }
}
```
> 以下都會用這個 `Home.Index()` 做為 Log 輸出範例。  

透過指令執行 `dotnet run`，就可以看到 Log 訊息：  

![[鐵人賽 Day18] ASP.NET Core 2 系列 - Logging - Sample](/images/i18-1.png)  

會發現上例預期輸出 6 筆 Log，但實際上確出現一大堆 Log，其中只有 4 筆 Log 是由 `Home.Index()` 輸出。  

## Log Level

ASP.NET Core 的 Log 有分為以下六種：
* **Trace** *(Log Level = 0)*  
 此類 Log 通常用於開發階段，讓開發人員檢查資料使用，可能會包含一些帳號密碼等敏感資料。  
 > 不適合出現在正是環境的 Log，所以預設不會輸出在 Log 中。  
* **Debug** *(Log Level = 1)*  
 這類型的 Log 是為了在正式環境除錯使用，但平常不應該開啟，避免 Log 量太大，反而會造成正式環境的問題。  
 > 預設不會輸出在 Log 中。    
* **Information** *(Log Level = 2)*  
 常見的 Log 類型，主要是紀錄程試運行的流程。  
* **Warning** *(Log Level = 3)*  
 紀錄可預期的錯誤或者效能不佳的事件；不改不會死，但改了會更好的問題。  
* **Error** *(Log Level = 4)*  
 紀錄非預期的錯誤，不該發生但卻發生，應該要避免重複發生的錯誤事件。  
* **Critical** *(Log Level = 5)*  
 只要發生就準備見上帝的錯誤事件，例如會導致網站重啟，系統崩潰的事件。  

若要變更 Log 輸出等級，可以打開 `Program.Main` 在 WebHost Builder 加入 `ConfigureLogging` 設定。  
*Program.cs*
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

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
                .UseStartup<Startup>()
                .ConfigureLogging(logging => logging.SetMinimumLevel(LogLevel.Trace))
                .Build();
        }
    }
}
```

## Log Filter 

大部都是 `Microsoft.AspNetCore` 輸出的 Log，但這類型的 Log 你可能不需要關注。如下：  

![[鐵人賽 Day18] ASP.NET Core 2 系列 - Logging - Log Filter](/images/i18-2.png)  

外部參考的套件，通常只需要關注有沒有 Error 層級以上的錯誤。  
因此，可以透過外部檔案設定 Log Level，過濾掉一些你不需要關注的 Log。  
建立一個 *settings.json* 的檔案，依照需求增減 Log 過濾條件。內容如下：  

*Configuration\settings.json*
```json
{
    "Logging": {
        "LogLevel": {
            "Default": "Debug",
            "MyWebsite": "Trace",
            "System": "Error",
            "Microsoft": "Error"
        }
    }
}
```
* **Default**  
 預設會紀錄 Debug 以上層級的 Log。  
* **MyWebsite**  
 當遇到 Log 來源是 **MyWebsite** 的時候，就會紀錄 Trace 以上層級的 Log。  
* **System** & **Microsoft**  
 當遇到 Log 來源是 **System** 或 **Microsoft** 的時候，只紀錄 Error 以上層級的 Log。  

在 `Program.Main` 的 `ConfigureLogging` 設定 Log 組態檔。  
*Program.cs*
```cs
using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

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
                .UseStartup<Startup>()
                .ConfigureLogging(logging =>
                {
                    var env = hostContext.HostingEnvironment;
                    var configuration = new ConfigurationBuilder()
                        .SetBasePath(Path.Combine(env.ContentRootPath, "Configuration")))
                        .AddJsonFile(path: "settings.json", optional: true, reloadOnChange: true)
                        .Build();
                    logging.AddConfiguration(configuration.GetSection("Logging"));
                })
                .Build();
        }
    }
}
```
> `GetSection` 是指定從 *Configuration\settings.json* 檔的 **Logging** 區塊讀取內容。  

輸出結果：  

![[鐵人賽 Day18] ASP.NET Core 2 系列 - Logging - Log Filter](/images/i18-3.png)  


## 參考

[Introduction to Logging in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/?tabs=aspnetcore2x)  