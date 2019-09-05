---
title: Jenkins - Pipeline Job using Groovy
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-03 20:19:00
featured_image: /images/a/266.png
---
![Jenkins 教學 - Pipeline Job using Groovy - 執行結果](/images/a/266.png)

Jenkins 的 Pipeline Job 彈性幾乎跟 Batch/Shell 一樣，但比起前兩者我個人認為 Pipeline Job 用的 Groovy 語法比較簡潔。  
除了彈性優勢之外 stage 也是非常好用的方法。  
本篇將簡略介紹 Jenkins 的 Pipeline Job 及 stage 的使用方法。  

<!-- more -->

## 前言

要使用 Pipeline Job 必需要安裝 [Pipeline Plugin](https://wiki.jenkins.io/display/JENKINS/Pipeline+Plugin)，如果你安裝 Jenkins 時是預設值，應該就會自動安裝 Pipeline Plugin。

## 1. 新增 Pipeline Job

![Jenkins 教學 - 新增 Pipeline Job - 1](/images/a/263.png)
![Jenkins 教學 - 新增 Pipeline Job - 2](/images/a/264.png)

## 2. Groovy Script

![Jenkins 教學 - 新增 Pipeline Job - 撰寫 Groovy](/images/a/265.png)

Groovy Script 的起手式是用 `node` 包裝 `stage`，`stage` 裡面下指令。如下：
```groovy
node {
  stage("First Task") {
    echo "First Task"
  }
}
node {
  stage("Second Task") {
    echo "Second Task"
  }
}
```
* `node` 是執行的實體，可以有多個 `node`。  
 多個 `node` 的概念把它想成你打開 Terminal 執行完指令後，把 Terminal 關掉，再重開一個 Terminal。
* `stage` 是執行的區段  
 每個 `stage` 裡面都可以包含很多指令，通常用於階段性任務定義。定義的 `stage` 會在 Jenkins 產生漂亮的圖形化結果。這是 Pipeline Job 的優點之一。

我寫個簡單的範例如下：
```groovy
node {
  def throwError = (env.Build_Id as Integer) % 2 == 0

  stage("First Task") {
    echo "First Task"
    // Do something...
  }

  stage("Second Task") {
    if(throwError) {
      error "Second Task"
    } else {
      echo "Second Task"
    }
    // Do something...
  }

  stage("Third Task") {
    for (i = 0; i <3; i++) {
      echo "Third Task"
    }
    // Do something...
  }
}
```
> Groovy 骨子裡是呼叫 Java，所以它的語法特性會跟 Java，只是比較不嚴謹。  

## 執行結果

如果其中一個 stage 失敗的話，後面的工作就會被終止。如下：
![Jenkins 教學 - Pipeline Job using Groovy - 執行結果](/images/a/266.png)