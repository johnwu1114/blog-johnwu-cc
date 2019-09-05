---
title: IIS - 安裝 SSL 憑證
author: John Wu
tags:
  - IIS
  - SSL
  - HTTPS
  - Security
categories:
  - IIS
date: 2017-07-01 00:55:00
featured_image: /images/a/220.png
---
![IIS - 安裝 SSL 憑證](/images/a/220.png)

前篇[免費 SSL 申請](/article/ssl-for-free.html)介紹了如何取得 SSL 憑證。  
本篇將介紹把 SSL 憑證匯入至 IIS，啟用網站的 HTTPS 連線。  

<!-- more -->

## 取得憑證
 
在安裝 SSL 憑證之前，當然要先取得憑證囉～  
SSL 憑證通常是花錢購買，但也有免費的可以用。  
如果是網站要用的 SSL 憑證，免費跟付費的差異大概就是信任度、有效期、認證標章等。  
至於加密技術跟安全性，大致上都依樣。  

> 需要免費的 SSL 憑證，可以參考這篇：[免費 SSL 申請](/article/ssl-for-free.html)

## 產生私密金鑰

安裝到 IIS 的憑證必須是 `*.pfx` 的檔案。但根據申請的管道不同，可能取得的憑證檔案格式不太一樣。  
如果可以拿到 `*.pfx`，就可以跳過此步驟。不是的話也沒關係，你拿到的憑證基本上都能產生出 `*.pfx` 檔案。  

例如我從 SSL For Free 申請到的憑證，有以下三個檔案：  
1. `certificate.crt` Certificate 文字檔  
2. `private.key` Private Key 文字檔  
3. `ca_bundle.crt` 中繼憑證文字檔  

可以透過 OpenSSL 來產生 `*.pfx`，指令如下：  
```bash
openssl pkcs12 -export -in certificate.crt -inkey private.key  -certfile ca_bundle.crt -out sample.pfx
```
> 它會提示輸入自訂密碼，要匯入 IIS 時會用到，不要忘記喔！  
> Windows 要使用 OpenSSL 的話，可以到這邊下載 [Shining Light Productions](https://slproweb.com/products/Win32OpenSSL.html)  

## 1. 安裝憑證

![Install SSL Certificate to IIS - 1](/images/a/221.png)
![Install SSL Certificate to IIS - 2](/images/a/222.png)

1. 首先打開 IIS，選取 IIS 站台首頁。  
2. 找到伺服器憑證。  
3. 在右變的動作列點選**匯入**。  
4. 載入預先做好的 PFX 憑證檔。  
5. 輸入當時製作 PFX 憑證檔的密碼。  
(如果不幸忘記，就只能重做 PFX 了)  
6. 完成

## 2. 綁定網域

![Binding HTTPS in IIS](/images/a/223.png)

1. 在左邊選擇要綁定 HTTPS 的站台。  
2. 選擇站台後，在右邊動作列找到**繫結**。  
3. 如果要讓 HTTP 及 HTTPS 共存，就選擇新增。  
4. 類型選擇 HTTPS。  
5. 輸入網域名稱。  
6. 選擇 SSL 憑證。  
7. 完成

## 執行結果

![IIS - 安裝 SSL 憑證](/images/a/220.png)
