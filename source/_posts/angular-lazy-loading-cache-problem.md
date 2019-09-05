---
title: Angular 4 教學 - Webpack 解決 Lazy Loading 暫存問題
author: John Wu
tags:
  - Angular
  - Lazy Loading
  - Webpack
categories:
  - Angular
date: 2017-09-28 23:03:00
featured_image: /images/a/357.png
---
![Angular 4 教學 - Webpack 解決 Lazy Loading 暫存問題](/images/a/357.png)  

通常我們在更新網站前端的 `*.js` 時，會在 URL 後面帶上 *Query String*，避免瀏覽器用到暫存中的 `*.js`。  
但如果是使用 Angular 4 (Angular 2) 的 Lazy Loading 時，分割的模組檔名及引用位置是由 Webpack 產生，沒辦法在 URL 後面帶上 *Query String*。  
本篇將介紹如何用 Webpack 解決 Lazy Loading 暫存問題。  

<!-- more -->

## 發生原因

如上圖 `bundle.js` 可以在 HTML 引用 js 的地方加上 `?v=1`，避免瀏覽器取用到暫存的 `bundle.js`。  
但 `1.js` 是透過 Lazy Loading 載入，並沒有直接在 HTML 引用，所以沒辦法加 *Query String* 的情況下，就算修改了 `1.js`，而瀏覽器拿到了暫存的 `1.js`，很可能就會導致網站異常。  

> Webpack 打包 Lazy Loading 可以參考這篇：[Angular 4 教學 - Lazy Loading](/article/asp-net-core-angular-4-教學-lazy-loading.html)

## Webpack 設定

Webpack 打包出來的 Lazy Loading 檔案 `0.js`、`1.js` 等，是屬於 *Chunk File*；*Chunk File* 可以透過 Webpack 的 **chunkFilename** 做一點手腳。  
在 webpack.config.js 的 **output** 中增加 **chunkFilename** 設定，把所有的 *Chunk File* 名稱都加上 **[chunkhash]**，確保當 *Chunk File* 內容改變時，包出來的 *Chunk File* 是不同的名稱。  
編輯 webpack.config.js  

```js
module.exports = {
    output: {
        chunkFilename: '[name].[chunkhash].js',
        // ...
    },
    // ...
}
```

## 執行結果

![Angular 4 教學 - Webpack 解決 Lazy Loading 暫存問題 - 執行結果](/images/a/358.png)  

## 參考

[output.chunkFilename](https://webpack.js.org/configuration/output/#output-chunkfilename)  