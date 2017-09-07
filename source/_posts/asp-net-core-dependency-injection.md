---
title: ASP.NET Core 教學 - Dependency Injection
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
categories:
  - ASP.NET Core
date: 2017-06-28 22:21:00
featured_image: /images/pasted-209.png
---
![ASP.NET Core 教學 - Dependency Injection - 運作方式](/images/pasted-209.png)

ASP.NET Core 使用了大量的 DI (Dependency Injection) 設計，有用過 Autofac 或類似的 DI Framework 對此應該不陌生。  
本篇將介紹 ASP.NET Core 的 Dependency Injection。

<!-- more -->

## DI 運作方式

ASP.NET Core 的 DI 是採用 Constructor Injection，也就是說會把實例化的物件從建構子傳入。例如：
```cs
public class HomeController : Controller
{
    private readonly ISample _sample;

    public HomeController(ISample sample)
    {
        _sample = sample;
        // ...
    }
}
```
上述的 sample，會在 HomeController 被實例化的時候注入進來。  
每個 Request 都會把 Controller 實例化，所以從建構子注入，就能確保 Action 能夠使用到被注入進來的 _sample。  

光看上面的程式碼，可能會很困惑 ASP.NET Core 要如何知道 sample 的實做類別？  
要注入的 Service 需要在 Startup 中註冊實做類別。如下：
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddScoped<ISample, Sample>();
    }
}
```
如此一來，在 ASP.NET Core 實例化 Controller 時，發現建構子有 ISample 這個類型的參數，就把 Sample 的實例注入給該 Controller。  

## 1. 建立 Service

基本上要注入到 Service 的類別沒什麼限制，除了靜態類別。  
以下範例程式就只是一般的 class 繼承 interface：  

```cs
public interface ISample
{
    Guid Id { get; }
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
    private Guid _id;

    public Sample()
    {
        _id = Guid.NewGuid();
    }

    public Guid Id => _id;
}

```

## 2. 註冊 Service

註冊 Service 有分三種方式：
1. Transient  
每次注入時，都重新 `new` 一個新的實體。  
2. Scoped  
每個 **Request** 都重新 `new` 一個新的實體。  
3. Singleton  
程式啟動後會 `new` 一個實體。也就是運行期間只會有一個實體。  

```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddTransient<ISampleTransient, Sample>();
        services.AddScoped<ISampleScoped, Sample>();
        services.AddSingleton<ISampleSingleton, Sample>();
    }
}
```
> 第一個泛型為注入的類型，建議用 interface 來包裝，這樣在才能把相依關係拆除。  
> 第二個泛型為實做的類別。  

Service 實例產生方式：
![ASP.NET Core 教學 - Dependency Injection - 運作方式動畫](/images/pasted-209.gif)
* A 為 Singleton  
* B 為 Scoped  
* C 為 Transient  

## 3. 注入 Service

被注入的 Service 可以在 Controller、View、Filter、Middleware 或自訂的 Service 等使用，只要是透過 ASP.NET Core 產生實例的類別，都可以在建構子定義型態注入。  
此篇我只用 Controller、Service、View 做為範例。  

### 3.1. Controller

```cs
public class HomeController : Controller
{
    public readonly ISampleTransient _sampleTransient;
    public readonly ISampleScoped _sampleScoped;
    public readonly ISampleSingleton _sampleSingleton;

    public HomeController(ISampleTransient sampleTransient, ISampleScoped sampleScoped, ISampleSingleton sampleSingleton)
    {
        _sampleTransient = sampleTransient;
        _sampleScoped = sampleScoped;
        _sampleSingleton = sampleSingleton;
    }

    public IActionResult Index()
    {
        var message = $"<tr><td>Transient</td><td>{_sampleTransient.Id}</td></tr>"
                    + $"<tr><td>Scoped</td><td>{_sampleScoped.Id}</td></tr>"
                    + $"<tr><td>Singleton</td><td>{_sampleSingleton.Id}</td></tr>";
        return View(model: message);
    }
}
```

### 3.2. Service

```cs
public class SampleService
{
    public ISampleTransient SampleTransient { get; private set; }
    public ISampleScoped SampleScoped { get; private set; }
    public ISampleSingleton SampleSingleton { get; private set; }

    public SampleService(ISampleTransient sampleTransient, ISampleScoped sampleScoped, ISampleSingleton sampleSingleton)
    {
        SampleTransient = sampleTransient;
        SampleScoped = sampleScoped;
        SampleSingleton = sampleSingleton;
    }
}
```

註冊 SampleService
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<SampleService, SampleService>();
    }
}
```
> 第一個泛型也可以是類別，不一定要是介面。    

### 3.3. View

```html
@model  string

@using MyWebsite

@inject ISampleTransient sampleTransient
@inject ISampleScoped sampleScoped
@inject ISampleSingleton sampleSingleton
@inject SampleService sampleService

<table>
    <colgroup>
        <col width="100" />
    </colgroup>
    <tbody>
        <tr><th colspan="2">Controler</th></tr>
        @Html.Raw(Model)

        <tr><th colspan="2">Service</th></tr>
        <tr><td>Transient</td><td>@sampleService.SampleTransient.Id</td></tr>
        <tr><td>Scoped</td><td>@sampleService.SampleScoped.Id</td></tr>
        <tr><td>Singleton</td><td>@sampleService.SampleSingleton.Id</td></tr>

        <tr><th colspan="2">View</th></tr>
        <tr><td>Transient</td><td>@sampleTransient.Id</td></tr>
        <tr><td>Scoped</td><td>@sampleScoped.Id</td></tr>
        <tr><td>Singleton</td><td>@sampleSingleton.Id</td></tr>
    </tbody>
</table>
```

## 執行結果

1. Transient 如預期，每次都不一樣。  
2. Scoped 在同一個 Requset 中，不論是在哪邊被注入，都是同樣的實體。(紅色箭頭)  
3. Singleton 不管 Requset 多少次，都會是同一個實體。(藍色方框)  

![ASP.NET Core 教學 - Dependency Injection - 範例執行結果](/images/pasted-208.png)

## 程式碼下載

[asp-net-core-dependency-injection](https://github.com/johnwu1114/asp-net-core-dependency-injection)

## 參考

[ASP.NET Core Dependency Injection Deep Dive](https://joonasw.net/view/aspnet-core-di-deep-dive)  
[Introduction to Dependency Injection in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection)  