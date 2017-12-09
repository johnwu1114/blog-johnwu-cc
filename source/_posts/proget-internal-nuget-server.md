---
title: ProGet - 架設內部 NuGet Server
author: John Wu
tags:
  - NuGet
  - ProGet
categories:
  - ProGet
date: 2017-11-30 14:47:00
featured_image: /images/x401.png
---

系統規模較大或模組較多時，並不適合用專案相依，避免編譯太久及程式碼管理的問題等。  
常見的方式是將 DLL 編譯出來，再給需要的專案參考，但同步 DLL 的過程需要控管，以免拿錯版本。  
比較好的方式是透過 Dependency Service 解決專案相依的問題，而 .NET 的 Dependency Service 主要是 NuGet。  
本篇介紹如何透過 ProGet 架設內部 NuGet Server。  

<!-- more -->

## 前言

ProGet 是一套支援多種 Dependency Service 工具，它支援以下 Feed 服務：  
* Bower  
* Chocolatey  
* Docker  
* Maven  
* npm  
* **NuGet (本篇重點)**  
* PowerShell  
* Ruby Gems  
* Universal  
* VSIX  

並且有 Windows 版本及 Linux(Docker) 版本可以架設，本篇重點將以 **Windows 版本**架設為主。  
ProGet 有分**付費版**跟**免費版**，免費版支援的 Feed 跟付費版一樣，功能也沒被閹割太多，詳細差異可以看 [Features by Edition](https://inedo.com/proget/pricing/features-by-edition)。如果是要公司內部自用就放心的架吧！  

## 安裝 ProGet

先下載 ProGet 安裝檔：[下載](https://inedo.com/proget/download)  

安裝步驟如下：  
![ProGet - 架設內部 NuGet Server](/images/x388-1.png)

選擇版本，我直接選免費版，要試用企業版的人，也可以選企業版：  
![ProGet - 架設內部 NuGet Server](/images/x388.png)

輸入註冊資訊(必填)：  
![ProGet - 架設內部 NuGet Server](/images/x389.png)

安裝路徑：  
![ProGet - 架設內部 NuGet Server](/images/x390.png)

選擇 SQL Server 位置：  
* 如果沒有 SQL Server，選第一個 `New Instance of SQL Express`，它會自動幫你下載 SQL Express 及安裝。  
![ProGet - 架設內部 NuGet Server](/images/x391.png)

* 如果已經有現成的 SQL Server 可以用，先建立好一個名稱為 `ProGet` 的資料庫，並給它資料庫的連線字串。  
![ProGet - 架設內部 NuGet Server](/images/x392.png)

選擇 Web Server，我在這邊是把 ProGet 架在 IIS 上面，如果沒有安裝 IIS 可以選擇有 Windows Service 的方式運行 ProGet：  
![ProGet - 架設內部 NuGet Server](/images/x393.png)

設定 ProGet Server 運行的權限：  
![ProGet - 架設內部 NuGet Server](/images/x394.png)

設定完成開始安裝：  
![ProGet - 架設內部 NuGet Server](/images/x395.png)

## 新增 NuGet Feed

安裝好後用瀏覽器開啟 ProGet 用 *Admin* 登入，打開 Feeds 頁面，選擇 `Create New Feed`：  
> *Admin* 預設帳號密碼都是 *Admin*。  
> 例如：安裝在本機 Prot 81 的話，開啟 URL 就是 `http://localhost:81`。  

![ProGet - 架設內部 NuGet Server - Create New Feed](/images/x396.png)

Feed Type 選擇 NuGet Feed，Feed Name 自訂：  
![ProGet - 架設內部 NuGet Server - Create New Feed](/images/x397.png)

NuGet Feed 新增完成：
![ProGet - 架設內部 NuGet Server - Create New Feed](/images/x398.png)

> NuGet Feed 新增完成後，就可以透過 NuGet Push 指令把 NuGet Package 上傳到 ProGet 囉～

## NuGet Package

在 Feeds 清單中，點進剛剛建立的 Feed，選擇 `Add Package`，就可以看到上傳 NuGet Package 的方式。  
如下：  

![ProGet - 架設內部 NuGet Server - NuGet Package](/images/x399.png)

**API endpoint URL** 就是 NuGet Feed 的 URL，可以透過這個 URL 上傳或下載 NuGet Package。  

ProGet 有提供四種上傳 NuGet Package 的方式：  
* 從頁面上傳 `*.nupkg`  
* 透過 NuGet Push 指令上傳  
* 從其他 NuGet Server 同步過來  
* 從實體路徑載入  

> 本篇以 NuGet Push 指令為主，`NuGet.exe` 可以到 NuGet 官網[下載](https://www.nuget.org/downloads)。

### 打包

假設要打包 *SampleLibrary* 的專案，先用 Visual Studio 或 MSBuild 建置，建置完成後就可以透過 NuGet pack 指令打包 `*.nupkg` 檔案。指令如下：  
```
NuGet.exe pack C:\SampleLibrary\SampleLibrary.csproj -Version 1.0.0.1 -Properties "Configuration=Release;OutDir=C:\SampleLibrary\SampleLibrary\bin\Release" 
```
* `Version`：要上傳到 NuGet Server 的版本不能重複。  
* `OutDir`：編譯後 DLL 的位置。  

> 如果是 .NET Core 專案，用 `dotnet pack` 指令打包，參數可以參考[官網](https://docs.microsoft.com/zh-tw/dotnet/core/tools/dotnet-pack?tabs=netcore2x)。  

### 上傳

用 NuGet pack 打包完成後，就可以把 `*.nupkg` 上傳到 NuGet Server。  
指令如下：  
```sh
NuGet.exe push SampleLibrary.1.0.0.1.nupkg -ApiKey Admin:Admin -Source http://localhost:81/nuget/internal/
```
* `ApiKey`：預設可以用 ProGet 的帳號密碼當做 NuGet ApiKey，從 ProGet 的管理中也能設定專用的 ApiKey，有興趣的可以研究看看。  

在 NuGet 管理中新增 NuGet Feed，如下：  

![ProGet - 架設內部 NuGet Server - NuGet Package](/images/x400.png)

上傳完成就可以在 NuGet 管理中，看到自製的 NuGet Package 了。  

![ProGet - 架設內部 NuGet Server - NuGet Package](/images/x401.png)