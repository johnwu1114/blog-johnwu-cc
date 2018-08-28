

```sh
dotnet tool install --global dotnet-reportgenerator-globaltool --version 4.0.0-rc4
```


```sh
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
reportgenerator "-reports:coverage.opencover.xml" "-targetdir:coverage"
```

https://www.nuget.org/packages/dotnet-reportgenerator-globaltool
