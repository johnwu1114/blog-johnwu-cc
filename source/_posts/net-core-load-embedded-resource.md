---
title: .NET Core - 從 DLL 取得內嵌資源 (Embedded Resource)
author: John Wu
tags:
  - .NET Core
  - 'C#'
  - Assembly
categories:
  - .NET Core
date: 2017-09-12 21:53:00
featured_image: /images/x341.png
---
![.NET Core - 從 DLL 取得內嵌資源 (Embedded Resource) - 內嵌資源名稱](/images/x341.png)

設定成內嵌資源(Embedded Resource)的檔案，在編譯時會被封裝到 DLL 中。編譯時期若沒有參考的話，就需要使用 Assembly Load 動態載入取得內嵌資源。  
本篇將介紹 .NET Core 如何從在執行階段，動態載入 DLL 取得 Embedded Resource。  

<!-- more -->

## 1. 建立內嵌資源

此範例我新增了三個檔案：
```yml
Resources\
    Sample.resx
Sample.json
Sample.xml
```

可以隨意新增靜態檔案，再把它設定成內嵌資源，如下圖：  
![.NET Core - 從 DLL 取得內嵌資源 (Embedded Resource) - 設定內嵌資源](/images/x340.png)

## 2. 內嵌資源名稱

編譯後看 Binary 輸出的資料夾，可以確定沒看到這三個檔案。  
用反編譯的軟體可以確認這三個檔案在 Example.dll 之中。
![.NET Core - 從 DLL 取得內嵌資源 (Embedded Resource) - 內嵌資源名稱](/images/x341.png)

從上圖可以看出，內嵌資源經編譯後，都被放到了 `Resources` 的目錄中，所有的檔名都改變了，規則如下：
* `namespace名稱`.`資料夾名稱`.`檔名`  
> 資料夾若很多層，每層都會用 `.` 隔開。
* `Sample.resx` 資源檔比較特別，它的檔名會變成 `Sample.resources`  
> 資源檔除了檔名改變之外，它還會自動建立相關的 Class，如圖：

![.NET Core - 從 DLL 取得內嵌資源 (Embedded Resource) - 資源檔](/images/x342.png)


## 3. AssemblyLoadContext

AssemblyLoadContext 可以幫助載入 DLL，使用方式如下：
```cs
using System.IO;
using System.Resources;
using System.Runtime.Loader;

// ...

// 透過實體路徑載入 DLL
var assemblyPath = Path.Combine(Directory.GetCurrentDirectory(), "Example.dll");
var assembly = AssemblyLoadContext.Default.LoadFromAssemblyPath(assemblyPath);

// 取得該 DLL 所有的內嵌資源名稱
var resources = assembly.GetManifestResourceNames();

// 依照資源名稱讀取內容
var stream = assembly.GetManifestResourceStream("Example.Sample.json");
using (var reader = new StreamReader(stream, Encoding.UTF8))
{
    var json = reader.ReadToEnd();
    // ...
}

// 依照資源檔類別讀取內容
var resourceManager = new ResourceManager("Example.Resources.Sample", assembly);
var name = resourceManager.GetString("Name");
// ...
```

## 參考

[ASP.NET Core Embedded Resource](https://codeopinion.com/asp-net-core-embedded-resource/)