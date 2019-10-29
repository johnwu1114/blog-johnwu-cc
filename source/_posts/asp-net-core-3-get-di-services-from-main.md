---
title: 'ASP.NET Core 3 系列 - 程式進入點 Main 方法取得 DI 註冊的 Services'
author: John Wu
tags:
  - ASP.NET Core 3
  - ASP.NET Core
categories:
  - ASP.NET Core
date: 2019-10-28 23:47
featured_image: /images/featured/asp-net-core.png
---

大多數情況使用 ASP.NET Core 依賴注入 (Dependency Injection, DI) 取得 Services 都是透過 Request 的 Controller 建構子而來，但在程式進入點 Main 方法中，並沒有 Constructor Injection。  
本篇將介紹如何在程式進入點 Main 方法取得 ASP.NET Core 依賴注入的服務。  

<!-- more -->

## HostBuilder

在 ASP.NET Core 的起手式，都會透過靜態類別 `Host` 或 `WebHost` 建立 *HostBuilder*，再透過 *HostBuilder* 建置出 *Host* 的實例，如下：  

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
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                        .UseStartup<Startup>();
                });
    }
}
```

在 *HostBuilder* 建置出 *Host* 的實例之前，需要透過 `ConfigureServices` 先宣告 DI Services，當 *HostBuilder* 建置出 *Host* 實例時，就會依照 `ConfigureServices` 註冊的配置告知 Service Provider，讓 Service Provider 可以提供請求者 Services。  
而 Service Provider 的實例會一直存在 *Host* 的實例之中。  

## 取用 Service Provider

為了方便說明，用之前[ASP.NET Core 3 系列 - 依賴注入 (Dependency Injection)](/article/asp-net-core-3-dependency-injection.html) 的 Sample 類別當作範例：  

```cs
public interface ISample
{
    int Id { get; }
}

public interface ISampleTransient : ISample
{
}

public interface ISampleScoped : ISample
{
}

public interface ISampleSingleton : ISample
{
}

public class Sample : ISampleTransient, ISampleScoped, ISampleSingleton
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

在 `Main` 方法 *HostBuilder* 建置出的 *Host* 實例，再從 Service Provider 中獲取需要的服務。  

**Singleton** 及 **Transient** 類型的服務，都可以直接透過 Service Provider 取出，但 **Scoped** 類型的服務，必須先建立出 Service Scope，才可以在該 Scope 內的 Service Provider 中取出服務。  
範例如下：  

```cs
public class Program
{
    public static void Main(string[] args)
    {
        var hostBuilder = CreateHostBuilder(args);
        var host = hostBuilder.Build();

        var singleton = host.Services.GetService<ISampleSingleton>();
        var transient = host.Services.GetService<ISampleTransient>();

        using (var scope = host.Services.CreateScope())
        {
            var scoped = scope.ServiceProvider.GetService<ISampleScoped>();
        }

        host.Run();
    }
}
```

## 參考

* [Introduction to Dependency Injection in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection)  
