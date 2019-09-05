---
title: IIS - ASP.NET 網站基本優化設定
author: John Wu
tags:
  - ASP.NET
  - IIS
categories:
  - IIS
date: 2017-08-26 01:47:00
featured_image: /images/a/310.png
---

運行 ASP.NET 基本上都是掛載在 IIS 上面，但 IIS 預設的設定，並不適合 24 小時不中斷的營運系統。  
如果沒有適當的調整，可能會造成使用者的感受不佳，而你又偏偏不會遇到。  
本篇將介紹 IIS 運行 ASP.NET 網站的基本優化設定。

<!-- more -->

## 應用程式集區 

打開 IIS 管理員，到應用程式集區，選擇網站後，開啟進階設定：
![IIS - ASP.NET 網站基本優化設定 - 進階設定](/images/a/310.png)

## 1. 一般 (General)

### 佇列長度 (Queue Length)

預設值是 **1000**，當封包數量在同一時間到達該指定值，之後的 Request 都會變成 HTTP Status 503 Service Unavailable。  
> 例：當有同時間有 1001 個 Request 一起送到 IIS，第 1001 個 Request 會直接回傳 503，不會進到 ASP.NET 處理。  

也不是無限大就好，也是要看伺服器等級。  
> 假設調成 10000，也真的有同時 10000 的量，可能會演變成 *CPU High* 的問題。  

因此，這個欄位沒有建議值，網站封包量很大才有需要調整這個欄位。

### 啟動模式 (Start Mode)

預設值是 **OnDemand**，當網站執行回收後，會等到第一個 Request 進來，IIS 才會把網站啟動。  
所以第一個連上來的使用者會等到比較久的時間，ASP.NET 初始化完成後，使用者才會得到回應。  

建議設定成 `AlwaysRunning`，當網站執行回收後，IIS 就會直接啟動 ASP.NET。

## 2. 回收 (Recycling)

### 固定時間間隔 (Regular Time Interval)

預設值是 **1740**，也就是每隔 29 小時 IIS 就會把該網站重啟。  
很可能重啟當下使用者正在操作，對於要 24 小時不中斷的系統來說，這真的是很不妥當的事情。  
如果 ASP.NET 的 Session Mode 是用 InProc，網站重啟使用者就全被登出了。  

建議設定成 `0`，也就是關閉定期重啟網站的設定。  

> 如果網站真的需要定期重啟，可以在**特定時間 (Specific Times)** 設定，固定每天哪些離峰時間做重啟的動作。

## 3. 快速失敗保護 (Rapid-Fail Protection)

Enabled 預設值是 **True**，當 *N* 分鐘內，發生 *M* 次錯誤，IIS 就會終止網站。  
如果有能力在 ASP.NET 中處理錯誤，或實作一些異常處裡的保護機制，我建議把這個值設定成 `False`，關閉快速失敗保護。  

> 以前發生過 SignalR 某個版本的 Bug，導致 Client 連線丟出過多例外，對網站根本無關痛癢，但 IIS 就把網站停了...  

## 4. 處理序模型 (Process Model)

### 閒置逾時動作 (Idle Time-out Action)

預設值是 **Terminate**，當網站閒置 *N* 分鐘，IIS 就會把 ASP.NET 網站終止並把資源釋放，直到下個使用者 Request 進來，IIS 才會把網站重新啟動。行為類似**啟動模式 (Start Mode)**。

建議設定成 `Suspend`，Suspend 的行為是把網站狀態暫存在記憶體中，僅釋放 CPU 資源和用不到的記憶體，當 Request 進來後，可以快速的復原網站狀態。

## 設定範例

![IIS - ASP.NET 網站基本優化設定 - 範例執行結果](/images/a/311.png)
