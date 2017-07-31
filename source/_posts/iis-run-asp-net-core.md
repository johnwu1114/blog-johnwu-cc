title: IIS - 運行 ASP.NET Core 網站
author: John Wu
tags:
  - ASP.NET Core
  - IIS
  - Windows
categories:
  - IIS
date: 2017-07-31 23:38:00
---
![IIS - 運行 ASP.NET Core 網站 - 範例執行結果](/images/pasted-256.png)

本篇將介紹如何在 IIS 運行 ASP.NET Core 網站。  

<!-- more -->

## 1. 安裝 .NET Core Windows Server Hosting

要在 IIS 上運行 ASP.NET Core，必須先安裝 [.NET Core Windows Server Hosting](https://go.microsoft.com/fwlink/?linkid=848766)。  
安裝完畢後，用系統管理員身分執行指令：
```bat
net stop was /y
net start w3svc
```
> 如果沒有執行該指令，之後執行 ASP.NET Core 網站會顯示錯誤：`HTTP Error 502.5 - Process Failure`。  

![HTTP Error 502.5 - Process Failure](/images/pasted-257.png)

## 2. 新增 IIS 站台

打開 IIS 管理員，在站台點右鍵，選擇新增網站，並輸入網站設定：
![IIS - 運行 ASP.NET Core 網站 - 新增站台](/images/pasted-251.png)
![IIS - 運行 ASP.NET Core 網站 - 網站資訊](/images/pasted-252.png)

程網站新增完成後，到應用式集區，把 CLR 版本改為`沒有 Managed 程式碼`：
![IIS - 運行 ASP.NET Core 網站 - 網站資訊](/images/pasted-253.png)

## 3. 佈署網站

可以透過 `dotnet publish` 指令發佈網站，將發佈出來的內容放到 IIS 設定的位置。  
或者用 Visual Studio 發佈網站，在專案點右鍵，選擇發行：
![IIS - 運行 ASP.NET Core 網站 - 發行網站](/images/pasted-249.png)
有多種方式可以選擇，我是選用資料夾發行，直接佈署到遠端 IIS 的檔案位置。
![IIS - 運行 ASP.NET Core 網站 - 發行方式](/images/pasted-250.png)

完成佈署後，打開設定的網址會顯示錯誤：`HTTP Error 500.19 - Internal Server Error`。
![IIS - 運行 ASP.NET Core 網站 - HTTP Error 500.19 - Internal Server Error](/images/pasted-254.png)

## 4. 權限設定

由於 CLR 改為`沒有 Managed 程式碼`，導致網站沒有權限，所針對 ASP.NET Core 網站新增執行權限。  
步驟如下：
![IIS - 運行 ASP.NET Core 網站 - 新增執行權限](/images/pasted-255.png)

## 執行結果

![IIS - 運行 ASP.NET Core 網站 - 範例執行結果](/images/pasted-256.png)

## 參考

[Set up a hosting environment for ASP.NET Core on Windows with IIS, and deploy to it](https://docs.microsoft.com/en-us/aspnet/core/publishing/iis)  