

```yml
variables:
  stagingServer: "example@staging.example.com"
  targetServer: "example@dev.example.com"
  targetFolder: "~/"

stages:
  - UnitTest
  - Build
  - Deploy
  - IntegrationTest

########## Templates ##########
.build_template: &build_definition
  stage: Build
  before_script:
    - cd ./src/$projectName
  script:
    - dotnet publish -o $CI_PROJECT_DIR/publish/$projectName -c Release
  cache:
    paths:
      - publish/
  tags:
    - dotnet
  only:
    - master
    - develop

.npm_build_template: &npm_build_definition
  stage: Build
  before_script:
    - free -m
    - cd ./src/$projectName
    - npm install
    - if [ $CI_COMMIT_REF_NAME == "master" ]; then npm_command="build"; else npm_command="dev"; fi
  script:
    - npm run "$npm_command"
  after_script:
    - rsync -auv src/$projectName/wwwroot/ publish/$projectName/wwwroot
  cache:
    paths:
      - publish/
  tags:
    - dotnet
  only:
    - master
    - develop

.deploy_template: &deploy_definition
  stage: Deploy
  before_script:
    - if [ $CI_COMMIT_REF_NAME == "master" ]; then targetServer=$(eval "echo $stagingServer"); fi
  script:
    - rsync -auv publish/$projectName/ $targetServer:$targetFolder$projectName
  after_script:
    - ssh $targetServer "sudo systemctl restart $serviceName"
  cache:
    paths:
      - publish/
  tags:
    - dotnet
  only:
    - master
    - develop

########## Example.Api.External ##########
.parameters_external:
  variables: &external_variables
    serviceName: "example-api-external"
    projectName: "Example.Api.External"
Build:External:
  <<: *build_definition
  variables: *external_variables
Deploy:External:
  <<: *deploy_definition
  variables: *external_variables
  dependencies:
    - Build:External

########## Example.Api.Internal ##########
.parameters_internal:
  variables: &internal_variables
    serviceName: "example-api-internal"
    projectName: "Example.Api.Internal"
Build:Internal:
  <<: *build_definition
  variables: *internal_variables
Deploy:Internal:
  <<: *deploy_definition
  variables: *internal_variables
  dependencies:
    - Build:Internal

########## Example.App.JobService ##########
.parameters_jobservice:
  variables: &jobservice_variables
    serviceName: "example-app-jobservice"
    projectName: "Example.App.JobService"
Build:JobService:
  <<: *build_definition
  variables: *jobservice_variables
Deploy:JobService:
  <<: *deploy_definition
  variables: *jobservice_variables
  dependencies:
    - Build:JobService

########## Example.Web.Portal ##########
.parameters_portal:
  variables: &portal_variables
    serviceName: "example-web-portal"
    projectName: "Example.Web.Portal"
1/2 Build:Portal:
  <<: *build_definition
  variables: *portal_variables
2/2 Build:Portal:
  <<: *npm_build_definition
  variables: *portal_variables
Deploy:Portal:
  <<: *deploy_definition
  variables: *portal_variables
  dependencies:
    - 1/2 Build:Portal
    - 2/2 Build:Portal
    
########## Example.UnitTest ##########
UnitTest:
  stage: UnitTest
  before_script:
    - cd ./tests/Example.UnitTest
  script:
    - dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
    - dotnet ~/.nuget/packages/reportgenerator/4.0.0-rc4/tools/netcoreapp2.0/ReportGenerator.dll "-reports:coverage.opencover.xml" "-targetdir:$CI_PROJECT_DIR/coverage"
  after_script:
    - /usr/bin/cp tests/Example.UnitTest/coverage.opencover.xml coverage/opencover.xml
    - rsync -auv coverage/ $targetServer:~/coverage
    - cat coverage/index.htm | head -n 30 | tail -15
  coverage: /Branch coverage:[<\/>a-zA-Z \t]+(\d+\.\d+|\d+)%/
  cache:
    paths:
      - publish/
  tags:
    - dotnet
  only:
    - master
    - develop

########## Example.IntegrationTest ##########
IntegrationTest:
  stage: IntegrationTest
  before_script:
    - echo "Waiting for services startup"
    - sleep 10
    - cd ./tests/Example.IntegrationTest
  script:
    - dotnet test
  tags:
    - dotnet
  only:
    - develop
```