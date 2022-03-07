---
title: C# 存取修飾詞 - internal
author: John Wu
tags:
  - 'C#'
categories:
  - 'C#'
date: 2017-11-17 22:28:00
featured_image: /images/a/381.png
---

遇過不少 .NET 工程師，都知道 C# 存取修飾詞有四種，`public`、`protected`、`private`及`internal`。  
前三種大部都可以很輕易的回答出來，但知道`internal`的工程師比例卻不高。  
本篇來幫大家複習一下 C# 的存取修飾詞 `internal`。  

<!-- more -->

## 存取範圍

`internal`的存取範圍是相同組件(Assembly)都可以使用，白話一點講就是`internal`可以在同一個`dll`內存取。  
* 類別**預設**的存取修飾詞是 `internal`。  
* 類別成員**預設**的存取修飾詞是 `private`。  

## protected internal

`internal`可以跟`protected`合在一起使用，存取範圍就變成：  
> 相同組件 **或** 子類別都可以存取。  

如下範例：
```cs
namespace AssemblyA
{
    class Parent
    {
        protected internal int Number;
    }

    class Sample
    {
        public void Method()
        {
            var parent = new Parent();
            // 因為 Number 帶有 internal，所以沒繼承也能存取
            parent.Number = 10; 
        }
    }
}

namespace AssemblyB
{
    class Child : AssemblyA.Parent
    {
        public void Method()
        {
          // 因為 Number 帶有 protected，所以在不同組建也能存取
            Number = 20;
        }
    }
}
```

## Friend Assembly

為了符合封裝原則，基本上我們不太希望把不該開放的類別或成員給外部的組件存取，但為了測試專案，不開放存取權限又顯得很難做事。  
這時候我們可以透過 `InternalsVisibleTo` 開放特定的組件也能存取`internal`修飾詞的類別或成員。  

例如我們有 *AssemblyA* 及 *AssemblyA.Tests* 專案，我們希望 *AssemblyA.Tests* 專案可以存取 *AssemblyA* 專案的`internal`類別或成員。

打開 *AssemblyA* 專案底下的 Properties\AssemblyInfo.cs 檔案編輯：

![C# 存取修飾詞 - internal Friend Assembly](/images/a/381.png)

```cs
using System.Runtime.CompilerServices;

//...

[assembly: InternalsVisibleTo("AssemblyA.Tests")]
```

以上設定並不是把 *AssemblyA* 及 *AssemblyA.Tests* 變成同組件，而是：
> *AssemblyA.Tests* **可以**存取 *AssemblyA* 的`internal`類別及成員。  
> *AssemblyA* 依然**不可以**存取 *AssemblyA.Tests* 的`internal`類別及成員。

## 參考

* [Access Modifiers (C# Programming Guide)](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers)  
* [Friend Assemblies (C#)](https://docs.microsoft.com/zh-tw/dotnet/csharp/programming-guide/concepts/assemblies-gac/friend-assemblies)
