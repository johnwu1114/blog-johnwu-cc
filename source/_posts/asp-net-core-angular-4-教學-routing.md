title: ASP.NET Core + Angular 4 教學 - Routing
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - TypeScript
  - 'C#'
  - Web Api
  - Routing
categories:
  - ASP.NET Core
  - Angular
date: 2017-04-20 00:54:00
---
![ASP.NET Core + Angular 4 教學 - Routing 範例執行結果](/images/pasted-11.gif)

本篇將介紹 Angular 4 的 Routing 實現 Single Page Application(SPA)，以及 Angular 4 跟 ASP.NET Core 的 Routing 共存的方法。  
前端 Angular 4 Routing 產生的虛擬 URL，並不是真的存在於 ASP.NET Core 的 Routing，所以重載頁面或從瀏覽器網址輸入，會變成 404 找不到網頁。  

<!-- more -->

程式碼延續之前範例：  
[ASP.NET Core + Angular 4 教學 - Web Api CRUD](/article/asp-net-core-angular-4-教學-web-api-crud.html)  

## 1. Angular 4 Routing

我把上次範例中 `app.component.*` CRUD 的部分，移出到 `contacts.component.*`，並新增 `contacts-list.component.*` 及 `error.component.*`。  
這三個 `contacts.component.*`、`contacts-list.component.*` 及 `error.component.*` 的程式碼會略過不說明，請直接參考底部的附件。  

### 1.1 根路徑

首先我們要設定 Angular 4 Routing 的根路徑，在 wwwroot\index.html 的 `<head>` 加入下面這行：
```html
<base href="/">
```
> 設定成 `/` 的意思是在 Angular 4 切換不同頁面時，都會以 `http://{doamin}/` 為主，如果你的 Angular 4 進入點是 `http://{doamin}/app/`，那 base 就要設定成 `/app/`。

### 1.2 Route Maps

新增 wwwroot\app\route-maps.ts  
```js
import { Route } from "@angular/router";
import { ContactsComponent } from "./contacts/contacts.component";
import { ContactsListComponent } from "./contacts/contacts-list.component";
import { ErrorComponent } from "./error.component";

interface RouteItem extends Route {
    menuName?: string;
    children?: RouteItem[];
}

const routes: RouteItem[] = [
    {
        path: "",
        redirectTo: "contacts",
        pathMatch: "full",
    },
    {
        path: "contacts",
        menuName: "Contacts",
        children: [
            {
                path: "",
                component: ContactsListComponent,
            },
            {
                path: "create",
                menuName: "New Contact",
                component: ContactsComponent,
            },
            {
                path: ":id",
                component: ContactsComponent,
            }
        ]
    },
    {
        path: "error",
        children: [
            {
                path: "",
                component: ErrorComponent
            },
            {
                path: ":id",
                component: ErrorComponent
            }
        ]
    },
    {
        path: "**",
        redirectTo: "error"
    }
];

export class RouteMaps {
    public static getRoutes(): RouteItem[] {
        return routes;
    }

    public static getComponents(): any[] {
        let result = this.findComponents(routes).filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        return result;
    }

    private static findComponents(routes: Route[]) {
        let arr: any[] = [];
        routes.forEach(item => {
            if (item.component != null) {
                arr.push(item.component);
            }
            if (item.children != null) {
                this.findComponents(item.children).forEach(com => {
                    arr.push(com);
                });
            }
        });

        arr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        return arr;
    }
}
```

* RouteItem - 為了擴充 Route 的屬性，要用來產生 Menu，所以自訂了一個 RouteItem 繼承 Angular 本來的 Route。
* RouteMaps
 * getRoutes - 取得 routes。其實也可以 export routes，但是我不喜歡，包裝看起來比較舒服。
 * getComponents - 取得 routes 中全部的 Component。
 * findComponents - 遞迴找出 routes 中全部的 Component，並且過濾掉重複的 Component。

### 1.3 Menu

新增 wwwroot\app\shared\menu.component.ts  
```js
import { Component, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { RouteMaps } from "../route-maps";

@Component({
    selector: "menu-comp",
    template: require("./menu.component.html"),
})
export class MenuComponent {
    menu: any[] = [];

    constructor() {
        this.menu = RouteMaps.getRoutes();
    }
}
```

新增 wwwroot\app\shared\menu.component.html  
```html
<template ngFor let-item [ngForOf]="menu">
    <li *ngIf="item.menuName">
        <a [routerLink]="['/',item.path]">
            {{item.menuName}}
        </a>
        <ul *ngIf="item.children">
            <template ngFor let-sub [ngForOf]="item.children">
                <li *ngIf="sub.menuName">
                    <a [routerLink]="sub.path?['/',item.path,sub.path]:['/',item.path]">{{sub.menuName}}</a>
                </li>
            </template>
        </ul>
    </li>
</template>
```

### 1.4 Import routing

wwwroot\app\main.ts
```js
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { RouteMaps } from "./route-maps";
import { MenuComponent } from "./shared/menu.component";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(RouteMaps.getRoutes())
    ],
    declarations: [
        AppComponent,
        MenuComponent,
        RouteMaps.getComponents()
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```
> 之所以會在 RouteMaps 寫 getComponents，就是不想在 declarations 一個一個輸入。


wwwroot\app\app.component.html
```html
<h1>Hello {{name}}</h1>

<menu-comp></menu-comp>

<router-outlet></router-outlet>
```

### 1.5 執行結果

![ASP.NET Core + Angular 4 教學 - 範例執行結果](/images/pasted-11.gif)

### 1.6 重載頁面

此範例 Angular 4 進入點是 index.html，如果在 `http://{doamin}/` 以外的地方載入，就會變成 404 找不到網頁。  
![ASP.NET Core + Angular 4 教學 - Routing 範例重載頁面失敗](/images/pasted-66.gif)

## 2. ASP.NET Core Routing

為了讓 Angular 4 Routing 可以正常運作，我們要在 Startup.cs 做一點手腳。
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
        }
    }
}
```
> 加入了一個 Middleware，當發生 StatusCode 404，並且 URL 不帶有附檔名時，就導頁到 index.html。

### 重載頁面

![ASP.NET Core + Angular 4 教學 - Routing 範例重載頁面正常](/images/pasted-67.gif)

## 程式碼下載

[asp-net-core-angular-web-api-crud](https://github.com/johnwu1114/asp-net-core-angular-web-api-crud)