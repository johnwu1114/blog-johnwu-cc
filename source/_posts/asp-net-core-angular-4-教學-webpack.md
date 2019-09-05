---
title: ASP.NET Core + Angular 4 教學 - Webpack 打包
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - npm
  - TypeScript
  - 'C#'
  - Webpack
categories:
  - ASP.NET Core
  - Angular
date: 2017-04-15 13:35:58
featured_image: /images/a/53-1.png
---
![ASP.NET Core + Angular 4 教學 - Webpack打包 範例執行結果未完成](/images/a/46.png)

Angular 官方的範例是使用 SystemJS 載入，但網頁一開就載入一大堆 js 檔。request 這麼多檔案，看了就很不舒服。  
可以看到圖片底部有 **46 requests**...  

接下來用 Webpack 打包 Angular 套件、TypeScript 及 HTML。把第三方套件跟自製的程式分成兩個 js 檔案。  

<!-- more -->

程式碼延續之前範例：  
[ASP.NET Core + Angular 4 教學 - 從無到有](/article/asp-net-core-angular-4-教學-從無到有.html)  

## 1. 安裝 Webpack 套件

安裝 Webpack 及接下來範例打包所需的開發套件，指令如下：
``` batch
npm install --save-dev webpack angular2-template-loader awesome-typescript-loader raw-loader
```

## 2. Webpack 設定

新增 webpack.config.js
```js
/// <binding ProjectOpened='Watch - Development' />
var webpack = require("webpack");
var wwwroot = __dirname + "/wwwroot";

module.exports = {
    cache: true,
    entry: {
        "bundle": [wwwroot + "/app/bundle.ts"],
        "bundle-vendors": [wwwroot + "/app/bundle-vendors.ts"],
    },
    output: {
        path: wwwroot + "/js",
        filename: "[name].js",
        sourceMapFilename: "[name].map"
    },
    resolve: {
        extensions: [".ts", ".js", ".html"]
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: [
                    "awesome-typescript-loader",
                    "angular2-template-loader"
                ],
                exclude: /(node_modules)/
            },
            {
                test: /\.html$/,
                loader: "raw-loader"
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "bundle-vendors"
        })
    ]
}
```

> *※比較值得一提的是 awesome-typescript-loader 打包速度比 ts-loader 快非常多。還在用 ts-loader 的可以考慮換一下。*

## 3. Webpack entry

webpack.config.js 可以看到我設定了兩個進入點，我們在專案中異動檔案如下：  

新增 wwwroot\app\bundle-vendors.ts
```js
// core
require("core-js");
require("zone.js");
require("rxjs");

// angular
require("@angular/core");
require("@angular/common");
require("@angular/compiler");
require("@angular/platform-browser");
require("@angular/platform-browser-dynamic");
require("@angular/http");
require("@angular/router");
require("@angular/forms");
```

新增 wwwroot\app\bundle.ts
```js
require("../app/main");
```

wwwroot\index.html  
把 js 參考成 /js/bundle-vendors.js 及 /js/bundle.js。
```html
<!DOCTYPE html>
<html>
<head>
    <title>MyWebsite</title>
    <base href="/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <my-app>Loading AppComponent content here ...</my-app>
    <div id="script">
        <script src="/js/bundle-vendors.js"></script>
        <script src="/js/bundle.js"></script>
    </div>
</body>
</html>
```
*※注意！在這邊我把 script 的參考放到底部，因為在 bundle.js 中會載入 my-app，如果把 script 放到 head 會導致載入失敗。*
實際上把 script 放在底部也是比較好的做法。  
眼尖的人可能發現到，已經沒有看到任何地方參考 SystemJS，所以我們可以從 package.json 中把 systemjs 移除，或用指令移除：
```batch
npm uninstall systemjs --save
```

wwwroot\app\app.component.ts  
原本用 templateUrl 參考 html，現在改用 template + require。如此一來就可以把 html template 一起打包。
``` ts
import { Component } from "@angular/core";

@Component({
    selector: "my-app",
    template: require("./app.component.html")
})
export class AppComponent {
    name = "Angular 4";
}
```

Startup.cs  
特別為 node_modules 建立的虛擬路徑也可以移除了。
``` cs
using Microsoft.AspNetCore.Builder;
//using Microsoft.AspNetCore.Http;
//using Microsoft.Extensions.FileProviders;
//using System.IO;

namespace MyWebsite
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();
            //app.UseStaticFiles(new StaticFileOptions()
            //{
            //    FileProvider = new PhysicalFileProvider(
            //    Path.Combine(Directory.GetCurrentDirectory(), @"node_modules")),
            //    RequestPath = new PathString("/node_modules")
            //});
        }
    }
}
```

## 4. 執行 webpack

打包指令如下：
```batch
webpack -p
```

再打開網頁看一次 requset，只剩下三個 requsets，真是乾淨舒服～
![ASP.NET Core + Angular 4 教學 - Webpack打包 範例執行結果完成](/images/a/53-1.png)

## Visual Studio Extension

除了用指令安裝 npm package，還可以用 Visual Studio Extension 來安裝。  
推薦兩個 Extension:
1. WebPack Task Runner 可以用 Visual Studio 執行 Webpack
2. NPM Task Runner 可以用 Visual Studio 安裝或更新 npm 套件

![Visual Studio Extension](/images/a/52.png)
![Visual Studio Extension: WebPack Task Runner and NPM Task Runner](/images/a/47.png)

### NPM Task Runner

打開 package.json 編輯 Visual Studio 會自動上抓取 npm package 還有最新版本。

![編輯 package.json](/images/a/49.png)

儲存 package.json 後可以在工作執行器總管，滑鼠左鍵點兩下 npm install，就可以透過 Visual Studio 執行安裝 npm。
![NPM Task Runner](/images/a/50.png)
![NPM Task Runner: install](/images/a/51.png)

### WebPack Watch - Development

為了開發方便啟動 webpack watch，當有異動 ts 檔案就會自動重新打包 webpack。  
可以透過 WebPack Task Runner 改變要執行的時間點，第一行的設定就是在 Visual Studio 專案開啟時，啟動 webpack file watch。
```js
/// <binding ProjectOpened='Watch - Development' />
```
![WebPack Task Runner: Watch - Development](/images/a/54.png)


### WebPack Run - Production

發佈到正式環境就不能用 Development mode，Development mode 會夾帶 map 檔等，方便在 browser 開發程式，打包出來會很大一包，所以要用 Production mode。

![WebPack Task Runner: Run - Production](/images/a/54.png)

## 程式碼下載

[asp-net-core-angular](https://github.com/johnwu1114/asp-net-core-angular)
