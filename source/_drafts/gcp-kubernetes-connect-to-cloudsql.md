---
title: GCP 教學 - Kubernetes 與 Cloud SQL 連線
author: John Wu
tags:
  - GCP
  - k8s
  - 'Cloud SQL'
categories:
  - Kubernetes
date: 
featured_image: /images/logo-kubernetes.png
---
![GCP 教學 - Kubernetes 與 Cloud SQL 連線](/images/logo-kubernetes.png)

<!-- more -->

## SQL

### 透過 SDK 登入
```sh
gcloud sql connect cloudsql-mysql --user=root
```

沒裝 mysql client 會出錯
```
Whitelisting your IP for incoming connection for 5 minutes...done.
ERROR: (gcloud.sql.connect) Mysql client not found.  Please install a mysql client and make sure it is in PATH to be able to connect to the database instance.
```

gcloud sql users set-password root --host=% --instance cloudsql-mysql --password=xxxxxxxx

### Create proxy service

https://cloud.google.com/sql/docs/mysql/connect-kubernetes-engine

```sh
# 用您之前下載的金鑰檔案建立 cloudsql-instance-credentials 密鑰：
# kubectl create secret generic cloudsql-instance-credentials --from-file=credentials.json=[PROXY_KEY_FILE_PATH]
kubectl create secret generic cloudsql-instance-credentials --from-file= ="C:\xxxxx\prod-xxxxx-xxxxx.json"
```

mysql_deployment.yml
```yml
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
          image: asia.gcr.io/cloudsql-docker/gce-proxy:1.11
          command:
            - /cloud_sql_proxy
            # [INSTANCES_NAME]
            - -instances=[INSTANCES_NAME]:cloudsql-mysql=tcp:0.0.0.0:3306
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

mysql_service.yml
```yml
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


```
kubectl apply -f C:\Users\John\GitProjects\mms\tools\kubernetes\mysql_deployment.yml
```

## 參考

* [Google Cloud Documentation - MySQL Connecting from GKE](https://cloud.google.com/sql/docs/mysql/connect-kubernetes-engine)  
* [YouTube - How to install Google Cloud SQL Proxy on Kubernetes Engine?](https://www.youtube.com/watch?v=bN000CEg7IM)  