---
title: '[鐵人賽 Day13] ASP.NET Core 2 系列 - NLog & Log4net 範例'
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

ASP.NET Core 提供的 Logging API，不僅可以方便調用 Logger，且支援多種 Log 輸出，把 Log 發送到多個地方，也支援第三方套件的 Logging Framework。  
本篇將介紹 ASP.NET Core 的 Logging 搭配第三方 Logging Framework 套件，**NLog** 及 **Log4net** 的範例。  

<!-- more -->

## NLog

NLog 是 .NET 的熱門 Logging Framework；而且還是 ASP.NET Core 官方第三方 Logging Framework 推薦名單之一。  

### 安裝套件

NLog 需要安裝 `NLog` 及 `NLog.Web.AspNetCore` 套件。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
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
*C:\Logs\MyWebsite\nlog-all_2018-01-01.log*  
```log
2018-01-01 00:27:32.6339||INFO|Microsoft.AspNetCore.DataProtection.KeyManagement.XmlKeyManager|User profile is available. Using 'C:\Users\john.wu\AppData\Local\ASP.NET\DataProtection-Keys' as key repository and Windows DPAPI to encrypt keys at rest. 
2018-01-01 00:27:33.1149||INFO|Microsoft.AspNetCore.Hosting.Internal.WebHost|Request starting HTTP/1.1 GET http://localhost:5000/   
2018-01-01 00:27:33.1969||INFO|Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker|Executing action method MyWebsite.HomeController.Index (MyWebsite) with arguments ((null)) - ModelState is Valid 
2018-01-01 00:27:33.1999||INFO|MyWebsite.HomeController|This information log from Home.Index() 
2018-01-01 00:27:33.1999||WARN|MyWebsite.HomeController|This warning log from Home.Index() 
2018-01-01 00:27:33.1999||ERROR|MyWebsite.HomeController|This error log from Home.Index() 
2018-01-01 00:27:33.1999||FATAL|MyWebsite.HomeController|This critical log from Home.Index() 
2018-01-01 00:27:33.2219||INFO|Microsoft.AspNetCore.Mvc.Internal.ObjectResultExecutor|Executing ObjectResult, writing value Microsoft.AspNetCore.Mvc.ControllerContext. 
2018-01-01 00:27:33.2459||INFO|Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker|Executed action MyWebsite.HomeController.Index (MyWebsite) in 56.8935ms 
2018-01-01 00:27:33.2519||INFO|Microsoft.AspNetCore.Hosting.Internal.WebHost|Request finished in 137.5115ms 200 text/plain; charset=utf-8 
```

> 安裝完套件後，加一個設定檔及兩行程式碼就完成，可說是非常的友善使用。

## Log4net

從網路上各方訊息看來，Log4net 應該是 .NET 最熱門的 Logging Framework，我個人也是習慣用 Log4net。  

### 安裝套件

Log4net 需要安裝 `log4net` 套件。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
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
但 Log4net 沒有實作 ASP.NET Core 的 Logging API，所以沒辦法透過 DI 的 ILogger 寫 Log4net 的 Log。  
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

將 `Log4netProvider` 註冊到 WebHost 的 `ConfigureLogging` 中。  
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
                .ConfigureLogging(logging => {
                    logging.AddProvider(new Log4netProvider("log4net.config"));
                })
                .UseStartup<Startup>()
                .Build();
        }
    }
}
```

如此一來，也能透過 ASP.NET Core 的 Logger API 寫出 Log4net 的 Log 了。  

輸出結果如下：  
*C:\Logs\MyWebsite\log4net-all_2018-01-01.log*  
```log
2018-01-01 00:56:46,673 [1] INFO Microsoft.AspNetCore.DataProtection.KeyManagement.XmlKeyManager - User profile is available. Using 'C:\Users\john.wu\AppData\Local\ASP.NET\DataProtection-Keys' as key repository and Windows DPAPI to encrypt keys at rest.
2018-01-01 00:56:47,167 [17] INFO Microsoft.AspNetCore.Hosting.Internal.WebHost - Request starting HTTP/1.1 GET http://localhost:5000/  
2018-01-01 00:56:47,261 [17] INFO Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker - Executing action method MyWebsite.HomeController.Index (MyWebsite) with arguments ((null)) - ModelState is Valid
2018-01-01 00:56:47,265 [17] INFO MyWebsite.HomeController - This information log from Home.Index()
2018-01-01 00:56:47,266 [17] WARN MyWebsite.HomeController - This warning log from Home.Index()
2018-01-01 00:56:47,268 [17] ERROR MyWebsite.HomeController - This error log from Home.Index()
2018-01-01 00:56:47,269 [17] FATAL MyWebsite.HomeController - This critical log from Home.Index()
2018-01-01 00:56:47,278 [17] INFO Microsoft.AspNetCore.Mvc.Internal.ObjectResultExecutor - Executing ObjectResult, writing value Microsoft.AspNetCore.Mvc.ControllerContext.
2018-01-01 00:56:47,303 [17] INFO Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker - Executed action MyWebsite.HomeController.Index (MyWebsite) in 52.7449ms
2018-01-01 00:56:47,305 [17] INFO Microsoft.AspNetCore.Hosting.Internal.WebHost - Request finished in 141.4295ms 200 text/plain; charset=utf-8
```

## 參考

[Introduction to Logging in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/?tabs=aspnetcore2x)  
[NLog - Getting started with ASP.NET Core 2](https://github.com/NLog/NLog.Web/wiki/Getting-started-with-ASP.NET-Core-2)  
[How to use Log4Net with ASP.NET Core for logging](https://dotnetthoughts.net/how-to-use-log4net-with-aspnetcore-for-logging/)  