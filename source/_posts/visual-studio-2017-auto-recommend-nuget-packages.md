title: Visual Studio 2017 - 自動推薦 NuGet 套件
author: John Wu
tags:
  - Visual Studio
categories:
  - Visual Studio
  - VS2017
date: 2017-07-05 10:45:30
---
![Visual Studio 2017 - 自動推薦 NuGet 套件](/images/pasted-229.png)

Visual Studio 2017 有一個蠻不錯的功能，在程式碼輸入未安裝過的套件類別名稱，會提示推薦安裝 NuGet 套件。  
但這個功能預設是關閉的，要自己打開這個功能。  

<!-- more -->

## 設定

![Visual Studio 2017 - 設定自動推薦 NuGet 套件 - 1](/images/pasted-230.png)
![Visual Studio 2017 - 設定自動推薦 NuGet 套件 - 2](/images/pasted-231.png)

## 提示效果

例如我在程式碼輸入 **Image**，滑鼠移到燈泡圖示（或游標停在該文字按下 `Ctrl` + `.`），就可以看到 VS2017 提示推薦安裝 NuGet 套件，如下：
![Visual Studio 2017 - 自動推薦 NuGet 套件](/images/pasted-229.png)

## 參考

[Visual Studio 2017 can automatically recommend NuGet packages for unknown types](https://www.hanselman.com/blog/VisualStudio2017CanAutomaticallyRecommendNuGetPackagesForUnknownTypes.aspx)