title: Visual Studio 2017 - 離線安裝
author: John Wu
tags:
  - Visual Studio
  - Windows
categories:
  - Visual Studio
date: 2017-05-22 19:27:30
---
最近在公司內部 Server 安裝 Visual Studio 2017，因為沒有對外網路，所以只能用離線版安裝。  
筆記一下 Visual Studio 2017 的離線安裝方法。  

<!-- more -->

## 下載安裝檔

1. 先用有網路的電腦，到官方下載安裝檔：
 * [vs_community.exe](https://aka.ms/vs/15/release/vs_community.exe)  
 * [vs_professional.exe](https://aka.ms/vs/15/release/vs_professional.exe)  
 * [vs_enterprise.exe](https://aka.ms/vs/15/release/vs_enterprise.exe)  

2. 用指令執行下載離線安裝檔 `{安裝檔名稱}.exe --layout {存放位置} --add {需要的模組} --lang {需要的語言}`  
```bash
vs_enterprise.exe --layout "D:\vs2017 enterprise offline" --lang en-US
```
 > 不指定模組全抓的話，大約有 28.3 GB  

## 離線安裝

可以用遠端分享或者是直接複製到目標電腦，只要能開的到檔案就好。  
1. 首先要安裝憑證，在下載位置中的 `certificates` 資料夾，裡面的三個憑證都要安裝。  
 > 沒安裝憑證的話，會一直嘗試連外部網路。  

![Visual Studio 2017 - install certificates - step 1](/images/pasted-123.png)
![Visual Studio 2017 - install certificates - step 2](/images/pasted-124.png)
![Visual Studio 2017 - install certificates - step 3](/images/pasted-125.png)
![Visual Studio 2017 - install certificates - step 4](/images/pasted-126.png)
![Visual Studio 2017 - install certificates - step 5](/images/pasted-127.png)
 
2. 安裝完成後，就可以用 vs_enterprise.exe 安裝了。  
![Visual Studio 2017 - 離線安裝](/images/pasted-128.png)
 
## 參考

[Install Visual Studio 2017 on low bandwidth or unreliable network environments](https://docs.microsoft.com/en-us/visualstudio/install/install-vs-inconsistent-quality-network)