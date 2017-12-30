---
title: '[鐵人賽 Day12] ASP.NET Core 2 系列 - RESTful API'
author: John Wu
tags:
  - ASP.NET Core
  - Web API
  - Routing
  - iT 邦幫忙 2018 鐵人賽
categories:
  - ASP.NET Core
date: 2017-12-31 12:00
featured_image: /images/i12-1.png
---

RESTful 幾乎已算是 API 設計的標準，透過 HTTP Method 區分新增(Create)、查詢(Read)、修改(Update)跟刪除(Delete)，簡稱 CRUD 四種資料存取方式，簡約又直覺的風格，讓人用的愛不釋手。  
本篇將介紹如何透過 ASP.NET Core 實作 RESTful API。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day11] ASP.NET Core 2 系列 - RESTful API](https://ithelp.ithome.com.tw/articles/10194989)  
 
<!-- more -->

## HTTP Method

RESTful API 對資料的操作行為，透過 HTTP Method 分為以下四種方式：  

* **新增(Create)**  
 用 HTTP `POST` 透過 Body 傳遞 JSON 或 XML 格式的資料給 Server。例如：  
 ```json
 POST http://localhost:5000/api/users
 {
    "id": 1,
    "name": "John Wu"
 }
 ```
* **查詢(Read)**  
 用 HTTP `GET` 透過 URL 帶查詢參數。通常查詢單一資源會用路由參數(Routing Parameter)帶上唯一值(Primary Key)；多筆查詢會用複數，而查詢條件用 Query String。例如：  
 ```sh
 # 單筆查詢
 GET http://localhost:5000/api/users/1
 # 多筆查詢
 GET http://localhost:5000/api/users
 # 多筆查詢帶條件
 GET http://localhost:5000/api/users?q=john
 ```
* **修改(Update)**  
 修改資料如同查詢跟新增的組合，用 HTTP `PUT` 透過 URL 帶路由參數，作為找到要修改的目標；再透過 Body 傳遞 JSON 或 XML 格式的資料給 Server。例如：  
 ```json
 PUT http://localhost:5000/api/users/1
 {
    "name": "John"
 }
 ```
* **刪除(Delete)**  
 刪除資料同查詢，用 HTTP `DELETE` 透過 URL 帶路由參數，作為找到要刪除的目標。例如：  
 ```
 DELETE http://localhost:5000/api/users/1
 ```

### HTTP Method Attribute

[[鐵人賽 Day06] ASP.NET Core 2 系列 - MVC](/article/ironman-day06-asp-net-core-mvc.html) 有提到，過去 ASP.NET MVC 把 MVC 及 Web API 的套件分開，但在 ASP.NET Core 中 MVC 及 Web API 用的套件是相同的。所以只要裝 `Microsoft.AspNetCore.Mvc` 套件就可以用 Web API 了。路由方式也跟 [[鐵人賽 Day07] ASP.NET Core 2 系列 - 路由 (Routing)](/article/ironman-day07-asp-net-core-routing.html) 介紹的 `RouteAttribute` 差不多，只是改用 HTTP Method Attribute。  

HTTP Method Attribute 符合 RESTful 原則的路由設定方式如下：  
```cs
[Route("api/[controller]s")]
public class UserController : Controller
{
    [HttpGet]
    public List<UserModel> Get(string q)
    {
        // ...
    }

    [HttpGet("{id}")]
    public UserModel Get(int id)
    {
        // ...
    }

    [HttpPost]
    public int Post([FromBody]UserModel user)
    {
        // ...
    }

    [HttpPut("{id}")]
    public void Put(int id, [FromBody]UserModel user)
    {
        // ...
    }

    [HttpDelete("{id}")]
    public void Delete(int id)
    {
        // ...
    }
}
```
> 目前 ASP.NET Core 還沒有像 ASP.NET MVC 的 MapHttpAttributeRoutes 可以綁 Http Method 的全域路由，都要在 Action 加上 HTTP Method Attribute。

## SerializerSettings 

用以下程式碼，舉例 `SerializerSettings`：

```cs
public class UserModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }    
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
}

// ...

[Route("api/[controller]s")]
public class UserController : Controller
{
  [HttpGet("{id}")]
  public UserModel Get(int id)
  {
      return new UserModel {
          Id = 1,
          Name = "John Wu"
      };
  }
}
```

### camel Case

過去 ASP.NET Web API 2 預設是 Pascal Case；而 ASP.NET Core 預設是使用 camel Case。  
若想要指定用 `ContractResolver`，可以在 `Startup.cs` 的 `ConfigureServices` 加入 MVC 服務時，使用 `AddJsonOptions` 設定如下：

```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {        
        services.AddMvc()
                .AddJsonOptions(options => 
                {
                    options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                });
        // 同以下寫法：
        // services.AddMvc();
    }
}
```

呼叫 `http://localhost:5000/api/users/1` 會回傳 JSON 如下：
```json
{
    "id": 1,
    "name": "John Wu",
    "email": null,
    "phoneNumber": null,
    "address": null
}
```

### Pascal Case

若想保持跟 ASP.NET Web API 2 一樣使用 Pascal Case，`ContractResolver` 則改用 `DefaultContractResolver`。

```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {        
        services.AddMvc()
                .AddJsonOptions(options => 
                {
                    options.SerializerSettings.ContractResolver = new DefaultContractResolver();
                });
    }
}
```

> `DefaultContractResolver` 名稱是延續 ASP.NET，雖然名稱叫 Default，但在 ASP.NET Core 它不是 **Default**。`CamelCasePropertyNamesContractResolver` 才是 ASP.NET Core 的 **Default** ContractResolver。

呼叫 `http://localhost:5000/api/users/1` 會回傳 JSON 如下：
```json
{
    "Id": 1,
    "Name": "John Wu",
    "Email": null,
    "PhoneNumber": null,
    "Address": null
}
```

### Ignore Null

上述兩個 JSON 回傳，都帶有 null 的欄位。在轉型的過程，找不到欄位會自動轉成 null，傳送的過程忽略掉也沒差，反而可以節省到一點流量。
```cs
// ...
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {        
        services.AddMvc()
                .AddJsonOptions(options => 
                {
                    options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
                });
    }
}
```

呼叫 `http://localhost:5000/api/users/1` 會回傳 JSON 如下：
```json
{
    "id": 1,
    "name": "John Wu"
}
```

## 範例程式

Startup.cs
```cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc()
                .AddJsonOptions(options => {
                    options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
                });
    }

    public void Configure(IApplicationBuilder app)
    {
        app.UseMvc();
    }
}
```

*Models\ResultModel.cs*
```cs
namespace MyWebsite.Models
{
    public class ResultModel
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
    }
}
```
> 我習慣用一個 ResultModel 來包裝每個 API 回傳的內容，不論調用 Web API 成功失敗都用此物件包裝，避免直接 throw exception 到 Client，產生 HTTP Status 200 以外的狀態。  

*Controllers/UserController.cs*
```cs
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using MyWebsite.Models;

namespace MyWebsite
{
    [Route("api/[controller]s")]
    public class UserController : Controller
    {
        private static List<UserModel> _users = new List<UserModel>();

        [HttpGet]
        public ResultModel Get(string q)
        {
            var result = new ResultModel();
            result.Data = _users.Where(c => string.IsNullOrEmpty(q) || Regex.IsMatch(c.Name, q, RegexOptions.IgnoreCase));
            result.IsSuccess = true;
            return result;
        }

        [HttpGet("{id}")]
        public ResultModel Get(int id)
        {
            var result = new ResultModel();
            result.Data = _users.SingleOrDefault(c => c.Id == id);
            result.IsSuccess = true;
            return result;
        }

        [HttpPost]
        public ResultModel Post([FromBody]UserModel user)
        {
            var result = new ResultModel();
            user.Id = _users.Count() == 0 ? 1 : _users.Max(c => c.Id) + 1;
            _users.Add(user);
            result.Data = user.Id;
            result.IsSuccess = true;
            return result;
        }

        [HttpPut("{id}")]
        public ResultModel Put(int id, [FromBody]UserModel user)
        {
            var result = new ResultModel();
            int index;
            if ((index = _users.FindIndex(c => c.Id == id)) != -1)
            {
                _users[index] = user;
                result.IsSuccess = true;
            }
            return result;
        }

        [HttpDelete("{id}")]
        public ResultModel Delete(int id)
        {
            var result = new ResultModel();
            int index;
            if ((index = _users.FindIndex(c => c.Id == id)) != -1)
            {
                _users.RemoveAt(index);
                result.IsSuccess = true;
            }
            return result;
        }
    }
}
```
### 執行結果

透過 Postman 測試 API。

* **新增(Create)**  
![[鐵人賽 Day12] ASP.NET Core 2 系列 - RESTful API - 新增(Create)](/images/i12-1.png)  
* **查詢(Read)**  
![[鐵人賽 Day12] ASP.NET Core 2 系列 - RESTful API - 查詢(Read)](/images/i12-2.png)  
* **修改(Update)**  
![[鐵人賽 Day12] ASP.NET Core 2 系列 - RESTful API - 修改(Update)](/images/i12-3.png)  
* **刪除(Delete)**  
![[鐵人賽 Day12] ASP.NET Core 2 系列 - RESTful API - 刪除(Delete)](/images/i12-4.png)  

## 參考

[Routing in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing)  
[Attribute Routing in ASP.NET Core](https://dotnetthoughts.net/attribute-routing-in-aspnet-core/)  