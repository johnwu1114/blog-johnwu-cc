---
title: Angular 4 - Webpack 預先編譯 Ahead-of-Time (AOT)
author: John Wu
tags:
  - Angular
  - Webpack
  - AOT
  - TypeScript
categories:
  - Angular
date: 2017-09-25 17:25:00
featured_image: /images/pasted-278.png
---

之前用 Angular 2/4 開發後台系統，使用者都是在 PC 上面使用，起動速度都很快，所以沒有使用到 Ahead-of-Time (AOT) 預先編譯的需求。  
最近新產品上線，遇到很多 Android 的使用者開啟網站超級慢，舊一點的機型甚至開一分鐘才有畫面。事後才趕緊補上 AOT 編譯。  
本篇將介紹用 Webpack 預先編譯 AOT 編譯。  

<!-- more -->

## AOT vs JIT

開發 Angular 所撰寫的 TypeScript 透過 TypeScript Compiler 產生出來的 `*.js` 檔，是屬於 Angular 的 Source Code，必須經由 Angular Compiler，才能在瀏覽器中執行。  
而 Angular Compiler 可以在兩個不同的接段進行編譯：

### Just-in-Time (JIT)

Angular 預設是使用 Just-in-Time (JIT) 即時編譯，都下載完 `*.js` 檔案後，會在用戶端的瀏覽器編譯 Angular 的 JS 程式碼，接著才會渲染畫面。  

好處是：  
*. `*.js` 檔案是 Angular 的原始碼，所以檔案較小。  

缺點是：  
*. 會在用戶端的瀏覽器編譯，所以載入速度會較慢。  

### Ahead-of-Time (AOT)

Ahead-of-Time (AOT) 預先編譯，是在程式發佈之前就透過 Angular Compiler 進行編譯，所以流覽器下載完的 `*.js` 檔案，就可以直接被執行，然後渲染畫面。  

好處是：  
*. 減少掉了在用戶端的瀏覽器編譯的時間，所以載入速度會較快。   

缺點是：  
*. 由於 `*.js` 是經過編譯後的檔案，所以檔案會較大。  

## 範例程式碼

我用之前[Angular 4 教學 - 從頭開始](/article/angular-4-教學-從頭開始.html)的範例延伸。  

初始結構檔案結構如下：
```yml
index.html                          # 起始頁面
package.json                        # npm 套件設定檔
systemjs.config.js                  # systemjs 設定檔
tsconfig.json                       # TypeScript 設定檔
app/                                # Angular 4 的主要目錄
  main.ts                           # bootstrap 的程式進入點
  app.component.html                # app.component 用到的 template
  app.component.ts                  # 給 bootstrap 啟動的第一個 component (e.g. AppComponent)
node_modules/                       # npm 套件存放位置
```

### 安裝 Webpack 套件

安裝 Webpack 及接下來範例打包所需的開發套件，指令如下：
```
npm install --save-dev webpack angular2-template-loader awesome-typescript-loader raw-loader
```

### Webpack 設定

```js
var webpack = require("webpack"); 
 
module.exports = { 
    cache: true, 
    entry: { 
        "bundle": [__dirname + "/app/main.ts"], 
        "bundle-vendors": [ 
            "core-js", 
            "zone.js", 
            "rxjs", 
            "@angular/core", 
            "@angular/common", 
            "@angular/compiler", 
            "@angular/platform-browser", 
            "@angular/platform-browser-dynamic", 
            "@angular/http", 
            "@angular/router", 
            "@angular/forms" 
        ] 
    }, 
    output: { 
        path: __dirname + "/js", 
        filename: "[name].js", 
        sourceMapFilename: "[name].map" 
    }, 
    resolve: { 
        extensions: [".ts", ".js", ".html"] 
    }, 
    module: { 
        loaders: [{ 
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
        }), 
        new webpack.ContextReplacementPlugin( 
            /angular(\\|\/)core(\\|\/)@angular/, 
            __dirname + "./app"
        )
    ] 
}
```

## 建議

根據我們的經驗以及網路上的資訊，電腦及 iPhone 在執行 Angular JIT 編譯時，速度都還算蠻快的，而且差異不太大。  
而 Android 不論是新舊機型或任何瀏覽器，執行 Angular JIT 編譯的速度都明顯比電腦及 iPhone 慢，舊一點的機型甚至開一分鐘才有畫面。  
> 參考：[angular2 loading slow on android(had use lazy loading)](https://github.com/angular/angular/issues/14092)  

所以，如果產品需要支援手機或嵌入式裝置等，建議一開始就使用 AOT。  
如果只需要支援電腦版，用 JIT 會較省下載速度及流量，比較不用擔心啟動效率問題。  

## 程式碼下載

[my-angular-aot](https://github.com/johnwu1114/my-angular-aot)

## 參考

[Ahead-of-Time Compilation](https://angular.io/guide/aot-compiler)  
[Angular2 AOT with Webpack and Lazy Loading](http://www.dzurico.com/angular-aot-webpack-lazy-loading/)  
[angular2 loading slow on android(had use lazy loading)](https://github.com/angular/angular/issues/14092)  