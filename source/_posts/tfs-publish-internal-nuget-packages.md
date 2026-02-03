---
title: TFS - 自製內部 NuGet 套件
author: John Wu
tags:
  - TFS
  - NuGet
  - CI/CD
categories:
  - TFS
  - NuGet
date: 2017-05-24 14:37:00
featured_image: /images/a/157.png
---
![TFS - NuGet Feed ](/images/a/157.png)

最近在測試 Team Foundation Server 2017，發佈公司內部用的自製 NuGet 套件。  
過程沒有很順利，遇到一些問題，又有被雷到的感覺，筆記一下 TFS 發佈內部自製 NuGet 套件的失敗歷程。  

<!-- more -->

## 1. 套件來源

新增一個自訂的套件來源位置，把接下來要發佈的套件指向這裡，其它人要安裝或更新 NuGet 套件，都是從這邊提取。  
步驟如圖：  
![TFS - Create Packages Feed - 1](/images/a/144.png)
![TFS - Create Packages Feed - 2](/images/a/145.png)
> 建立完成後，把 **Feed URL** 複製起來，等等會用到。  

## 2. 建立 Build 定義

建立 NuGet 套件的 Build 定義，步驟如圖：  
![TFS - Create Packages Build - 1](/images/a/141.png)
![TFS - Create Packages Build - 2](/images/a/142.png)
![TFS - Create Packages Build - 3](/images/a/143.png)
![TFS - Create Packages Build - 4](/images/a/146.png)
![TFS - Create Packages Build - 5](/images/a/147.png)

## 3. Build

Failed...  
![TFS - NuGet Packager Error](/images/a/138.png)

## 失敗歷程

### NuGet Packager Error - NuGet version

打包 NuGet 套件的時候發生錯誤：  
> 'xxxxx' already has a dependency defined for 'NETStandard.Library'.  
> System.Exception: Unexpected exit code 1 returned from tool NuGet.exe  
> PowerShell script completed with 1 errors.  

![TFS - NuGet Packager Error - 1](/images/a/138.png)

解法：  
我用到 NETStandard.Library，必須要用新版的 NuGet。  
到套件來源下載最新版的 NuGet.exe，這個連結會到微軟官網下載最新版的 NuGet.exe。如圖：  
![TFS - Download NuGet.exe](/images/a/148.png)

下載完成後，放到 TFS 上面，並指定路徑：  
![TFS - Setup NuGet.exe path](/images/a/149.png)

### NuGet Packager Error - Test Project

再次打包 NuGet 套件，又發生錯誤：  
> Unable to find 'D:\TfsData\agent-2.112.0\_work\...\xxxxx.Common.Tests.dll'. Make sure the project has been built.  
> System.Exception: Unexpected exit code 1 returned from tool NuGet.exe  
> PowerShell script completed with 1 errors.  

![TFS - NuGet Packager Error - 2](/images/a/156.png)

解法：  
打包 Test Project 會有問題，所以就把 Test Project 排除：
> `**\*.csproj;-:**\*.*Test*.csproj`  

![TFS - Exclude Test Project](/images/a/154.png)

### NuGet Publisher Error - Package version

再次打包 NuGet 套件，又發生錯誤：  
> Response status code does not indicate success: 409 (Conflict).  
> Error: D:\TfsData\NuGet.exe failed with return code: 1  
> Packages failed to publish  

![TFS - NuGet Publisher Error - 1](/images/a/139.png)

解法：  
沒有打版號會出錯，設定自動打版號。如圖：  
![TFS - Automatic package versioning](/images/a/150.png)
![TFS - Automatic package versioning](/images/a/151.png)
> 打出來的版號會是 1.`日期`.`今天Build次數`  
> E.g.: 1.20170524.1  

終於發佈成功，但開心的太早，因為第一次成功，第二次之後都失敗...  
舊的 `*.nupkg` 一直留在 Build Agent 的 _work 目錄中，所以被誤判發佈相同版本，而 NuGet 不允許重複發佈同版本。
> Response status code does not indicate success: 409 (Conflict).  
> ##[error]Error: D:\TfsData\agent-2.112.0\_work\_tasks\NuGetPublisher_333b11bd-d341-40d9-afcf-b32d5ce6f25b\0.2.30\node_modules\NuGet-task-common\NuGet\3.5.0\NuGet.exe failed with  
> ##[error]Packages failed to publish  

![TFS - Build Agent - status](/images/a/140.png)

解法：  
把 Build Agent 的 _work 目錄中 `*.nupkg` 清除：  
![TFS - Remove nupkg - 1](/images/a/152.png)  
> `**/*.nupkg` 

![TFS - Remove nupkg - 2](/images/a/153.png)

終於可以每次都發佈成功啦～～～  
(Code沒錯的情況下...)

## Visual Studio

到 NuGet 管理員加入新的 NuGet 來源，貼上 **Feed URL**。  
就可以看到自訂的 NuGet 套件了。  
![Visual Studio Add NuGet Source](/images/a/155.png)

## 參考

https://www.visualstudio.com/en-us/docs/build/steps/package/nuget-publisher