---
title: Visual Studio 2017 - TypeScript 無法存檔問題
author: John Wu
tags:
  - Visual Studio
  - TypeScript
  - Windows
categories:
  - Visual Studio
  - VS2017
date: 2017-04-18 21:37:30
featured_image: /images/pasted-61.png
---
![LockHunter - SearchProtocolHost.exe](/images/pasted-61.png)

最近在家用 Visual Studio 2017 寫 TypeScript 時，常常遇到無法儲存檔案，按下儲存就一直要我另存新檔，隔幾分鐘後再按儲存，才能成功儲存。用公司電腦就不會遇到此問題，搞的我很火大！  
我上網找了專門查看檔案被 Lock 的工具 LockHunter（如上圖），發現我開啟的專案中，所有 TypeScript 檔案都被 SearchProtocolHost.exe 咬死，隔了很久才釋放資源，導致我都不能存檔。  
> SearchProtocolHost.exe 是 Windows 幫檔案建立索引用的背景程式，透過建立索引可以加快搜尋檔案時。

<!-- more -->

今天跟同事聊天時，發現他是在 Visual Studio 2017 專案中安裝 NuGet 套件後無法即時生效，必須要重啟 Visual Studio 2017 才會套用。聽完敘述後，我猜也是類似的問題，過去看了一下 csproj 檔的索引方式，果然跟我預期的一樣。  

## 索引功能

Windows 索引有兩種方式：
1. 索引檔案屬性  
建立索引時不會咬死檔案，缺點是不會對內容建立索引，在 Windows 搜尋時，無法搜尋內容。  
2. 索引檔案屬性和內容  
建立索引時不得異動檔案，因為要針對內容建立索引，在 Windows 搜尋時，可以搜尋檔案內容。  

而在我電腦中的 TypeScript 及同事電腦中的 csproj 被設定為**索引檔案屬性和內容**，所以才會遇到被 SearchProtocolHost.exe 咬死。提供以下兩個方法解決此問題：
1. 變更索引方式
2. 關閉索引

## 變更索引方式

打開控制台 -> 變更檢視方式 -> 大圖示 -> 索引選項  
![控制台](/images/pasted-62.png)

按下進階  
![控制台 - 索引選項](/images/pasted-63.png)

按下檔案類型 -> 找到 ts/csproj -> 選擇只有索引檔案屬性  
![索引選項 - 進階選項](/images/pasted-64.png)

## 關閉索引

打開服務 -> 找到 Windows Search -> 把啟動類型設為停用 -> 停止服務 -> 確定  
![服務 - Windows Search](/images/pasted-65.png)

後來仔細想了一下，三年前我在公司開發時，為了更好的效能，就把 Windows 索引給關了。家裡的電腦是後來買的，忘記關閉 Windows 索引。  
我幾乎沒再用 Wdinwos 搜尋功能，所以我就直接把他關了，真的要搜尋檔案的時候會慢一些，但我個人是還能接受。  

