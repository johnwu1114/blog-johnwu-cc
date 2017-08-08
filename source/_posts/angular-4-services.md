---
title: Angular 4 教學 - Service
author: John Wu
tags:
  - Angular
  - TypeScript
  - Service
categories:
  - Angular
date: 2017-07-09 22:27:00
---
![Angular 4 教學 - Service - Module Providers](/images/pasted-234.png)

為了使 Component 程式碼更致力於與 Template 互動，同常會把邏輯或 Client 端的資料暫存用 Service 包裝，需要用到 Service 時，再透過建構子注入使用。  
本篇將介紹 Angular 4 (Angular 2) 的 Service 包裝及 DI (Dependency Injection)。  

<!-- more -->

## DI 運作方式

Angular 的 DI 是採用 Constructor Injection，也就是說會把實例化的物件從建構子傳入。例如：
```ts
@Component({
    providers: [
        SampleService
    ]
})
export class MyComponent {
    constructor(private sampleService: SampleService) {
        // ...
    }
}
```
上述的 sampleService 實體，會在 MyComponent 被實例化的時候注入進來。  
而 sampleService 的實體是透過 Component Providers 建立出來的。  

## 1. 建立 Service

要成為可被注入的 Service 必須要加上 `@Injectable()` 的 Metadata。如下：  

```ts
import { Injectable } from "@angular/core";

@Injectable()
export class SampleService {
    // ..
}
```

## 2. 註冊 Service

註冊 Service 有兩種方式：
1. Component Providers  
當 Component 被實例化時，會建立 Service 的實體。  
2. Module Providers  
當 Module 被實例化時，會建立 Service 的實體。  

### 2.1. Component Providers 

將 Service 註冊在 Component 的 Providers 中。程式碼如下：
```ts
@Component({
    providers: [
        SampleService
    ]
})
export class MyComponent {
    constructor(private sampleService: SampleService) {
        // ...
    }
}
```
當 Component 被實例化時，會建立一個新的 Service 實體，Service 的存活週期是跟隨著 Component。  
所以註冊在 Component Providers 就只有該 Component 可以使用，並不會與其他的 Component 共用。示意圖如下：

![Angular 4 教學 - Service - Component Providers](/images/pasted-232.png)

### 2.2. Module Providers  

將 Service 註冊在 Module 的 Providers 中。程式碼如下：

```ts
@NgModule({
    providers: [
        SampleService
    ]
})
export class AppModule { }

@Component({
    // ...
})
export class MyComponent {
    constructor(private sampleService: SampleService) {
        // ...
    }
}
```
當 Module 被實例化時，會建立一個新的 Service 實體，Service 的實體是跟隨著 Module。  
若註冊在 Module 則該 Mobulde 中的所有 Component 都會共用同一個實體。示意圖如下：

![Angular 4 教學 - Service - Module Providers](/images/pasted-233.png)
> MyComponent、FirstComponent、SecondComponent 使用的 SampleService 會是同一個實體。  

註冊在越高層級的 Module 則可使用範圍越廣。示意圖如下：
![Angular 4 教學 - Service - Module Providers](/images/pasted-234.png)
> MyComponent、FirstComponent、FirstModule 的 FirstComponent 使用的 SampleService 會是同一個實體。  
> 如果你希望程式啟動後，Service 共用同一個實體，就把 Service 註冊在 AppModule (Root Module)。

## 3. Singleton Service

基本上只要在 AppModule (Root Module) 的 Providers 註冊 Service，該 Service 就只會有一個實體。  
但如果你是負責提供 Service 的人，深怕其他人誤用，要確保你的 Service 一定只能有一個實體的話，你也可以自己實作 Singleton Service。  
程式碼如下：
```ts
import { Injectable } from "@angular/core";

@Injectable()
export class SingletonService  {
    private static _instance: SingletonService;

    constructor() {
        return SingletonService._instance = SingletonService._instance || this;
    }
}
```

## 範例程式

範例程式我建立了五個 Service：
1. ControllerService  
2. ModuleService  
3. SharedModuleService  
4. AppModuleService  
5. SingletonService  

分別註冊在不同的 Providers，如下：
```ts
@Component({
    providers: [ ControllerService ]
}) export class SampleComponent { }

@NgModule({
    imports: [ SharedModule ],
    providers: [ ModuleService ]
}) export class FirstModule { }

@NgModule({
    imports: [ SharedModule ],
    providers: [ ModuleService ]
}) export class SecondModule { }

@NgModule({
    imports: [ SharedModule ],
    providers: [ ModuleService ]
}) export class ThirdModule { }

@NgModule({
    providers: [ SharedModuleService ]
}) export class SharedModule { }

@NgModule({
    providers: [
        AppModuleService,
        SingletonService
    ]
}) export class AppModule { }
```
> ThirdModule 是 Lazy Loading 的 Module  

這個範例實際產生的 Service 實體如下：
![Angular 4 教學 - Service - 範例](/images/pasted-235.png)

> SharedModule 是比較容易被混淆的，被 Import 的 Module 會跟著使用的 Module 一起被實例化。  
> 所以 First、Second 及 ThirdModule 雖然都是 Import SharedModule，但 SharedModule 確是三個不同的實例。  

### 程式碼下載

[my-angular-services](https://github.com/johnwu1114/my-angular-services)

## 參考

https://angular.io/tutorial/toh-pt4  
https://angular.io/guide/dependency-injection  