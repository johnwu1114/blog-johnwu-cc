---
title: '[鐵人賽 End] ASP.NET Core vs ASP.NET MVC'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - ASP.NET
categories:
  - ASP.NET Core
date: 2018-01-18 22:00
featured_image: /images/logo-asp-net-core.png
---

ASP.NET Core 2 系列文的結尾想了好幾個，也換過好幾次主題。最終還是決定用，常被問到的問題來做總結。  
> **『ASP.NET Core vs ASP.NET MVC 如何選擇？』**  

本篇簡單整理了一些資訊，粗略分享 ASP.NET Core 及 ASP.NET MVC 的優劣比較。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[End] ASP.NET Core 2 系列 - ASP.NET Core vs ASP.NET MVC](https://ithelp.ithome.com.tw/articles/10197618)  

<!-- more -->

先用下表簡單的歸納各方訊息的結果：

| 特性 | ASP.NET Core | ASP.NET MVC |
| ------|:------:|:------:|
| 穩定性 |  | 勝 |
| 文件資源 |  | 勝 |
| 技術資源 |  | 勝 |
| 套件支援 |  | 勝 |
| 跨平台 Host | 勝 |  |
| 高效能 | 勝 |  |
| 微服務 | 勝 |  |
| Docker 支援 | 勝 |  |
| 持續更新 | 勝 | 　 |  

很明顯 ASP.NET Core 是具有未來競爭的優勢，但很多人在意的是現階段**穩定性**這點，因此不敢貿然使用在正式產品。

其實 ASP.NET Core 的穩定性並沒有這麼可怕，ASP.NET Core 都已經是 [Open Source](https://github.com/aspnet/Mvc) 了，真的遇到有問題的地方，可以直接 Checkout 下來 Debug，我自己就幹過好幾次這樣的事。Open Source 的社群力量再加上微軟強力支持，相信在短時間就能追上 ASP.NET MVC 的穩定程度。  

所以這個問題，**『ASP.NET Core vs ASP.NET MVC 如何選擇？』**，我會這樣回答：  
* 喜歡(願意)嘗試新技術的團隊(人)。  
  不要再考慮了！選擇 **ASP.NET Core** 吧！  
* 有足夠能力解決技術問題的團隊(人)。  
  所有的 Bug 都在那裡了！去挑戰 **ASP.NET Core** 吧！  
* 現有系統使用 ASP.NET MVC 的團隊(人)。  
  換技術不會賺比較多錢！不要沒事找事做！繼續用 **ASP.NET MVC** 吧！  
* 想玩 .NET Solution 微服務或 Docker 的團隊(人)。  
  ASP.NET MVC 根本不在同個量級！選擇 **ASP.NET Core** 吧！  
  *(什麼 P 比雞腿的概念)*  
* 想要快速開發出產品，但團隊只熟悉 ASP.NET MVC。  
  趕快來閱讀 [ASP.NET Core 從入門到實用 系列](/tags/it-邦幫忙-2018-鐵人賽/)，然後選擇 **ASP.NET Core** 吧！XD  

最後，ASP.NET Core 很難用 30 篇文章介紹完，但此系列文應該都有把基礎功能介紹到。  
進階的部分就建議動手做，親手體驗 ASP.NET Core 的特性。  

## 致謝

感謝老婆一挑三照顧三個小孩，讓我晚上可以安靜的寫文章。  
感謝隊長[Blackie](https://blackie1019.github.io/)力邀參加鐵人賽，在隊長英明領導的帶領之下，總算全員完賽！  
感謝隊友[Claire](https://claire-chang.com/)盡心參與，一同完成賽事。  
感謝各位讀者願意看，如有介紹不夠詳細或看不懂的部分，請多多指教。  

## 推薦

iT 邦幫忙 2018 鐵人賽，隊友的系列文一定要支持一下：  
* [Blackie - Amazon Cloud Service 30 days challenge 系列](https://ithelp.ithome.com.tw/users/20083507/ironman/1366)  
* [Claire - 用30天深入Angular 5的世界 系列](https://ithelp.ithome.com.tw/users/20107113/ironman/1240)  

## 參考

[Choosing between .NET Core and .NET Framework for server apps](https://docs.microsoft.com/en-us/dotnet/standard/choosing-core-framework-server)  
[ASP.NET Or ASP.NET Core, What To Choose?](https://goo.gl/BAFYuY)  
[.NET Core vs .NET Framework: How to Pick a .NET Runtime for an Application](https://stackify.com/net-core-vs-net-framework/)  
[C# .NET Core programs versus Java](https://benchmarksgame.alioth.debian.org/u64q/csharp.html)  