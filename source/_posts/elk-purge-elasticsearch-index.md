title: ELK 教學 - 清除 Elasticsearch Index
author: John Wu
tags:
  - ELK
  - Elasticsearch
  - Linux
categories:
  - ELK
date: 2017-07-27 22:19
---
![ELK 教學架構](/images/pasted-92p.png)

ELK 是由 Elasticsearch、Logstash 及 Kibana 三個系統所組成的 Log 蒐集、分析、查詢系統。  
可以在**不改變**原系統架構的情況下，架設 ELK 蒐集、分析、查詢 Log，簡化過去繁鎖又沒效率的查 Log 工作。  

<!-- more -->

## Elasticsearch

``` bash
#!/bin/sh

KEEP_WEEK=12
ES_URL_AND_PORT=localhost:9200

i=0
KEEPS = ""
while [ $i -lt $KEEP_WEEK ]
do
  WEEK=`expr $(date +%V) - $i`
  WEEK=`printf %02d $WEEK`
  KEEPS="$KEEPS\-$(date +%Y)\.$WEEK|"

  ((i++))
done

if [[ $i != 0 ]]; then
	EXPIRED_INDICES=`curl "http://$ES_URL_AND_PORT/_cat/indices?v&h=i" | grep -P "\-\d{4}\.\d{2}$" | grep -Pv "(${KEEPS::-1})\b"`
	for name in $EXPIRED_INDICES
	do  
		curl -XDELETE "$ES_URL_AND_PORT/$name"
		#echo "$ES_URL_AND_PORT/$name"
	done
fi

curl "$ES_URL_AND_PORT/_cat/indices"
```
