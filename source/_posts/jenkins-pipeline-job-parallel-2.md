---
title: Jenkins - Pipeline Job 平行處理 (二)
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
  - Parallel
  - JSON
categories:
  - Jenkins
date: 2017-09-04 12:11:00
featured_image: /images/a/324.png
---

![Jenkins - Pipeline Job 平行處理 - 執行結果 - 2](/images/a/324.png)

先前有介紹過 [Jenkins - Pipeline Job 平行處理](/article/jenkins-pipeline-job-parallel.html)，大致說明了基本用法。  
本篇稍為進階一點，透過 JSON 檔案控製 Pipeline Job 平行處理的執行順序。

<!-- more -->

## 情境

隨著系統規模越大，模組也會隨之增長，模組之間的相依關係必然會影響建置順序。  
範例假設有 8 個模組，相依關係如下：
![Jenkins - Pipeline Job 平行處理 - 模組相依關係](/images/a/321.png)

## JSON

自製一個 JSON 檔案，把建置需要的參數及相依順序都定義在裡面，範例如下：

BuildDependency.json
```json
[
  {
    "group": 1,
    "name": "Module A",
    "repository": "https://*******/module-a.git",
    "customParameters": "...",
    "...": "..."
  },
  {
    "group": 2,
    "name": "Module B",
    "repository": "https://*******/module-b.git",
    "customParameters": "...",
    "...": "..."
  },
  {
    "group": 2,
    "name": "Module C"
  },
  {
    "group": 3,
    "name": "Module D"
  },
  {
    "group": 3,
    "name": "Module E"
  },
  {
    "group": 3,
    "name": "Module F"
  },
  {
    "group": 4,
    "name": "Application"
  },
  {
    "group": 4,
    "name": "Website"
  }
]
```
透過 `group` 表示建置的相依順序，同一個 `group` 可以平行處理，當該 `group` 的模組全部建置完成後，才能往下建置下一個 `group`。  

> 名稱跟需要的參數都可依需求自行定義。  


## Groovy Script

### 排序

透過 `JsonSlurperClassic` 讀取 JSON 內容，然後放到另一個以 `group` 為 key 的 HashMap，再以 `sort()` 排序 key 值。如下：
```groovy
import groovy.json.JsonSlurperClassic

def getJsonObject() {
  def jsonPath = "${env.JENKINS_HOME}\\properties\\BuildDependency.json"
  def jsonSlurper = new JsonSlurperClassic()
  def jsonObject = jsonSlurper.parseText(new File(jsonPath).getText("UTF-8"))
  return jsonObject
}

def jsonObject = getJsonObject()
def buildDependency = [:]

jsonObject.each({
  def group = it.group
  if(!buildDependency[group]){
    buildDependency[group] = []
  }
  buildDependency[group].push(it)
})

buildDependency = buildDependency.sort()

buildDependency.each({ group, val ->
  echo "group = ${group}"
  for(module in val) {
    echo "module.name = ${module.name}"
  }
})
```

輸出結果可以看到 `group` 已確實排序，如預期：
![Jenkins - Pipeline Job 平行處理 - 模組相依關係 Output](/images/a/322.png)

### 建立平行處理工作

```groovy
import groovy.json.JsonSlurperClassic

def getJsonObject() {
  def jsonPath = "${env.JENKINS_HOME}\\properties\\BuildDependency.json"
  def jsonSlurper = new JsonSlurperClassic()
  def jsonObject = jsonSlurper.parseText(new File(jsonPath).getText("UTF-8"))
  return jsonObject
}

def jsonObject = getJsonObject()
def buildDependency = [:]

jsonObject.each({
  def group = it.group
  if(!buildDependency[group]){
    buildDependency[group] = []
  }
  buildDependency[group].push(it)
})

buildDependency = buildDependency.sort()

buildDependency.each({ group, val ->
  def jobs = [:]

  for(module in val) {
    jobs[module.name] = {
      stage(module.name) {
        // ...
      }
    }
  }

  parallel(jobs)
})
```

### NotSerializableException

上面範例執行後發生了 `NotSerializableException`，錯誤訊息如下：
```
an exception which occurred:
	in field locals
	in field parent
	in field caller
	in field parent
	in field parent
	in field caller
	in field parent
	in field parent
	in field parent
	in field parent
	in field parent
	in field capture
	in field def
	in field closures
	in object org.jenkinsci.plugins.workflow.cps.CpsThreadGroup@18f5ae0
Caused: java.io.NotSerializableException: java.util.TreeMap$Entry
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

> 因為 buildDependency 經過 `sort()` 處理後，已由原本的 `LinkedHashMap` 型態，轉變為 `TreeMap` 型態，而 `TreeMap` 無法被序列化。  
> 前篇 [Jenkins - Pipeline Job 平行處理發生 JSON 例外](/article/jenkins-pipeline-job-parallel-json-not-serializable-exception.html) 有說明，Pipeline Job 平行處理不能使用到無法被序列化的物件。

### TreeMap to ArrayList

解決方是只要把 `TreeMap` 轉換成 `ArrayList` 即可，建立一個簡短的轉換方法：
```groovy
def entrySet(m) { m.collect { k, v -> [ k, v ] } }
```

套用範例：
```groovy

import groovy.json.JsonSlurperClassic

// 插入方法
def entrySet(m) { m.collect { k, v -> [ k, v ] } }

def getJsonObject() {
  def jsonPath = "${env.JENKINS_HOME}\\properties\\BuildDependency.json"
  def jsonSlurper = new JsonSlurperClassic()
  def jsonObject = jsonSlurper.parseText(new File(jsonPath).getText("UTF-8"))
  return jsonObject
}

def jsonObject = getJsonObject()
def buildDependency = [:]

jsonObject.each({
  def group = it.group
  if(!buildDependency[group]){
    buildDependency[group] = []
  }
  buildDependency[group].push(it)
})

// 套用方法，把 TreeMap 轉換成 ArrayList 
buildDependency = entrySet(buildDependency.sort())

buildDependency.each({ item ->
  def jobs = [:]

  for(module in item[1]) {
    jobs[module.name] = {
      stage(module.name) {
        // ...
      }
    }
  }

  parallel(jobs)
})
```

用 Blue Ocean 看執行結果如下：
![Jenkins - Pipeline Job 平行處理 - 執行結果 - 1](/images/a/323.png)

> 第一個 Parallel 只有一個工作，顯示的圖形變向右延伸，看起來怪怪的。

### 判斷是否需要平行處理

透過 `size()` 取得 jobs 集合的數量，如果只有一個 Job 就使用 `node()` 執行工作，反之使用 `parallel()` 執行工作。

完整範例如下：
```groovy
import groovy.json.JsonSlurperClassic

def entrySet(m) { m.collect {k, v -> [k, v]} }

def getJsonObject() {
  def jsonPath = "${env.JENKINS_HOME}\\properties\\BuildDependency.json"
  def jsonSlurper = new JsonSlurperClassic()
  def jsonObject = jsonSlurper.parseText(new File(jsonPath).getText("UTF-8"))
  return jsonObject
}

def jsonObject = getJsonObject()
def buildDependency = [:]

jsonObject.each({
  def group = it.group
  if(!buildDependency[group]){
    buildDependency[group] = []
  }
  buildDependency[group].push(it)
})

buildDependency = entrySet(buildDependency.sort())

buildDependency.each({ item ->
  def jobs = [:]
  def moduleName = ""

  for(module in item[1]) {
    moduleName = module.name
    jobs[moduleName] = {
      stage(moduleName) {
        // ...
      }
    }
  }

  // 判斷同群組的工作數量
  if(jobs.size()==1){
    node(jobs[moduleName])
  } else {
    parallel(jobs)
  }
})
```

## 執行結果

![Jenkins - Pipeline Job 平行處理 - 執行結果 - 2](/images/a/324.png)

## 相關文章

[Jenkins - Pipeline Job 平行處理](/article/jenkins-pipeline-job-parallel.html)  
[Jenkins - Groovy 從 JSON 檔案讀取變數](/article/jenkins-groovy-read-json-from-file.html)  
[Jenkins - Pipeline Job 平行處理發生 JSON 例外](/article/jenkins-pipeline-job-parallel-json-not-serializable-exception.html)  
