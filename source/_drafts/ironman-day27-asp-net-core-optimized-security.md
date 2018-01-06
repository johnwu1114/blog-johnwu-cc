---
title: '[鐵人賽 Day27] ASP.NET Core 2 系列 - 優化安全性'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - CORS
  - CSP
  - SSL
  - HTTPS
  - Security
categories:
  - ASP.NET Core
date: 2018-01-15 12:00
featured_image: /images/.png
---

網站安全性是很重要的非功能需求，有些簡單的實作，就能有效的保護網站的安全。  
本篇將介紹 ASP.NET Core 基本的安全保護，包含：  
1. 強制使用 SSL 加密連線  
2. 網頁安全政策 Content Security Policy (CSP)  
3. 跨域請求 Cross-Origin Requests (CORS)  
4. 移除 Response 封包不必要的資訊

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day25] ASP.NET Core 2 系列 - 優化安全性](https://ithelp.ithome.com.tw/articles/xxxxxxx)  

<!-- more -->

## SSL

### Kestrel

### 憑證

*localhost.conf*
```conf
[req]
default_bits       = 2048
default_keyfile    = localhost.key
distinguished_name = req_distinguished_name
req_extensions     = req_ext
x509_extensions    = v3_ca

[req_distinguished_name]
countryName                 = Country Name (2 letter code)
countryName_default         = TW
stateOrProvinceName         = State or Province Name (full name)
stateOrProvinceName_default = Taiwan
localityName                = Locality Name (eg, city)
localityName_default        = Taipei City
organizationName            = Organization Name (eg, company)
organizationName_default    = localhost
organizationalUnitName      = organizationalunit
organizationalUnitName_default = Development
commonName                  = Common Name (e.g. server FQDN or YOUR name)
commonName_default          = localhost
commonName_max              = 64

[req_ext]
subjectAltName = @alt_names

[v3_ca]
subjectAltName = @alt_names

[alt_names]
DNS.1   = localhost
DNS.2   = 127.0.0.1
```

```sh
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -config localhost.conf -passin pass:YourSecurePassword
```

```sh
openssl pkcs12 -export -out localhost.pfx -inkey localhost.key -in localhost.crt
```

*Program.cs*
```cs
using System.Net;
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
                .UseKestrel(options =>
                {
                    options.Listen(IPAddress.Loopback, 5000);
                    options.Listen(IPAddress.Loopback, 5443, listenOptions =>
                    {
                        listenOptions.UseHttps("localhost.pfx", "YourSecurePassword");
                    });
                })
                .Build();
    }
}
```

網站安全性越做越高，不免都要使用 HTTPS 加密連線，但本機用 localhost 都是 HTTP，想測試 HTTPS 需要額外的設定。  
本篇將介紹 ASP.NET Core 強制使用 SSL 加密連線。  

設定 SSL Port 後，就可以在 localhost 使用 HTTPS 了。但會遇到隱私權問題，因為我們沒有真的匯入憑證，可以先把他忽略。步驟如下：  
![ASP.NET Core 教學 - 忽略憑證 - 1](/images/pasted-159.png)
![ASP.NET Core 教學 - 忽略憑證 - 2](/images/pasted-160.png)

只有單純啟動 SSL Port 的話，依然可以使用 HTTP，只要自己更改網址列就可以。強制走 HTTPS 的話還要經過以下設定。 

先安裝兩個套件：  
1. Microsoft.AspNetCore.Mvc  
2. Microsoft.AspNetCore.Rewrite  

在 Startup.cs 加入 Require HTTPS Middleware 強制走 HTTPS。  
如此一來，只要不是 HTTPS 就會回傳 Status Code 301，但這樣使用者會看到錯誤頁面，使用起來沒這麼友善。  
所以在 Configure 加入轉址判斷，如果是 Status Code 301，就轉到 SSL 的 Port。  

*Startup.cs*
```cs
using Microsoft.AspNetCore.Rewrite;
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        app.UseRewriter(new RewriteOptions().AddRedirectToHttps(301, 5443));
        // ...
    }
}
```

完成以上設定後，不管是用 HTTP 還是 HTTPS 最終都會轉到 HTTPS 用 SSL 連線了。  
為了網站有正高的安全性，就全部都用 SSL 吧！

執行結果：

![ASP.NET Core 教學 - 強制 SSL](/images/pasted-161.png)

## 網頁安全政策 CSP

Content Security Policy (CSP)
主要是防止 Cross-Site Scripting (XSS)

## 跨域請求 CORS

有些團隊會把前後端專案切開，放在不同的網域執行，如此一來就會遇到瀏覽器安全性問題，禁止不同網域的請求。如上圖。  
本篇將介紹 ASP.NET Core 啟用跨域請求 Cross-Origin Requests (CORS)。  

### 1. 安裝 NuGet 套件

ASP.NET Core 有針對 CORS 出套件。  
打開 NuGet 找到 `Microsoft.AspNetCore.Cors` 並安裝。  

### 2. Startup

安裝完 CORS 套件後，在 Services 註冊 CORS 的 Policy，如下：

Startup.cs
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            // Policy 名稱 CorsPolicy 是自訂的，可以自己改
            options.AddPolicy("CorsPolicy", policy =>
            {
                // 設定允許跨域的來源，有多個的話可以用 `,` 隔開
                policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
            });
        });
        services.AddMvc();
    }
}
```
> 若要同意所有跨域來源都能呼叫的話，可以把 `WithOrigins()` 改為 `AllowAnyOrigin()`  

### 3. 套用 Policy

套用 Policy 有兩種方式：  
1. 全域套用  
2. 區域套用  

#### 3.1. 全域套用

在 Configure 註冊 Policy，所有的 Request 都會套用。

Startup.cs
```cs
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        // 套用 Policy 到 Middleware
        app.UseCors("CorsPolicy");
        app.UseMvc();
    }
}
```

#### 3.2. 區域套用 

可以在 Controller 或 Action 掛上 `[EnableCors("PolicyName")]`，套用 Policy 到 Controller 或 Action 上。

Controller
```cs
[EnableCors("CorsPolicy")]
[Route("api/[controller]")]
public class ContactController : Controller
{
    // ...
}
```

Action
```cs
[Route("api/[controller]")]
public class ContactController : Controller
{
    [EnableCors("CorsPolicy")]
    [HttpGet("{id}")]
    public ResultModel Get(int id)
    {
        // ...
    }
}
```

執行結果

![ASP.NET Core 教學 - 跨域請求 Cross-Origin Requests (CORS) - 範例執行結果](/images/pasted-241.png)

## 移除 Server 資訊

ASP.NET Core 預設會在每個 Response 的 Header 帶上 Server 資訊。看似沒什麼影響，但存在兩個小問題：  
* 資安問題：讓別人知道使用的技術，有可能會針對該技術的漏洞攻擊。  
* 浪費流量：每個 Response 都帶有不必要的內容時，就是積沙成塔的浪費。  


在 ASP.NET Core 的程式進入點，建立 `IWebHostBuilder` 的地方，找到 `UseKestrel`，設定 `AddServerHeader = false`。
```cs
public class Program
{
    public static void Main(string[] args)
    {
        var host = new WebHostBuilder()
            .UseKestrel(c => c.AddServerHeader = false)
            .UseContentRoot(Directory.GetCurrentDirectory())
            .UseIISIntegration()
            .UseStartup<Startup>()
            .UseApplicationInsights()
            .Build();

        host.Run();
    }
}
```

## 移除 X-Powered-By 資訊

你可能會想說從 Middleware 移除 `X-Powered-By`，但 `X-Powered-By` 並不是在 ASP.NET Core 中產生出來的內容！  
`X-Powered-By` 是由 IIS 加入的資訊，有兩種移除方式：  
1. 從 IIS 移除  
2. 從 Web.config 移除  

> 如果你的 ASP.NET Core 不是在 IIS 上執行，就不會遇到此問題。

### IIS

![ASP.NET Core 教學 - IIS 移除 X-Powered-By](/images/pasted-259.png)

### Web.config 

在該網站的 Web.config 中，找到 `<system.webServer>` 新增 `<httpProtocol>` 包含如下內容：
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <!-- ... -->
        <httpProtocol>
            <customHeaders>
                <remove name="X-Powered-By" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
```

執行結果

![ASP.NET Core 教學 - 移除 Response Header 資訊 - 執行結果](/images/pasted-260.png)


## 參考

[USING CSP HEADER IN ASP.NET CORE 2.0](https://tahirnaushad.com/2017/09/12/using-csp-header-in-asp-net-core-2-0/)  
[Enabling Cross-Origin Requests (CORS)](https://docs.microsoft.com/en-us/aspnet/core/security/cors)  
[ASP.NET Core and CORS Gotchas](https://weblog.west-wind.com/posts/2016/Sep/26/ASPNET-Core-and-CORS-Gotchas)  
[KestrelServerOptions Class](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserveroptions?view=aspnetcore-2.0)