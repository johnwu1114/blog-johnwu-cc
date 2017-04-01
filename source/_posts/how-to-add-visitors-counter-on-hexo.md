title: How To Add Visitors Counter on Hexo
author: John Wu
tags:
  - Hexo
  - Firebase
categories:
  - Hexo
date: 2016-11-21 00:36:00
---
## Firebase
### 1. Register account on Firebase [[here]](https://firebase.google.com/)

### 2. Create new project [[here]](https://console.firebase.google.com/)

### 3. Get your Firebase configs
![](/images/pasted-2.png)
![](/images/pasted-3.png)

### 4. Modify permission
![](/images/pasted-4.png)

## Hexo
### Modify after-footer.ejs
File path: themes\\*{your themem}*\layout\\_partial\after-footer.ejs
```html
<!-- Add this code to bottom -->
<script src="https://www.gstatic.com/firebasejs/3.6.1/firebase.js"></script>
<script>
  // Initialize Firebase
  var config = {
    apiKey: "{your apiKey}",
    authDomain: "{your authDomain}",
    databaseURL: "{your databaseURL}",
    storageBucket: "{your storageBucket}",
    messagingSenderId: "{your messagingSenderId}"
  };
  firebase.initializeApp(config);
    
  function readVisits(db_key, selector){
    database.ref(db_key).once("value").then(function(result) {
      var count = parseInt(result.val() || 0) + 1;
      database.ref(db_key).set(count);
      if($(selector).length > 0){
        $(selector).html(count);
      };
    });
  }
  readVisits("visits", "#visits");
  if(curUrl != "_") readvisits("page/"+curUrl, "#pageviews");
</script>
```
### Modify footer.ejs
File path: themes\\*{your themem}*\layout\\_partial\footer.ejs
```html
<footer id="footer">
	<% if (theme.sidebar === 'bottom'){ %>
	<%- partial('_partial/sidebar') %>
	<% } %>
	<div class="outer">
		<div id="footer-info" class="inner">
		&copy; <%= date(new Date(), 'YYYY') %> <%= config.author || config.title %><br>
		<%= __('powered_by') %> <a href="http://hexo.io/" target="_blank">Hexo</a>
		<br>
		<!-- Add this code for showing visits count -->
		Visits: <font id="visits"></font>
		Pageviews: <font id="pageviews"></font>
		</div>
	</div>
</footer>
```