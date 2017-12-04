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
featured_image: /images/pasted-92p.png
---
![ELK 教學架構](/images/pasted-92p.png)

Logstash 在 ELK 架構中，是負責把收到的純文字資料，做特定的規則處理，變成指定的欄位。  
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

在 `grok` 區塊中可以宣告多個 `match`，當*來源欄位*符合*Patterns*的 Grok Patterns 或正規表示式(Regular Expression)時，就會建立指定的欄位。  

## Grok Patterns

Grok Patterns 的基本用法是：`%{Pattern名稱:欄位名稱:型別}`  
* Pattern名稱：其實 Pattern 只是 Grok 預先寫好的常用正規表示式，可以參考[grok-patterns](https://github.com/logstash-plugins/logstash-patterns-core/blob/master/patterns/grok-patterns)。  
* 欄位名稱：欄位名稱是自訂的輸出名稱，當符合 Pattern 時，就會建立這個欄位，並把符合 Pattern 的內容填入這個欄位。  
* 型別：預設型別都是字串。可以參考[Field datatype](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html)  

舉例來說，我們有一個筆 Log 如下：
```log
2017-03-30 01:46:09,858 [1] INFO MemberController - Call SampleDB.SP_CreateMember [0.001234]
```

可以透過 `message` 欄位取得 Logstash 收到的 Log 資料，所以*來源欄位*就是 `message`，*Patterns* 如下：
```json
grok {		
	match => [ "message", "%{TIMESTAMP_ISO8601:logTimestamp} \[%{NUMBER:thread:integer}\] %{DATA:logType} %{DATA:logger} - %{GREEDYDATA:detail} \[%{NUMBER:duration:integer}\]" ]
}
```
當 Log 符合這個 Patterns 時，就會切分出以下 5 個欄位：
* logTimestamp(字串): 2017-03-30 01:46:09,858
* thread(數值): 1
* logType(字串): INFO
* logger(字串): MemberController
* detail(字串): Call SampleDB.SP_CreateMember
* duration(數值): 0.001234

Log 必須要完全符合 Patterns 才會成功建立出欄位，如果 Log 變成：
```log
2017-03-30 01:46:09,858 [1] INFO MemberController - Call SampleDB.SP_CreateMember
```
> 由於最後面的 [0.001234] 不見了，Patterns 就變的不符合了。  

## 

### Grok Regular Expression

你可能會想 Elasticsearch + Filebeat 已經能夠蒐集，那還要 Logstash 幹嘛！？  
Logstash 主要的工作是把收到的資料，做特定的規則處理，例如 Log 內容如下：
```log
2017-03-30 01:46:09,858 [1] INFO MyWebsite.Global - Application_Start
```
* Filebeat 是以純文字送給 Elasticsearch，所以只能當字串查詢。  
* Logstash 可以透過 grok 正則表示，把這筆 Log 拆分成好幾個欄位


> 字串不容易被統計，透過轉換成數值、日期或其它能被統計的格式，才能對 Log 做分析。


設定
```bash
vi /etc/logstash/conf.d/pipeline.conf
```
輸入以下內容：
```json
input {
  beats {
    port => 5044
  }
}
filter {
  grok {		
      match => [ "message", "%{TIMESTAMP_ISO8601:log_timestamp} \[%{NUMBER:thread}\] %{DATA:log_type} %{DATA:logger} - %{GREEDYDATA:detail}" ]
  }
  mutate {
    add_tag => ["logstash"]
  }
}
output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "%{[@metadata][beat]}-%{+xxxx.ww}"
    document_type => "%{[@metadata][type]}"
  }
}
```
> 在 output 的部分 index 後面多了 %{+xxxx.ww}，這是為了把 Log 按每週區分。(本篇不解釋)  

修改 filebeat.yml
```yml
filebeat.prospectors:
- input_type: log
  paths:
    - C:\Logs\*.*log*
output.logstash:
  hosts: ["192.168.56.101:5044"]
  index: "my-second-index"
```
改完重啟 service  

到 Log 位置新增 text.log 檔，新增文字格式如：
```log
2017-03-30 01:46:09,858 [1] INFO MyWebsite.Global - Application_Start
2017-03-30 01:46:10,311 [1] INFO MyWebsite.Global - Application_Start - Done - Spend time: [00:00:00.5069073]
2017-03-30 02:03:10,965 [14] INFO MyWebsite.Global - Application_End
```

用瀏覽器打開 [http://192.168.56.101:9200/_search?pretty](http://192.168.56.101:9200/_search?pretty)，就可以查到資料了。
![Elasticsearch Search Pretty](/images/pasted-102.png)

## 參考

[Grok filter plugin](https://www.elastic.co/guide/en/logstash/current/plugins-filters-grok.html)  
[grok-patterns](https://github.com/logstash-plugins/logstash-patterns-core/blob/master/patterns/grok-patterns)  