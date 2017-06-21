title: Angular 4 File Structure
author: John Wu
tags:
  - Angular
  - TypeScript
categories:
  - Angular
date: 2017-04-25 11:41:00
---

最近有一個新專案要用 Angular 4 開發，突然覺得之前開發 Angular 2 及 Angular 4 的目錄結構有點亂，想藉此機會整理一下檔案架構。  
我重新檢視這一年來用 Angular 2 及 Angular 4 開發的專案。同時參考了國外 Angular 大師的 Blog 及一些 GitHub 專案，整理成這篇 Angular 4 File Structure。

<!-- more -->

## 範例 1 - Single Module

如果專案不大，沒有需要分 Module 的話，我建議用這樣的檔案架構：

```yml
index.html                          # 起始頁面
app/                                # Angular 4 的主要目錄
  main.ts                           # bootstrap 的程式進入點
  app.component.ts                  # 給 bootstrap 啟動的第一個 component (e.g. AppComponent)
  app.component.html                # app.component 用到的 template
  app.component.css                 # app.component 用到的 css
  app.routes.ts                     # 路由定義 (e.g. AppRoutes)
  components/                       # 功能性頁面的目錄
    contacts.component.ts           # 資料頁面  (e.g. ContactsComponent)
    contacts.component.html
    contacts.component.css
    contacts-list.component.ts      # 清單頁面 (e.g. ContactsListComponent)
    contacts-list.component.html
    contacts-list.component.css
  shared/                           # 共用的東西都放這，或者不會被路由開啟的 component
    config.ts                       # 自製的設定檔
    definitions/
      typings.d.ts                  # 自訂 TypeScript type 的定義檔 
    components/   
      dialog.component.ts           # 很多頁面都會共用的 component。如：對話框 (e.g. DialogComponent)
      dialog.component.html
      dialog.component.css 
      menu.component.ts             # 不會被路由開啟的 component。如：選單 (e.g. MenuComponent)
      menu.component.html
      menu.component.css
    directives/
      ckeditor.directive            # 自製的 directive (e.g. CKEditorDirective)
    models/
      result.model.ts               # 用來跟頁面或 API 互動的資料容器 (e.g. ResultModel)
    services/
      signalr.service.ts            # 自製的 service (e.g. SignalRService)
```

## 範例 2 - Multiple Modules

如果專案較大，有分很多個 Module 的話，我建議用這樣的檔案架構：

```yml
index.html                          # 起始頁面
app/                                # Angular 4 的主要目錄
  main.ts                           # bootstrap 的程式進入點
  app.component.ts                  # 給 bootstrap 啟動的第一個 component (e.g. AppComponent)
  app.component.html                # app.component 用到的 template
  app.component.css                 # app.component 用到的 css
  app.routes.ts                     # 路由定義 (e.g. AppRoutes)
  contacts/                         # 模組的目錄
    contacts.routes.ts              # 模組的路由定義 (e.g. ContactsRoutes)
    components/                     # 模組的功能性頁面目錄
      contacts.component.ts         # 資料頁面  (e.g. ContactsComponent)
      contacts.component.html       
      contacts.component.css        
      contacts-list.component.ts    # 清單頁面 (e.g. ContactsListComponent)
      contacts-list.component.html
      contacts-list.component.css
    models/
      contact.model.ts              # 用來跟頁面或 API 互動的資料容器 (e.g. ContactModel)
    services/
      contacts.service.ts           # 自製的 service (e.g. ContactsService)
  shared/                           # 共用的東西都放這，或者不會被路由開啟的 component
    config.ts                       # 自製的設定檔
    definitions/
      typings.d.ts                  # 自訂 TypeScript type 的定義檔 
    components/   
      dialog.component.ts           # 很多頁面都會共用的 component。如：對話框 (e.g. DialogComponent)
      dialog.component.html        
      dialog.component.css         
      menu.component.ts             # 不會被路由開啟的 component。如：選單 (e.g. MenuComponent)
      menu.component.html
      menu.component.css
    directives/
      ckeditor.directive            # 自製的 directive (e.g. CKEditorDirective)
    models/
      result.model.ts               # 用來跟頁面或 API 互動的資料容器 (e.g. ResultModel)
    services/
      signalr.service.ts            # 自製的 service (e.g. SignalRService)
```

## Visual Studio 2017

Visual Studio 2017 網站專案的新功能，會自動收合同名 `*.html` 下的 `*.css`、`*.ts`、`*.js`及`*.js.map`。  
這個功能讓整個檔案架構看起來超清爽～～  

如下圖，左邊是 Visual Studio 2017 方案總管的呈現，右邊是實際的檔案位置：  
![Visual Studio 2017 方案總管呈現 TypeScript 的 File Structure](/images/pasted-91.gif)

## 參考

* [Angular 2 Styles and File Structure](https://johnpapa.net/angular-2-styles/)
* [Angular Style Guide](https://angular.io/styleguide)