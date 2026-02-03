---
title: Webpack 4 打包 Sass to Css 範例
author: John Wu
tags:
  - Webpack
  - Sass
categories:
  - Webpack
date: 2018-10-22 11:04:00
---
![Webpack 4 打包 Sass to Css 範例](/images/featured/webpack-sass-to-css.png)

前幾天 Designer 來求助，問怎麼透過 Webpack 打包 Sass，順手就寫了一篇教學。  
本文將介紹，如何透過 Webpack 4 將 Sass 打包成 Css 檔案。  

<!-- more -->

## 前置準備

1. 需要先安裝 node.js，官方下載位置：https://nodejs.org/en/  
2. 安裝完成後，透過指令更新 npm 到最新版  
```sh
npm i -g npm
```

## 建立專案

新增一個資料夾，在該資料夾內執行指令，建立 npm 專案：  
```sh
npm init -f
```
資料夾內會多出 `package.json` 的檔案。

### 安裝 Webpack 套件
```sh
npm i -D webpack webpack-cli 
```

### 安裝 Sass 所需套件
```sh
npm i -D node-sass sass-loader css-loader mini-css-extract-plugin
```

安裝完成後 `package.json` 大概會長這樣：  
```json
{
  "name": "sass-sample",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## Webpack 定義

在專案資料夾中新增 `webpack.config.js`  
```js
// 載入轉存 css 檔案的套件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var config = {
    entry: {
        // 指定進入點並設定名稱及來源
        // "名稱":"來源 scss or sass 檔案"
        "output-sample": "./scss/sample.scss"
    },
    module: {
        rules: [{
            test: /\.(scss|sass)$/,
            use: [
                // 需要用到的 loader
                MiniCssExtractPlugin.loader,
                "css-loader",
                "sass-loader"
            ]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // 指定輸出位置
            // [name] 為上方進入點設定的 "名稱"
            filename: "./css/[name].css"
        })
    ]
};

module.exports = config;
```

## Webpack 打包

### 定義 npm 指令

在 `package.json` 中找到 **scripts** 區塊，新增一個 **build** 的指令：  
```js
{
  // ..
  "scripts": {
    // "自訂的指令名稱": "指令的內容"
    "build": "webpack --config webpack.config.js"
  },
  // ..
}
```
存檔後就可以使用指令 `npm run build` 告知 *Webpack* 套用 `webpack.config.js` 內定義的方式打包。

### 輸出內容

執行完成後，專案資料夾底下會多出 `dist` 資料夾，輸出的 ***.css** 檔案會在這裡面。  
照此範例的設定，輸出檔案架構如下：  
```yml
dist/
    css/
        output-sample.css
    output-sample.js
```
> `*.js` 無須理會