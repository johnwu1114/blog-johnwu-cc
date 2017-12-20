---
title: ASP.NET Core + Angular 4 教學 - T4 Template 產生 JavaScript 多國語言
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - TypeScript
  - JavaScript
  - Localization
  - 'C#'
  - T4
categories:
  - ASP.NET Core
  - Angular
date: 2017-07-20 21:03:00
featured_image: /images/logo-asp-net-core-angular.png
---
![ASP.NET Core + Angular 4 教學 - T4 Template 產生多國語言](/images/logo-asp-net-core-angular.png)

之前介紹過 [ASP.NET Core 教學 - T4 Template 產生強型別多國語言](/article/asp-net-core-t4-generate-localization.html)，JavaScript 的多國語言也可以透過 T4 Template 建立出來。  
本篇將介紹用 T4 Template 製作 JavaScript 的多國語言檔，同時產生 Angular 需要的 TypeScript 定義檔。  

<!-- more -->

## 1. 建立多國語言檔

在網站目錄中建立 Resources 的資料夾，在裡面新增資源檔 `*.resx`。如下：
![ASP.NET Core 教學 - 多國語言 - 新增資源檔 1](/images/pasted-200.png)
![ASP.NET Core 教學 - 多國語言 - 新增資源檔 2](/images/pasted-201.png)

語系檔名稱就可以依照類型自訂，跟 ASP.NET MVC 的命名方式相同如：  
1. Text.en-GB.resx  
2. Text.zh-TW.resx  
3. Message.en-GB.resx  
4. Message.zh-TW.resx  

> `*.resx` 檔案**必須**要帶語系在後綴。如：`*.en-GB.resx`。  

我的範例產生了四個資源檔，內容如下：
![ASP.NET Core + Angular 4 教學 - T4 Template 產生多國語言 - 資源檔](/images/pasted-237.png)

## 2. T4 Template

在 Resources 資料夾建立副檔名為 `*.tt` 的檔案，如：JsLocalizationGenerator.tt。  
> 新增項目可能找不到 `*.tt` 的檔案，可以隨便建一個 `*.txt` 的檔案再把副檔名改為 `*.tt`。  

T4 Template 簡單的說，就是透過程式碼產生程式碼。  
我建立了一個 JsLocalizationGenerator.tt 讀取 `*.resx` 的內容，然後產生出 `lang.d.ts` 的定義檔及 `{culture}.js` 的語系檔。  

Resources\JsLocalizationGenerator.tt
```cs
<#@ template language="C#" hostspecific="true" #>
<#@ output extension=".js" #>
<#@ assembly name="EnvDTE" #>
<#@ assembly name="System.Core.dll" #>
<#@ assembly name="System.Xml.dll" #>
<#@ assembly name="System.Xml.Linq.dll" #>
<#@ import namespace="EnvDTE" #>
<#@ import namespace="System.Collections.Generic" #>
<#@ import namespace="System.IO" #>
<#@ import namespace="System.Linq" #>
<#@ import namespace="System.Text" #>
<#@ import namespace="System.Text.RegularExpressions" #>
<#@ import namespace="System.Xml.Linq" #>
<#
	var defaultCulture = "en-gb";
	var resourceFolder = this.Host.ResolvePath("");
	var definitionPath = "../wwwroot/app/definitions";
	var jsLangPath = "../wwwroot/js/lang";
	var resources = GetResourcesByCulture(defaultCulture, resourceFolder);

	CreateFolderIfNotExists(Path.Combine(resourceFolder, definitionPath));
	CreateDefinition(Path.Combine(resourceFolder, definitionPath, "lang.d.ts"), resources);

	CreateFolderIfNotExists(Path.Combine(resourceFolder, jsLangPath));
	foreach (var culture in GetCultures(resourceFolder)){
		resources = GetResourcesByCulture(culture, resourceFolder);
		CreateJsLocalization(Path.Combine(resourceFolder, jsLangPath, culture+".js"), resources);
    }
#>
<#+
	void CreateFolderIfNotExists(string path){
		bool folderExists = Directory.Exists(path);
		if (!folderExists){
			Directory.CreateDirectory(path);
		}
    }

	List<string> GetCultures(string resourceFolder) {
		var files = Directory.GetFiles(resourceFolder, "*.resx");
		var cultures = files.Select(file=>Path.GetFileNameWithoutExtension(file).Split('.').Last().ToLower()).Distinct();
		return cultures.ToList();
	}

	Dictionary<string, Dictionary<string, string>> GetResourcesByCulture(string culture, string resourceFolder) {
        var files = Directory.GetFiles(resourceFolder, "*.resx");
		var resources = files.GroupBy(file =>
			{
				var fileName = Path.GetFileNameWithoutExtension(file).Split('.');
				return fileName.First();
			}).ToDictionary(g => g.Key, g =>
			{
				var defaultFile = g.Single(s => s.IndexOf(culture, StringComparison.CurrentCultureIgnoreCase) != -1);
				var xdoc = XDocument.Load(defaultFile);
				var dictionary = xdoc.Root.Elements("data").ToDictionary(e => e.Attribute("name").Value, e => e.Element("value").Value);
				return dictionary;
			});
		return resources;
	}

	void CreateDefinition(string path, Dictionary<string, Dictionary<string, string>> resources){
		var stringBuilder = new StringBuilder();
		stringBuilder.Append(@"interface R {");
		foreach (var category in resources) {
			stringBuilder.Append(string.Format("{0}: {{", category.Key));
			foreach (var resource in category.Value) {
				stringBuilder.Append(string.Format("{0}: string;",resource.Key));
			}
			stringBuilder.Append(@"};");
		}
		stringBuilder.Append(@"}");
		stringBuilder.Append(@"declare var R:R;");
		File.WriteAllText(path, stringBuilder.ToString());
    }

	void CreateJsLocalization(string path, Dictionary<string, Dictionary<string, string>> resources){
		var stringBuilder = new StringBuilder();
		stringBuilder.Append(@"var R = {");
		foreach (var category in resources) {
			stringBuilder.Append(string.Format("{0}: {{", category.Key));
			foreach (var resource in category.Value) {
				stringBuilder.Append(string.Format("{0}: \"{1}\",",resource.Key,resource.Value));
			}
			stringBuilder.Append(@"},");
		}
		stringBuilder.Append(@"}");
		File.WriteAllText(path, stringBuilder.ToString());
	}
#>
```

## 3. Output

只要 JsLocalizationGenerator.tt 有異動，或者是點右鍵**執行自訂工具**，就會觸發自動產生 `lang.d.ts` 定義檔及 `{culture}.js` 語系檔。  
![ASP.NET Core 教學 - 多國語言 - 執行自訂工具](/images/pasted-207.png)  

我在 JsLocalizationGenerator.tt 中指定了 `lang.d.ts` 定義檔及 `{culture}.js` 語系檔的輸出位置，如上述範例輸出的檔案內容如下：

wwwroot/app/definitions/lang.d.ts
```ts
interface R {
    Message: {
        InternalServerError: string;
    };
    Text: {
        Login: string;
        Password: string;
        Send: string;
        UserName: string;
    };
}
declare var R: R;
```

wwwroot/js/lang/en-gb.js
```ts
var R = {
    Message: {
        InternalServerError: "Internal Server Error",
    },
    Text: {
        Login: "Login",
        Password: "Password",
        Send: "Send",
        UserName: "User Name",
    },
}
```

wwwroot/js/lang/zh-tw.js
```ts
var R = {
    Message: {
        InternalServerError: "內部伺服器發生錯誤",
    },
    Text: {
        Login: "登入",
        Password: "密碼",
        Send: "送出",
        UserName: "帳號",
    },
}
```
> 實際產出不會排版，會連成同一行

## 4. 載入語系

取得 culture 的資訊，載入對應的語系檔。  
Views\Home\index.html
```html
@using System.Text.RegularExpressions
@using System.Globalization

@{
    var culture = Context.Request.Path.Value.Split('/')[1];
    var hasCultureFromUrl = Regex.IsMatch(culture, @"^[A-Za-z]{2}-[A-Za-z]{2}$");
    culture = hasCultureFromUrl ? culture : CultureInfo.CurrentCulture.Name;
}

<!DOCTYPE html>
<html>
<head>
    <title>MyAngular4</title>
    <base href="/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="/node_modules/core-js/client/shim.min.js"></script>
    <script src="/node_modules/zone.js/dist/zone.js"></script>
    <script src="/node_modules/systemjs/dist/system.src.js"></script>
    <script src="/systemjs.config.js"></script>
    <script>
        System.import("/app/main.js").catch(function (err) { console.error(err); });
    </script>
</head>
<body>
    <my-app>Loading...</my-app>
    <script src="/js/lang/@(culture).js"></script>
</body>
</html>
```

wwwroot\app\app.component.ts
```ts
import { Component } from "@angular/core";
@Component({
    selector: "my-app",
    templateUrl: "/app/app.component.html"
})
export class AppComponent {
    login = R.Text.Login;
    password = R.Text.Password;
    username = R.Text.UserName;
    send = R.Text.Send;
    internalServerError = R.Message.InternalServerError;
}
```

wwwroot\app\app.component.html
```html
<a href="/en-gb">en-gb</a> | <a href="/zh-tw">zh-tw</a>

<p>Login = {{login}}</p>
<p>Password = {{password}}</p>
<p>UserName = {{username}}</p>
<p>Send = {{send}}</p>
<p>InternalServerError = {{internalServerError}}</p>
```

## 程式碼下載

[asp-net-core-angular-localization-t4](https://github.com/johnwu1114/asp-net-core-angular-localization-t4)

## 相關文章

[ASP.NET Core 教學 - T4 Template 產生強型別多國語言](/article/asp-net-core-t4-generate-localization.html)  
[Angular 4 教學 - 多國語言](/article/angular-4-localization.html)  
[ASP.NET Core 教學 - 多國語言](/article/asp-net-core-localization.html)  