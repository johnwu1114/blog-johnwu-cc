---
title: Jenkins - 製作 Pipeline Job 的 Groovy 共用函數庫
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-16 09:36:00
---

![Jenkins - Pipeline Job 共用函數庫](/images/x299.png)

在 Pipeline Job 中撰寫的 Groovy 方法，沒有辦法互相共用，只能透過調用 Jenkins 的 Job 使用。  
但共用方法拆成太多的 Jenkins Job，在維護上也不是很方便。  
本篇將介紹如何製作 Pipeline Job 的 Groovy 共用函數庫，讓不同 Pipeline Job 都可以共同調用。  

<!-- more -->

## 1. 設定共用函數庫

Pipeline Job 的共用函數庫需要有版本控制系統支援（如 SVN、Git），本篇範例是用 GitHub 作為範例。  

到 `Manage Jenkins` 找到 `Global Pipeline Libraries`，設定如下：  
![Jenkins - Pipeline Job 設定共用函數庫 - 1](/images/x295.png)
![Jenkins - Pipeline Job 設定共用函數庫 - 2](/images/x296.png)
* Library Name：自訂的名稱，在 Groovy Script 中會用到這個名稱。  
* Default version：可以指定 branch 名稱，或者是 Commit 的 SHA1。  
* Retrieval method & Source Code Management：選擇你要用的版控來源。  
 * GitHub：若使用 GitHub 輸入 Owner 帳號後，Repository 就會自動讀取到該帳號所有的 Repository。  
 (如果你要測試也可以直接使用我的 Repository)  

> 不管你用哪套 SCM，請記得在 Jenkins 上面安裝 CLI 不然會找不到指令。

## 2. 共用函數庫

共用函數庫的定義方式結構如下：
```yml
src/                           # 存放自訂類別，可以在 src 定義類別，以物件導向方式撰寫 Groovy
  {Package Name}/              
    *.groovy                   # 自訂類別
vars/                          # 存放可直接被呼叫的共用函數庫
  *.groovy                     # 共用函數
```
> 本篇不會介紹物件導向方式撰寫  

在 GitHub 的 Repository 新增資料夾 `vars`，並新增檔案 `execCmd.groovy`，內容如下：
```groovy
// vars/execCmd.groovy
def call(cmd, execPath=null) {
    echo "[Command]: "+cmd
    def sout = new StringBuffer()
    def serr = new StringBuffer()
    def proc = cmd.execute(null, execPath)
    proc.consumeProcessOutput(sout, serr)
    proc.waitFor();
    if(sout) echo "[Output]: "+sout.toString().trim()
    if(serr) error serr.toString().trim()
}
```
> 共用函數**檔案名稱**，就是在 Pipeline Job 中被調用的方法名稱

### Groovy Script

Commit & Push 到 GitHub 之後，在 Pipeline Job 中的 Groovy Script 上方加入 `@Library("{Library Name}") _`，就可以在該 Pipeline Job 呼叫共用的函數了。範例如下：

```groovy
@Library("shared-library") _

execCmd("ping 8.8.8.8 -n 2")
```

### 執行結果

在執行 Pipeline Job 時，會先到 SCM 更新共用函數庫(如紅框)，完成後才會接續執行 Groovy Script 內容。
![Jenkins - Pipeline Job 共用函數庫 - 執行結果](/images/x297.png)

## 3. Domain Specific Language (DSL)  

如果參數比較多的時候，用上述方式時，調用上參數會顯得比較雜亂無章，所以可以用 DSL 的方式定義共用函數。  
在 GitHub 的 Repository 新增檔案 `vars/sampleDSL.groovy`，內容如下：
```groovy
// vars/sampleDSL.groovy
def call(body) {
    def config = [:]
    body.resolveStrategy = Closure.DELEGATE_FIRST
    body.delegate = config
    body()

    node {
        echo config.HW
        echo config.P1
        echo config.Custom
    }
}
```

### Groovy Script

在 Pipeline Job 調用方式如下：
```groovy
@Library("shared-library") _

sampleDSL {
  [
    HW = "Hello World!",
    P1 = "This is P1 value",
    Custom = "Whatever you want"
  ]
}
```

### 執行結果

![Jenkins - Pipeline Job 共用函數庫 - DSL 執行結果](/images/x298.png)

## 範例程式碼

[jenkins-shared-library](https://github.com/johnwu1114/jenkins-shared-library)

## 參考

[Extending with Shared Libraries](https://jenkins.io/doc/book/pipeline/shared-libraries/)