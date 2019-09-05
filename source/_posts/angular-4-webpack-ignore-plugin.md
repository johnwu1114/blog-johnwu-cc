---
title: Angular 4 - Webpack 打包忽略指定套件(Ignore Plugin)
author: John Wu
tags:
  - Angular
  - Webpack
categories:
  - Angular
date: 2017-08-09 12:17:00
featured_image: /images/a/288.png
---
![Angular 4 - Webpack Ignore Plugin - moment](/images/a/288.png)

最近在檢查 Angular 4 (Angular 2) 用 Webpack 打包出來的檔案，發現參考到 `moment` 套件有很多不必要的內容。沒用到的部分也被一併打包，搞的打包完的檔案很大。  
本篇將介紹如何使 Webpack 打包忽略指定套件(Ignore Plugin)，把不必要的內容排除。  

<!-- more -->

上圖是用 `webpack-bundle-analyzer` 套件分析的結果。  
> `webpack-bundle-analyzer` 套件請參考 [Angular 4 - Webpack 打包檔案分析](angular-4-webpack-bundle-analyzer)。  

可以看到 `moment` 套件中的 `locale` 比 `moment.js` 還要大 1.3 倍，而 `locale` 是多國語言的支援檔，實際上我根本不需要用到這麼多。  

## Webpack 設定

在 Webpack plugins 中加入 `IgnorePlugin`，指定要排除的檔案。  
`IgnorePlugin` 有兩個參數，都是使用正規表示式：  
1. 要排除打包的檔案  
2. 要排除打包的套件(資料夾)名稱 (非必要)  

修改 Webpack 設定　webpack.config.js
```js
module.exports = {
    // ...
    plugins: [
        // ...
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
}
```

照上面範例，表示全部的語系都會被忽略，假設要保留 `zh-tw` 及 `en-gb` 可以改為：

```js
module.exports = {
    // ...
    plugins: [
        // ...
        new webpack.IgnorePlugin(/^\.\/(?!zh-tw|en-gb)/, /moment[\/\\]locale$/)
    ]
}
```

## 執行結果

![Angular 4 - Webpack Ignore Plugin - 執行結果](/images/a/289.png)

`moment` 區塊大小從 Gzip 254.02KB -> 81.27KB，相當不錯的優化。

## 參考

https://webpack.js.org/plugins/ignore-plugin/