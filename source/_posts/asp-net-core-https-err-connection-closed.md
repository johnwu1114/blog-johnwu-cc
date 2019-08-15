---
title: 'ASP.NET Core 2 筆記 - HTTPS ERR_CONNECTION_CLOSED'
author: John Wu
tags:
  - ASP.NET Core
categories:
  - ASP.NET Core
date: 2019-08-12 12:13
featured_image: /images/logo-asp-net-core.png
---

剛剛遇到近期開發的 ASP.NET Core 站台，在本機 MacOS 環境啟動後，瀏覽器用 HTTPS 打開會顯示以下錯誤：  
```
無法連上這個網站  
localhost 拒絕連線。

ERR_CONNECTION_CLOSED
```

<!-- more -->

如圖：
![ASP.NET Core 2 筆記 - HTTPS ERR_CONNECTION_CLOSED - 錯誤訊息](/images/x433.png)

## 解決方式

瀏覽器因為安全性問題，不讓 ASP.NET Core 站台使用 HTTPS，可以透過以下指令把開發憑證清除，再重建：  

```sh
sudo dotnet dev-certs https --clean
dotnet dev-certs https
```

回想一下原因，應該是上週將 MacOS 系統更新後，同時更新一些軟體等造成。(好像有更新 Chrome)  

## 參考

[HTTPS on macOS does not work running from the default ASP.NET Core Web App (MVC) template](https://github.com/dotnet/corefx/issues/31749#issuecomment-423694193)