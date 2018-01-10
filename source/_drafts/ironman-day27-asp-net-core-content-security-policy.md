---
title: '[鐵人賽 Day27] ASP.NET Core 2 系列 - 網頁內容安全政策 (Content Security Policy)'
author: John Wu
tags:
  - ASP.NET Core
  - iT 邦幫忙 2018 鐵人賽
  - CSP
  - Security
  - Middleware
categories:
  - ASP.NET Core
date: 2018-01-15 12:00
featured_image: /images/i27-1.png
---

例如跨網站腳本 (Cross-Site Scripting, XSS) 攻擊是常見的攻擊手法，有效的阻擋方式是透過網頁內容安全政策 (Content Security Policy, CSP) 規範，告知瀏覽器載入的資源或行為是否受信任，阻擋非預期事件，加強網站安全性。  
本篇將介紹 ASP.NET Core 自製 CSP Middleware 防止 XSS 攻擊。  

> iT 邦幫忙 2018 鐵人賽 - Modern Web 組參賽文章：  
 [[Day27] ASP.NET Core 2 系列 - 網頁內容安全政策 (Content Security Policy)](https://ithelp.ithome.com.tw/articles/xxxxxxx)  

<!-- more -->

現行大部分的瀏覽器都有支援 CSP，可以從 [Can I use Content Security Policy](http://caniuse.com/contentsecuritypolicy) 參考支援的瀏覽器及版本。  

CSP 的設定方式有兩種：  
1. HTTP Header 加入 `Content-Security-Policy: {Policy}`  
  當有不符合安全政策的情況，瀏覽器就會提報錯誤， **並終止該行為執行**。  
2. HTTP Header 加入 `Content-Security-Policy-Report-Only: {Policy}`  
  當有不符合安全政策的情況，瀏覽器就會提報錯誤， **但會繼續執行** 。  
  > 主要用於測試用，怕網站直接套上 CSP 導致功能不正常。  
3. HTML 加入 `<meta>`  
  在 HTML `<head>` 區塊加入 `<meta http-equiv="Content-Security-Policy" content="{Policy}">`。  
  當有不符合安全政策的情況，瀏覽器就會提報錯誤， **並終止該行為執行**。  
  > `<meta>` 的方式不支援 **Report-Only** 的方式。  

## CSP 範例

建立一個簡單的範例 HTML，分別載入內外部資源，如下：  

*Views/Home/Index.cshtml*
```html
<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width" />
    <title>CSP Sample</title>

    <link rel="stylesheet" href="/css/fonts.css?csp-sample" />
    <link rel="stylesheet" href="https://blog.johnwu.cc/css/fonts.css?csp-sample" />
</head>

<body>
    <h1>CSP Sample</h1>
    <table>
        <tr>
            <th>類別</th>
            <th>內部資源</th>
            <th>外部資源</th>
        </tr>
        <tr>
            <td>圖片</td>
            <td>
                <img width="100" src="/images/icon.png?csp-sample" />
            </td>
            <td>
                <img width="100" src="https://blog.johnwu.cc/images/icon.png?csp-sample" />
            </td>
        </tr>
        <tr>
            <td>IFrame</td>
            <td>
                <iframe width="180" height="180" src="/home/iframe?csp-sample"></iframe>
            </td>
            <td>
                <iframe width="180" height="180" src="https://ithelp.ithome.com.tw?csp-sample"></iframe>
            </td>
        </tr>
    </table>
    <script src="/js/jquery-2.2.4.min.js?csp-sample"></script>
    <script src="https://blog.johnwu.cc/js/lib/jquery-2.2.4.min.js?csp-sample"></script>
</body>

</html>
```

在未使用 CSP 前，內容都是可以正常顯示，輸出畫面如下：  

![[鐵人賽 Day27] ASP.NET Core 2 系列 - 網頁內容安全政策 (Content Security Policy) - 未使用 CSP 範例](/images/i27-1.png)  

在 `Startup.Configure` 註冊一個 Pipeline，把每個 Requset 都加上 CSP 的 HTTP Header，如下：  

*Startup.cs*
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.Use(async (context, next) =>
            {
                context.Response.Headers.Add(
                    "Content-Security-Policy",
                    "style-src https:; img-src 'self'; frame-src 'none'; script-src 'self';"
                );
                await next();
            });
            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();
        }
    }
}
```

套用 CSP 後，輸出畫面如下：  

![[鐵人賽 Day27] ASP.NET Core 2 系列 - 網頁內容安全政策 (Content Security Policy) - 使用 CSP 範例](/images/i27-2.png)  

## CSP 指令 (Directives)

上圖套用 CSP 後，連內部的 IFrame 都不顯示，主要是因為 CSP 指令的關係。  
CSP 指令可以限制載入資源的類型以及來源的位置，指令的使用格式如下：
```
Response Headers
  Content-Security-Policy: {CSP 指令} {來源}; {CSP 指令} {來源} {..來源..} {來源};
```
> 以 `;` 區分多個指令，以空格區分多個來源。  

常用的 CSP 指令如下：  
* `default-src`  
  預設所有類型的載入都使用這個規則。  
* `connect-src`  
  載入 Ajax、Web Socket 套用的規則。  
* `font-src`  
  載入字型套用的規則。  
* `frame-src`  
  載入 IFrame 套用的規則。  
* `img-src`  
  載入圖片套用的規則。  
* `media-src`  
  載入影音標籤套用的規則。如：`<audio>`、`<video>`等。  
* `object-src`  
  載入非影音標籤物件套用的規則。如：`<object>`、`<embed>`及`<applet>`等。  
* `script-src`  
  載入 JavaScript 套用的規則。  
* `style-src`  
  載入 Stylesheets (CSS) 套用的規則。  
* `report-uri`  
  當瀏覽器發現 CSP 安全性問題時，就會提報錯誤給 `report-uri` 指定的網址。  
  若使用 `Content-Security-Policy-Report-Only` 就需要搭配 `report-uri`。  

> 其他 CSP 指令可以參考 [W3C 的 CSP 規範](https://w3c.github.io/webappsec-csp/#csp-directives)。  

每個 CSP 指令可以限制一個或多個載入來源，來源位置的設定參數如下：  
* `*`  
  允許任何載入來源。  
  如：`default-src *;`，允許載入來自任何地方、任何類型的資源。  
* `'none'`  
  不允許載入任何來源。  
  如：`media-src 'none';`，不允許載入影音標籤。  
* `'self'`
  只允許載入同網域的來源。  
  如：`script-src 'self';`，只允許載入同網域的 `*.js`。  
* URL  
  指定允許載入的 URL，可搭配 `*` 使用。  
  如：`img-src http://cdn.johnwu.cc https:;`，只允許從 `http://cdn.johnwu.cc` 或其他 HTTPS 的來源載入 `*.css`。  

## 建立 CSP Middleware

上述 CSP 套用在 Header 的格式實在很容易打錯字，而且又是弱型別，日後實在不易維護。  
所以可以自製一個 CSP Middleware 來包裝這 CSP，方便日後使用。  

把 CSP 指令都變成強行別，如下：  

* *CspDirective.cs*
```cs
public class CspDirective
{
    private readonly string _directive;

    internal CspDirective(string directive)
    {
        _directive = directive;
    }
    private List<string> _sources { get; set; } = new List<string>();
    public CspDirective AllowAny() => Allow("*");
    public CspDirective Disallow() => Allow("'none'");
    public CspDirective AllowSelf() => Allow("'self'");
    public CspDirective Allow(string source)
    {
        _sources.Add(source);
        return this;
    }
    public override string ToString() => _sources.Count > 0
        ? $"{_directive} {string.Join(" ", _sources)}; " : "";
}
```
* *CspOptions.cs*
```cs
public class CspOptions
{
    public bool ReadOnly { get; set; }
    public CspDirective Defaults { get; set; } = new CspDirective("default-src");
    public CspDirective Connects { get; set; } = new CspDirective("connect-src");
    public CspDirective Fonts { get; set; } = new CspDirective("font-src");
    public CspDirective Frames { get; set; } = new CspDirective("frame-src");
    public CspDirective Images { get; set; } = new CspDirective("img-src");
    public CspDirective Media { get; set; } = new CspDirective("media-src");
    public CspDirective Objects { get; set; } = new CspDirective("object-src");
    public CspDirective Scripts { get; set; } = new CspDirective("script-src");
    public CspDirective Styles { get; set; } = new CspDirective("style-src");
    public string ReportURL { get; set; }
}
```

然後建立 CSP 的 Middleware，如下：  

*CspMiddleware.cs*
```cs
public class CspMiddleware
{
    private readonly RequestDelegate _next;
    private readonly CspOptions _options;

    public CspMiddleware(RequestDelegate next, CspOptions options)
    {
        _next = next;
        _options = options;
    }

    private string Header => _options.ReadOnly
        ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";

    private string HeaderValue
    {
        get 
        {
          var stringBuilder = new StringBuilder();
          stringBuilder.Append(_options.Defaults);
          stringBuilder.Append(_options.Connects);
          stringBuilder.Append(_options.Fonts);
          stringBuilder.Append(_options.Frames);
          stringBuilder.Append(_options.Images);
          stringBuilder.Append(_options.Media);
          stringBuilder.Append(_options.Objects);
          stringBuilder.Append(_options.Scripts);
          stringBuilder.Append(_options.Styles);
          if (!string.IsNullOrEmpty(_options.ReportURL))
          {
              stringBuilder.Append($"report-uri {_options.ReportURL};");
          }
          return stringBuilder.ToString();
        }
    }
    
    public async Task Invoke(HttpContext context)
    {
        context.Response.Headers.Add(Header, HeaderValue);
        await _next(context);
    }
}
```

再用一個靜態方法包 CSP Middleware，方便註冊使用，如下：  

*CspMiddlewareExtensions.cs*
```cs
public static class CspMiddlewareExtensions
{
    public static IApplicationBuilder UseCsp(this IApplicationBuilder app, CspOptions options)
    {
        return app.UseMiddleware<CspMiddleware>(options);
    }
    public static IApplicationBuilder UseCsp(this IApplicationBuilder app, Action<CspOptions> optionsDelegate)
    {
        var options = new CspOptions();
        optionsDelegate(options);
        return app.UseMiddleware<CspMiddleware>(options);
    }
}
```

把原本註冊在 `Startup.Configure` 的 Pipeline 改成用 `UseCsp` 註冊，如下：  

*Startup.cs*
```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace MyWebsite
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app)
        {
            // app.Use(async (context, next) =>
            // {
            //     context.Response.Headers.Add(
            //         "Content-Security-Policy",
            //         "style-src https:; img-src 'self'; frame-src 'none'; script-src 'self';"
            //     );
            //     await next();
            // });
            app.UseCsp(options =>
            {
                options.Styles.Allow("https:");
                options.Images.AllowSelf();
                options.Frames.Disallow();
                options.Scripts.AllowSelf();
            });
            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();
        }
    }
}
```
一樣的 CSP 規則，強行別的註冊方式看起來感覺清爽多了。  

## X-Frame-Options

*CspOptions.cs*
```cs
public class CspOptions
{
    // ...
    public string XFrameOptions  { get; set; } = "SAMEORIGIN";
}
```

*CspMiddleware.cs*
```cs
public class CspMiddleware
{
    // ...

    private string XFrameOptionsValue
    {
        get
        {
            if (Regex.IsMatch(_options.XFrameOptions, "(?i)^(deny|sameorigin)$"))
            {
                return _options.XFrameOptions;
            }
            return $"ALLOW-FROM {_options.XFrameOptions}";
        }
    }

    public async Task Invoke(HttpContext context)
    {
        context.Response.Headers.Add(Header, HeaderValue);
        context.Response.Headers.Add("X-Frame-Options", XFrameOptionsValue);
        await _next(context);
    }
}
```

*Startup.cs*
```cs
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseCsp(options =>
        {
            // ...
            options.XFrameOptions = "https://blog.johnwu.cc";
        });
        // ...
    }
}
```

## 參考

[USING CSP HEADER IN ASP.NET CORE 2.0](https://tahirnaushad.com/2017/09/12/using-csp-header-in-asp-net-core-2-0/)  
[Content Security Policy Level 3](https://w3c.github.io/webappsec-csp/)  
[Content-Security-Policy - HTTP Headers 的資安議題 (2)](https://devco.re/blog/2014/04/08/security-issues-of-http-headers-2-content-security-policy/)  