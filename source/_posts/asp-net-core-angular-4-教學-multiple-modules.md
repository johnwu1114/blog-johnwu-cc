---
title: Angular 4 教學 - Multiple Modules
author: John Wu
tags:
  - Angular
  - TypeScript
  - Routing
categories:
  - Angular
date: 2017-04-30 23:54:00
---
![Angular 4 教學 - Multiple Modules 範例執行結果](/images/pasted-107p.png)

本篇將介紹 Angular 4 的 Routing 在多個 Modules 的情況下，實現 Single Page Application(SPA)。  

<!-- more -->

程式碼延續前兩篇的範例：  
[ASP.NET Core + Angular 4  教學 - 從無到有](/article/asp-net-core-angular-4-教學-從無到有.html)  
[ASP.NET Core + Angular 4  教學 - Webpack打包](/article/asp-net-core-angular-4-教學-webpack.html)  

ASP.NET Core Routing 不熟悉的話，請先參考：  
[ASP.NET Core + Angular 4  教學 - Routing](/article/asp-net-core-angular-4-教學-routing.html)

## 1. Single Module

### 1.2 File Structure

首先我建立兩個資料夾分別為 `first` 及 `second`，各三個 Component 為 `one.component`、`two.component`及`three.component`。  
檔案結構如下：

```yml
index.html
app/
  main.ts
  app.component.ts
  app.component.html
  app.routes.ts
  components/
    first/
      one.component.ts
      two.component.ts
      three.component.ts
    second/
      one.component.ts
      two.component.ts
      three.component.ts
```

### 1.2 Routing

在 main.ts 中，會有 Angular 進入點的 Module，如下：
```js
//...

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(AppRoutes.getRoutes())
    ],
    declarations: [
        AppComponent,
        AppRoutes.getComponents()
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

如過不想拆分模組，可以把 Routing 全部註冊在 app.routes.ts，例如：
```
// ...

const routes: RouteItem[] = [
    {
        path: "",
        redirectTo: "first",
        pathMatch: "full",
    },
    {
        path: "first",
        children: [
            {
                path: "",
                redirectTo: "one",
                pathMatch: "full"
            },
            {
                path: "one",
                component: First.OneComponent
            },
            {
                path: "two",
                component: First.TwoComponent
            },
            {
                path: "three",
                component: First.ThreeComponent
            }
        ]
    },    
	{
        path: "second",
        children: [
            {
                path: "",
                redirectTo: "one",
                pathMatch: "full"
            },
            {
                path: "one",
                component: Second.OneComponent
            },
            {
                path: "two",
                component: Second.TwoComponent
            },
            {
                path: "three",
                component: Second.ThreeComponent
            }
        ]
    },
];

export class AppRoutes {
    public static getRoutes(): RouteItem[] {
        return routes;
    }

    public static getComponents(): any[] {
        return RouteUtil.getComponents(routes);
    }
}
```

但隨著系統越做越大，這樣的架構並不是這麼好管理，而且效能也會比較差，所以就會建議拆分多個模組。

## 2. Multiple Modules

### 2.1 File Structure

把 `first` 及 `second` 這兩個資料夾，變成兩個模組，分別加入一個 `*.routes.ts`。
同時改變上述的檔案結構，如下：
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

### 2.2 Routing

first.routes.ts  
```ts
// ...

const routes: Route[] = [
    {
        path: "",
        redirectTo: "one",
        pathMatch: "full",
    }, {
        path: "one",
        component: OneComponent
    }, {
        path: "two",
        component: TwoComponent
    }, {
        path: "three",
        component: ThreeComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
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

會發現 first.routes.ts  很像是 main.ts 及 app.routes.ts 的綜合體，基本上也可以把 first.routes.ts 拆成兩個 ts，分別為：  
* first.ts 負責宣告 NgModule，如同 main.ts。  
* first.routes.ts 負責管理 routes，如同 app.routes.ts。  

*因為 second.routes.ts 幾乎一樣，所以省略說明。*  

透過 loadChildren 把 FirstModule 及 SecondModule 加到 app.routes.ts 的路由中：
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
        loadChildren: () => FirstModule
    },
    {
        path: "second",
        loadChildren: () => SecondModule
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

路由只要指到 /first，就會去找 FirstModule 裡面的 RouterModule.forChild(routes)，接力完成路由。  
用 loadChildren 就可以輕鬆完成多模組的路由了。

### 2.3 執行結果

![Angular 4 教學 - Multiple Modules 範例執行結果](/images/pasted-107.gif)

## 程式碼下載

[asp-net-core-angular-routing](https://github.com/johnwu1114/asp-net-core-angular-routing)  
> 範例程式是用 ASP.NET Core + Angular 4，Angular 4 要改成 lite-server 執行的話，可以參考 [Angular 4 教學 - 從頭開始](/article/angular-4-教學-從頭開始.html)