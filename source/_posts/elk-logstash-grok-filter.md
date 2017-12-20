---
title: ELK 教學 - Logstash Grok Filter 建立欄位
author: John Wu
tags:
  - ELK
  - Logstash
  - Grok
categories:
  - ELK
date: 2017-12-04 11:46
featured_image: /images/x402.png
---

Logstash 在 ELK 架構中，是負責把收到的純文字資料，做特定的規則處理，就可以變成指定的欄位。  
建立欄位的好處是可以方便搜尋，而且也能做到比全文檢索更好的分析，可說是**欄位切的好，查詢沒煩惱**。  
我個人認為 Logstash 中最精華的部分就屬 Grok Filter。  
本篇將簡單教學如何透過 Logstash Grok Filter 建立 Elasticsearch 欄位。

<!-- more -->

> 想了解 ELK 基本架構可以參考這篇：[ELK 教學 - 從無到有安裝 ELK (CentOS/Red Hat)](/article/how-to-install-elasticsearch-logstash-and-kibana-elk-stack-on-centos-red-hat.html)

## Grok Filter

Grok 的用法是在 Logstash 的 filter 中，使用 `grok { }` 區塊，如下：
```bash
input {
  # ...
}
filter {
  grok {		
      match => [ "來源欄位", "Patterns" ]
  }
  # ...
}
output {
  # ...
}
```

在 `grok` 區塊中宣告 `match`，當**來源欄位**符合**Patterns**的 `Grok Patterns` 或`Regular Expression`(正規表示式)時，就會建立指定的欄位。  

## Grok Patterns

Grok Patterns 的基本用法是：`%{Pattern名稱:欄位名稱:型別}`  
* **Pattern名稱**  
 其實 Grok Patterns 只是 Grok 預先寫好的常用正規表示式，可以參考[grok-patterns](https://github.com/logstash-plugins/logstash-patterns-core/blob/master/patterns/grok-patterns)。  
* **欄位名稱**  
 欄位名稱是自訂的輸出名稱，當符合 Pattern 時，就會建立這個欄位，並把符合 Pattern 的內容填入這個欄位。  
* **型別**  
 預設型別都是字串。可以參考[Field datatype](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html)  

舉例來說，我們有一個筆 Log 如下：
```log
2017-12-04 12:34:56,789 [1] INFO MemberController - Call SampleDB.SP_CreateMember [0.001234]
```

可以透過 `message` 欄位取得 Logstash 收到的 Log 資料，所以*來源欄位*就是 `message`，*Patterns* 如下：
```json
grok {		
	match => [ "message", "%{TIMESTAMP_ISO8601:logTimestamp} \[%{NUMBER:thread:integer}\] %{DATA:logType} %{DATA:logger} - %{GREEDYDATA:detail} \[%{NUMBER:duration:double}\]" ]
}
```
當 Log 符合這個 Patterns 時，就會切分出以下 6 個欄位：
* **logTimestamp(字串)**: 2017-12-04 12:34:56,789
* **thread(數值)**: 1
* **logType(字串)**: INFO
* **logger(字串)**: MemberController
* **detail(字串)**: Call SampleDB.SP_CreateMember
* **duration(數值)**: 0.001234

## Grok Regular Expression

Grok Regular Expression 的用法是：`(?<欄位名稱>Regular Expression)`  

Grok Patterns 只是 Grok 預先寫好的常用正規表示式，所以也可以自己寫正規表示式，不一定要用 Grok Patterns 所提供的。  
Log 用跟上述一樣的例子，把 Grok Patterns 轉換成正規表示式，如下：
```json
grok {		
	match => [ 
    "message", 
    "(?<logTimestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) \[(?<thread>\d+)\] (?<logType>.*?) (?<logger>.*?) - (?<detail>.*) \[(?<duration>\d+(\.\d+)*)\]" 
  ]
}
```

Grok Patterns 及 Regular Expression 是可以混用的，例如：
```json
grok {		
	match => [ 
    "message", 
    "%{TIMESTAMP_ISO8601:logTimestamp} \[%{NUMBER:thread:integer}\] %{DATA:logType} %{DATA:logger} - Call (?<database>\w+)\.(?<storedProcedure>SP_\w+) \[%{NUMBER:duration:double}\]" 
  ]
}
```
會切分出以下 7 個欄位：
* **logTimestamp(字串)**: 2017-12-04 12:34:56,789
* **thread(數值)**: 1
* **logType(字串)**: INFO
* **logger(字串)**: MemberController
* **database(字串)**: SampleDB
* **storedProcedure(字串)**: SP_CreateMember  
 > storedProcedure 欄位必須是 **SP_** 開頭。
* **duration(數值)**: 0.001234

## Grok Debugger Tool

在撰寫 Grok Pattern 時，可以透過一些工具檢查語法對不對，是否有產出預期的欄位。  
我慣用的工具如下：
* [Grok Debugger](https://grokdebug.herokuapp.com/)  
* [Grok Constructor](http://grokconstructor.appspot.com/do/match)  

> Kibana 6.x 版以後也有內建 Grok Debugger 功能。  

### Grok Debugger

Grok Debugger 很簡約，輸入預期的 Input Message 及 Patterns 就會立即驗證及產出 JSON 格式的欄位。如下：  

![ELK 教學 - Logstash Grok Filter 建立欄位 - Grok Debugger](/images/x402.png)

### Grok Constructor

 Grok Constructor 有支援 Filter 多筆 Message，但不支援指派型別(例：`%{NUMBER:duration:double}`)。  
 畫面如下：  

 ![ELK 教學 - Logstash Grok Filter 建立欄位 - Grok Constructor](/images/x403.png)

## 參考

[Grok filter plugin](https://www.elastic.co/guide/en/logstash/current/plugins-filters-grok.html)  
[grok-patterns](https://github.com/logstash-plugins/logstash-patterns-core/blob/master/patterns/grok-patterns)  