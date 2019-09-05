---
title: 'CentOS 安裝及設定 ASP.NET Core + Nginx Proxy'
author: John Wu
tags:
  - ASP.NET Core
  - CentOS
  - Nginx
  - Linux
categories:
  - ASP.NET Core
date: 2019-07-31 23:17
featured_image: /images/b/30.png
---

本篇介紹在 CentOS 環境下，安裝及設定 ASP.NET Core Runtime 和 Nginx Proxy。  
並將 ASP.NET Core 註冊成系統服務，便於開機後自動啟動，附上 Shell Script 寫的快速安裝腳本。  

<!-- more -->

## 環境

* CentOS 7 Minimal 版  
* ASP.NET Core Runtime 2.2 版  

## 安裝腳本

新增一個檔案 `setup-aspnet-core.sh` 內容如下：  

```sh
#!/bin/bash

main() {
    sudo yum -y install epel-release
    sudo yum -y update

    install_nginx
    install_dotnet

    sudo firewall-cmd --add-service=http --permanent
    sudo firewall-cmd --add-service=https --permanent
    sudo firewall-cmd --reload
}

install_nginx() {
    echo "###################################"
    echo "########## Install Nginx ##########"
    echo "###################################"
    sudo yum -y install httpd-tools nginx
    sudo setsebool -P httpd_can_network_connect on
    sudo sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config
    sudo setenforce 0
    sudo systemctl enable nginx
    sudo systemctl restart nginx
}

install_dotnet() {
    echo "###########################################"
    echo "########## Install .NET Core 2.2 ##########"
    echo "###########################################"
    sudo rpm -Uvh https://packages.microsoft.com/config/rhel/7/packages-microsoft-prod.rpm
    sudo yum -y install aspnetcore-runtime-2.2
}

main "$@"
```

透過以下指令執行安裝腳本，便會自動安裝 ASP.NET Core Runtime 及 Nginx。  

```sh
sudo sh setup-aspnet-core.sh
```

## 註冊 ASP.NET Core 服務

在 `/etc/systemd/system/<自訂名稱>.service` 新增一個服務，把 ASP.NET Core 的停起都透過系統服務控制。  
例 `/etc/systemd/system/my-website.service` 內容如下：

```yml
[Unit]
# Description=<此服務的摘要說明>
Description=MyWebsite

[Service]
# WorkingDirectory=<ASP.NET Core 專案目錄>
WorkingDirectory=/usr/share/my-website

# ExecStart=/bin/dotnet <ASP.NET Core 起始 dll>
ExecStart=/bin/dotnet MyWebsite.dll

# 啟動若失敗，就重啟到成功為止
Restart=always
# 重啟的間隔秒數
RestartSec=10

# 設定環境變數，注入給 ASP.NET Core 用
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

> 注意！ `dotnet` CLI 的路徑可能不一樣，有可能如上例在 **/bin/dotnet** 也有可能在 **/usr/bin/dotnet**  
> 建議先用指令 `which dotnet` 查看 `dotnet` CLI 的路徑。

服務相關指令：  

```sh
# 開啟，開機自動啟動服務
systemctl enable my-website.service

# 關閉，開機自動啟動服務
systemctl disable my-website.service

# 啟動服務
systemctl start my-website.service

# 重啟服務
systemctl restart my-website.service

# 停止服務
systemctl stop my-website.service

# 查看服務狀態
systemctl status my-website.service
```

執行啟動指令後，再執行查看服務狀態確認是否執行成功。  

## 設定 Nginx Proxy

新增檔案 `/etc/nginx/conf.d/default_proxy_settings`，以便其他設定重複使用：  

```yml
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $http_connection;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-Host $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_cache_bypass $http_upgrade;
```

ASP.NET Core Proxy 設定 `/etc/nginx/conf.d/my-website.conf`：

```yml
upstream portal {
    # localhost:5000 改成 ASP.NET Core 所監聽的 Port
    server localhost:5000;
}

server {
    # 只要是透過這些 Domain 連 HTTP 80 Port，都會轉送封包到 ASP.NET Core
    listen 80;
    # 可透過空白區分，綁定多個 Domain
    server_name demo.johnwu.cc example.johnwu.cc;
    location / {
        proxy_pass http://portal/;
        include /etc/nginx/conf.d/default_proxy_settings;
    }
}

# 用 HTTPS 必須要有 SSL 憑證，如果沒有要綁定 SSL 可以把下面整段移除
server {
    # 只要是透過這些 Domain 連 HTTPS 443 Port，都會轉送封包到 ASP.NET Core
    listen 443 ssl;
    server_name demo.johnwu.cc;
    ssl_certificate /etc/nginx/ssl/demo.johnwu.cc_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/demo.johnwu.cc.key;

    location / {
        proxy_pass http://portal/;
        include /etc/nginx/conf.d/nginx_proxy_conf;
    }
}
```

修改完成後，執行以下指令檢查及套用：  

```sh
# 檢查 Nginx 的設定是否有誤
nginx -t

# 若沒有錯誤，即可套用
nginx -s reload
```

套用以上設定後，架構如下圖：  

![CentOS 快速安裝 ASP.NET Core 及 Nginx - 架構圖](/images/b/30.png)

## 參考

* [Install .NET Core SDK on Linux CentOS / Oracle - x64](https://dotnet.microsoft.com/download/linux-package-manager/centos/sdk-current)  