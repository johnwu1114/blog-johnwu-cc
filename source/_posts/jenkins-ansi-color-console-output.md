---
title: Jenkins - AnsiColor 輸出不同顏色的文字訊息
author: John Wu
tags:
  - Jenkins
categories:
  - Jenkins
date: 2017-10-24 22:58:00
featured_image: /images/a/372.png
---

![Jenkins - AnsiColor 輸出不同顏色的文字訊息 - Output](/images/a/372.png)

寫 Jenkins Job 的時候，經常需要輸出一些文字訊息方便除錯，預設單一顏色有點難以看出重點。  
本篇將介紹如何在 Jenkins 的 Console Output 透過 `AnsiColor` 套件輸出不同顏色的文字訊息。

<!-- more -->

## 1. 安裝套件

在 Jenkins 的套件管理，找到 `AnsiColor` 並安裝：  

![Jenkins - AnsiColor 輸出不同顏色的文字訊息 - 套件管理](/images/a/371.png)

## 2. 啟用 AnsiColor

### Free-Style

Free-Style 的建置專案(Build Environment)，可以在建置環境找到 `Color ANSI Console Output`，把它打勾即可：  

![Jenkins - AnsiColor 輸出不同顏色的文字訊息 - 建置專案](/images/a/373.png)

```sh
echo "\033[31m Red \033[0m"
echo "\033[32m Green \033[0m"
echo "\033[33m Yellow \033[0m"
echo "\033[34m Blue \033[0m"

echo "\033[41m Red \033[0m"
echo "\033[42m Green \033[0m"
echo "\033[43m Yellow \033[0m"
echo "\033[44m Blue \033[0m"
```

### Pipeline

Pipeline 要啟用 `AnsiColor` 的話，只要把 echo 包在 `ansiColor("xterm") { }` 區塊內即可，如下：

```groovy
ansiColor("xterm") {
    echo "\033[31m Red \033[0m"
    echo "\033[32m Green \033[0m"
    echo "\033[33m Yellow \033[0m"
    echo "\033[34m Blue \033[0m"
    
    echo "\033[41m Red \033[0m"
    echo "\033[42m Green \033[0m"
    echo "\033[43m Yellow \033[0m"
    echo "\033[44m Blue \033[0m"
}
```

## 執行結果

![Jenkins - AnsiColor 輸出不同顏色的文字訊息 - Output](/images/a/372.png)

> 顏色樣式可以參考這邊：https://misc.flogisoft.com/bash/tip_colors_and_formatting

## 參考

https://github.com/jenkinsci/ansicolor-plugin  
https://misc.flogisoft.com/bash/tip_colors_and_formatting  