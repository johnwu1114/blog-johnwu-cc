---
title: ASP.NET Core 教學 - 強制 SSL
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - SSL
  - HTTPS
  - Security
categories:
  - ASP.NET Core
date: 2017-06-01 08:56:00
featured_image: /images/a/161.png
---
![ASP.NET Core 教學 - 強制 SSL](/images/a/161.png)

網站安全性越做越高，不免都要使用 HTTPS 加密連線，但本機用 localhost 都是 HTTP，想測試 HTTPS 需要額外的設定。  
本篇將介紹 ASP.NET Core 強制使用 SSL 加密連線。  

<!-- more -->

## 啟用 SSL

可以再 Web 專案點滑鼠右鍵，用圖形化的工具啟用 SSL Port，如下：  
![ASP.NET Core 教學 - Launch Settings](/images/a/158.png)

或直接編輯 Properties\launchSettings.json  
```json
{
  "iisSettings": {
    "windowsAuthentication": false,
    "anonymousAuthentication": true,
    "iisExpress": {
      "applicationUrl": "http://localhost:33333/",
      "sslPort": 44333
    }
  },
  "profiles": {
    "IIS Express": {
      "commandName": "IISExpress",
      "launchBrowser": true
    }
  }
}
```

設定 SSL Port 後，就可以在 localhost 使用 HTTPS 了。但會遇到隱私權問題，因為我們沒有真的匯入憑證，可以先把它忽略。步驟如下：  
![ASP.NET Core 教學 - 忽略憑證 - 1](/images/a/159.png)
![ASP.NET Core 教學 - 忽略憑證 - 2](/images/a/160.png)

## 強制 SSL

只有單純啟動 SSL Port 的話，依然可以使用 HTTP，只要自己更改網址列就可以。強制走 HTTPS 的話還要經過以下設定。 

先安裝兩個套件：  
1. Microsoft.AspNetCore.Mvc  
2. Microsoft.AspNetCore.Rewrite  

要強制使用 HTTPS 的頁面可以在 Action 或 Controller 註冊 `RequireHttpsAttribute` 或註冊於全域範圍，只要不是 HTTPS 就會回傳 HTTP Status Code 302 並轉址到 HTTPS，如下：  

* **區域註冊**  
  *Controllers\UserController.cs*
```cs
using Microsoft.AspNetCore.Mvc;
// ...
namespace MyWebsite.Controllers
{
    // 區域註冊
    [RequireHttps]
    public class UserController : Controller
    {
        // ...
    }
}
```
* **全域註冊**  
  *Startup.cs*
```cs
using Microsoft.AspNetCore.Mvc;
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // 全域註冊
        services.Configure<MvcOptions>(options =>
        {
            options.Filters.Add(new RequireHttpsAttribute());
        });
    }
}
```


`RequireHttpsAttribute` 轉址預設是轉到 443 Port，如果 HTTPS 不是用 443 Prot，就要在註冊 MVC 服務的時候，修改 `SslPort`，如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    private readonly int _httpsPort;

    public Startup(IHostingEnvironment env)
    {
        if (env.IsDevelopment())
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile(@"Properties/launchSettings.json");
            var launchConfig = builder.Build();
            _httpsPort = launchConfig.GetValue<int>("iisSettings:iisExpress:sslPort");
        }
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc(options => options.SslPort = _httpsPort);
        // ...
    }
}
```

用 `RequireHttpsAttribute` 的方式，只能限制到 MVC / API 的部分，並沒有辦法連靜態檔案都強制使用 HTTPS。  
如果整個網站都要用 HTTPS 的話，可以加入 URL Rewrite，將非 HTTPS 都轉址到 HTTPS。  
在 `Startup.Configure` 呼叫 `UseRewriter` 加入轉址的 Pipeline，如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app, )
    {        
        app.UseRewriter(new RewriteOptions().AddRedirectToHttps(301, _httpsPort));
        // ...
    }
}
```
完成以上設定後，不管是用 HTTP 還是 HTTPS 最終都會轉到 HTTPS 用 SSL 連線了。  
為了網站有更高的安全性，就全部都用 SSL 吧！

## 執行結果

![ASP.NET Core 教學 - 強制 SSL](/images/a/161.png)

## 參考

[Enforcing SSL in an ASP.NET Core app](https://docs.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)