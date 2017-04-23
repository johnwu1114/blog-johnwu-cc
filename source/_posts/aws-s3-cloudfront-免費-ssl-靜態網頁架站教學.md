title: AWS S3 + CloudFront - 免費 SSL 靜態網頁架站教學
author: John Wu
tags:
  - AWS
  - S3
  - CloudFront
  - HTTPS
  - SSL
categories:
  - AWS
date: 2017-04-24 00:52:21
---
之前把部落格架在 GitHub 上面，但 GitHub 不支援自訂網域使用 HTTPS，我又不想自己架伺服器搞 SSL，因為申請 SSL 憑證又很貴...  
後來找到 AWS 可以申請免費 SSL 憑證(只支援 Elastic Beanstalk 跟 CloudFront)，於是我就立馬把部落格從 GitHub 跳槽到 AWS S3 + CloudFront。  
由於在綁網域的時候，自己有點被搞混，搞了一整天才用好，所以寫了這一篇，把綁網域的部分詳細記錄下來。

<!-- more -->

## S3

### 建立 Bucket

#### Step 1
![開啟 S3 管理介面](/images/pasted-11.png)

#### Step 2
名稱自訂，要打什麼都可以，不需要跟網域一樣。  
Region 的話，我個人是覺得在台灣連日本比較快一點。  
(我三年前測的，有錯請修正我。)
![建立 Bucket - 1](/images/pasted-60.png)

#### Step 3
![建立 Bucket - 2](/images/pasted-66.png)

#### Step 4
要把 Everyone Read 權限打開，不然沒人連的到你的網站。
![建立 Bucket - 3](/images/pasted-67.png)

#### Step 5
![建立 Bucket - 4](/images/pasted-68.png)


### 啟用靜態網站
#### Step 1
![管理 Bucket](/images/pasted-70.png)
#### Step 2
![啟用 Static website hosting](/images/pasted-71.png)
#### Step 3
![設定 Static website hosting](/images/pasted-72.png)
> Endpoint 是要綁定 CloudFront 使用的，綁錯的話 SSL 是沒辦法使用的．

## CloudFront
### 建立 Distribution
#### Step 1
![開啟 CloudFront 管理介面](/images/pasted-90.png)
#### Step 2
![開啟 CloudFront 管理介面](/images/pasted-73.png)
#### Step 3
![建立 Distribution - 1](/images/pasted-74.png)
#### Step 4
![建立 Distribution - 2](/images/pasted-75.png)

### 建立 SSL 憑證
#### Step 1
![建立 SSL 憑證 - 1](/images/pasted-80.png)
#### Step 2
![建立 SSL 憑證 - 2](/images/pasted-76.png)
#### Step 3
![建立 SSL 憑證 - 3](/images/pasted-77.png)
#### Step 4
![建立 SSL 憑證 - 4](/images/pasted-78.png)
#### Step 5
AWS 會發送認證信給 Domain 管理員，請務必要有以下帳號能收信。
![建立 SSL 憑證 - 5](/images/pasted-79.png)
#### Step 6
![驗證網域 - 1](/images/pasted-81.png)
#### Step 7
![驗證網域 - 2](/images/pasted-82.png)
#### Step 8
![驗證網域 - 3](/images/pasted-83.png)
#### Step 9
![驗證網域 - 4](/images/pasted-84.png)

### 設定 Distribution
#### Step 1
Price Class 我是選亞州，因為比較便宜 XD  
CNAMEs，除了在這邊綁定外，記得也要到你購買網域的 DNS 管理設定。  
指向：**xxxxxxxxxxxx.cloudfront.net**。  
網域驗證通過的話，就可以選擇剛剛建立的憑證了。
![設定 Domain 及 SSL 憑證](/images/pasted-85.png)
#### Step 2
沒設 Default Root Object 的話，在 root 底下就一定要打完整的檔名。例如：
* 沒設定
 * https://blog.johnwu.cc/ (Not found)
 * https://blog.johnwu.cc/index.html (Pass)
* 有設定
 * https://blog.johnwu.cc/ (Pass)
 * https://blog.johnwu.cc/index.html (Pass)
![設定預設頁面](/images/pasted-86.png)
#### Step 3
看到 Domain Name 的 **xxxxxxxxxxxx.cloudfront.net**，這就是要用來綁 DNS CNAME 的。
![綁定 Static Website Hosting - 1](/images/pasted-87.png)
#### Step 4
把 Origin Domain Name 設定成 S3 **Static Website Hosting 的 Endpoint**。
![綁定 Static Website Hosting - 1](/images/pasted-88.png)  

> Step 3 & Step 4 要綁的 Domain 不要設錯喔！

## 完成
上傳你的 index.html 到 S3，就可以成功看到你的 domain 變 HTTPS 了～～
![自訂網域使用SSL成功](/images/pasted-89.png)
