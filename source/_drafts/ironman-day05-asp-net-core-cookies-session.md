---
title: '[鐵人賽 Day05] ASP.NET Core 2 系列 - Cookies & Session'
author: John Wu
tags:
  - ASP.NET Core
  - 2018 iT 邦幫忙鐵人賽
  - Cookies
  - Session
categories:
  - ASP.NET Core
date: 2017-12-24 23:17
featured_image: /images/i05-01.png
---

基本上 HTTP 是沒有紀錄狀態的協定，但可以透過 Cookies 及 Session 將 Request 來源區分出來，並將部分資料暫存於 Cookies 及 Session，是寫網站常用的用戶資料暫存方式。  
本篇將介紹如何在 ASP.NET Core 使用 Cookie 及 Session。  

<!-- more -->

## Cookies

Cookies 是將用戶資料存在 Client 的瀏覽器，每次 Request 都會把 Cookies 送到 Server。  
在 ASP.NET Core 中要使用 Cookie，可以透過 `HttpContext.Request` 及 `HttpContext.Response` 存取：  
*Startup.cs*  
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void Configure(IApplicationBuilder app)
        {
            app.Run(async (context) =>
            {
                string message;

                if (!context.Request.Cookies.TryGetValue("Sample", out message))
                {
                    message = "Save data to cookies.";
                }
                context.Response.Cookies.Append("Sample", "This is Cookies.");
                // 刪除 Cookies 資料
                //context.Response.Cookies.Delete("Sample");

                await context.Response.WriteAsync($"{message}");
            });
        }
    }
}
```
從 HTTP 可以看到傳送跟收到的 Cookies 資訊：  

![ASP.NET Core 2 系列 - Cookies](/images/i05-01.png)  

> 當用多資料存在 Cookies 時，封包就會越大，因為每個 Request 都會帶著 Cookies 資訊。  

## Session

Session 是透過 Cookies 內的唯一識別資訊，把用戶資料存在 Server 端記憶體、NoSQL 或資料庫等。  
要在 ASP.NET Core 使用 Session 需要先加入兩個服務：  
* **Session 容器**  
 Session 可以存在不同的地方，透過 DI 繼承 `IDistributedCache` 的物件，讓 Session 服務知道要將 Session 存在哪邊。  
* **Session 服務**
 要使用 Session 的服務物件。並將 Session 的 Middleware 加入 Pipeline。  

*Startup.cs*  
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // 將 Session 存在 ASP.NET Core 記憶體中
            services.AddDistributedMemoryCache();
            services.AddSession();
        }

        public void Configure(IApplicationBuilder app)
        {
            // SessionMiddleware 加入 Pipeline
            app.UseSession();

            app.Run(async (context) =>
            {
                context.Session.SetString("Sample", "This is Session.");
                string message = context.Session.GetString("Sample");
                await context.Response.WriteAsync($"{message}");
            });
        }
    }
}
```

HTTP Cookies 資訊如下：  
![ASP.NET Core 2 系列 - Session](/images/i05-02.png)  

可以看到多出了 `.AspNetCore.Session`，`.AspNetCore.Session` 就是 Session 的唯一識別資訊。  
每次 Request 時都會帶上這個值，當 Session 服務取得這個值後，就會去 Session 容器找出專屬這個值的 Session 資料。  

### 物件型別

以前 ASP.NET 可以將物件型別直接存放到 Session，現在 ASP.NET Core Session 不再自動序列化物件到 Sesson。  
如果要存放物件型態到 Session 就要自己序列化了，這邊以 JSON 格式作為範例：  
*Extensions\SessionExtensions.cs*
```cs
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace MyWebsite.Extensions
{
    public static class SessionExtensions
    {
        public static void SetObject<T>(this ISession session, string key, T value)
        {
            session.SetString(key, JsonConvert.SerializeObject(value));
        }

        public static T GetObject<T>(this ISession session, string key)
        {
            var value = session.GetString(key);
            return value == null ? default(T) : JsonConvert.DeserializeObject<T>(value);
        }
    }
}
```

將物件存取至 Session 就可以直接使用擴充方法，如下：  
```cs
using MyWebsite.Extensions;
// ...
var user = context.Session.GetObject<UserModel>("user");
context.Session.SetObject("user", user);
```

### 安全性

雖然 Session 資料都存在 Server 端看似安全，但如果封包被攔截，只要拿到 `.AspNetCore.Session` 就可以取到該用戶資訊，也是有風險。  
有些安全調整建議實作：  
* **SecurePolicy**  
 限制只有在 HTTPS 連線的情況下，才允許使用 Session。如此一來變成加密連線，就不容易被攔截。  
* **IdleTimeout**  
 合理的 Session 到期時間。預設是 20 分鐘沒有跟 Server 互動的 Request 就會將 Session 設為過期。  
 (20分鐘有點長，不過還是要看產品需求。)  
* **Name**  
 沒必要將 Server 或網站技術的資訊爆露在外面，所以預設 Session 名稱 `.AspNetCore.Session` 可以改掉。  

```cs
// ...
public void ConfigureServices(IServiceCollection services)
{
    services.AddDistributedMemoryCache();
    services.AddSession(options =>
    {
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.Name = "mywebsite";
        options.IdleTimeout = TimeSpan.FromMinutes(5);
    });
}
```

## 強型別

由於 Cookies 及 Session 預設都是使用字串的方式存取資料，弱型別無法在開發階段判斷有沒有打錯字，還是建議包裝成強行別比較好。  
而且直接存取 Cookies/Session 的話邏輯相依性太強，對單元測試很不友善，所以還是建議包裝一下。  

*Wappers\SessionWapper.cs*
```cs
using Microsoft.AspNetCore.Http;
using MyWebsite.Extensions;
// ...

public interface ISessionWapper
{
    UserModel User { get; set; }
}

public class SessionWapper : ISessionWapper
{
    private static readonly string _userKey = "session.user";
    private readonly IHttpContextAccessor _httpContextAccessor;

    public SessionWapper(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ISession Session
    {
        get
        {
            return _httpContextAccessor.HttpContext.Session;
        }
    }

    public UserModel User
    {
        get
        {
            return Session.GetObject<UserModel>(_userKey);
        }
        set
        {
            Session.SetObject(_userKey, value);
        }
    }
}
```

在 DI 容器中加入 `IHttpContextAccessor` 及 `ISessionWapper`，如下：  
*Startup.cs*
```cs
// ...
public void ConfigureServices(IServiceCollection services)
{
    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
    services.AddSingleton<ISessionWapper, SessionWapper>();
}
```
* **IHttpContextAccessor**  
 ASP.NET Core 實作了 `IHttpContextAccessor`，讓 `HttpContext` 可以輕鬆的注入給需要用到的物件使用。  
 由於 `IHttpContextAccessor` 只是取得 `HttpContext` 的接口，所以用 **Singleton** 的方式就可以供其它物件使用。  

在 Controller 就可以直接注入 `ISessionWapper`，以強行別的方式存取 Session，如下：  
*Controllers/HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
using MyWebsite.Wappers;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        private readonly ISessionWapper _sessionWapper;

        public HomeController(ISessionWapper sessionWapper)
        {
            _sessionWapper = sessionWapper;
        }

        public IActionResult Index()
        {
            var user = _sessionWapper.User;
            _sessionWapper.User = user;
            return Ok(user);
        }
    }
}
```

## 參考

[Introduction to session and application state in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/app-state?tabs=aspnetcore2x)  