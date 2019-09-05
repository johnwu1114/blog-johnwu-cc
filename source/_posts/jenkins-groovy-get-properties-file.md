---
title: Jenkins - Groovy 從外部檔案取得變數
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-03 23:31:00
featured_image: /images/a/272.png
---

![Jenkins - Groovy 從外部檔案取得變數 - 執行結果](/images/a/272.png)

本篇將介紹 Jenkins 的 Pipeline Job 透過 Groovy 讀取外部檔案，取得客製化的變數。  

<!-- more -->

## 1. 建立變數檔案

在 Jenkins 的目錄下建立一個存放變數的檔案。如下：  
C:\Program Files (x86)\Jenkins\properties\sample.properties
```
HW=Hello World!
P1=This is P1 value
Custom=Whatever you want
```

## 2. Groovy Script

```groovy
def propsPath = env.JENKINS_HOME+"\\properties\\sample.properties"
def props = new Properties()
def propsFile = new File(propsPath)
// 在 new File() 中，也可使用 ${環境變數} 。如下：
// def propsFile = new File("${JENKINS_HOME}\\properties\\sample.properties")

props.load(propsFile.newDataInputStream())

echo "Get properties from file " + propsPath
echo props.getProperty("HW")
echo props.getProperty("P1")
echo props.getProperty("Custom")

// 可以用 each 取得全部的 key, value
//props.each { key, value ->
//   echo "key: "+key +", value: "+value
//}
```

## 授權執行

執行 Pipeline Job 後，若顯示失敗訊息：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: *****
```
可以參考解法 [Jenkins - Groovy RejectedAccessException](/article/jenkins-groovy-rejected-access-exception.html)

## 執行結果

![Jenkins - Groovy 從外部檔案取得變數 - 執行結果](/images/a/272.png)