

Install Java

```bash
wget --no-cookies --no-check-certificate --header "Cookie:oraclelicense=accept-securebackup-cookie" "http://download.oracle.com/otn-pub/java/jdk/8u181-b13/96a7b8442fe848ef90c96a2fad6ed6d1/jre-8u181-linux-x64.rpm"
rpm -ivh jre-*.rpm
```

SonarCube
```bash
# yum -y install unzip
wget https://sonarsource.bintray.com/Distribution/sonarqube/sonarqube-7.3.zip
unzip sonarqube-*.zip -d /opt
mv /opt/sonarqube* /opt/sonarqube

groupadd sonar
useradd sonar -g sonar -p pass.123
chown -R sonar /opt/sonarqube
chgrp -R sonar /opt/sonarqube 

sed -i -- 's/^#RUN_AS_USER=.*/RUN_AS_USER=sonar/g' /opt/sonarqube/bin/linux-x86-64/sonar.sh
systemctl enable sonar
systemctl start sonar

firewall-cmd --add-port=9000/tcp --permanent
firewall-cmd --reload
```

MySQL
```sql
CREATE DATABASE sonar;
CREATE USER 'sonar'@'%' IDENTIFIED BY 'pass.123';
GRANT ALL PRIVILEGES ON sonar.* TO 'sonar'@'%';
```

Setting
```yml
# User credentials.
# Permissions to create tables, indices and triggers must be granted to JDBC user.
# The schema must be created first.
sonar.jdbc.username=sonar
sonar.jdbc.password=pass.123

#----- Embedded Database (default)
# H2 embedded database server listening port, defaults to 9092
#sonar.embeddedDatabase.port=9092

#----- DEPRECATED
#----- MySQL >=5.6 && <8.0
# Support of MySQL is dropped in Data Center Editions and deprecated in all other editions
# Only InnoDB storage engine is supported (not myISAM).
# Only the bundled driver is supported. It can not be changed.
sonar.jdbc.url=jdbc:mysql://192.168.1.11:3306/sonar?useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&useConfigs=maxPerformance&useSSL=false
```

```yml
#vi /etc/systemd/system/sonar.service
[Unit]
Description=SonarQube service

[Service]
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
Restart=always
RestartSec=10
User=sonar
Group=sonar

[Install]
WantedBy=multi-user.target
```



# REF
https://www.vultr.com/docs/how-to-install-sonarqube-on-centos-7
http://larrynung.github.io/2017/02/15/SonarQube-Setup-MySQL-database/
https://hk.saowen.com/a/2fe9ee18baecb2a4374681ecf6505bc59ed46ba57c21cdaaea09eca22b79431f
https://blog.csdn.net/qq_35981283/article/details/81072852