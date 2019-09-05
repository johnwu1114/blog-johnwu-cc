---
title: Angular 4 - IE9 JavaScript 錯誤
author: John Wu
tags:
  - Angular
  - IE9
categories:
  - Angular
date: 2017-08-09 09:46:00
featured_image: /images/a/287.png
---
![Angular 4 - IE9 不支援 `apply` 錯誤](/images/a/287.png)

Angular 4 (Angular 2) 在 IE9 運行發生整頁空白，看 Console Log 會發現拋出 JavaScript 不支援 `apply` 的錯誤。  
可以透過 Angular Shim/Polyfill for IE9 的套件解決此問題。  

<!-- more -->

上圖完整錯誤訊息如下：
```
Unhandled Promise rejection:Object doesn't support property or method 'apply'; Zone:<root>; Task:Promise.then; Value:TypeError: Object doesn't support property or method 'apply'undefined 
Error: Uncaught (in promise): TypeError: Object doesn't support property or method 'apply' 
```

## 1. 安裝套件

安裝 `angular2-ie9-shims` 套件，指令如下：
``` batch
npm install --save angular2-ie9-shims
```
> 雖然套件名稱是 `angular2`，但 Angular 4 也適用此套件。

## 2. 載入套件

把 `angular2-ie9-shims` 插入在載入之前，由於只要在 IE9 以下版本載入此套件，所以可以透過 HTML 的 Conditional Comments 載入：
```html
<html>
  <head>
    <title>MyAngular4</title>
    <base href="/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!--[if lte IE 9]>
      <script src="/node_modules/angular2-ie9-shims/shims_for_IE.prod.js"></script>
    <![endif]-->

    <script src="/node_modules/core-js/client/shim.min.js"></script>
    <script src="/node_modules/zone.js/dist/zone.js"></script>
    <script src="/node_modules/systemjs/dist/system.src.js"></script>
    <script src="/systemjs.config.js"></script>
    <script>
        System.import("/app/main.js").catch(function (err) { console.error(err); });
    </script>
  </head>
  <body>
    <!-- body content ... -->
  </body>
</html>
```

載入後再次執行就可以在 IE9 運行 Angular 了。

> Angular 不支援 IE8 (含)以下版本，如果是 IE8 以下版本就不用試了，改用 jQuery 吧！

## 參考

https://www.npmjs.com/package/angular2-ie9-shims