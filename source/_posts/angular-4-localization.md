title: Angular 4 教學 - 多國語言
author: John Wu
tags:
  - Angular
  - TypeScript
  - Localization
  - Pipe
categories:
  - Angular
date: 2017-06-19 10:50:00
---
![Angular 4 教學 - 多國語言 - Switch culture](/images/pasted-203.png)

本篇將介紹 Angular 4 (Angular 2) 透過定義檔及 Pipe，在 TypeScript 及 Template 中方便的使用多國語言資源。  

<!-- more -->

## 1. 建立多國語言檔

我通常會建立一個 lang 的資料夾，專門放多國語系的檔案。  
裡面會包含 TypeScript 的定義檔，為了在 TypeScript 中使用多國語言，而不會提示找不到類別。  

檔案結構如下：
```yml
index.html
app/
  # TypeScript 程式碼...
lang/
  en-gb.js
  zh-tw.js
  # Other {culture}.js...
```

多國語系檔案 `{culture}.js` 的內容如下：
```js
var R = {
    Message: {
        InternalServerError: "內部伺服器發生錯誤"
    },
    Text: {
        Send: " 送出",
        UserName: "帳號",
        Login: "登入",
        Password: "密碼",
    }
};
```

## 2. 建立定義檔

如果只建立 `{culture}.js`，在 TypeScript 中使用會發生找不到型態的錯誤，所以要搭配 TypeScript 的定義檔使用，定義檔名稱可以自訂。  
app/definitions/land.d.ts 內容如下：
```ts
interface R {
    Message: {
        InternalServerError: string;
    };
    Text: {
        Send: string;
        UserName: string;
        Login: string;
        Password: string;
    };
}
declare var R: R;
```
> 定義檔建立完成後，就可以在 TypeScript 中使用 `R.Text.Send`，並且會有 Auto Complete 提示，使用的人就可以知道有哪些資源能用。Auto Complete 如下圖：  

![Angular 4 教學 - 多國語言 - Auto Complete](/images/pasted-203.gif)

> `declare var R: R;` 也可以改成 `declare var R: any;`。  
> 但改成 `any` 就沒辦法在 TypeScript 中享受到 Auto Complete 的功能。  

## 3. 載入語系

從 URL 的參數取得 culture 的資訊，載入對應的語系檔。
index.html
```html
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
    <script>
        let url = new URL(window.location.href);
        let culture = url.searchParams.get("culture");
        let script = document.createElement("script");
        script.type = "application/javascript";
        script.src = "/lang/" + (culture ? culture : "en-gb") + ".js";
        document.body.appendChild(script);
    </script>
</body>
</html>
```
> 這是簡單的範例，並沒有做嚴謹的判斷。  

app.component.ts
```ts
import { Component, VERSION } from "@angular/core";

@Component({
    selector: "my-app",
    templateUrl: "/app/app.component.html"
})
export class AppComponent {
    name = R.Text.UserName;
}
```

app.component.html
```html
<a href="?culture=en-gb">en-gb</a> | <a href="?culture=zh-tw">zh-tw</a>

<h1>name = {{name}}</h1>
```

![Angular 4 教學 - 多國語言 - Switch culture](/images/pasted-204.gif)


## 4. Pipe

要在 Template 顯示多國語系，還要在 Component 中定義變數非常麻煩，所以我們可以自製一個 Pipe 方便我們在 Template 中使用多國語言。 

app/shared/localization.pipe.ts
```ts
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "R" })
export class LocalizationPipe implements PipeTransform {
    transform(key: string, category: string): string {
        category = category ? category : "Text";
        if (!R.hasOwnProperty(category) || !R[category].hasOwnProperty(key)) {
            return key;
        }
        return R[category][key];
    }
}
```
LocalizationPipe 有兩個參數：
* 多國語系的 Key  
每個類別都會有許多的多國語系值，同一個類別的 Key 不能重複，這樣才能找到對應的翻譯內容。  
如果在該類別找不到 Key，就直接回傳 Key，把 Key 顯示出來，至少不會出錯。  
* 類別  
上述範例我建了兩個類別 `Text` 及 `Message`，這都是自訂的類別，當然可以分更多類別或不分類。  
我設定預設為找 `Text`，應為這會是我常用的多國語系資源。  

建立完成後必須要注入至 Module 中才能使用。如下：  
main.ts
```ts
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { LocalizationPipe } from "./shared/localization.pipe";

@NgModule({
    imports: [BrowserModule],
    declarations: [
        AppComponent,
        LocalizationPipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

app.component.html
```html
<a href="?culture=en-gb">en-gb</a> | <a href="?culture=zh-tw">zh-tw</a>

<p>Login = {{'Login'|R}}</p>
<p>Password = {{'Password'|R}}</p>
<p>UserName = {{'UserName'|R}}</p>
<p>Send = {{'Send'|R}}</p>
<p>InternalServerError = {{'InternalServerError'|R:'Message'}}</p>
```
> 在 Template 中的 Binding 加上 `'{Key}'|R`，就會呼叫 LocalizationPipe 中的 transform 方法，並且把 `|` 前面的值，當做第一個參數傳入。  
> 第二以上的參數就要放在 `|` 後面，並加上 `:`。例如： `'{Key}'|R:'{category}'`。  

## 執行結果

![Angular 4 教學 - 多國語言 - 執行結果](/images/pasted-205.gif)

## 程式碼下載

[my-angular-localization](https://github.com/johnwu1114/my-angular-localization)
