---
title: 'Docker 教學 - Docker Image 混合公有及私有 Docker Registry'
author: John Wu
tags:
  - Docker
categories:
  - Docker
date: 2019-08-01 22:45
featured_image: /images/x432.png
---

本篇介紹如何依照不同的資料類型分層建置 Docker Image；  
並把開放性資料及敏感資料的分層，分別推上公有和私有 Docker Registry。  

<!-- more -->

## 情境描述

最近在一個特殊的網路環境下，因流量限制及安全性考量，產生了這個特別的需求，網路架構如下圖：  

![Docker 教學 - Docker Image 混合公有及私有 Docker Registry - 情境描述網路架構圖](/images/x431.png)  

開發環境跟生產環境都可以連到外網，但兩邊的網路互不相通，只能透過 Cleanroom 存取兩邊的網路環境。  
但上圖紅線部分，Cleanroom 連到生產環境有以下問題：  

1. 網路速度慢  
2. 連線品質不佳  
3. 網路費昂貴依流量計價  

若直接將 Docker Images 從 Cleanroom 推上生產環境，每次佈署都會產生驚人的費用。  
生產環境雖然可以連外網，但因安全性考量**不能在外網建立私有 Docker Registry**，所以只能在開發環境跟生產環境內部架設私有 Docker Registry。  

## 實作方式

在建置 Docker Image 時，可利用 Docker Layer 的特性，將非敏感資料及敏感資料分層，把敏感資料的 Layer 降至最低，透過 Cleanroom 傳送到生產環境，其餘則直接退送到外部公開的 Docker Registry。  

Docker Image 分為以下三個階段，分別建置出三個 Docker Image，再拼裝成可直接被運行的 Docker Image。  
此範例主要是以 ASP.NET Core 作為建置範例，但此範例不侷限於 ASP.NET Core 專案。  

### Build Artifacts

### Build Third-Party Reference

### Build Final Image

範例實作結果流程圖：  

![Docker 教學 - Docker Image 混合公有及私有 Docker Registry - 範例實作結果流程圖](/images/x432.png)

## 參考

* [Docker 官方文件 - Dockerfile reference](https://docs.docker.com/engine/reference/builder/)