---
title: ASP.NET Core 教學 - Web Api JSON 序列化設定
author: John Wu
tags:
  - 'C#'
  - ASP.NET Core
  - Web Api
categories:
  - ASP.NET Core
date: 2017-04-17 22:41:00
featured_image: /images/pasted-59.png
---
![Camel](/images/pasted-59.png)

用 JSON 作為 Web Api 資料傳遞格式，並使用 camelCase 作為名稱命名規則，幾乎已成為通用的標準。ASP.NET Core Web Api 也很貼心的把回傳物件格式預設為 JSON camelCase。  

通常 C# 端定義的物件欄位都是 PascalCase，但有時候為了讓前端 JavaScript 物件可以跟後端保持一致，也會把前端 JavaScript 物件欄位定義成 PascalCase 格式。  

為了讓前後端定義的物件欄位格式保持一致，就可以透過 SerializerSettings 改變收送格式。

<!-- more -->

## Define Web Api

假設我們有一個 Web Api 回傳 ContactModel 物件如下：
```cs
public class ContactModel
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
}

[HttpGet]
public ContactModel Get()
{
	return new ContactModel
	{
		Id = 1,
		FirstName = "John",
		LastName = "Wu"
	};
}
```

## Camel Case

Startup.cs
```cs
public void ConfigureServices(IServiceCollection services)
{
	services.AddMvc();
	// 或者以下寫法
	// services.AddMvc().AddJsonOptions(options => options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver());
}
```

呼叫 Web Api 會回傳 JSON 如下：
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Wu",
  "email": null,
  "phoneNumber": null,
  "address": null
}
```

## Pascal Case

Startup.cs
```cs
public void ConfigureServices(IServiceCollection services)
{
	services.AddMvc().AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
}
```

呼叫 Web Api 會回傳 JSON 如下：
```json
{
  "Id": 1,
  "FirstName": "John",
  "LastName": "Wu",
  "Email": null,
  "PhoneNumber": null,
  "Address": null
}
```

## Ignore Null

上述兩個 JSON 回傳，都帶有 null 的欄位。在轉型的過程，找不到欄位會自動轉成 null，傳送的過程忽略掉也沒差，反而可以節省到一點流量。

Startup.cs
```cs
public void ConfigureServices(IServiceCollection services)
{
	services.AddMvc().AddJsonOptions(options =>
	{
		options.SerializerSettings.ContractResolver = new DefaultContractResolver();
		options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
	});
}
```

呼叫 Web Api 會回傳 JSON 如下：
```json
{
  "Id": 1,
  "FirstName": "John",
  "LastName": "Wu",
}
```