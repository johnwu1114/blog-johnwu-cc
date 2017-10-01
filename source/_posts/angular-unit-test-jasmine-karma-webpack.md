---
title: Angular 4 教學 - 單元測試 (Unit Test) Jasmine + Karma + Webpack
author: John Wu
tags:
  - Angular
  - npm
  - Webpack
  - Unit Test
categories:
  - Angular
date: 2017-10-01 02:32:00
featured_image: /images/x362.png
---
![Angular 4 教學 - 單元測試 (Unit Test) Jasmine + Karma + Webpack - 3](/images/x362.png)

*Jasmine* 框架 + *Karma* 測試執行工具是 Angular 普遍使用的單元測試組合，也是官方推薦的方法。  
而 *Webpack* 也算 Angular 打包程式碼的主流工具，為了讓**開發**、**測試**及**正式環境**都用一樣的方式打包程式碼；  
所以本篇 Angular 4 (Angular 2) 的單元測試 (Unit Test) 將介紹 *Jasmine*+*Karma*+*Webpack* 組合使用。  

<!-- more -->

## 前言

程式碼是由 [Angular 4 教學 - 從頭開始](/article/angular-4-教學-從頭開始.html) 延伸，把 *SystemJS* 改為 *Webpack* 打包。  
*Webpack* 打包可以參考[這篇](/article/asp-net-core-angular-4-教學-webpack.html)。  

本篇檔案結構如下：
```yml
index.html                          # 起始頁面
package.json                        # npm 套件設定檔
karma.conf.js                       # Karma 設定檔
tsconfig.json                       # TypeScript 設定檔
webpack.config.js                   # Webpack 設定檔
app/                                # Angular 4 的主要目錄
  main.ts                           # 程式進入點
  main.test.ts                      # 單元測試程式進入點
  app.module.ts                     # bootstrap 的第一個 module (e.g. AppModule)
  app.component.html                # app.component 用到的 template
  app.component.ts                  # AppModule bootstrap 的第一個 component (e.g. AppComponent)
  app.component.spec.ts             # AppModule 測試案例
```

## 1. 安裝 npm 套件

本篇用到跟單元測試相關的 7 個套件，如下：

* *Jasmine*+*Karma* 主要會用到的套件有：
 * **jasmine-core**  
 * **karma**  
 * **karma-jasmine**  
 * **karma-jasmine-html-reporter**  

* 要在 *Karma* 中執行 *Webpack*，需要另外安裝套件：
 * **karma-webpack**  

* 由於我是用 Chrome 開發及測試，所以裝了這個套件，當啟動 *Karma* 就會開啟 Chrome 進行測試。  
其他瀏覽器也有相關套件：
 * **karma-chrome-launcher**  
 * karma-phantomjs-launcher  
 * karma-firefox-launcher  
 * karma-edge-launcher  
 * karma-ie-launcher  
 * karma-opera-launcher  
 * karma-safari-launcher

* 為了讓 `require.context()` 方法可以在 TypeScript 使用，所以要安裝定義檔：
 * **@types/webpack-env**  
 
安裝指令：
```
npm install --save-dev jasmine-core karma karma-jasmine karma-jasmine-html-reporter karma-webpack karma-chrome-launcher @types/webpack-env
```

## 2. 組態設定

### 2.1. Webpack 設定

編輯 webpack.config.js
```js
var webpack = require("webpack");

var config = {
    cache: true,
    devtool: "source-map",
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
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            __dirname + "/app"
        )
    ]
};

if (process.env.NODE_ENV === "production") {
    config.devtool = false;
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
        name: "bundle-vendors"
    }));
}

module.exports = config;
```

> 有一點要注意，在測試階段不要啟用 `CommonsChunkPlugin`。其他部分就保留原本 *Webpack* 使用的設定即可。  

### 2.2. Karma 設定

新增 karma.conf.js
```js
var webpackConfig = require("./webpack.config.js");
webpackConfig.devtool = "cheap-module-eval-source-map"

module.exports = function (config) {
    var _config = {
        frameworks: ["jasmine"],
        mime: {
            "text/x-typescript": ["ts"]
        },
        files: ["app/main.test.ts"],
        preprocessors: {
            "app/main.test.ts": ["webpack"]
        },

        webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: true,
            stats: "errors-only"
        },

        reporters: ["progress", "kjhtml"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ["Chrome"],
        singleRun: false
    };

    config.set(_config);
};
```
* **files**: 是設定單元測試需要載入的檔案。可以換成自己的路徑。  
* **preprocessors**: 啟動單元測試前要做的事。  
 這邊我做的是把 `app/main.test.ts` 用 *Webpack* 打包。  
* **browsers**: 如果要用其他瀏覽器執行測試，除了要安裝套件，也要在這邊設定。  

### 2.3. 單元測試進入點

新增 app/main.test.ts

```ts
Error.stackTraceLimit = Infinity;

require("core-js/es6");
require("core-js/es7/reflect");
require("zone.js/dist/zone");
require("zone.js/dist/long-stack-trace-zone");
require("zone.js/dist/proxy");
require("zone.js/dist/sync-test");
require("zone.js/dist/jasmine-patch");
require("zone.js/dist/async-test");
require("zone.js/dist/fake-async-test");

import { TestBed } from "@angular/core/testing";
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from "@angular/platform-browser-dynamic/testing";

var appContext = require.context(".", true, /\.spec\.ts$/);
appContext.keys().forEach(appContext);

TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
```

* **require.context()** 會把指定路徑的符合 *.spec.ts 的檔案，都當作測試案例載入。
 * 參數1: 我把 main.test.ts 放在 app 資料夾，所以 `"."` 指的就是 `/app/` 資料夾。  
 * 參數2: 是否包含子目錄。  
 * 參數3: 這邊指定 `*.spec.ts` 檔案，都是單元測試的測試案例檔，也可以換成其他的檔案格式或名稱。  

### 2.4. NPM 指令設定

編輯 package.json
```json
{
  "scripts": {
    "test": "karma start"
    // ...
  },
  // ...
}
```

設定完成後，就可以用指令執行測試：
```
npm run test
```

## 3. 測試案例

*Jasmine* 的測試的基本架構：  
```ts
describe("測試案例的描述", () => {
    
    beforeEach(() => {
        // 每個測試案例開始前會做的事
    });

    afterEach(() => {
        // 每個測試案例結束後會做的事
    });

    it("測試案例", function() {
        // 預期結果
        expect(expression).toEqual(true);
    });
});
```

我在 app.component.spec.ts 建立了 4 個簡單的測試案例：  
* 驗證　AppComponent 是否能被實例化成功。  
* 驗證 `<h1 />` 內的文字，是否符合預期。  
* 必成功的測試案例。  
* 必失敗的測試案例。  

```ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { AppComponent } from "./app.component";

describe("AppComponent", () => {
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent]
        }).compileComponents();
        fixture = TestBed.createComponent(AppComponent);
    });

    it("should create AppComponent", () => {
        // arrange
        let expected = true;

        // act
        let actual = fixture.componentInstance instanceof AppComponent;

        // assert
        expect(actual).toBe(expected);
    });

    it("should have expected <h1> text", () => {
        // arrange
        let expectedPattern = /^This is Angular \d\.\d\.\d$/g;
        let message = "<h1>should display \"This is Angular\" and version number.";

        // act
        fixture.detectChanges();
        let actual = fixture.debugElement.query(By.css("h1")).nativeElement.innerText;

        // assert
        expect(actual).toMatch(expectedPattern, message);
    });

    it("Test Case 1", () => expect(true).toBe(true, "should return true"));
    it("Test Case 2", () => expect(true).toBe(false, "should return true"));
});
```

## 執行結果

指令執行：
```
npm run test
```

進入 `debug.html` 頁面後，可以看到全部測試案例的執行結果：
![Angular 4 教學 - 單元測試 (Unit Test) Jasmine + Karma + Webpack - 1](/images/x360.png)
![Angular 4 教學 - 單元測試 (Unit Test) Jasmine + Karma + Webpack - 2](/images/x361.png)
![Angular 4 教學 - 單元測試 (Unit Test) Jasmine + Karma + Webpack - 3](/images/x362.png)

## 程式碼下載

[my-angular-unit-test](https://github.com/johnwu1114/my-angular-unit-test)

## 參考

https://angular.io/guide/testing  
https://angular.io/guide/webpack#test-configuration  
https://hahoangv.wordpress.com/2016/11/08/unit-testing-with-karma-and-jasmine-in-angular2/  
https://github.com/webpack-contrib/karma-webpack  