---
title: ASP.NET Core 教學 - 檔案上傳
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Web API
  - Stream
categories:
  - ASP.NET Core
date: 2017-09-05 02:07:00
featured_image: /images/a/325.png
---

![ASP.NET Core 教學 - 檔案上傳 - 執行結果](/images/a/325.png)

在 ASP.NET Core 實作基本的檔案上傳功能算蠻簡易的，但對於大型檔案就稍微麻煩一些，若沒有額外處理，則容易造成 ASP.NET Core 死翹翹。  
本篇將介紹如何在 ASP.NET Core 檔案上傳。  

<!-- more -->

## 1. 檔案上傳

### 1.1. View

首先建立一個 HTML Form，`enctype` 使用 **multipart/form-data**，把 `action` 指向接收上傳資料的 API。如下：

```html
<form method="post" enctype="multipart/form-data" action="/api/upload">
    <input type="file" name="files" multiple />
    <br />
    <input type="submit" value="送出" />
</form>
```

### 1.2. Controller

建立一個接收檔案的 Controller 及 Action，在 Action 的參數中，使用 `IFormFile` 型別，就可以接收到 HTML Form 傳來的檔案。
由於上例 HTML Form 允許多檔傳送，所以在 Action 的參數中使用 `List<IFormFile>` 集合來接收參數。  

範例如下：

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
> 此範例有個小缺陷，就是檔名不能重複，如果檔名重複會被複寫。

## 2. 資料及檔案上傳

如果上傳檔案要伴隨著表單資料的話，可以透過 Model 包裝 `IFormFile`。  
範例如下：

### 2.1. View 

```html
<h1>相簿</h1>
<form method="post" enctype="multipart/form-data" action="/api/upload/album">
    名稱：<input type="text" name="Title" /><br />
    日期：<input type="date" name="Date" /><br />
    相片：<input type="file" name="Photos" multiple accept="image/*" /><br />
    <input type="submit" value="送出" />
</form>
```

### 2.2. Model

```cs
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace MyWebsite.Models
{
    public class AlbumModel
    {
        public string Title { get; set; }

        public DateTime Date { get; set; }

        public List<IFormFile> Photos { get; set; }
    }
}
```

### 2.3. Controller

```cs
[Route("api/[controller]")]
public class UploadController : Controller
{
    // ...

    [Route("album")]
    [HttpPost]
    public async Task<IActionResult> Album(AlbumModel model)
    {
        // ...

        return Ok(new
        {
            title = model.Title,
            date = model.Date.ToString("yyyy/MM/dd"),
            photoCount = model.Photos.Count,
            photoSize = model.Photos.Sum(f => f.Length)
        })
    }
}
```

### 2.4. 執行結果

![ASP.NET Core 教學 - 檔案上傳 - 執行結果](/images/a/325.png)

## 3. 大型檔案上傳

透過 `IFormFile` 上傳檔案，是由 ASP.NET Core 幫你控制緩衝記憶體，如果檔案太大或很頻繁耗用緩衝記憶體，當 ASP.NET Core 能使用的緩衝記憶體到達上限，它就會死給你看了。  
所以，如果你的系統會有上傳大檔的需求，又或者是會很頻繁的上傳檔案，強烈建議改用串流的方式，自己實作寫入硬碟位置，避免 ASP.NET Core 幫你控制緩衝記憶體。  

### 3.1. View

改一下 API 位置：

```html
<h1>大型檔案</h1>
<form method="post" enctype="multipart/form-data" action="/api/upload/large">
    <input type="file" name="files" multiple />
    <br />
    <input type="submit" value="送出" />
</form>
```

### 3.2. DisableFormValueModelBindingAttribute

由於要自行處理 Request 來的資料，所以要把原本 API 的 Model Binding 移除。  
建立一個 Attribute 註冊在大型檔案上傳的 API，透過 Resource Filter 在 Model Binding 之前把它移除。

DisableFormValueModelBindingAttribute.cs
```cs
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MyWebsite.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class DisableFormValueModelBindingAttribute : Attribute, IResourceFilter
    {
        public void OnResourceExecuting(ResourceExecutingContext context)
        {
            var formValueProviderFactory = context.ValueProviderFactories
                .OfType<FormValueProviderFactory>()
                .FirstOrDefault();
            if (formValueProviderFactory != null)
            {
                context.ValueProviderFactories.Remove(formValueProviderFactory);
            }

            var jqueryFormValueProviderFactory = context.ValueProviderFactories
                .OfType<JQueryFormValueProviderFactory>()
                .FirstOrDefault();
            if (jqueryFormValueProviderFactory != null)
            {
                context.ValueProviderFactories.Remove(jqueryFormValueProviderFactory);
            }
        }

        public void OnResourceExecuted(ResourceExecutedContext context)
        {
        }
    }
}
```

> 寫 ASP.NET Core 最好要了解 Filters 的使用方法，不熟的話可以參考這篇 [ASP.NET Core 教學 - Filters](/article/asp-net-core-filters.html)。

### 3.3. MultipartRequestHelper

從微軟官方範例直接複製 [MultipartRequestHelper](https://github.com/aspnet/Docs/blob/master/aspnetcore/mvc/models/file-uploads/sample/FileUploadSample/MultipartRequestHelper.cs) 使用，這個類別是用來判斷 HTML Form 送來的 `multipart/form-data` 內容使用。

MultipartRequestHelper.cs
```cs
using System;
using System.IO;
using Microsoft.Net.Http.Headers;

namespace MyWebsite
{
    public static class MultipartRequestHelper
    {
        // Content-Type: multipart/form-data; boundary="----WebKitFormBoundarymx2fSWqWSd0OxQqq"
        // The spec says 70 characters is a reasonable limit.
        public static string GetBoundary(MediaTypeHeaderValue contentType, int lengthLimit)
        {
            var boundary = HeaderUtilities.RemoveQuotes(contentType.Boundary);
            if (string.IsNullOrWhiteSpace(boundary))
            {
                throw new InvalidDataException("Missing content-type boundary.");
            }

            if (boundary.Length > lengthLimit)
            {
                throw new InvalidDataException(
                    $"Multipart boundary length limit {lengthLimit} exceeded.");
            }

            return boundary;
        }

        public static bool IsMultipartContentType(string contentType)
        {
            return !string.IsNullOrEmpty(contentType)
                   && contentType.IndexOf("multipart/", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        public static bool HasFormDataContentDisposition(ContentDispositionHeaderValue contentDisposition)
        {
            // Content-Disposition: form-data; name="key";
            return contentDisposition != null
                   && contentDisposition.DispositionType.Equals("form-data")
                   && string.IsNullOrEmpty(contentDisposition.FileName)
                   && string.IsNullOrEmpty(contentDisposition.FileNameStar);
        }

        public static bool HasFileContentDisposition(ContentDispositionHeaderValue contentDisposition)
        {
            // Content-Disposition: form-data; name="myfile1"; filename="Misc 002.jpg"
            return contentDisposition != null
                   && contentDisposition.DispositionType.Equals("form-data")
                   && (!string.IsNullOrEmpty(contentDisposition.FileName)
                       || !string.IsNullOrEmpty(contentDisposition.FileNameStar));
        }
    }
}
```

### 3.4. FileStreamingHelper

FileStreamingHelper 是從官方範例 [StreamingController](https://github.com/aspnet/Docs/blob/master/aspnetcore/mvc/models/file-uploads/sample/FileUploadSample/Controllers/StreamingController.cs) 抽出的邏輯，可以讓 Controller 程式碼更簡潔，`Stream` 實體透過委派傳入，使用上較為彈性。

```cs
using System;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;

namespace MyWebsite
{
    public static class FileStreamingHelper
    {
        private static readonly FormOptions _defaultFormOptions = new FormOptions();

        public static async Task<FormValueProvider> StreamFile(this HttpRequest request, Func<FileMultipartSection, Stream> createStream)
        {
            if (!MultipartRequestHelper.IsMultipartContentType(request.ContentType))
            {
                throw new Exception($"Expected a multipart request, but got {request.ContentType}");
            }

            // 把 request 中的 Form 依照 Key 及 Value 存到此物件
            var formAccumulator = new KeyValueAccumulator();

            var boundary = MultipartRequestHelper.GetBoundary(
                MediaTypeHeaderValue.Parse(request.ContentType),
                _defaultFormOptions.MultipartBoundaryLengthLimit);
            var reader = new MultipartReader(boundary, request.Body);

            var section = await reader.ReadNextSectionAsync();
            while (section != null)
            {
                // 把 Form 的欄位內容逐一取出
                ContentDispositionHeaderValue contentDisposition;
                var hasContentDispositionHeader = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out contentDisposition);

                if (hasContentDispositionHeader)
                {
                    if (MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
                    {
                        // 若此欄位是檔案，就寫入至 Stream;
                        using (var targetStream = createStream(section.AsFileSection()))
                        {
                            await section.Body.CopyToAsync(targetStream);
                        }
                    }
                    else if (MultipartRequestHelper.HasFormDataContentDisposition(contentDisposition))
                    {
                        // 若此欄位不是檔案，就把 Key 及 Value 取出，存入 formAccumulator
                        var key = HeaderUtilities.RemoveQuotes(contentDisposition.Name);
                        var encoding = GetEncoding(section);
                        using (var streamReader = new StreamReader(
                            section.Body,
                            encoding,
                            detectEncodingFromByteOrderMarks: true,
                            bufferSize: 1024,
                            leaveOpen: true))
                        {
                            var value = await streamReader.ReadToEndAsync();
                            if (String.Equals(value, "undefined", StringComparison.OrdinalIgnoreCase))
                            {
                                value = String.Empty;
                            }
                            formAccumulator.Append(key, value);

                            if (formAccumulator.ValueCount > _defaultFormOptions.ValueCountLimit)
                            {
                                throw new InvalidDataException($"Form key count limit {_defaultFormOptions.ValueCountLimit} exceeded.");
                            }
                        }
                    }
                }

                // 取得 Form 的下一個欄位
                section = await reader.ReadNextSectionAsync();
            }

            // Bind form data to a model
            var formValueProvider = new FormValueProvider(
                BindingSource.Form,
                new FormCollection(formAccumulator.GetResults()),
                CultureInfo.CurrentCulture);

            return formValueProvider;
        }

        private static Encoding GetEncoding(MultipartSection section)
        {
            MediaTypeHeaderValue mediaType;
            var hasMediaTypeHeader = MediaTypeHeaderValue.TryParse(section.ContentType, out mediaType);
            // UTF-7 is insecure and should not be honored. UTF-8 will succeed in
            // most cases.
            if (!hasMediaTypeHeader || Encoding.UTF7.Equals(mediaType.Encoding))
            {
                return Encoding.UTF8;
            }
            return mediaType.Encoding;
        }
    }
}
```

### 3.5. Controller

```cs
[Route("api/[controller]")]
public class UploadController : Controller
{
    // ...

    [Route("large")]
    [HttpPost]
    [DisableFormValueModelBinding]
    public async Task<IActionResult> Large()
    {
        var fileCount = 0;

        await Request.StreamFile((file) =>
        {
            fileCount++;
            return System.IO.File.Create($"{_uploadFolder}\\{file.FileName}");
        });

        return Ok(new { fileCount = fileCount });
    }
}
```

終於完成了！

## 4. 上傳大小限制

單次 Request 上傳的大小限制可以在 Web.config 修改 `maxAllowedContentLength`，預設 **30000000** 大約是 28.6MB。
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

## 程式碼下載

[asp-net-core-upload-files](https://github.com/johnwu1114/asp-net-core-upload-files)

## 參考

[File uploads in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)  
[Uploading Files In ASP.net Core](https://dotnetcoretutorials.com/2017/03/12/uploading-files-asp-net-core/)