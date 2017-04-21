title: ASP.NET Core + Angular 4 教學 - SignalR
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - npm
  - TypeScript
  - 'C#'
  - SignalR
categories:
  - ASP.NET Core
  - Angular
date: 2017-04-22 00:25:26
---
![ASP.NET Core + Angular 4 教學 - SignalR 範例執行結果](/images/pasted-68.gif)

本篇將介紹 Angular 4 跟 ASP.NET Core 透過 SignalR 的互動，範例是做一個簡單的即時聊天室。

本篇範例是延續 [ASP.NET Core + Angular 4 教學 - Routing](/article/asp-net-core-angular-4-教學-routing.html)  

<!-- more -->

## 安裝 NuGet 套件

ASP.NET Core SignalR 的套件名稱為 Microsoft.AspNetCore.SignalR，是一個非常新的套件，還沒正式發布。在預設的 `nuget.org` 搜尋是找不到它滴！  
首先我們先打開 NuGet 管理員，加入新的套件來源 *https://dotnet.myget.org/f/aspnetcore-ci-dev/api/v3/index.json*，如下：
![NuGet 新增 ASP.NET Core 套件來源](/images/pasted-10.png)

新增來源後，套件管理員的右上角就可以切換來源了。選擇剛剛新增的 `asp.net core` 來源，並勾選搶鮮版(因為還沒正式發佈)，然後就可以搜尋到 Microsoft.AspNetCore.SignalR，但我們實際要安裝的是 **Microsoft.AspNetCore.SignalR.Server**。
![NuGet 安裝 Microsoft.AspNetCore.SignalR.Server](/images/pasted-12.png)

切換回 `nuget.org`，搜尋 **Microsoft.AspNetCore.WebSockets.Server** 並安裝。跟以前有點不一樣，以前安裝完 SignalR 套件後，會一併幫你把 WebSockets 的功能包含在裡面。
![NuGet 安裝 Microsoft.AspNetCore.WebSockets.Server](/images/pasted-15.png)

> SignalR 有四種連線模式，就算不用 WebSockets 也能透過 long polling 連線。但目前版本 long polling 極度不穩定，連線速度超級慢，而且會一直斷線。 

## 安裝 npm 套件

SignalR 相依於 jQuery，所以兩個都要安裝，指令如下：
``` batch
npm install --save signalr jquery
```

## SignalR Server

### 註冊 SignalR 服務

Startup.cs
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Serialization;
using System.IO;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
			
            // services 加入 SignalR
            services.AddSignalR();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.Use(async (context, next) =>
            {
                await next();
                if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value))
                {
                    context.Request.Path = "/index.html";
                    context.Response.StatusCode = 200;
                    await next();
                }
            });
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseMvc();
			
            // middleware 啟用 WebSockets 及 SignalR
            app.UseWebSockets();
            app.UseSignalR();
        }
    }
}
```

### 建立 Hub

Hubs\ChatHub.cs
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
        public override async Task OnConnected()
        {
            await Clients.All.ServerMessage($"[{DateTime.Now.ToString("HH:mm:ss")}] {Context.ConnectionId} joined");
        }

        public override async Task OnDisconnected(bool stopCalled)
        {
            await Clients.All.ServerMessage($"[{DateTime.Now.ToString("HH:mm:ss")}] {Context.ConnectionId} left");
        }

        // 這個方法是用來接收 Client 發出的 Message
        public Task ClientMessage(dynamic data)
        {
            string name = data.name.Value;
            string message = data.message.Value;
			
            return Clients.All.ServerMessage($"[{DateTime.Now.ToString("HH:mm:ss")}] {name}: {message}");
        }
    }
}
```

Hub 中用到 Clients 的泛型是 dynamic。如果沒有自訂介面，開發時不好使用 Clients，因為不會自動跳出可用方法，也可能因為打錯字，在執行階段才發現錯誤。  
Hubs\IChatHub.cs
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

## SignalR Client

隨著範例增加，檔案結構有點小亂，我重新把範例中的結構調整了一下，方便之後繼續擴充。之前有說過的部分都會略過不說明，請直接參考底部的附件。  

### SignalRService

因為 SignalR 是透過 jQuery 調用，為了方便在 Angular 中使用，我建立了一個 SignalRService 包裝 SignalR。  
shared\services\signalr.service.ts
```js
import { Injectable, Inject } from "@angular/core";
import { Subject, Observable } from "rxjs";

declare var $: any;

export enum ConnectionStatus {
    Connected = 1,
    Disconnected = 2,
    Error = 3
}

@Injectable()
export class SignalRService {
    private hubConnection: any;
    private hubProxy: any;
    error: Observable<any>;

    constructor() {
        if ($ === undefined || $.hubConnection === undefined) {
            throw new Error("The '$' or the '$.hubConnection' are not defined...");
        }
        this.hubConnection = $.hubConnection();
        this.hubConnection.url = `//${window.location.host}/signalr`;
    }

    start(hubName: string, debug: boolean = false): Observable<ConnectionStatus> {
        this.hubConnection.logging = debug;
        this.hubProxy = this.hubConnection.createHubProxy(hubName);

        let errorSubject = new Subject<any>();
        this.error = errorSubject.asObservable();
        this.hubConnection.error((error: any) => errorSubject.next(error));

        let subject = new Subject<ConnectionStatus>();
        let observer = subject.asObservable();
        this.hubConnection.start()
            .done(() => subject.next(ConnectionStatus.Connected))
            .fail((error: any) => subject.error(error));
        return observer;
    }

    addEventListener(eventName: string): Observable<any> {
        let subject = new Subject<any>();
        let observer = subject.asObservable();
        this.hubProxy.on(eventName, (data: any) => subject.next(data));
        return observer;
    }

    invoke(eventName: string, data: any): void {
        this.hubProxy.invoke(eventName, data);
    }
}
```

### 載入套件

在 NgModule 注入 SignalRService。  
app\main.ts
```js
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { AppRoutes } from "./app.routes";
import { MenuComponent } from "./shared/components/menu.component";
import { SignalRService } from "./shared/services/signalr.service";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(AppRoutes.getRoutes())
    ],
    declarations: [
        AppComponent,
        MenuComponent,
        AppRoutes.getComponents(),
        
    ],
    providers: [
        SignalRService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

app\bundle-vendors.ts 新增以下兩行：
```js
// jquery
require("jquery");
require("signalr");
```

### Webpack 設定

為了讓 jQuery 能在 Angular 中使用，所以在 plugins 加入了 ProvidePlugin。如下：  
webpack.config.js
```js
plugins: [
	new webpack.ProvidePlugin({
		$: "jquery",
		jQuery: "jquery",
		"window.jQuery": "jquery"
	}),
	new webpack.optimize.UglifyJsPlugin(),
	new webpack.optimize.CommonsChunkPlugin({
		name: "bundle-vendors"
	})
]
```

### Chat rooms

app\components\chat.component.html
```html
<h2>Chat rooms</h2>

<div #records style="height:200px; overflow-y: scroll;">
</div>

<div>
    <label>Name</label>
    <div><input type="text" [(ngModel)]="name" /></div>
</div>
<div>
    <label>Message</label>
    <div><input type="text" [(ngModel)]="message" /></div>
</div>
<div>
    <input type="button" value="Send" (click)="send()" />
    <input type="button" value="Clear" (click)="clear()" />
</div>
```

app\components\chat.component.ts
```js
import { Component, ViewChild, ElementRef } from "@angular/core";
import { SignalRService, ConnectionStatus } from "../shared/services/signalr.service";
import { ResultModel } from "../shared/models/result.model";

@Component({
    template: require("./chat.component.html")
})
export class ChatComponent {
    message: string;
    name: string;
    @ViewChild("records") records: ElementRef;

    constructor(private signalrService: SignalRService) {
        // 啟動 SignalR Client 跟 Server 連線
        signalrService.start("chathub", true).subscribe(
            (connectionStatus: ConnectionStatus) => {
                console.log(`[signalr] start() - done - ${connectionStatus}`);
            },
            (error: any) => {
                console.log(`[signalr] start() - fail - ${error}`);
            });
			
        // 監聽發生錯誤時的事件
        signalrService.error.subscribe((error: any) => {
            console.log(`[signalr] error - ${error}`);
        });
		
        // 監聽 Server 送來的事件，名稱要跟 ChatHub 對應
        signalrService.addEventListener("ServerMessage").subscribe(
            (message: string) => {
                this.records.nativeElement.innerHTML += `<p>${message}<p>`;
            });
    }

    send(): void {
        if (this.name && this.message) {
            // 發送事件到 Server，名稱要跟 ChatHub 對應
            this.signalrService.invoke("ClientMessage", { name: this.name, message: this.message });
        }
    }

    clear(): void {
        this.records.nativeElement.innerHTML = "";
    }
}
```

## 執行結果

![ASP.NET Core + Angular 4 教學 - SignalR 範例執行結果](/images/pasted-68.gif)

## 參考

[ASP.NET Core SignalR](https://github.com/aspnet/SignalR/)

## 載點

[ASP.NET Core + Angular 4 教學 - SignalR.zip](https://1drv.ms/u/s!AlHB4uP4MF7SiBklA-jhoswAzJQR)