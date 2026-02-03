---
title: Windows Server - 踢掉遠端桌面 Idle 的 Session
author: John Wu
tags:
  - Windows Server
categories:
  - Windows Server
date: 2017-10-20 16:50:00
featured_image: /images/a/256.png
---
![Windows Server - 踢掉遠端桌面 Idle 的 Session - Group Policy - 2](/images/a/368.png)

常常有人遠端桌面連到 Windows Server 就忘記登出，不然就是掛在那邊沒做事。  
偏偏 Windows Server 遠端桌面就只有兩個 Serssion，占著茅坑不拉屎，害其它人都連不進去。  
可以改 Computer Policy 把 Idle 的人都踢掉。  

<!-- more -->

## Group Policy

在 Widnows Server 找到 `Edit Group Policy` 中文是 `編輯群組原則`：  

![Windows Server - 踢掉遠端桌面 Idle 的 Session - Edit Group Policy](/images/a/366.png)

## Computer Configuration

左邊 `Computer Configuration` 找到以下路徑設定：
* 英文：Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Session Host\Session Time Limits  
* 中文：系統管理範本\Windows 元件\遠端桌面服務\遠端桌面工作階段主機\工作階段時間限制  

![Windows Server - 踢掉遠端桌面 Idle 的 Session - Group Policy - 1](/images/a/367.png)
![Windows Server - 踢掉遠端桌面 Idle 的 Session - Group Policy - 2](/images/a/368.png)

## Disconnected Sessions

當遠端桌面中斷連線 N 分鐘後，就會把該 Session 清掉。  

`Set time limit for disconnected sessions`  

![Windows Server - 踢掉遠端桌面 Idle 的 Session - Disconnected Sessions](/images/a/369.png)

## Idle Sessions

當遠端桌面的使用者閒置 N 分鐘，就會把該 Session 清掉。  

`Set time limit for active but idle Remote Desktop Services sessions`  

![Windows Server - 踢掉遠端桌面 Idle 的 Session - Idle Sessions](/images/a/370.png)

## 參考

https://technet.microsoft.com/en-us/library/cc754272(v=ws.11).aspx