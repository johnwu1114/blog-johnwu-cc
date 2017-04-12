title: Weinre - Remote Debugging Website with Chrome
author: John Wu
tags:
  - Chrome
  - Nodejs
  - Weinre
categories:
  - Web development
date: 2016-12-16 11:44:00
---
## Install Node.js
Download & install Node.js stable version from official site: http://nodejs.org/  
*Weinre* base on Node.js, need to install Node.js first.

## Weinre
### Install
Download & unzip Weinre latest version from official site:  
http://people.apache.org/~pmuellr/weinre/builds/

*or install by npm*
```
npm -g install weinre
```

<!-- more -->

### Start
Run “Node.js command prompt” as administrator
![](/images/pasted-5.png)
```
cd {your weinre path}
node weinre --httpPort 9090 --boundHost -all-
```
*DON’T close Node.js console.*

### Script
Adding below script to HTML to your web page.
``` html
<script src="http://{Your IP}:9090/target/target-script-min.js#anonymous">
</script>
```
![](/images/pasted-7.png)

### Run
Open in your browser http://localhost:9090/
![](/images/pasted-6.png)

Run your web page.
![](/images/pasted-8.png)

Select target.
![](/images/pasted-9.png)

### Debug
![](/images/pasted-16.png)
![](/images/pasted-13.png)
![](/images/pasted-14.png)