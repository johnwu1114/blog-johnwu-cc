---
title: ASP.NET Core + Angular 4 教學 - Entity Framework Core
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - TypeScript
  - 'C#'
  - Web API
  - Entity Framework Core
  - Code First
categories:
  - ASP.NET Core
  - Angular
date: 2017-05-10 10:23:00
featured_image: /images/a/11p.png
---
![ASP.NET Core + Angular 4 教學 - Entity Framework Core 範例執行結果](/images/a/11p.png)

本篇將介紹 ASP.NET Core 搭配 Entity Framework Core 存取資料庫，用的是 Code First 建立資料表。

<!-- more -->

程式碼延續之前範例：  
[ASP.NET Core + Angular 4 教學 - Web API CRUD](/article/asp-net-core-angular-4-教學-web-api-crud.html)  

## 1. 安裝 NuGet 套件

在 NuGet 管理找到以下套件並安裝：
1. Microsoft.EntityFrameworkCore.SqlServer
2. Microsoft.Extensions.Configuration
3. Microsoft.Extensions.Configuration.Binder
4. Microsoft.Extensions.Configuration.Json

## 2. 建立資料庫

### 2.1 建立 DbContext

首先我們先建立一個類別繼承 DbContext，同時建立 DbSet。  
\MyContext.cs
```cs
// ...

public class MyContext : DbContext
{
    public MyContext(DbContextOptions<MyContext> options) : base(options)
    {
    }

    public DbSet<ContactModel> Contacts { get; set; }
}
```
> Entity Framework 會幫我們把 DbSet 轉換成資料表。  

ContactModel 的 Id 設為 Primary Key 且自動遞增：  
\Models\ContactModel.cs
```cs
public class ContactModel
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string Email { get; set; }

    public string PhoneNumber { get; set; }

    public string Address { get; set; }
}
```

### 2.2 設定 Config

我們新增一個 `*.json` 檔案來設定資料庫的連線字串。  
\appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MyWebsite;"
  }
}
```

### 2.3 設定 Startup

1. 為了要讀取資料庫連線字串，在 Startup 的建構子載入 appsettings.json。  
2. 在 ConfigureServices 注入 DbContext 的服務，並設定資料庫連線字串。  
3. 啟動 Website 時呼叫 dbContext.Database.EnsureCreated() 建立資料庫。  

\Startup.cs
```cs
public class Startup
{
    public static IConfigurationRoot Config { get; private set; }

    public Startup()
    {
        Config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: true)
                .Build();
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddDbContext<MyContext>(options =>
            options.UseSqlServer(Config.GetConnectionString("DefaultConnection")));

        services.AddMvc().AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
    }

    public void Configure(IApplicationBuilder app, MyContext dbContext)
    {
        app.Use(async (context, next) =>
        {
            await next();
            if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value))
            {
                context.Request.Path = "/index.html";
                context.Response.StatusCode = 200;
                await next();
            }
        });
        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UseMvc();

        dbContext.Database.EnsureCreated();
    }
}
```

## 3. Web API CRUD

原本把資料存在 `List<ContactModel> _contacts`，現在可以透過 MyContext 把資料存到資料庫。  
> 因為在 Startup 注入了 MyContext，所以在 Controller 的建構子就可以取得 MyContext 使用。  

\Controllers\ContactsController.cs
```cs
[Route("api/[controller]")]
public class ContactsController : Controller
{
    private readonly MyContext _context;

    public ContactsController(MyContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ResultModel Get()
    {
        var result = new ResultModel();
        result.Data = _context.Contacts;
        result.IsSuccess = result.Data != null;
        return result;
    }

    [HttpGet("{id}")]
    public ResultModel Get(int id)
    {
        var result = new ResultModel();
        result.Data = _context.Contacts.SingleOrDefault(c => c.Id == id);
        result.IsSuccess = result.Data != null;
        return result;
    }

    [HttpPost]
    public ResultModel Post([FromBody]ContactModel contact)
    {
        var result = new ResultModel();
        _context.Contacts.Add(contact);
        _context.SaveChanges();
        result.Data = contact.Id;
        result.IsSuccess = true;
        return result;
    }

    [HttpPut]
    public ResultModel Put([FromBody]ContactModel contact)
    {
        var result = new ResultModel();
        var oriContact = _context.Contacts.SingleOrDefault(c => c.Id == contact.Id);
        if (oriContact != null)
        {
            _context.Entry(oriContact).CurrentValues.SetValues(contact);
            _context.SaveChanges();
            result.IsSuccess = true;
        }
        return result;
    }

    [HttpDelete("{id}")]
    public ResultModel Delete(int id)
    {
        var result = new ResultModel();
        var oriContact = _context.Contacts.SingleOrDefault(c => c.Id == id);
        if (oriContact != null)
        {
            _context.Contacts.Remove(oriContact);
            _context.SaveChanges();
            result.IsSuccess = true;
        }
        return result;
    }
}
```
> 仔細看一下 _context，會發現我都沒有對它做 Dispose。  
> 不是 Entity Framework Core 改成自動 Dispose，而是 Startup 注入的 AddDbContext 幫我們實做了 Dispose。  
> 當 Request 進來時，MyContext 會開啟連線，Response 結束時，會關閉連線，所以才不用自己 Dispose。

### 執行結果

![ASP.NET Core + Angular 4 教學 - Entity Framework Core 範例執行結果](/images/a/11.gif)

## 程式碼下載

[asp-net-core-angular-entity-framework-core](https://github.com/johnwu1114/asp-net-core-angular-entity-framework-core)

## 參考

https://docs.microsoft.com/en-us/aspnet/core/data/ef-mvc/intro