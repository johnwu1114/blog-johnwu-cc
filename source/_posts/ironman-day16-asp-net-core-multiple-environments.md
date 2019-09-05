---
title: '[鐵人賽 Day16] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - Configuration
categories:
  - ASP.NET Core
date: 2018-01-04 12:00
featured_image: /images/ironman/i16-3.png
---

產品從開發到正式上線的過程中，通常都會有很多個環境，如：開發環境、測試環境及正式環境等。  
每個環境的組態設定可能都略有不同，至少資料庫不會都連到同一個地方，因此就會有不同環境組態設定的需求。  
ASP.NET Core 就提供了相關的環境 API，透過環境 API 取得執行環境的資訊，進而做對應處理。  
本篇將介紹 ASP.NET Core 的多重環境組態管理。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day16] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments)](https://ithelp.ithome.com.tw/articles/10195745)  
 
<!-- more -->

## 環境名稱

環境 API 可以讀取執行程式的環境資訊，例如：環境名稱、網站實體路徑、網站名稱等。  
其中環境名稱就是用來判斷執行環境的主要依據，環境名稱是從系統變數為 `ASPNETCORE_ENVIRONMENT` 的內容而來。  

ASP.NET Core 預設將環境分為三種：  
* **Development**：開發環境  
* **Staging**：暫存環境(測試環境)  
* **Production**：正式環境

要取得系統變數 `ASPNETCORE_ENVIRONMENT`，可以透過注入 `IHostingEnvironment` API。範例如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        env.EnvironmentName = EnvironmentName.Development;

        if (env.IsDevelopment()) {
           // Do something...
        }

        app.Run(async (context) =>
        {
            await context.Response.WriteAsync(
                $"EnvironmentName: {env.EnvironmentName}\r\n"
              + $"IsDevelopment: {env.IsDevelopment()}"
            );
        });
    }
}
```

網站啟動時，`IHostingEnvironment` 會從系統變數 `ASPNETCORE_ENVIRONMENT` 取得資料後，填入 `EnvironmentName`，該值也可以從程式內部直接指派。  
環境名稱並沒有特定的限制，它可以是任意的字串，不一定要被預設的三種分類限制。  

例如自訂一個 **Test** 的環境。如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        env.EnvironmentName = "Test";
        
        if (env.IsDevelopment()) {
           // Do something...
        } else if (env.IsEnvironment("test")) {
           // Do something...
        }

        app.Run(async (context) =>
        {
            await context.Response.WriteAsync(
                $"EnvironmentName: {env.EnvironmentName}\r\n"
              + $"This is test environment: {env.IsEnvironment("test")}");
        });
    }
}
```
> 建議判斷環境透過 `env.IsEnvironment("EnvironmentName")`，`IsEnvironment()` 會忽略大小寫差異。  

## 組態設定

組態設定檔可以在不同環境都各有一份，或許大部分的內容是相同的，但應該會有幾個設定是不同的。如：資料庫連線字串。  
環境名稱也可以跟組態設定檔混用，利用組態設定檔後帶環境名稱，作為不同環境會取用的組態設定檔。  

例如：  
有一個組態設定檔為 *settings.json*，內容如下：  

*Configuration\settings.json*
```json
{
  "SupportedCultures": [
    "en-GB",
    "zh-TW",
    "zh-CN"
  ],
  "CustomObject": {
    "Property": {
      "SubProperty1": 1,
      "SubProperty2": true,
      "SubProperty3": "This is sub property."
    }
  },
  "DBConnectionString": "Server=(localdb)\\mssqllocaldb;Database=MyWebsite;"
}
```

正式環境也建立一個名稱相同的檔案，並帶上環境名稱 *settings.Production.json*，內容如下：  

*Configuration\settings.Production.json*
```json
{
  "DBConnectionString": "Data Source=192.168.1.5;Initial Catalog=MyWebsite;Persist Security Info=True;User ID=xxx;Password=xxx"
}
```

載入組態設定方式：  

*Program.cs*
```cs
using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, config) =>
                {
                    var env = hostContext.HostingEnvironment;
                    config.SetBasePath(Path.Combine(env.ContentRootPath, "Configuration"))
                        .AddJsonFile(path: "settings.json", optional: false, reloadOnChange: true)
                        .AddJsonFile(path: $"settings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);
                })
                .UseStartup<Startup>()
                .Build();
        }
    }
}
```

讀取組態設定檔時，會先讀取 *settings.json* 並設定 `optional=false`，指定該檔為必要檔案；再讀取 *settings.{env.EnvironmentName}.json* 檔案。
組態檔載入的特性是當遇到 Key 值重複時，後面載入的設定會蓋掉前面的設定。  

以此例來說，當 *settings.Production.json* 載入後，就會把 *settings.json* 的 DBConnectionString 設定蓋掉，而 *settings.json* 其它的設定依然能繼續使用。  

> 前篇[[鐵人賽 Day15] ASP.NET Core 2 系列 - 組態設定 (Configuration)](/article/ironman-day15-asp-net-core-configuration.html) 有介紹讀取組態設定檔。  

## 環境設定

利用系統變數 `ASPNETCORE_ENVIRONMENT` 能判斷環境的特性，可以在各環境的電腦設定環境名稱。  
當程式佈署到該環境後，運行時就會套用該台電腦的系統變數。  

### Windows

Windows 系統變數的設定方式如下：
 **控制台** -> **系統及安全性**  -> **系統**
![[鐵人賽 Day16] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments) - 環境變數1](/images/ironman/i15-1.png)  
![[鐵人賽 Day16] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments) - 環境變數2](/images/ironman/i16-1.png)  

Windows 也可以用指令：
```sh
SETX ASPNETCORE_ENVIRONMENT "Production" /M
```
> 需要用**系統管理員**權限執行。  
> 如果設定完沒有生效，試著重新登入或重開機。  

### Linux\macOS

Linux\macOS 可以在 `/etc/profile` 加入環境變數：
```sh
export ASPNETCORE_ENVIRONMENT="Production"
```

### IIS

IIS 的 *Web.config* 也可以設定環境變數：  

*Web.config*
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModule" resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="dotnet" arguments=".\MyWebsite.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout">
      <environmentVariables>
        <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
      </environmentVariables>
    </aspNetCore>
  </system.webServer>
</configuration>
```

### Visual Studio Code

如果是用 VS Code 開發的話，可以在 *launch.json* 找到 `ASPNETCORE_ENVIRONMENT` 的設定如下：  

*launch.json*
```json
{
   "version": "0.2.0",
   "configurations": [
        {
            "name": ".NET Core Launch (web)",
            "type": "coreclr",
            // ...
            "env": {
                "ASPNETCORE_ENVIRONMENT": "Development"
            },
            // ...
        },
        // ...
    ]
}
```

透過 VS Code 啟動 **.NET Core Launch (web)** 時，就會套用該設定的環境名稱。如下：  

![[鐵人賽 Day16] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments) - Visual Studio Code](/images/ironman/i16-2.png)  

### Visual Studio IDE

若以 Visual Studio IDE 開發(如 Visual Studio 2017)，可以從 UI 設定環境名稱。如下：  
![[鐵人賽 Day16] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments) -Visual Studio 2017](/images/ironman/i16-3.png)  

或者從 *Properties\launchSettings.json* 設定：  

*Properties\launchSettings.json*
```json
{
    // ...
    "profiles": {
        // ...
        "MyWebsite": {
            "commandName": "Project",
            "launchBrowser": true,
            "environmentVariables": {
                "ASPNETCORE_ENVIRONMENT": "Local"
            },
            "applicationUrl": "http://localhost:5000/"
        }
    }
}
```

用 Visual Studio 2017 啟動網站後，就會套用該設定的環境名稱。如下：  
![[鐵人賽 Day16] ASP.NET Core 2 系列 - 多重環境組態管理 (Multiple Environments) -Visual Studio 2017](/images/ironman/i16-4.png)  

## 參考

[Working with multiple environments](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/environments)  