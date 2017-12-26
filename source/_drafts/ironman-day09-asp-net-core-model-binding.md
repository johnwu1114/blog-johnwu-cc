---
title: '[鐵人賽 Day09] ASP.NET Core 2 系列 - Model Binding'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - MVC
categories:
  - ASP.NET Core
date: 2017-12-28 12:00
featured_image: /images/i09-2.png
---

ASP.NET Core MVC 的 Model Binding 會將 HTTP Request 資料，以映射的方式對應到相對到參數中。基本上跟 ASP.NET MVC 差不多，但能 Binding 的來源更多了一些。  
本篇將介紹 ASP.NET Core 的 Model Binding。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day09] ASP.NET Core 2 系列 - Model Binding](https://ithelp.ithome.com.tw/articles/10194104)  
 
<!-- more -->

## Model Binding

要接收 Client 傳送來的資料，可以透過 Action 的參數接收，如下：  
```cs
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index(int id)
        {
            return Content($"id: {id}");
        }
    }
}
```
`id` 就是從 HTTP Requset 的內容被 Binding 的 Model 參數。  
預設的 Model Binding 會從 HTTP Requset 的三個地方取值**(優先順序由上到下)**：  
* **Form**  
 透過 HTTP POST 的 form 取值。如下圖：  
 ![[鐵人賽 Day09] ASP.NET Core 2 系列 - Model Binding - Form](/images/i09-1.png)   
* **Route**  
 是透過 MVC Route URL 取值。  
 如：`http://localhost:5000/Home/Index/2`，`id` 取出的值就會是 2。
* **Query**  
 是透過 URL Query 參數取值。  
 如：`http://localhost:5000/Home/Index?id=1`，`id` 取出的值就會是 1。  

如果三者都傳入的話，會依照優先順序取值，Form > Route > Query。  

## Binding Attributes

除了預設的三種 Binding 來源外，還可以透過 Model Binding Attributes 從 HTTP Requset 的其他資訊中 Binding。有以下 6 種類別：  
* **[FromHeader]**  
 從 HTTP Header 取值。  
* **[FromForm]**  
 透過 HTTP POST 的 form 取值。  
* **[FromRoute]**  
 是透過 MVC Route URL 取值。  
* **[FromQuery]**  
 是透過 URL Query 參數取值。  
* **[FromBody]**  
 從 HTTP Body 取值，通常用於取 JSON, XML。  
 ASP.NET Core MVC 預設的序列化是使用 JSON，如果要傳 XML 格式做 Model Binding 的話，要在 MVC 服務加入 `XmlSerializerFormatters`，如下：  
 *Startup.cs*
 ```cs
// ...
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc()
            .AddXmlSerializerFormatters();
}
 ```
* **[FromServices]**  
 這個比較特別，不是從 HTTP Requset 取值，而是從 DI 容器取值。  
 DI 預設是使用 Constructor Injection，但 Controller 可能會因為每個 Action 用到不一樣的 Service 導致很多參數，所以也可以在 Action 注入 Service。  

### 範例程式

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult FirstSample(
            [FromHeader]string header,
            [FromForm]string form,
            [FromRoute]string id,
            [FromQuery]string query)
        {
            return Content($"header: {header}, form: {form}, id: {id}, query: {query}");
        }
        
        public IActionResult DISample([FromServices] ILogger<HomeController> logger)
        {
            return Content($"logger is null {logger == null}.");
        }

        public IActionResult BodySample([FromBody]UserModel model)
        {
            return Ok(model);
        }
    }

    public class UserModel
    {
        public int Id { get; set; }        
        public string Name { get; set; }        
        public string Email { get; set; }        
        public string PhoneNumber { get; set; }        
        public string Address { get; set; }
    }
}
```

### 輸出結果

**FirstSample** 輸出結果：  
![[鐵人賽 Day09] ASP.NET Core 2 系列 - Model Binding - Binding Attributes](/images/i09-2.png)   

**DISample** 輸出結果：  
`http://localhost:5000/Home/DISample`  
```
logger is null False.
```

**BodySample** 輸出結果：  
* **JSON**  
 ![[鐵人賽 Day09] ASP.NET Core 2 系列 - Model Binding - Binding Attributes](/images/i09-3.png)   
* **XML**  
 ![[鐵人賽 Day09] ASP.NET Core 2 系列 - Model Binding - Binding Attributes](/images/i09-4.png)   

## Model 驗證

Model Binding 也可以順便幫忙驗證欄位資料，只要在資料模型的屬性上面帶上 Validation Attributes，如下：  

```cs
using System.ComponentModel.DataAnnotations;
// ...
public class UserModel
{
    [Required]
    public int Id { get; set; }

    [RegularExpression(@"\w+")]
    [StringLength(20, MinimumLength = 4)]
    public string Name { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    [Phone]
    public string PhoneNumber { get; set; }

    [StringLength(200)]
    public string Address { get; set; }
}
```

然後在 Action 加上判斷：  

*Controllers\HomeController.cs*
```cs
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    public class HomeController : Controller
    {
        // ...
        public IActionResult BodySample([FromBody]UserModel model)
        {
            // 由於 Id 是 int 型別，int 預設為 0，雖然有帶上 [Required]，但不是 null 所以算是有值。
            if (model.Id < 1)
            {
                ModelState.AddModelError("Id", "Id not exist");
            }
            if (ModelState.IsValid)
            {
                return Ok(model);
            }
            return BadRequest(ModelState);
        }
    }
}
```

資料錯誤的輸出結果：  

![[鐵人賽 Day09] ASP.NET Core 2 系列 - Model Binding - Model 驗證](/images/i09-5.png)   

.NET Core 提供了很多的 Validation Attributes，可以參考官網：[System.ComponentModel.DataAnnotations](https://docs.microsoft.com/zh-tw/dotnet/api/system.componentmodel.dataannotations?view=netcore-2.0)  


### 自製 Validation Attributes

如果 .NET Core 提供的 Validation Attributes 不夠用還可以自己做。例如上述範例的資料模型多了生日欄位，需要驗證年齡：  
```cs
using System.ComponentModel.DataAnnotations;
// ...
public class UserModel
{
    [Required]
    public int Id { get; set; }

    [RegularExpression(@"\w+")]
    [StringLength(20, MinimumLength = 4)]
    public string Name { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    [Phone]
    public string PhoneNumber { get; set; }

    [StringLength(200)]
    public string Address { get; set; }

    [DataType(DataType.Date)]
    [AgeCheck(18, 120)]
    public DateTime BirthDate { get; set; }
}
```

透過繼承 `ValidationAttribute` 就可以客製化自訂的 Model 驗證 Attributes，如下：  

*Attributes\AgeCheckAttribute.cs*
```cs
using System;
using System.ComponentModel.DataAnnotations;

namespace MyWebsite.Attributes
{
    public class AgeCheckAttribute : ValidationAttribute
    {
        public int MinimumAge { get; private set; }
        public int MaximumAge { get; private set; }

        public AgeCheckAttribute(int minimumAge, int maximumAge)
        {
            MinimumAge = minimumAge;
            MaximumAge = maximumAge;
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var date = Convert.ToDateTime(value);

            if (date.AddYears(MinimumAge) > DateTime.Today
                || date.AddYears(MaximumAge) < DateTime.Today)
            {
                return new ValidationResult(GetErrorMessage(validationContext));
            }

            return ValidationResult.Success;
        }

        private string GetErrorMessage(ValidationContext validationContext)
        {
            // 有帶 ErrorMessage 的話優先使用
            // [AgeCheck(18, 120, ErrorMessage="xxx")] 
            if (!string.IsNullOrEmpty(this.ErrorMessage))
            {
                return this.ErrorMessage;
            }

            // 自訂錯誤訊息
            return $"{validationContext.DisplayName} can't be in future";
        }
    }
}
```


## 參考

[Overview of ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/overview)  
[Introduction to model validation in ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/models/validation)  
[ASP.NET CORE 2.0 MVC MODEL BINDING](https://tahirnaushad.com/2017/08/22/asp-net-core-2-0-mvc-model-binding/)  
[ASP.NET CORE 2.0 MVC MODEL VALIDATION](https://tahirnaushad.com/2017/08/22/asp-net-core-2-0-mvc-model-validation/)  