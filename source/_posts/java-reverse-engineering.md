---
title: Java 逆向工程
author: John Wu
tags:
  - Java
  - Reverse Engineering
categories:
  - 逆向工程
date: 2017-03-30 14:15:00
featured_image: /images/a/28.png
---
![Java 逆向工程 - 解除封印 - 執行結果](/images/a/28.png)

最近在試用某軟體，試用期太短又被限制功能，想延長試用期限跟打開被限制的功能。  
所以就誕生了此篇解除封印教學，呼籲**請支持正版！**

## 前言

該付費軟體是用Java開發，並打包成jar檔。此教學適用於**沒有被混淆**過的 jar 檔。  
怕有法律問題，故不公開軟體名稱。以下以 **target.jar** 代稱。

<!-- more -->

## 執行程式

首先我們要確定 **target.jar** 能被正常執行。我用的 **target.jar** 是用console來執行，執行畫面如下：

![Java 逆向工程 - 執行結果](/images/a/18.png)

## 查看原始碼

使用 [Java Decompiler](https://goo.gl/FTF58r) 打開**target.jar**，可以瀏覽jar檔裡面的內容，並能看到編譯後的 class 以原始碼的方式呈現。展開 **target.jar** 找到名稱較為關鍵的字眼(如：License、Validate)，看功力也看運氣。  
在 **target.jar** 我有找到 LicenseProvider.class，大概看一下程式碼後，可以判斷出它從外部載入參數，讀入記憶體中，包含了限制條件即使用期限等等（如下圖）。

![Java 逆向工程 - 查看原始碼](/images/a/19.png)

## 模擬物件

由於授權資訊跟限制條件是在 LicenseProvider 載入，只要把他改寫，就可以成功延長授權，步驟如下：

### 1. 用 eclipse 開新 Java 專案(或其它 Java IDE)  

![Java 逆向工程 - eclipse 開新 Java 專案 - 1](/images/a/20.png)

### 2. 專案名稱跟 LicenseProvider 的 package name 相同  

![Java 逆向工程 - eclipse 開新 Java 專案 - 2](/images/a/22.png)

### 3. 在該專案建立新的 class，名稱為 LicenseProvider  

![Java 逆向工程 - 建立 LicenseProvider](/images/a/23.png)

### 4. 將 Java Decompiler 讀到的LicenseProvider複製到LicenseProvider.java  

![Java 逆向工程 - 編輯 LicenseProvider - 1](/images/a/24.png)

### 5. 改掉限制條件，並延長使用期限  

![Java 逆向工程 - 編輯 LicenseProvider - 2](/images/a/25.png)

### 6. 因程式碼少了外部 reference ，所以載入原本的 **target.jar**  

![Java 逆向工程 - 載入原 jar](/images/a/26.png)

### 7. 進行編譯  

![Java 逆向工程 - 編譯  ](/images/a/27.png)

### 8. 用 WinRAR 把原本的 **target.jar** 打開，並用編譯後的 LicenseProvider.class 取代  

> ※記得把 eclipse 跟 Java Decompiler 關掉，不然 **target.jar** 會被咬死不能編輯內容*  
![Java 逆向工程 - 取代 LicenseProvider.class](/images/a/29.png)

## 解除封印

回到console再次執行，執行畫面如下：

![Java 逆向工程 - 解除封印 - 執行結果](/images/a/28.png)