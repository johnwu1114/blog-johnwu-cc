title: Angular 4 教學 - 從頭開始
author: John Wu
tags:
  - Angular
  - npm
  - TypeScript
  - VS Code
categories:
  - Angular
date: 2017-06-12 10:32:00
---
![Angular 4 教學 - 從頭開始 範例執行結果](/images/pasted-192.png)

有不只一位前端工程師問我，為什麼要用 Visual Studio 2017 做為 Angular 4 教學工具，他們又不寫 .NET，所以我重新改用 Visual Studio Code 來做為 Angular 4 的開發工具。  
本篇將介紹如何開始撰寫 Angular 4 (Angular 2)，包含各項套件的安裝說明及相依關係。

<!-- more -->

## 前言

安裝軟體的部分我就沒有詳細介紹，以下是我使用到的工具跟語言。  

開發工具：
1. Visual Studio Code。[官網下載頁面](https://code.visualstudio.com/Download)  
> 基本上 VS Code 就是純文字編輯工具，你要用 Sublime、Notepade++、Atom、TextEdit都可以。  
2. Nodejs 6.9.x 以上版本 及 npm 3 以上版本。[官網下載頁面](https://nodejs.org/en/download/)  

有很多人問我為什麼不用 VS Code 來做為 Angular 4 的開發工具，因為三個原因：  
1. 在我們部門前端工程師要包含 ASP.NET MVC、Web API 等，所以要寫 C# 控制伺服端事件。用不同的 IDE 開發對我們來說並不方便。  
2. 我從 Visual Studio 2003 就開始用 Visual Studio，用習慣了轉不了。其實是我念舊...  
3. Visual Studio 2017 這麼貴，而 VS Code 免費。公司有花錢買 Visual Studio 2017，我當然選貴的用阿！  

也人問我為什麼不用 Angular CLI，不是 Angular CLI 不好，純粹是我個人是喜歡一步一步自己建置需要的東西。  
Angular CLI 也是很方便的選擇喔！請參考 [Angular CLI 官網](https://cli.angular.io/)

## 1. 建立專案資料夾

新增一個資料夾，然後用 VS Code 打開。可以在左邊的 EXPLORER 看到你開始的資料夾名稱，如下圖：
![專案資料夾](/images/pasted-187.png)

## 2. 安裝 npm 套件

### 2.1 建立 npm package

在 VS Code 中按下 `Ctrl` + `~`，可以在 VS Code 中打開 Console 介面。  

建立 npm package 指令如下：
``` batch
npm init -y
```

執行完就可以看到自動建立了 package.json。如下：
![建立 npm package](/images/pasted-188.png)

### 2.2 主要套件

安裝 Angular 4 執行時所需的套件，指令如下：
``` batch
npm install --save @angular/common@latest @angular/compiler@latest @angular/core@latest @angular/forms@latest @angular/http@latest @angular/platform-browser@latest @angular/platform-browser-dynamic@latest @angular/router@latest core-js@latest rxjs@latest systemjs@latest zone.js@latest
```

它會把 packages 下載到 node_modules，同時自動修改 package.json。
![npm package install](/images/pasted-189.png)

### 2.3 開發套件

因為要把 TypeScript 的 `*.ts` 檔案，透過 tsc 指令編譯成 `*.js` 檔，所以要把 TypeScript 安裝在全域範圍，指令如下：
```batch
npm install -g --save-dev TypeScript
```

安裝開發 Angular 4 時所需的套件，指令如下：
```batch
npm install --save-dev lite-server @types/jasmine @types/node
```
> 也可以把開發套件安裝在全域範圍，看個人需求。在參數中加入 `-g` 即可。

### 2.4 設定 TypeScript

新增檔案 tsconfig.json，內容如下：
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
> 這個 tsconfig.json 是參考 [Angular 官網](https://angular.io/docs/ts/latest/guide/TypeScript-configuration.html)的設定。

如果 tsconfig.json 想要用自動產生，可以使用 tsc 建立 tsconfig.json，指令如下：
```batch
tsc --init
```
> 預設的內容不一定是你要的，所以還是要修改。

### 2.5 設定開發伺服器

打開 package.json，在 scripts 中加入 lite-server，如下：
```json
...
"scripts": {
  ...
  "dev": "lite-server"
  ...
},
...
```

設定完成就可以在指令中執行：
```batch
npm run dev
```

啟動 lite-server 畫面如下：
![lite-server](/images/pasted-190.png)
> 還沒建立頁面，所以回傳 *Cannot GET /*

## 3. 範例程式碼

### 3.1 建立 Angular 4

index.html
``` html
<!DOCTYPE html>
<html>
<head>
    <title>MyAngular4</title>
    <base href="/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="/node_modules/core-js/client/shim.min.js"></script>
    <script src="/node_modules/zone.js/dist/zone.js"></script>
    <script src="/node_modules/systemjs/dist/system.src.js"></script>
    <script src="/systemjs.config.js"></script>
    <script>
        System.import("/app/main.js").catch(function (err) { console.error(err); });
    </script>
</head>

<body>
    <my-app>Loading...</my-app>
</body>
</html>
```

systemjs.config.js
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

app\main.ts
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

app\app.component.html  
由於我個人不是很喜歡在 TypeScript 檔案內看到 html，所以我把 template 獨立出一個檔案
```html
<h1>Hello {{name}}</h1>
```

app\app.component.ts
``` ts
import { Component } from "@angular/core";

@Component({
    selector: "my-app",
    templateUrl: "/app/app.component.html"
})
export class AppComponent {
    name = "Angular 4";
}
```

### 3.2 專案內容

完成上述步驟後，檔案結構如下：
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

### 3.3 編譯 TypeScript

在 VS Code 可以開啟多個 Console，我在第一個 Console 啟動了 lite-server，我再多新增一個 Console 用來執行 tsc 編譯 TypeScript。如下：
![TypeScript compiler](/images/pasted-191.png)

### 3.4 執行結果

![Angular 4 教學 - 從頭開始 範例執行結果](/images/pasted-192.png)

## 程式碼下載

[my-angular](https://github.com/johnwu1114/my-angular)

## 參考

[Angular QuickStart Source](https://github.com/angular/quickstart)