---
title: '[鐵人賽 Day16] ASP.NET Core 2 系列 - Entity Framework Core'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - Entity Framework Core
categories:
  - ASP.NET Core
date: 2018-01-04 23:17
featured_image: /images/i16-1.png
---

Entity Framework 是 .NET 跟資料庫溝通好用的 Object-Relational Mapper (O/RM) 框架，ASP.NET Core 也在專案初期就加入了 Entity Framework Core (EF Core)，延續這個好用框架。  
本篇將介紹 ASP.NET Core 搭配 Entity Framework Core 存取 SQL Server 資料庫，是以 Code First 方式建立資料表。

<!-- more -->

## 安裝套件

要在 ASP.NET Core 中使用 Entity Framework Core，需要安裝 `Microsoft.EntityFrameworkCore` 套件。  
透過 .NET Core CLI 在專案資料夾執行安裝指令：  
```sh
dotnet add package Microsoft.EntityFrameworkCore
```

Entity Framework 基本上都是搭配 SQL Server，以下範例也是使用 SQL Server。  
如果沒有裝 SQL Server 可以從官網下載安裝，Linux/macOS 有 Docker 版本可以使用。  
[Download SQL Server 2017](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)  

> SQL Server 2017 超級佛心！！！  
 過去 Express edition 就已經是免費版本，這次依然免費，不怎麼意外。  
 但這次連 Developer edition 都變成**免費**！  

## 建立 DbContext

`DbContext` 是 EF Core 跟資料庫溝通的主要類別，透過繼承 `DbContext` 可以定義跟資料庫溝通的行為。  
首先我們先建立一個類別繼承 `DbContext`，同時建立 DbSet。  
*MyContext.cs*
```cs
using Microsoft.EntityFrameworkCore;
using MyWebsite.Models;

namespace MyWebsite
{
    public class MyContext : DbContext
    {
        public MyContext(DbContextOptions<MyContext> options) : base(options)
        {
        }

        public DbSet<UserModel> Users { get; set; }
    }
}
```
> EF Core 會幫我們把 DbSet 轉換成資料表。  

建立一個資料模型 UserModel，這個資料模型會被轉成資料表的資料，把屬性 Id 設定成 Primary Key 且自動遞增：  
*Models\UserModel.cs*
```cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebsite.Models
{
    public class UserModel
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        public string Email { get; set; }
        
        public string PhoneNumber { get; set; }
        
        public string Address { get; set; }
    }
}
```

## 設定資料庫

新增一個 `*.json` 檔案來設定資料庫的連線字串。  
*settings.json*
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(LocalDB)\MSSQLLocalDB;Database=MyWebsite;"
  }
}
```
> **(LocalDB)\MSSQLLocalDB** 是 SQL Server 提供的本 DB。   


在 WebHost Builder 用 `ConfigureAppConfiguration` 載入組態設定：  
*Program.cs*
```cs
// ...
public class Program
{
    public static void Main(string[] args)
    {
        BuildWebHost(args).Run();
    }

    public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration((webHostBuilder, configurationBinder) =>
            {
                configurationBinder.AddJsonFile("settings.json", optional: true);
            })
            .UseStartup<Startup>()
            .Build();
}
```

在 `Startup.ConfigureServices` 注入 EF Core 的服務 `DbContext`，並設定資料庫連線字串。  
並在 `Startup.Configure` 呼叫 dbContext.Database.EnsureCreated()，當啟動 Website 時就會建立資料庫。  
*Startup.cs*
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        private readonly IConfiguration _config;

        public Startup(IConfiguration config)
        {
            _config = config;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddDbContext<MyContext>(options =>
            {
                options.UseSqlServer(_config.GetConnectionString("DefaultConnection"));
            });
        }

        public void Configure(IApplicationBuilder app, MyContext dbContext)
        {
            // 建立資料庫            
            dbContext.Database.EnsureCreated();
            app.UseMvcWithDefaultRoute();
        }
    }
}
```

## CRUD

因為在 DI 容器註冊了 MyContext，所以在 Controller 的建構子就透過 DI 可以取得 MyContext 實例。  
透過 MyContext 就可以把物件資料以集合的形式在資料庫輕鬆存取。  

*Controllers\UserController.cs*
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
        private readonly MyContext _context;

        public UserController(MyContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ResultModel Get(string q)
        {
            var result = new ResultModel();
            result.Data = _context.Users.Where(x => string.IsNullOrEmpty(q)
                                                 || Regex.IsMatch(x.Name, q, RegexOptions.IgnoreCase));
            result.IsSuccess = true;
            return result;
        }

        [HttpGet("{id}")]
        public ResultModel Get(int id)
        {
            var result = new ResultModel();
            result.Data = _context.Users.SingleOrDefault(x => x.Id == id);
            result.IsSuccess = true;
            return result;
        }

        [HttpPost]
        public ResultModel Post([FromBody]UserModel user)
        {
            var result = new ResultModel();
            _context.Users.Add(user);
            _context.SaveChanges();
            result.Data = user.Id;
            result.IsSuccess = true;
            return result;
        }

        [HttpPut("{id}")]
        public ResultModel Put([FromBody]UserModel user)
        {
            var result = new ResultModel();
            var oriUser = _context.Users.SingleOrDefault(x => x.Id == user.Id);
            if (oriUser != null)
            {
                _context.Entry(oriUser).CurrentValues.SetValues(user);
                _context.SaveChanges();
                result.IsSuccess = true;
            }
            return result;
        }

        [HttpDelete("{id}")]
        public ResultModel Delete(int id)
        {
            var result = new ResultModel();
            var oriUser = _context.Users.SingleOrDefault(x => x.Id == id);
            if (oriUser != null)
            {
                _context.Users.Remove(oriUser);
                _context.SaveChanges();
                result.IsSuccess = true;
            }
            return result;
        }
    }
}
```
> 仔細看一下 _context，會發現我都沒有對它做 Dispose。  
 不是 EF Core 改成自動 Dispose，而是 AddDbContext 服務幫我們實做了 Dispose。  
 當 Request 進來時，MyContext 會開啟連線，Response 結束時，會關閉連線，所以才不用自己 Dispose。  

## Repository Pattern

由於 Entity Framework 跟邏輯的相依性太強，對單元測試很不友善，所以通常都會搭配 Repository Pattern 使用。  
Repository Pattern 切斷相依的介面如下：  
*Repositories\IRepository.cs*
```cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace MyWebsite.Repositories
{
    public interface IRepository<TEntity, TKey>
        where TEntity : class
    {
        TKey Create(TEntity entity);

        void Update(TEntity entity);

        void Delete(TKey id);

        TEntity FindById(TKey id);

        IEnumerable<TEntity> Find(Expression<Func<TEntity, bool>> expression);
    }
}
```

把存取 MyContext.Users 的邏輯都實作在 UserRepository。  
*Repositories\UserRepository.cs*
```cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using MyWebsite.Models;

namespace MyWebsite.Repositories
{
    public class UserRepository : IRepository<UserModel, int>
    {
        private readonly MyContext _context;

        public UserRepository(MyContext context)
        {
            _context = context;
        }

        public int Create(UserModel entity)
        {
            _context.Users.Add(entity);
            _context.SaveChanges();
            return entity.Id;
        }

        public void Update(UserModel entity)
        {
            var oriUser = _context.Users.Single(x => x.Id == entity.Id);
            _context.Entry(oriUser).CurrentValues.SetValues(entity);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            _context.Users.Remove(_context.Users.Single(x => x.Id == id));
            _context.SaveChanges();
        }

        public IEnumerable<UserModel> Find(Expression<Func<UserModel, bool>> expression)
        {
            return _context.Users.Where(expression);
        }

        public UserModel FindById(int id)
        {
            return _context.Users.SingleOrDefault(x => x.Id == id);
        }
    }
}
```


在 `Startup.ConfigureServices` 注入 `UserRepository`。  
*Startup.cs*
```cs
// ...
namespace MyWebsite
{
    public class Startup
    {
        // ...
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddDbContext<MyContext>(options =>
            {
                options.UseSqlServer(_config.GetConnectionString("DefaultConnection"));
            });
            services.AddScoped<IRepository<UserModel, int>, UserRepository>();
        }
        // ...
    }
}
```
> 若不了解 `AddScoped` 請參考這篇：[[鐵人賽 Day09] ASP.NET Core 2 系列 - 依賴注入 (Dependency Injection)](/article/ironman-day09-asp-net-core-dependency-injection.html)  


原本在 UserController 注入 MyContext 改成注入 `IRepository<UserModel, int>`。  
*Controllers\UserController.cs*
```cs
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using MyWebsite.Models;
using MyWebsite.Repositories;

namespace MyWebsite
{
    [Route("api/[controller]s")]
    public class UserController : Controller
    {
        private readonly IRepository<UserModel, int> _repository;

        public UserController(IRepository<UserModel, int> repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public ResultModel Get(string q)
        {
            var result = new ResultModel();
            result.Data = _repository.Find(x => string.IsNullOrEmpty(q)
                                             || Regex.IsMatch(x.Name, q, RegexOptions.IgnoreCase));
            result.IsSuccess = true;
            return result;
        }

        [HttpGet("{id}")]
        public ResultModel Get(int id)
        {
            var result = new ResultModel();
            result.Data = _repository.FindById(id);
            result.IsSuccess = true;
            return result;
        }

        [HttpPost]
        public ResultModel Post([FromBody]UserModel user)
        {
            var result = new ResultModel();
            _repository.Create(user);
            result.Data = user.Id;
            result.IsSuccess = true;
            return result;
        }

        [HttpPut("{id}")]
        public ResultModel Put(int id, [FromBody]UserModel user)
        {
            var result = new ResultModel();
            try
            {
                user.Id = id;
                _repository.Update(user);
                result.IsSuccess = true;
            }
            catch
            {
                // ...
            }
            return result;
        }

        [HttpDelete("{id}")]
        public ResultModel Delete(int id)
        {
            var result = new ResultModel();
            try
            {
                _repository.Delete(id);
                result.IsSuccess = true;
            }
            catch
            {
                // ...
            }
            return result;
        }
    }
}
```

## 執行結果

![[鐵人賽 Day16] ASP.NET Core 2 系列 - Entity Framework Core](/images/i16-1.png)

## 參考

[Getting started with ASP.NET Core MVC and Entity Framework Core using Visual Studio](https://docs.microsoft.com/en-us/aspnet/core/data/ef-mvc/intro)  
[Create, Read, Update, and Delete - EF Core with ASP.NET Core MVC tutorial](https://docs.microsoft.com/en-us/aspnet/core/data/ef-mvc/crud)