---
title: SEO - 網頁插入 Alexa Ranking Widget
author: John Wu
tags:
  - SEO
  - JavaScript
categories:
  - SEO
date: 2017-09-09 00:09:00
---
![SEO - 網頁插入 Alexa Ranking Widget - Site Status](/images/x339.png)

一個無法查證的傳說，讓網站跟 Alexa 互動，可以增加 Ranking 排名，進而影響 SEO 成效。  
本篇要來介紹一下，如何在網頁中插入 Alexa Ranking Widget。  

<!-- more -->

## 前言

雖然沒有辦法證實網站跟 Alexa 互動能提升 SEO，但是掛載在網頁上也不是什麼壞事，可以知道自己網站的競爭力。  

[Alexa 官方公告](
https://support.alexa.com/hc/en-us/articles/201514680-Alexa-widgets-have-been-retired-October-2016)已經在 2016 年 10 月終止了 Alexa Ranking Widget 服務。  
(**先不要離開！！！**)  
但是，到本文發佈時，API 都還是活著的！  
> 在閱讀本文時，下面的範例如果都還看的到圖片，表示都還有效。  
> 偶而會看到它顯示 *No data*，似乎是取的太頻繁才會這樣。  

要使用 Alexa Ranking Widget 不需要註冊，直要在網頁上插入一段 `<script />` 載入 JavaScript 即可。  
Alexa Ranking Widget 提供了 2 種類型，各有 3 種大小格式。如下：

## Alexa Traffic Rank

Traffic Rank 會顯示網站在全球網站中的流量排名。  

在網頁中想要顯示 Alexa Ranking Widget 的地方插入程式碼：
```html
<!-- 120 x 65 -->
<script type="text/javascript" 
        src="http://xslt.alexa.com/site_stats/js/t/a?url=blog.johnwu.cc">
</script>

<!-- 120 x 90 -->
<script type="text/javascript" 
        src="http://xslt.alexa.com/site_stats/js/t/b?url=blog.johnwu.cc">
</script>

<!-- 468 x 60 -->
<script type="text/javascript" 
        src="http://xslt.alexa.com/site_stats/js/t/c?url=blog.johnwu.cc">
</script>
```
> `url=blog.johnwu.cc` 換成自己網站的 Domain。

![SEO - 網頁插入 Alexa Ranking Widget - Traffic Rank](/images/x338.png)

## Alexa Site Status

Site Status 除了會顯示 Traffic Rank 還會多加顯示外部網站連入的數量。  

```html
<!-- 120 x 95 -->
<script type="text/javascript" 
        src="http://xslt.alexa.com/site_stats/js/s/a?url=blog.johnwu.cc">
</script>

<!-- 120 x 240 -->
<script type="text/javascript" 
        src="http://xslt.alexa.com/site_stats/js/s/b?url=blog.johnwu.cc">
</script>

<!-- 468 x 60 -->
<script type="text/javascript" 
        src="http://xslt.alexa.com/site_stats/js/s/c?url=blog.johnwu.cc">
</script>
```

![SEO - 網頁插入 Alexa Ranking Widget - Site Status](/images/x339.png)

## 修正 Alexa Ranking Widget

雖然插入程式碼後，成功的顯示了 Alexa Ranking 資訊，但是超連結是壞的！  
如本文開頭所說，Alexa Ranking Widget 就停止更新了啊！改了位置導致異常也是很合理的事。  

我小改了 `http://xslt.alexa.com/site_stats/js`，並上傳到我部落格的 CDN，所以你可以改用以下程式碼插入至你的網站：  
```html
<!-- Traffic Rank 120 x 65 -->
<script type="text/javascript" 
        src="https://blog.johnwu.cc/js/site-stats.min.js?p=sa&url=blog.johnwu.cc">
</script>

<!-- Traffic Rank 120 x 90 -->
<script type="text/javascript" 
        src="https://blog.johnwu.cc/js/site-stats.min.js?p=sb">
</script>

<!-- Traffic Rank 468 x 60 -->
<script type="text/javascript" 
        src="https://blog.johnwu.cc/js/site-stats.min.js?p=sc">
</script>

<!-- Site Status 120 x 95 -->
<script type="text/javascript" 
        src="https://blog.johnwu.cc/js/site-stats.min.js?p=ta">
</script>

<!-- Site Status 120 x 240 -->
<script type="text/javascript" 
        src="https://blog.johnwu.cc/js/site-stats.min.js?p=tb">
</script>

<!-- Site Status 468 x 60 -->
<script type="text/javascript" 
        src="https://blog.johnwu.cc/js/site-stats.min.js?p=tc">
</script>
```
> `&url={Your doamin}` 這個參數可以省略掉，我直接從 `document.location.hostname` 取得 Domain。

範例結果：  
<script type="text/javascript" src="/js/site-stats.min.js?p=sa"></script>

修正後的 `http://xslt.alexa.com/site_stats/js` JavaScript 程式碼如下：
```js
function AlexaSiteStatsWidget() {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var jsUrlRegex = /http[s]?:\/\/.*\/js\/site-stats\.min\.js.?p=(.)(.)((?:[&]|&amp;)url=([^\?&]*))?/i;
    var imageSrcPrefix = "http://xsltcache.alexa.com/site_stats/gif/";
    var detailURLPrefix = "https://www.alexa.com/siteinfo/";

    this.replaceScripts = function replaceScripts() {
        var scriptElements = document.getElementsByTagName("script");
        var thisScript = scriptElements[scriptElements.length - 1];
        var scriptSource = thisScript.src;
        if (scriptSource != null) {
            var urlMatched = scriptSource.match(jsUrlRegex);
            var decodedURL = decodeURIComponent(urlMatched[4] || document.location.hostname);
            if (urlMatched != null) {
                var base64EncodedURL = encode64(decodedURL);
                var imageURL = imageSrcPrefix + urlMatched[1] + "/" + urlMatched[2] + "/" +
                    base64EncodedURL + "/s.gif";
                var img = new Image();
                img.src = imageURL;
                img.setAttribute("border", "0");
                if (urlMatched[1] == "s")
                    img.alt = "Alexa Certified Traffic Ranking for " + decodedURL;
                else
                    img.alt = "Alexa Certified Site Stats for " + decodedURL;
                var newLink = document.createElement('a');
                newLink.setAttribute("href", detailURLPrefix + decodedURL);
                newLink.setAttribute("target", "_blank");
                newLink.className = 'AlexaSiteStatsWidget';
                newLink.appendChild(img);
                thisScript.parentNode.insertBefore(newLink, thisScript);
            }
        }
    }

    function encode64(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        } while (i < input.length);

        return output;
    }
}
new AlexaSiteStatsWidget().replaceScripts();
```

## 參考

[How to create and add Alexa ranking widget in your website or blog](http://blogtimenow.com/how-to/alexa-ranking-widget/)

