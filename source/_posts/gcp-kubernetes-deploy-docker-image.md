---
title: GCP 教學 - Kubernetes 佈署 Docker Image
author: John Wu
tags:
  - GCP
  - k8s
  - Docker
categories:
  - Kubernetes
date: 2018-10-25 17:11:00
featured_image: /images/featured/kubernetes.png
---
![GCP 教學 - Kubernetes 佈署 Docker Image](/images/featured/kubernetes.png)

介紹如何透過 GCP (Google Cloud Platform) 的 Cloud SDK，上傳 Docker Image 及佈署到 Kubernetes。

<!-- more -->

## 前置準備

### Cloud SDK

下載 Cloud SDK 並安裝，官網下載位置：  
https://cloud.google.com/sdk/downloads

安裝完成後，打開 Cloud SDK 進行授權驗證，指令如下：  
```sh
gcloud auth login
```
接著會跳出授權驗證的網頁，進行確認，如下圖：  
![GCP 教學 - Kubernetes 佈署 Docker Image - Cloud SDK 驗證 - 1](/images/b/08.png)  
![GCP 教學 - Kubernetes 佈署 Docker Image - Cloud SDK 驗證 - 2](/images/b/09.png)  

### 建立 Kubernetes Cluster

在開始之前，請先到 GCP 的 Kubernetes Engine 建立 Cluster，如下圖：  
![GCP 教學 - Kubernetes 佈署 Docker Image - 建立 Kubernetes Cluster](/images/b/06.png)
> GCP 第一年送 300 美金，讓你試用。  

建立完成後，可以透過 Cloud SDK 看看自己建好的 Kubernetes Cluster，指令如下：  
```sh
gcloud container clusters get-credentials [CLUSTER_NAME] --zone=[CLUSTER_ZONE] --project=[PROJECT_ID]
# 範例： gcloud container clusters get-credentials my-cluster-1 --zone asia-east1-a --project prod-xxxxx
```
* **CLUSTER_NAME** 及 **CLUSTER_ZONE**  
 可以從 Kubernetes Engine 的管理頁面查看：  
 ![GCP 教學 - Kubernetes 佈署 Docker Image - Cluster Name & Zone](/images/b/10.png)  
* **PROJECT_ID**  
 可以從 GCP 頁面上方查看，如下圖：  
 ![GCP 教學 - Kubernetes 佈署 Docker Image - Project Id](/images/b/07.png)  

## Container Registry

GCP 有提供私有的 Docker Registry 叫做 Container Registry，此篇範例我將做一個 Docker 推到 GCP 提供的 Container Registry。　　

### Build

建立一個 Ubuntu 的 Image 並安裝一些常用的小工具，Dockerfile 內容如下：  
```Dockerfile
FROM ubuntu:18.04
RUN apt-get update \
    && apt-get install -y \
        telnet \
        net-tools \
        curl \
        wget \
        iputils-ping \
        redis-tools \
        mysql-client
CMD [ "/bin/bash", "-c", "tail -f /dev/null" ]
```
> `tail -f /dev/null` 很重要，如果沒有持續性的運行，Kubernetes 會當作這個容器已經結束工作，重新把它啟用，然後就出現 **CrashLoopBackOff**。  

接著使用 `docker build` 建立 Docker Image：  
```sh
docker build -t [HOSTNAME]/[PROJECT_ID]/[IMAGE_NAME]:[TAG] - < [DOCKERFILE_PATH]
# 範例： docker build -t asia.gcr.io/prod-xxxxx/toolbox:v1.0 - < C:\xxxxx\Dockerfile
```
> Docker Image 不一定要如上述命名，但為了方便以下教學，建議這樣命名。  

* **HOSTNAME**  
 選項如下：
 * `gcr.io` 美國 United States (未來可能會換到其他地區)  
 * `us.gcr.io` 美國 United States  
 * `eu.gcr.io` 歐洲 European Union  
 * `asia.gcr.io` 亞洲 Asia  
* **PROJECT_ID**  
 同上方介紹的方式查看  
* **IMAGE_NAME**  
 自行定義  
* **TAG**  
 自行定義  
* **DOCKERFILE_PATH**  
 Dockerfile 的檔案位置   

### Push

建立完 Docker Image 後，就可以透過 `docker push` 指令將 Docker Image 推上 GCP 的 Container Registry，如下：  
```sh
docker push [Hostname]/[Project Id]/[Image Name]
# 範例： docker push asia.gcr.io/prod-xxxxx/toolbox
```
參數如上方說明。

> 注意！首次使用必須要先取得 GCP 的 configure-docker 授權，指令如下：  
  ```sh
  gcloud auth configure-docker
  ```

## Kubernetes 佈署

準備好 Docker Image 後，就可以透過 Kubernetes 的 `kubectl run` 指令，將私有的 Docker Image 佈署到 GCP 的 Kubernetes Cluster：  
```sh
kubectl run [DEPLOYMENT_NAME] --image=[DOCKER_REGISTRY]
# 範例： kubectl run toolbox --image=asia.gcr.io/prod-xxxxx/toolbox:v1.0
```
* **DEPLOYMENT_NAME**  
 自行定義的 Kubernetes 佈署名稱  
* **DOCKER_REGISTRY**  
 Docker Image 的來源位置，如果是放在 Docker Hub，也可以改成 Docker Hub 的位置。  
 如：`kubectl run busybox --image=busybox`  

佈署完成後，可以透過 `kubectl get pods` 查看已啟動的 Pods：
```sh
kubectl get pods
```
若狀態顯示 Running，便透過 Pod Name 進入 Container，指令如下：  
```sh
kubectl exec -it [POD_NAME] -- bash
# 範例： kubectl exec -it toolbox-db89c544f-j4p8s -- bash
```

出結果如下：  
![GCP 教學 - Kubernetes 佈署 Docker Image - Kubernetes 佈署](/images/b/12.png)  

## 參考

* [Google Cloud Documentation - Kubernetes Engine Troubleshooting](https://cloud.google.com/kubernetes-engine/docs/troubleshooting)  
* [Google Cloud Documentation - Container Registry Pushing and Pulling Images](https://cloud.google.com/container-registry/docs/pushing-and-pulling)  