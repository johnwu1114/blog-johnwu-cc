title: ASP.NET Core 教學 - 自訂組態設定檔
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
categories:
  - ASP.NET Core
date: 2017-07-05 18:49:00
---
![ASP.NET Core 教學 - 自訂組態設定檔](/images/asp.net-core.png)

.NET Core 讀取組態設定的方式跟過去有點不同，已經不再使用 ConfigurationManager 來取用組態設定值。  
本篇將介紹 ASP.NET Core 的 Configuration 取用及建議做法。  

<!-- more -->

## 1. 建立組態設定檔

在專案當中建立一個 Configuration 的資料夾，並建立 Settings.json。  
可以依照個人喜好或團隊習慣的方式建立組態檔，檔名跟路徑並沒有特別的規則。  
JSON 的內容也沒有限制，只要是符合 JSON 格式即可，我的範例 Settings.json 就建立的很隨興。  

Configuration\Settings.json
```json
{
  "SupportedCultures": [
    "en-GB",
    "zh-TW",
    "zh-CN"
  ],
  "CustomObject": {
    "Property": {
      "SubProperty": 1,
      "SubProperty2": true,
      "SubProperty3": "This is sub property."
    }
  }
}
```

> 過去 ASP.NET MVC、.NET Application 的組態設定檔預設用 Web.config 或 App.config，採用 XML 格式。  
> 現在 .NET Core 建議採用 JSON 格式，比較簡潔易讀。  

## 2. 載入組態設定

在 Startup.cs 的 ConfigureServices 載入組態設定，並註冊到 Services 中，讓組態設定之後可以被 DI。

Startup.cs
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton(GetSettings());
    }

    private IConfigurationRoot GetSettings()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "Configuration"))
            .AddJsonFile(path: "Settings.json", optional: true, reloadOnChange: true);
        return builder.Build();
    }
}
```
主要是透過 ConfigurationBuilder 產生 IConfigurationRoot 的實例。  
* SetBasePath：設定 Configuration 的目錄位置，如果是放在不同目錄，再把路徑換掉即可。  
* AddJsonFile：
 1. path：加入要被使用組態檔案。  
 2. optional：如果是必要組態檔 optional 就要設定為 false，當檔案不存在就會拋出 FileNotFoundException。  
 3. reloadOnChange：如果檔案被更新，就同步更新 IConfigurationRoot 實例的值。  

## 3. 使用組態設定

透過 DI 取用 IConfigurationRoot 實例，以 Dictionary 的方式取用組態檔的值。  
> 如果不了解 DI 可以參考這篇：[ASP.NET Core 教學 - Dependency Injection](/article/asp-net-core-dependency-injection)  

```cs
public HomeController(IConfigurationRoot config)
{
    var defaultCulture = config["SupportedCultures:1"]; // defaultCulture = "zh-TW"
    var subProperty1 = config["CustomObject:Property:SubProperty1"]; // subProperty1 = "1"
    var subProperty2 = config["CustomObject:Property:SubProperty2"]; // subProperty2 = "True"
    var subProperty3 = config["CustomObject:Property:SubProperty3"]; // subProperty3 = "This is sub property."
}
```
> 從上述範例可以看出，Key 值就是 Settings.json 內容的 Node 名稱，並以 `:` 符號區分階層。  

## 4. 強型別及型態

上面範例有兩個很大的問題：  
1. 使用字串當做 Key 是弱型別，沒辦法在編譯期間檢查出打錯字。  
2. 型態不符合預期，不管是數值或布林值全都是變字串型態。  

要使用強型別，首先要建立相對應的類別，Settings.json 的對應類別如下：
```cs
public class Settings
{
    public string[] SupportedCultures { get; set; }
    public CustomObject CustomObject { get; set; }
}

public class CustomObject
{
    public Property1 Property { get; set; }
}

public class Property1
{
    public int SubProperty1 { get; set; }
    public bool SubProperty2 { get; set; }
    public string SubProperty3 { get; set; }
}
```

修改一下 Startup.cs 的 Services 註冊：
```cs
public void ConfigureServices(IServiceCollection services)
{
    //services.AddSingleton(GetSettings());
    services.Configure<Settings>(GetSettings());
}
```

使用的 DI 改成注入 `IOptions<T>`，如下：
```cs
public HomeController(IOptions<Settings> settings)
{
    var defaultCulture = settings.Value.SupportedCultures[1]; // defaultCulture = "zh-TW"
    var subProperty1 = settings.Value.CustomObject.Property.SubProperty1; // subProperty1 = 1
    var subProperty2 = settings.Value.CustomObject.Property.SubProperty2; // subProperty2 = true
    var subProperty3 = settings.Value.CustomObject.Property.SubProperty3; // subProperty3 = "This is sub property."
}
```

這樣就可以是強型別，且有明確的型態。

## 參考

[Configuration in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration)