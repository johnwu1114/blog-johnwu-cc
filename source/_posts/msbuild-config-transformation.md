---
title: MSBuild - Transform Configuration
author: John Wu
tags:
  - MSBuild
  - Config
  - CI/CD
categories:
  - MSBuild
date: 2017-06-09 09:54:00
---
![MSBuild - Result](/images/pasted-186.png)

最近在重新檢視 CI/CD (Continuous Integration / Continuous Delivery) 流程，順手把 Build Config 的方式都改了。  
目前有部分 Config 還是 XML 格式，其它大多以換成 JSON 格式，Config 我們都是透過 MSBuild 來置換個環境的變數。  
本篇將介紹透過 MSBuild 替換 XML 的內容。  

<!-- more -->

## 檔案結構

```yml
Input/
  ProjectA/
    Log4net.DEV.config
    Log4net.QAT.config
    Log4net.Release.config
    Web.DEV.config
    Web.QAT.config
    Web.Release.config
  ProjectB/
    Log4net.DEV.config
    Log4net.QAT.config
    Log4net.Release.config
    Web.DEV.config
    Web.QAT.config
    Web.Release.config
  ...
  ProjectN/
    Log4net.DEV.config
    Log4net.QAT.config
    Log4net.Release.config
    Web.DEV.config
    Web.QAT.config
    Web.Release.config
Source/
  ProjectA/
    Log4net.config
    Web.config
  ProjectB/
    Log4net.config
    Web.config
  ...
  ProjectN/
    Log4net.Release.config
    Web.Release.config
Configuration.xml
```

我們要把 `*.Release.config` 的特定區塊，替換掉 `*.config`。  

例如：  
Input/Web.Release.config
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <system.web>
    <compilation xdt:Transform="RemoveAttributes(debug)" />
  </system.web>
</configuration>
```
> 此範例會找到 Web.config 中的 compilation 標籤，移除 debug 屬性。

## 建立 MSBuild 專案

MSBuild 專案是 XML 格式，所以建個 XML 檔案 Configuration.xml，如下：
```xml
<?xml version="1.0" encoding="utf-8"?>
<Project DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">

  <PropertyGroup>
    <SourcePath>Source\</SourcePath>
    <InputPath>Input\</InputPath>
    <OutputPath>Output\</OutputPath>
  </PropertyGroup>
  
  <ItemGroup>
    <TransformConfigs Include="$(InputPath)**\*.$(Configuration).config" />
  </ItemGroup>
  
  <Target Name="Clean">
    <RemoveDir Directories="$(OutputPath)" Condition="Exists('$(OutputPath)')" />
  </Target>
  
  <Target Name="Rebuild" DependsOnTargets="Clean;Build" />
  
  <Target Name="TransformConfigs"
	  Inputs="@(TransformConfigs)"
    Outputs="%(Identity).AlwaysRun">
    <PropertyGroup>
      <TransformFile>@(TransformConfigs->'%(RecursiveDir)')@(TransformConfigs->'%(Filename).config'->ToLower())</TransformFile>
      <SourceFile>$(TransformFile.Replace('.$(Configuration.ToLower())', ''))</SourceFile>
    </PropertyGroup>
    <TransformXml Condition="Exists('$(SourcePath)$(SourceFile)')"
      Source="$(SourcePath)$(SourceFile)"
      Transform="$(InputPath)$(TransformFile)"
      Destination="$(OutputPath)$(SourceFile)" />
  </Target>

  <Target Name="Build">
    <MakeDir Directories="$(OutputPath)"/>  
    <CallTarget Targets="TransformConfigs" />
  </Target>
  
  <Import Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v15.0\WebApplications\Microsoft.WebApplication.targets" />
  
</Project>
```
> Import Project 中的路徑 `v15.0` 是 Visual Studio 2017 MSBuild 的路徑。    
> 用不同版本的 MSBuild 記得更換。  

## 執行結果

執行指令
```batch
msbuild Configuration.xml /p:Configuration=Release /t:rebuild
```

![MSBuild - Result](/images/pasted-186.png)
> 要在 console 使用 msbuild，要先在環境變數中加入 msbuild 的 Path。  
> Visual Studio 2017 預設路徑為 `C:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\MSBuild\15.0\Bin`

透過不同的 Configuration 參數，就可以輕易的把各環境 Configuration 產出，很方便吧～

## 參考

[MSBuild 參考](https://msdn.microsoft.com/zh-tw/library/0k6kkbsd.aspx)
[Web.Config Transformation - Transform on build](http://larrynung.github.io/2014/07/07/web-dot-config-transformation-transform-on-build/)