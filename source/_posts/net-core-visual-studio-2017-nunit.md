title: .NET Core - Visual Studio 2017 使用 NUnit
author: John Wu
tags:
  - .NET Core
  - 'C#'
  - Unit Test
  - NUnit
  - Visual Studio
categories:
  - .NET Core
date: 2017-06-08 12:44:00
---
![NUnit Test Result](/images/pasted-185.png)

NUnit 是很多 .NET 工程師的必備良辦，寫 .NET Core 當然也少不了它。  
本篇將介紹在 Visual Studio 2017 .NET Core 專案使用 NUnit。  

<!-- more -->

## 安裝 NuGet 套件

用 Visual Studio 2017 開啟的 .NET Core Unit Test 專案，很直覺的從 NuGet 找到 NUnit 並安裝：

在 NuGet 管理找到以下套件並安裝：  
1. Microsoft.NET.Test.Sdk  
2. NUnit  
3. NUnit3TestAdapter  

但編譯時確無法錯誤訊息(中文版)，如下：
```
測試探索程式 'NUnit3TestDiscoverer' 載入測試時發生例外狀況。例外狀況: Could not load file or assembly 'System.Xml, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089'. 系統找不到指定的檔案。
```

錯誤訊息(英文版)：
```
An exception occurred while test discoverer 'NUnit3TestDiscoverer' was loading tests. Exception: Could not load file or assembly 'System.Xml, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089'. The system cannot find the file specified.
```

## 更新 NuGet 套件

查了一下原因，目前 Visual Studio 2017 官方還沒有支援 NUnit，所以要靠第三方的套件來執行。  

再次打開 NuGet 管理，並勾選搶鮮版，找到以下套件並安裝：  
1. dotnet-test-nunit  
2. NUnit3TestAdapter  

![NuGet install dotnet-test-nunit](/images/pasted-184.png)

## 執行結果

安裝完就可以順利執行 NUnit 的 Unit Test 了！
![NUnit Test Result](/images/pasted-185.png)