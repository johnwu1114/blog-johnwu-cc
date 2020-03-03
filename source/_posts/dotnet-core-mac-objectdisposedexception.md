---
title: '.NET Core - 在 Mac 開發階段發生 ObjectDisposedException'
author: John Wu
tags:
  - '.NET Core'
categories:
  - '.NET Core'
date: 2020-01-16 16:06
featured_image: /images/b/54.png
---

在 Mac 使用 Rider 開發時，突然遇到執行測試失敗，顯示的錯誤訊息如下：  

```txt
System.ObjectDisposedException: Cannot access a disposed object.
Object name: 'IServiceProvider'.
```

前一刻才剛跑過所有的測試，突然間就死一片，如圖：  

![.NET Core - System.ObjectDisposedException: Cannot access a disposed object](/images/b/54.png)

<!-- more -->

主要原因是本機整合測試時，為了要使用 `IServiceProvider`，所以建立出 `IHostBuilder` 實體。  
但很不幸的是這個 `Host` 死在背景，而且站著資源放不掉，所以重跑測試時一直無法 Build 出新的 Host，導致 `IServiceProvider` 不能被使用。

可透過以下指令找出在背景的 dotnet process，在強制刪除，如下：  

```sh
# 找到死在背景的 dotnet process
ps x | grep "dotnet exec"

# 強制停止該 dotnet process
kill -9 <pid>

# 整合以上兩行
kill -9 $(ps -ax | grep "dotnet exec" | awk '{ print $1 }') &>2
```

![.NET Core - 開發階段無法取用 Disposed Object - kill dotnet process](/images/b/55.png)

刪除後又回復正常了。  

![.NET Core - 開發階段無法取用 Disposed Object Success](/images/b/56.png)
