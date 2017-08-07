title: Angular 4 - Webpack 打包檔案分析
author: John Wu
tags:
  - Angular
  - jQuery
  - Webpack
categories:
  - Angular
date: 2017-08-07 21:07:00
---
![Angular 4 - Webpack 打包檔案分析](/images/pasted-279.png)

Angular 4 (Angular 2) 參考都是一連串的往底層參考，有時候用 Webpack 打包完的檔案大的莫名其妙。  
本篇將介紹如何用 `webpack-bundle-analyzer` 這個套件分析 Webpack 打包出來的檔案。  

<!-- more -->

## 1. 安裝套件

安裝 `webpack-bundle-analyzer` 套件，指令如下：
``` batch
npm install --save-dev webpack webpack-bundle-analyzer
```

## 2. Webpack 設定

修改 webpack.config.js 

```js
// ...
var bundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    // ...
    plugins: [
        // ...
        new bundleAnalyzer({
            analyzerMode: "static"
        })
    ]
}
```

## 執行結果

設定完成後執行 `webpack`，bundle 完成後瀏覽器就會自動開啟分析結果：
![Angular 4 - Webpack 打包檔案分析](/images/pasted-279.gif)
> 上圖 `0.js` 是 Lazy Loading 的 Module，照理來說不應該這麼大，用 `webpack-bundle-analyzer` 才發現參考到的 `mathjs` 比自己寫的 Module 還要大。

## 參考

[webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer)