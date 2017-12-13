---
title: '[鐵人賽 Day13] ASP.NET Core 2 系列 - Logging (NLog & Log4net)'
author: John Wu
tags:
  - ASP.NET Core
  - 2018 iT 邦幫忙鐵人賽
  - NLog
  - Log4net
categories:
  - ASP.NET Core
date: 2018-01-01 23:17
featured_image: /images/i13-1.png
---

ASP.NET Core 提供了好用的 Logging API，不僅可以方便調用 Logger，且支援多種 Log 輸出，也支援第三方套件的 Logging Framework。  
本篇將介紹 ASP.NET Core 的 Logging 使用方式，也會有 **NLog** 及 **Log4net** 的範例。  

<!-- more -->

## Logger

ASP.NET Core 2 預設就把 Logger 放進 IoC 容器，能直接透過 DI 取用 ILogger 實例。如下：  
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

![[鐵人賽 Day12] ASP.NET Core 2 系列 - Logging - Sample](/images/i13-1.png)  

會發現上例預期輸出 6 筆 Log，但實際上確出現一大堆 Log，其中只有 4 筆 Log 是由 `Home.Index()` 輸出。  

### Log Level

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

### Log Filter 

大部都是 `Microsoft.AspNetCore` 輸出的 Log，但這類型的 Log 你可能不需要關注。如下：  

![[鐵人賽 Day12] ASP.NET Core 2 系列 - Logging - Log Filter](/images/i13-2.png)  

外部參考的套件，通常只需要關注有沒有 Error 層級以上的錯誤。  
因此，可以透過外部檔案設定 Log Level，過濾掉一些你不需要關注的 Log。  
建立一個 `settings.json` 的檔案，依照需求增減 Log 過濾條件。內容如下：  
*settings.json*
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
                    var configuration = new ConfigurationBuilder()
                        .SetBasePath(Path.Combine(Directory.GetCurrentDirectory()))
                        .AddJsonFile(path: "settings.json", optional: true, reloadOnChange: true)
                        .Build();
                    logging.AddConfiguration(configuration.GetSection("Logging"));
                })
                .Build();
        }
    }
}
```
> `GetSection` 是指定從 *settings.json* 檔的 **Logging** 區塊讀取內容。  

## NLog

NLog 是 .NET 的熱門 Logging Framework；而且還是 ASP.NET Core 官方第三方 Logging Framework 推薦名單之一。  

### 安裝套件

NLog 需要安裝 `NLog` 及 `NLog.Web.AspNetCore` 套件。  
透過 dotnet cli 在專案資料夾執行安裝指令：  
```sh
dotnet add package NLog -v 4.5.0-rc02
dotnet add package NLog.Web.AspNetCore -v 4.5.0-rc2
```
> .NET Core 的版本目前還是 RC 版。  

### 組態設定檔

新增一個 *nlog.config* 的檔案如下：
```xml
<?xml version="1.0" encoding="utf-8" ?>
<nlog 
    xmlns="http://www.nlog-project.org/schemas/NLog.xsd" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    autoReload="true" 
    internalLogLevel="info" 
    internalLogFile="C:\Logs\MyWebsite\nlog-internal.txt">
    <targets>
        <!-- write logs to file  -->
        <target xsi:type="File" name="ALL" 
            fileName="C:\Logs\MyWebsite\nlog-all_${shortdate}.log" 
            layout="${longdate}|${event-properties:item=EventId.Id}|${uppercase:${level}}|${logger}|${message} ${exception}" />
    </targets>
    <rules>
        <logger name="*" minlevel="Trace" writeTo="ALL" />
    </rules>
</nlog>
```
> NLog 組態設定可以參考：[NLog Configuration file](https://github.com/nlog/NLog/wiki/Configuration-file)  

在 `Program.Main` 啟動時載入 NLog 組態設定檔，並在 WebHost Builder 注入 NLog 服務。  
*Program.cs*
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using NLog.Web;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseNLog()
                .Build();
        }
    }
}
```

輸出結果如下：  
*C:\Logs\MyWebsite\nlog-all_2017-12-31.log*  
```log
2017-12-31 00:27:32.6339||INFO|Microsoft.AspNetCore.DataProtection.KeyManagement.XmlKeyManager|User profile is available. Using 'C:\Users\john.wu\AppData\Local\ASP.NET\DataProtection-Keys' as key repository and Windows DPAPI to encrypt keys at rest. 
2017-12-31 00:27:33.1149||INFO|Microsoft.AspNetCore.Hosting.Internal.WebHost|Request starting HTTP/1.1 GET http://localhost:5000/   
2017-12-31 00:27:33.1969||INFO|Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker|Executing action method MyWebsite.HomeController.Index (MyWebsite) with arguments ((null)) - ModelState is Valid 
2017-12-31 00:27:33.1999||INFO|MyWebsite.HomeController|This information log from Home.Index() 
2017-12-31 00:27:33.1999||WARN|MyWebsite.HomeController|This warning log from Home.Index() 
2017-12-31 00:27:33.1999||ERROR|MyWebsite.HomeController|This error log from Home.Index() 
2017-12-31 00:27:33.1999||FATAL|MyWebsite.HomeController|This critical log from Home.Index() 
2017-12-31 00:27:33.2219||INFO|Microsoft.AspNetCore.Mvc.Internal.ObjectResultExecutor|Executing ObjectResult, writing value Microsoft.AspNetCore.Mvc.ControllerContext. 
2017-12-31 00:27:33.2459||INFO|Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker|Executed action MyWebsite.HomeController.Index (MyWebsite) in 56.8935ms 
2017-12-31 00:27:33.2519||INFO|Microsoft.AspNetCore.Hosting.Internal.WebHost|Request finished in 137.5115ms 200 text/plain; charset=utf-8 
```

## Log4net

從網路上各方訊息看來，Log4net 應該是 .NET 最熱門的 Logging Framework，我個人也是習慣用 Log4net。  

### 安裝套件

Log4net 需要安裝 `log4net` 套件。  
透過 dotnet cli 在專案資料夾執行安裝指令：  
```sh
dotnet add package log4net
```

### 組態設定檔

新增一個 *log4net.config* 的檔案如下：
```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
    <log4net>
        <appender name="All" type="log4net.Appender.RollingFileAppender">
            <file value="C:\Logs\MyWebsite\log4net-all" />
            <appendToFile value="true" />
            <rollingStyle value="Composite" />
            <datePattern value="_yyyy-MM-dd.lo\g" />
            <maximumFileSize value="5MB" />
            <maxSizeRollBackups value="15" />
            <staticLogFileName value="false" />
            <PreserveLogFileNameExtension value="true" />
            <layout type="log4net.Layout.PatternLayout">
                <conversionPattern value="%date [%thread] %level %logger - %message%newline" />
            </layout>
        </appender>
        <root>
            <appender-ref ref="All" />
        </root>
    </log4net>
</configuration>
```
> Log4net 組態設定可以參考：[Apache log4net Manual - Configuration](https://logging.apache.org/log4net/release/manual/configuration.html)  

在 `Program.Main` 啟動時載入 Log4net 組態設定檔。  
```cs
using System.IO;
using System.Reflection;
using log4net;
using log4net.Config;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace MyWebsite
{
    public class Program
    {
        private readonly static ILog _log = LogManager.GetLogger(typeof(Program));

        public static void Main(string[] args)
        {
            LoadLog4netConfig();
            _log.Info("Application Start");
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
        }

        private static void LoadLog4netConfig()
        {
            var repository = LogManager.CreateRepository(
                    Assembly.GetEntryAssembly(),
                    typeof(log4net.Repository.Hierarchy.Hierarchy)
                );
            XmlConfigurator.Configure(repository, new FileInfo("log4net.config"));
        }
    }
}
```
載入 Log4net 組態設定後，就可以直接操作 `_log` 物件寫 Log，用法就跟過去 .NET Framework 一樣。  
但 Log4net 沒有實作 ASP.NET Core 提供的 Logging API，所以沒辦法透過 DI 的 ILogger 寫 Log4net 的 Log。  
> 難怪 ASP.NET Core 官方不推 Log4net...  

### ILogger

既然 Log4net 沒有實作 `ILogger`，就自己做吧！  
建立一個 *Log4netLogger.cs*，內容如下：  
```cs
using System;
using System.IO;
using System.Reflection;
using log4net;
using log4net.Config;
using Microsoft.Extensions.Logging;

namespace MyWebsite
{
    public class Log4netLogger : ILogger
    {
        private readonly ILog _log;

        public Log4netLogger(string name, FileInfo fileInfo)
        {
            var repository = LogManager.CreateRepository(
                    Assembly.GetEntryAssembly(),
                    typeof(log4net.Repository.Hierarchy.Hierarchy)
                );
            XmlConfigurator.Configure(repository, fileInfo);
            _log = LogManager.GetLogger(repository.Name, name);
        }

        public IDisposable BeginScope<TState>(TState state)
        {
            return null;
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            switch (logLevel)
            {
                case LogLevel.Critical: return _log.IsFatalEnabled;
                case LogLevel.Debug:
                case LogLevel.Trace: return _log.IsDebugEnabled;
                case LogLevel.Error: return _log.IsErrorEnabled;
                case LogLevel.Information: return _log.IsInfoEnabled;
                case LogLevel.Warning: return _log.IsWarnEnabled;
                default: 
                    throw new ArgumentOutOfRangeException(nameof(logLevel));
            }
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state,
            Exception exception, Func<TState, Exception, string> formatter)
        {
            if (!IsEnabled(logLevel))
            {
                return;
            }
            if (formatter == null)
            {
                throw new ArgumentNullException(nameof(formatter));
            }
            string message = null;
            if (null != formatter)
            {
                message = formatter(state, exception);
            }
            if (!string.IsNullOrEmpty(message) || exception != null)
            {
                switch (logLevel)
                {
                    case LogLevel.Critical: _log.Fatal(message); break;
                    case LogLevel.Debug:
                    case LogLevel.Trace: _log.Debug(message); break;
                    case LogLevel.Error: _log.Error(message); break;
                    case LogLevel.Information: _log.Info(message); break;
                    case LogLevel.Warning: _log.Warn(message); break;
                    default: 
                        _log.Warn($"Unknown log level {logLevel}.\r\n{message}"); 
                        break;
                }
            }
        }
    }
}
```
> 由於 Log4net 的 Log Level 跟 ASP.NET Core Logger API 的級別不一致，所以要將 Log Level 的事件做相對的對應。  

### ILoggerProvider。

`ILogger` 主要是透過 Logger Provider 產生，所以需要實作 `ILoggerProvider`。  
建立一個 *Log4netProvider.cs*，內容如下：  
```cs
using System.IO;
using Microsoft.Extensions.Logging;

namespace MyWebsite
{
    public class Log4netProvider : ILoggerProvider
    {
        private readonly FileInfo _fileInfo;

        public Log4netProvider(string log4netConfigFile)
        {
            _fileInfo = new FileInfo(log4netConfigFile);
        }

        public ILogger CreateLogger(string name)
        {
            return new Log4netLogger(name, _fileInfo);
        }

        public void Dispose()
        {
        }
    }
}
```

在 `Startup.ConfigureServices` 將 `Log4netProvider` 註冊到 Services 中。  
*Startup.cs*
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<ILoggerProvider>(new Log4netProvider("log4net.config"));
    }
}
```

如此一來，Log4net 也能使用 ASP.NET Core 的 Logger API 了。  

輸出結果如下：  
*C:\Logs\MyWebsite\log4net-all_2017-12-31.log*  
```log
2017-12-31 00:56:46,673 [1] INFO Microsoft.AspNetCore.DataProtection.KeyManagement.XmlKeyManager - User profile is available. Using 'C:\Users\john.wu\AppData\Local\ASP.NET\DataProtection-Keys' as key repository and Windows DPAPI to encrypt keys at rest.
2017-12-31 00:56:47,167 [17] INFO Microsoft.AspNetCore.Hosting.Internal.WebHost - Request starting HTTP/1.1 GET http://localhost:5000/  
2017-12-31 00:56:47,261 [17] INFO Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker - Executing action method MyWebsite.HomeController.Index (MyWebsite) with arguments ((null)) - ModelState is Valid
2017-12-31 00:56:47,265 [17] INFO MyWebsite.HomeController - This information log from Home.Index()
2017-12-31 00:56:47,266 [17] WARN MyWebsite.HomeController - This warning log from Home.Index()
2017-12-31 00:56:47,268 [17] ERROR MyWebsite.HomeController - This error log from Home.Index()
2017-12-31 00:56:47,269 [17] FATAL MyWebsite.HomeController - This critical log from Home.Index()
2017-12-31 00:56:47,278 [17] INFO Microsoft.AspNetCore.Mvc.Internal.ObjectResultExecutor - Executing ObjectResult, writing value Microsoft.AspNetCore.Mvc.ControllerContext.
2017-12-31 00:56:47,303 [17] INFO Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker - Executed action MyWebsite.HomeController.Index (MyWebsite) in 52.7449ms
2017-12-31 00:56:47,305 [17] INFO Microsoft.AspNetCore.Hosting.Internal.WebHost - Request finished in 141.4295ms 200 text/plain; charset=utf-8
```

## 參考

[Introduction to Logging in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/?tabs=aspnetcore2x)  
[NLog - Getting started with ASP.NET Core 2](https://github.com/NLog/NLog.Web/wiki/Getting-started-with-ASP.NET-Core-2)  
[How to use Log4Net with ASP.NET Core for logging](https://dotnetthoughts.net/how-to-use-log4net-with-aspnetcore-for-logging/)  