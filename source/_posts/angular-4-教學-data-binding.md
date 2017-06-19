title: Angular 4 教學 - Data Binding
author: John Wu
tags:
  - Angular
  - TypeScript
  - VS Code
categories:
  - Angular
date: 2017-06-13 10:20:00
---
![Angular 4 教學 - Data Binding](/images/pasted-196.png)

Angular 透過 Data Binding 讓 TypeScript(Component) 及 HTML(Template) 兩邊互相傳遞資料，Data Binding 的方式有四種。  
本篇將介紹 Angular 4 (Angular 2) 的四種 Data Binding 互動。  

<!-- more -->

## 綁定方式

我大概描述一下 Angular 的四種 Data Binding 方式：
1. 插值(Interpolation)  
變數改變 HTML 跟著變  
2. 屬性綁定(Property Binding)  
變數改變 HTML 跟著變  
3. 事件綁定(Event Binding)  
發送 HTML 事件到 Script 裡面  
4. 雙向綁定(Two-way Data Binding)  
變數改變 HTML 跟著變，且發送 HTML 事件到 Script 裡面  

前三種都是屬於單向綁定，差別在於方向性的不同，第四種雙向綁定，是屬性綁定加上事件綁定的組合。  
方向性如上圖所示。  

## 1. 插值(Interpolation)

插值(Interpolation)綁定是直接在 HTML 中插入 `{% raw %} {{value}} {% endraw %}`，執行期間 value 的變化，都會連動更新到 HTML 畫面上。  

範例：
```ts
// ...
export class AppComponent {
    name: string = "John";
}
```

```html
<span>{{name}}</span>
```
> 當 TypeScript 中的 name 產生任何變化，HTML span 中的內容都會隨之變動。

## 2. 屬性綁定(Property Binding)

屬性綁定(Property Binding)是在 HTML 中的屬性加入 `[property]="value"`，執行期間 value 的變化，會值接影響 property。  

範例：
```ts
// ...
export class AppComponent {
    color: string = "blue";
}
```

```html
<div [ngClass]="color">Font color</div>
```
> 當 TypeScript 中的 color 改成其它 css 樣置，HTML div 中的顏色就會跟著改變。  

可以使用的 `property` 有以下幾種：
1. Element property  
```html
<img [src]="heroImageUrl">
```
2. Component property  
```html
<hero-detail [hero]="currentHero"></hero-detail>
```
3. Directive property  
```html
<div [ngClass]="{special: isSpecial}"></div>
```
4. attr property  
```html
<button [attr.aria-label]="help">help</button>
```
5. class property  
```html
<div [class.special]="isSpecial">Special</div>
```
6. style property  
```html
<button [style.color]="isSpecial ? 'red' : 'green'">
```

## 3. 事件綁定(Event Binding)

事件綁定(Event Binding)用法是在 HTML 中的加入 `(event)="functionName()"`，當發生指定 event 時，就會呼叫 TypeScript 中的 functionName 方法。  

範例：
```ts
// ...
export class AppComponent {
    onClick(value: string): void {
        alert("Hello " + value);
    }
}
```

```html
<button (click)="onClick('World')">Font color</button>
```

## 4. 雙向綁定(Two-way Data Binding)

雙向綁定(Two-way Data Binding)用法是在 HTML 中的加入 `[(ngModel)]="value"`。  
雙向綁定用於可以讓使用者互動的 HTML 元素，如：`<input>`、`<select>`、`<textarea>`...等。  

如上述所說，雙向綁定是屬性綁定加上事件綁定的組合，所以當 value 在 TypeScript 發生變化，HTML 就會跟著改變。  
在 HTML 中發生變化，TypeScript 中的內容也會跟著改變。  

範例：
```ts
// ...
export class AppComponent {
    name: string = "John";
}
```

```html
<input type="text" [(ngModel)]="name" />
```

> 要使用 ngModel 需要在該 Module 中加入 FormsModule。如下：  
```ts
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

## 執行結果

以下四種綁定的範例執行結果：  
![Angular 4 教學 - Data Binding 範例執行結果](/images/pasted-196.gif)

## 程式碼下載

[my-angular-data-binding](https://github.com/johnwu1114/my-angular-data-binding)

## 參考

[Angular Architecture](https://angular.io/guide/architecture)  
[Angular Template Syntax](https://angular.io/guide/template-syntax#property-binding)