---
title: 免費 SSL 申請
author: John Wu
tags:
  - SSL
  - HTTPS
categories:
  - Web Development
date: 2017-06-29 10:29:00
featured_image: /images/pasted-210.png
---
![免費 SSL 申請 - SSL For Free](/images/pasted-210.png)

網站安全性越做越高，不免都要使用 HTTPS 加密連線，但 SSL 憑證又很貴...  
真的不想花錢買的話，還是有免費的可以用。  
本篇將介紹申請免費的 SSL 憑證。  

<!-- more -->

## 1. SSL 憑證申請
 
以前我是用 StartCom 的免費 SSL，申請一次可以使用一年。  
但 2016 年 StartCom 被 Mozilla FireFox、Apple Safari、Google Chome 等主流瀏覽器黑名單了，所以就改用 SSL For Free。  
SSL For Free 跟 StartCom 一樣都支援免費的 SSL 憑證申請，但 SSL For Free 憑證的有效期只有 90 天，每 90 天就要做一次 Renew。(免費的就別要求太多吧！)  

打開 SSL For Free 的網址：https://www.sslforfree.com/  
在首頁就可以看到輸入網址的畫面，輸入**自有網域**的網址，一次只能申請一個。  
例如：我的網域是 `johnwu.cc`，我要申請的是 `demo.johnwu.cc`。  
![免費 SSL 申請 - Enter domain](/images/pasted-211.png)

## 2. 驗證網域

SSL For Free 要確認該網域是你所雍有，才會發憑證給你。  
驗證網域有三種方式：  
1. FTP 驗證  
2. 檔案驗證  
3. DNS 驗證  

> 只要選其中一種就可以  

### 2.1. FTP 驗證

要申請的網域有 FTP 的話，可以在這邊填入 FTP 登入資訊，讓 SSL For Free 把憑證上傳到該 Server。  

![免費 SSL 申請 - FTP Validation](/images/pasted-212.png)

> 如果有開防火牆，記得設定白名單，如上圖 `67.222.10.211`。

### 2.2. 檔案驗證

從 SSL For Free 網站下載驗證檔，再把驗證檔放到 Web Server 指定位置。  
通過驗證才能下載憑證。  

![免費 SSL 申請 - File Validation - 1](/images/pasted-213.png)
![免費 SSL 申請 - File Validation - 2](/images/pasted-214.png)
1. 點擊圖中的 `Download File #1` 下載驗證檔。  
2. 把驗證檔放到 Web Server 上的 /.well-known/acme-challenge/ 路徑。  
 * 例：`http://{domain}/.well-known/acme-challenge/{驗證檔}`  
 * 由於路徑中多了一個 `.` 會導致該連結變成 404 Not Found，可以在 Web.config 加入 mimeMap 避免這個問題：
 ```xml
<configuration>
  <!-- ... -->
  <system.webServer>
    <!-- ... -->
    <staticContent>
      <!-- ... -->
      <mimeMap fileExtension="." mimeType="text/plain" />
    </staticContent>
  </system.webServer>
</configuration>
```
3. 點擊 `Download SSL Certificate`

### 2.3. DNS 驗證

![免費 SSL 申請 - DNS Validation - 1](/images/pasted-215.png)
![免費 SSL 申請 - DNS Validation - 2](/images/pasted-216.png)
1. 到網域的 DNS 管理工具，加入 TXT 轉址紀錄。  
> 例如：我是使用 Godaddy 管理 DNS，加入 TXT 轉址紀錄如下圖：  
![Godaddy Add record](/images/pasted-217.png)  

2. DNS 生效時間比較不一定，你可以點擊 3.1. 的 `Verify _acme-challenge.{domain}` 看生效了沒。  
 * 已生效會顯示 DNS 資訊，如下圖：
 ![DNS Validation](/images/pasted-218.png)  
 * 未生效會顯示：
 > No TXT Record Found. Set the TTL to 1 second or if you cannot set the TTL then you must wait the TTL (in seconds) so it updates before verifying the domain.  

3. 生效後點擊 `Download SSL Certificate`

## 3. 下載憑證

經過驗證後，就可以下載憑證囉～  
下圖是我用 DNS 驗證完成後，顯示的結果：  

 ![Download SSL Certificate](/images/pasted-219.png)  

> 憑證可以從文字框中複製，也可以點擊 `Download All SSL Certificate Files` 下載。  
> 有效期限為 90 天，如果有註冊帳號，它會在到期日的前一週 Email 通知你。  