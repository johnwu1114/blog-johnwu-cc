---
title: Jenkins - Groovy 執行系統指令
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-04 03:19:00
featured_image: /images/a/275.png
---

![Jenkins - Groovy 執行系統指令 - 執行結果](/images/a/275.png)

本篇將介紹如何在 Jenkins 的 Pipeline Job 透過 Groovy 執行系統指令 (Windows 的 Batch 或 Linux 的Shell)。  

<!-- more -->

## 1. 執行指令

Groovy 可以透過字串後面加上 `.execute()` 執行 Batch/Shell 的指令。

範例 1：  
```groovy
"ping 8.8.8.8".execute()
```
以上語法如同 Windows 的 Batch。如下：
```batch
C:\Program Files (x86)\Jenkins>ping 8.8.8.8
```
> 不指定路徑，預設在 JENKINS_HOME 目錄執行。  
> 我的 JENKINS_HOME=`C:\Program Files (x86)\Jenkins`。

範例 2：  
```groovy
def args = null // Environment 參數
def execPath = "C:\\Users\\john.wu"
"cmd /c dir".execute(null, new File(execPath))
```
以上語法如同 Windows 的 Batch。如下：
```batch
C:\Users\john.wu>dir
```

## 2. 顯示指令結果

直接在字串接著 `.execute()` 執行，會沒辦法在 Jenkins 的 Output 看到指令的執行結果。為了方便除錯，建議還是將指令的執行過程及結果輸出到 Jenkins 比較好。  
可以透過 `consumeProcessOutput` 方法，把指令的執行指令的結果接回 Groovy。如下：

```groovy
def sout = new StringBuffer()
def serr = new StringBuffer()
def proc = "ping 8.8.8.8".execute()
proc.consumeProcessOutput(sout, serr)
proc.waitFor();
if(sout) echo sout.toString().trim()
if(serr) echo sout.toString().trim()
```
> 如此一來就可以將指令的執行結果輸出到 Jenkins 上了。

上面做法有個缺點，就是不管執行結果是成功或失敗，對 Pipeline Job 的 stage 來說都是成功，修正一下寫法，順便寫成通用方法：

```groovy
def execCmd(cmd, execPath=null) {
    echo "[Command]: "+cmd
    def sout = new StringBuffer()
    def serr = new StringBuffer()
    def proc = cmd.execute(null, execPath)
    proc.consumeProcessOutput(sout, serr)
    proc.waitFor();
    if(sout) echo "[Output]: "+sout.toString().trim()

    // 若 serr 有值，則不要用 echo，改用 error 輸出訊息
    if(serr) error "[Error]: "+serr.toString().trim()
}

node {
  stage("First Stage") {
    execCmd("cmd /c dir /D", new File("C:\\Users\\john.wu"))
  }

  stage("Second Stage") {
    execCmd("ping 8.8.8.8 -n 2")
  }
  
  stage("Third Stage") {
    execCmd("xcopy")
  }
}
```
> 當使用 `error` 輸出訊息 `Third Stage` 就會顯示失敗狀態。


## 授權執行

執行 Pipeline Job 後，若顯示失敗訊息：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: *****
```
可以參考解法 [Jenkins - Groovy RejectedAccessException](/article/jenkins-groovy-rejected-access-exception.html)

## 執行結果

![Jenkins - Groovy 執行系統指令 - 執行結果 stage](/images/a/273.png)
![Jenkins - Groovy 執行系統指令 - 執行結果](/images/a/274.png)