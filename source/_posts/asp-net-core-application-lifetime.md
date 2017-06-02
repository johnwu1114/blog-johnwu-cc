title: ASP.NET Core - Application Lifetime
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
categories:
  - ASP.NET Core
date: 2017-06-02 10:22:00
---
![ASP.NET Core - Application Lifetime](/images/pasted-162.png)
 
本篇將介紹 ASP.NET Core 補捉 Application 啟動及停止事件。  

<!-- more -->

## ApplicationLifetime

Application 停起事件對於除錯很重要，ASP.NET Core 不像 ASP.NET MVC 用繼承的方式補捉啟動及停止事件。  
是透過注入的 IApplicationLifetime 來補捉，IApplicationLifetime 需要安裝套件 `Microsoft.AspNetCore.Hosting`。  

IApplicationLifetime 有三個事件可以注冊監聽。如下：  

```cs
public interface IApplicationLifetime
{
	CancellationToken ApplicationStarted { get; }
	CancellationToken ApplicationStopping { get; }
	CancellationToken ApplicationStopped { get; }
	void StopApplication();
}
```

安裝完 `Microsoft.AspNetCore.Hosting` 後，就可以在 Startup.as 的 Configure 注入，在執行其間建立實例時，就可以拿到 IApplicationLifetime 的實體。如下：  

```cs
// ...

public class Startup
{
    private static ILogger _logger;

    public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory, IApplicationLifetime appLifetime)
    {
        _logger = loggerFactory.AddConsole().CreateLogger<Startup>();

        appLifetime.ApplicationStarted.Register(() =>
        {
            _logger.LogDebug("ApplicationLifetime - Started");
        });

        appLifetime.ApplicationStopping.Register(() =>
        {
            _logger.LogDebug("ApplicationLifetime - Stopping");
        });

        appLifetime.ApplicationStopped.Register(() =>
        {
            Thread.Sleep(10 * 1000);
            _logger.LogDebug("ApplicationLifetime - Stopped");
        });

        app.Run(async (context) =>
        {
            await context.Response.WriteAsync("Hello World!");
        });

        // For trigger stop application
        var thread = new Thread(new ThreadStart(()=>
        {
            Thread.Sleep(10 * 1000);
            appLifetime.StopApplication();
        }));
        thread.Start();
    }
}
```

> 我特別用一個 Thread 來觸發停止 Application，這樣才能從 Log 看出觸發順序。  
> 記得要拿掉阿！

## 執行結果

![ASP.NET Core - Application Lifetime](/images/pasted-162.png)