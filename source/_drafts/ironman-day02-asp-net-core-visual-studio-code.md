---
title: '[鐵人賽 Day02] ASP.NET Core 系列 - 開發工具 Visual Studio Code'
author: John Wu
tags:
  - ASP.NET Core
  - VS Code
  - 2018 iT 邦幫忙鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-21 23:17
featured_image: /images/i4.png
---

.NET Core 都已經跨作業系統了，開發工具當然也就不再限制於 Visual Studio IDE (Visual Studio 20xx)。  
基本上純文字編輯器就搭配 dotnet cli 就可以開發 ASP.NET Core 了，但沒有中斷點除錯或 Autocomplete 似乎會開發的有些辛苦。  
如果是 Windows 作業系統，最推薦的當然還是 Visual Studio IDE，再來就是 Visual Studio Code。  

<!-- more -->

Visual Studio Code(VS Code) 是一套可安裝擴充套件的文字編輯器，有支援 Windows、Mac 及 Linux 版本，極輕量又免費。  
安裝擴充套件就變成了 IDE，並且支援多種不同的程式語言，本篇將介紹如何用 VS Code 開發 ASP.NET Core。

下載位置[點我](https://code.visualstudio.com/Download)。

## 安裝擴充套件

打開 VS Code 可以在左邊看到五個 Icon，點選最下面的那個 Extensions 圖示，並在 Extensions 搜尋列輸入 **C#**，便可以找到 `C#` 的擴充套件安裝。如下圖：

![[鐵人賽 Day02] ASP.NET Core 系列 - 開發工具 Visual Studio Code - C# 擴充套件](/images/i4.png)

## 開啟專案

VS Code 跟一般文字編輯器有些不同，它是以資料夾為工作區域，開啟一個目錄，就等通於是開啟一個專案。  
從上方工具列 **File** -> **Open Folder** 選擇 ASP.NET Core 專案目錄，大概隔幾秒後，VS Code 會提示是否要幫此專案加入 Build/Debug 的設定。如下圖：  

![[鐵人賽 Day02] ASP.NET Core 系列 - 開發工具 Visual Studio Code - 開啟專案](/images/i5.png)

### Build/Debug 設定

如果沒有自動提示加入 Build/Debug 設定，可以在左邊 Icon，點選倒數第二個 Debug 圖示，手動加入 Build/Debug 設定。如下步驟：  

![[鐵人賽 Day02] ASP.NET Core 系列 - 開發工具 Visual Studio Code - Build/Debug 設定](/images/i6.png)
![[鐵人賽 Day02] ASP.NET Core 系列 - 開發工具 Visual Studio Code - Build/Debug 設定](/images/i7.png)

## 中斷點除錯

在程式碼行號左邊點擊滑鼠就可以下中斷點了，跟一般 IDE 差不多。然後在 Debug 側欄啟動偵錯：  

![[鐵人賽 Day02] ASP.NET Core 系列 - 開發工具 Visual Studio Code - 中斷點除錯](/images/i8.png)

當執行到該中斷點後，就會停下來，並在 Debug 側欄顯示當前變數狀態等，也可以用滑鼠移到變數上面檢視該變數的內容。如下：

![[鐵人賽 Day02] ASP.NET Core 系列 - 開發工具 Visual Studio Code - 中斷點除錯](/images/i9.png)

> 偵錯方式跟大部分的 IDE 都差不多，可以 Step over、Step in/out 等。  
> 如此一來就可以用 VS Code 輕鬆開發 ASP.NET Core。