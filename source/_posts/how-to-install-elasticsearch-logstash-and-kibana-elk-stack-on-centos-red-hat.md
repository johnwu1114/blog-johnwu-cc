title: ELK 教學 - 從無到有安裝 ELK (CentOS/Red Hat)
author: John Wu
tags:
  - ELK
  - Elasticsearch
  - Logstash
  - Kibana
  - Linux
  - Beats
  - Filebeat
categories:
  - ELK
date: 2017-04-27 22:19
---
![ELK 教學架構](/images/pasted-92p.png)

ELK 是由 Elasticsearch、Logstash 及 Kibana 三個系統所組成的 Log 蒐集、分析、查詢系統。  
可以在**不改變**原系統架構的情況下，架設 ELK 蒐集、分析、查詢 Log，簡化過去繁鎖又沒效率的查 Log 工作。  

<!-- more -->

## 前言

過往架設網站或伺服端系統時，通常把 Log 寫在檔案中，當發生問題要查詢時，用筆記本打開查到眼花撩亂。  
或聰明一點的方式，用 Log Parser 之類的分析工具查看，但速度很慢，畢竟是查詢文字內容。  
如果你還在用筆記本查 Log，我強烈建議你馬上在測試環境裝起來，試試 ELK 強大的威力吧！  
*※特別強調，不需要改變原系統架構。*

## VirtualBox

*如果有現成的 Linux 系統，可以直接跳過此章節。*  

1. 請先安裝 VirtualBox 5.x 以上版本。  
[Download VirtualBox](https://www.virtualbox.org/wiki/Downloads)  
2. 不想自己重新安裝 Linux 的話，可以用我做好的 Red Hat 7.3 VM。  
[下載 RedHat7.3.ova](https://1drv.ms/u/s!AlHB4uP4MF7SiB9R85fONLZp4Va3)  
3. 下載完成後，點兩下 RedHat7.3.ova 啟動匯入。建議給 2GB 記憶體，方便之後的練習。  
如下圖：
![匯入 VirtualBox](/images/pasted-91.png)

4. 匯入完成就請動了，帳號密碼都是 root。  
如果無法啟動，可能因為我裝 64位元版，而你的 BIOS 沒有啟動 Virtualization Technology。
5. 看看能不能 ping 到 VM。
如下圖：
![ping vm](/images/pasted-92.png)

## 1. Java

因為 Elasticsearch 及 Logstash 是用 Java 開發，所以要安裝 JVM。  
本篇教學是用 Elasticsearch 5.3 版本，需要 Java 8 以上版本，官方推薦 1.8.0_73 上版本。  

### 1.1 下載

Red Hat 及 CentOS 可以下載 rpm 安裝檔。其他 Linux 版本的話就下載 tar 解壓縮安裝。  
[Download JRE](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
![Download JRE](/images/pasted-93.png)
### 1.2 安裝

下載後，透過 SCP 或 WinSCP 放到 `/tmp/`，執行以下安裝指令。
``` bash
rpm -ivh /tmp/jre-*.rpm
```

## 2. Elasticsearch

Elasticsearch 是搜尋引擎，就像是資料庫，把收集到的 Log 存在這裡，讓你可以快速的查詢。

### 2.1 下載

[Download Elasticsearch](https://www.elastic.co/downloads/elasticsearch)

### 2.2 安裝

下載後，透過 SCP 或 WinSCP 放到 `/tmp/`，執行以下指令安裝：
``` bash
rpm -ivh /tmp/elasticsearch-*.rpm
```

### 2.3 啟動

安裝好後，執行以下指令啟動：
``` bash
systemctl start elasticsearch
```
查看狀態：
``` bash
systemctl status elasticsearch
curl "http://localhost:9200/_cat/nodes"
```

![Elasticsearch 啟動成功](/images/pasted-94.png)

### 2.4 設定

記憶體越大，查詢速度越快。但 Elasticsearch 使用記憶體有兩個條件限制：
1. 最高只能設定為系統的 **50%**。例：系統 8GB，Elasticsearch 只能設定 4GB
2. 不能超過 **32GB**。  
違反以上兩個條件，Elasticsearch查詢速度會不升反減。  

設定 Elasticsearch 記憶體使用上限及下限。
```bash
vi /etc/elasticsearch/jvm.options
```
找到以下兩個設定值，都改為 1g：
```bash
# Xms 記憶體使用下限
# Xmx 記憶體使用上限
-Xms1g
-Xmx1g
```
> 我做的 VM 只有 2G 記憶體，Elasticsearch 安裝完預設是 2G。如果不改 Elasticsearch 會 crash。

設定 Elasticsearch 綁定的 IP 及 Port。
```bash
vi /etc/elasticsearch/elasticsearch.yml
```
找到以下兩個設定值：
```bash
# 綁定特定 IP
# network.bind_host: 192.168.56.101
# 綁定多個 IP
# network.host: ["192.168.56.101", "127.0.0.1"]
# 綁定所有 IP
network.bind_host: 0.0.0.0

# 綁定 Port，預設其實就是 9200
http.port: 9200
```

設定完成後，重新啟動：
``` bash
systemctl start elasticsearch
```
試試看用 IP 查詢 nodes
``` bash
curl "http://192.168.56.101:9200/_cat/nodes"
```
> 記得換成你的 IP
![curl 打開 Elasticsearch](/images/pasted-97.png)

你也可以試試看用瀏覽器打開 http://192.168.56.101:9200/_cat/nodes，你會發現打沒有回應！！！
![瀏覽器打開 Elasticsearch 沒有回應](/images/pasted-95.png)

### 2.5 防火牆

很多新手會忘記防火牆的存在...  
兩個解法：  
1. 完全關閉
```bash
systemctl stop firewalld
systemctl disable firewalld
```
2. 增加防火牆規則 
```bash
firewall-cmd --add-port=9200/tcp --permanent
firewall-cmd --reload
```
> 為了以下教學順利，選擇 1 會比較方便，不用每次都加規則。  
> 正式環境請選擇 2 會比較安全。

再次用瀏覽器打開，就可以看到回應了。
![瀏覽器打開 Elasticsearch 有回應](/images/pasted-96.png)

## 3. Beats

看到這邊你可能會覺得奇怪，ELK 三個字沒有出現 **B**，上面也都沒有 Beats 等字眼。  
Beats 是 ELK 的附屬程式，是幫忙傳送資料的小工具，基本上沒有它們也沒關係，但有它們會很方便。  

Beats 有很多種，此教學我只使用 Filebeat，有興趣的可以自己研究其它 Beats。  

### 3.1 下載

我 Server 是用 Windows，所以我下載的是 Filebeat Windows版本。  
[Download Filebeat](https://www.elastic.co/downloads/beats)

### 3.2 安裝

Filebeat 是一個 exe 的執行檔，為了方便常駐啟用，我們把它註冊到 Windows Service 中。  
用 Administrator 權限打開 PowerShell，用 cd 指令切換到解壓縮位置，執行以下指令：
```bash
.\install-service-filebeat.ps1
```

如果提示 *檔案未經數位簽屬* 等訊息，請改用以下指令：
```bash
powershell.exe -ExecutionPolicy UnRestricted -File .\install-service-filebeat.ps1
```
如下圖：
![Filebeat 檔案未經數位簽屬](/images/pasted-99.png)

### 3.3 設定

打開 Filebeat 資料夾中的 filebeat.yml，改為以下內容(可以全部刪光光，記得備份就好)：
```yml
filebeat.prospectors:
- input_type: log
  paths:
    # 路徑改成你的 Log 位置
    - C:\Logs\*.*log*
output.elasticsearch:
  # 記得換成你的 IP
  hosts: ["192.168.56.101:9200"]
  # index 名稱，可以把它想像成資料庫名稱
  index: "my-first-index"
```
> 注意！注意！注意！ 
> 此 yml 絕對不能出現 `Tab` 也就是 **\t** 這個字元，排版只能用空格。  
> 只要有 `Tab` 這個字元出現，就會無法啟動。  

### 3.4 啟動

打開服務，找到 filebeat 啟動它：
![啟動 filebeat](/images/pasted-100.png)

### 3.5 測試

到 Log 位置新增 text.log 檔，隨便輸入文字，如圖：
![Filebeat 測試](/images/pasted-101.png)

> 要有`Enter`斷行，斷行才會算這筆 Log 完整。完整的 Log 才會被 Filebeat 送出。

用網頁打開 [http://192.168.56.101:9200/_cat/indices](http://192.168.56.101:9200/_cat/indices)  
可以看到有名稱為 my-first-index 的 index  囉~
![my-first-index in Elasticsearch](/images/pasted-102.png)

### 3.6 目前架構

Elasticsearch + Filebeat 已經能夠蒐集 Log 了，目前架構如下圖：
![Filebeat + Elasticsearch](/images/pasted-93.gif)

## 4. Logstash

你可能會想 Elasticsearch + Filebeat 已經能夠蒐集，那還要 Logstash 幹嘛！？  
Logstash 主要的工作是把收到的資料，做特定的規則處理，例如 Log 內容如下：
```log
2017-03-30 01:46:09,858 [1] INFO MyWebsite.Global - Application_Start
```
* Filebeat 是以純文字送給 Elasticsearch，所以只能當字串查詢。  
* Logstash 可以透過 grok 正則表示，把這筆 Log 拆分成好幾個欄位
```
grok {		
	match => [ "message", "%{TIMESTAMP_ISO8601:log_timestamp} \[%{NUMBER:thread}\] %{DATA:log_type} %{DATA:logger} - %{GREEDYDATA:detail}" ]
}
```
 * log_timestamp(時間): 2017-03-30 01:46:09,858
 * thread(數字): 1
 * log_type(字串): INFO
 * logger(字串): MyWebsite.Global
 * detail(字串): Application_Start

> 字串不容易被統計，透過轉換成數值、日期或其它能被統計的格式，才能對 Log 做分析。

### 4.1 下載

[Download Logstash](https://www.elastic.co/downloads/logstash)

### 4.2 安裝

下載後，透過 SCP 或 WinSCP 放到 `/tmp/`，執行以下指令安裝：
``` bash
rpm -ivh /tmp/logstash-*.rpm
/usr/share/logstash/bin/system-install
```

### 4.3 啟動

安裝好後，執行以下指令啟動：
``` bash
systemctl start logstash
```
查看狀態：
``` bash
systemctl status logstash
```

![Logstash 啟動成功](/images/pasted-98.png)

### 4.4 設定

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

用瀏覽器打開 [http://192.168.56.101:9200/_search?pretty](http://192.168.56.101:9200/_search?pretty)，就可以查到按照資料了。
![Elasticsearch Search Pretty](/images/pasted-102.png)

## 5. Kibana

用瀏覽器查詢 Elasticsearch API 實在是很難閱讀，所以我們需要一個漂亮的圖形化工具，終於輪到 Kibana 登場了！  

### 5.1 下載

[Download Kibana](https://www.elastic.co/downloads/kibana)

### 5.2 安裝

下載後，透過 SCP 或 WinSCP 放到 `/tmp/`，執行以下指令安裝：
``` bash
rpm -ivh /tmp/kibana-*.rpm
```

### 5.3 啟動

安裝好後，執行以下指令啟動：
``` bash
systemctl start kibana
```
查看狀態：
``` bash
systemctl status kibana
```
![Kibana 啟動成功](/images/pasted-104.png)
### 5.4 設定

設定 Kibana 綁定的 IP 及 Port。
```bash
vi /etc/kibana/kibana.yml
```
找到以下設定值：
```bash
# 綁定 Port，預設其實就是 5601
server.port: 5601
# 0.0.0.0 表示綁定所有 IP
server.host: "0.0.0.0"
```

用瀏覽器打開 [http://192.168.56.101:5601](http://192.168.56.101:5601) 設定 index：
![pasted image](/images/pasted-103.png)

設定完成後，就可以到 Discover 查詢 Log 了～
![pasted image](/images/pasted-105.png)


## 總結

本篇教學成果，是 ELK 常見的基本架構，資料流的流程如下圖：
![ELK 教學架構](/images/pasted-92.gif)

我個人認為導入 ELK 可以分為三個階段：
* 第一階：把純資料送進 ELK，用 Kibana 查詢取代原本開文字檔。
* 第二階：在 Logstash 寫進階一點的語法，從系統現行的 Log 解析出有意義的欄位。當有數值欄位時，就可以用 Kibana 做分析圖表了。
* 第三階：重新檢視及定義系統的 Log，讓 Log 從產出時就具備能被分析的價值。  

除了需要在要蒐集 Log 的 Server 安裝 Filebeat，完全不需要異動原來程式跟系統架構，立即就可以把 Log 蒐集到 ELK，馬上就能查詢。  
以我們產品為例，20 幾台 Server 打給一組 ELK，每分鐘最高可進 18~20 萬筆 Log，查詢一天三千多萬筆 Log 不到 5 秒。  
下每個查詢條件都不超過 5 秒就有結果，我相信這比純文字查看絕對快上千百倍。  
