---
title: ASP.NET Core 範例 - 跨專案 DI
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
categories:
  - ASP.NET Core
date: 2017-07-11 11:07:00
featured_image: /images/logo-asp-net-core.png
---
![ASP.NET Core 範例 - 跨專案 DI](/images/logo-asp-net-core.png)

先前介紹過 ASP.NET Core 的 Dependency Injection，後來有人問我如何再不同專案使用 DI。  
例如：BLL (Business Logic Layer)、DAL(Data Access Layer) 抽出到其他專案。如何在 BLL 中使用 DAL。  
因此本篇將介紹 ASP.NET Core 的跨專案 DI。  

<!-- more -->

## 架構

此篇範例我建立個四的專案，相依關係如下：
![ASP.NET Core 範例 - 跨專案 DI - 架構](/images/pasted-236.png)
1. Entities：存放資料交換的物件。DLL 類別庫專案。  
2. DAL：資料存取層，用來跟資料庫溝通。DLL 類別庫專案。  
3. BLL：商業邏輯層，用來管理商業邏輯，扮演 DAL 及 Website 溝通的橋梁。DLL 類別庫專案。  
4. MyWebsite：ASP.NET Core 網站專案。  

## 1. MyWebsite DI BLL

在 BLL 專案中，我建立一個 MemberBLL 類別，程式碼如下：
```cs
public interface IMemberBLL
{
    void Register(Member member);
}

public class MemberBLL : IMemberBLL
{
    public void Register(Member member)
    {
        // Do something...
    }
}
```

要在 MyWebsite 當中把 MemberBLL 注入到 Service，只要在專案相依參考 BLL 專案，就可以在 Startup 註冊 MemberBLL。如下：  
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.AddTransient<IMemberBLL, MemberBLL>();
    }
}
```

在 Controller 注入 MemberBLL：
```cs
[Route("api/[controller]")]
public class MemberController : Controller
{
    private readonly IMemberBLL _memberBLL;

    public MemberController(IMemberBLL memberBLL)
    {
        _memberBLL = memberBLL;
    }

    [HttpPost]
    [Route("registration")]
    public void Registration([FromBody]Member member)
    {
        _memberBLL.Register(member);
        Response.WriteAsync("Register Member");
    }
}
```

## 2. BLL DI DAL

假設 MemberBLL 需要存取資料庫，在職責分離的清況下，我們需要透過 DAL 跟資料庫溝通。  
我在 DAL 專案建立一個 MemberDAL 類別，程式碼如下：
```cs
public interface IMemberDAL
{
    void CreateMember(Member member);
}

public class MemberDAL : IMemberDAL
{
    public void CreateMember(Member member)
    {
        // Do something...
    }
}
```

在 MyWebsite 專案中，把 MemberDAL 注入到 Service。如下：  
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.AddTransient<IMemberBLL, MemberBLL>();
        services.AddTransient<IMemberDAL, MemberDAL>();
    }
}
```

在 MemberBLL 的建構子注入 IMemberDAL，如下：
```cs
public class MemberBLL : IMemberBLL
{
    private IMemberDAL _memberDAL;

    public MemberBLL(IMemberDAL memberDAL)
    {
        _memberDAL = memberDAL;
    }

    public void Register(Member member)
    {
        // Do something...
        _memberDAL.CreateMember(member);
    }
}
```

## 3. DAL DI Config

DAL 跟資料庫建立連線，因此會需要用到資料庫連線字串，通常我們會把資料庫連線字串寫在 Config。  
首先在 MyWebsite 專案建立 Config。  
Configuration\Settings.json
```json
{
  "DbConnection": "Data Source=xxx.xxx.xxx.xxx;Initial Catalog=xxx;User ID=xxx;Password=xxx;"
}
```

在 MyWebsite 專案的 Startup 載入 Config 並註冊至 Service：
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.AddTransient<IMemberBLL, MemberBLL>();
        services.AddTransient<IMemberDAL, MemberDAL>();
        services.AddSingleton(GetSettings());
    }

    private IConfigurationRoot GetSettings()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "Configuration"))
            .AddJsonFile(path: "Settings.json", optional: true, reloadOnChange: true);
        return builder.Build();
    }
}
```

在 MemberDAL 的建構子注入 Config，由於 DAL 會跟資料庫連線，為了方便每次使用完畢就釋放資料庫連線資源，我用一個父類別實做 IDisposable 專們釋放資源。如下：
```cs
public abstract class AbstractBaseDAL : IDisposable
{
    protected readonly string _dbConnectionString;

    public AbstractBaseDAL(IConfigurationRoot config)
    {
        _dbConnectionString = config["DbConnection"];
        // Connect to Database...
    }

    public void Dispose()
    {
        // Disconnect from Database...
    }
}

public class MemberDAL : AbstractBaseDAL, IMemberDAL
{
    public MemberDAL(IConfigurationRoot config) : base(config)
    {
    }

    public void CreateMember(Member member)
    {
        // Do something...
    }
}
```

## 後記

雖然是不同專案，但只要是透過 Service 或 Request 建立的實體，都可以使用 Constructor Injection 的方式注入。  
白話一點講就是：  
**如果要使用DI，就不要自己使用`new`來建立實體**  
**如果要使用DI，就不要自己使用`new`來建立實體**  
**如果要使用DI，就不要自己使用`new`來建立實體**  
> 很重要，所以重複三次

上述範例註冊到 Service 的方式有兩種 Singleton 及 Transient。  
```cs
public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddTransient<IMemberBLL, MemberBLL>();
    services.AddTransient<IMemberDAL, MemberDAL>();
    services.AddSingleton(GetSettings());
}
```
* Config 使用 Singleton 是因為程式起動後，不管建立幾個實例，讀的 Config 檔都會是同一份，所以建立一份共用就好。  
* BLL 及 DAL 使用 Transient 是因為要讓資源使用完畢後自動被釋放。  

> 有的人會認為 BLL 是邏輯層，應該要使用 Singleton，因為邏輯不會變。  

這個論述是對的，但是如果 BLL 改成 Singleton，DAL 會在 BLL 實例化的同時就被注入進來，BLL 釋放前 DAL 都不會被釋放。意味著 DAL 的資料庫連線建立後就不會被中斷。  
因此，要把 BLL 改成 Singleton 的話，DAL 就不能使用實做 IDisposable 的方式釋放連限資源。  

## 程式碼下載

[asp-net-core-cross-projects-di](https://github.com/johnwu1114/asp-net-core-cross-projects-di)

## 相關文章

[ASP.NET Core 教學 - Dependency Injection](/article/asp-net-core-dependency-injection.html)  
[ASP.NET Core 教學 - 自訂組態設定檔](/article/asp-net-core-configuration.html)