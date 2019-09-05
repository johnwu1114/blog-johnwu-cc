---
title: '[鐵人賽 Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - NUnit
  - Unit Test
  - VS Code
categories:
  - ASP.NET Core
date: 2018-01-13 12:00
featured_image: /images/ironman/i25-5.png
---

.NET Core 的單元測試框架有支援 xUnit、NUnit 及 MSTest，官方是比較推薦用 xUnit，但 NUnit 似乎比較受 .NET 工程師歡迎，我個人也是比較愛用 NUnit。  
本篇將介紹 ASP.NET Core 搭配 NUnit 單元測試框架及如何用 Visual Studio Code (VS Code) 呈現視覺化測試結果。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit)](https://ithelp.ithome.com.tw/articles/10196862)  

<!-- more -->

## 建立方案

之前的範例都只有一個 Web 專案，由於要增加測試專案的關係，檔案的目錄結構建議異動成以下架構：  
```sh
MyWebsite/                        # 方案資料夾
  MyWebsite/                      # Web 專案目錄
  MyWebsite.Tests/                # 單元測試專案目錄
```

若要透過 .NET Core CLI 建立 NUnit 樣板專案，需要先安裝 NUnit 的樣板專案，指令如下：  
```sh
dotnet new --install NUnit3.DotNetNew.Template
```

跟著以下步驟建立整個方案：  
```sh
mkdir MyWebsite
cd MyWebsite
# 建立 Web 樣板專案
dotnet new web --name MyWebsite
# 建立 NUnit 樣板專案
dotnet new nunit --name MyWebsite.Tests
```

![[鐵人賽 Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit) - 建立方案](/images/ironman/i25-1.png)

包含 Web 專案及 NUnit 專案的方案內容如下：  

![[鐵人賽 Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit) - 方案內容](/images/ironman/i25-2.png)

## 執行測試

NUnit 樣板專案會預帶一個 *UnitTest1.cs* 做為單元測試的範例，可以透過 .NET Core CLI 執行測試，指令如下：  
```sh
# dotnet test <測試專案名稱>
dotnet test MyWebsite.Tests
```

![[鐵人賽 Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit) - 執行測試](/images/ironman/i25-3.png)

### 測試案例

被測試的目標以[[鐵人賽 Day24] ASP.NET Core 2 系列 - Entity Framework Core](/article/ironman-day24-asp-net-core-entity-framework-core.html)文中的 **Repository Pattern** 的 *Controllers/UserController.cs* 做為範例。  
由於測試專案 **MyWebsite.Tests** 會參考到 **MyWebsite** 專案，所以要在 **MyWebsite.Tests** 加入對 **MyWebsite** 的參考，透過 .NET Core CLI 加入參考的指令如下：  
```sh
# dotnet add <專案名稱> reference <被參考專案的 csproj 檔>
dotnet add MyWebsite.Tests reference MyWebsite\MyWebsite.csproj
```

被測試的目標會需要用到 Mock Framework，我慣用的 Mock Framework 是 `NSubstitute`，所以會以 `NSubstitute` 為 Mock 範例，安裝指令：  
```sh
dotnet add MyWebsite.Tests package NSubstitute
```

在 **MyWebsite.Tests** 專案新增 *Controllers\UserControllerTests.cs*，測試案例如下：  

```cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using MyWebsite.Controllers;
using MyWebsite.Repositories;
using NSubstitute;
using NUnit.Framework;

namespace MyWebsite.Tests.Controllers
{
    public class UserControllerTests
    {
        private IRepository<UserModel, int> _fakeRepository;
        private UserController _target;

        [SetUp]
        public void SetUp()
        {
            _fakeRepository = Substitute.For<IRepository<UserModel, int>>();
            _target = new UserController(_fakeRepository);
        }

        [Test]
        public void SearchUser()
        {
            // Arrange
            var query = "test";
            var model = new UserModel { Id = 1 };
            _fakeRepository.Find(Arg.Any<Expression<Func<UserModel, bool>>>())
                .Returns(new List<UserModel> { model });

            // Act
            var actual = _target.Get(query);

            // Assert
            Assert.IsTrue(actual.IsSuccess);
        }

        [Test]
        public void GetUser()
        {
            // Arrange
            var model = new UserModel { Id = 1 };
            _fakeRepository.FindById(Arg.Any<int>()).Returns(model);

            // Act
            var actual = _target.Get(model.Id);

            // Assert
            Assert.IsTrue(actual.IsSuccess);
        }

        [Test]
        public void CreateUser()
        {
            // Arrange
            var model = new UserModel();

            // Act
            var actual = _target.Post(model);

            // Assert
            Assert.IsTrue(actual.IsSuccess);
        }

        [Test]
        public void UpdateUser()
        {
            // Arrange
            var model = new UserModel { Id = 1 };

            // Act
            var actual = _target.Put(model.Id, model);

            // Assert
            Assert.IsTrue(actual.IsSuccess);
        }

        [Test]
        public void DeleteUser()
        {
            // Arrange
            var model = new UserModel { Id = 1 };

            // Act
            var actual = _target.Delete(model.Id);

            // Assert
            //Assert.IsTrue(actual.IsSuccess);
            Assert.Fail();
        }
    }
}
```

測試結果如下：  

![[鐵人賽 Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit) - 測試結果](/images/ironman/i25-4.png)

## Visual Studio Code

每次要測試都要打指令，顯得有點麻煩，而且透過指令執行顯示的測試結果，以純文字顯示也不怎麼好看。  
VS Code 有測試專案用的擴充套件，可以直接在程式碼中看到那些測試案例成功或失敗。  

打開 VS Code 在 Extensions 搜尋列輸入 **test** ，便可以找到 `.NET Core Test Explorer` 的擴充套件安裝。如下圖：  

![[鐵人賽 Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit) - .NET Core Test Explorer](/images/ironman/i25-5.png)

安裝完成後在方案資料夾下的 *.vscode\settings.json* 新增 `dotnet-test-explorer.testProjectPath` 指定測試專案位置，如下：  

*.vscode\settings.json*  
```json
{
    "dotnet-test-explorer.testProjectPath": "MyWebsite.Tests"
}
```

就可以透過 VS Code UI 執行單元測試，並且能在程式碼中看到那些測試案例成功或失敗。如下：  

![[鐵人賽 Day25] ASP.NET Core 2 系列 - 單元測試 (NUnit) - .NET Core Test Explorer](/images/ironman/i25-6.png)

## 參考

[Unit Testing in .NET Core and .NET Standard](https://docs.microsoft.com/en-us/dotnet/core/testing/)  