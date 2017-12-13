---
title: '[鐵人賽 Day08] ASP.NET Core 2 系列 - Swagger'
author: John Wu
tags:
  - ASP.NET Core
  - Web API
  - 2018 iT 邦幫忙鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-27 23:17
featured_image: /images/i08-1.png
---

Swagger 也算是行之有年的 API 文件產生器，只要在 API 上使用 C# 的 `<summary />` 文件註解標籤，就可以產生精美的線上文件，並且對 RESTful API 有良好的支援。不僅支援產生文件，還支援模擬調用的互動功能，連 Postman 都不用打開就能測 API。  
本篇將介紹如何透過 Swagger 產生 ASP.NET Core 的 RESTful API 文件。  

<!-- more -->

## 安裝套件

要在 ASP.NET Core 使用 Swagger 需要安裝 `Swashbuckle.AspNetCore` 套件。  
透過 dotnet cli 在專案資料夾執行安裝指令：  
```sh
dotnet add package Swashbuckle.AspNetCore
```

## 註冊 Swagger

在 `Startup.cs` 的 `ConfigureServices` 加入 Swagger 的服務及 Middleware。如下：
```cs
using Swashbuckle.AspNetCore.Swagger;
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc()
                .AddJsonOptions(options => {
                    options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
                });

        // name: 攸關 SwaggerDocument 的 URL 位置。
        // info: 是用於 SwaggerDocument 版本資訊的顯示(內容非必填)。
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc(name: "v1", info: new Info
            {
                Title = "RESTful API",
                Version = "1.0.0",
                Description = "This is ASP.NET Core RESTful API Sample.",
                TermsOfService = "None",
                Contact = new Contact { 
                    Name = "John Wu", 
                    Url = "https://blog.johnwu.cc" 
                },
                License = new License { 
                    Name = "CC BY-NC-SA 4.0", 
                    Url = "https://creativecommons.org/licenses/by-nc-sa/4.0/" 
                }
            });
        });
    }
    
    public void Configure(IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            // url: 需配合 SwaggerDoc 的 name。 "/swagger/{SwaggerDoc name}/swagger.json"
            // description: 用於 Swagger UI 右上角選擇不同版本的 SwaggerDocument 顯示名稱使用。
            c.SwaggerEndpoint(url: "/swagger/v1/swagger.json", description: "RESTful API v1.0.0");
        });

        app.UseMvc();
    }
}
```
* **AddSwaggerGen**  
 Swagger 產生器是負責取得 API 的規格並產生 `SwaggerDocument` 物件。  
* **UseSwagger**  
 Swagger Middleware 負責路由，提供 `SwaggerDocument` 物件。  
 可以從 URL 查看 Swagger 產生器產生的 `SwaggerDocument` 物件。  
 `http://localhost:5000/swagger/v1/swagger.json`
* **UseSwaggerUI**  
 SwaggerUI 是負責將 `SwaggerDocument` 物件變成漂亮的介面。  
 預設 URL：`http://localhost:5000/swagger`

> API 沿用 Day07 的 RESTful API 範例程式。  

設定完成後，啟動網站就能開啟 Swagger UI 了。下面如下：  

![[鐵人賽 Day08] ASP.NET Core 2 系列 - Swagger UI](/images/i08-1.png)  

## 文件註解標籤

在 API 加入 `<summary />` 文件註解標籤。如下：
```cs
// ...
[Route("api/[controller]s")]
public class UserController : Controller
{
    /// <summary>
    /// 查詢使用者清單
    /// </summary>
    /// <param name="q">查詢使用者名稱</param>
    /// <returns>使用者清單</returns>
    [HttpGet]
    public ResultModel Get(string q) {
        // ...
    }
}
```
再次打開 Swagger，會發現沒有顯示說明，因為沒有設定 .NET 的 XML 文件檔案，所以 Swagger 抓不到說明是正常的。  

打開 `*.csproj`，在 `<Project />` 區塊中插入以下程式碼：  
```xml
<PropertyGroup Condition="'$(Configuration)|$(Platform)'=='Debug|AnyCPU'">
    <DocumentationFile>bin\Debug\netcoreapp2.0\Api.xml</DocumentationFile>
    <NoWarn>1591</NoWarn>
</PropertyGroup>
```

以我範例的 `*.csproj` 內容如下：  
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

  <PropertyGroup Condition="'$(Configuration)|$(Platform)'=='Debug|AnyCPU'">
    <DocumentationFile>bin\Debug\netcoreapp2.0\Api.xml</DocumentationFile>
    <NoWarn>1591</NoWarn>
  </PropertyGroup>

  <ItemGroup>
    <Folder Include="wwwroot\" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.All" Version="2.0.3" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="1.1.0" />
  </ItemGroup>

</Project>
```

然後在設定 Swagger 讀取此 XML 文件檔案：
Startup.cs
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        services.AddSwaggerGen(c =>
        {
            // ...
            var filePath = Path.Combine(PlatformServices.Default.Application.ApplicationBasePath, "Api.xml");
            c.IncludeXmlComments(filePath);
        });
    }
}
```

## 回傳格式

以 Day07 的例子來看，回傳的格式都是 JSON，所以可以直接在 Controller 加上 `[Produces("application/json")]` 表示回傳的型別都是 JSON，在 Swagger 的 Response Content Type 選項就會被鎖定只有 application/json 可以使用。如下：
```cs
// ...
[Route("api/[controller]s")]
[Produces("application/json")]
public class UserController : Controller
{
    // ...
}
```

## 回傳型別

若有預期 API 在不同的 HTTP Status Code 時，會回傳不同的物件，可以透過 `[ProducesResponseType()]` 定義回傳的物件。在 Swagger 中就可以清楚看到該 API 可能會發生的 HTTP Status Code 及回傳物件。例如：

```cs
// ...
[Route("api/[controller]s")]
[Produces("application/json")]
public class UserController : Controller
{
    /// <summary>
    /// 查詢使用者清單
    /// </summary>
    /// <param name="q">查詢使用者名稱</param>
    /// <returns>使用者清單</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ResultModel<IEnumerable<UserModel>>), 200)]
    [ProducesResponseType(typeof(ResultModel<string>), 500)]
    public ResultModel<IEnumerable<UserModel>> Get(string q)
    {
        // ...
    }
}
```

## 執行結果

![[鐵人賽 Day08] ASP.NET Core 2 系列 - Swagger - 執行結果](/images/i08-2.png)  

## 參考

[ASP.NET Core Web API Help Pages using Swagger](https://docs.microsoft.com/en-gb/aspnet/core/tutorials/web-api-help-pages-using-swagger?tabs=visual-studio-code)  
[Swagger tools for documenting API's built on ASP.NET Core](https://github.com/domaindrivendev/Swashbuckle.AspNetCore)  