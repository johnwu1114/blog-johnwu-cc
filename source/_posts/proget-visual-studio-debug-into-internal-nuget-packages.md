---
title: ProGet - Visual Studio 偵錯(Debug) NuGet 套件
author: John Wu
tags:
  - Visual Studio
  - NuGet
  - ProGet
categories:
  - ProGet
date: 2017-11-23 15:17:00
featured_image: /images/x386.png
---

架設內部用的 NuGet Server，可以解決模組相依問題，但要偵錯(Debug)就變的比較麻煩。  
如果是用專案相依參考，可以直接 Debug Source Code，但從 NuGet Server 下載的套件沒有 Source Code，Debug 就要靠 Symbol(pdb) 了。  
本篇介紹如何透過 Visual Studio 對自製的 NuGet 套件進行偵錯。  

<!-- more -->

## 前置準備

### ProGet 設定

> 由於我的 NuGet Server 是用 ProGet 架設，所以此節會說明 ProGet 的設定，若是以其它方式架設 NuGet Server，可以跳錯此節。  
> ProGet 架設可以參考這篇：[ProGet - 架設內部 NuGet Server](/article/proget-internal-nuget-server.html)  

在 ProGet 的 NuGet Feed 管理中，找到 Symbols Server 設定，啟動 Symbols 服務：  

![ProGet - Visual Studio 偵錯(Debug) NuGet 套件 - ProGet 設定](/images/x382.png)

原本 ProGet 提供的 NuGet Feed 是 [https://{domain}/**nuget**/{feed-name}]()，此時會多出一個 [https://{domain}/**symbols**/{feed-name}]() 用來提供 Symbol 使用。

### Symbol Packages

要讓 NuGet 套件能被偵錯，在打包時需要把 Symbol 一起包進 `*.nupkg`。

用 `nuget` 打包，在參數帶入 `-Symbols`，如下：
```sh
nuget pack -Symbols Sample.csproj
```

如果是用 `dotnet` 打包，在參數帶入 `--include-symbols`，如：
```sh
dotnet pack --include-symbols Sample.csproj
```

以上兩種方式打包，都會產生 `*.symbols.nupkg` 的檔案，把 `*.symbols.nupkg` push 到 NuGet Server。  
> 上傳跟下載 NuGet 套件還是使用 [https://{domain}/**nuget**/{feed-name}]() 這個 URL。  

## Visual Studio

要透過 Visual Studio 對自製的 NuGet 套件偵錯，需要改一些設定，我這邊是以 Visual Studio 2017 為例，其它版本應該也適用。  

### Enable Symbol Server Support

在 Visual Studio 中打開 **Debug** > **Options** > **Symbols**，新增一個 Symbol 來源，把 ProGet 提供的 Symbol URL 貼上 [https://{domain}/**symbols**/{feed-name}]()，並設定 Symbol 從 Server 下載的暫存位置。如圖：  

![ProGet - Visual Studio 偵錯(Debug) NuGet 套件 - Enable Symbol Server Support](/images/x383.png)

### Enable Source Server Support

在 Visual Studio 中打開 **Debug** > **Options** > **General**，找到以下設定：
* ☐ `Enable Just My Code` *(取消勾選)*  
* ☑ `Enable source server support` *(勾選)*  

如圖：  

![ProGet - Visual Studio 偵錯(Debug) NuGet 套件 - Enable Source Server Support](/images/x384.png)

### 偵錯

設定完成後執行偵錯，專案內從 [https://{domain}/**nuget**/{feed-name}]() 安裝的 NuGet 套件，就會自動從 [https://{domain}/**symbols**/{feed-name}]() 下載 Symbol 到暫存位置。如圖：  

![ProGet - Visual Studio 偵錯(Debug) NuGet 套件 - Symbol 暫存](/images/x385.png)

如此一來就可以透過 Debug 的 Step Into 進入自製的 NuGet 套件偵錯。  

![ProGet - Visual Studio 偵錯(Debug) NuGet 套件 - 偵錯](/images/x386.png)

## 參考

[Symbol and Source Server](https://inedo.com/support/documentation/proget/feed-types/nuget/symbol-and-source-server)  
