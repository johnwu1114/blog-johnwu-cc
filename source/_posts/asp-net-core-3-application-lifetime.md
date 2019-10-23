---
title: 'ASP.NET Core 3 系列 - 程式生命週期 (Application Lifetime)'
author: John Wu
tags:
  - ASP.NET Core
  - ASP.NET Core 3
categories:
  - ASP.NET Core
date: 2019-10-24 01:42
featured_image: /images/b/48.png
---

要了解程式的運作原理，要先知道程式的進入點及生命週期。  
過往 ASP.NET MVC 啟動方式，是繼承 `HttpApplication` 做為網站開始的進入點。  
ASP.NET Core 改變了網站啟動的方式，是用 Console Application 的方式，Host Kestrel，提供 HTTP 的服務。  
本篇將介紹 ASP.NET Core 3 的程式生命週期 (Application Lifetime) 及補捉 Application 停啟事件。  

<!-- more -->

## 程式進入點

.NET Core 把 Web 及 Console 專案都變成一樣的啟動方式，預設從 *Program.cs* 的 `Main()` 做為程式進入點，再從程式進入點把 Kestrel 實例化。  

透過 .NET Core CLI 建置的 *Program.cs* 內容大致如下：  

```cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
```

`Main()` 透過 CreateHostBuilder 方法宣告需要相依的相關服務，並設定 WebHost 啟動後要執行 `Startup` 類別。  

* **CreateHostBuilder**  
 透過此方法宣告相依的服務及組態設定等，其中包含 WebHost。  
 可以在 Host 產生之前設定一些**前置準備**動作，當 Host 建立完成時，就可以使用已準備好的物件等。  
* **UseStartup**  
 設定 WebHostBuilder 產生的 WebHost 時，所要執行的類別。  
* **Build**  
 當前置準備都設定完成後，就可以呼叫此方法實例化 Host，同時也會實例化 WebHost。  
* **Run**  
 啟動 Host。  

> .NET Core 3.0 官方建議的方式是透過 Generic Host 建立 Web Host。  
> 但如果真的不想透過 Generic Host 建立 Web Host，可改成以下方式：  

```cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var hostBuilder = CreateHostBuilder(args);
            var host = hostBuilder.Build();
            host.Run();
        }

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
    }
}
```

### Startup.cs

Host 建置時，WebHost 會呼叫 `UseStartup` 泛型類別的 **ConfigureServices** 方法。  
Host 啟動後，WebHost 會呼叫 `UseStartup` 泛型類別的 **Configure** 方法。  

透過 .NET Core CLI 建置的 *Startup.cs* 內容大致如下：  

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // 註冊 Services ...
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("Hello World!");
                });
            });
        }
    }
}
```

* **ConfigureServices**  
 ConfigureServices 是用來將服務註冊到 DI 容器用的。這個方法可不實做，並不是必要的方法。  
 *(DI 可以參考這篇：[[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入 (Dependency Injection)](/article/ironman-day04-asp-net-core-dependency-injection.html)。)*  
* **Configure**  
 這是必要的方法，一定要時做。但 `Configure` 方法的參數並不固定，參數的實例都是從 WebHost 注入進來，可依需求增減需要的參數。  
 * **IApplicationBuilder** 是最重要的參數也是必要的參數，Request 進出的 Pipeline 都是透過 ApplicationBuilder 來設定。  
   *(Pipeline 可以參考這篇：[[鐵人賽 Day03] ASP.NET Core 2 系列 - Middleware](/article/ironman-day03-asp-net-core-middleware.html)。)*  

對 WebHost 來說 *Startup.cs* 並不是必要存在的功能。  
可以試著把 *Startup.cs* 中的兩個方法，都改成在 WebHost Builder 設定，變成啟動的前置準備。*Program.cs* 如下：  

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var hostBuilder = CreateHostBuilder(args);
            var host = hostBuilder.Build();
            host.Run();
        }

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureServices(services =>
                {
                    // Generic Host 註冊 Services ...
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                        .ConfigureServices(services =>
                        {
                            // Web Host 註冊 Services ...
                        })
                        .Configure(app =>
                        {
                            app.UseRouting();
                            app.UseEndpoints(endpoints =>
                            {
                                endpoints.MapGet("/",
                                    async context => {
                                        await context.Response.WriteAsync("Hello World!");
                                    });
                            });
                        });
                });
    }
}
```

把 `ConfigureServices` 及 `Configure` 都改到 WebHost Builder 註冊，網站的執行結果會是一樣的。  
若是透過 Generic Host 建立 Web Host，也可以在 HostBuilder 用 `ConfigureServices` 註冊 Services。  

## Application Lifetime

除了程式進入點外，WebHost 的停起也是網站事件很重要一環，ASP.NET Core 不像 ASP.NET MVC 用繼承的方式補捉啟動及停止事件。
而是透過 `IHostApplicationLifetime` 來補捉 WebHost 的停啟事件。  

`IHostApplicationLifetime` 有三個註冊監聽事件及終止網站事件可以觸發。如下：  

```cs
public interface IHostApplicationLifetime
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

### 範例程式

透過 Console 輸出執行的過程，*Program.cs* 範例如下：  

```cs
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Output("[Program] Start");

            Output("[Program] Create HostBuilder");
            var hostBuilder = CreateHostBuilder(args);

            Output("[Program] Build Host");
            var host = hostBuilder.Build();

            Output("[Program] Run Host");
            host.Run();

            Output("[Program] End");
        }

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureServices(service => {
                    Output("[Program] hostBuilder.ConfigureServices - Called");
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                        .ConfigureServices(services => {
                            Output("[Program] webBuilder.ConfigureServices - Called");
                        })
                        .Configure(app => {
                            Output("[Program] webBuilder.Configure - Called");
                        })
                        .UseStartup<Startup>();
                });

        public static void Output(string message)
        {
            Console.WriteLine($"[{DateTime.Now:yyyy/MM/dd HH:mm:ss}] {message}");
        }
    }
}
```

*Startup.cs*：  

```cs
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MyWebsite
{
    public class Startup
    {
        public Startup()
        {
            Program.Output("[Startup] Constructor - Called");
        }

        public void ConfigureServices(IServiceCollection services)
        {
            Program.Output("[Startup] ConfigureServices - Called");
        }

        public void Configure(IApplicationBuilder app, IHostApplicationLifetime appLifetime)
        {
            appLifetime.ApplicationStarted.Register(() =>
            {
                Program.Output("[Startup] ApplicationLifetime - Started");
            });

            appLifetime.ApplicationStopping.Register(() =>
            {
                Program.Output("[Startup] ApplicationLifetime - Stopping");
            });

            appLifetime.ApplicationStopped.Register(() =>
            {
                Thread.Sleep(5 * 1000);
                Program.Output("[Startup] ApplicationLifetime - Stopped");
            });

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/", async context => { await context.Response.WriteAsync("Hello World!"); });
            });

            // For trigger stop WebHost
            var thread = new Thread(() =>
            {
                Thread.Sleep(5 * 1000);
                Program.Output("[Startup] Trigger stop WebHost");
                appLifetime.StopApplication();
            });
            thread.Start();

            Program.Output("[Startup] Configure - Called");
        }
    }
}
```

### 執行結果

```log
[2019/10/24 01:24:59] [Program] Start
[2019/10/24 01:24:59] [Program] Create HostBuilder
[2019/10/24 01:24:59] [Program] Build Host
[2019/10/24 01:24:59] [Program] hostBuilder.ConfigureServices - Called
[2019/10/24 01:24:59] [Program] webBuilder.ConfigureServices - Called
[2019/10/24 01:24:59] [Startup] Constructor - Called
[2019/10/24 01:24:59] [Startup] ConfigureServices - Called
[2019/10/24 01:25:00] [Program] Run Host
[2019/10/24 01:25:00] [Startup] Configure - Called
[2019/10/24 01:25:00] [Startup] ApplicationLifetime - Started
[2019/10/24 01:25:05] [Startup] Trigger stop WebHost
[2019/10/24 01:25:05] [Startup] ApplicationLifetime - Stopping
[2019/10/24 01:25:10] [Startup] ApplicationLifetime - Stopped
[2019/10/24 01:25:10] [Program] End
```

> 輸出內容少了 **[Program] webBuilder.Configure - Called**，因為 `Configure` 只能有一個，後註冊的 `Configure` 會把之前註冊的蓋掉。  

執行流程如下：  

![ASP.NET Core 3 系列 - 程式生命週期 (Application Lifetime) - 範例程式執行流程](/images/b/48.png)

## 參考

* [Application startup in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup)  
* [Hosting in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/hosting?tabs=aspnetcore2x)  
