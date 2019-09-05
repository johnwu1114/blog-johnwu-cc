---
title: Angular 4 教學 - Lazy Loading 使用 BrowserModule 
author: John Wu
tags:
  - Angular
  - TypeScript
  - Lazy Loading
  - Angular Modules
categories:
  - Angular
date: 2017-06-21 22:39:00
featured_image: /images/featured/angular.png
---
![angular](/images/featured/angular.png)

BrowserModule 是 Angular 4 (Angular 2) 必用的模組，但使用 Lazy Loading 時，多個模組載入 BrowserModule 竟然會發出 ERROR！  
本篇將介紹如何解決 Lazy Loading 載入 BrowserModule 發出 ERROR 的問題。  

<!-- more -->

## File Structure

我用以下檔案架構表示 Lazy Loading 相關的模組：

```yml
index.html
app/
  main.ts
  app.routes.ts
  first/
    first.module.ts
  second/
    second.module.ts
```

## BrowserModule

main.ts 代表著 Angular 的程式進入點 Mobule，AppMobule 必須載入 BrowserModule 如下：

```ts
// ...
@NgModule({
    imports: [
        BrowserModule,
        // ..
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

若想在 FirstModule 及 SecondModule 中使用 NgIf、NgFor 等 Directives，就會需要載入 BrowserModule。  
但 BrowserModule 被二次載入則會發生錯誤。錯誤訊息如下：  

> Error: BrowserModule has already been loaded. If you need access to common directives such as NgIf and NgFor from a lazy loaded module, import CommonModule instead.  

由於 BrowserModule 只能被載入一次，而 Angular Application Main Module 又必定要載入他，導致其他的 Modules 不能二次載入。  

## CommonModule

錯誤訊息也很貼心的提示，請改用 CommonModule。  
因此，就把 BrowserModule 留給 AppModule 使用，而在 FirstModule 及 SecondModule 改用 CommonModule。如下：  
```ts
import { CommonModule } from "@angular/common";
// ...
@NgModule({
    imports: [
        CommonModule,
        // ..
    ]
})
export class FirstModule { }
```

## SharedModule

你可能會想說，為什麼不做一個 SharedModule 把 BrowserModule 載到裡面，其他要用到 BrowserModule 的只要載入 SharedModule 就好？  
例如：
```ts
@NgModule({
    imports: [
        BrowserModule
    ],
    exports: [
        BrowserModule
    ]
})
export class SharedModule { }

@NgModule({
    imports: [ SharedModule ]
})
export class AppModule { }

@NgModule({
    imports: [ SharedModule ]
})
export class FirstModule { }

@NgModule({
    imports: [ SharedModule ]
})
export class SecondModule { }
```
> 答案：不行，被載入的 Module 並不是 Single Instance。  
FirstModule 載入時，SharedModule 會建立一個 Instance。  
SecondModule 載入時，SharedModule 會建立另一個 Instance。  
這意味著 BrowserModule 也會變載入兩次。

但往 SharedModule 這個出發點去想是好的，你可以改成如下：
```ts
@NgModule({
    imports: [
        CommonModule,
        // Other Module...
    ],
    exports: [
        CommonModule,
        // Other Module...
    ]
})
export class SharedModule { }

@NgModule({
    imports: [
        BrowserModule,
        SharedModule 
    ]
})
export class AppModule { }

@NgModule({
    imports: [ SharedModule ]
})
export class FirstModule { }

@NgModule({
    imports: [ SharedModule ]
})
export class SecondModule { }
```
> 通常 imports 都會有很多，而且又是每個 Modules 都會用到，所以放到 SharedModule 至少程式碼可以少一點，也方便管理載入的 Modules。  