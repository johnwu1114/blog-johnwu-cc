

```
[BadImageFormatException: 無法載入參考組件供執行之用。]

[BadImageFormatException: 無法載入檔案或組件 'System.Runtime' 或其相依性的其中之一。 不應載入參考組件供執行之用。它們只能在反映專用載入器的環境下載入。 (發生例外狀況於 HRESULT: 0x80131058)]
   System.Reflection.RuntimeAssembly._nLoad(AssemblyName fileName, String codeBase, Evidence assemblySecurity, RuntimeAssembly locationHint, StackCrawlMark& stackMark, IntPtr pPrivHostBinder, Boolean throwOnFileNotFound, Boolean forIntrospection, Boolean suppressSecurityChecks) +0
   System.Reflection.RuntimeAssembly.nLoad(AssemblyName fileName, String codeBase, Evidence assemblySecurity, RuntimeAssembly locationHint, StackCrawlMark& stackMark, IntPtr pPrivHostBinder, Boolean throwOnFileNotFound, Boolean forIntrospection, Boolean suppressSecurityChecks) +36
   System.Reflection.RuntimeAssembly.InternalLoadAssemblyName(AssemblyName assemblyRef, Evidence assemblySecurity, RuntimeAssembly reqAssembly, StackCrawlMark& stackMark, IntPtr pPrivHostBinder, Boolean throwOnFileNotFound, Boolean forIntrospection, Boolean suppressSecurityChecks) +152
   System.Reflection.RuntimeAssembly.InternalLoad(String assemblyString, Evidence assemblySecurity, StackCrawlMark& stackMark, IntPtr pPrivHostBinder, Boolean forIntrospection) +77
   System.Reflection.RuntimeAssembly.InternalLoad(String assemblyString, Evidence assemblySecurity, StackCrawlMark& stackMark, Boolean forIntrospection) +21
   System.Reflection.Assembly.Load(String assemblyString) +28
   System.Web.Configuration.CompilationSection.LoadAssemblyHelper(String assemblyName, Boolean starDirective) +38

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

```xml
<configuration>
  <!-- ... -->
  <runtime>
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
      <!-- ... -->
      <dependentAssembly>
        <assemblyIdentity name="System.Runtime" publicKeyToken="b03f5f7f11d50a3a" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-4.0.10.0" newVersion="4.0.10.0" />
      </dependentAssembly>
    </assemblyBinding>
  </runtime>
</configuration>
```

## 參考

https://stackoverflow.com/questions/40207137/reference-assemblies-should-not-be-loaded-for-execution