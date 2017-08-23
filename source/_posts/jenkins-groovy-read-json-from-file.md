---
title: Jenkins - Groovy 從 JSON 檔案讀取變數
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
  - JSON
categories:
  - Jenkins
date: 2017-08-23 12:31:00
---

![Jenkins - Groovy 從 JSON 檔案讀取變數 - 執行結果](/images/x309.png)

先前有介紹過 [Jenkins - Groovy 從外部檔案取得變數](/article/jenkins-groovy-get-properties-file.html)，但較複雜的設定不太適合用 `Properties`。  
本篇將介紹 Jenkins 的 Pipeline Job 透過 Groovy 讀取 `JSON` 檔案取得變數。  

<!-- more -->

## 1. 建立 JSON 檔案

在 Jenkins 的目錄下建立一個 `JSON` 的檔案。如下：  
C:\Program Files (x86)\Jenkins\properties\test.json
```json
{
	"name": "John Wu",
	"P1": "P1 Test",
	"P2": {
		"Sub1": "P2 Sub1 Test",
		"Sub2": "P2 Sub2 Test"
	},
	"P3": [
		"Item1",
		"Item2",
		"Item3"
	]
}
```

## 2. Groovy Script

```groovy
import groovy.json.*

def jsonPath = env.JENKINS_HOME+"\\properties\\test.json"
def jsonSlurper = new JsonSlurper()
def jsonObject = jsonSlurper.parseText( new File(jsonPath).getText("UTF-8"))

echo "name=${jsonObject.name}"
echo "P1=${jsonObject.P1}"
echo "P2.Sub1=${jsonObject.P2.Sub1}"
echo "P2.Sub2=${jsonObject.P2.Sub2}"
echo "P3=${jsonObject.P3}"
jsonObject.P3.each({
    echo it
})
```

## 授權執行

執行 Pipeline Job 後，若顯示失敗訊息：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: *****
```
可以參考解法 [Jenkins - Groovy RejectedAccessException](/article/jenkins-groovy-rejected-access-exception.html)

## 執行結果

![Jenkins - Groovy 從 JSON 檔案讀取變數 - 執行結果](/images/x309.png)