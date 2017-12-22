---
title: '[鐵人賽 Day22] ASP.NET Core 2 系列 - 上傳/下載檔案'
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Web API
  - Stream
categories:
  - ASP.NET Core
date: 2018-01-10 12:00
featured_image: /images/i22-1.png
---

在 ASP.NET Core 實作上傳檔案及下載檔案功能算蠻簡易的，  
但對於上傳大型檔案就稍微麻煩一些，若沒有額外處理，則容易造成 ASP.NET Core 網站崩潰。  
本篇將介紹如何在 ASP.NET Core 實作上傳/下載檔案 API。  

<!-- more -->

## 簡易上傳/下載

建立一個接收檔案的 Controller，在 Action 的參數中，使用 `IFormFile` 型別，就可以接收到 HTML Form 傳來的檔案。
如果要允許多檔上傳，就在 Action 的參數中使用 `List<IFormFile>` 集合來接收參數。範例如下：  
*Controllers\FileController.cs*
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
    [Route("api/[controller]s")]
    public class FileController : Controller
    {
        private readonly static Dictionary<string, string> _contentTypes = new Dictionary<string, string>
        {
            {".png", "image/png"},
            {".jpg", "image/jpeg"},
            {".jpeg", "image/jpeg"},
            {".gif", "image/gif"}
        };
        private readonly string _folder;

        public FileController(IHostingEnvironment hostingEnvironment)
        {
            // 把上傳目錄設為：wwwroot\UploadFolder
            _folder = $@"{hostingEnvironment.WebRootPath}\UploadFolder";
        }

        [HttpPost]
        public async Task<IActionResult> Upload(List<IFormFile> files)
        {
            var size = files.Sum(f => f.Length);

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var path = $@"{_folder}\{file.FileName}";
                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }
            }

            return Ok(new { count = files.Count, size });
        }

        [HttpGet("{fileName}")]
        public async Task<IActionResult> Download(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return NotFound();
            }

            var path = $@"{_folder}\{fileName}";
            var memoryStream = new MemoryStream();
            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memoryStream);
            }
            memoryStream.Seek(0, SeekOrigin.Begin);

            // 回傳檔案到 Client 需要附上 Content Type，否則瀏覽器會解析失敗。
            return new FileStreamResult(memoryStream, _contentTypes[Path.GetExtension(path).ToLowerInvariant()]);
        }

    }
}
```
> 此範例有個小缺陷，就是上傳檔名不能重複，如果檔名重複會被複寫。  

* **HTTP POST**  
 前端用 HTML Form 上傳檔案。`enctype` 使用 **multipart/form-data**，把 `action` 指向接收上傳資料的 API，可以用 `accept` 限制上傳檔案類型。如下：  
```html
<form method="post" enctype="multipart/form-data" action="/api/files">
    <input type="file" name="files" multiple accept="image/*"/>
    <br />
    <input type="submit" value="Upload" />
</form>
```
* **HTTP GET**  
 下載檔案就用 HTTP Get 請求 `http://localhost:5000/api/files/{檔名}` 即可。  

## 表單資料

如果上傳檔案要伴隨著表單資料的話，可以透過 Model 包裝 `IFormFile`。如下：  
*Models\AlbumModel.cs*
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

Action 在接收的參數就改為包裝後的 Model。例如：  
```cs
[Route("album")]
[HttpPost]
public async Task<IActionResult> Album(AlbumModel model)
{
    // ...
    return Ok(new
    {
        title = model.Title,
        date = model.Date.ToString("yyyy/MM/dd"),
        photoCount = model.Photos.Count
    });
}
```
> 上傳檔案邏輯同上例 `FileController.Upload`。  

HTML Form 如下：  
```html
<form method="post" enctype="multipart/form-data" action="/api/users/album">
    名稱：<input type="text" name="title" /><br />
    日期：<input type="date" name="date" /><br />
    相片：<input type="file" name="photos" multiple accept="image/*" /><br />
    <input type="submit" value="送出" />
</form>
```

![[鐵人賽 Day22] ASP.NET Core 2 系列 - 上傳/下載檔案 - 表單資料執行結果](/images/i22-1.png)

## 大型檔案上傳

透過 `IFormFile` 上傳檔案，是由 ASP.NET Core 控制緩衝記憶體，如果檔案太大或很頻繁耗用緩衝記憶體，容易使 ASP.NET Core 的緩衝記憶體到達上限，屆時就是它死給你看的時候了。  
所以，如果系統會有上傳大檔的需求，又或者是會很頻繁的上傳檔案，強烈建議改用串流的方式，自己實作寫入硬碟位置，避免 ASP.NET Core 控制緩衝記憶體控制到溢位。  

### DisableFormValueModelBindingFilter

由於要自行處理 Request 來的資料，所以要把原本 API 的 Model Binding 移除。  
建立一個 Attribute 註冊在大型檔案上傳的 API，透過 Resource Filter 在 Model Binding 之前把它移除。  
*Filters\DisableFormValueModelBindingFilter.cs*  
```cs
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MyWebsite.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class DisableFormValueModelBindingFilter : Attribute, IResourceFilter
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

### MultipartRequestHelper

從微軟官方範例直接複製 [MultipartRequestHelper.cs](https://github.com/aspnet/Docs/blob/master/aspnetcore/mvc/models/file-uploads/sample/FileUploadSample/MultipartRequestHelper.cs) 使用，這個類別是用來判斷 HTML Form 送來的 `multipart/form-data` 內容使用。  
*Helpers\MultipartRequestHelper.cs*
```cs
using System;
using System.IO;
using Microsoft.Net.Http.Headers;

namespace MyWebsite.Helpers
{
    public static class MultipartRequestHelper
    {
        // Content-Type: multipart/form-data; boundary="----WebKitFormBoundarymx2fSWqWSd0OxQqq"
        // The spec says 70 characters is a reasonable limit.
        public static string GetBoundary(MediaTypeHeaderValue contentType, int lengthLimit)
        {
            var boundary = HeaderUtilities.RemoveQuotes(contentType.Boundary);
            if (string.IsNullOrWhiteSpace(boundary.Value))
            {
                throw new InvalidDataException("Missing content-type boundary.");
            }

            if (boundary.Length > lengthLimit)
            {
                throw new InvalidDataException($"Multipart boundary length limit {lengthLimit} exceeded.");
            }
            return boundary.Value;
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
                && string.IsNullOrEmpty(contentDisposition.FileName.Value)
                && string.IsNullOrEmpty(contentDisposition.FileNameStar.Value);
        }

        public static bool HasFileContentDisposition(ContentDispositionHeaderValue contentDisposition)
        {
            // Content-Disposition: form-data; name="myfile1"; filename="Misc 002.jpg"
            return contentDisposition != null
                && contentDisposition.DispositionType.Equals("form-data")
                && (!string.IsNullOrEmpty(contentDisposition.FileName.Value)
                 || !string.IsNullOrEmpty(contentDisposition.FileNameStar.Value));
        }
    }
}
```

### FileStreamingHelper

FileStreamingHelper 是從官方範例 [StreamingController.cs](https://github.com/aspnet/Docs/blob/master/aspnetcore/mvc/models/file-uploads/sample/FileUploadSample/Controllers/StreamingController.cs) 抽出的邏輯，可以讓 Controller 程式碼更簡潔，`Stream` 實體透過委派傳入，使用上較為彈性。  
*Helpers\FileStreamingHelper.cs*
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

namespace MyWebsite.Helpers
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
                        var key = HeaderUtilities.RemoveQuotes(contentDisposition.Name).Value;
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

### 上傳 API

HTML Form 使用同上述**表單資料**的範例，上傳檔案的 API 改成如下：

```cs
[Route("album")]
[HttpPost]
[DisableFormValueModelBindingFilter]
public async Task<IActionResult> Album()
{
    var photoCount = 0;
    var formValueProvider = await Request.StreamFile((file) =>
    {
        photoCount++;
        return System.IO.File.Create($"{_folder}\\{file.FileName}");
    });

    var model = new AlbumModel{
        Title = formValueProvider.GetValue("title").ToString(),
        Date = Convert.ToDateTime(formValueProvider.GetValue("date").ToString())
    };

    // ...

    return Ok(new
    {
        title = model.Title,
        date = model.Date.ToString("yyyy/MM/dd"),
        photoCount = photoCount
    });
}
```
* **DisableFormValueModelBindingFilter**  
 Action 套用此 Filter 後，HTML Form 就不會被轉換成物件傳入 Action，因此也就可以移除 Action 的參數了。  
* **StreamFile**  
 StreamFile 會將 HTML Form 的內容以 FormValueProvider 包裝後回傳，並以委派方法讓你實做上傳的事件，以此例來說就是直接以串流的方式直接寫檔。  
 這樣就能避免 ASP.NET Core 依賴緩衝記憶體上傳檔案。  

> 若是將 ASP.NET Core 運行在 `IIS` 上，可能還會遇到單一檔案大小過大的錯誤。  
 `IIS` 預設單一上傳封包是 **30000000 Bits** 大約是 28.6MB，單次 Request 上傳的大小限制可以在 Web.config 修改 `maxAllowedContentLength`。如下：  
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