---
title: Kubernetes - Nodes NotReady
author: John Wu
tags:
  - Kubernetes
  - k8s
  - Notes
categories:
  - Kubernetes
date: 2019-03-07 22:49:00
---
![Kubernetes - Nodes NotReady](/images/featured/kubernetes.png)

在 CentOS 啟動 Kubernetes 遇到 Nodes NotReady 的問題。
使用 `kubectl get nodes` 查詢 Node 狀態，顯示 **NotReady**，如下：

```sh
NAME                    STATUS     ROLES    AGE    VERSION
k8s-master.xxxxxx.xxx   NotReady   master   101m   v1.13.4
```

<!-- more -->

## Log

透過 `journalctl -f -u kubelet` 指令查詢 log，一直重複顯示以下訊息：

```sh
Mar 07 19:57:32 k8s-master.xxxxxx.xxx  kubelet[5454]: W0307 19:57:32.340979    5454 cni.go:203] Unable to update cni config: No networks found in /etc/cni/net.d
Mar 07 19:57:32 k8s-master.xxxxxx.xxx  kubelet[5454]: E0307 19:57:32.341397    5454 kubelet.go:2192] Container runtime network not ready: NetworkReady=false reason:NetworkPluginNotReady message:docker: network plugin is not ready: cni config uninitialized
```

## 原因

kubelet 參數多了 `network-plugin=cni`，但卻沒安裝 cni，所以打開設定檔把 `network-plugin=cni` 的參數移除。  

可能在以下兩個檔案中的其中一個：

* /etc/systemd/system/kubelet.service.d/10-kubeadm.conf  
* /var/lib/kubelet/kubeadm-flags.env  
 (v1.11 以後的版本，應該是在這個檔案)

以 v1.13.4 的版本為例：  

```sh
#KUBELET_KUBEADM_ARGS=--cgroup-driver=cgroupfs --network-plugin=cni --pod-infra-container-image=k8s.gcr.io/pause:3.1
KUBELET_KUBEADM_ARGS=--cgroup-driver=cgroupfs --pod-infra-container-image=k8s.gcr.io/pause:3.1
```

改完之後重啟服務：

```sh
systemctl daemon-reload
systemctl restart kubelet
```

再次使用 `kubectl get nodes` 查詢 Node 狀態，顯示 **Ready** 囉，如下：

```sh
NAME                    STATUS   ROLES    AGE   VERSION
k8s-master.xxxxxx.xxx   Ready    master   62m   v1.13.4
```

# 參考

* [kubernetes—CentOS7安装kubernetes1.11.2图文完整版 | A box of chocolate](https://blog.jsjs.org/?p=1043)
* [Installing kubeadm - Kubernetes](https://kubernetes.io/docs/setup/independent/install-kubeadm/)