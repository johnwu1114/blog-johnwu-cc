title: ASP.NET Core + Angular 4 教學 - Web Api CRUD
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - npm
  - TypeScript
  - 'C#'
  - Web Api
  - AJAX
categories:
  - ASP.NET Core
  - Angular
date: 2017-04-17 00:48:00
---
![ASP.NET Core + Angular 4 教學 - Web Api CRUD 範例執行結果](/images/pasted-48.gif)

本篇將介紹 Angular 4 跟 ASP.NET Core Web Api 透過 AJAX 的互動，範例是做一個簡單的通訊錄。功能包含新增(Create)、查詢(Read)、修改(Update)跟刪除(Delete)，簡稱CRUD。  

<!-- more -->

程式碼延續前兩篇的範例：  
[ASP.NET Core + Angular 4 教學 - 從無到有](/article/asp-net-core-angular-4-教學-從無到有.html)  
[ASP.NET Core + Angular 4 教學 - Webpack打包](/article/asp-net-core-angular-4-教學-webpack.html)

## 1. 安裝 NuGet 套件

過往 ASP.NET MVC 是把 MVC 及 Web Api 的套件分開，但在 ASP.NET Core 中 MVC 及 Web Api 用的套件是相同的，在 NuGet 管理可以找到 Microsoft.AspNetCore.Mvc 並安裝。

![NuGet 安裝 Microsoft.AspNetCore.Mvc](/images/pasted-56.png)

## 2. 建立 Web Api

### 2.1 註冊 Mvc 服務

Startup.cs  
AddJsonOptions 的 SerializerSettings 可以參考 [ASP.NET Core - Web Api JSON 序列化設定](/article/asp-net-core-web-api-json-serializer-settings.html)
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Serialization;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc()
                .AddJsonOptions(options =>
                    options.SerializerSettings.ContractResolver = new DefaultContractResolver()
                );
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}
```

### 2.2 Models

我習慣用一個 Result Model 來包裝每個 Service 的回傳內容，不論調用 Web Api 成功失敗都用此物件包裝，避免直接 throw exception 到 client，產生 http status 200 以外的狀態。  

Models\ResultModel.cs
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

Models\ContactModel.cs  
ContactModel是接下來範例主要用到的物件。
```cs
namespace MyWebsite.Models
{
    public class ContactModel
    {
        public int Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string PhoneNumber { get; set; }

        public string Address { get; set; }
    }
}
```

### 2.3 Controllers

建立一支符合 RESTful 的 CRUD Controller  
Controllers\ContactController.cs
```cs
using Microsoft.AspNetCore.Mvc;
using MyWebsite.Models;
using System.Collections.Generic;
using System.Linq;

namespace MyWebsite.Controllers
{
    [Route("api/[controller]")]
    public class ContactController : Controller
    {
        private static List<ContactModel> _contacts = new List<ContactModel>();

        [HttpGet("{id}")]
        public ResultModel Get(int id)
        {
            var result = new ResultModel();
            result.Data = _contacts.SingleOrDefault(c => c.Id == id);
            result.IsSuccess = result.Data != null;
            return result;
        }

        [HttpPost]
        public ResultModel Post([FromBody]ContactModel contact)
        {
            var result = new ResultModel();
            contact.Id = _contacts.Count() == 0 ? 1 : _contacts.Max(c => c.Id) + 1;
            _contacts.Add(contact);
            result.Data = contact.Id;
            result.IsSuccess = true;
            return result;
        }

        [HttpPut]
        public ResultModel Put([FromBody]ContactModel contact)
        {
            var result = new ResultModel();
            int index;
            if ((index = _contacts.FindIndex(c => c.Id == contact.Id)) != -1)
            {
                _contacts[index] = contact;
                result.IsSuccess = true;
            }
            return result;
        }

        [HttpDelete("{id}")]
        public ResultModel Delete(int id)
        {
            var result = new ResultModel();
            int index;
            if ((index = _contacts.FindIndex(c => c.Id == id)) != -1)
            {
                _contacts.RemoveAt(index);
                result.IsSuccess = true;
            }
            return result;
        }
    }
}
```

### 2.4 執行結果

直接用瀏覽器打開 /api/contact/1，就可以看到回傳畫面如下：  

![Web Api Http Get 測試](/images/pasted-57.png)

如果有安裝 Postman 或類似工具的話可以測測看其他的 methods：  

![Web Api Http Post 測試](/images/pasted-58.png)

## 3. 建立 Angular 4

### 3.1 NgModule

這個範例會用到兩個模組:
1. Web Api 用到的 AJAX 需要 HttpModule。
2. Form 的 ngModel 互動需要 FormsModule。  

wwwroot\app\main.ts
```js
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
```

### 3.2 Component

wwwroot\app\app.component.ts
```js
import { Component } from "@angular/core";
import { Http } from "@angular/http";
import * as models from "./models"

@Component({
    selector: "my-app",
    template: require("./app.component.html")
})
export class AppComponent {
    private api: string = "/api/contact";
    name = "Angular 4";
    model: models.ContactModel;
    contactId: number;
    message: string;

    constructor(private http: Http) {
        this.clear();
    }

    find(): void {
        this.clearMessage();
        if (Number(this.contactId) > 0) {
            this.http.get(`${this.api}/${this.contactId}`).subscribe(
                (response) => {
                    let result: models.ResultModel = response.json();
                    if (!result.IsSuccess) {
                        this.showMessage(`Id: ${this.contactId} not found`);
                        this.clear();
                    } else {
                        this.model = result.Data;
                    }
                });
        } else {
            this.showMessage("Contact Id incorrect!");
            this.clear();
        }
    }

    add(): void {
        this.clearMessage();
        this.http.post(this.api, this.model).subscribe(
            (response) => {
                let result: models.ResultModel = response.json();
                if (!result.IsSuccess) {
                    this.showMessage(result.Message);
                } else {
                    this.showMessage(`Added successfully, Id: ${result.Data}`);
                    this.clear();
                }
            });
    }

    save(): void {
        this.clearMessage();
        this.http.put(this.api, this.model).subscribe(
            (response) => {
                let result: models.ResultModel = response.json();
                if (!result.IsSuccess) {
                    this.showMessage(result.Message);
                } else {
                    this.showMessage(`Saved successfully, Id: ${this.model.Id}`);
                    this.clear();
                }
            });
    }

    delete(): void {
        this.clearMessage();
        this.http.delete(`${this.api}/${this.contactId}`).subscribe(
            (response) => {
                let result: models.ResultModel = response.json();
                if (!result.IsSuccess) {
                    this.showMessage(`Id: ${this.contactId} not found`);
                } else {
                    this.showMessage(`Delete successfully, Id: ${this.contactId}`);
                    this.clear();
                }
            });
    }

    clear(): void {
        this.contactId = null;
        this.model = new models.ContactModel();
    }

    clearMessage(): void {
        this.message = "";
    }

    showMessage(message: string): void {
        this.message = message;
    }
}
```

### 3.3 Models

新增 wwwroot\app\models.ts
```js
export class ResultModel {
    public IsSuccess: boolean;
    public Message: string;
    public Data: any;
}

export class ContactModel {
    public Id: number;
    public FirstName: string;
    public LastName: string;
    public PhoneNumber: string;
    public Email: string;
    public Address: string;
}
```

### 3.4 Views

wwwroot\app\app.component.html
```html
<h1>Hello {{name}}</h1>

<hr />

<h2>Contact Card</h2>
<div>
    <label>Find by Id</label>
    <input type="text" name="contactId" [(ngModel)]="contactId" />
    <input type="button" (click)="find()" value="Find" />
</div>
<br />
<div>{{message}}</div>
<br />
<form>
    <input type="hidden" name="Id" [(ngModel)]="model.Id" />
    <div>
        <label>First Name</label>
        <div><input type="text" name="FirstName" [(ngModel)]="model.FirstName" /></div>
    </div>
    <div>
        <label>Last Name</label>
        <div><input type="text" name="LastName" [(ngModel)]="model.LastName" /></div>
    </div>
    <div>
        <label>Phone Number</label>
        <div><input type="text" name="PhoneNumber" [(ngModel)]="model.PhoneNumber" /></div>
    </div>
    <div>
        <label>Email</label>
        <div><input type="text" name="Email" [(ngModel)]="model.Email" /></div>
    </div>
    <div>
        <label>Address</label>
        <div><input type="text" name="Address" [(ngModel)]="model.Address" /></div>
    </div>
    <div>
        <input *ngIf="!model.Id" type="button" (click)="add()" value="Add" />
        <input *ngIf="model.Id" type="button" (click)="save()" value="Save" />
        <input *ngIf="model.Id" type="button" (click)="delete()" value="Delete" />
        <input type="button" (click)="clear()" value="Clear" />
    </div>
</form>
```

### 3.5 執行結果

![ASP.NET Core + Angular 4 教學 - Web Api CRUD 範例執行結果](/images/pasted-48.gif)

## 程式碼下載

[asp-net-core-angular-web-api-crud](https://github.com/johnwu1114/asp-net-core-angular-web-api-crud/commit/5b4f7f3af5dbe2b0e6a08a9a521448c487df86e9)