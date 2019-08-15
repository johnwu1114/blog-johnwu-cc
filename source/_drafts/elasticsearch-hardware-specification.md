---
title: 'Elasticsearch 筆記 - 硬體規格評估'
author: John Wu
tags:
  - ELK
  - Elasticsearch
categories:
  - ELK
date: 2019-08-15 13:41
featured_image: /images/logo-elasticsearch.png
---

已經習慣把 Log 存到 Elasticsearch 再透過 Kibana 查看日誌，所以每當有新產品要上線前，都會評估 ELK 需要的硬體規格。  
依照產品大小不同，儲存 Log 的資料筆數跟空間，都有很大的差異，會直接影響到 CPU、記憶體、硬碟空間等。  

近期產品是上到 GCP 跟阿里雲，本篇硬體規格會以雲端服務的 Server 規格做為參考的基準。  

<!-- more -->

## 情境描述

本範例產品的參考資料：  

* 在線數**同時**約：6000  
* 交易量**每秒**約：20筆  
* Log **每週**約：320萬筆 (25~30 GB)  

算是一個不大的小系統，用 Kibana 查詢近期一週的 Elasticsearch Index 用量。如圖：  

![Elasticsearch 筆記 - 硬體規格評估 - Elasticsearch Index 用量](/images/434.png)  

## 使用資源  

由於經費有限，所以只有使用兩台 ELK 做 HA，用 Ｍaster/Slave 架構，沒有做到 Cluster。  
兩台 Server 分別裝載著 ELK 三個服務，架構如下：  

![Elasticsearch 筆記 - 硬體規格評估 - ELK Ｍaster/Slave 架構](/images/436.png)  

此範例幾個月前從 GCP 轉移到阿里雲，在這兩個平台使用的 VM 等級如下：  

* GCP (n1-highmem-8)
  * vCPU: 8 core
  * RAM: 52 GB
  * Disk: 20 GB + 300 GB
* 阿里雲 (ecs.r5.2xlarge)
  * vCPU: 8 core
  * RAM: 64 GB
  * Disk: 20 GB + 300 GB

> Ｍaster/Slave 的機器規格都是一樣的。  

產品運行超過半年，CPU 大約都落在 30% 左右，依照上述使用量，在阿里雲其中一台 ELK Server，近期一週的監控資訊：  

![Elasticsearch 筆記 - 硬體規格評估 - 阿里雲監控資訊](/images/435.png)  

> 找不到當時在 GCP 用量的截圖。  

## 硬體規格評估

首先要評估預計要放到 ELK 的 Log 量，資料筆數及資料大小。  
再來就是 Log Parsing 的規則，如果 Parsing 很複雜 CPU 就會佔用較高的資源。  

ELK 三項服務，分別佔用資源情況：  

| 服務 | CPU | RAM | Disk |
|:---|:---:|:---:|:---:|
| Elasticsearch | 中高 | 高 | 極高 |
| Logstash | 中 | 低 | 低 |
| Kibana | 低 | 低 | 低 |

> 基本上可以完全不用考慮 Kibana 消耗資源。  
> 主要高耗能的就是 **Elasticsearch** 跟 **Logstash**。  

### CPU

CPU 是比較難評估部分，因為 Log Parsing 的複雜度以及查詢 Elasticsearch 的條件，都會強烈影響 CPU 的使用量。  

Elasticsearch 查詢所消耗的 CPU，阿里雲提供參考：    
> 每個 vCPU core 大約可處理 20~40 GB 查詢資料。  
> (依據本例使用情境，CPU 消耗偏高一些，但也沒落差太多。)  

Logstash 依照上述的情境，Log 每秒也才 500 筆左右，分配 vCPU * 1，其實綽綽有餘了。  
> 建議每處理 1500 筆資料，就分一個 vCPU core。  

### RAM

Elasticsearch 使用記憶體有兩個條件限制：  

1. 最高只能設定為系統的 **50%**。例：系統 8 GB，Elasticsearch 只能設定 4GB。  
2. 不能超過 **32 GB**。  

如果條件允許，就直上 64 GB 記憶體，然後把一半分給 ES。  
Elasticsearch 查詢很吃記憶體，尤其是大區間的查詢，根據阿里雲提供的參考：  
> 每 1 GB RAM，大約可處理 10 GB 查詢資料。  

Logstash 的記憶體用於緩存消化不完的資料，CPU 不夠力的情況下就會需要比較高的記憶體。  
不過還是要依照實際使用量調整，在預估資源分配上，不用考慮太高的比重。  
> 基本上 1 GB 以內都夠用，甚至 128 MB 都夠用。  

### Disk

ELK 實際存資料的是 Elasticsearch，所以評估時就不考慮 Logstash 跟 Kibana。  
系統碟分配 20 GB 基本上就很足夠了，甚至可以更低。  
這邊只單純討論 Elasticsearch 存資料的空間計算。  

Elasticsearch 需要空間為：  
1. 原始資料  
2. 副本資料  
3. 索引資料  

本例是使用 Ｍaster/Slave 架構，所以比基本上佔用空間就是：

* Ｍaster: 
  (`原始資料` * `索引資料`) * 1.15 
* Slave: 
  (`副本資料` * `索引資料`) * 1.15 

## 參考

[AlibabaCloudDocs - Elasticsearch 规格容量评估](https://github.com/AlibabaCloudDocs/elasticsearch/blob/master/cn.zh-CN/快速入门/规格容量评估.md)