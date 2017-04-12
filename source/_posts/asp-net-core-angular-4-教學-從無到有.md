title: ASP.NET Core + Angular 4 教學 - 從無到有
author: John Wu
tags:
  - Nodejs
  - ASP.NET Core
  - .NET Core
  - Angular
  - Angular 4
  - Visual Studio
  - npm
  - TypeScript
  - 'C#'
categories:
  - ASP.NET Core
  - Angular
date: 2017-04-12 21:30:00
---
## 前言

安裝軟體的部分我就沒有詳細介紹，以下是我使用到的工具跟語言。

開發工具：
1. Visual Studio 2017 (可使用其他版，只要有支援 ASP.NET Core 開發就可以。)
2. Node.js

開發語言：
1. .NET Core 使用 C#
2. Angular 4 使用 TypeScript

## 建立 ASP.NET Core 專案

打開 Visual Studio 2017 後，按下 `Ctrl` + `Shift` + `N`。

![新增 ASP.NET Core Web 應用程式](/images/pasted-21.png)

我個人是喜歡一步一步自己建置需要的東西，所以我選擇*空白專案範本*。

![建立 ASP.NET Core 空白專案範本](/images/pasted-35.png)

### 專案內容

建立完成後，可以看到方案總管很乾淨。

![方案總管 ASP.NET Core 空白範本](/images/pasted-36.png)

因為我有點程式碼潔癖，所以我把 Startup.cs 內，暫時不會用到的程式碼移除，其他的部分就先不動。  
Startup.cs 內容如下：
``` cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace MyWebsite
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app)
        {
            app.Run(async (context) =>
            {
                var message = "This is example for ASP.NET Core from blog.johnwu.cc";
                await context.Response.WriteAsync(message);
            });
        }
    }
}
```

### 執行結果

![MyWebsite Write Message](/images/pasted-37.png)

## 安裝 Angular 4 套件

### 建立 npm package

npm package 可以直接在 ASP.NET Core 專案新增檔案 package.json，或者是用指令。  
新增 npm package 指令如下：

``` batch
npm init -y
```

執行完就可以看到他自動幫你建立的內容：

![建立 npm package](/images/pasted-41.png)

由於我的程式碼潔癖又發作，所以我把 package.json 改成：

``` json
{
  "name": "my-website",
  "version": "1.0.0",
  "description": "This is example for Angular 4 from blog.johnwu.cc"
}
```

### 主要套件

安裝 Angular 4 執行時所需的套件，指令如下：
``` batch
npm install --save @angular/common@latest @angular/compiler@latest @angular/core@latest @angular/forms@latest @angular/http@latest @angular/platform-browser@latest @angular/platform-browser-dynamic@latest @angular/router@latest core-js@latest rxjs@latest systemjs@latest zone.js@latest
```

### 開發套件

安裝開發 Angular 4 時所需的套件，指令如下：
``` batch
npm install --save-dev typescript@latest @types/jasmine @types/node
```

在 ASP.NET Core 專案新增檔案 tsconfig.json，內容如下：
``` json
{
  "compileOnSave": true,
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "lib": [ "es2015", "dom" ],
    "module": "commonjs",
    "moduleResolution": "node",
    "noImplicitAny": true,
    "sourceMap": true,
    "suppressImplicitAnyIndexErrors": true,
    "target": "es5"
  },
  "exclude": [
    "node_modules"
  ]
}
```

## ASP.NET Core + Angular 4

### ASP.NET Core 前置作業

由於要讓 ASP.NET Core 可以支援讀取的靜態檔案，所以用管理 NuGet 套件安裝 Microsoft.AspNetCore.StaticFiles。

![管理 NuGet 套件](/images/pasted-42.png)
![瀏覽 Microsoft.AspNetCore.StaticFiles](/images/pasted-43.png)

安裝完成後，編輯 Startup.cs：
``` cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using System.IO;

namespace MyWebsite
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(
                Path.Combine(Directory.GetCurrentDirectory(), @"node_modules")),
                RequestPath = new PathString("/node_modules")
            });
        }
    }
}
```

### 建立 Angular 4

在 ASP.NET Core 專案建立以下檔案。

wwwroot\index.html
``` html
<!DOCTYPE html>
<html>
<head>
    <title>MyWebsite</title>
    <base href="/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="/node_modules/core-js/client/shim.min.js"></script>
    <script src="/node_modules/zone.js/dist/zone.js"></script>
    <script src="/node_modules/systemjs/dist/system.src.js"></script>
    <script src="/systemjs.config.js"></script>
    <script>
        System.import('/app/main.js').catch(function (err) { console.error(err); });
    </script>
</head>

<body>
    <my-app>Loading AppComponent content here ...</my-app>
</body>
</html>
```

wwwroot\systemjs.config.js
``` js
(function (global) {
    System.config({
        paths: {
            "npm:": "node_modules/"
        },
        map: {
            "app": "app",
            "@angular/core": "npm:@angular/core/bundles/core.umd.js",
            "@angular/common": "npm:@angular/common/bundles/common.umd.js",
            "@angular/compiler": "npm:@angular/compiler/bundles/compiler.umd.js",
            "@angular/platform-browser": "npm:@angular/platform-browser/bundles/platform-browser.umd.js",
            "@angular/platform-browser-dynamic": "npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js",
            "@angular/http": "npm:@angular/http/bundles/http.umd.js",
            "@angular/router": "npm:@angular/router/bundles/router.umd.js",
            "@angular/forms": "npm:@angular/forms/bundles/forms.umd.js",
            "rxjs": "npm:rxjs",
        },
        packages: {
            app: {
                defaultExtension: "js",
            },
            rxjs: {
                defaultExtension: "js"
            }
        }
    });
})(this);
```

wwwroot\app\main.ts
``` ts
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";

@NgModule({
    imports: [BrowserModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

wwwroot\app\app.component.ts
``` ts
import { Component } from "@angular/core";

@Component({
    selector: "my-app",
    template: `<h1>Hello {{name}}</h1>`
})
export class AppComponent {
    name = "Angular 4";
}
```

### 專案內容

完成上述步驟後，方案總管所有檔案的樣貌如下：
![方案總管 ASP.NET Core + Angular 4](/images/pasted-45.png)

### 執行結果

![MyWebsite Hello Angular 4](/images/pasted-44.png)

## 載點

[ASP.NET Core + Angular 4 教學 - 從無到有.zip](https://1drv.ms/u/s!AlHB4uP4MF7Sh2vGcc8jTt2y3xY6)

## 參考

[Angular QuickStart Source](https://github.com/angular/quickstart)