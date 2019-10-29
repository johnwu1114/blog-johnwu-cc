---
title: 'ASP.NET Core 3 系列 - 注入多個相同的介面 (Interface)'
author: John Wu
tags:
  - ASP.NET Core 3
  - ASP.NET Core
categories:
  - ASP.NET Core
date: 2019-10-29 23:52
featured_image: /images/b/51.png
---

通常在使用 ASP.NET Core 依賴注入 (Dependency Injection, DI) 都是一個介面對應一個實作類別。  
若有多個類別時做相同的介面時，注入的方式就會有點變化。  
本篇將介紹 ASP.NET Core 依賴注入多個相同的介面 (Interface)  

<!-- more -->

## 前置準備

以下介面作為範例：

```cs
public enum PayType
{
    Alipay,
    CreditCard,
    LinePay
}

public interface IWalletService
{
    void Debit(decimal amount);
}

public class AlipayService : IWalletService
{
    public void Debit(decimal amount)
    {
        // 從支付寶扣錢
    }
}

public class CreditCardService : IWalletService
{
    public void Debit(decimal amount)
    {
        // 從信用卡扣錢
    }
}

public class LinePayService : IWalletService
{
    public void Debit(decimal amount)
    {
        // 從 Line Pay 扣錢
    }
}
```

## 服務註冊

用相同的介面，註冊不同的實作類別：  

```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc();

        // 註冊 Services
        services.AddSingleton<IWalletService, AlipayService>();
        services.AddSingleton<IWalletService, CreditCardService>();
        services.AddSingleton<IWalletService, LinePayService>();
    }
}
```

## Service Injection

在 Constructor Injection 時用 `IEnumerable<T>` 注入，便可取得相同介面的全部實例，再依照使用情境選擇要用的實例。範例如下：  

```cs
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    public class ShoppingCartController : Controller
    {
        private readonly IEnumerable<IWalletService> _walletServices;

        public ShoppingCartController(IEnumerable<IWalletService> walletServices)
        {
            _walletServices = walletServices;
        }

        public IActionResult Checkout(PayType payType, decimal amount)
        {
            var walletService = _walletServices.Single(x => x.GetType().Name.StartsWith(payType.ToString()));
            walletService.Debit(amount);
            return Ok();
        }
    }
}
```

示意圖如下：  

![ASP.NET Core 3 系列 - 注入多個相同的介面 (Interface) - 多介面注入](/images/b/52.png)  

> `注意！`  
> 通常只建議 **Singleton** 類型的服務這樣使用，因為使用 **Transient** 或 **Scoped** 類型的服務，注入時會 `new` 新的實例，若沒用到的話，就變成不必要的效能耗損。  

如果服務註冊用相同的介面，註冊不同的實作類別，Constructor Injection 時不是用 `IEnumerable<T>` 注入，就只會得到最後一個註冊的類別，如上例會得到 `LinePayService` 的實例。  

示意圖如下：  

![ASP.NET Core 3 系列 - 注入多個相同的介面 (Interface) - 單一介面注入](/images/b/53.png)  
