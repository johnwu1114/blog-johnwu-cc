---
title: '[鐵人賽 Day30] ASP.NET Core 2 系列 - Kestrel Web Server'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - SSL
  - HTTPS
  - Security
  - Middleware
categories:
  - ASP.NET Core
date: 2018-01-18 12:00
featured_image: /images/ironman/i30-3.png
---

ASP.NET Core 有兩種運行方式：  
1. **HTTP.sys** *(Windows Only)*  
2. **Kestrel** *(跨平台)*  

ASP.NET Core 預設是使用 Kestrel 做為 HTTP Server。  
Kestrel 是一套輕量的跨平台 HTTP Server，由 [libuv](https://github.com/libuv/libuv) 這套函式庫做為底層非同步事件驅動的控制。  
本篇將介紹 ASP.NET Core 在 Kestrel 的運行方式、調整及自製 localhost SSL 憑證綁定 HTTPS。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day30] ASP.NET Core 2 系列 - Kestrel Web Server](https://ithelp.ithome.com.tw/articles/10197326)  

<!-- more -->

## Kestrel

Kestrel 是一套可以單獨運行的 HTTP Server，也可以透過其它 Web Server 如 IIS、Nginx 或 Apache 等，搭配反向代理 (Reverse Proxy) 使用。  

* **單獨運行**  
  啟動 ASP.NET Core 後，就可以直接對外服務。  
  如下圖：  
  ![[鐵人賽 Day30] ASP.NET Core 2 系列 - Kestrel Web Server - 單獨運行](/images/ironman/i30-1.png)  
  > ASP.NET Core 1.0 的 Kestrel 尚有安全性考量，並不適合對外開放，建議用其它 Web Server 有較高的安全性保護擋在外層，透過反向代理轉給 Kestrel。  
  > 在 ASP.NET Core 2.0 之後，Kestrel 有加強安全性，包含 Timeout 限制、封包大小限制、同時連線數限制等，已經可以獨當一面的使用。  
* **反向代理**  
  搭配其它 Web Server，將收到的封包，透過反向代理轉給 Kestrel。  
  如下圖：  
  ![[鐵人賽 Day30] ASP.NET Core 2 系列 - Kestrel Web Server - 反向代理](/images/ironman/i30-2.png)
  
雖然 ASP.NET Core 2.0 之後 Kestrel 安全性提升可以單獨對外，但 Kestrel 並不支援共用 Port，例如同一台 Server 掛載兩個 ASP.NET Core 網站，若兩個都要用 80 Port 對外，就會變成搶 80 Port。用其它 Web Server 做反向代理，就可以透過綁定不同的 Domain 轉向指到不同的 ASP.NET Core 網站，如下圖：  

![[鐵人賽 Day30] ASP.NET Core 2 系列 - Kestrel Web Server - 反向代理](/images/ironman/i30-3.png)

## Kestrel Options

如果是用其它 Web Server 做反向代理，基本上都不太需要動到 Kestrel Options，畢竟 Kestrel 只是一個輕量級的 HTTP Server，它的功能大部分都被 IIS、Nginx 或 Apache 等，完整的 Web Server 涵蓋。  
單獨運行 Kestrel 的情況比較會需要調整 Kestrel Options，如 Timeout 限制、封包大小限制、同時連線數限制等，設定方式如下：  

*Program.cs*
```cs
// ...
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
                options.AddServerHeader = false;
                options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(1);
                options.Limits.MaxConcurrentConnections = 100;
                options.Limits.MaxConcurrentUpgradedConnections = 100;
                options.Limits.MaxRequestBodySize = 10 * 1024;
                options.Limits.MinRequestBodyDataRate =
                    new MinDataRate(bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));
                options.Limits.MinResponseDataRate =
                    new MinDataRate(bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));
                options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(5);
            })
            .Build();
}
```
* **AddServerHeader**  
  Response 的 Header 帶上 Server 資訊。  
  安全性考量建議設為 false，沒必要讓別人知道 Server 資訊。  
  *(預設為 true)*  
* **Limits**  
  * **KeepAliveTimeout**  
    HTTP持久連線的時間。  
    *(預設 2 分鐘)*  
  * **MaxConcurrentConnections**  
    同時連線數限制。  
    *(預設無限)*  
  * **MaxConcurrentUpgradedConnections**  
    同時連線數限制，包含如 WebSockets 等，其他非連線方式 HTTP。  
    *(預設無限)*  
  * **MaxRequestBodySize**  
    Request 封包限制。  
    *(預設 30,000,000 bytes 約 28.6MB)*  
  * **MinRequestBodyDataRate**  
    Request 傳送速率若低於每秒 N bytes，連續 Y 秒，則視為連線逾時。  
    *(預設連續 5 秒低於 240 bytes為連線逾時)*  
  * **MinResponseDataRate**  
    Response 傳送速率若低於每秒 N bytes，連續 Y 秒，則視為連線逾時。  
    *(預設連續 5 秒低於 240 bytes為連線逾時)*  
  * **RequestHeadersTimeout**  
    Server 處理一個封包最長的時間。  
    *(預設 30 秒)*  

> 其他設定可以參考 KestrelHttpServer 的 GitHub 原始碼，目前還沒有線上文件，但 Summary 註解詳細。  
> * [KestrelServerOptions](https://github.com/aspnet/KestrelHttpServer/blob/rel/2.0.0/src/Microsoft.AspNetCore.Server.Kestrel.Core/KestrelServerOptions.cs)  
> * [KestrelServerLimits](https://github.com/aspnet/KestrelHttpServer/blob/rel/2.0.0/src/Microsoft.AspNetCore.Server.Kestrel.Core/KestrelServerLimits.cs)  
> * [ListenOptions](https://github.com/aspnet/KestrelHttpServer/blob/rel/2.0.0/src/Microsoft.AspNetCore.Server.Kestrel.Core/ListenOptions.cs)  

## HTTPS

網站安全性越做越高，不免都要使用 HTTPS 加密連線，Kestrel 雖然小巧輕量，但是還是有支援 HTTPS，如果不想透過其它 Web Server 做反向代理，又想要用 HTTPS 就可以參考以下方式。  

> 如果有用反向代理，就不需要把憑證綁在 Kestrel。直接綁在反向代理的 Web Server 即可。  
> 反向代理用 IIS 的話可以參考這篇：[IIS - 安裝 SSL 憑證](/article/iis-install-ssl-certificate.html)  

### 取得憑證

Kestrel 要使用 HTTPS 的話，需要用到 `*.pfx` 檔。根據不同的憑證供應商，可能取得的憑證檔案格式不太一樣。如果可以拿到 `*.pfx`，就可以跳過此步驟。不是的話也沒關係，拿到的憑證基本上都能產生出 `*.pfx` 檔案。  

這邊範例用自製憑證，把 localhost 變成 HTTPS。  
> Windows 要使用 OpenSSL 的話，可以到這邊下載：[Shining Light Productions](https://slproweb.com/products/Win32OpenSSL.html)  

建立一個 *localhost.conf*，提供自製憑證需要的資訊，如下：  

*localhost.conf*
```
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

透過 `openssl` 指令產生 Private Key 文字檔及 Certificate 文字檔：
```sh
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -config localhost.conf -passin pass:MyPassword
```

再透過 Private Key 文字檔及 Certificate 文字檔，產生 `*.pfx`：
```sh
openssl pkcs12 -export -out localhost.pfx -inkey localhost.key -in localhost.crt
```

指令輸出：  

![[鐵人賽 Day30] ASP.NET Core 2 系列 - Kestrel Web Server - 製作憑證](/images/ironman/i30-4.png)

並將憑證安裝到電腦的 **CA ROOT**，讓自製憑證在你的電腦中變成合法憑證。  
* **Windows**  
  1. 滑鼠雙擊 `*.pfx` 可以開始安裝憑證  
  2. 憑證存放區選擇 **受信任的根憑證授權單位**  
* **Mac**  
  1. 打開 KeyChain Access  
  2. 再左側欄選擇 System  
  3. 把 `*.pfx` 拖曳到 System 的清單中  
* **Linux** 透過以下指另安裝憑證：  
```sh
certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n "localhost" -i localhost.crt
```

### 載入憑證

取得 `*.pfx` 檔後，就可以在 WebHost Builder 中，透過 `UseKestrel` 加入 Kestrel 的設定，如下：  

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
                    // http://localhost:5000/
                    options.Listen(IPAddress.Loopback, 5000);
                    // https://localhost:5443/
                    options.Listen(IPAddress.Loopback, 5443, listenOptions =>
                    {
                        listenOptions.UseHttps("localhost.pfx", "MyPassword");
                    });
                })
                .UseUrls("https://localhost:5443")
                .Build();
    }
}
```

設定 `UseHttps` 後，就可以在 localhost 使用 HTTPS 了，並保留 HTTP 可以使用，只要自己更改網址列就可以。  
範例結果：  

![[鐵人賽 Day30] ASP.NET Core 2 系列 - Kestrel Web Server - 範例結果](/images/ironman/i30-5.png)

### 強制 HTTPS

要強制使用 HTTPS 的頁面可以在 Action 或 Controller 註冊 `[RequireHttps]`，也可以註冊於全域範圍，只要不是 HTTPS 就會回傳 HTTP Status Code 302 並轉址到 HTTPS，如下：  

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
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc(options => options.SslPort = 5443);
        // ...
    }
}
```

用 `RequireHttpsAttribute` 的方式，只能限制到 MVC / API 的部分，並沒有辦法連靜態檔案都強制使用 HTTPS。  
如果整個網站都要用 HTTPS 的話，可以加入 URL Rewrite，將非 HTTPS 都轉址到 HTTPS。  
在 `Startup.Configure` 呼叫 `UseRewriter` 加入轉址的 Middleware，如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        var httpsPort = 5443;
        app.UseRewriter(new RewriteOptions().AddRedirectToHttps(301, httpsPort));
        // ...
    }
}
```
完成以上設定後，不管是用 HTTP 還是 HTTPS 最終都會轉到 HTTPS 用 SSL 連線了。  
為了網站有更高的安全性，就全部都用 SSL 吧！

## 參考

[Introduction to Kestrel web server implementation in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?tabs=aspnetcore2x)  
[What is Kestrel Web Server? How It Works, Benefits, and More](https://stackify.com/what-is-kestrel-web-server/)  
[Learn Kestrel Webserver in 10 Minutes](http://www.codedigest.com/quick-start/5/learn-kestrel-webserver-in-10-minutes)  
[Enforcing SSL in an ASP.NET Core app](https://docs.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)  
[Develop Locally with HTTPS, Self-Signed Certificates and ASP.NET Core](https://www.humankode.com/asp-net-core/develop-locally-with-https-self-signed-certificates-and-asp-net-core)  
[ASP.NET Core Web服务器 Kestrel和Http.sys 特性详解](http://www.sohu.com/a/192530398_468635)  