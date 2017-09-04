---
title: Jenkins - Pipeline Job 平行處理發生 JSON 例外
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
  - Parallel
  - JSON
categories:
  - Jenkins
date: 2017-09-04 09:32:00
---

先前有介紹過 [Jenkins - Groovy 從 JSON 檔案讀取變數](/article/jenkins-groovy-read-json-from-file.html)，但使用 Pipeline Job 平行處理時，會拋出 `NotSerializableException`。  
本篇將介紹如何在 Pipeline Job 平行處理，正常的取用 JSON 內容。  

<!-- more -->

## NotSerializableException

建一個簡單的範例，透過 JsonSlurper 轉換 JSON 字串後，隨後使用 parallel。如下：

```groovy
import groovy.json.*

def getJsonObject() {
	def jsonPath = "${env.JENKINS_HOME}\\properties\\test.json"
	def jsonSlurper = new JsonSlurper()
	def jsonObject = jsonSlurper.parseText(new File(jsonPath).getText("UTF-8"))
	return jsonObject
}

jsonObject = getJsonObject()

parallel (
	"Task 1": { stage("Task 1") { } },
	"Task 2": { stage("Task 2") { } },
	"Task 3": { stage("Task 3") { } }
)
```

錯誤訊息：
```
an exception which occurred:
	in field locals
	in field capture
	in field def
	in field closures
	in object org.jenkinsci.plugins.workflow.cps.CpsThreadGroup@1739131
Caused: java.io.NotSerializableException: groovy.json.internal.LazyMap
	at org.jboss.marshalling.river.RiverMarshaller.doWriteObject(RiverMarshaller.java:860)
	at org.jboss.marshalling.river.BlockMarshaller.doWriteObject(BlockMarshaller.java:65)
	at org.jboss.marshalling.river.BlockMarshaller.writeObject(BlockMarshaller.java:56)
	at org.jboss.marshalling.MarshallerObjectOutputStream.writeObjectOverride(MarshallerObjectOutputStream.java:50)
	at org.jboss.marshalling.river.RiverObjectOutputStream.writeObjectOverride(RiverObjectOutputStream.java:179)
	at java.io.ObjectOutputStream.writeObject(Unknown Source)
	at java.util.HashMap.internalWriteEntries(Unknown Source)
	at java.util.HashMap.writeObject(Unknown Source)
	at sun.reflect.GeneratedMethodAccessor306.invoke(Unknown Source)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(Unknown Source)
	at java.lang.reflect.Method.invoke(Unknown Source)
	...
```

parallel 完全沒有使用到 JSON Object，但依然發生錯誤。  
主要原因是 JsonSlurper 轉換 JSON 字串後的 JSON Object 無法被序列化，當遇到跨執行緒平行處理時，就會拋出 `NotSerializableException`。  

## JsonSlurperClassic

稍微小改一下轉換 JSON 字串的物件，把 JsonSlurper 換成 JsonSlurperClassic，如下：

```groovy
import groovy.json.JsonSlurperClassic

def getJsonObject() {
	def jsonPath = "${env.JENKINS_HOME}\\properties\\test.json"
	def jsonSlurper = new JsonSlurperClassic()
	def jsonObject = jsonSlurper.parseText(new File(jsonPath).getText("UTF-8"))
	return jsonObject
}

jsonObject = getJsonObject()

parallel (
	"Task 1": { stage("Task 1") { } },
	"Task 2": { stage("Task 2") { } },
	"Task 3": { stage("Task 3") { } }
)
```

> 由於 JsonSlurper 轉換 JSON 字串，使用的是 `LazyMap`，動態讀取 JSON 字串，所以無法被序列化。  
> 而 JsonSlurperClassic，使用的是 `HashMap`，把 JSON 內容全部轉至記憶體中，所以可以被序列化。  

## 結論

基本上 JsonSlurper 及 JsonSlurperClassic 使用上沒什麼太大的差異，差別在於使用效率及記憶體佔用空間。  
如果沒有要用平行處理的話，用 JsonSlurper 會比較節省資源。  