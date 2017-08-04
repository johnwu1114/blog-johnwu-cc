title: Jenkins 教學 - Groovy 從外部檔案取得變數
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

## 3. 授權執行

執行 Pipeline Job 後失敗，訊息顯示：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use new java.util.Properties
```
![Jenkins - Groovy 從外部檔案取得變數 - RejectedAccessException](/images/pasted-271.png)

可以到 `Manage Jenkins` 找到 `In-process Script Approval`，授權 Groovy 的使用權限。如下：
![Jenkins - Groovy 從外部檔案取得變數 - Manage Jenkins](/images/pasted-267.png)
![Jenkins - Groovy 從外部檔案取得變數 - In-process Script Approval](/images/pasted-268.png)
![Jenkins - Groovy 從外部檔案取得變數 - Approve](/images/pasted-269.png)

> 授權完之後再執行，又會遇到其他的權限不足，重複以上步驟直到沒有再提示 `RejectedAccessException`。  
> 此範例會有以下 5 個權限需要被授權：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use new java.util.Properties
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use new java.io.File java.lang.String
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use staticMethod org.codehaus.groovy.runtime.DefaultGroovyMethods newDataInputStream java.io.File
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use method java.util.Properties load java.io.InputStream
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use method java.util.Properties getProperty java.lang.String
```

授權完成後的結果如下：
![Jenkins - Groovy 從外部檔案取得變數 - Approved](/images/pasted-270.png)

## 執行結果

![Jenkins - Groovy 從外部檔案取得變數 - 執行結果](/images/pasted-272.png)