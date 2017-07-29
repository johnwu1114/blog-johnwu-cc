title: Angular 4 教學 - Lazy Loading 共用模組
author: John Wu
tags:
  - Angular
  - TypeScript
  - Lazy Loading
categories:
  - Angular
date: 2017-06-21 10:09:00
---
![angular](/images/logo-angular.png)

當 Angular 4 開始拆分模組後，會有一些 Component、Pipe、Directive、Service 需要共用，此時就可以建立一個共用模組，包含這些可被共用的內容。  
本篇將介紹 Angular 4 的 Lazy Loading 共用模組。

<!-- more -->

## File Structure

此範例我建了兩個 Module 及一個 Pipe 檔案架構如下：

```yml
index.html
app/
  main.ts
  app.routes.ts
  # ...
  first/
    components/
      # ...
    first.module.ts
  second/
    components/
      # ...
    second.module.ts
  shared/
    pipes/
      localization.pipe.ts
```

## Declarations

如果只是要在其中一個 Module 使用 LocalizationPipe，可以在 NgModule 定義中的 declarations 加入 LocalizationPipe。如下：

```ts
// ...
@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    declarations: [
        LocalizationPipe,
        RouteUtil.getComponents(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class FirstModule { }
```

若使用如上述方法在 FirstModule 及 SecondModule 加入 LocalizationPipe，則會發生錯誤。  
先被載入的模組會正常，當載入第二個模組時就會出錯。錯誤訊息如下：  
> Error: Type e is part of the declarations of 2 modules: e and e! Please consider moving e to a higher module that imports e and e. You can also create a new NgModule that exports and includes e then import that NgModule in e and e.  

## 建立共用模組

在使用 Lazy Loading 時，同樣的 Declaration 不能被重複定義在不同的 Module。  
要避免此問題的話，需要另外建立一個共用的 Module，給其他 Module 載入。如下：  

shared\shared.module.ts
```ts
// ...
@NgModule({
    imports: [
    ],
    declarations: [
        LocalizationPipe
    ],
    exports: [
        LocalizationPipe
    ]
})
export class SharedModule { }
```

在 FirstModule 及 SecondModule 載入 SharedModule。如下：  
```ts
// ...
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    declarations: [
        RouteUtil.getComponents(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class FirstModule { }
```

如此一來，就可在不同的 Module 共用 LocalizationPipe。

## 程式碼下載

[asp-net-core-angular-routing](https://github.com/johnwu1114/my-angular-lazy-loading-shared-module)  