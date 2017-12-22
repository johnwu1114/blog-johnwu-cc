---
title: '[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入 (Dependency Injection)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-23 00:17
featured_image: /images/i09-1.png
---

ASP.NET Core 使用了大量的依賴注入 (Dependency Injection, DI)，把控制翻轉 (Inversion Of Control, IoC) 運用的相當落實。
DI 可算是 ASP.NET Core 最精華的一部分，有用過 Autofac 或類似的 DI Framework 對此應該不陌生。  
本篇將介紹 ASP.NET Core 的依賴注入(Dependency Injection)。  

<!-- more -->

## DI 容器介紹

在沒有使用 DI Framework 的情況下，假設在 UserController 要呼叫 UserLogic，會直接在 UserController 實例化 UserLogic，如下：  
*(xxxLogic 邏輯層分層命名，有興趣可以參考這篇：[John Wu's Blog - 軟體分層架構模式](https://blog.johnwu.cc/article/software-layered-architecture-pattern.html))*  
```cs
public class UserLogic {
    public void Create(User user) {
        // ...
    }
}

public class UserController : Controller {
    public void Register(User user){
        var logic = new UserLogic();
        logic.Create(user);
        // ...
    }
}
```

以上程式基本上沒什麼問題，但程式相依性就差了點。UserController **必須** 要依賴 UserLogic 才可以運作，就算拆出介面改成：  

```cs
public interface IUserLogic {
    void Create(User user);
}

public class UserLogic : IUserLogic {
    public void Create(User user) {
        // ...
    }
}

public class UserController : Controller {
    private readonly IUserLogic _userLogic;

    public UserController() {
        _userLogic = new UserLogic();
    }

    public void Register(User user){
        _userLogic.Create(user);
        // ...
    }
}
```
UserController 與 UserLogic 的相依關係只是從 Action 移到建構子，依然還是很強的相依關係。  

ASP.NET Core 透過 DI 容器，切斷這些相依關係，實例的產生不會是在使用方(指上例 UserController 建構子的 `new`)，而是在 DI 容器。  
DI 容器的註冊方式也很簡單，在 `Startup.ConfigureServices` 註冊。如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc();
    }
}
```
> **services** 就是一個 DI 容器。  
 此例把 MVC 的服務註冊到 DI 容器，等到需要用到 MVC 服務時，才從 DI 容器取得物件實例。  

基本上要注入到 Service 的類別沒什麼限制，除了靜態類別。  
以下範例程式就只是一般的 Class 繼承 Interface：  
```cs
public interface ISample
{
    int Id { get; }
}

public class Sample : ISample
{
    private static int _counter;
    private int _id;

    public Sample()
    {
        _id = ++_counter;
    }

    public int Id => _id;
}
```

要注入的 Service 需要在 `Startup.ConfigureServices` 中註冊實做類別。如下：  

*Startup.cs*
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.AddScoped<ISample, Sample>();
    }
}
```
* 第一個泛型為注入的類型  
 建議用 Interface 來包裝，這樣在才能把相依關係拆除。  
* 第二個泛型為實做的類別  

## DI 運作方式

ASP.NET Core 的 DI 是採用 Constructor Injection，也就是說會把實例化的物件從建構子傳入。  
如果要取用 DI 容器內的物件，只要在建構子加入相對的 Interface 即可。例如：  

*Controllers\HomeController.cs*
```cs
public class HomeController : Controller
{
    private readonly ISample _sample;

    public HomeController(ISample sample)
    {
        _sample = sample;
    }

    public string Index() {
        return $"[ISample]\r\n"
             + $"Id: {_sample.Id}\r\n"
             + $"HashCode: {_sample.GetHashCode()}\r\n"
             + $"Tpye: {_sample.GetType()}";
    }
}
```

輸出內容如下：
```
[ISample]
Id: 1
HashCode: 14145203
Tpye: MyWebsite.Sample
```

ASP.NET Core 實例化 Controller 時，發現建構子有 ISample 這個類型的參數，就把 Sample 的實例注入給該 Controller。  
> 每個 Request 都會把 Controller 實例化，所以 DI 容器會從建構子注入 ISample 的實例，把 sample 存到欄位 _sample 中，就能確保 Action 能夠使用到被注入進來的 ISample 實例。  

注入實例過程，情境如下：  

![[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入(Dependency Injection) - 注入實例](/images/i09-4.png)

## Service 生命週期

註冊在 DI 容器的 Service 有分三種生命週期：  
* **Transient**  
 每次注入時，都重新 `new` 一個新的實例。  
* **Scoped**  
 每個 **Request** 都重新 `new` 一個新的實例，同一個 **Request** 不管經過多少個 Pipeline 都是用同一個實例。上例所使用的就是 **Scoped**。  
* **Singleton**  
 被實例化後就不會消失，程式運行期間只會有一個實例。  

小改一下 Sample 類別的範例程式：  
```cs
public interface ISample
{
    int Id { get; }
}

public interface ISampleTransient : ISample
{
}

public interface ISampleScoped : ISample
{
}

public interface ISampleSingleton : ISample
{
}

public class Sample : ISampleTransient, ISampleScoped, ISampleSingleton
{
    private static int _counter;
    private int _id;

    public Sample()
    {
        _id = ++_counter;
    }

    public int Id => _id;
}
```

在 `Startup.ConfigureServices` 中註冊三種不同生命週期的服務。如下：  

*Startup.cs*
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddTransient<ISampleTransient, Sample>();
        services.AddScoped<ISampleScoped, Sample>();
        services.AddSingleton<ISampleSingleton, Sample>();
        // Singleton 也可以用以下方法註冊
        // services.AddSingleton<ISampleSingleton>(new Sample());
    }
}
```

## Service Injection

> **只要是透過 ASP.NET Core 產生實例的類別，都可以在建構子定義型態注入**。  

所以 Controller、View、Filter、Middleware 或自訂的 Service 等都可以被注入。  
此篇我只用 Controller、View、Service 做為範例。  

### Controller

在 HomeController 中注入這三個 Service：  

*Controllers\HomeController.cs*  
```cs
public class HomeController : Controller
{
    private readonly ISample _transient;
    private readonly ISample _scoped;
    private readonly ISample _singleton;

    public HomeController(
        ISampleTransient transient,
        ISampleScoped scoped,
        ISampleSingleton singleton)
    {
        _transient = transient;
        _scoped = scoped;
        _singleton = singleton;
    }

    public IActionResult Index() {
        ViewBag.TransientId = _transient.Id;
        ViewBag.TransientHashCode = _transient.GetHashCode();

        ViewBag.ScopedId = _scoped.Id;
        ViewBag.ScopedHashCode = _scoped.GetHashCode();

        ViewBag.SingletonId = _singleton.Id;
        ViewBag.SingletonHashCode = _singleton.GetHashCode();
        return View();
    }
}
```

*Views\Home\Index.cshtml*  
```html
<table border="1">
    <tr><td colspan="3">Cotroller</td></tr>
    <tr><td>Lifetimes</td><td>Id</td><td>Hash Code</td></tr>
    <tr><td>Transient</td><td>@ViewBag.TransientId</td><td>@ViewBag.TransientHashCode</td></tr>
    <tr><td>Scoped</td><td>@ViewBag.ScopedId</td><td>@ViewBag.ScopedHashCode</td></tr>
    <tr><td>Singleton</td><td>@ViewBag.SingletonId</td><td>@ViewBag.SingletonHashCode</td></tr>
</table>
```

輸出內容如下：  

![[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入(Dependency Injection) - Service 生命週期 - Controller](/images/i09-1.png)  
從左到又打開頁面三次，可以發現 **Singleton** 的 Id 及 HashCode 都是一樣的，此例還看不太出來 **Transient** 及 **Scoped** 的差異。

Service 實例產生方式：  

![[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入(Dependency Injection) - 實例產生動畫](/images/pasted-209.gif)

圖例說明：
* **A** 為 **Singleton** 物件實例  
 一但實例化，就會一直存在於 DI 容器中。  
* **B** 為 **Scoped** 物件實例  
 每次 **Request** 就會產生新的實例在 DI 容器中，讓同 **Request** 週期的使用方，拿到同一個實例。  
* **C** 為 **Transient** 物件實例  
 只要跟 DI 容器請求這個類型，就會取得新的實例。

### View

View 注入 Service 的方式，直接在 `*.cshtml` 使用 `@inject`：  

*Views\Home\Index.cshtml*  
```html
@using MyWebsite

@inject ISampleTransient transient
@inject ISampleScoped scoped
@inject ISampleSingleton singleton

<table border="1">
    <tr><td colspan="3">Cotroller</td></tr>
    <tr><td>Lifetimes</td><td>Id</td><td>Hash Code</td></tr>
    <tr><td>Transient</td><td>@ViewBag.TransientId</td><td>@ViewBag.TransientHashCode</td></tr>
    <tr><td>Scoped</td><td>@ViewBag.ScopedId</td><td>@ViewBag.ScopedHashCode</td></tr>
    <tr><td>Singleton</td><td>@ViewBag.SingletonId</td><td>@ViewBag.SingletonHashCode</td></tr>
</table>
<hr />
<table border="1">
    <tr><td colspan="3">View</td></tr>
    <tr><td>Lifetimes</td><td>Id</td><td>Hash Code</td></tr>
    <tr><td>Transient</td><td>@transient.Id</td><td>@transient.GetHashCode()</td></tr>
    <tr><td>Scoped</td><td>@scoped.Id</td><td>@scoped.GetHashCode()</td></tr>
    <tr><td>Singleton</td><td>@singleton.Id</td><td>@singleton.GetHashCode()</td></tr>
</table>
```

輸出內容如下：  

![[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入(Dependency Injection) - Service 生命週期 - View](/images/i09-2.png)  

從左到又打開頁面三次，**Singleton** 的 Id 及 HashCode 如前例是一樣的。  
**Transient** 及 **Scoped** 的差異在這次就有明顯差異，**Scoped** 在同一次 Request 的 Id 及 HashCode 都是一樣的，如紅綠籃框。

### Service

簡單建立一個 CustomService，注入上例三個 Service，程式碼類似 HomeController。如下：  

*Services\CustomService.cs*
```cs
public class CustomService
{
    public ISample Transient { get; private set; }
    public ISample Scoped { get; private set; }
    public ISample Singleton { get; private set; }

    public CustomService(ISampleTransient transient,
        ISampleScoped scoped,
        ISampleSingleton singleton)
    {
        Transient = transient;
        Scoped = scoped;
        Singleton = singleton;
    }
}
```

註冊 CustomService  

*Startup.cs*
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.AddScoped<CustomService, CustomService>();
    }
}
```
> 第一個泛型也可以是類別，不一定要是介面。  
 缺點是使用方以 Class 作為相依關係，變成強關聯的依賴。  

在 View 注入 CustomService：  

*Views\Home\Index.cshtml*
```html
@using MyWebsite

@inject ISampleTransient transient
@inject ISampleScoped scoped
@inject ISampleSingleton singleton
@inject CustomService customService

<table border="1">
    <tr><td colspan="3">Cotroller</td></tr>
    <tr><td>Lifetimes</td><td>Id</td><td>Hash Code</td></tr>
    <tr><td>Transient</td><td>@ViewBag.TransientId</td><td>@ViewBag.TransientHashCode</td></tr>
    <tr><td>Scoped</td><td>@ViewBag.ScopedId</td><td>@ViewBag.ScopedHashCode</td></tr>
    <tr><td>Singleton</td><td>@ViewBag.SingletonId</td><td>@ViewBag.SingletonHashCode</td></tr>
</table>
<hr />
<table border="1">
    <tr><td colspan="3">View</td></tr>
    <tr><td>Lifetimes</td><td>Id</td><td>Hash Code</td></tr>
    <tr><td>Transient</td><td>@transient.Id</td><td>@transient.GetHashCode()</td></tr>
    <tr><td>Scoped</td><td>@scoped.Id</td><td>@scoped.GetHashCode()</td></tr>
    <tr><td>Singleton</td><td>@singleton.Id</td><td>@singleton.GetHashCode()</td></tr>
</table>
<hr />
<table border="1">
    <tr><td colspan="3">Custom Service</td></tr>
    <tr><td>Lifetimes</td><td>Id</td><td>Hash Code</td></tr>
    <tr><td>Transient</td><td>@customService.Transient.Id</td><td>@customService.Transient.GetHashCode()</td></tr>
    <tr><td>Scoped</td><td>@customService.Scoped.Id</td><td>@customService.Scoped.GetHashCode()</td></tr>
    <tr><td>Singleton</td><td>@customService.Singleton.Id</td><td>@customService.Singleton.GetHashCode()</td></tr>
</table>
```

輸出內容如下：  

![[鐵人賽 Day04] ASP.NET Core 2 系列 - 依賴注入(Dependency Injection) - Service 生命週期 - Servie](/images/i09-3.png)  

從左到又打開頁面三次：  
* **Transient**  
 如預期，每次注入都是不一樣的實例。  
* **Scoped**  
 在同一個 Requset 中，不論是在哪邊被注入，都是同樣的實例。  
* **Singleton**  
 不管 Requset 多少次，都會是同一個實例。  

## 參考

[Introduction to Dependency Injection in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection)  
[ASP.NET Core Dependency Injection Deep Dive](https://joonasw.net/view/aspnet-core-di-deep-dive)  