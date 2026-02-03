---
title: 軟體分層架構模式
author: John Wu
tags:
  - Software Design
  - C#
categories:
  - Software Design
date: 2017-11-06 13:10:00
featured_image: /images/a/378.png
---
![軟體分層架構模式 - 基本分層](/images/a/378.png)

最近在重構六年前做的產品，雖然當時已經有做分層架構，但還是有很多該改進的地方。  
有些命名越看越不順眼，重構期間順便整理一下分層架構；不管在何時回頭看自己做的東西，都覺得很多進步空間。  
本篇介紹一下常見的*軟體分層架構模式 (Software Layered Architecture Pattern)*，以及推薦的命名方式。  

<!-- more -->

## 分層架構簡介

### 基本分層

基本分層架構模式主分為：  
* **展示層 (Presentation Layer)**  
 * UI 互動相關的部分
* **業務層 (Business Layer)**  
 * 處理業務邏輯的部分
* **資料層 (Data Layer)**  
 * 處理資料存取的部分

> 在 *Software Architecture Patterns - O'Reilly* 書中 **資料層 (Data Layer)** 被分為 **Persistence Layer** 及 **Database Layer**，我個人比較喜歡 *Microsoft Application Architecture Guide* 用 **Data Layer** 的命名方式。畢竟資料來源不一定是資料庫，也可能是外部的 Services。

分層架構有一個很重要的特性，就是要把每一層的職責分離，**不應該跨層互動**，每層之間的關係只能是上下互動。  
如圖：  

![軟體分層架構模式 - 基本分層](/images/a/378.png)

### 服務型分層

上述的三層為了做到職責分離，只能層層互動，卻缺少了一些彈性。如果要提供 API 給外部使用，就處於比較尷尬的位置；不屬於展示層，比較偏向業務層，但業務層直接打破隔離方式供人使用也怪怪的。  
所以如果是**服務型 (Service-Based)** 的系統，會建議多出一層：  
* **服務層 (Service Layer)**  
 * 負責把封閉的分層開放給外部使用。  

如圖：  

![軟體分層架構模式 - 服務型分層](/images/a/379.png)

## 命名方式

從網路上可以找到很多不同風格的命名方式，此章節只是我整理出我喜歡的命名風格，如果還沒有命名頭緒的話可以參考看看。
我大部分時間都是在開發 *ASP.NET MVC/WebAPI2* 所以會以 *.NET 專案* 為例。  

### Domain Project

專案相依：不應該相依於其它專案。  
專案名稱：*CompanyName.ProjectName.Domain*  

這個專案主要是用來分離各層相依關係的，內容含如下：
* 資料傳輸物件 Data Transfer Object(DTO)
 * 常見的 DTO 命名有：User**DTO**、User**VO**、User**TO**、User**Model** 等。  
 > 蠻有趣的比較：[Value Object (VO) vs. Transfer Object (TO) vs. Data Transfer Object (DTO)](https://coderanch.com/t/154686/certification/Object-VO-Transfer-Object-Data)  
* 列舉 Enums
* 介面 Interfaces

建議的命名範例：
```cs
// DTO 範例
// Class 命名規則：不後綴 Entity。  
namespace CompanyName.ProjectName.Domain.Entities
{
  public class User {
    // ...
  }
}

// Enum 範例
// Class 命名規則：不後綴 Enum。 
namespace CompanyName.ProjectName.Domain.Enums
{
  public enum UserStatus {
    // ...
  }
}
```

### Data Layer

專案相依：*CompanyName.ProjectName.Domain*  
專案名稱：*CompanyName.ProjectName.DataLayer*  

常見的命名有：User**DAL**、User**Engine**、User**Manager**、User**Repository** 等。  
> DAL 全名 Data Access Layer，名稱應該是從 *[3-tier Architecture with ASP.NET 2.0](https://msdn.microsoft.com/en-us/library/bb288041.aspx)* 誕生出來的。

建議的命名Class 命名規則：名稱加上後綴 **Manager**。  
如果有用 Repository Pattern，就在 Class 名稱加上後綴 **Repository**。  
範例：
```cs
// Class 命名規則：加上後綴 Manager。 
namespace CompanyName.ProjectName.DataLayer.Managers
{
  public class RedisManager : IRedisManager {
    // ...
  }
}

// Repository Pattern 範例。 
// Class 命名規則：加上後綴 Repository 
namespace CompanyName.ProjectName.DataLayer.Repositorys
{
  public class UserRepository : IUserRepository {
    // ...
  }
}
```

### Business Layer

專案相依：*CompanyName.ProjectName.Domain* 及 *CompanyName.ProjectName.DataLayer* 
專案名稱：*CompanyName.ProjectName.BusinessLayer*   

常見的命名有：User**BLL**、User**Logic** 等。  
> BLL 全名是 Business Logic Layer，名稱出現同 DAL。

建議的命名：Class 名稱加上後綴 **Logic**。  
> 網路上非常多的範例適用 **BLL**，尤其是 ASP.NET 的範例。  
> 但我不推用 BLL 的原因是，Class 名稱出現連續的全大寫，看久了有點不舒服，還是比較習慣 *Pascal Case*。

範例：  
```cs 
namespace CompanyName.ProjectName.BusinessLayer.Logics
{
  public class UserLogic : IUserLogic {
    // ...
  }
}
```

### Service Layer

專案相依：*CompanyName.ProjectName.Domain* 及 *CompanyName.ProjectName.BusinessLayer* 

#### API Library

由於 Service Layer 是屬於對外開放的接口，所以我並沒有特別推薦命名方式，不要太突兀就好。  
可以參考許多第三方套件的 API 命名方式，例如常見的 `Newtonsoft.json`：
```cs
var json = Newtonsoft.Json.JsonConvert.SerializeObject(new { });
```
> `JsonConvert` 就沒有特別加什麼後綴，用比較直觀式的命名方式，讓使用方容易懂就好。

#### Web API

專案如果是 *Web API*，我會直接取名為 *CompanyName.ProjectName.WebService*。  
命名方式建議使用 `RESTful` 風格，用起來比較乾淨俐落，好處可以參考 Wiki。  

前陣子有人問我：  
> 如果把 *Web API* 符合 `RESTful`，是不就變成 **Data Layer** 了？  

這兩個層級的職責是完全不一樣的：
* **Service Layer**：提供資源給外部使用，負責轉手資料。  
* **Data Layer**：負責提供及存取 **Business Layer** 收送的資料。  

但如果從另一個角度來看，對調用方來說，*Web API* 也是它的 **Data Layer**，把 *Web API* 符合 `RESTful` 只是為了讓調用方更容易使用。  

### Presentation Layer

專案相依：*CompanyName.ProjectName.Domain* 及 *CompanyName.ProjectName.ServiceLayer* (或 *CompanyName.ProjectName.BusinessLayer* )
專案名稱：*CompanyName.ProjectName.Website*  

以 Web 專案來說，這層是屬與 HTML、jQuery 或 Angular 這類的前端框架。  
如果有用前端框架，命名方式就依照該框架建議的指南命名。  

> 如果是純前端框架，其實根本不用相宜於任何專案，是以 Web API 作為相依關係。  

## 範例架構

專案相依關係：  

![軟體分層架構模式 - 專案相依關係](/images/a/380.png)  

檔案架構大致如下：
```yml
CompanyName.ProjectName.Domain/         # Domain 專案
  Entities/
    User.cs
  Enums/
    UserStatus.cs
  Interfaces/                           # 分層隔離用到的介面
    Logics/
      IUserLogic.cs
    Managers/
      IRedisManager.cs
    Repositorys/
      IUserRepository.cs

CompanyName.ProjectName.DataLayer/      # Data Layer 專案
  Managers/
    RedisManager.cs
  Repositorys/
    UserRepository.cs

CompanyName.ProjectName.BusinessLayer/  # Business Layer 專案
  Logics/
    UserLogic.cs

CompanyName.ProjectName.WebService/     # Service Layer 專案
  Controllers/
    UserController.cs

CompanyName.ProjectName.Website/        # Angular 為例
  index.html                            # 起始頁面
  app/                                  # Angular 的主要目錄
    main.ts                             # bootstrap 的程式進入點
```

## 參考

[Software Architecture Patterns - O'Reilly Media](https://www.oreilly.com/programming/free/files/software-architecture-patterns.pdf)*(推薦閱讀)*  
[Chapter 5: Layered Application Guidelines - Microsoft Application Architecture Guide](https://msdn.microsoft.com/en-us/library/ee658109)  
[Naming conventions DAL, BAL, and UI Layer](https://softwareengineering.stackexchange.com/a/259840)  
[應用程式的分層設計 (1) - 入門範例](https://goo.gl/YgEiHK)  