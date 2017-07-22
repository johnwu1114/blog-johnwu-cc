title: How To Add Visitors Counter on Hexo
author: John Wu
tags:
  - Hexo
  - JavaScript
  - jQuery
  - Firebase
categories:
  - Hexo
date: 2016-11-21 00:36:00
---
## Firebase
Register account on Firebase [[here]](https://firebase.google.com/)  
Create new project [[here]](https://console.firebase.google.com/)

<!-- more -->

### Get your Firebase configs
![](/images/pasted-2.png)
![](/images/pasted-3.png)

### Modify permission
![](/images/pasted-4.png)

## Hexo
### Create custom.js
File path: themes\\*{your theme}*\\source\\js\src\custom.js
```javascript
$(function () {
    // Initialize Firebase
    var config = {
        apiKey: "{your apiKey}",
        authDomain: "{your authDomain}",
        databaseURL: "{your databaseURL}",
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    var oriUrl = window.location.host;
    var curUrl = oriUrl + window.location.pathname;
    function readVisits(url, selector) {
		var db_key = decodeURI(url.replace(new RegExp('\\/|\\.', 'g'), "_"));
        database.ref(db_key).once("value").then(function (result) {
            var count = parseInt(result.val() || 0) + 1;
            database.ref(db_key).set(count);
            if (selector.length > 0) {
                selector.html(count);
            };
        });
    }
    readVisits(oriUrl, $("#visits .count"));
    if (curUrl && curUrl != "_") {
        readVisits("page/" + curUrl, $("#pageviews .count"));
    }
});
```
### Modify layout
Add below html to layout, in themes\\*{your theme}*\\layout\\{where you want to show}.
```html
<span id="visits">Visits: <font class="count">--<font></span>
<span id="pageviews">Pageviews: <font class="count">--<font></span>
```

### Add references
Add below references to layout footer, must after jquery reference.
```html
<script src="https://www.gstatic.com/firebasejs/3.6.1/firebase.js"></script>
<script src="js/src/custom.js"></script>
```