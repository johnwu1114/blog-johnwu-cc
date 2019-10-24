---
title: 'ASP.NET Core 3 系列 - Middleware 讀取 Request/Response Body'
author: John Wu
tags:
  - ASP.NET Core
  - ASP.NET Core 3
  - Middleware
categories:
  - ASP.NET Core
date: 2019-10-25 01:18
featured_image: /images/b/49.png
---

本篇將介紹 ASP.NET Core 3 透過 Middleware 讀寫 Request/Response Body 的用法。  
若對 Middleware 基本知識不熟習的話，可以參考 [ASP.NET Core 3 系列 - Middleware](/article/asp-net-core-3-middleware)。  

<!-- more -->

## 讀取 Request Body

在 Middleware 的 Invoke 可以獲取到 HttpContext，其中會包含 Request 的內容，包含 URL、Header 等。  
Request Body 是 Stream 型別，要取出內容，可以透過 StreamReader 如下：  

```cs
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class FirstMiddleware
    {
        private readonly RequestDelegate _next;

        public FirstMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            string requestContent;

            using (var reader = new StreamReader(context.Request.Body))
            {
                requestContent = await reader.ReadToEndAsync();
                context.Request.Body.Seek(0, SeekOrigin.Begin);
            }

            await _next(context);

            Console.WriteLine($"Request.Body={requestContent}");
        }
    }
}
```

> 注意！`Seek(0, SeekOrigin.Begin)` 非常重要，如果把 Stream 讀完後，不把 Stream Position 還原，之後的 Pipeline、Action 在取得 Request Body 時，會從 Stream 的結尾開始取資料，意味著取出來都是空資料。  

## 讀取 Response Body

Middleware 取得 Response Body 相較於 Request 麻煩很多，因為 Response.Body 的 Stream 並不允許被讀取讀取，但可以被替換。  
所以在 Response.Body 開始被寫入之前，先抽換成 MemoryStream；這樣之後的 Pipeline 在寫入 Response.Body 時，實際上都是寫入到被抽換的 MemoryStream 之中。  
等到下層 Pipeline 都做完的時候，就可以讀取 MemoryStream 的資料，讀完後再把 MemoryStream 寫到真實的 Response.Body。  
範例如下：  

```cs
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class SecondMiddleware
    {
        private readonly RequestDelegate _next;

        public SecondMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            string responseContent;

            var originalBodyStream = context.Response.Body;
            using (var fakeResponseBody = new MemoryStream())
            {
                context.Response.Body = fakeResponseBody;

                await _next(context);

                fakeResponseBody.Seek(0, SeekOrigin.Begin);
                using (var reader = new StreamReader(fakeResponseBody))
                {
                    responseContent = await reader.ReadToEndAsync();
                    fakeResponseBody.Seek(0, SeekOrigin.Begin);

                    await fakeResponseBody.CopyToAsync(originalBodyStream);
                }
            }
            Console.WriteLine($"Response.Body={responseContent}");
        }
    }
}
```

上例 `Seek(0, SeekOrigin.Begin)` 被呼叫了兩次，原因：  

1. `_next(context)` 會寫入內容到 *fakeResponseBody*，導致 Stream Position 會被指到結尾，為了讀取 *fakeResponseBody* 內容，所以要把 Stream Position 指回起始位置。  
2. 讀取完 *fakeResponseBody* 內容後，Stream Position 又會被指到結尾，為了把 *fakeResponseBody* 複製回原本的 Response.Body，所以要把 Stream Position 指回起始位置。  

執行流程如下：  

![ASP.NET Core 3 系列 - Middleware 讀取 Request/Response Body - 範例程式執行流程](/images/b/49.gif)

## 參考

* [Reading request body in ASP.NET Core](https://gunnarpeipman.com/aspnet-core-request-body/)  
* [Calling Request.EnableRewind throw on 3.0.0-preview7](https://github.com/aspnet/AspNetCore/issues/12505)  
