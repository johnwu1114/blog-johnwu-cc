---
title: '[鐵人賽 Day01] ASP.NET Core 系列 - 從頭開始'
author: John Wu
tags:
  - ASP.NET Core
  - 2018 iT 邦幫忙鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-13 23:17
featured_image: /images/i3.png
---

來勢洶洶的 .NET Core 似乎要取代 .NET Framework，ASP.NET 也隨之發佈 .NET Core 版本。雖說名稱沿用 ASP.NET，但相較於 ASP.NET 確有許多架構上的差異，可說是除了名稱外，已是兩個不同的框架。本系列文將介紹 ASP.NET Core 入門教學及一些實務運用的範例。

<!-- more -->

## 前言

要開發 .NET Core 必需要安裝 .NET Core SDK，所以先到官網下載 .NET Core SDK 的安裝檔，官網下載位置[點我](https://www.microsoft.com/net/download/)  
.NET Core 是跨作業系統的框架，不再像 .NET Framework 要依附在 Windows 的作業系統才能執行，所以你可以依照你需要的版本進行下載及安裝。  
雖然我的電腦是 Windows 作業系統，但接下來的系列教學都會是以指令為主。  

> 安裝軟體步驟實在是太簡單，除了按**下一步**以外，幾乎沒什麼好解說的，所以我不會介紹怎麼安裝軟體，除非有特殊的注意事項。  

安裝完成後，可以透過 dotnet cli (Command-Line Interface)確認 .NET Core SDK 安裝的版本，指令如下：
```sh
dotnet --version
```

若安裝完成，就會顯示已安裝的版本，就可以開始囉。  

## 建立網站專案

先建立一個專案資料夾 `MyWebsite`，然後在該資料夾執行指令：
```sh
dotnet new web
```

![[鐵人賽 Day01] ASP.NET Core 系列 - 從頭開始 - 建立專案](/images/i1.png)

dotnet cli 會在該資料夾，建立一個空的 ASP.NET Core 專案，內容如下：  

![[鐵人賽 Day01] ASP.NET Core 系列 - 從頭開始 - 專案目錄](/images/i2.png)
```yml
obj/                            # 專案暫存目錄
wwwroot/                        # 網站根目錄(空的)
MyWebsite.csproj                # 專案檔
Program.cs                      # 程式進入點
Startup.cs                      # 啟動網站設定
```

## 啟動網站

建立完成後，就可以啟動網站了。啟動網站指令：
```sh
dotnet run
```
dotnet cli 預設會起一個[http://localhost:5000/](#)的站台，用瀏覽器打開此連結就可以看到 ASP.NET Core 網站了。如下：  

![[鐵人賽 Day01] ASP.NET Core 系列 - 從頭開始 - 啟動網站](/images/i3.png)