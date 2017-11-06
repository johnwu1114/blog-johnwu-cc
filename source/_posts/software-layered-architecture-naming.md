---
title: 軟體分層架構命名方式
author: John Wu
tags:
  - Software Design
  - C#
categories:
  - Software Design
date: 2017-11-06 13:10:00
---

最近在重構六年前做的產品，雖然當時已經有做分層架構，但還是有很多該改進的地方。  
有些命名越看越不順眼，重構期間順便整理一下分層架構；不管在何時回頭看自己做的東西，都覺得很多進步空間。  
本篇介紹一下常見的*軟體分層架構模式 (Software Layered Architecture Pattern)*，以及推薦的命名方式。  

<!-- more -->

## 分層架構

### 基本分層

基本分層架構模式主分為：  
* **表示層 (Presentation Layer)**  
 * UI 互動相關的部分
* **業務層 (Business Layer)**  
 * 處理業務邏輯的部分
* **資料層 (Data Layer)**  
 * 處理資料存取的部分

> 在 *Software Architecture Patterns - O'Reilly* 書中 **資料層 (Data Layer)** 被分為 **Persistence Layer** 及 **Database Layer**，我個人比較喜歡 *Microsoft Application Architecture Guide* 用 **Data Layer** 的命名方式。畢竟資料來源不一定是資料庫，也可能是外部的 Services。

每層之間的關係都是上下互動，**不應該跨層互動**，如圖：  

![軟體分層架構模式 - 基本分層](/images/x378.png)

### 服務型分層

如果是**服務型 (Service-Based)**的分層方式，提供給外部用的 API 就處於比較尷尬的位置；不屬於表示層，偏向業務層，但放在業務層直接供人使用也怪怪的，所以會建議多出一層**服務層 (Service Layer)**，如圖：  

![軟體分層架構模式 - 服務型分層](/images/x379.png)

## 命名方式

從網路上可以找到很多不同風格的命名方式，此章節只是我整理出我喜歡的命名風格，如果還沒有命名頭緒的話可以參考看看。
我大部分時間都是在開發 *ASP.NET MVC/WebAPI2* 所以會以 *.NET 專案* 為例。  

### Domain Project

專案名稱：`CompanyName.ProjectName.Domain`  
專案相依：不應該相依於其他專案。  

這個專案主要是用來分離各層相依關係的，內容含如下：
* 資料傳輸物件 Data Transfer Object(DTO)
* 列舉 Enums
* 介面 Interfaces

常見的 DTO 命名有：User**DTO**、User**VO**、User**TO**、User**Model** 等。  
> 蠻有趣的比較：[Value Object (VO) vs. Transfer Object (TO) vs. Data Transfer Object (DTO)](https://coderanch.com/t/154686/certification/Object-VO-Transfer-Object-Data)

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

專案名稱：`CompanyName.ProjectName.DataLayer`。  
專案相依：`CompanyName.ProjectName.Domain`。  

常見的命名有：User**DAL**、User**Engine**、User**Manager**、User**Repository** 等。  

建議的命名Class 命名規則：名稱加上後綴 **Manager**。  
如果有用 Repository Pattern，就在 Class 名稱加上後綴 **Repository**。  
範例：
```cs
// Class 命名規則：加上後綴 Manager。 
namespace CompanyName.ProjectName.DataLayer.Managers
{
  public class UserManager : IUserManager {
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

專案名稱：`CompanyName.ProjectName.BusinessLayer`  
專案相依：`CompanyName.ProjectName.Domain` 及 `CompanyName.ProjectName.DataLayer`。  

常見的命名有：User**BLL**、User**Logic**、User**Manager**、User**Repository** 等。  

建議的命名：Class 名稱：加上後綴 **Logic**。  
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

專案名稱：`CompanyName.ProjectName.Service`  
> 如果此專案是屬於 *Web API*，我會直接取名為 `CompanyName.ProjectName.WebService`。  
專案相依：`CompanyName.ProjectName.Domain` 及 `CompanyName.ProjectName.BusinessLayer`。 


如果 Service Layer 是提供給外部使用的 *Web API* 建議使用 `RESTful` 風格，用起來比較乾淨俐落，好處可以參考 Wiki。  
前陣子有人跟我說：  
> 如果把 *Web API* 符合 `RESTful`，感覺就變成 **Data Layer**。  

這兩個層級所做的事情顯然是完全不一樣的：
* **Service Layer**：提供系統資源給外部使用，負責轉手 **Business Layer** 處例完的資料。  
* **Data Layer**：負責提供及存取 **Business Layer** 收送的資料。  

在相同的系統中，這兩個層級是八竿子打不著的；但如果從另一個角度來看，對調用方來說，*Web API* 也是它的 **Data Layer**，把 *Web API* 符合 `RESTful` 只是為了讓調用方更容易使用。


建議的命名：Class 名稱加上後綴 **Service**。範例：
```cs 
namespace CompanyName.ProjectName.WebService.Controllers
{
  public class UserService : Controller {
    // ...
  }
}
```

### Presentation Layer

專案名稱：`CompanyName.ProjectName.Website`  
專案相依：`CompanyName.ProjectName.Domain` 及 `CompanyName.ProjectName.Service Layer`。  

以 Web 專案來說，這層是屬與 HTML、jQuery 或 Angular 這類的前端框架。  
如果有用前端框架，命名方式就依照該框架建議的指南命名。

## 參考

[Software Architecture Patterns - O'Reilly Media](http://www.oreilly.com/programming/free/files/software-architecture-patterns.pdf)**(推薦閱讀)**  
[Chapter 5: Layered Application Guidelines - Microsoft Application Architecture Guide](https://msdn.microsoft.com/en-us/library/ee658109)  
[Naming conventions DAL, BAL, and UI Layer](https://softwareengineering.stackexchange.com/a/259840)  
[應用程式的分層設計 (1) - 入門範例](http://www.huanlintalk.com/2012/09/designing-layered-data-centric.html)  