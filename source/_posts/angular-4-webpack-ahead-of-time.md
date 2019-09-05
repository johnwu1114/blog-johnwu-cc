---
title: Angular 4 教學 - Webpack 預先編譯 Ahead-of-Time (AOT)
author: John Wu
tags:
  - Angular
  - Webpack
  - AOT
  - TypeScript
categories:
  - Angular
date: 2017-09-25 23:25:00
featured_image: /images/a/349.png
---
![Angular 4 教學 - Webpack AOT](/images/a/349.png)

之前用 Angular 4 (Angular 2) 開發後台系統，使用者都是在 PC 上面使用，網站啟動速度都很快，所以沒有使用到 Ahead-of-Time (AOT) 預先編譯的需求。  
最近新產品上線，遇到很多 Android 的使用者開啟網站超級慢，舊一點的機型甚至開一分鐘才有畫面。事後才趕緊補上 AOT 編譯。  
本篇將介紹用 Webpack 預先編譯 AOT 編譯。  

<!-- more -->

## AOT vs JIT

開發 Angular 所撰寫的 TypeScript 透過 TypeScript Compiler 產生出來的 `*.js` 檔，是屬於 Angular 的 Source Code，必須經由 Angular Compiler，才能在瀏覽器中執行。  
而 Angular Compiler 可以在兩個不同的階段進行編譯：

### Just-in-Time (JIT)

Angular 預設是使用 Just-in-Time (JIT) 即時編譯，等瀏覽器下載完 `*.js` 檔案後，會在用戶端的瀏覽器編譯 Angular 的 JS 程式碼，接著才會渲染畫面。  

優點：  
> `*.js` 檔案是 Angular 的原始碼，所以檔案較小。  

缺點：  
> 在用戶端的瀏覽器編譯，所以網站啟動速度會較慢。  

### Ahead-of-Time (AOT)

Ahead-of-Time (AOT) 預先編譯，是在程式發佈之前就透過 Angular Compiler 進行編譯，所以瀏覽器下載完的 `*.js` 檔案，就可以直接被執行，然後渲染畫面。  

優點：  
> 減少掉了在用戶端的瀏覽器編譯的時間，所以網站啟動速度會較快。   

缺點：  
> 由於 `*.js` 是經過編譯後的檔案，所以檔案會較大。  

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
  app.module.ts                     # bootstrap 的第一個 module (e.g. AppModule)
  app.component.html                # app.component 用到的 template
  app.component.ts                  # AppModule bootstrap 的第一個 component (e.g. AppComponent)
node_modules/                       # npm 套件存放位置
```

### 安裝 Webpack 套件

安裝 Webpack 及接下來範例打包所需的開發套件，指令如下：
```
npm install --save-dev webpack angular2-template-loader awesome-typescript-loader raw-loader
```

### Webpack 設定

新增 `webpack.config.js`
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

### 執行 webpack

打包指令如下：
```
webpack -p
```

修改 `index.html` 參考 `*.js` 的位置：
```html
<!DOCTYPE html>
<html>
<head>
    <title>MyAngular4</title>
    <base href="/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <my-app>Loading...</my-app>
    <div id="script">
        <script src="/js/bundle-vendors.js"></script>
        <script src="/js/bundle.js"></script>
    </div>
</body>
</html>
```

打開網頁用瀏覽器的開發工具，看到 `bundle-vendors.js` 及 `bundle.js` 檔案大小及載入時間：  

![Angular 4 教學 - Webpack JIT](/images/a/348.png)

到目前為止，只是改成用 Webpack 打包 Angular 的 Source Code，所以還只是 JIT 編譯。  
由於本篇範例實在是太簡單了，看到載入的速度很快，才 400/ms 左右。  

### 安裝 AOT 套件

AOT 編譯所需的套件，除了 `bundle-vendors` 設定中的 11 個套件，還需要額外安裝 `@angular/compiler-cli` 及 `@angular/platform-server`，指令如下：
```
npm install --save @angular/compiler-cli @angular/platform-server
```

### TypeScript 設定

編輯 `tsconfig.json`，設定 AOT 編譯後的檔案輸出位置：
```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "lib": [ "es2015", "dom" ],
    "module": "commonjs",
    "moduleResolution": "node",
    "noImplicitAny": true,
    "sourceMap": true,
    "suppressImplicitAnyIndexErrors": true,
    "target": "es5",
    "watch": true
  },  
  "exclude": [
    "node_modules"
  ],
  "files": [
    "app/app.module.ts"
  ],
  "angularCompilerOptions": {
    "genDir": "aot",
    "skipMetadataEmit": true
  }
}
```
基本上 `tsconfig.json` 的設定跟原本差不多，新增了 `files` 及 `angularCompilerOptions`。  
* `files` 指定 Module 的位置，如果是 Lazy Loading，這邊就要加入所有 Lazy Loading 的 Module。  
* `genDir` 指定 AOT 編譯後的檔案輸出位置。  

> 我的範例程式中，為了保留 AOT 及 JIT 的差異，所以另外新增了一個 `tsconfig-aot.json` 的檔案，並保留原本的 `tsconfig.json`。

### AOT 編譯

套件安裝完也設定完成後，就可以用 `ngc` 指令進行 AOT 編譯：
```
node_modules/.bin/ngc -p tsconfig-aot.json
```

編譯成功後，檔案結構如下：
```yml
index.html                          # 起始頁面
package.json                        # npm 套件設定檔
systemjs.config.js                  # systemjs 設定檔
tsconfig.json                       # TypeScript 設定檔
app/                                # Angular 4 的主要目錄
  main.ts                           # bootstrap 的程式進入點
  app.module.ts                     # bootstrap 的第一個 module (e.g. AppModule)
  app.component.html                # app.component 用到的 template
  app.component.ts                  # AppModule bootstrap 的第一個 component (e.g. AppComponent)
node_modules/                       # npm 套件存放位置
aot/
  app/
    app.module.ngfactory.ts         # 跟 app.module.ts 對應的 ngfactory 檔案
    app.module.ngsummary.json       # 跟 app.module.ts 對應的 ngsummary 檔案
    app.component.ngfactory.ts      # 跟 app.component.ts 對應的 ngfactory 檔案
    app.component.ngsummary.json    # 跟 app.component.ts 對應的 ngsummary 檔案
  node_modules/                     # aot 檔案用到的 npm 套件
```

### 更新程式進入點

編輯 `main.ts`
```ts
// JIT 啟動 AppModule 用法
// import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
// import { AppModule } from "./app.module";
// platformBrowserDynamic().bootstrapModule(AppModule);

// AOT 啟動 AppModule 用法
import { platformBrowser } from "@angular/platform-browser";
import { AppModuleNgFactory } from "../aot/app/app.module.ngfactory";
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
```

由於 `AppModule` 已經透過 AOT 編譯成 `AppModuleNgFactory`，所以載入 Module 不再使用 `platformBrowserDynamic` 動態載入，改為用 `platformBrowser` 載入 `AppModuleNgFactory`。  

再次執行 Webpack 打包後，打開網頁用瀏覽器的開發工具，看到 `bundle-vendors.js` 及 `bundle.js` 檔案大小及載入時間：  

![Angular 4 教學 - Webpack AOT](/images/a/349.png)

可以看到 `bundle.js` 的檔案大小差異非常的大，從原本的 **1.8 KB** 變成 **4.6 KB**。  
頁面載入速度稍微快了一點，從原本的 **400/ms** 變為 **250/ms** 左右，因為範例太簡單，所以速度差的沒有很多。  
但隨著系統規模越做越大及程式複雜度提升，速度就會有非常明顯的差異。    

> `bundle-vendors.js` 變小是因為我把 `@angular/*` 移除了。

## 補充

換成用 Webpack 打包後，npm 套件 `systemjs` 就用不到了，可以從 `package.json` 中移除，或用指令移除：  
```
npm uninstall systemjs --save
```
system.config.js 也可以隨之移除。

改成用 AOT 編譯後，前端不再需要動態編譯，所以在 `bundle-vendors` 中可以把 `@angular/*` 移除：
```js
var webpack = require("webpack");

module.exports = {
    entry: {
        "bundle-vendors": [
            "core-js",
            "zone.js",
            "rxjs",
            // "@angular/core",
            // "@angular/common",
            // "@angular/compiler",
            // "@angular/platform-browser",
            // "@angular/platform-browser-dynamic",
            // "@angular/http",
            // "@angular/router",
            // "@angular/forms"
        ]
    },
    // ...
}
```

## 建議

根據我的經驗以及網路上的資訊，PC 及 iPhone 在執行 Angular JIT 編譯時，速度都還算蠻快的，而且差異不太大。  
而 Android 不論是新舊機型或任何瀏覽器，執行 Angular JIT 編譯的速度都明顯比 PC 及 iPhone 慢，舊一點的機型甚至開一分鐘才有畫面。  
> 類似的問題：[angular2 loading slow on android(had use lazy loading)](https://github.com/angular/angular/issues/14092)  

所以，如果產品需要支援手機或嵌入式裝置等，建議一開始就使用 AOT。  
如果只需要支援 PC 版，用 JIT 會較省下載速度及流量，可以比較不用擔心啟動效率問題。  

## 程式碼下載

[my-angular-aot](https://github.com/johnwu1114/my-angular-aot)

## 參考

[Ahead-of-Time Compilation](https://angular.io/guide/aot-compiler)  
[Angular2 AOT with Webpack and Lazy Loading](https://goo.gl/BmUykm)  
[angular2 loading slow on android(had use lazy loading)](https://github.com/angular/angular/issues/14092)  