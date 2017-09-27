---
title: IIS - HTTP 405 錯誤
author: John Wu
tags:
  - ASP.NET Core
  - Web Api
  - IIS
  - Web.config
categories:
  - IIS
date: 2017-09-26 23:04:00
featured_image: /images/x350.png
---

似乎每隔一陣子，就有身邊的人會遇到 IIS 發生 HTTP 405 錯誤。  
基本上都是在發佈新版到不同環境時，之前的環境沒遇到，直到某個新環境就遇到  HTTP 405 錯誤。  
主要是 `WebDAV` 的問題，所以本篇來說明一下這個現象。  

<!-- more -->

## 發生原因

ASP.NET Web API 或 ASP.Net Core 在使用 HTTP Method `PUT` 或 `DELETE` 時，會與 `WebDAV` 這套件衝突。  

當發生衝突時，就會顯示以下錯誤訊息：
```sh
# English
405 - HTTP verb used to access this page is not allowed.
# 中文
405 - 不允許用來存取此網頁的 HTTP 指令動詞。
```

## 解法

有兩種解法，第一種是從 `Web.config` 移除 `WebDAV`，另一種是將 `WebDAV` 從 IIS 中移除。

### Web.config

編輯網站的 `Web.config`，在 `<modules>` 標籤中加入 `<remove name="WebDAVModule"/>` 及 `<handlers>` 標籤中加入 `<remove name="WebDAV" />`。  

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <modules>
      <!-- ... -->
      <remove name="WebDAVModule"/>
    </modules>
    <handlers>
      <!-- ... -->
      <remove name="WebDAV" />
    </handlers>
  </system.webServer>
</configuration>
```

### IIS 功能

如果是 Windows Server 的話，打開伺服器管理員，移除角色及功能精靈，找到 **WebDAV 發行 (WebDAV Publishing)** 取消勾選後移除。如圖：

![IIS - HTTP 405 錯誤 - 移除 WebDAV](/images/x350.png)

## 建議

已經被問過好幾次，歸納出一些情境：
* 遇到 HTTP 405 錯誤時，修改了 `Web.config`，但並沒有所有環境都同步，導致不小心蓋掉已修正過的 `Web.config`。  
* 設定新機器時，怕漏安裝 IIS 的套件，所以什麼都裝，`WebDAV` 就一起被裝上去了。  

> 根據上述的兩種情境，我會建議沒有需要的套件，真的不要亂裝，尤其 IIS 的 HTTP Modules 多裝還會引響效能。  
(可以參考這篇：[ASP.NET - 基本優化設定](/article/asp-net-optimized-setting.html))  

> 如果你是使用 RESTful 風格，我建議一開始就在 `Web.config` 設定好移除 `WebDAV`，省的哪天被不知情的人士在 IIS 裝 `WebDAV` 影響到網站。