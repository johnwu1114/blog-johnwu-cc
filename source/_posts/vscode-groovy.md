---
title: VS Code - 撰寫及執行 Groovy 
author: John Wu
tags:
  - Groovy
  - VS Code
categories:
  - VS Code
date: 2017-09-08 10:25:00
featured_image: /images/x335.png
---
![VS Code - 撰寫及執行 Groovy - 安裝 Code Runner](/images/x335.png)

最近在改寫 Jenkins 的 Pipeline Job，要寫一些 Groovy 的擴充方法讓 Pipeline Job 呼叫，但在 Jenkins 上面寫 Groovy 不是很方便。  
本篇介紹如何在 Visual Studio Code 安裝 VS Code Extensions，方便撰寫及執行 Groovy。

<!-- more -->

## 前言

安裝軟體的部分我就沒有詳細介紹。

1. Visual Studio Code [官網下載頁面](https://code.visualstudio.com/Download)  
基本上 VS Code 就是純文字編輯工具，你要用 Sublime、Notepade++、Atom、TextEdit都可以。  
2. Java JDK [官網下載頁面](https://www.oracle.com/technetwork/java/javase/downloads/index.html)  
Groovy 要透過 Java 運行，所以要裝一下 Java JDK，Groovy 2.x 以上版本，要用 JDK 7 以上版本。  
3. Groovy CLI [官網下載頁面](https://goo.gl/skn5sD)  

## Groovy CLI

我是用 Groovy 2.5.0-beta-1 版，要用哪一版隨喜囉。  
下載 **binary** 後解壓縮，在環境變數新增解壓縮的路徑。  
例如我把 Groovy 目錄放在 `C:\Program Files (x86)\Groovy\Groovy-2.5.0`，環境變數加入：
```batch
C:\Program Files (x86)\Groovy\Groovy-2.5.0\bin
```
> 如果是用 Windows 版本，可以直接用 **Windows Installer** 安裝。  

設定完之後，可以在 Terminal 輸入 `groovy -v`，可以看到 Groovy 跟 Java JDK 版本。  
那就表示設定完成囉～

## Groovy Script

打開 VS Code 建立一個 `*.groovy` 的文字檔，就可以開始撰寫 Groovy 了。  
> 附檔是 `*.groovy` 就會支援 Groovy 語法的 Syntax Highlighting。  
> 也可以在 VS Code 按 `F1` 輸入 `>change language mode`，選擇 `groovy`。  

一段簡單的 Groovy Script：
```groovy
def url = "blog.johnwu.cc"
println "url = ${url}"

for (def i=0; i<url.length(); i++) {
    print url.getAt(i)
}
```

Groovy Script 存檔後，VS Code 中按 `ctrl` + `~` 在 Terminal 輸入 `groovy {檔名}.groovy`，就可以看到執行結果囉~

![VS Code - Terminal 執行 Groovy](/images/x336.png)

## VS Code Extensions

每次都要執行 Groovy Script 都要下指令有點麻煩，所以要推薦好用的 VS Code Extensions `Code Runner`。  
Code Runner 支援很多種不同的程式語言，基本上它是幫你呼叫 CLI，如果沒有安裝該語言的 CLI 它就沒辦法幫你執行了。

安裝好 VS Code 後，可以在擴充工具搜尋 `Code Runner`，然後點擊 *Install*。如下圖：
![VS Code - 撰寫及執行 Groovy - 安裝 Code Runner](/images/x335.png)
> 由於我已經安裝過了，所以顯示的是 *Disable* 及 *Uninstall*。  
> 安裝完 `Code Runner` 需要重啟 VS Code。

完成上述步驟後，就可以針對開啟的檔案，利用快速鍵 `Ctrl` + `Alt` + `N` 或者是右上角的執行按鈕執行：
![VS Code - 撰寫及執行 Groovy - Code Runner 執行](/images/x337.png)

