title: >-
  How To Install Elasticsearch, Logstash, and Kibana (ELK Stack) on CentOS/Red
  Hat
author: John Wu
tags:
  - Elasticsearch
  - Kibana
  - Linux
  - Logstash
  - ELK
categories:
  - ELK
date: 2016-11-20 12:56:00
---
## Install Java JDK
Download Java JDK RPM stable version from official site:  
http://www.oracle.com/technetwork/java/javase/downloads/index.html  
*Elasticsearch* and *Logstash* base on Java, need to install Java JDK first.

``` bash
[~]# rpm -ivh jdk-*.rpm
```
## Elasticsearch

### Install
Download Elasticsearch RPM stable version from official site:  
https://www.elastic.co/downloads/elasticsearch
``` 
[~]# rpm -ivh elasticsearch-*.rpm
```

<!-- more -->

### Modify settings
``` bash
[~]# vi /etc/sysconfig/elasticsearch
```
``` bash
## Your Elasticsearch data directory
DATA_DIR=/ELKDB
## Set ES_HEAP_SIZE to 50% of available RAM, but not more than 31g
ES_HEAP_SIZE=4g
```
---

``` bash
[~]# vi /etc/elasticsearch/elasticsearch.yml
```
``` bash
# ---------------------------------- Network ----------------------------------
# 0.0.0.0 is binding all the address
network.bind_host: 0.0.0.0
http.port: 9200
```
### Swap setting (Option)
For elasticsearch get better performance.
``` bash
[~]# vi /etc/sysctl.conf
```
``` bash
# Minimum amount of swapping without disabling it entirely.
vm.swappiness=1
```
### Cluster settings (Option)
If you have two or more elasticsearch server, you can set up cluster.

``` bash
[~]# vi /etc/elasticsearch/elasticsearch.yml
```
``` bash
# ----------------------------------- Cluster -----------------------------------
# Your cluster name, all the node need have same name
cluster.name: mycluster
# ------------------------------------ Node ------------------------------------
# All the node should have different name
node.name: node-01
# Master node set as true, Slave node set as false
node.master: true
node.data: true
# ---------------------------------- Network ----------------------------------
http.cors.allow-origin: "*"
http.cors.enabled: true
# --------------------------------- Discovery ----------------------------------
discovery.zen.ping.unicast.hosts: ["node01_IP", "node02_IP"]
discovery.zen.ping.multicast.enabled: false

```
### Start
``` bash
[~]# systemctl daemon-reload
[~]# systemctl enable elasticsearch
[~]# systemctl start elasticsearch
```
## Logstash
### Install
Download Logstash RPM stable version from official site:
https://www.elastic.co/downloads/logstash
``` bash
[~]# rpm -ivh logstash-*.rpm
```
### Modify settings (Option)
In my experience, Logstash need very much CPU resource, but low memory usage.
``` bash
[~]# vi /etc/init.d/logstash
```
``` bash
# You can using “lscpu” to get cpu threads, see column “CPU(s):”
LS_OPTS="-w 8"
# In my case, I keep 1g system memory.
LS_HEAP_SIZE="3g"
LS_OPEN_FILES=65535
```
### Start
``` bash
[~]# systemctl daemon-reload
[~]# systemctl enable logstash
[~]# systemctl start logstash
```
## Kibana
### Install
Download Kibana RPM stable version from official site:  
https://www.elastic.co/downloads/kibana
``` bash
[~]# rpm -ivh kibana-*.rpm
```
### Modify settings (Option)
In my experience, CPU and memory both low usage in Kibana. You can use default settings.

``` bash
[~]# vi /opt/kibana/bin/kibana
```
``` bash
# Add below before exec:
# Always perform global GCs
NODE_OPTIONS="$NODE_OPTIONS --gc_global "
# Max size of the heap memory (MB), 1400Mb default on 64 bit.
# In my case, I keep 1g system memory.
NODE_OPTIONS="$NODE_OPTIONS --max-old-space-size=3072 "
```
### Register Kibana to systemctl
``` bash
[~]# vi /etc/systemd/system/kibana.service
```
``` bash
[Unit]
Description=Kibana

[Service]
ExecStartPre=rm -rf /var/run/kibana.pid
# Change to your kibana path
ExecStart=/opt/kibana/bin/kibana
ExecReload=/bin/kill -9 $(cat /var/run/kibana.pid) && rm -rf /var/run/kibana.pid && /opt/kibana/bin/kibana
ExecStop=/bin/kill -9 $(cat /var/run/kibana.pid)

[Install]
WantedBy=multi-user.target
```
### Start
``` bash
[~]# systemctl daemon-reload
[~]# systemctl kibana logstash
```