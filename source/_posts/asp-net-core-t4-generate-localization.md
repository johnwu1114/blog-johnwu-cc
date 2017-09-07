---
title: ASP.NET Core 教學 - T4 Template 產生強行別多國語言
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Localization
  - T4
categories:
  - ASP.NET Core
date: 2017-06-26 22:11:00
featured_image: /images/pasted-202.png
---
![ASP.NET Core 教學 - 多國語言 - 運作方式](/images/pasted-202.png)

之前介紹過 [ASP.NET Core 多國語言](/article/asp-net-core-localization.html) 的設定方式，由於 ASP.NET Core 提供的多語系是使用弱型別，比起過去 ASP.NET 使用強型別來說，非常的不便利。  
本篇將介紹用 Visual Studio 的 T4 Template 製作強行別的多國語言 Class。

<!-- more -->

ASP.NET Core 提供的多語系有幾項缺點：  
1. ASP.NET Core 多語系是使用弱型別，弱型別無法在開發階段判斷 Resource Key 有沒有打錯字  
2. 由於是弱型別，所以在開發時，若不查看 `*.resx` 就不知道有那些 Resource 可以使用  
3. `*.resx` 檔案必須對應 Controller、View 等等的路徑位置，如果同樣的 Resource 在不同 Controller，就要維護好幾份 `*.resx`

> 弱型別
```cs
var hello = _localizer["Hello"];
```
> 強行別
```cs
var hello = _localizer.Text.Hello;
```

## 1. 建立多國語言檔

在網站目錄中建立 Resources 的資料夾，在裡面新增資源檔 `*.resx`。如下：
![ASP.NET Core 教學 - 多國語言 - 新增資源檔 1](/images/pasted-200.png)
![ASP.NET Core 教學 - 多國語言 - 新增資源檔 2](/images/pasted-201.png)

語系檔名稱就可以依照類型自訂，跟 ASP.NET MVC 的命名方式相同如：  
1. Text.en-GB.resx  
2. Message.zh-TW.resx  

> `*.resx` 檔案**必須**要帶語系在後綴。如：`*.en-GB.resx`。  

## 2. T4 Template

在 Resources 資料夾建立副檔名為 `*.tt` 的檔案，如：Localizer.tt。  
> 新增項目可能找不到 `*.tt` 的檔案，可以隨便建一個 `*.txt` 的檔案再把副檔名改為 `*.tt`。  

T4 Template 簡單的說，就是透過程式碼產生程式碼。  
我建立了一個 Localizer.tt 讀取 `*.resx` 的內容，然後產生出 Localizer.cs 的程式碼。  

### 2.1 Localizer.tt

Resources\Localizer.tt
```cs
<#@ template language="C#" hostspecific="true" #>
<#@ output extension=".cs" #>
<#@ assembly name="EnvDTE" #>
<#@ assembly name="System.Core.dll" #>
<#@ assembly name="System.Xml.dll" #>
<#@ assembly name="System.Xml.Linq.dll" #>
<#@ import namespace="EnvDTE" #>
<#@ import namespace="System.Collections.Generic" #>
<#@ import namespace="System.IO" #>
<#@ import namespace="System.Linq" #>
<#@ import namespace="System.Text.RegularExpressions" #>
<#@ import namespace="System.Xml.Linq" #>
<#
  var defaultCulture = "en-gb";
  var resources = GetResourcesByCulture(defaultCulture, this.Host.ResolvePath(""));
#>
namespace Resources
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Xml.Linq;

    public interface ILocalizer
    {
		string Culture { get; set; }

<# foreach (var category in resources) { #>
		<#= category.Key #> <#= category.Key #> { get; }

<# } #>
        string GetString(Type category, string resourceKey);

        string GetString(string category, string resourceKey);

        string GetString(Type category, string resourceKey, string culture);

        string GetString(string category, string resourceKey, string culture);
    }

    public class Localizer : ILocalizer
    {
        private const string DefaultCulture = "<#= defaultCulture #>";
        private const string _resourceFolder = "Resources";
        private static readonly Lazy<Dictionary<string, Dictionary<string, string>>> _resources = new Lazy<Dictionary<string, Dictionary<string, string>>>(LoadResources);
        private string _culture;
<# foreach (var category in resources) { #>
        private <#= category.Key #> _<#= category.Key #>;
<# } #>

        #region ILocalizer

		public string Culture
        {
            get
            {
                if (string.IsNullOrEmpty(_culture))
                {
                    _culture = DefaultCulture;
                }
                return _culture;
            }
            set
            {
                var culture = value;
                if (Regex.IsMatch(culture, @"^[A-Za-z]{2}-[A-Za-z]{2}$"))
                {
                    _culture = culture;
                }
                else
                {
                    _culture = DefaultCulture;
                }
            }
        }
<# foreach (var category in resources) { #>

		public <#= category.Key #> <#= category.Key #> { get { if (_<#= category.Key #> == null) { _<#= category.Key #> = new <#= category.Key #>(this); } return _<#= category.Key #>; } }
<# } #>

        public string GetString(Type category, string resourceKey)
        {
            return GetString(category.Name.ToString(), resourceKey);
        }

        public string GetString(string category, string resourceKey)
        {
            return GetString(category, resourceKey, _culture);
        }

        public string GetString(Type category, string resourceKey, string culture)
        {
            return GetString(category.Name.ToString(), resourceKey, culture);
        }

        public string GetString(string category, string resourceKey, string culture)
        {
            var resource = GetResource($"{category}.{culture}") ?? GetResource($"{category}.{DefaultCulture}");
            if (resource == null)
            {
                return resourceKey;
            }
            else
            {
                return resource.SingleOrDefault(r => r.Key.Contains(resourceKey)).Value ?? resourceKey;
            }
        }

        #endregion ILocalizer

        #region Private Methods

        private static Dictionary<string, Dictionary<string, string>> LoadResources()
        {
            var files = Directory.GetFiles(_resourceFolder, "*.resx");
            var resources = files.ToDictionary(file => Path.GetFileNameWithoutExtension(file), file =>
            {
                var xdoc = XDocument.Load(file);
                var dictionary = xdoc.Root.Elements("data").ToDictionary(e => e.Attribute("name").Value, e => e.Element("value").Value);
                return dictionary;
            }, StringComparer.CurrentCultureIgnoreCase);
            return resources;
        }

        private Dictionary<string, string> GetResource(string key)
        {
            return _resources.Value.SingleOrDefault(r => r.Key.Equals(key, StringComparison.CurrentCultureIgnoreCase)).Value;
        }

        #endregion
    }

    public abstract class ResourceBase
    {
        protected ResourceBase(ILocalizer localizer)
        {
            Localizer = localizer;
        }

        protected ILocalizer Localizer { get; private set; }

        protected string GetString(string resourceKey)
        {
            return Localizer.GetString(GetType(), resourceKey);
        }
    }
<# foreach (var category in resources) { #>

    public class <#= category.Key #> : ResourceBase
    {
        public <#= category.Key #>(ILocalizer localizer) : base(localizer)
        {
        }
<# foreach (var resource in category.Value) { #>

		public string <#= resource.Key #> { get { return GetString("<#= resource.Key #>"); } }
<# } #>
    }
<# } #>
}
<#+
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
#>
```

### 2.2 Localizer.cs

Localizer.cs 是透過 Localizer.tt 自動產生出來的檔案，只要 Localizer.tt 有異動，或者是點右鍵**執行自訂工具**，都會觸發自動產生 Localizer.cs。  
![ASP.NET Core 教學 - 多國語言 - 執行自訂工具](/images/pasted-207.png)  

Resources\Localizer.cs 程式碼內容會跟著 `*.resx` 而變動，大致如下：
```cs
namespace Resources
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Xml.Linq;

    public interface ILocalizer
    {
		string Culture { get; set; }

		Message Message { get; }

		Text Text { get; }

        string GetString(Type category, string resourceKey);

        string GetString(string category, string resourceKey);

        string GetString(Type category, string resourceKey, string culture);

        string GetString(string category, string resourceKey, string culture);
    }

    public class Localizer : ILocalizer
    {
        private const string DefaultCulture = "en-gb";
        private const string _resourceFolder = "Resources";
        private static readonly Lazy<Dictionary<string, Dictionary<string, string>>> _resources = new Lazy<Dictionary<string, Dictionary<string, string>>>(LoadResources);
        private string _culture;
        private Message _Message;
        private Text _Text;

        #region ILocalizer

		public string Culture
        {
            get
            {
                if (string.IsNullOrEmpty(_culture))
                {
                    _culture = DefaultCulture;
                }
                return _culture;
            }
            set
            {
                var culture = value;
                if (Regex.IsMatch(culture, @"^[A-Za-z]{2}-[A-Za-z]{2}$"))
                {
                    _culture = culture;
                }
                else
                {
                    _culture = DefaultCulture;
                }
            }
        }

		public Message Message { get { if (_Message == null) { _Message = new Message(this); } return _Message; } }

		public Text Text { get { if (_Text == null) { _Text = new Text(this); } return _Text; } }

        public string GetString(Type category, string resourceKey)
        {
            return GetString(category.Name.ToString(), resourceKey);
        }

        public string GetString(string category, string resourceKey)
        {
            return GetString(category, resourceKey, _culture);
        }

        public string GetString(Type category, string resourceKey, string culture)
        {
            return GetString(category.Name.ToString(), resourceKey, culture);
        }

        public string GetString(string category, string resourceKey, string culture)
        {
            var resource = GetResource($"{category}.{culture}") ?? GetResource($"{category}.{DefaultCulture}");
            if (resource == null)
            {
                return resourceKey;
            }
            else
            {
                return resource.SingleOrDefault(r => r.Key.Contains(resourceKey)).Value ?? resourceKey;
            }
        }

        #endregion ILocalizer

        #region Private Methods

        private static Dictionary<string, Dictionary<string, string>> LoadResources()
        {
            var files = Directory.GetFiles(_resourceFolder, "*.resx");
            var resources = files.ToDictionary(file => Path.GetFileNameWithoutExtension(file), file =>
            {
                var xdoc = XDocument.Load(file);
                var dictionary = xdoc.Root.Elements("data").ToDictionary(e => e.Attribute("name").Value, e => e.Element("value").Value);
                return dictionary;
            }, StringComparer.CurrentCultureIgnoreCase);
            return resources;
        }

        private Dictionary<string, string> GetResource(string key)
        {
            return _resources.Value.SingleOrDefault(r => r.Key.Equals(key, StringComparison.CurrentCultureIgnoreCase)).Value;
        }

        #endregion
    }

    public abstract class ResourceBase
    {
        protected ResourceBase(ILocalizer localizer)
        {
            Localizer = localizer;
        }

        protected ILocalizer Localizer { get; private set; }

        protected string GetString(string resourceKey)
        {
            return Localizer.GetString(GetType(), resourceKey);
        }
    }

    public class Message : ResourceBase
    {
        public Message(ILocalizer localizer) : base(localizer)
        {
        }

		public string Hello { get { return GetString("Hello"); } }
    }

    public class Text : ResourceBase
    {
        public Text(ILocalizer localizer) : base(localizer)
        {
        }

		public string Hello { get { return GetString("Hello"); } }
    }
}
```

## 3. Startup

在 Startup 註冊自製的 Localizer 服務，以及修改多國語的 Routing 方式。如下：
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Resources;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddScoped<ILocalizer, Localizer>();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{culture=en-GB}/{controller=Home}/{action=Index}/{id?}"
                );
            });
        }
    }
}
```

## 4. Filter 

建立一個 CultureFilter 用來捕捉 Request 進來時的語系資訊。   
```cs
using Microsoft.AspNetCore.Mvc.Filters;
using Resources;
using System.Globalization;
using System.Text.RegularExpressions;

namespace MyWebsite.Filters
{
    public class CultureFilter : IResourceFilter
    {
        private readonly ILocalizer _localizer;

        public CultureFilter(ILocalizer localizer)
        {
            _localizer = localizer;
        }

        public void OnResourceExecuting(ResourceExecutingContext context)
        {
            var culture = context.HttpContext.Request.Path.Value.Split('/')[1];
            var hasCultureFromUrl = Regex.IsMatch(culture, @"^[A-Za-z]{2}-[A-Za-z]{2}$");
            _localizer.Culture = hasCultureFromUrl ? culture : CultureInfo.CurrentCulture.Name;
        }

        public void OnResourceExecuted(ResourceExecutedContext context)
        {
        }
    }
}
```

把 CultureFilter 註冊在需要用到的 Controller 或 Action。如下：
```cs
[TypeFilter(typeof(CultureFilter))]
public class HomeController : Controller
{
    // ...
}
```
> 通常 ASP.NET 網站會伴隨著 API，API 不需要語系資訊，所以不建議註冊在全域。  

## 5. 使用多國語言

### 5.1. Controller

在 Controller 要使用多國語言的話，需要在建構子加入 ILocalizer 參數，執行期間會把 Localizer 的實體注入近來。  
把 Resource Key 丟入 Localizer，就可以得到值。

```cs
// ***
[TypeFilter(typeof(CultureFilter))]
public class HomeController : Controller
{
    private readonly ILocalizer _localizer;

    public HomeController(ILocalizer localizer)
    {
        _localizer = localizer;
    }

    public IActionResult Content()
    {
        return Content($"CurrentCulture: {CultureInfo.CurrentCulture.Name}\r\n"
                     + $"CurrentUICulture: {CultureInfo.CurrentUICulture.Name}\r\n"
                     + $"{_localizer.Text.Hello}");
    }
}
```

### 5.2. View

在 cshtml 注入 ILocalizer，把 Resource Key 丟入 Localizer，就可以得到值。  

```html
@using System.Globalization
@using Resources

@inject ILocalizer localizer

CurrentCulture: @CultureInfo.CurrentCulture.Name <br />
CurrentUICulture: @CultureInfo.CurrentUICulture.Name <br />
@localizer.Text.Hello<br />
```

## 程式碼下載

[asp-net-core-localization-t4](https://github.com/johnwu1114/asp-net-core-localization-t4)

## 參考

[Code Generation and T4 Text Templates](https://msdn.microsoft.com/en-us/library/bb126445.aspx)