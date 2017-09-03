---
title: ASP.NET Core - 上傳檔案
author: John Wu
tags:
  - ASP.NET Core
categories:
  - ASP.NET Core
date: 2017-09-04 00:38:00
---

本篇將介紹如何在 ASP.NET Core 上傳檔案。  

<!-- more -->

## View

建立一個 HTML form，enctype 用 `multipart/form-data`，把 action 指向接收上傳資料的 API。

```html
<form method="post" enctype="multipart/form-data" action="/api/upload">
    <input type="file" name="files" multiple />
    <br />
    <input type="submit" value="Upload" />
</form>
```

## Controller

建立一個接收上傳資料的 Controller，如下：

```cs
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    [Route("api/[controller]")]
    public class UploadController : Controller
    {
        private readonly string _uploadFolder;

        public UploadController(IHostingEnvironment hostingEnvironment)
        {
            _uploadFolder = $"{hostingEnvironment.WebRootPath}\\Upload";
        }

        [HttpPost]
        public async Task<IActionResult> Post(List<IFormFile> files)
        {
            var size = files.Sum(f => f.Length);

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    // 要存放的位置
                    var savePath = $"{_uploadFolder}\\{formFile.FileName}";
                    using (var stream = new FileStream(savePath, FileMode.Create))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                }
            }

            return Ok(new { count = files.Count, size });
        }
    }
}
```

## 上傳大小限制

單次 Request 上傳的大小限制可以在 Web.config 修改，預設大約是 28.6MB。
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <security>
      <requestFiltering>
        <!-- 約 50MB -->
        <requestLimits maxAllowedContentLength="52428800" />
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

## 參考

[File uploads in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)  
[Uploading Files In ASP.net Core](https://dotnetcoretutorials.com/2017/03/12/uploading-files-asp-net-core/)