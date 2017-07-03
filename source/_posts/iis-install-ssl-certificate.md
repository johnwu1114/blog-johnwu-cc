title: IIS - 安裝 SSL 憑證
author: John Wu
tags:
  - IIS
  - SSL
  - HTTPS
categories:
  - IIS
date: 2017-07-01 00:55:00
---
![免費 SSL 申請 - SSL For Free](/images/pasted-210.png)

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
> Windows 要使用 OpenSSL 的話，可以到這邊下載 [Shining Light Productions](http://slproweb.com/products/Win32OpenSSL.html)  

## 1. 安裝憑證

## 2. 綁定網域