title: Jenkins - Groovy 搜尋檔案
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-05 13:50:00
---

![Jenkins - Groovy 搜尋檔案 - 執行結果](/images/pasted-277.png)

本篇將介紹 Jenkins 的 Pipeline Job 透過 Groovy 讀取搜尋檔案。  

<!-- more -->

## 1. FileNameFinder

### 資料夾內容

此範例我要搜尋 `JENKINS_HOME` 資料夾底下的檔案，內容如下：

![Jenkins - Groovy 搜尋檔案 - JENKINS_HOME](/images/pasted-276.png)

### Groovy Script

```groovy
new FileNameFinder().getFileNames(env.JENKINS_HOME, "*.xml", "jenkins*")
    .each({file ->
        echo file
    })
```
* getFileNames  
 * 參數 1: 要搜尋的資料夾  
 * 參數 2: 符合的 Pattern(可省略)  
 * 參數 3: 排除的 Pattern(可省略)  

### 執行結果

![Jenkins - Groovy 搜尋檔案 - 執行結果](/images/pasted-277.png)

## 2. eachFile*

除了 `FileNameFinder` 以外，還有其他的搜尋方式，但我用 `Jenkins 2.60.2` 版本及 `Pipeline: Groovy 2.38` 版本，`eachFile*` 有 Bug 尚未修復，找到第一筆資料後就終止了。  
用較早之前的版本，可以參考以下方法：

### 2.1. eachFile

```groovy
new File(env.JENKINS_HOME).eachFile() { file->
    echo file
}
```

### 2.2. eachFileRecurse

```groovy
import groovy.io.FileType

new File(env.JENKINS_HOME).eachFileRecurse(FileType.FILES) { file ->
    echo file.getName()
}
```

### 2.3. eachFileMatch

```groovy
new File(env.JENKINS_HOME).eachFileMatch (~/.*.xml/) { file ->
    echo file.getName()
}
```

### 2.4. traverse

```groovy
import groovy.io.FileType

new File(env.JENKINS_HOME).traverse(type : FileType.FILES, nameFilter: ~/.*.xml/) { file ->
    echo file.getName()
}
```

## 授權執行

執行 Pipeline Job 後，若顯示失敗訊息：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: *****
```
可以參考解法 [Jenkins - Groovy RejectedAccessException](/article/jenkins-groovy-rejected-access-exception.html)