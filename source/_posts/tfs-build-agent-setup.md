---
title: TFS - Build Agent 設定
author: John Wu
tags:
  - TFS
  - CI/CD
categories:
  - TFS
date: 2017-05-23 10:17:00
featured_image: /images/a/130.png
---
![TFS - Build Agent - No agent could be found](/images/a/130.png)

最近在測試 Team Foundation Server 2017，Build 的時候發生錯誤：
> No agent could be found with the following capabilities: msbuild, visualstudio, vstest

感覺有點被雷到，筆記一下 TFS Build Agent 的失敗歷程。  

<!-- more -->

## 失敗歷程

我在 TFS 上安裝 Build Agent，啟動成功也順利連上，如下圖：  
![TFS - Build Agent - status](/images/a/133.png)

但 Build 的時候就會發生錯誤：  
> No agent could be found with the following capabilities: msbuild, visualstudio, vstest  

![TFS - Build alert](/images/a/131.png)

如果按確定照 Build，它當然不會過，反正就是死給你看：  
> No agent found in pool Default which satisfies the specified demands:  
> msbuild  
> visualstudio  
> vstest  
> Agent.Version -gtVersion 1.98.1  

![TFS - Build failed](/images/a/132.png)

## 失敗原因

我測試的 TFS 沒有對外網路，所以我直接用 TFS 目錄內的 Build Agent  
> `C:\Program Files\Microsoft Team Foundation Server 15.0\Build`  
TFS 目錄內的 Agent 是 VSO 版本，不知道為什麼不能用，也沒特別去找原因。  

## VSTS Agent 

1. 從 TFS 的 Website 介面，下載最新的 Agent：  
![TFS - Download VSTS Agent](/images/a/134.png)  

2. 放到要註冊的主機上，解壓縮後註冊：  
![TFS - Register VSTS Agent](/images/a/135.png)  

3. TFS 的 Agent pools 就可以看到剛剛註冊成功的 Agent 了  
![TFS - Build Agent - statust](/images/a/136.png)  

4. 改用新版的 Agent 就可以 Build 了
![TFS - Build](/images/a/137.png)  