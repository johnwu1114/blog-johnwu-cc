title: ASP.NET Core + Angular 4 教學 - Lazy Loading
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
date: 2017-05-02 23:21:00
---
![ASP.NET Core + Angular 4 教學 - Lazy Loading 範例執行結果](/images/pasted-108p.png)

本篇將介紹 Angular 4 的 Lazy Loading，避免寫 SPA 程式越做越大，啟動時載入全部的 JavaScript 檔很累贅又恨慢。  
比較好的做法是用到什麼功能，再載入當下用到 Module 的 JavaScript 檔案，節省載入時間。  

<!-- more -->

程式碼延續之前範例：  
[ASP.NET Core + Angular 4 教學 - Multiple Modules](/article/asp-net-core-angular-4-教學-multiple-modules.html)  

Routing不熟悉的話，請先參考：  
[ASP.NET Core + Angular 4 教學 - Routing](/article/asp-net-core-angular-4-教學-routing.html)

## 1. 安裝 npm 套件

安裝 angular-router-loader，指令如下：

```
npm install --save-dev angular-router-loader
```

angular-router-loader 套件會把
```js
loadChildren: "./first/first.routes#FirstModule"
```
轉換成
```js
loadChildren: () => new Promise(function (resolve) {
    (require as any).ensure([], function (require: any) {
        resolve(require('.\\first\\first.routes')['SecondModule']);
    });
})
```
並把每個 Module 打包成獨立的 `*.js` 檔案。

## 2. Webpack 設定

編輯 webpack.config.js
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
        publicPath: "/js/",
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
                    "angular2-template-loader",
                    "angular-router-loader"
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

1. test: /\.ts$/ 的 loaders 加入 angular-router-loader。  
2. output 要設定 publicPath  
在 Webpack 轉換路徑時，會以 publicPath 作為 `*.js` 檔的根路徑，如果沒設定會發生錯誤，如下：  

![ASP.NET Core + Angular 4 教學 - Lazy Loading 發生錯誤](/images/pasted-108.png)

可以看到上圖，angular-router-loader 產生了 `0.js` 這個檔案，但回應是 404 not found。  
Console 也顯示 Error: Loading chunk 0 failed.  

實際上，檔案是有被產生出來的，只是位置不在網站根目錄，而是跟 `bundle.js` 同層，如圖：
![angular-router-loader產出檔案](/images/pasted-109.png)

所以我們在 output 設定提示 Webpack，之後打包時，`*.js` 檔的路徑要以 publicPath: "/js/" 為根目錄。

## 3. Lazy Loading

### 3.1 File Structure

此範例我們建立兩個模組 `first` 及 `second`，檔案結構如下：
```yml
index.html
app/
  main.ts
  app.component.ts
  app.component.html
  app.routes.ts
  first/
    first.routes.ts
    components/
      one.component.ts
      two.component.ts
      three.component.ts
  second/
    second.routes.ts
    components/
      one.component.ts
      two.component.ts
      three.component.ts
```
> 有關檔案結構可參考：[Angular 4 File Structure](/article/angular-4-file-structure.html)

### 3.2 Routing

在 app.routes.ts 路由中，把 `first` 及 `second` 的 loadChildren 改成以下格式：
```js
// ...

const routes: Route[] = [
    {
        path: "",
        redirectTo: "first",
        pathMatch: "full",
    },
    {
        path: "first",
        loadChildren: "./first/first.routes#FirstModule"
    },
    {
        path: "second",
        loadChildren: "./second/second.routes#SecondModule"
    }
];

export class AppRoutes {
    public static getRoutes(): Route[] {
        return routes;
    }

    public static getComponents(): any[] {
        return RouteUtil.getComponents(routes);
    }
}
```

## 執行結果

上述都設定好後，就可以完成了，執行下面如下：
![ASP.NET Core + Angular 4 教學 - Lazy Loading 範例執行結果](/images/pasted-108.gif)
FirstModule 被打包成 `1.js`，SecondModule 被打包成 `0.js`。  
首次載入時，兩個檔案都不會被載進來，只會載入 `bundle-vendors.js` 及 `bundle.js`，因預設路由是指向 FirstModule，所以隨後就載入 `1.js`，當我切換路由到 SecondModule 時，才載入 `0.js`。  

## 程式碼下載

[asp-net-core-angular-lazy-loading](https://github.com/johnwu1114/asp-net-core-angular-lazy-loading)