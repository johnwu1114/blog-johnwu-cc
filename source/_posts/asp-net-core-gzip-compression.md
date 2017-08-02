title: ASP.NET Core 教學 - Gzip 壓縮封包
author: John Wu
tags:
  - ASP.NET Core
categories:
  - ASP.NET Core
date: 2017-08-02 23:47:00
---
![ASP.NET Core 教學 - Gzip 壓縮封包](/images/pasted-261.png)


<!-- more -->

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
            services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Optimal);
            services.AddResponseCompression(options =>
            {
                options.MimeTypes = new[]
                {
                    "image/png",
                    "application/font-woff"
                };
                options.EnableForHttps = true;
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

## 執行結果

![ASP.NET Core 教學 - Gzip 壓縮封包](/images/pasted-262.png)