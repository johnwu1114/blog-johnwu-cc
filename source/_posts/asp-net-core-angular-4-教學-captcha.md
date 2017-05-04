title: ASP.NET Core + Angular 4 教學 - Captcha
author: John Wu
tags:
  - ASP.NET Core
  - Angular
  - TypeScript
  - 'C#'
  - Web Api
  - Routing
categories:
  - ASP.NET Core
  - Angular
date: 2017-05-04 23:21:00
---
![ASP.NET Core + Angular 4 教學 - Captcha 範例執行結果](/images/pasted-110.gif)

本篇將介紹用 ASP.NET Core 自製圖形驗證碼，Angular 4 做登入頁面的範例跟 ASP.NET Core 互動。

<!-- more -->

程式碼延續前兩篇的範例：  
[ASP.NET Core + Angular 4 教學 - 從無到有](/article/asp-net-core-angular-4-教學-從無到有.html)  
[ASP.NET Core + Angular 4 教學 - Webpack打包](/article/asp-net-core-angular-4-教學-webpack.html)

## 1. 安裝 NuGet 套件

由於我是要自己畫出圖形驗證碼，需要用到 System.Drawing，但現在微軟官方並沒有出 .NET Core 的 System.Drawing 可以使用。  
總是有高手會出手相救，CoreCompat.System.Drawing 把 .NET Framework 的 System.Drawing 實作的相當完整，用起來也跟 .NET Framework 的 System.Drawing 一樣。  
不過目前 CoreCompat.System.Drawing 還是 beta 版，所以要勾選搶鮮版才會找的到。  
以下是我用到的 NuGet 套件：
![ASP.NET Core + Angular 4 教學 - Captcha 安裝 NuGet 套件](/images/pasted-110.png)

## 2. 建立 Web Api

我建了一個 AuthenticationController 要給登入頁面使用，有 4 支 Api 可以調用，分別是：  
1. HttpGet /api/authentication 取得已登入的帳號  
2. HttpPost /api/authentication 登入  
3. HttpDelete /api/authentication 登出  
4. HttpGet /api/authentication/captcha 取得圖形驗證碼  

程式碼如下：
```cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyWebsite.BLL;
using MyWebsite.Models;
using System;

namespace MyWebsite.Controllers
{
    [Route("api/[controller]")]
    public class AuthenticationController : Controller
    {
        private const string _captchaHashKey = "CaptchaHash";
        private const string _usernameHashKey = "Username";

        // 我習慣用強型別包裝 Session
        private string CaptchaHash
        {
            get
            {
                return HttpContext.Session.GetString(_captchaHashKey) as string;
            }
            set
            {
                HttpContext.Session.SetString(_captchaHashKey, value);
            }
        }

        // 我習慣用強型別包裝 Session
        private string Username
        {
            get
            {
                return HttpContext.Session.GetString(_usernameHashKey) as string;
            }
            set
            {
                HttpContext.Session.SetString(_usernameHashKey, value);
            }
        }

        private CaptchaBLL captchaBLL = new CaptchaBLL();

        [HttpGet]
        public ResultModel Get()
        {
            var result = new ResultModel();
            if (!string.IsNullOrEmpty(Username))
            {
                result.Data = Username;
            }
            result.IsSuccess = true;
            return result;
        }

        [HttpPost]
        public ResultModel Post([FromBody]dynamic body)
        {
            var result = new ResultModel();
            try
            {
                string username = body.username.Value;
                string password = body.password.Value;
                string code = body.code.Value;

                if (!captchaBLL.ComputeMd5Hash(code).Equals(CaptchaHash))
                {
                    result.Message = "驗證碼輸入錯誤。";
                }
                else if (!username.Equals("john") || !password.Equals("1234"))
                {
                    result.Message = "帳號或密碼錯誤。";
                }
                else
                {
                    Username = username;
                    HttpContext.Session.Remove(_captchaHashKey);
                    result.IsSuccess = true;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
            }
            return result;
        }

        [HttpDelete]
        public ResultModel Delete()
        {
            var result = new ResultModel();
            HttpContext.Session.Remove(_usernameHashKey);
            result.IsSuccess = true;
            return result;
        }

        [Route("captcha")]
        [HttpGet]
        public ActionResult GetCaptcha()
        {
            // 隨機產生四個字元
            var randomText = captchaBLL.GenerateRandomText(4);
            // 加密後存在 Session，也可以不用加密，比對時一致就好。
            CaptchaHash = captchaBLL.ComputeMd5Hash(randomText);
            // 回傳 gif 圖檔
            return File(captchaBLL.GenerateCaptchaImage(randomText), "image/gif");
        }
    }
}
```

## 3. 自製圖形驗證碼

我把產生圖形驗證碼的邏輯包裝在 CaptchaBLL。如下：
```cs
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace MyWebsite.BLL
{
    public class CaptchaBLL
    {
        /// <summary>
        /// 圖片寬度
        /// </summary>
        private const int _imageWidth = 80;

        /// <summary>
        /// 圖片高度
        /// </summary>
        private const int _imageHeight = 30;

        /// <summary>
        /// 數值越高越亮 越低越暗 0-255
        /// </summary>
        private const int _textColorDepth = 80;

        /// <summary>
        /// 數值越高越亮 越低越暗 0-255
        /// </summary>
        private const int _interferenceColorDepth = 200;

        /// <summary>
        /// 驗證碼會隨機產生的字元，如果要用英數大小寫，會避開 l1Oo0 之類的。
        /// </summary>
        //private const string _chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
        //private const string _chars = "abdefghjknpqrstuwyABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        private const string _chars = "0123456789";

        /// <summary>
        /// 亂數產生器
        /// </summary>
        private readonly static Random _random = new Random();

        /// <summary>
        /// 背景顏色
        /// </summary>
        private readonly static Color _backGroundColor = Color.White;

        /// <summary>
        /// 隨機每個驗證碼字元的字體列表
        /// </summary>
        private readonly static List<Font> _fonts = new string[]  {
                    "Arial", "Arial Black", "Calibri", "Cambria", "Verdana",
                    "Trebuchet MS", "Palatino Linotype", "Georgia", "Constantia",
                    "Consolas", "Comic Sans MS", "Century Gothic", "Candara",
                    "Courier New", "Times New Roman"
                }.Select(f => new Font(f, 18, FontStyle.Bold | FontStyle.Italic)).ToList();

        /// <summary>
        /// 加密字串
        /// </summary>
        /// <param name="input">明文</param>
        /// <returns>密文</returns>
        public string ComputeMd5Hash(string input)
        {
            var encoding = new ASCIIEncoding();
            var bytes = encoding.GetBytes(input);
            var md5Hasher = MD5.Create();
            return BitConverter.ToString(md5Hasher.ComputeHash(bytes));
        }

        /// <summary>
        /// 產生驗證碼的圖片
        /// </summary>
        /// <param name="text">驗證碼</param>
        /// <returns>圖片</returns>
        public byte[] GenerateCaptchaImage(string text)
        {
            using (var bmpOut = new Bitmap(_imageWidth, _imageHeight))
            {
                float orientationAngle = _random.Next(0, 359);
                var g = Graphics.FromImage(bmpOut);
                var gradientBrush = new LinearGradientBrush(
                    new Rectangle(0, 0, _imageWidth, _imageHeight),
                    _backGroundColor, _backGroundColor,
                    orientationAngle
                );
                g.FillRectangle(gradientBrush, 0, 0, _imageWidth, _imageHeight);

                int tempRndAngle = 0;
                // 用迴圈目的為讓每一個字的顏色跟角度都不一樣
                for (int i = 0; i < text.Length; i++)
                {
                    // 改變角度
                    tempRndAngle = _random.Next(-5, 5);
                    g.RotateTransform(tempRndAngle);

                    // 改變顏色
                    g.DrawString(
                        text[i].ToString(),
                        _fonts[_random.Next(0, _fonts.Count)],
                        new SolidBrush(GetRandomColor(_textColorDepth)),
                        i * _imageWidth / (text.Length + 1) * 1.2f,
                        (float)_random.NextDouble()
                    );

                    g.RotateTransform(-tempRndAngle);
                }

                InterferenceLines(ref g, text.Length * 2);

                ArraySegment<byte> bmpBytes;
                using (var ms = new MemoryStream())
                {
                    bmpOut.Save(ms, ImageFormat.Gif);
                    ms.TryGetBuffer(out bmpBytes);
                    bmpOut.Dispose();
                    ms.Dispose();
                }

                return bmpBytes.ToArray();
            }
        }

        /// <summary>
        /// 隨機產生驗證碼
        /// </summary>
        /// <param name="textLength">要幾個字元</param>
        /// <returns>驗證碼</returns>
        public string GenerateRandomText(int textLength)
        {
            var result = new string(Enumerable.Repeat(_chars, textLength)
                  .Select(s => s[_random.Next(s.Length)]).ToArray());
            return result.ToUpper();
        }

        /// <summary>
        /// 隨機劃出干擾線
        /// </summary>
        /// <param name="g">畫布</param>
        /// <param name="lines">干擾線數量</param>
        private static void InterferenceLines(ref Graphics g, int lines)
        {
            for (var i = 0; i < lines; i++)
            {
                var pan = new Pen(GetRandomColor(_interferenceColorDepth));
                var points = new Point[_random.Next(2, 5)];
                for (int pi = 0; pi < points.Length; pi++)
                {
                    points[pi] = new Point(_random.Next(0, _imageWidth), _random.Next(0, _imageHeight));
                }
                // 用多個點建立扭曲的弧線
                g.DrawCurve(pan, points);
            }
        }

        /// <summary>
        /// 隨機產生顏色
        /// </summary>
        /// <param name="depth">顏色深度</param>
        /// <returns>顏色</returns>
        private static Color GetRandomColor(int depth)
        {
            int red = _random.Next(depth);
            int green = _random.Next(depth);
            int blue = (red + green > 400) ? 0 : 400 - red - green;
            blue = (blue > depth) ? depth : blue;
            return Color.FromArgb(red, green, blue);
        }
    }
}
```

## 4. Angular

Web Api 完成後，就來建立 Angular 的 UI 互動。  
我把圖形驗證碼設為 input text 的背景圖，每當 /api/authentication/captcha 被呼叫的時候，驗證碼就會刷新，為了避免瀏覽器暫存，我在 URL 後面加上了時間當作 query string。  

app.component.html
```html
<h1>{{title}}</h1>

<div>{{message}}</div>
<br />

<form *ngIf="!isLogin">
    <div>
        <label>Username</label>
        <input type="text" name="username" [(ngModel)]="username" />
    </div>
    <div>
        <label>Password</label>
        <input type="password" name="password" [(ngModel)]="password" />
    </div>
    <div>
        <label>Captcha</label>
        <input type="text" name="code" [(ngModel)]="code" class="captcha"
               [ngStyle]="{'background-image': 'url(' + captchaUrl + ')'}" />
    </div>
    <div class="center">
        <input type="button" value="Login" (click)="login()" />
        <input type="button" value="Clear" (click)="clear()" />
    </div>
</form>

<div *ngIf="isLogin">
    Hello~ {{username}}
    <input type="button" value="Logout" (click)="logout()" />
</div>
```

app.component.ts
```js
import { Component } from "@angular/core";
import { Http } from "@angular/http";

class ResultModel {
    public isSuccess: boolean;
    public message: string;
    public data: any;
}

@Component({
    selector: "my-app",
    template: require("./app.component.html"),
    styles: [require("./app.component.css")]
})
export class AppComponent {
    private api: string = "/api/authentication";
    private captchaUrl: string = `${this.api}/captcha`;
    title: string = "Login";
    isLogin: boolean;
    message: string;
    username: string;
    password: string;
    code: string;

    constructor(private http: Http) {
        this.loadUserInfo();
    }

    loadUserInfo(): void {
        this.http.get(this.api).subscribe(
            (response) => {
                let result: ResultModel = response.json();
                if (!result.isSuccess) {
                    this.showMessage(result.message);
                } else if (result.data) {
                    this.username = result.data as string;
                    this.isLogin = true;
                } else {
                    this.clear();
                }
            });
    }

    login(): void {
        this.clearMessage();
        this.http.post(this.api,
            {
                username: this.username,
                password: this.password,
                code: this.code
            }).subscribe(
            (response) => {
                let result: ResultModel = response.json();
                if (!result.isSuccess) {
                    this.showMessage(result.message);
                    this.resetCaptcha();
                } else {
                    this.showMessage(`Login successfully`);
                    this.isLogin = true;
                }
            });
    }

    logout(): void {
        this.http.delete(this.api).subscribe(
            (response) => {
                let result: ResultModel = response.json();
                if (!result.isSuccess) {
                    this.showMessage(result.message);
                } else {
                    this.clear();
                }
            });
    }

    resetCaptcha(): void {
        this.code = "";
        this.captchaUrl = `${this.api}/captcha?${Date.now()}`;
    }

    clear(): void {
        this.isLogin = false;
        this.username = "";
        this.password = "";
        this.resetCaptcha();
        this.clearMessage();
    }

    clearMessage(): void {
        this.message = "";
    }

    showMessage(message: string): void {
        this.message = message;
    }
}
```

## 執行結果

![ASP.NET Core + Angular 4 教學 - Captcha 範例執行結果](/images/pasted-110.gif)

## 程式碼下載

[asp-net-core-angular-captcha](https://github.com/johnwu1114/asp-net-core-angular-captcha)