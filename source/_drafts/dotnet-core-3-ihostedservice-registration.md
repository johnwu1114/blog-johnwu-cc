---
title: '.NET Core 3 系列 - IHostedService 註冊'
author: John Wu
tags:
  - .NET Core
categories:
  - .NET Core
date: 2019-11-12 22:24
featured_image: /images/featured/net-core.png
---

```cs
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    private static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureServices(services =>
            {
                services.AddHostedService<FirstHostedService>();
                services.AddHostedService<SecondHostedService>();
            });
}

public class FirstHostedService : IHostedService
{
    private readonly ILogger _logger;

    public FirstHostedService(ILogger<FirstHostedService> logger)
    {
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation($"{GetType().Name} - Start");

        // Do Something
        Thread.Sleep(TimeSpan.FromMinutes(1));

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation($"{GetType().Name} - Stop");
        return Task.CompletedTask;
    }
}

public class SecondHostedService : IHostedService
{
    private readonly ILogger _logger;

    public SecondHostedService(ILogger<SecondHostedService> logger)
    {
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation($"{GetType().Name} - Start");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation($"{GetType().Name} - Stop");
        return Task.CompletedTask;
    }
}
```
