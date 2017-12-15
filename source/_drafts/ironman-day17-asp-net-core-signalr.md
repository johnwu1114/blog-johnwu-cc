---
title: '[鐵人賽 Day17] ASP.NET Core 2 系列 - SignalR'
author: John Wu
tags:
  - ASP.NET Core
  - 2018 iT 邦幫忙鐵人賽
  - SignalR
categories:
  - ASP.NET Core
date: 2018-01-05 23:17
featured_image: /images/i17-1.png
---

SignalR 是一套能讓 ASP.NET 輕鬆實現與 Client 即時互動的套件。  
目前 ASP.NET Core 版本的 SignalR 還沒正式發佈，可以先嘗鮮使用，但不建議正是產品使用。  
本篇將介紹 ASP.NET Core 透過 SignalR 做一個簡單的即時聊天室。  

<!-- more -->

## 安裝套件

### NuGet 套件

ASP.NET Core 架設 SignalR Server 需安裝的套件 `Microsoft.AspNetCore.SignalR.Server`，由於還沒正式發布。所以在預設的 `nuget.org` 沒有辦法安裝它。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.AspNetCore.SignalR.Server -s https://dotnet.myget.org/f/aspnetcore-dev/api/v3/index.json
```

執行後應該會出現錯誤訊息如下：  
```
info : Adding PackageReference for package 'Microsoft.AspNetCore.SignalR.Server' into project 'C:\Users\me\Desktop\MyWebsite\MyWebsite.csproj'.
log  : Restoring packages for C:\Users\me\Desktop\MyWebsite\MyWebsite.csproj...
info :   CACHE https://api.nuget.org/v3-flatcontainer/microsoft.aspnetcore.signalr.server/index.json
info :   CACHE https://dotnetmyget.blob.core.windows.net/artifacts/aspnetcore-dev/nuget/v3/flatcontainer/microsoft.aspnetcore.signalr.server/index.json
error: Unable to find a stable package Microsoft.AspNetCore.SignalR.Server with version
error:   - Found 10 version(s) in https://dotnet.myget.org/f/aspnetcore-dev/api/v3/index.json [ Nearest version: 0.2.0-preview2-22504 ]
error:   - Found 1 version(s) in nuget.org [ Nearest version: 0.0.1-alpha ]
error:   - Found 0 version(s) in Microsoft Visual Studio Offline Packages
error:   - Found 0 version(s) in CliFallbackFolder
error: Package 'Microsoft.AspNetCore.SignalR.Server' is incompatible with 'all' frameworks in project 'C:\Users\me\Desktop\MyWebsite\MyWebsite.csproj'.
```

可以看到第 6 行有找到 10 個版本，後帶有最新版的版號。  
因為還不是穩定版，所以安裝需要帶上版號資訊。指令如下：
```sh
dotnet add package Microsoft.AspNetCore.SignalR.Server -v 0.2.0-preview2-* -s https://dotnet.myget.org/f/aspnetcore-dev/api/v3/index.json
```

過去 ASP.NET 安裝 SignalR 時，因為 SignalR 相依 WebSockets Server，所以一併安裝 WebSockets Server 套件。 
但現在 ASP.NET Core 底層都是改用 DI 的機制，因此 WebSockets Server 對 SignalR 不再是必要的套件，所以要用 WebSockets 連線的話要自己安裝 `Microsoft.AspNetCore.WebSockets.Server` 套件。指令如下：
```sh
dotnet add package Microsoft.AspNetCore.WebSockets.Server
```

> SignalR 有四種連線模式，就算不用 WebSockets 也能透過 Long Polling 連線。  
 但目前版本 Long Polling 極度不穩定，連線速度超級慢，而且會一直斷線。 

### npm 套件

透過 npm 安裝 ASP.NET Core SignalR Client 需要的安裝，指令如下：
``` batch
npm install --save @aspnet/signalr-client
```

## SignalR Server

### 註冊 SignalR 服務

在 `Startup.ConfigureServices` 加入 SignalR 的服務，同時在 `Startup.Configure` 加入 WebSockets 及 SignalR 的 Pipeline。   
**Startup.cs**  
```cs
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddSignalR();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseMvcWithDefaultRoute();
            app.UseWebSockets();
            app.UseSignalR();

            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "node_modules/@aspnet/signalr-client/dist/browser/"
                    )
                ),
                RequestPath = new PathString("/js")
            });
        }
    }
}
```

### 建立 Hub

SignalR Hub 中用到的 Clients 是 dynamic 型別，因為沒有強型別的方法操作 Clients，也可能因為打錯字，在執行階段才發現錯誤。  
所以建議定義介面控制 SignalR Hub 會使用到的方法。  
*Hubs\IChatHub.cs*  
```cs
using System.Threading.Tasks;

namespace MyWebsite.Hubs
{
    public interface IChatHub
    {
        // 這個方法是用來發出 Message 給 Client
        Task ServerMessage(string message);
    }
}
```

*Hubs\ChatHub.cs*
```cs
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Hubs;
using System;
using System.Threading.Tasks;

namespace MyWebsite.Hubs
{
    // HubName 一定要小寫開頭。
    // 如果沒有指定 HubName，第一個字元會被自動轉為小寫。例：ChatHub => chatHub
    [HubName("chathub")]
    public class ChatHub : Hub<IChatHub>
    {
        private string Now => DateTime.Now.ToString("HH:mm:ss");

        public override async Task OnConnected()
        {
            await Clients.All.ServerMessage($"[{Now}] {Context.ConnectionId} joined");
        }

        public override async Task OnDisconnected(bool stopCalled)
        {
            await Clients.All.ServerMessage($"[{Now}] {Context.ConnectionId} left");
        }

        // 這個方法是用來接收 Client 發出的 Message
        public Task ClientMessage(dynamic data)
        {
            string name = data.name.Value;
            string message = data.message.Value;

            return Clients.All.ServerMessage($"[{Now}] {name}: {message}");
        }
    }
}
```

## SignalR Client

TODO

## 執行結果

![ASP.NET Core + Angular 4 教學 - SignalR 範例執行結果](/images/pasted-69.gif)

## 參考

[ASP.NET Core SignalR](https://github.com/aspnet/SignalR/)  