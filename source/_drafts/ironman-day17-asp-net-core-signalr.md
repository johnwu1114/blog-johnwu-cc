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
featured_image: /images/pasted-69p.png
---

SignalR 是一套能讓 ASP.NET 輕鬆實現與 Client 即時互動的套件。  
目前 ASP.NET Core 版本的 SignalR 還沒正式發佈，可以先嘗鮮使用，但不建議正是產品使用。  
本篇將介紹 ASP.NET Core 透過 SignalR 做一個簡單的即時聊天室。  

<!-- more -->

## 安裝套件

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

## SignalR Server

### 註冊 SignalR 服務

在 `Startup.ConfigureServices` 加入 SignalR 的服務，同時在 `Startup.Configure` 將 SignalR 加入至 Pipeline。  
由於 ASP.NET Core 底層都是改用 DI 的機制注入需要的功能；因此，要用 WebSockets 連線的話要自己加至 Pipeline。  

**Startup.cs**  
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseWebSockets();
            app.UseSignalR();
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

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>ASP.NET Core SignalR Chat</title>
    <script src="//ajax.aspnetcdn.com/ajax/jQuery/jquery-1.12.4.min.js"></script>
    <script src="//ajax.aspnetcdn.com/ajax/signalr/jquery.signalr-2.2.2.min.js"></script>
</head>
<body>
    <div>
        <h1>Chat rooms</h1>
        <div id="chat" style="height:300px; overflow-y: scroll;"></div>
        <div>
            <label>Name</label><br />
            <input type="text" id="name" />
        </div>
        <div>
            <label>Message</label><br />
            <input type="text" id="message" />
        </div>
        <div>
            <input type="button" value="Send" id="send" />
            <input type="button" value="Clear" id="clear" />
        </div>
    </div>
    <script>
        $(function () {
            var hubConnection = $.hubConnection();
            var hubProxy = hubConnection.createHubProxy("chathub");
            hubProxy.on("ServerMessage", function (data) {
                $("#chat").append(data + "<br />");
            });
            hubConnection.start();

            $(document).on("click", "#send", function () {
                hubProxy.invoke("ClientMessage", {
                    "name": $("#name").val(),
                    "message": $("#message").val()
                });
            });

            $(document).on("click", "#clear", function () {
                $("#chat").html("");
            });
        });
    </script>
</body>
</html>
```

## 執行結果

![[鐵人賽 Day17] ASP.NET Core 2 系列 - SignalR - 範例執行結果](/images/pasted-69.gif)

## 參考

[ASP.NET Core SignalR](https://github.com/aspnet/SignalR/)  
[SignalR - Documentation](https://github.com/SignalR/SignalR/wiki)