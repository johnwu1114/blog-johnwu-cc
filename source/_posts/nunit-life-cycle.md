---
title: NUnit - 測試案例生命週期 Life Cycle
author: John Wu
tags:
  - 'C#'
  - NUnit
  - Unit Test
categories:
  - Unit Test
date: 2017-07-22 22:05:00
featured_image: /images/a/243.png
---
![NUnit - 測試案例生命週期](/images/a/243.png)

寫 Unit Test 不免都要對 Test Case 做一些前置準備或善後處裡。  
了解 Unit Test Framework 的 Life Cycle，可以善用測試案例生命週期，簡化在 Test Case 中的步驟。  
本篇將介紹 NUnit 的測試案例生命週期 Life Cycle。  

<!-- more -->

## NUnit Action

### Constructor

NUnit 測試類別的建構子會第一個被執行。  
通常用於 Constructor Injection。

### Dispose

自己實作 IDisposable 釋放 Unmanaged 資源。  
通常不會用到 Dispose，Dispose 的功能性跟 OneTimeTearDown 相似，通常會用 OneTimeTearDown。

### OneTimeSetUp

在該測試類別的所有測試案例執行前，會執行此方法。  
通常用來做測試案例共用的初始化資料。  

### OneTimeTearDown

在該測試類別的所有測試案例完成後，會執行此方法。  
通常用來做測試案例共用的資料清除或資源釋放。  

### SetUp

每個測試案例開始前，會執行此方法。  
通常用來還原測試案例初始化狀態，確保測試案例不互相干擾。  

### TearDown

每個測試案例完成後，會執行此方法。  
通常用來清除測試案例的狀態，確保測試案例不互相干擾。  

### Test

測試案例

## 生命週期

![NUnit - 測試案例生命週期](/images/a/243.png)

## 範例程式

```cs
using System;
using System.Diagnostics;
using NUnit.Framework;

namespace Example.NUnit
{
    [TestFixture]
    public class Lifecycle : IDisposable
    {
        public Lifecycle()
        {
            Debug.WriteLine("1. Constructor");
        }

        public void Dispose()
        {
            Debug.WriteLine("9. Dispose");
        }

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            Debug.WriteLine("2. OneTimeSetUp");
        }

        [OneTimeTearDown]
        public void OneTimeTearDown()
        {
            Debug.WriteLine("10. OneTimeTearDown");
        }

        [SetUp]
        public void TestSetUp()
        {
            Debug.WriteLine("3,6. SetUp");
        }

        [TearDown]
        public void TestTearDown()
        {
            Debug.WriteLine("5,8. TearDown");
        }

        [Test]
        public void FirstTest()
        {
            Debug.WriteLine("4. FirstTest");
        }

        [Test]
        public void SecondTest()
        {
            Debug.WriteLine("7. SecondTest");
            Assert.Fail();
        }
    }
}
```
> NUnit 預設會依照測試案例名稱排序執行，所以 FirstTest 會比 SecondTest 先執行。