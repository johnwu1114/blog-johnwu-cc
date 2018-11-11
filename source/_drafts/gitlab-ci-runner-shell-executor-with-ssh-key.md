# GitLab CI/CD - Runner 

```bash
ssh-keygen
# Generating public/private rsa key pair.
# Enter file in which to save the key (/home/gitlab-runner/.ssh/id_rsa):
# Created directory '/home/gitlab-runner/.ssh'.
# Enter passphrase (empty for no passphrase):
# Enter same passphrase again:
# Your identification has been saved in /home/gitlab-runner/.ssh/id_rsa.
# Your public key has been saved in /home/gitlab-runner/.ssh/id_rsa.pub.
# The key fingerprint is:
# SHA256:xxxxxxxxxxxxxxxxxxxxxx/xxx/xxxxxxxxxx/xxxxx gitlab-runner@ubuntu-cicd.johnwu.cc
# The key's randomart image is:
# +---[RSA 2048]----+
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# |xxxxxxxxxxxxxxxxx|
# +----[SHA256]-----+

ssh-copy-id root@dev.johnwu.cc
# /usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/gitlab-runner/.ssh/id_rsa.pub"
# The authenticity of host 'dev.johnwu.cc (192.168.1.11)' can't be established.
# ECDSA key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
# Are you sure you want to continue connecting (yes/no)? yes
# /usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
# /usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
# root@dev.johnwu.cc's password:

# Number of key(s) added: 1

# Now try logging into the machine, with:   "ssh 'root@dev.johnwu.cc'"
# and check to make sure that only the key(s) you wanted were added.

ssh root@dev.johnwu.cc
```