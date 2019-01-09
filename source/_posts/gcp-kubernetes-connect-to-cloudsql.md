---
title: GCP 教學 - Kubernetes 與 Cloud SQL 連線
author: John Wu
tags:
  - GCP
  - k8s
  - 'Cloud SQL'
  - MySQL
categories:
  - Kubernetes
date: 2019-01-07 13:55:00
featured_image: /images/logo-kubernetes.png
---
![GCP 教學 - Kubernetes 與 Cloud SQL 連線](/images/logo-kubernetes.png)

介紹如何透過 GCP 的 Kubernetes 與 Cloud SQL 服務建立連線，本篇以 MySQL 為例。

<!-- more -->

## 新增 Cloud SQL 服務實例

在 GCP 新增 Cloud SQL 實體步驟如下：  
![GCP 教學 - 新增 Cloud SQL 實體步驟 1](/images/x413.png)  
![GCP 教學 - 新增 Cloud SQL 實體步驟 2](/images/x414.png)  
![GCP 教學 - 新增 Cloud SQL 實體步驟 3](/images/x415.png)  
![GCP 教學 - 新增 Cloud SQL 實體步驟 4](/images/x416.png)  

基本上建立 Cloud SQL 服務就是按下一步而已。  
區域建議選擇跟 Kubernetes 群集相同，流量計費會比較便宜。  

> 預設的機器類型為「db-n1-standard-1」，如果要更高階或低階的版本，可在選擇區域的下方，點選`顯示設定選項`變更配置。  

建立完成後，點選建立完成的執行個體，查看**執行個體連線名稱**，如下圖：  
![GCP 教學 - Cloud SQL 執行個體連線名稱](/images/x423.png)  

> 之後步驟會用到**執行個體連線名稱**，可以先記下來。  

## 透過 Cloud SDK 登入

請先安裝 Cloud SDK，且進行授權驗證後，便可透過 Cloud SDK 登入 Cloud SQL。  
> 授權驗證可參考[GCP 教學 - Kubernetes 佈署 Docker Image](/article/gcp-kubernetes-deploy-docker-image.html)的**前置準備**。  

登入 Cloud SQL 指令：  

```sh
gcloud sql connect cloudsql-mysql --user=root
```

沒裝 mysql client 會出錯以下錯誤：  

```log
Whitelisting your IP for incoming connection for 5 minutes...done.
ERROR: (gcloud.sql.connect) Mysql client not found.  Please install a mysql client and make sure it is in PATH to be able to connect to the database instance.
```

登入成功後，就可以使用 MySQL Client CLI，可以執行 MySQL 指令。  
試著輸入 `status`，會顯示 MySQL 的資訊如下：  
![GCP 教學 - MySQL status](/images/x417.png)  

要修改密碼或允許 root 連入來源，可透過 Cloud SDK 執行以下指令：

```sh
gcloud sql users set-password root --host=% --instance cloudsql-mysql --password=<密碼>
```

## 啟用 API

必須要啟用 Cloud SQL Admin API，步驟如下：  
![GCP 教學 - 啟用 Cloud SQL Admin API 1](/images/x425.png)  
![GCP 教學 - 啟用 Cloud SQL Admin API 2](/images/x426.png)  


## 建立連線密鑰

到 GCP 建立連線密鑰，並下載到本機再匯入至 Kubernetes，讓 Kubernetes 可以透過密鑰連入 Cloud SQL，密鑰建立步驟如下：

![GCP 教學 - 建立連線密鑰 1](/images/x418.png)  
![GCP 教學 - 建立連線密鑰 2](/images/x419.png)  
![GCP 教學 - 建立連線密鑰 3](/images/x420.png)  
![GCP 教學 - 建立連線密鑰 4](/images/x421.png)  
![GCP 教學 - 建立連線密鑰 5](/images/x422.png)  

把下載的金鑰檔案匯入至 Kubernetes：  

```sh
# kubectl create secret generic cloudsql-instance-credentials --from-file=credentials.json="<金鑰 *.json 檔案路徑>"
kubectl create secret generic cloudsql-instance-credentials --from-file=credentials.json="C:\xxxxx\prod-xxxxx-xxxxx.json"
# 匯入完成後，可使用 get secret 查看已匯入的憑證
kubectl get secret
```

## Create proxy service

建立 Cloud SQL 的佈署檔，內容如下：  

```yml
# C:\k8s_sql_sample\mysql_deployment.yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: cloudsql-proxy-pod
spec:
  replicas: 1
  template:
    metadata:
      labels:
        component: cloudsql-proxy
    spec:
      containers:
        - name: cloudsql-proxy
          image: gcr.io/cloudsql-docker/gce-proxy:1.11
          command:
            - /cloud_sql_proxy
            # <執行個體連線名稱>：改成自己的
            - -instances=<執行個體連線名稱>=tcp:0.0.0.0:3306
            - -credential_file=/secrets/cloudsql/credentials.json
          volumeMounts:
            - name: cloudsql-instance-credentials
              mountPath: /secrets/cloudsql
              readOnly: true
      volumes:
        - name: cloudsql-instance-credentials
          secret:
            secretName: cloudsql-instance-credentials
```

> 透過 cloudsql-proxy 建立一個空殼容器轉發至實際的 Cloud SQL。  

建立 Cloud SQL 的服務設定檔，內容如下：  

```yml
# C:\k8s_sql_sample\mysql_service.yml
apiVersion: v1
kind: Service
metadata:
  name: cloudsql-proxy-service
spec:
  ports:
  - protocol: TCP
    port: 3306
    targetPort: 3306
  selector:
    component: cloudsql-proxy
```

套用上述設定：  

```sh
kubectl apply -f C:\k8s_sql_sample\
```

完成套用後，就可以在 Kubernetes 的群集內，透過 URL `cloudsql-proxy-service` 連到 Cloud SQL 的服務。  

如果有自己的 toolbox 也可以試著用 MySQL CLI 連看看，如下圖：  

```sh
mysql -u root -p[PASSWORD] -h cloudsql-proxy-service
#例：mysql -u root -pPASSWORD -h cloudsql-proxy-service
```

![GCP 教學 - toolbox 連入 Cloud SQL](/images/x424.png)  

> 自製 toolbox 可參考[GCP 教學 - Kubernetes 佈署 Docker Image](/article/gcp-kubernetes-deploy-docker-image.html)。  

## 參考

* [Google Cloud Documentation - MySQL Connecting from GKE](https://cloud.google.com/sql/docs/mysql/connect-kubernetes-engine)  
* [YouTube - How to install Google Cloud SQL Proxy on Kubernetes Engine?](https://www.youtube.com/watch?v=bN000CEg7IM)  