title: Browser prompts for credentials
author: John Wu
tags:
  - TFS
  - Team Foundation Server
categories:
  - TFS
date: 2017-03-28 22:07:00
---
最近在測試Team Foundation Server 2017，用Browser登入後，只要進到特定頁面就會一直跳出需要驗證，如下：

> 需要驗證  
> http://{doamin} 要求提供使用者名稱和密碼。您與這個網站建立了非私人連線。  
  
> Authentication Required  
> The server http://{doamin} requires a username and password.

![](/images/pasted-0.png)

# 解法:

1. 打開IE -> 工具 -> 網際網路選項  
Open IE -> Tools -> Internet Options  

![](/images/pasted-1.png)

2. 安全性 -> 自訂等級 -> 使用者驗證 -> 使用目前的使用者名稱及密碼來自動登入 -> 確定  
Security -> Custom Level -> User Authentication -> Automatic Logon with current user name and password -> OK  

![](/images/pasted-17.png)