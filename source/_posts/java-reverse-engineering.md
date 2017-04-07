title: Java 逆向工程
author: John Wu
tags:
  - Java
  - 逆向工程
  - ' Reverse Engineering'
categories:
  - 逆向工程
date: 2017-03-30 14:15:00
---
最近在試用某軟體，試用期太短又被限制功能，想延長試用期限跟打開被限制的功能。  
所以就誕生了此篇解除封印教學，呼籲**請支持正版！**

## 前言

該付費軟體是用Java開發，並打包成jar檔。此教學適用於**沒有被混淆**過的jar檔。  
怕有法律問題，故不公開軟體名稱。以下以 **target.jar** 代稱。

## 執行程式

首先我們要確定**target.jar**能被正常執行。我用的**target.jar**是用console來執行，執行畫面如下：

![](/images/pasted-18.png)

## 查看原始碼

使用[Java Decompiler](http://jd.benow.ca/)打開**target.jar**，可以瀏覽jar檔裡面的內容，並能看到編譯後的class以原始碼的方式呈現。展開**target.jar**找到名稱較為關鍵的字眼(如：License、Validate)，看功力也看運氣。  
在**target.jar**我有找到LicenseProvider.class，大概看一下程式碼後，可以判斷出它從外部載入參數，讀入記憶體中，包含了限制條件即使用期限等等（如下圖）。

![](/images/pasted-19.png)

## 模擬物件

由於授權資訊跟限制條件是在LicenseProvider載入，只要把他改寫，就可以成功延長授權，步驟如下：
### 用eclipse開新Java專案(或其它Java IDE)  
![](/images/pasted-20.png)

### 專案名稱跟LicenseProvider的package name相同  
![](/images/pasted-22.png)

### 在該專案建立新的class，名稱為LicenseProvider  
![](/images/pasted-23.png)

### 將Java Decompiler 讀到的LicenseProvider複製到LicenseProvider.java  
![](/images/pasted-24.png)

### 改掉限制條件，並延長使用期限  
![](/images/pasted-25.png)

### 因程式碼少了外部reference，所以載入原本的**target.jar**  
![](/images/pasted-26.png)

### 進行編譯  
![](/images/pasted-27.png)

### 用WinRAR把原本的**target.jar**打開，並用編譯後的LicenseProvider.class取代  
*※記得把eclipse跟Java Decompiler關掉，不然**target.jar**會被咬死不能編輯內容*  

![](/images/pasted-29.png)

## 解除封印

回到console再次執行，執行畫面如下：

![](/images/pasted-28.png)