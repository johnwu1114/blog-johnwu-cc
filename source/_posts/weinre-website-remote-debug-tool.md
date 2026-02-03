---
title: Weinre - Remote Debugging Website with Chrome
author: John Wu
tags:
  - npm
  - Weinre
categories:
  - Web Development
date: 2016-12-16 11:44:00
featured_image: /images/a/8.png
---
## Install Node.js

Download & install Node.js stable version from official site: http://nodejs.org/  
*Weinre* base on Node.js, need to install Node.js first.

## Weinre

### 1. Install

Download & unzip Weinre latest version from official site:  
http://people.apache.org/~pmuellr/weinre/builds/  

or install by npm  

```sh
npm -g install weinre
```
<!-- more -->

### 2. Start

Run “Node.js command prompt” as administrator
![Weinre - Remote Debugging Website with Chrome - Start](/images/a/5.png)

```sh
cd {your weinre path}
node weinre --httpPort 9090 --boundHost -all-
```

*DON’T close Node.js console.*

### 3. Script

Adding below script to HTML to your web page.  

```html
<script src="http://{Your IP}:9090/target/target-script-min.js#anonymous">
</script>
```

![Weinre - Remote Debugging Website with Chrome - Import JavaScript](/images/a/7.png)

### 4. Run

Open in your browser http://localhost:9090/
![Weinre - Remote Debugging Website with Chrome - Demo 1](/images/a/6.png)

Run your web page.
![Weinre - Remote Debugging Website with Chrome - Demo 2](/images/a/8.png)

Select target.
![Weinre - Remote Debugging Website with Chrome - Demo 3](/images/a/9.png)

### 5. Debug

![Weinre - Remote Debugging Website with Chrome - Demo 4](/images/a/16.png)  
![Weinre - Remote Debugging Website with Chrome - Demo 5](/images/a/13.png)  
![Weinre - Remote Debugging Website with Chrome - Demo 6](/images/a/14.png)  