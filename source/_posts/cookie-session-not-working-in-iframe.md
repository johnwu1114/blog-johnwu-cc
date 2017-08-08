---
title: IFrame 無法使用 Cookie &amp; Session 問題
author: John Wu
tags:
  - JavaScript
  - Session
  - Cookie
categories:
  - Web Development
date: 2017-04-02 16:03:00
---
由於公司部分產品是以 IFrame 方式嵌入在別人家的頁面裡，在使用 Safari 開啟的情況下，會發生無法使用 Cookie，導致每次的 Request 帶的 Session id 都不一樣。在 Response Header 加入解決 Cross Domain 的 P3P : "CP=CAO PSA OUR" 也沒用。  

實際原因是 Safari 的安全性問題。如果 IFrame 的 Domain 沒有被 Safari 直接存取過，Safari 就不會認可你的 Domain 存取 Cookie。簡單的說就是你只要直接在網址列輸入你的 Domain，Safari 就會認同你的 domain 存取 Cookie。  

改變 Safari 的安全性設定，也可以解掉此問題。但我們的用戶散落在全世界，請他們改設定簡直天方夜譚。所以我用一個偷吃步的方式解掉此問題。  

<!-- more -->

## 情境

如下圖 iframe.com 無法存取 Cookie，導致 Session 也跟著無法使用。由於 parent.com 不是我們能控制跟存取的頁面，所以解決方式只會從 iframe.com 著手。

![Cross Domain IFrame - Can't Access Cookie](/images/pasted-38.png)

## 解法

透過轉址方式將 Parent 轉換成 iframe.com，讓 Safari 認可 iframe.com 存取 Cookie 後，再將網址轉回 parent.com。

### 判斷瀏覽器

當 iframe.con/index 被打開後，先判斷瀏覽器，如果是 Safari，我們就將 window.top 轉向 iframe.com/redirect

``` javascript
/* iframe.con/index */  

var userAgent = navigator.userAgent.toLowerCase();
var isSafari = userAgent.indexOf("safari") != -1 && userAgent.indexOf("chrome") == -1;
var hasCookiePermission = document.cookie.indexOf("hasCookiePermission=true") != -1;

if (isSafari && !hasCookiePermission) {
    window.top.location = "http://iframe.com/redirect?ref=" + document.referrer;
}

```
* Chrome 的 User Agent 會同時出現 Safari 及 Chrome 字串，所以要確保真的是 Safari，User Agent 要排除 Chrome 字串。  
* 為了避免無止盡重導頁面，當取得 Cookie 存取權限後，就要停止重導頁面。  

### 重新轉向到原網址

當 Safari 打開 iframe.com/redirect 時，意味著 iframe.com 已經被認可存取 Cookie 了。所以此時我們只要轉向回原來的頁面即可。

![Cross Domain IFrame - Get Cookie Access Permission](/images/pasted-39.png)

```javascript
/* iframe.com/redirect */  

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var ref = getParameterByName("ref");

document.cookie = "hasCookiePermission=true";
window.location = ref;
```

### 完成

再度回到 parent.com/home 時，iframe.com 就能正常使用 Cookie 跟 Session 了。

![Cross Domain IFrame - Got Cookie Access Permission](/images/pasted-40.png)

## 參考
[Internet Explorer & Safari: IFrame Session Cookie Problem](http://www.mendoweb.be/blog/internet-explorer-safari-third-party-cookie-problem/)