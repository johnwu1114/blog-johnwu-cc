---
title: TFS - Build & Release ASP.NET Website
author: John Wu
tags:
  - TFS
  - ASP.NET
  - CI/CD
categories:
  - TFS
date: 2017-06-06 09:41:00
---
![TFS - ASP.NET Releases](/images/pasted-182.png)

最近測試 TFS 2017，本來只是想做公司內部的 NuGet Server，順便就玩一下 Build & Release ASP.NET Website 越玩越有心得，把遇到的問題筆記一下。  

<!-- more -->

## Build 定義

建立 ASP.NET 專案的 Build 定義，步驟如圖：  
![TFS - Create ASP.NET Build - 1](/images/pasted-141.png)
選擇 Source 來源：
![TFS - Create ASP.NET Build - 2](/images/pasted-169.png)
如果有用到 NPM、Grunt、Gulp之類的，可以順便加進來：  
(我是用 NPM，所以用 NPM為例)
![TFS - Create ASP.NET Build - 3](/images/pasted-170.png)
![TFS - Create ASP.NET Build - 4](/images/pasted-171.png)
![TFS - Create ASP.NET Build - 5](/images/pasted-172.png)
![TFS - Create ASP.NET Build - 6](/images/pasted-173.png)
> 要不要忽略錯誤繼續往下，依需求設定。  

![TFS - Create ASP.NET Build - 7](/images/pasted-174.png)
> 點左邊可以看到每個 Build Step 的執行結果，因為 Unit Test 沒有過，所以顯示黃色驚嘆號標示。  
> 但不影響 Build 的成品。

## Build 成品

Build 完的 Output console 可以看到成品在 Server的位置，可以登到 Server 去看成品內容，或者從 TFS 的 UI 介面來看，如下：
![TFS - Build Artifacts](/images/pasted-175.png)
> 成品竟然沒有包含 Website 內容，只有 Test Project 的 Binary！  

打開 Build 定義修改 Build solution 的 MSBuild Arguments，如下：
```bash
/p:ReleaseOnBuild=True /p:ReleaseDefaultTarget=WebPublish /p:WebPublishMethod=FileSystem /p:DeleteExistingFiles=True /p:publishUrl=$(build.artifactstagingdirectory)\website
```
![TFS - MSBuild Arguments](/images/pasted-176.png)
再 Build 一次就可以看到有 website 的資料夾，裡面就是 Website Build 出來的內容了。  
![TFS - Website Build Artifacts](/images/pasted-177.png)

## Release 定義

建立 ASP.NET Website 的 Release 定義，步驟如圖：  
![TFS - Create ASP.NET Release - 1](/images/pasted-178.png)
![TFS - Create ASP.NET Release - 2](/images/pasted-179.png)
![TFS - Create ASP.NET Release - 3](/images/pasted-180.png)
![TFS - Create ASP.NET Release - 4](/images/pasted-181.png)
> 此範例是 Deploy 到實體機器的指定目錄，該目錄是 IIS 的 Website 位置。  
> Release 成功後，就可以看到網站被更新了。

## Release 結果

每次的 Release 都會被保留，預設是保留 30 天，至少保留 3 個版本。如下：
![TFS - ASP.NET Releases](/images/pasted-182.png)

