---
title: ASP.NET Core 教學 - Gzip 封包壓縮
author: John Wu
tags:
  - ASP.NET Core
  - Gzip
categories:
  - ASP.NET Core
date: 2017-08-02 23:47:00
featured_image: /images/pasted-261.png
---
![ASP.NET Core 教學 - Gzip 封包壓縮](/images/pasted-261.png)

ASP.NET Core 並不會自動幫你把所有封包壓縮，如上圖所見 PNG 圖檔及 Font 檔都沒有被 Gzip 壓縮。有被壓縮的檔案，並不是 ASP.NET Core 處理的，而是由 IIS 處理的。  
本篇將介紹 ASP.NET Core 的 Gzip 封包壓縮。  

<!-- more -->

## 1. 安裝 NuGet 套件

要針對 Response 的內容做壓縮，可以自己實做 Middleware，但 ASP.NET Core 有出 Response Compression 套件，並包含了 Gzip 壓縮。  
可以打開 NuGet 找到 `Microsoft.AspNetCore.ResponseCompression` 並安裝。

## 2. Startup

安裝完 Response Compression 套件後，在 Services 註冊要壓縮的方式及需要被壓縮的 Mime Type，如下：

Startup.cs
```cs
using System.IO.Compression;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // 壓縮的方式
            services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Optimal);

            // 需要被壓縮的 MimeType
            services.AddResponseCompression(options =>
            {
                options.MimeTypes = new[]
                {
                    "image/png",
                    "application/font-woff"
                };
            });
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseResponseCompression();

            app.UseDefaultFiles();
            app.UseStaticFiles();
            // ...
        }
    }
}
```
* MimeTypes：如果不指定 MimeType，services 的註冊可以改成 *services.AddResponseCompression()*，就會使用預設值。  
 * 預設的 MimeTypes：`text/plain`、`text/css`、`application/javascript`、`text/html`、`application/xml`、`text/xml`、`application/json`、`text/json`
* UseResponseCompression：建議註冊在最外層。  
 註冊在外層的原因可以參考 [ASP.NET Core 教學 - Middleware](/article/asp-net-core-middleware.html)。  


## 執行結果

壓縮的好處是 Response 的封包變小，節省一些網路流量，但缺點是會消耗一點 CUP 效能。  
使用 Response Compression 後，原本沒有 Gzip 壓縮的 PNG 圖檔及 Font 檔都有被壓縮了，而且檔案也變小了。

![ASP.NET Core 教學 - Gzip 封包壓縮 - 執行結果](/images/pasted-262.png)