---
title: ASP.NET - System.Runtime ConfigurationErrorsException
author: John Wu
tags:
  - ASP.NET
  - Web.config
categories:
  - ASP.NET
date: 2017-09-01 23:47:00
toc: false
featured_image: /images/x334.png
---
![ASP.NET - System.Runtime ConfigurationErrorsException](/images/x334.png)

最近升級 ASP.NET MVC 專案中的 NuGet 套件，升級完成後，編譯跟單元測試都過了  
但執行時卻遇到 `ConfigurationErrorsException: 無法載入檔案或組件 'System.Runtime' 或其相依性的其中之一。`  

<!-- more -->

錯誤訊息如下：
```
[ConfigurationErrorsException: 無法載入檔案或組件 'System.Runtime' 或其相依性的其中之一。 不應載入參考組件供執行之用。它們只能在反映專用載入器的環境下載入。 (發生例外狀況於 HRESULT: 0x80131058)]
   System.Web.Configuration.CompilationSection.LoadAssemblyHelper(String assemblyName, Boolean starDirective) +728
   System.Web.Configuration.CompilationSection.LoadAllAssembliesFromAppDomainBinDirectory() +196
   System.Web.Configuration.CompilationSection.LoadAssembly(AssemblyInfo ai) +45
   System.Web.Compilation.BuildManager.GetReferencedAssemblies(CompilationSection compConfig) +172
   System.Web.Compilation.BuildManager.GetPreStartInitMethodsFromReferencedAssemblies() +91
   System.Web.Compilation.BuildManager.CallPreStartInitMethods(String preStartInitListPath, Boolean& isRefAssemblyLoaded) +111
   System.Web.Compilation.BuildManager.ExecutePreAppStart() +156
   System.Web.Hosting.HostingEnvironment.Initialize(ApplicationManager appManager, IApplicationHost appHost, IConfigMapPathFactory configMapPathFactory, HostingEnvironmentParameters hostingParameters, PolicyLevel policyLevel, Exception appDomainCreationException) +677

[HttpException (0x80004005): 無法載入檔案或組件 'System.Runtime' 或其相依性的其中之一。 不應載入參考組件供執行之用。它們只能在反映專用載入器的環境下載入。 (發生例外狀況於 HRESULT: 0x80131058)]
   System.Web.HttpRuntime.FirstRequestInit(HttpContext context) +659
   System.Web.HttpRuntime.EnsureFirstRequestInit(HttpContext context) +95
   System.Web.HttpRuntime.ProcessRequestNotificationPrivate(IIS7WorkerRequest wr, HttpContext context) +188
```

原來是我再升級 `System.Runtime` 時，ASP.NET 的 Web.config 被加上了 `System.Runtime` 的 `dependentAssembly`：
```xml
<dependentAssembly>
  <assemblyIdentity name="System.Runtime" publicKeyToken="b03f5f7f11d50a3a" culture="neutral" />
  <bindingRedirect oldVersion="0.0.0.0-4.0.10.0" newVersion="4.0.10.0" />
</dependentAssembly>
```

解決方式就是把 `System.Runtime` 的 `dependentAssembly` 移除，ASP.NET 網站就可以正常運行了。

```xml
<configuration>
  <!-- ... -->
  <runtime>
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
      <!-- ... -->
      <!-- 移除 <dependentAssembly> name="System.Runtime" -->
      <!-- <dependentAssembly> -->
      <!--   <assemblyIdentity name="System.Runtime" publicKeyToken="b03f5f7f11d50a3a" culture="neutral" /> -->
      <!--   <bindingRedirect oldVersion="0.0.0.0-4.0.10.0" newVersion="4.0.10.0" /> -->
      <!-- </dependentAssembly> -->
    </assemblyBinding>
  </runtime>
</configuration>
```

## 參考

https://stackoverflow.com/questions/40207137/reference-assemblies-should-not-be-loaded-for-execution