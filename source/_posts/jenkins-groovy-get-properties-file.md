title: Jenkins - Groovy 從外部檔案取得變數
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-03 23:31:00
---

![Jenkins - Groovy 從外部檔案取得變數 - 執行結果](/images/pasted-272.png)

本篇將介紹 Jenkins 的 Pipeline Job 透過 Groovy 讀取外部檔案，取得客製化的變數。  

<!-- more -->

## 1. 建立變數檔案

在 Jenkins 的目錄下建立一個存放變數的檔案。如下：  
C:\Program Files (x86)\Jenkins\properties\sample.props
```
HW=Hello World!
P1=This is P1 value
Custom=Whatever you want
```

## 2. Groovy Script

```groovy
def propdPath = env.JENKINS_HOME+"\\properties\\sample.props"
Properties props = new Properties()
File propsFile = new File(propdPath)
props.load(propsFile.newDataInputStream())

echo "Get properties from file " + propdPath
echo props.getProperty("HW")
echo props.getProperty("P1")
echo props.getProperty("Custom")
```

## 授權執行

執行 Pipeline Job 後，若顯示失敗訊息：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: *****
```
可以參考解法 [Jenkins - Groovy RejectedAccessException](/article/jenkins-groovy-rejected-access-exception.html)

## 執行結果

![Jenkins - Groovy 從外部檔案取得變數 - 執行結果](/images/pasted-272.png)