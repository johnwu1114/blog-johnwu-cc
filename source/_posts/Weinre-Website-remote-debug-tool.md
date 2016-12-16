title: Weinre - Remote Debugging Website with Chrome
author: John Wu
tags:
  - Nodejs
  - Weinre
  - Web development
categories:
  - Web development
date: 2016-12-16 11:44:00
---
# Install Node.js
Download & install Node.js stable version from official site: http://nodejs.org/
*Weinre* base on Node.js, need to install Node.js first.

# Weinre
## Install
Download & unzip Weinre latest version from official site:
http://people.apache.org/~pmuellr/weinre/builds/

*or install by npm*
```
npm -g install weinre
```

## Start
Run “Node.js command prompt” as administrator
![pasted image](/images/pasted-5.png)
```
cd {your weinre path}
node weinre --httpPort 9090 --boundHost -all-
```
*DON’T close Node.js console.*

## Script
Adding below script to HTML to your web page.
``` html
<script src="http://{Your IP}:9090/target/target-script-min.js#anonymous">
</script>
```
![pasted image](/images/pasted-7.png)

## Run
Open in your browser http://localhost:9090/
![pasted image](/images/pasted-6.png)

Run your web page.
![pasted image](/images/pasted-8.png)

Select target.
![pasted image](/images/pasted-9.png)

## Debug
![pasted image](/images/pasted-16.png)
![pasted image](/images/pasted-13.png)
![pasted image](/images/pasted-14.png)