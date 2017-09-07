---
title: Jenkins - Groovy 遞迴搜尋檔案
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-12 00:03:00
featured_image: /images/x293.png
---

![Jenkins - Groovy 遞迴搜尋檔案 - 執行結果](/images/x293.png)

之前有介紹過 [Jenkins - Groovy 搜尋檔案](/article/jenkins-groovy-find-file.html)，但 `FileNameFinder` 並不支援遞迴搜尋 (Recursively Search)。  
所以我就直接用系統指令搜尋檔案，再用 Groovy 包裝成 Function，讓 Groovy 也能拿到遞迴搜尋檔案的結果。  
本篇將介紹 Jenkins 的 Pipeline Job 透過 Groovy 遞迴搜尋檔案。  

<!-- more -->

> 因我用的版本 `eachFileRecurse` 有 Bug 尚未修復，所以不得已才會用系統指令包裝。  
> (我是用 `Jenkins 2.60.2` 版本及 `Pipeline: Groovy 2.38` 版本)  


## Groovy Script

Jenkins 架在不同的作業系統，要使用不一樣的指令，以下提供 Windows 版及 Linux 版：

### Windows 版本

```groovy
def recursiveSearch(path, pattern, func) {
    def sout = new StringBuffer()
    def serr = new StringBuffer()
    def proc = "cmd /c dir /b/s ${pattern}".execute(null, new File(path))
    proc.consumeProcessOutput(sout, serr)
    proc.waitFor();
    if(sout) for(def line : sout.readLines()) func(line) 
    if(serr) error "[Error]: "+serr.toString().trim()
}
```

### Linux 版本

```groovy
def recursiveSearch(path, pattern, func) {
    def sout = new StringBuffer()
    def serr = new StringBuffer()
    def proc = "find `pwd` -name \"${pattern}\"".execute(null, new File(path))
    proc.consumeProcessOutput(sout, serr)
    proc.waitFor();
    if(sout) for(def line : sout.readLines()) func(line) 
    if(serr) error "[Error]: "+serr.toString().trim()
}
```

### 呼叫方法

```groovy
recursiveSearch(env.JENKINS_HOME, "conf*.xml") { fileName ->
    echo "fileName = ${fileName}"
}
```
## 執行結果

![Jenkins - Groovy 遞迴搜尋檔案 - 執行結果](/images/x293.png)

## 授權執行

執行 Pipeline Job 後，若顯示失敗訊息：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: *****
```
可以參考解法 [Jenkins - Groovy RejectedAccessException](/article/jenkins-groovy-rejected-access-exception.html)

## 相關文章

[Jenkins - Groovy 搜尋檔案](/article/jenkins-groovy-find-file.html)  
[Jenkins - Groovy 執行系統指令](/article/jenkins-groovy-execute-command.html)  