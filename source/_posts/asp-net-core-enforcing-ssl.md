---
title: ASP.NET Core 教學 - 強制 SSL
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - SSL
  - HTTPS
categories:
  - ASP.NET Core
date: 2017-06-01 08:56:00
featured_image: /images/pasted-161.png
---
![ASP.NET Core 教學 - 強制 SSL](/images/pasted-161.png)

網站安全性越做越高，不免都要使用 HTTPS 加密連線，但本機用 localhost 都是 HTTP，想測試 HTTPS 需要額外的設定。  
本篇將介紹 ASP.NET Core 強制使用 SSL 加密連線。  

<!-- more -->

## 啟用 SSL

可以再 Web 專案點滑鼠右鍵，用圖形化的工具啟用 SSL Port，如下：  
![ASP.NET Core 教學 - Launch Settings](/images/pasted-158.png)

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

設定 SSL Port 後，就可以在 localhost 使用 HTTPS 了。但會遇到隱私權問題，因為我們沒有真的匯入憑證，可以先把他忽略。步驟如下：  
![ASP.NET Core 教學 - 忽略憑證 - 1](/images/pasted-159.png)
![ASP.NET Core 教學 - 忽略憑證 - 2](/images/pasted-160.png)

## 強制 SSL

只有單純啟動 SSL Port 的話，依然可以使用 HTTP，只要自己更改網址列就可以。強制走 HTTPS 的話還要經過以下設定。 

先安裝兩個套件：  
1. Microsoft.AspNetCore.Mvc  
2. Microsoft.AspNetCore.Rewrite  

在 Startup.cs 加入 Require HTTPS Middleware 強制走 HTTPS。  
如此一來，只要不是 HTTPS 就會回傳 Status Code 301，但這樣使用者會看到錯誤頁面，使用起來沒這麼友善。  
所以在 Configure 加入轉址判斷，如果是 Status Code 301，就轉到 SSL 的 Port。
```cs
// ...

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.Configure<MvcOptions>(options =>
        {
            options.Filters.Add(new RequireHttpsAttribute());
        });
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        var httpsPort = 443;
        if (env.IsDevelopment())
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile(@"Properties/launchSettings.json");
            var launchConfig = builder.Build();
            httpsPort = launchConfig.GetValue<int>("iisSettings:iisExpress:sslPort");
        }
        app.UseRewriter(new RewriteOptions().AddRedirectToHttps(301, httpsPort));

        app.UseDefaultFiles();
        app.UseStaticFiles();
    }
}
```

完成以上設定後，不管是用 HTTP 還是 HTTPS 最終都會轉到 HTTPS 用 SSL 連線了。  
為了網站有正高的安全性，就全部都用 SSL 吧！

## 執行結果

![ASP.NET Core 教學 - 強制 SSL](/images/pasted-161.png)

## 參考

[Enforcing SSL in an ASP.NET Core app](https://docs.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)