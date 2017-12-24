---
title: '[鐵人賽 Day05] ASP.NET Core 2 系列 - 瀏覽靜態檔案 (Static Files)'
author: John Wu
tags:
  - ASP.NET Core
  - Middleware
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-24 12:00
featured_image: /images/i05-1.png
---

過去 ASP.NET 網站，只要把 `*.html`、`*.css`、`*.jpg`、`*.png`、`*.js` 等靜態檔案放在專案根目錄，預設都可以直接被瀏覽；但 ASP.NET Core 小改了瀏覽靜態檔案的方式，預設根目錄不再能瀏覽靜態檔案，需要指定靜態檔案的目錄，才可以被瀏覽。  
本篇將介紹 ASP.NET Core 瀏覽靜態檔案的方法。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day05] ASP.NET Core 2 系列 - 瀏覽靜態檔案 (Static Files)](https://ithelp.ithome.com.tw/articles/10193208)  
 
<!-- more -->

試著在專案根目錄及 **wwwroot** 目錄中加入靜態檔案，例如：  

*專案目錄\index.html*
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>MyWebsite</title>
</head>
<body>
    專案 根目錄的 index.html
</body>
</html>
```

*專案目錄\wwwroot\index.html*
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>MyWebsite</title>
</head>
<body>
    wwwroot 目錄的 index.html
</body>
</html>
```

然後在網址列輸入：  
* `http://localhost:5000/index.html`  
* `http://localhost:5000/wwwroot/index.html`  
會發現以上兩個連結都沒有辦法開啟 index.html。  

> 瀏覽靜態檔案，需要 `Microsoft.AspNetCore.StaticFiles` 套件。  
 ASP.NET Core 2.0 以上版本，預設是參考 `Microsoft.AspNetCore.All`，已經包含 `Microsoft.AspNetCore.StaticFiles`，所以不用再安裝。  
 如果是 ASP.NET Core 1.0 的版本，可以透過 .NET Core CLI 在專案資料夾執行安裝指令：  
 ```sh
dotnet add package Microsoft.AspNetCore.StaticFiles
 ```

## 啟用靜態檔案

在 *Startup.cs* 的 `Configure` 對 `IApplicationBuilder` 使用 `UseStaticFiles` 方法註冊靜態檔案的 Middleware：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseStaticFiles();

        // ...
        
        app.Run(async context =>
        {
            await context.Response.WriteAsync("Hello World! \r\n");
        });
    }
}
```

`UseStaticFiles` 預設啟用靜態檔案的目錄是 **wwwroot**，設定完成後再次嘗試開啟 URL：  
* `http://localhost:5000/index.html`  
 開啟的內容會是：*wwwroot 目錄的 index.html*。
* `http://localhost:5000/wwwroot/index.html`  
 依然無法顯示靜態檔案。

`UseStaticFiles` 註冊的順序可以在外層一點，比較不會經過太多不必要的 Middleware。如圖：  

![[鐵人賽 Day05] ASP.NET Core 2 系列 - 瀏覽靜態檔案](/images/i05-1.png)  
> 當 Requset 的 URL 檔案不存在，則會轉向到 `Run` 的事件(如灰色箭頭)。


### 變更網站目錄

預設網站目錄是 **wwwroot**，如果想要變更此目錄，可以在 *Program.cs* 的 WebHost Builder 用 `UseWebRoot` 設定網站預設目錄。  
例如：把預設網站目錄 **wwwroot** 改為 **public**，如下：  

*Program.cs*
```cs
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace MyWebsite
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseWebRoot("public")
                .UseStartup<Startup>()
                .Build();
    }
}
```

### 啟用指定目錄

由於 `UseStaticFiles` 只能拿到預設資料夾底下的檔案，某些情況會需要特定目錄也能使用靜態檔案。  
例如：用 npm 安裝的套件都放在專案目錄底下的 **node_modules**。  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseStaticFiles();
        app.UseStaticFiles(new StaticFileOptions()
        {
            FileProvider = new PhysicalFileProvider(
                Path.Combine(Directory.GetCurrentDirectory(), @"node_modules")),
            RequestPath = new PathString("/third-party")
        });
        // ...
    }
}
```

以上設定就會把 URL `http://localhost:5000/third-party/example.js` 指向到 **專案目錄\node_modules\example.js**。

## 預設檔案

比較友善的使用者經驗會希望 `http://localhost:5000/` 可以自動指向到 index.html。  
能透過 `UseDefaultFiles` 設定靜態檔案目錄的預設檔案。   

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseDefaultFiles();
        app.UseStaticFiles();
        // ...
    }
}
```
* `UseDefaultFiles`的職責是嘗試請求預設檔案。  
* `UseStaticFiles` 的職責是回傳請求的檔案。  

> `UseDefaultFiles` 必須註冊在 `UseStaticFiles` 之前。  
如果先註冊 `UseStaticFiles`，當 URL 是 **/** 時，`UseStaticFiles` 找不到該檔案，就會直接回傳找不到；所以就沒有機會進到 `UseDefaultFiles`。  

### 自訂預設檔案

`UseDefaultFiles`的預設檔案如下：  
* default.htm  
* default.html  
* index.htm  
* index.html  

如果預設檔案的檔名不在上列清單，也可以自訂要用什麼名稱當作預設檔案。  
透過 `DefaultFilesOptions` 設定後，傳入 `UseDefaultFiles`：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        var defaultFilesOptions = new DefaultFilesOptions();
        defaultFilesOptions.DefaultFileNames.Add("custom.html");
        app.UseDefaultFiles(defaultFilesOptions);
        app.UseStaticFiles();
        // ...
    }
}
```

## 檔案清單

基本上為了網站安全性考量，不應該讓使用者瀏覽伺服器上面的檔案清單，但如果真有需求要讓使用者瀏覽檔案清單也不是不行。  

在 *Startup.cs* 的 `Configure` 對 `IApplicationBuilder` 使用 `UseFileServer` 方法註冊檔案伺服器的功能：  

*Startup.cs*
```cs
// ...
public class Startup
{
    // ...
    public void Configure(IApplicationBuilder app)
    {
        app.UseFileServer(new FileServerOptions()
        {
            FileProvider = new PhysicalFileProvider(
                Path.Combine(Directory.GetCurrentDirectory(), @"bin")
            ),
            RequestPath = new PathString("/StaticFiles"),
            EnableDirectoryBrowsing = true
        });
    }
}
```

當連入 `http://localhost:5000/StaticFiles` 時，就指向到 **專案目錄\bin\** 目錄，並且可以直接瀏覽檔案目錄及檔案內，如下：  

![[鐵人賽 Day05] ASP.NET Core 2 系列 - 瀏覽檔案清單](/images/i05-2.png)  

## 參考

[Working with static files in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/static-files)  