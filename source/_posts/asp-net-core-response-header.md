title: ASP.NET Core 教學 - 移除 Response Header 資訊
author: John Wu
tags:
  - ASP.NET Core
  - IIS
categories:
  - ASP.NET Core
date: 2017-08-01 22:48:00
---
![ASP.NET Core 教學 - 移除 Response Header 資訊](/images/pasted-258.png)

ASP.NET Core 預設會在每個 Response 的 Header 帶上 Server 資訊。看似沒什麼影響，但存在兩個小問題：  
1. 資安問題：讓別人知道使用的技術，有可能會針對該技術的漏洞攻擊。  
2. 浪費流量：每個 Response 都帶有不必要的內容時，就是積沙成塔的浪費。  

本篇將介紹如何移除 ASP.NET Core 的 Response Header 資訊。

<!-- more -->

## 移除 Server 資訊

在 ASP.NET Core 的程式進入點，建立 `IWebHostBuilder` 的地方，找到 `UseKestrel`，設定 `AddServerHeader = false`。
```cs
public class Program
{
    public static void Main(string[] args)
    {
        var host = new WebHostBuilder()
            .UseKestrel(c => c.AddServerHeader = false)
            .UseContentRoot(Directory.GetCurrentDirectory())
            .UseIISIntegration()
            .UseStartup<Startup>()
            .UseApplicationInsights()
            .Build();

        host.Run();
    }
}
```

## 移除 X-Powered-By 資訊

你可能會想說從 Middleware 移除 `X-Powered-By`，但 `X-Powered-By` 並不是在 ASP.NET Core 中產生出來的內容！  
`X-Powered-By` 是由 IIS 加入的資訊，有兩種移除方式：  
1. 從 IIS 移除  
2. 從 web.config 移除  

> 如果你的 ASP.NET Core 不是在 IIS 上執行，就不會遇到此問題。

### IIS

![ASP.NET Core 教學 - IIS 移除 X-Powered-By](/images/pasted-259.png)

### web.config 

在該網站的 web.config 中，找到 `<system.webServer>` 新增 `<httpProtocol>` 包含如下內容：
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <!-- ... -->
        <httpProtocol>
            <customHeaders>
                <remove name="X-Powered-By" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
```

## 執行結果

![ASP.NET Core 教學 - 移除 Response Header 資訊 - 執行結果](/images/pasted-260.png)