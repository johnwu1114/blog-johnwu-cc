---
title: 單元測試 - 模擬系統時間 DateTime.Now
author: John Wu
tags:
  - Unit Test
  - Microsoft Fakes
categories:
  - Unit Test
date: 2017-11-22 23:28:00
featured_image: /images/x387.png
---

初寫單元測試的工程師，經常會問到如何解決測試目標中使用外部方法，如系統時間(DateTime.Now)。  
本篇介紹如何透過自製包裝或 Microsoft Fakes 解決單元測試使用外部方法。  

<!-- more -->

以 DateTime.Now 為例，假設以下程式碼是要被測試的目標：
```cs
public static decimal Discount(decimal amount)
{
    var now = DateTime.Now;
    if (now.Month == 1 && now.Day == 1)
    {
        return amount * 0.15m;
    }
    else if (now.Month == 12 && now.Day == 25)
    {
        return amount * 0.2m;
    }
    else if (now.DayOfWeek == DayOfWeek.Sunday)
    {
        return amount * 0.05m;
    }
    return 0;
}
```

## 自製包裝

建立一個 SystemTime 類別重新包裝 DateTime，程式碼如下：
```cs
public static class SystemTime
{
    internal static Func<DateTime> CurrentTime;

    public static DateTime Now
    {
        get
        {
            if (CurrentTime == null)
            {
                Reset();
            }
            return CurrentTime();
        }
    }

    internal static void Reset()
    {
        CurrentTime = () => DateTime.Now;
    }
}
```

自製包裝有一個不便之處，就是要改被測試的目標，必須要把 `var now = DateTime.Now;` 改成 `var now = SystemTime.Now;`。  
如此一來就可以在測試方法中，透過 `SystemTime.CurrentTime` 模擬回傳值。  

測試程式碼如下：  
```cs
[Test]
public void Christmas_Discount()
{
    // Arrange
    decimal expected = 1897.4m;
    decimal amount = 9487m;
    SystemTime.CurrentTime = () => Convert.ToDateTime("2017/12/25");

    // Act
    var actual = _target.Discount(amount);

    // Assert
    Assert.AreEqual(expected, actual);
}
```

> 測試專案要使用其他專案的 `internal` 可以參考這篇：[C# 存取修飾詞 - internal](/article/c-sharp-access-modifiers-internal.html)

## Microsoft Fakes

如果用 **Visual Studio Enterprise** 版本開發的話，可以透過 *Microsoft Fakes* 這個功能模擬外部參考提供的方法。  

在專案的參考中，找到外部參考點右鍵，選擇**新增 Fakes 組件**：  

![C# 單元測試 - 模擬系統時間 DateTime.Now - Microsoft Fakes](/images/x387.png)

新增 Fakes 組件完成後，編輯測試程式碼如下：  
```cs
using Microsoft.QualityTools.Testing.Fakes;

// ...

[Test]
public void Christmas_Discount()
{
    using (ShimsContext.Create())
    {
        // Arrange
        decimal expected = 1897.4m;
        decimal amount = 9487m;
        System.Fakes.ShimDateTime.NowGet = () => Convert.ToDateTime("2017/12/25");

        // Act
        var actual = Discount(amount);

        // Assert
        Assert.AreEqual(expected, actual);
    }
}
```


## 結論

1. 自製包裝比較土法煉鋼的方式，優點是其他語言也能用此方法。缺點是必須要異動被測試目標。  
2. Microsoft Fakes 的好處是不用改原本的程式碼，缺點是口袋要夠深，畢竟要 **Visual Studio Enterprise** 版本才能用。  

如果是新專案沒有歷史包袱的話，我會比較建議一開始就用自製包裝的方式，彈性會比較高。  
舉例來說，我第一次上雲端，原本系統時間都是預期 GMT+08:00，上到 AWS 後才發現系統預設是 UTC，整個時間大亂，我只需要小改 SystemTime 就能解決此問題。如下：  
```cs
public static class SystemTime
{
    private static readonly TimeZoneInfo _timeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
    internal static Func<DateTime> CurrentTime;

    public static DateTime Now
    {
        get
        {
            if (CurrentTime == null)
            {
                Reset();
            }
            return CurrentTime();
        }
    }

    internal static void Reset()
    {
        CurrentTime = () => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _timeZone);
    }
}
```

## 參考

[使用 Microsoft Fakes 在測試期間隔離程式碼](https://msdn.microsoft.com/zh-tw/library/hh549175.aspx?f=255&MSPPError=-2147217396)  