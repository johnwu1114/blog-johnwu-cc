---
title: '[鐵人賽 Day29] ASP.NET Core 2 系列 - 封包壓縮 (Gzip)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - Middleware
categories:
  - ASP.NET Core
date: 2018-01-17 12:00
featured_image: /images/i29-3.png
---

ASP.NET Core 並不會自動把所有封包壓縮，要針對 Response 的內容做壓縮，可以使用的 ResponseCompression 套件提供的壓縮方式。  
本篇將介紹 ASP.NET Core 以 Gzip 方式對 Response 封包壓縮。  

<!-- more -->

## 啟用封包壓縮

> Response 的內容壓縮，需要 `Microsoft.AspNetCore.ResponseCompression` 套件。  
ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.ResponseCompression`，所以不用再安裝。  
如果是 ASP.NET Core 1.0 的版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```
dotnet add package Microsoft.AspNetCore.ResponseCompression
```

在 `Startup.Configure` 加入封包壓縮的服務，以及註冊封包壓縮的 Middleware，如下：  

*Startup.cs*
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // 封包壓縮的服務
            services.AddResponseCompression();
            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app)
        {
            // 封包壓縮的 Middleware
            app.UseResponseCompression();
            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();
        }
    }
}
```
> 預設的壓縮方式就是使用 Gzip。

壓縮前：  

![[鐵人賽 Day29] ASP.NET Core 2 系列 - 封包壓縮 (Gzip) - 壓縮前](/images/i29-1.png)  

壓縮後：  

![[鐵人賽 Day29] ASP.NET Core 2 系列 - 封包壓縮 (Gzip) - 壓縮後](/images/i29-2.png)  

### ResponseCompressionOptions

從上圖可以看出，不是所有的封包都被壓縮，像圖片就沒被壓縮。  
可以透過 ResponseCompressionOptions 調整要被壓縮的 `MimeTypes` 以及壓縮的方法等。  

*Startup.cs*
```cs
// ...
namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
                options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
                {
                    "image/png"
                });
                options.Providers.Add<GzipCompressionProvider>();
            });
            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });
            // ...
        }
    }
}
```
* `EnableForHttps`  
  是否要對 HTTPS 的封包進行壓縮。  
  *(預設是 false)*  
* `MimeTypes` 
  設定要進行壓縮的 `MimeTypes`。  
  *(預設的 `MimeTypes` 有：`text/plain`、`text/css`、`application/javascript`、`text/html`、`application/xml`、`text/xml`、`application/json`、`text/json`)*  
* `GzipCompressionProviderOptions`  
  設定 Gzip 的壓縮方式。  
  *(預設是 `CompressionLevel.Fastest` 快速壓縮)*  

調整完 MimeTypes 及 CompressionLevel 後，原本沒有 Gzip 壓縮的 PNG 圖檔都被壓縮了，並且其他的封包也比先前壓縮得更小了，如圖：  

![[鐵人賽 Day29] ASP.NET Core 2 系列 - 封包壓縮 (Gzip) - 執行結果](/images/i29-3.png)  

> 壓縮的好處是 Response 的封包變小，節省一些網路流量，但缺點是會消耗一點 CUP 效能。  

## 自訂壓縮

某些情況可能會需要自訂封包的壓縮的方式，例如 Server to Server 的 API 對接，雙方指定好特定的壓縮方法。  
能夠過繼承 `ICompressionProvider` 實作客製化的壓縮方法，並透過 HTTP Header 的 `Accept-Encoding` 指定壓縮的方法，如下：  

*CustomCompressionProvider.cs*
```cs
public class CustomCompressionProvider : ICompressionProvider
{
    public string EncodingName => "customcompression";
    public bool SupportsFlush => true;

    public Stream CreateStream(Stream outputStream)
    {
        // 實作壓縮的方法
        return outputStream;
    }
}
```

把自製的 `CustomCompressionProvider` 加入至 `ResponseCompressionOptions.Providers`，如下：

*Startup.cs*
```cs
// ...
namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddResponseCompression(options =>
            {
                options.Providers.Add<CustomCompressionProvider>();
                // ...
            });            
            // ...
        }
    }
}
```

當 HTTP Header 的 `Accept-Encoding=customcompression` 就會使用 `CustomCompressionProvider` 壓縮封包，執行結果：  

![[鐵人賽 Day29] ASP.NET Core 2 系列 - 封包壓縮 (Gzip) - 自訂壓縮執行結果](/images/i29-4.png)  

## 參考

[Response Compression Middleware for ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/performance/response-compression?tabs=aspnetcore2x)  