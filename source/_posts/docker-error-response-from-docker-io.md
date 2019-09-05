---
title: 'Docker - 連線到 *.docker.io 發生錯誤'
author: John Wu
tags:
  - Docker
categories:
  - Docker
date: 2018-01-24 23:20:00
featured_image: /images/featured/docker.png
toc: false
---

執行簡單的 `docker build` 竟然也會錯誤，顯示 Client Timeout 連到 `*.docker.io` 的連線中斷等訊息，導致 Docker CLI 幾乎都不能用。  

<!-- more -->

錯誤訊息大致如下：
```
Sending build context to Docker daemon  887.8kB
Step 1/10 : FROM microsoft/dotnet:sdk AS build-env
Get https://registry-1.docker.io/v2/: net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers)
```
第一個 Step 就死了...

上網查了一下，還不少人遇到一樣的問題，可能性有兩個：  
1. 網路不通，Docker CLI 連不到 `https://registry-1.docker.io/v2/`，需要設定 Proxy 讓 Docker CLI 可以連到 Interner。  
  *(不過我是在家沒被 MIS 擋，網路暢通，不是這個原因。)*  
2. Docker 更新後，可能某些組態設定要重載，把 Docker Service Restart 就好了。  

我是用 Windows GUI 把 Docker Service Restart，如下步驟：  

![Docker - 連線到 *.docker.io 發生錯誤 - Windows Docker Service Restart - 1](/images/b/04.png)  

![Docker - 連線到 *.docker.io 發生錯誤 - Windows Docker Service Restart - 2](/images/b/05.png)  

Linux 或 macOS 的話可以用指令：  
```sh
sudo service docker stop
sudo service docker start
```

如果不是網路原因的話，重啟後應該就正常了。  