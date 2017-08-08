---
title: ELK 教學 - 定期清除 Elasticsearch 資料
author: John Wu
tags:
  - ELK
  - Elasticsearch
  - Linux
categories:
  - ELK
date: 2017-07-27 22:19
---
![ELK 教學 - 定期清除 Elasticsearch 資料](/images/logo-elasticsearch.png)

當開始使用 ELK 蒐集 Log 後，終究有一天 Elasticsearch 會把硬碟空間塞爆。  
建議定期把 Log 清除，本篇將介紹定期清除 Elasticsearch 過舊的資料。  

<!-- more -->

要刪除 Elasticsearch 過舊的 Index 有兩種方式：
1. 使用官方的 [Curator](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/index.html)  
2. 自己寫排程  

我在得知有 Curator 之前，就已經用 Shell Script 把清除 Elasticsearch 資料的邏輯寫完...  
為了不辜負我自已寫的東西，所以我要分享**自己寫排程**清除 Elasticsearch 資料。XD  

## Shell Script

### 1. Get Index Name

由與我們公司的 Index 都是以**週為單位**區分，所以 Index 的名稱後綴都會再上 `-年.週`。  
用 `curl` 查詢 Elasticsearch 的 Indices Name：
```bash
curl "http://localhost:9200/_cat/indices?v&h=i"
```

查詢結果：
```bash
i
.kibana
ddd-rrr-dev-2017.20
ddd-rrr-dev-2017.21
filebeat-sss-2017.22
filebeat-sss-2017.27
logstash-bbb-2017.28
logstash-bbb-2017.29
logstash-ccc-2017.27
logstash-ccc-2017.25
index
```
> 自訂的 Index 都是後綴 `-2017.xx`，`xx`就是 2017 年的第幾週。  

### 2. Filter Index

透過 `grep` 過濾出符合後綴 `-年.週` 的 Index
```bash
curl "http://localhost:9200/_cat/indices?v&h=i" | grep -P "\-\d{4}\.\d{2}$"
```

最後再排除 N 週內的資料，結果就是要被刪除的 Index Name 囉～
```bash
curl "http://localhost:9200/_cat/indices?v&h=i" | grep -P "\-\d{4}\.\d{2}$" | grep -Pv "(\-2017\.27|\-2017\.28|\-2017\.29)\b"`
```

查詢結果：
```bash
ddd-rrr-dev-2017.20
ddd-rrr-dev-2017.21
filebeat-sss-2017.22
logstash-ccc-2017.25
```

### 3. Delete Index

把查出來的結果用 Elasticsearch 的 DELETE 刪除：
```bash
curl -XDELETE "localhost:9200/ddd-rrr-dev-2017.20"
curl -XDELETE "localhost:9200/ddd-rrr-dev-2017.21"
curl -XDELETE "localhost:9200/filebeat-sss-2017.22"
curl -XDELETE "localhost:9200/logstash-ccc-2017.25"
```

### 4. Save Script

把邏輯寫成 sh 檔案，我是把它跟 Elasticsearch 的設定檔存在一起，比較好找。  

```bash
vi /etc/elasticsearch/purge.sh
```

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
	EXPIRED_INDICES=`curl "$ES_URL_AND_PORT/_cat/indices?v&h=i" | grep -P "\-\d{4}\.\d{2}$" | grep -Pv "(${KEEPS::-1})\b"`
	for name in $EXPIRED_INDICES
	do  
		curl -XDELETE "$ES_URL_AND_PORT/$name"
		#echo "$ES_URL_AND_PORT/$name"
	done
fi

curl "$ES_URL_AND_PORT/_cat/indices"
```
> 我的範例是留 12 週，基本上需求。我個人認為超過三週的 Log 就已經沒有價值了。  
> 但如果你是拿 Log 來做分析，就另當別論了！


## 定期執行

把 Shell Script 加到 crontab。  

```bash
vi /etc/elasticsearch/purge.sh
```

```bash
# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name  command to be executed
0 5 * * 1 root /bin/sh /etc/elasticsearch/purge.sh
```
> 我設定在每週一的早上五點執行清除 Elasticsearch。  

這樣就不會留太多舊資料，導致硬碟爆炸囉～