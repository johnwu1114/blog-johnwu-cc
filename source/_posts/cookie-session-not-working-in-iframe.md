title: IFrame 無法使用 cookie/session 問題
author: John Wu
tags:
  - Safari
  - Cookie
  - Session
  - Cross domain
categories:
  - Web development
date: 2017-04-02 16:03:00
---
由於公司部分產品是以 IFrame 方式嵌入在別人家的頁面裡，在使用 Safari 開啟的情況下，會發生無法使用 cookie，導致每次的 request 帶的 session id 都不一樣。在 response header 加入解決 cross domain 的 P3P : "CP=CAO PSA OUR" 也沒用。  

實際原因是 Safari 的安全性問題。如果 IFrame 的 domain 沒有被 Safari 直接存取過，Safari 就不會認可你的 domain 存取 cookie。簡單的說就是你只要直接在網址列輸入你的 domain，Safari 就會認同你的 domain 存取 cookie。  

改變 Safari 的安全性設定，也可以解掉此問題。但我們的用戶散落在全世界，請他們改設定簡直天方夜譚。所以我用一個偷吃步的方式解掉此問題。  

## 情境

如下圖 iframe.com 無法存取 cookie，導致 session 也跟著無法使用。由於 parent.com 不是我們能控制跟存取的頁面，所以解決方式只會從 iframe.com 著手。

![](/images/pasted-38.png)

## 解法

透過轉址方式將 Parent 轉換成 iframe.com，讓 Safari 認可 iframe.com 存取 cookie 後，再將網址轉回 parent.com。

### 判斷瀏覽器

當 iframe.con/index 被打開後，先判斷瀏覽器，如果是 Safari，我們就將 window.parent 轉向 iframe.com/redirect

``` javascript
/* iframe.con/index */  

var userAgent = navigator.userAgent.toLowerCase();
if (userAgent.indexOf("safari") != -1 && userAgent.indexOf("chrome") > -1) {
    window.parent.location = "http://iframe.com/redirect?ref=" + window.location.href;
}
```

### 重新轉向到原網址

當 Safari 打開 iframe.com/redirect 時，意味著 iframe.com 已經被認可存取 cookie了。所以此時我們只要轉向回原來的頁面即可。

![](/images/pasted-39.png)

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
window.location = ref;
```

### 完成

再度回到 parent.com/home 時，iframe.com 就能正常使用 cookie 跟 session 了。

![](/images/pasted-40.png)