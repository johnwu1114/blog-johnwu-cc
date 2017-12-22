---
title: '[鐵人賽 Day02] ASP.NET Core 2 系列 - 程式生命週期 (Application Lifetime)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-21 01:09
featured_image: /images/i02-1.png
---

要了解程式的運作原理，要先知道程式的進入點及生命週期。  
過往 ASP.NET MVC 啟動方式，是繼承 `HttpApplication` 做為網站開始的進入點。  
ASP.NET Core 改變了網站啟動的方式，變的比較像是 Console Application。  
本篇將介紹 ASP.NET Core 的程式生命週期 (Application Lifetime) 及補捉 Application 停啟事件。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day02] ASP.NET Core 2 系列 - 程式生命週期 (Application Lifetime)](https://ithelp.ithome.com.tw/articles/10192497)  
 
<!-- more -->

## 程式進入點

.NET Core 把 Web 及 Console 專案都變成一樣的啟動方式，預設從 *Program.cs* 的 `Program.Main` 做為程式進入點，再從程式進入點把 ASP.NET Core 網站實例化。  
我個人是覺得比 ASP.NET MVC 繼承 `HttpApplication` 的方式簡潔許多。  

透過 .NET Core CLI 建置的 *Program.cs* 內容大致如下：  
*Program.cs*  
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}
```
`Program.Main` 透過 BuildWebHost 方法取得 WebHost 後，再啟動 WebHost；WebHost 就是 ASP.NET Core 的網站實體。  

* **WebHost.CreateDefaultBuilder**  
 透過此方法建立 WebHost Builder。WebHost Builder 是用來產生 WebHost 的物件。  
 可以在 WebHost 產生之前設定一些**前置準備**動作，當 WebHost 建立完成時，就可以使用已準備好的物件等。  
* **UseStartup**  
 設定該 Builder 產生的 WebHost **啟動後**，要執行的類別。  
* **Build**  
 當前置準備都設定完成後，就可以跟 WebHost Builder 呼叫此方法實例化 WebHost，並得到該實例。  
* **Run**  
 啟動 WebHost。  

### Startup.cs

當網站啟動後，WebHost 會實例化 `UseStartup` 設定的 Startup 類別，並且呼叫以下兩個方法：  
* **ConfigureServices**  
* **Configure**  

透過 .NET Core CLI 建置的 *Startup.cs* 內容大致如下：  
*Startup.cs*
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // ...
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("Hello World!");
            });
        }
    }
}
```
* **ConfigureServices**  
 ConfigureServices 是用來將服務註冊到 DI 容器用的。這個方法可不實做，並不是必要的方法。  
 *(DI 之後的文章會介紹。)*  
* **Configure**  
 這是必要的方法，一定要時做。但 `Configure` 方法的參數並不固定，參數的實例都是從 WebHost 注入進來，可依需求增減需要的參數。  
 * **IApplicationBuilder** 是最重要的參數也是必要的參數，Request 進出的 Pipeline 都是透過 ApplicationBuilder 來設定。  
 *(Pipeline 之後的文章會介紹。)*  

對 WebHost 來說 *Startup.cs* 並不是必要存在的功能。  
可以試著把 *Startup.cs* 中的兩個方法，都改成在 WebHost Builder 設定，變成啟動的前置準備。如下：  

*Program.cs*  
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureServices(services =>
                {
                    // ...
                })
                .Configure(app =>
                {
                    app.Run(async (context) =>
                    {
                        await context.Response.WriteAsync("Hello World!");
                    });
                })
                .Build();
    }
}
```
把 `ConfigureServices` 及 `Configure` 都改到 WebHost Builder 註冊，網站的執行結果會是一樣的。  

兩者之間最大的差異就是呼叫時間點不同。  
* 在 WebHost Builder 註冊，是在 WebHost 實例化**之前**呼叫。  
* 在 *Startup.cs* 註冊，是在 WebHost 實例化**之後**呼叫。  

> 但 `Configure` 無法使用除了 `IApplicationBuilder` 以外的參數。  
 因為在 WebHost 實例化前，自己都還沒被實例化，怎麼可能會有物件能注入給 `Configure`。  

## Application Lifetime

除了程式進入點外，WebHost 的停起也是網站事件很重要一環，ASP.NET Core 不像 ASP.NET MVC 用繼承的方式補捉啟動及停止事件。
是透過 `Startup.Configure` 注入 `IApplicationLifetime` 來補捉 Application 停啟事件。  

`IApplicationLifetime` 有三個註冊監聽事件及終止網站事件可以觸發。如下：  
```cs
public interface IApplicationLifetime
{
	CancellationToken ApplicationStarted { get; }
	CancellationToken ApplicationStopping { get; }
	CancellationToken ApplicationStopped { get; }
	void StopApplication();
}
```
* **ApplicationStarted**  
 當 WebHost 啟動完成後，會執行的**啟動完成事件**。  
* **ApplicationStopping**  
 當 WebHost 觸發停止時，會執行的**準備停止事件**。  
* **ApplicationStopped**  
 當 WebHost 停止事件完成時，會執行的**停止完成事件**。  
* **StopApplication**  
 可以透過此方法主動觸發**終止網站**。  

> `IApplicationLifetime` 需要 `Microsoft.AspNetCore.Hosting` 套件。  
 不過 ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.Hosting`，所以不用再安裝。  
 如果是 ASP.NET Core 1.0 的版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.AspNetCore.Hosting
```

### 範例程式

透過 Console 輸出執行的過程，範例如下：  
*Program.cs*  
```cs
using System;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Output("Application - Start");
            var webHost = BuildWebHost(args);
            Output("Run WebHost");
            webHost.Run();
            Output("Application - End");
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            Output("Create WebHost Builder");
            var webHostBuilder = WebHost.CreateDefaultBuilder(args)
                .ConfigureServices(services =>
                {
                    Output("webHostBuilder.ConfigureServices - Called");
                })
                .Configure(app =>
                {
                    Output("webHostBuilder.Configure - Called");
                })
                .UseStartup<Startup>();

            Output("Build WebHost");
            var webHost = webHostBuilder.Build();

            return webHost;
        }

        public static void Output(string message)
        {
            Console.WriteLine($"[{DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss")}] {message}");
        }
    }
}
```

*Startup.cs*
```cs
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public Startup()
        {
            Program.Output("Startup Constructor - Called");
        }

        public void ConfigureServices(IServiceCollection services)
        {
            Program.Output("Startup.ConfigureServices - Called");
        }

        public void Configure(IApplicationBuilder app, IApplicationLifetime appLifetime)
        {
            appLifetime.ApplicationStarted.Register(() =>
            {
                Program.Output("ApplicationLifetime - Started");
            });

            appLifetime.ApplicationStopping.Register(() =>
            {
                Program.Output("ApplicationLifetime - Stopping");
            });

            appLifetime.ApplicationStopped.Register(() =>
            {
                Thread.Sleep(5 * 1000);
                Program.Output("ApplicationLifetime - Stopped");
            });

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("Hello World!");
            });

            // For trigger stop WebHost
            var thread = new Thread(new ThreadStart(() =>
            {
                Thread.Sleep(5 * 1000);
                Program.Output("Trigger stop WebHost");
                appLifetime.StopApplication();
            }));
            thread.Start();

            Program.Output("Startup.Configure - Called");
        }
    }
}
```

### 執行結果

![[鐵人賽 Day02] ASP.NET Core 2 系列 - 程式生命週期 (Application Lifetime) - 執行結果](/images/i02-1.png)

> 輸出內容少了 **webHostBuilder.Configure - Called**，因為 `Configure` 只能有一個，後註冊的 `Configure` 會把之前註冊的蓋掉。  

物件執行流程如下：  

![[鐵人賽 Day02] ASP.NET Core 2 系列 - 程式生命週期 (Application Lifetime) - 物件執行流程](/images/i02-2.png)

## 參考

[Application startup in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup)  
[Hosting in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/hosting?tabs=aspnetcore2x)  