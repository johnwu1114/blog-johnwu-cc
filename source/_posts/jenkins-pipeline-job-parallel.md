---
title: Jenkins - Pipeline Job 平行處理
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
  - Parallel
categories:
  - Jenkins
date: 2017-08-17 00:04:00
---

![Jenkins - Pipeline Job 平行處理 - 執行結果](/images/x300.png)

在撰寫 Pipeline Job 時，很多時候工作是沒有順序相依關係，如果純用 `stage` 逐一處理，略顯效率不彰。  
本篇將介紹 Jenkins 使用 Groovy 撰寫 Pipeline Job 的平行處理。  

<!-- more -->

## Groovy Script

假設以下範例，三個 `stage` 沒有相依關係：
```groovy
stage("Task 1") {
  // ...
}
stage("Task 2") { 
  // ...
}
stage("Task 3") { 
  // ...
} 
```

若沒有相依關係就可以改成平行處理，平行處理透過調用 `parallel` 方法實現。  
`parallel` 調用是以 `String` 為 key， `Delegate Method` 為 Value。  
範例如下：
```groovy
parallel (
  "Task 1": {
    stage("Task 1") {
      // ...
    }
  },
  "Task 2": {
    stage("Task 2") {
      // ...
    }
  },
  "Task 3": {
    stage("Task 3") {
      // ...
    }
  }
)
```

## 動態增加工作

可以自行建立 `HashMap`，再把 `HashMap` 傳入 `parallel` 方法。範例如下：
```groovy
def tasks = [:]

for (int i = 0; i < 5; i++) {
  tasks["Task ${i+1}"] = {
    stage("Task ${i+1}") { 
      echo "Task ${i+1}"
    }
  }
}

parallel(tasks)
```

實際執行上面範例，會發現不如預期所想，`echo` 內容預期應該要是：
```
Task 1
Task 2
Task 3
Task 4
Task 5
```

實際上 `echo` 內容卻是：
```
Task 6
Task 6
Task 6
Task 6
Task 6
```

主要是因為 `Delegate Method` 使用的外部變數，在執行 `parallel` 時，早就跑完迴圈被改成 6 了。  
如果真的想要在 `Delegate Method` 取得外部變數，建議另外用區域變數儲存，避免外部變數在執行前被改變。如下：
```groovy
def tasks = [:]

for (int i = 0; i < 5; i++) {
  def index = i+1
  tasks["Task ${index}"] = {
    stage("Task ${index}") { 
      echo "Task ${index}"
    }
  }
}

parallel(tasks)
```

## 部分平行處理

較複雜的流程可能會有部分的工作能平行處理，但之後的工作又有相依關係。  
在 `parallel` 平行處理後，可以透過 `stage` 等待平行處理工作全部完成，再繼續往下動作。  
如下範例，有兩段工作群可以平行處理：
```groovy
stage ("Checkout Source Code") { }

parallel(
  "Build First Module" : { stage("Build") { } }, 
  "Build Second Module" : { stage("Build") { } }, 
  "Build Third Module" : { stage("Build") { } }, 
)

stage ("Integration Test") { }

parallel(
  "Deploy First Module" : { stage("Deploy") { } }, 
  "Deploy Second Module" : { stage("Deploy") { } }, 
  "Deploy Third Module" : { stage("Deploy") { } }, 
)

stage ("Commit Artifacts") { }
```

## 執行結果

如果有安裝 `Blue Ocean` 的話，就可以看到漂亮的圖形化平行處理執行結果：
![Jenkins - Pipeline Job 平行處理 - 執行結果](/images/x300.png)