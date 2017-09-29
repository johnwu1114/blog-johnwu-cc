---
title: IIS - HTTP 301 / 302 轉址
author: John Wu
tags:
  - IIS
  - Web.config
categories:
  - IIS
date: 2017-09-27 23:24:00
featured_image: /images/x353.png
---

最近看到同事搜尋我的網域 `johnwu.cc`，結果開出來是我測試機的 IIS Default Page，才想到我忘記把 root domain 轉址到我的部落格。  
本篇來介紹一下透過 IIS 設定 HTTP 301 及 302 的轉址。  

<!-- more -->

## 安裝 URL Rewrite

首先要在 IIS 安裝 URL Rewrite，可以從 IIS 官方下載安裝檔。  
> 下載位置：[URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)。  

或者從 Web Platform Installer 搜尋 URL Rewrite 並安裝。  

![IIS - HTTP 301 / 302 轉址 - Web Platform Installer](/images/x351.png)

## 轉址差異

HTTP 301 / 302 轉址對人的行為來說沒有什麼意義，反正就是幫忙從 A 轉到 B。  
主要差異是給搜尋引擎理解的。  

### HTTP 301

HTTP 301 是要讓搜尋引擎知道，該網址已經永久轉移到另一個地方。  
通常用於網站搬家或網站改版，新舊版本路徑不相同，要重新對應的情況。  

### HTTP 302

HTTP 302 是告知搜尋引擎，雖然這次被轉址，但只是暫時性的。  
通常用於網站維護時，暫時原網址轉移到別的地方，如維修公告頁面。

## 設定方式

可以在網站的 `Web.config` 或從 IIS 的 UI 介面設定：

### Web.config

編輯網站的 `Web.config`，在 `<system.webServer>` 標籤中加入 `<rewrite>`。如下範例：

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Redirect to blog" stopProcessing="true">
          <match url="(.*)" />
          <action type="Redirect" redirectType="Found" url="https://blog.johnwu.cc/" />
        </rule>
      </rules>
	  </rewrite>
  </system.webServer>
</configuration>
```

* HTTP 301 `redirectType="Permanent"`  
* HTTP 302 `redirectType="Found"`  

### IIS 設定

![IIS - HTTP 301 / 302 轉址 - IIS 設定 - 1](/images/x352.png)
![IIS - HTTP 301 / 302 轉址 - IIS 設定 - 2](/images/x353.png)
![IIS - HTTP 301 / 302 轉址 - IIS 設定 - 3](/images/x354.png)
![IIS - HTTP 301 / 302 轉址 - IIS 設定 - 4](/images/x355.png)
> 設定完成後套用即可。 上述的設定方式跟 `Web.config` 設定的內容是一樣的。 

## 轉址參數

用 IIS 的 UI 介面可以測試 URL 規則，同時可以擷取內容，變成轉址的參數：  

![IIS - HTTP 301 / 302 轉址 - 測試模式](/images/x359.png)

### 範例一

```xml
<rule name="Redirect to blog" stopProcessing="true">
  <match url="(.*)/(.*)" />
  <action 
    type="Redirect" 
    redirectType="Found" 
    url="https://blog.johnwu.cc/?p1={R:1}&amp;p2={R:2}" />
</rule>
```
> 當連到 `http://johnwu.cc/first/second`  
> 轉址到 `https://blog.johnwu.cc/?p1=first&p2=second`  

### 範例二

```xml
<rule name="Redirect to blog" stopProcessing="true">
  <match url="api/latest/(.*)" />
  <action 
    type="Redirect" 
    redirectType="Permanent" 
    url="/v2/{R:1}" />
</rule>
```

> 當連到 `http://johnwu.cc/api/latest/member/login`  
> 轉址到 `http://johnwu.cc/v2/member/login`  

## 執行結果

當連到 `johnwu.cc` 就轉址到我的部落格 `https://blog.johnwu.cc/`  

![IIS - HTTP 301 / 302 轉址 - 執行結果](/images/x356.gif)
