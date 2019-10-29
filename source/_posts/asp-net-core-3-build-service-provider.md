---
title: 'ASP.NET Core 3 系列 - 自行建置 Service Provider'
author: John Wu
tags:
  - ASP.NET Core 3
  - ASP.NET Core
categories:
  - ASP.NET Core
date: 2019-10-29 22:44
featured_image: /images/b/50.png
---

一般情況 IHostBuilder 建置 Host 實例的時候，就會自動建置 Service Provider。  
所以大部份情境不需要自行建置 Service Provider，但如果想在 IHostBuilder 建置出 Host 實例之前取得 Service Provider，就可以用 **IServiceCollection** 的擴充方法 `BuildServiceProvider` 建置出 Service Provider。  
本篇將介紹 ASP.NET Core 如何透過 `BuildServiceProvider` 建置 Service Provider，以及要注意的地方。  

<!-- more -->

## 建置 Service Provider

通常會在 `Startup.ConfigureServices` 方法中，註冊 Services，待 Host 成立實體後，即可透過 Constructor Injection，提供 Services。  
Host 建立實體前，若要使用 Service Provider，就需要透過 **IServiceCollection** 的擴充方法 `BuildServiceProvider` 建置，範例如下：  

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            // 註冊 Services
            services.AddSingleton<ISampleSingleton, Sample>();

            // 建置 Service Provider
            var serviceProvider = services.BuildServiceProvider();

            // 從 Service Provider 取得服務使用
            var logger = serviceProvider.GetService<ILogger<Startup>>();
            var sample = serviceProvider.GetService<ISampleSingleton>();
            logger.LogInformation($"Type: {sample.GetType()}\r\n"
                                  + $"HashCode: {sample.GetHashCode()}\r\n"
                                  + $"Id: {sample.Id}");
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    "default",
                    "{controller=Home}/{action=Index}/{id?}"
                );
            });
        }
    }
}
```

## 注意事項

Host 實例使用的 Service Provider 與自行建立的 Service Provider 是完全不同的實體，而 `services.AddSingleton` 所註冊的 Services 僅在 Service Provider 實體中 **Singleton**，不同的 Service Provider 實體會各自存在自己的 Services。  

以上例來說，雖然 **Sample** 是使用 `AddSingleton` 註冊，但實際啟動時，會有兩個 **Sample** 的實體。圖如：  

![ASP.NET Core 3 系列 - 自行建置 Service Provider - 圖例](/images/b/51.png)  

實際運行上例程式碼，Log Output 的 Sample 實例 HashCode 與 Controller 注入的 Sample 實例 HashCode 並不一樣，表示這兩個式不同的實例，範例執行結果：  

![ASP.NET Core 3 系列 - 自行建置 Service Provider - 範例執行結果](/images/b/50.png)  

## 附註

Sample 類別的範例程式：  

```cs
public interface ISampleSingleton
{
    int Id { get; }
}

public class Sample : ISampleSingleton
{
    private static int _counter;
    private int _id;

    public Sample()
    {
        _id = ++_counter;
    }

    public int Id => _id;
}
```

範例 *Controllers\HomeController.cs*：  

```cs
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly ISample _singleton;

        public HomeController(ISampleSingleton singleton)
        {
            _singleton = singleton;
        }

        public string Index()
        {
            return $"Type: {_singleton.GetType()}\r\n"
                   + $"HashCode: {_singleton.GetHashCode()}\r\n"
                   + $"Id: {_singleton.Id}";
        }
    }
}
```
