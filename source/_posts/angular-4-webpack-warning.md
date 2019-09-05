---
title: Angular 4 - Webpack Warning
author: John Wu
tags:
  - Angular
  - Webpack
categories:
  - Angular
date: 2017-08-06 16:55:00
featured_image: /images/a/278.png
---
![Angular 4 - Webpack Warning](/images/a/278.png)

Angular 4 (Angular 2) 用 Webpack 打包遇到警告：  
* `WARNING in ./~/@angular/core/@angular/core.es5.js`  
* `WARNING in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js`  
雖然可以忽視它，但把 `WARNING` 忽視並不是好的做法，本篇將介紹如何修復 Webpack 打包出現的此警告。  

<!-- more -->

## Angular 4

在 Angular 4 用 Webpack 打包遇到警告訊息如下：
```
WARNING in ./~/@angular/core/@angular/core.es5.js
5870:15-36 Critical dependency: the request of a dependency is an expression
    at ImportContextDependency.getWarnings (*****\node_modules\webpack\lib\dependencies\ImportContextDependency.js:28:4)
    at Compilation.reportDependencyErrorsAndWarnings (*****\node_modules\webpack\lib\Compilation.js:663:24)
    at Compilation.finish (*****\node_modules\webpack\lib\Compilation.js:526:9)
    at *****\node_modules\webpack\lib\Compiler.js:472:16
    at *****\node_modules\tapable\lib\Tapable.js:225:11
    at *****\node_modules\webpack\lib\Compilation.js:472:11
    at *****\node_modules\webpack\lib\Compilation.js:443:13
    at nextTickCallbackWith0Args (node.js:452:9)
    at process._tickCallback (node.js:381:13)
```

在 Webpack 的 `plugins` 中加入 `ContextReplacementPlugin` 如下：
```js
var webpack = require("webpack");

module.exports = {
    // ...
    plugins: [
        // ...
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            __dirname + "./app" // Angular Source
        )
    ]
}
```

> `Angular Source` 換成你的目錄位置，我上述範例的對應位置如下：
```yml
app/                                # Angular 4 的主要目錄
node_modules/                       # NPM 套件
package.json                        # NPM 套件管理
tsconfig.json                       # TypeScript 設定檔
webpack.config.js                   # Webpack 設定檔
```

設定完成後，再次執行 `webpack` 就不會發生警告了。

## Angular 2

在 Angular 2 用 Webpack 打包遇到警告訊息如下：
```
WARNING in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js
45:15-36 Critical dependency: the request of a dependency is an expression
    at ImportLazyContextDependency.getWarnings (*****\node_modules\webpack\lib\dependencies\ImportContextDependency.js:28:4)
    at Compilation.reportDependencyErrorsAndWarnings (*****\node_modules\webpack\lib\Compilation.js:672:24)
    at Compilation.finish (*****\node_modules\webpack\lib\Compilation.js:535:9)
    at *****\node_modules\webpack\lib\Compiler.js:491:16
    at *****\node_modules\tapable\lib\Tapable.js:289:11
    at _addModuleChain (*****\node_modules\webpack\lib\Compilation.js:481:11)
    at processModuleDependencies.err (*****\node_modules\webpack\lib\dependencies\ImportContextDepedency.js:28:4)
```

解法同上，在 Webpack 的 `plugins` 中加入 `ContextReplacementPlugin`，但參數有些不同。如下：
```js
var webpack = require("webpack");

module.exports = {
    // ...
    plugins: [
        // ...
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname + "./app" // Angular Source
        )
    ]
}
```