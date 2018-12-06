## Install

```sh
# Linux x86-64
sudo wget -O /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64

sudo chmod +x /usr/local/bin/gitlab-runner
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash

sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
sudo gitlab-runner start
```

## Docker

```sh
curl -sSL https://get.docker.com/ | sh
usermod -aG docker gitlab-runner
sudo service docker restart
```

## Register

```sh
sudo gitlab-runner register
```
### One-line registration command

```sh
sudo gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.com/" \
  --registration-token "PROJECT_REGISTRATION_TOKEN" \
  --executor "docker" \
  --docker-image alpine:3 \
  --description "docker-runner" \
  --tag-list "docker" \
  --run-untagged \
  --locked="false" \
```

## Ref 

https://docs.gitlab.com/runner/install/linux-manually.html
https://docs.gitlab.com/runner/install/linux-repository.html
https://docs.gitlab.com/runner/register/index.html