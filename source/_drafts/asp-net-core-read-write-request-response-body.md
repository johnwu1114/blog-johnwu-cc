---
title: 'ASP.NET Core 2 教學 - 讀寫 Request/Response Body'
author: John Wu
tags:
  - ASP.NET Core
  - Middleware
categories:
  - ASP.NET Core
date: 2019-07-24 23:24
featured_image: /images/featured/asp-net-core.png
---

 
<!-- more -->

*LoggingMiddleware.cs*
```cs
public class LoggingMiddleware
{
    private readonly ILogger _logger;
    private readonly RequestDelegate _next;

    public LoggingMiddleware(ILogger<LoggingMiddleware> logger, RequestDelegate next)
    {
        _logger = logger;
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var stopwatch = new Stopwatch();
        stopwatch.Start();

        string requestContent;
        string responseContent;

        var originalBodyStream = context.Response.Body;
        using (var responseBody = new MemoryStream())
        {
            context.Response.Body = responseBody;

            await _next(context);

            context.Request.Body.Seek(0, SeekOrigin.Begin);
            using (var reader = new StreamReader(context.Request.Body))
            {
                requestContent = reader.ReadToEnd();
            }

            responseBody.Seek(0, SeekOrigin.Begin);
            using (var reader = new StreamReader(responseBody))
            {
                responseContent = reader.ReadLine();
                responseBody.Seek(0, SeekOrigin.Begin);

                await responseBody.CopyToAsync(originalBodyStream);
            }
        }

        stopwatch.Stop();
        var duration = stopwatch.Elapsed.TotalSeconds;
        _logger.LogTrace($"request:{requestContent}|response:{responseContent}|sec:{duration:0.000000}");
    }
}
```

*Startup.cs*
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        app.UseMiddleware<LoggingMiddleware>();

        app.Run(async (context) =>
        {
            await context.Response.WriteAsync("Hello World! \r\n");
        });
    }
}
```
