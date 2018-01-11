---
title: '[鐵人賽 Day20] ASP.NET Core 2 系列 - 快取機制及 Redis Session'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - Redis
  - Session
  - Cache
categories:
  - ASP.NET Core
date: 2018-01-08 12:00
featured_image: /images/i20-1.png
---

為了程式效率，通常會利用記憶體存取速度遠高於磁碟讀取的特性，把常用但不常變動資料放在記憶體中，提升取用資料的速度。ASP.NET Core 有提供好用的快取機制，不用自己實作控制資料的快取物件。  
本篇將介紹 ASP.NET Core 的本機快取及分散式快取，並用使用分散式快取實作 Redis Session，避免 Web Application 重啟後，用戶要重新登入。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
> [[Day20] ASP.NET Core 2 系列 - 快取機制及 Redis Session](https://ithelp.ithome.com.tw/articles/10196001)  

<!-- more -->

## 本機快取

本機快取是比較基本的資料快取方式，將資料存在 Web Application 的記憶體中。  
如果是單一站台架構，沒有要同步快取資料，用本機快取應該都能滿足需求。  

使用本機快取的方式很簡單，只要在 `Startup.ConfigureServices` 呼叫 `AddMemoryCache`，就能透過注入 `IMemoryCache` 使用本機快取。如下：

*Startup.cs*  
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMemoryCache();
        // ...
    }
    //...
}
```

*Controllers\HomeController.cs*
```cs
using Microsoft.Extensions.Caching.Memory;
//...
public class HomeController : Controller
{
    private static IMemoryCache _memoryCache;

    public HomeController(IMemoryCache memoryCache)
    {
        _memoryCache = memoryCache;
    }

    public IActionResult Index()
    {
        _memoryCache.Set("Sample", new UserModel()
        {
            Id = 1,
            Name = "John"
        });
        var model = _memoryCache.Get<UserModel>("Sample");
        return View(model);
    }
}
```

用 `Get`/`Set` 方法，就可以透過 **Key** 做為取值的識別，存放任何型別的資料。  

## 分散式快取

當 ASP.NET Core 網站有橫向擴充，架設多個站台需求時，分散式快取就是一個很好的同步快取資料解決方案。  
基本上就是 NoSQL 的概念，把分散式快取的資料位置，指向外部的儲存空間，如：SQL Server、Redis 等等。只要繼承 `IDistributedCache`，就可以被當作分散式快取的服務使用。  

本機快取及分散式快取架構，如圖：  

![[鐵人賽 Day20] ASP.NET Core 2 系列 - 快取機制及 Redis Session - 本機快取及分散式快取架構](/images/i20-1.png)  

在 `Startup.ConfigureServices` 注入 `IDistributedCache` 使用分散式快取。如下：

*Startup.cs*  
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddDistributedMemoryCache();
        // ...
    }
    //...
}
```
* **AddDistributedMemoryCache**  
  是透過實作分散式快取的介面 `IDistributedCache`，將資料存於本機記憶體中。

*Controllers\HomeController.cs*
```cs
using Microsoft.Extensions.Caching.Distributed;
//...
public class HomeController : Controller
{
    private static IDistributedCache _distributedCache;

    public HomeController(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public IActionResult Index()
    {
        _distributedCache.Set("Sample", ObjectToByteArray(new UserModel()
        {
            Id = 1,
            Name = "John"
        }));
        var model = ByteArrayToObject<UserModel>(_distributedCache.Get("Sample"));
        return View(model);
    }

    private byte[] ObjectToByteArray(object obj)
    {
        var binaryFormatter = new BinaryFormatter();
        using (var memoryStream = new MemoryStream())
        {
            binaryFormatter.Serialize(memoryStream, obj);
            return memoryStream.ToArray();
        }
    }

    private T ByteArrayToObject<T>(byte[] bytes)
    {
        using (var memoryStream = new MemoryStream())
        {
            var binaryFormatter = new BinaryFormatter();
            memoryStream.Write(bytes, 0, bytes.Length);
            memoryStream.Seek(0, SeekOrigin.Begin);
            var obj = binaryFormatter.Deserialize(memoryStream);
            return (T)obj;
        }
    }
}
```
`IDistributedCache` 的 `Get`/`Set` 不像 `IMemoryCache` 可以存取任意型別，`IDistributedCache` 的 `Get`/`Set` 只能存取 `byte[]` 型別，如果要將物件存入分散式快取，就必須將物件轉換成 `byte[]` 型別，或轉成字串型別用 `GetString`/`SetString` 存取於分散式快取。  
> 如果要將物件透過 `MemoryStream` 序列化，記得在物件加上 `[Serializable]`。  

## Redis Session

[[鐵人賽 Day11] ASP.NET Core 2 系列 - Cookies & Session](/article/ironman-day11-asp-net-core-cookies-session.html) 有用到 `AddDistributedMemoryCache`，由於 Session 的儲存位置是依賴分散式快取，但沒有外部分散式快取可用，所以用繼承 `IDistributedCache` 的本機分散式快取頂著。  

### 安裝套件  

如果要在 ASP.NET Core 中使用的 Redis Cache，可以安裝 Microsoft 提供的套件 `Microsoft.Extensions.Caching.Redis.Core`。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.Extensions.Caching.Redis.Core
```

### 設定 Redis Cache

安裝完成後，將 `Startup.ConfigureServices` 註冊的分散式快取服務，從 `AddDistributedMemoryCache` 改成 `AddDistributedRedisCache`。如下：

*Startup.cs*  
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        //services.AddDistributedMemoryCache();
        services.AddDistributedRedisCache(options =>
            {
                // Redis Server 的 IP 跟 Port
                options.Configuration = "192.168.99.100:6379";
            });
        // ...
    }
    //...
}
```
這樣就完成將分散式快取指向 Redis Cache，Session 的註冊方式同 **[Day11]**。  
只要設定 `AddDistributedRedisCache` 就可以使用 Redis Session 了，輕鬆簡單。 

### ASP.NET MVC 比較

ASP.NET Core 的 Redis Session 跟 ASP.NET MVC 普遍用的 `StackExchange.Redis` 的運行方式有很大的差異。  

* **ASP.NET MVC Redis Session**  
 `StackExchange.Redis` 在使用 Redis 時，是把 Website 的 Session 備份到 Redis，讀取還是在 Website 的記憶體，寫入的話會再度備份到 Redis。  
 也就是說 Session 會存在於 Website 及 Redis Cache 中，HA 的概念。  
 可以試著把 Redis Cache 中 Session 清掉，當使用者下一個 Requset 來的時候，又會重新出現在  Redis Cache 中。  
 運行方式如下圖：  
 ![[鐵人賽 Day20] ASP.NET Core 2 系列 - 快取機制及 Redis Session - ASP.NET MVC - Redis Session 運行方式](/images/pasted-112.gif)

* **ASP.NET Core Redis Session**  
 `IDistributedCache` 運做方式變成 Session 直接在 Redis Cache 存取，如果把 Redis Cache 中 Session 清掉，當使用者下一個 Requset 來的時候，就會發現 Session 被清空了。  
 運行方式如下圖：  
 ![[鐵人賽 Day20] ASP.NET Core 2 系列 - 快取機制及 Redis Session - ASP.NET Core - Redis Session 運行方式](/images/pasted-113.gif)

## 參考

[In-memory caching in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/memory)  
[Working with a distributed cache in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/distributed)  