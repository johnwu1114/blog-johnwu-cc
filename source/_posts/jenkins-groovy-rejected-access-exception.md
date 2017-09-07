---
title: Jenkins - Groovy RejectedAccessException
author: John Wu
tags:
  - Jenkins
  - Groovy
  - Pipeline Job
categories:
  - Jenkins
date: 2017-08-05 12:53:00
featured_image: /images/pasted-271.png
---
![Jenkins - Groovy RejectedAccessException - RejectedAccessException](/images/pasted-271.png)

透過 Jenkins 執行 Pipeline Job 時，如果執行沒有授權過的方法，就會發生 `RejectedAccessException`。  
本篇將介紹如何授權 Groovy 的使用權限。

<!-- more -->

執行 Pipeline Job 後，若顯示失敗訊息(如上圖)：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: *****
```

可以到 `Manage Jenkins` 找到 `In-process Script Approval`，授權 Groovy 的使用權限。如下：

![Jenkins - Groovy RejectedAccessException - Manage Jenkins](/images/pasted-267.png)
![Jenkins - Groovy RejectedAccessException - In-process Script Approval](/images/pasted-268.png)
![Jenkins - Groovy RejectedAccessException - Approve](/images/pasted-269.png)

> 授權完之後再執行，又會遇到其他的權限不足，重複以上步驟直到沒有再提示 `RejectedAccessException`。  


例如，此範例遇到 5 個權限需要被授權：
```
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use new java.util.Properties
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use new java.io.File java.lang.String
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use staticMethod org.codehaus.groovy.runtime.DefaultGroovyMethods newDataInputStream java.io.File
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use method java.util.Properties load java.io.InputStream
org.jenkinsci.plugins.scriptsecurity.sandbox.RejectedAccessException: Scripts not permitted to use method java.util.Properties getProperty java.lang.String
```

授權完成後的結果如下：
![Jenkins - Groovy RejectedAccessException - Approved](/images/pasted-270.png)