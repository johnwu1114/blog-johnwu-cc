---
title: Jenkins - Pipeline Job 取用 Boolean 參數
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
  - Boolean
categories:
  - Jenkins
date: 2017-08-22 11:36:00
featured_image: /images/x306.png
---

![Jenkins - Pipeline Job 取用 Boolean 參數 - 執行結果 - 1](/images/x306.png)

Jenkins 的 Pipeline Job 傳遞 Boolean 參數時有一點雷，我第一次用 Boolean 參數真的被卡了一陣子。  
本篇將介紹 Pipeline Job 在 Groovy 中取用 Boolean 參數的問題。  

<!-- more -->

## 1. Pipeline Job

先建立一個帶 Boolean 參數的 Pipeline Job。步驟如下：

![Jenkins - Pipeline Job 取用 Boolean 參數 - 新增參數 - 1](/images/x304.png)
![Jenkins - Pipeline Job 取用 Boolean 參數 - 新增參數 - 2](/images/x305.png)

## 2. Groovy

在 Groovy 把參數顯示出來，並建立簡單的判斷式。

```groovy
// BooleanSamplePipelineJob

echo "isTest=${isTest}"

if(isTest) {
    echo "Do something.."
} else {
    echo "Do nothing.."
}

echo "Done"
```

## 3. 執行 Pipeline Job

執行 Pipeline Job 第一次把 isTest 打勾，第二次不要打勾：
![Jenkins - Pipeline Job 取用 Boolean 參數 - 執行](/images/x308.png)
![Jenkins - Pipeline Job 取用 Boolean 參數 - 執行結果 - 1](/images/x306.png)

> 照 Groovy 邏輯 **isTest=false** 應該要顯示 *Do nothing..*，結果完全不符合預期。  

## 4. 修正方式

主要原因是傳入的 Boolean 參數是物件型別的 `Boolean`，並且有實作 `.toString()` 方法，因此在 echo 中顯示正常。  
但用於 Groovy 判斷式時，因為該物件不是 `null`，所以被認定為是 `true`。  

解決方式是，收到外部 Boolean 參數後，用 `Boolean.valueOf( )` 轉存到區域變數中再使用。如下：

```groovy
// BooleanSamplePipelineJob

def _isTest = Boolean.valueOf(isTest)
echo "_isTest=${_isTest}"

if(_isTest) {
    echo "Do something.."
} else {
    echo "Do nothing.."
}

echo "Done"
```

## 執行結果

![Jenkins - Pipeline Job 取用 Boolean 參數 - 執行結果 - 2](/images/x307.png)