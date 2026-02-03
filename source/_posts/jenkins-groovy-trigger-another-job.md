---
title: Jenkins - Groovy 調用其它工作
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-22 21:28:00
featured_image: /images/a/303.png
---

![Jenkins - Groovy 調用其它工作 - 執行結果](/images/a/303.png)

當多個 Jenkins 工作有聯貫性時，可以透過一個 Pipeline Job 包裝，由 Pipeline Job 依序自動執行。  
本篇將介紹如何在 Pipeline Job 用 Groovy Script 調用其它 Jenkins 的工作。  

<!-- more -->

## 範例

建立兩個 Pipeline Job：  
1. MainlyPipelineJob  
2. SubPipelineJob  

## Groovy

先前有介紹過如何建立 Pipeline Job，可以參考 [Jenkins - Pipeline Job using Groovy](/article/jenkins-pipeline-job-using-groovy.html)。  
在 Groovy 中調用其它 Jenkins 工作可以使用 `build` 方法，如下：

```groovy
// MainlyPipelineJob 
echo "This is ${env.JOB_NAME}"
build("SubPipelineJob")
```

```groovy
// SubPipelineJob 
echo "This is ${env.JOB_NAME}"
```

## 傳遞變數

### 1. MainlyPipelineJob

如果要把 MainlyPipelineJob 的變數傳遞到 SubPipelineJob，就要在 `build` 方法帶入 `parameters`。  
同時要定義參數`型態`、`名稱`及`內容`。如下：

```groovy
// MainlyPipelineJob 
def custom = "This is from ${env.JOB_NAME}"

build
  job: "SubPipelineJob",
  parameters: [
    // 如果有多個參數，可以使用 , 隔開。
    // e.g.: 
    // string(name: "name", value: "John Wu"),
    // booleanParam(name: "isTest", value: true),
    string(name: "CustomParam", value: custom)
  ]
```
* Groovy 語法再調用方法時，`( )` 是可以被省略的。  
* parameters 還有另一種參數用法：
 * [ $class: "StringParameterValue", name: "name", value: "John Wu" ]  
   同 string(name: "name", value: "John Wu")  
 * [ $class: "BooleanParameterValue", name: "isTest", value: true ]  
   同 booleanParam(name: "isTest", value: true)

### 2. SubPipelineJob

在 SubPipelineJob 配置中，新增 String 參數，如圖：

![Jenkins - Groovy 調用其它工作 - SubPipelineJob - 新增參數 - 1](/images/a/301.png)
![Jenkins - Groovy 調用其它工作 - SubPipelineJob - 新增參數 - 2](/images/a/302.png)

在 Groovy 中可直接取用上層傳來的變處名稱使用。如下：
```groovy
// SubPipelineJob 
echo "This is ${env.JOB_NAME}"
echo "CustomParam=${CustomParam}"
```

### 執行結果

![Jenkins - Groovy 調用其它工作 - 執行結果](/images/a/303.png)

## 相關文章

[Jenkins - Pipeline Job using Groovy](/article/jenkins-pipeline-job-using-groovy.html)  