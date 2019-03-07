---
title: Kubernetes 安裝筆記
author: John Wu
tags:
  - Kubernetes
  - k8s
  - Notes
categories:
  - Kubernetes
date: 2018-10-22 10:42:00
updated: 2019-03-07 19:34:00
---
![Kubernetes 安裝筆記](/images/logo-kubernetes.png)

用 CentOS 練習安裝 Kubernetes 的筆記。

<!-- more -->

## Install Docker

```sh
yum install -y docker
```

## Install kubeadm & kubelet & kubectl

```sh
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
yum install -y kubeadm kubelet kubectl
```

## Before Start Service

```sh
# 允許 containers 連到 host
setenforce 0
sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config
sed -i 's/^SELINUXTYPE=.*/SELINUX=targeted/' /etc/selinux/config
```

## 關閉 swap

```sh
swapoff -a
# 如果 /etc/fstab 有掛載 swap，必須要註解掉，不然重開機時又會重新掛載 swap
sed -i 's/.*swap.*/#&/' /etc/fstab
```

## Start Service

```sh
systemctl enable docker
systemctl start docker

systemctl enable kubelet
systemctl start kubelet

# 初始化
kubeadm init --pod-network-cidr=10.244.0.0/16
```

修改權限，讓 root 以外的權限也可以使用 kubernetes

```sh
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

## Check Service

```sh
kubectl version
kubectl get cs
```

## Apply Master has Node

```sh
kubectl taint nodes --all node-role.kubernetes.io/master-
```

## Install Pod network

```sh
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.10.0/Documentation/kube-flannel.yml
systemctl restart kubelet
```

## Create Pod

```yml
# vi lab1-pod.yml
apiVersion: v1
kind: Pod
metadata:
  name: lab1-pod
  labels:
    app: webserver
spec:
  containers:
  - name: lab1-container
    image: httpd
    ports:
    - containerPort: 80
```

```sh
kubectl create -f lab1-pod.yml
kubectl get pods
# kubectl delete pods lab1-pod
```

## Bind Service

```sh
kubectl expose pod lab1-pod --name=lab1-pod-service --type=NodePort --port=80
kubectl get services
# kubectl delete services lab1-pod-service
```

## Bind Replication Controller

```yml
# vi lab2-replication-controller.yml
apiVersion: v1
kind: ReplicationController
metadata:
  name: lab2-replication-controller
  labels:
    app: webserver
spec:
  replicas: 3
  selector:
   app: lab2-pod
  template:
    metadata:
      labels:
        app: lab2-pod
    spec:
      containers:
      - name: lab2-container
        image: httpd
        ports:
        - containerPort: 80
```

```sh
kubectl create -f lab2-replication-controller.yml
kubectl get rc

kubectl scale --replicas=4 -f lab2-replication-controller.yml

# kubectl delete rc lab2-replication-controller
```

## Ref

* [Kubernetes Documentation](https://kubernetes.io/docs/home/)  
* [Using kubeadm to Create a Cluster](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/)  
* [CentOS 安裝Kubernetes (Kubernetes install in CentOS 7)](https://www.nctusam.com/2017/07/26/centos-%E5%AE%89%E8%A3%9Dkubernetes-kubernetes-install-in-centos-7/)  
* [使用kubeadm安装Kubernetes 1.7](https://blog.frognew.com/2017/07/kubeadm-install-kubernetes-1.7.html#)  
* [Kubernetes 30天學習筆記系列 - [Day 5] 在 Minikube 上跑起你的 Docker Containers - Pod & kubectl 常用指令](https://ithelp.ithome.com.tw/articles/10193232)