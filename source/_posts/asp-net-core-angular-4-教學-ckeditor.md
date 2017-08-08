---
title: ASP.NET Core + Angular 4 教學 - CKEditor
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - npm
  - TypeScript
  - 'C#'
  - Web Api
  - CKEditor
  - JavaScript
categories:
  - ASP.NET Core
  - Angular
date: 2017-04-23 03:36:00
---
![ASP.NET Core + Angular 4 教學 - CKEditor 範例執行結果](/images/pasted-69.png)

本篇將介紹如何透過 TypeScript 把 CKeditor 包裝成 Angular 4 的 Directive，讓 Angular 4 能更方便使用 CKEditor。  
並建立一個簡單的 ASP.NET Core Web Api 跟 CKEditor 做存取資料的互動。

<!-- more -->

程式碼延續前兩篇的範例：  
[ASP.NET Core + Angular 4 教學 - 從無到有](/article/asp-net-core-angular-4-教學-從無到有.html)  
[ASP.NET Core + Angular 4 教學 - Webpack打包](/article/asp-net-core-angular-4-教學-webpack.html)

## 安裝 npm 套件

安裝 ckeditor，指令如下：
``` batch
npm install --save ckeditor
```

## CKEditor

### CKEditorDirective

因為 CKEditor 是透過 JavaScrupt 調用，為了方便在 Angular 中使用，我建立了一個 CKEditorDirective 包裝 CKEditor 成 Directive。  
經由 CKEditorDirective 包裝後，使用存取 CKEditor 的值都是透過 ngModel，用起來就像 input text 一樣簡單。  
shared\directives\ckeditor.directive.ts
```js
import { Directive, Input, Attribute, Output, EventEmitter, OnChanges } from "@angular/core";

declare var CKEDITOR: any;

@Directive({
    selector: "[ckeditor][id][ngModel]"
})
export class CKEditorDirective implements OnChanges {
    private ckeditor: any;
    @Input() config: any;
    @Input() ngModel: any;
    @Output() ngModelChange = new EventEmitter();

    constructor( @Attribute("id") private id: string) {
        if (CKEDITOR === undefined || !id) {
            throw new Error("The 'CKEDITOR' or the 'id' are not defined...");
        }
    }

    ngAfterViewInit() {
        if (this.ckeditor == null) {
            this.ckeditor = CKEDITOR.replace(this.id, this.config);
        }
        this.ckeditor.on("change", () => this.ngModelChange.emit(this.ckeditor.getData()));
        this.ckeditor.on("instanceReady", () => this.ckeditor.setData(this.ngModel));
    }

    ngOnChanges() {
        if (this.ckeditor) {
            this.ckeditor.setData(this.ngModel);
            this.ngModelChange.emit(this.ngModel);
        }
    }
}
```

### 載入套件

在 NgModule 的 declarations 注入 CKEditorDirective。  
app\main.ts
```js
import { CKEditorDirective } from "./shared/directives/ckeditor.directive";

@NgModule({
    // ...
    declarations: [
        // ...
        CKEditorDirective
    ]
})
export class AppModule { }
```

因為是透過 npm 安裝 CKEditor，所以 CKEditor 相關的 plugins 跟 css 都在 node_modules/ckeditor 資料夾底下。  
在 Startup.cs 的 Configure 加入靜態檔案路由，把 `http://{domain}/ckeditor` 指向 node_modules/ckeditor。  
Startup.cs
```cs
public void Configure(IApplicationBuilder app)
{	
	// ...
	app.UseStaticFiles(new StaticFileOptions()
	{
		FileProvider = new PhysicalFileProvider(
		Path.Combine(Directory.GetCurrentDirectory(), @"node_modules/ckeditor")),
		RequestPath = new PathString("/ckeditor")
	});
}
```

CKEDITOR_BASEPATH 改為 Startup.cs 中設定的 `http://{domain}/ckeditor` 位置，並把 ckeditor 加入參考。  
app\bundle-vendors.ts 加入以下程式碼：
```js
// Define global variable
declare var CKEDITOR_BASEPATH: string;
eval(`CKEDITOR_BASEPATH = "/ckeditor/";`);
require("ckeditor");
```
> CKEDITOR_BASEPATH 一定要在載入 ckeditor 前賦予設定值。

### 範例

app\components\editor.component.html
```html
<h2>Editor</h2>

<div>{{message}}</div>
<br />

<textarea ckeditor id="editor" [(ngModel)]="content" [config]="ckeditorConfig"></textarea>
<div>
    <input type="button" value="Send" (click)="send()" />
    <input type="button" value="Clear" (click)="clear()" />
</div>
```

app\components\editor.component.ts
```js
import { Component } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { ResultModel } from "../shared/models/result.model";

@Component({
    template: require("./editor.component.html")
})
export class EditorComponent {
    private api: string = "/api/editor";
    message: string;
    content: string;
    // config 請參考官網 http://docs.ckeditor.com/#!/api/CKEDITOR.config
    ckeditorConfig: any = {
        height: "300px"
    };

    constructor(private http: Http) {
    }

    ngAfterViewInit() {
        this.http.get(this.api).subscribe(
            (response) => {
                let result: ResultModel = response.json();
                if (!result.IsSuccess) {
                    this.showMessage(result.Message);
                    this.clear();
                } else {
                    this.content = result.Data;
                }
            });
    }

    send(): void {
        this.clearMessage();
        let headers = new Headers({ "Content-Type": "application/json" });
        this.http.put(this.api, JSON.stringify(this.content), { headers: headers }).subscribe(
            (response) => {
                let result: ResultModel = response.json();
                if (!result.IsSuccess) {
                    this.showMessage(result.Message);
                } else {
                    this.showMessage(`Saved successfully`);
                }
            });
    }

    clear(): void {
        this.content = "";
    }

    clearMessage(): void {
        this.message = "";
    }

    showMessage(message: string): void {
        this.message = message;
    }
}
```

Controllers\EditorController.cs
```cs
using Microsoft.AspNetCore.Mvc;
using MyWebsite.Models;

namespace MyWebsite.Controllers
{
    [Route("api/[controller]")]
    public class EditorController : Controller
    {
        private static string _content = string.Empty;

        [HttpGet]
        public ResultModel Get()
        {
            var result = new ResultModel();
            result.Data = _content;
            result.IsSuccess = result.Data != null;
            return result;
        }

        [HttpPut]
        public ResultModel Put([FromBody]string content)
        {
            var result = new ResultModel();
            _content = content;
            result.IsSuccess = true;
            return result;
        }
    }
}
```

## 執行結果

![ASP.NET Core + Angular 4 教學 - CKEditor 範例執行結果](/images/pasted-69.png)

## 範例程式碼

[asp-net-core-angular-ckeditor](https://github.com/johnwu1114/asp-net-core-angular-ckeditor)