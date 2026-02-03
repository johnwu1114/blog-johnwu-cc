---
title: IIS - 靜態檔案及動態內容壓縮
author: John Wu
tags:
  - IIS
  - Gzip
  - ASP.NET
  - Web.config
categories:
  - IIS
date: 2017-09-06 09:27:00
featured_image: /images/a/329.png
---
![IIS - 靜態檔案及動態內容壓縮 - 執行結果](/images/a/329.png)

IIS 可以設定把送出的封包壓縮，封包壓縮的好處是可以減少網路流量，使用者下載的速度也會變快。  
本篇將介紹如何設定 IIS 自動把靜態檔案及 ASP.NET 產生的動態內容壓縮。  

<!-- more -->

> 注意！  
> 在一切開始設定之前，必須要知道 IIS 自動壓縮是甜蜜的毒藥，如果可以用 [CDN (Content Delivery Network)](https://zh.wikipedia.org/wiki/%E5%85%A7%E5%AE%B9%E5%82%B3%E9%81%9E%E7%B6%B2%E8%B7%AF) 就不要用 IIS 放靜態檔案，還透過 IIS 壓縮。

## 1. 安裝壓縮功能

我是以 Windows Server 2012 R2 為範例，其它版本設定起來也差不多。  
打開 Server Manager 新增功能，如下圖：
![IIS - 靜態檔案及動態內容壓縮 - 新增功能](/images/a/326.png)

## 2. 啟動壓縮功能

安裝完壓縮功能後，就可以在 IIS 打開壓縮功能，步驟如下：
![IIS - 靜態檔案及動態內容壓縮 - 啟動功能 - 1](/images/a/327.png)
![IIS - 靜態檔案及動態內容壓縮 - 啟動功能 - 2](/images/a/328.png)
* Static Compression
 * 可以設定靜態檔案大於 *N* 才會進行壓縮，預設是大於 *2,700 Bytes* 的靜態檔案才會進行壓縮
 * 壓縮完的暫存檔也可以更改儲存位置及限制暫存位置的使用空間上限

### 靜態檔案壓縮執行結果

可以看到執行結果差很多，檔案大小差了約 **4.5倍**！
![IIS - 靜態檔案壓縮執行結果](/images/a/329.png)

### 動態內容壓縮執行結果

![IIS - 動態內容壓縮執行結果](/images/a/330.png)
> 不要懷疑我！我沒貼錯，當封包太小，壓縮反而變大...  

正常一點的範例：
![IIS - 動態內容壓縮執行結果](/images/a/331.png)

## 3. 壓縮設定

### 3.1. HTTP Compression

壓縮的詳細設定可以打開 IIS 的 **Configuration Editor** 在 Section 欄位搜尋 `system.webServer/httpCompression`，步驟如下：
![IIS - 靜態檔案及動態內容壓縮 - 壓縮設定 - 1](/images/a/332.png)
![IIS - 靜態檔案及動態內容壓縮 - 壓縮設定 - 2](/images/a/333.png)

此篇範例我只用到 `dynamicTypes` 及 `staticTypes`。

* `dynamicTypes`  
dynamicTypes 可以設定有哪些 *mimeType* 類型是要壓縮的，上面範例動態內容壓縮執行結果，我是使用 `application/json` 類型，但預設 *mimeType* 並沒有 `application/json`。
可依照自己的需求增減要壓縮的 *mimeType*。
* `staticTypes`  
staticTypes 同上，在清單內的才會被壓縮，預設靜態檔案圖片類型的都不會被壓縮，如果要壓縮圖片，可以加入 `image/*`。  

> 其它設定請參考[官方詳細設定說明](https://docs.microsoft.com/en-us/iis/configuration/system.webserver/httpcompression/#configuration)。  

### 3.2. Server Runtime

之前有人問我為什麼 IIS 設定了自動壓縮，卻有時壓縮，有時沒壓縮。  
主要是因為 **Frequent Hit**，預設是 10 秒內對同一個靜態檔案有 2 次以上的請求才會壓縮。  

打開 IIS 的 **Configuration Editor** 在 Section 欄位搜尋 `system.webServer/serverRuntime`。  
設定 `frequentHitThreshold` 及 `frequentHitTimePeriod`，設定在一段時間內，連到同一個 URL *N* 次，才會觸發壓縮。  

* `frequentHitThreshold` 觸發頻率，預設 2 次，設成 1 的話，每次都會進行壓縮。  
* `frequentHitTimePeriod` 觸發時間範圍，預設 10 秒。  

> 其它設定請參考[官方詳細設定說明](https://docs.microsoft.com/en-us/iis/configuration/system.webserver/serverruntime#configuration)。  

## 4. Web.config

上述在 IIS 圖形化的操作設定，都是屬於全域套用，在該 IIS 中的所有網站都會套用該設定。  
如果只要套用某個站台，除了可以在該站台的 **Configuration Editor** 設定，也可以在根目錄的 Web.config 進行設定。  

### 4.1. URL Compression 

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <urlCompression 
      doStaticCompression="true" 
      doDynamicCompression="true" 
      dynamicCompressionBeforeCache="true" />
  </system.webServer>
</configuration>
```
* doStaticCompression 是否要壓縮靜態檔案
* doDynamicCompression 是否要壓縮動態產生的內容
* dynamicCompressionBeforeCache 如果動態產生的內容有使用暫存機制，可以設定是否要在放入暫存前壓縮

### 4.2. HTTP Compression

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <httpCompression
          directory="%SystemDrive%\inetpub\temp\IIS Temporary Compressed Files">
      <scheme name="gzip" dll="%Windir%\system32\inetsrv\gzip.dll" />
      <dynamicTypes>
          <add mimeType="text/*" enabled="true" />
          <add mimeType="message/*" enabled="true" />
          <add mimeType="application/javascript" enabled="true" />
          <add mimeType="application/json" enabled="true" />
          <add mimeType="*/*" enabled="false" />
      </dynamicTypes>
      <staticTypes>
          <add mimeType="text/*" enabled="true" />
          <add mimeType="message/*" enabled="true" />
          <add mimeType="application/javascript" enabled="true" />
          <add mimeType="image/*" enabled="true" />
          <add mimeType="*/*" enabled="false" />
      </staticTypes>
    </httpCompression>
  </system.webServer>
</configuration>
```

### 4.3. Server Runtime

這個設定是針對 IIS 的設定，不是網站設定，所以沒辦法在 `Web.config` 套用。  
如果要單獨套用站台，可以在該站台打開 **Configuration Editor** 設定，設定方式同上面說明。

## 建議

看到這邊心理可能會想：
> 這麼強大的功能，幹嘛不預設就開啟？　　

我在文章開頭就說到，這個功能是甜蜜的毒藥，壓縮是消耗 *CPU* 的效能，是用時間換取空間。  
很可能會因為壓縮導致網站執行效能問題，如果你的網站是需要高穩定、高效率的運行，就千萬不要讓 IIS 幫你壓縮，應該是要把靜態檔案全部放到 [CDN (Content Delivery Network)](https://zh.wikipedia.org/wiki/%E5%85%A7%E5%AE%B9%E5%82%B3%E9%81%9E%E7%B6%B2%E8%B7%AF)。

## 參考

* [HTTP Compression <httpCompression>](https://docs.microsoft.com/en-us/iis/configuration/system.webserver/httpcompression/)  
* [URL Compression <urlCompression>](https://docs.microsoft.com/en-us/iis/configuration/system.webserver/urlcompression)  
* [Server Runtime <serverRuntime>](https://docs.microsoft.com/en-us/iis/configuration/system.webserver/serverruntime)  