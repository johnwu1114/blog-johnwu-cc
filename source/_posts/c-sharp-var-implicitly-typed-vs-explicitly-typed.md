---
title: C# - var 隱含型別(Implicitly Typed) vs 顯式型別(Explicitly Typed)
author: John Wu
tags:
  - 'C#'
categories:
  - 'C#'
date: 2017-09-13 13:18:00
featured_image: /images/x344.png
---
![C# - var 隱含型別(Implicitly Typed) vs 顯式型別(Explicitly Typed) - .NET Reflector](/images/x344.png)

每當部門有新來的 C# 工程師，在 Code Review 時幾乎都會看到顯式型別，我是強烈建議使用隱含型別。  
所以我幾乎都要重講一次隱含型別(Implicitly Typed)及顯式型別(Explicitly Typed)的差異，索性就寫了這篇解說。  

<!-- more -->

## 基本介紹

### 隱含型別 (Implicitly Typed)

隱含型別是使用 `var` 這個關鍵字宣告變數，它會在編譯期間被指派明確的型別，用法如下：
```cs
var i = 10; 
var members = GetMembers();
```

### 顯式型別 (Explicitly Typed)

顯式型別是在程式碼中明確宣告變數，用法如下：
```cs
int i = 10;
List<Member> members = GetMembers();
```

## 程式碼可讀性

有些人喜歡明確宣告型別，從程式碼就可以看出類別。  
有些人則認為使用 `var` 讓程式碼更為簡潔比較好。  
個人喜好的部分，比較不能論斷兩者之間的好壞，所以見仁見智。  

> 但如果只是為了在撰寫期間想知道型別，現在的 IDE 都超強的，尤其 Visual Studio，只要滑鼠游標移上去就可以知道類別了。良好的變數命名規則，我相信會比宣告顯式型別容易閱讀。  

![C# - var 隱含型別(Implicitly Typed) vs 顯式型別(Explicitly Typed) - Visual Studio](/images/x343.png)

## 執行效能差異

有些人會擔心用 `var` 影響程式執行效能，我用以下範例做個小實驗。

範例程式碼：
```cs
public int ImplicitlyTyped()
{
    var i = 10;
    var members = GetMembers();
    return i;
}

public int ExplicitlyTyped()
{
    int i = 10;
    List<Member> members = GetMembers();
    return i;
}
```

經過編譯後產生的 IL 如下：
```cs
.method public hidebysig instance int32 ImplicitlyTyped() cil managed
{
    .maxstack 1
    .locals init (
        [0] int32 num,
        [1] class [System.Collections]System.Collections.Generic.List`1<class Example.Member> list,
        [2] int32 num2)
    L_0000: nop 
    L_0001: ldc.i4.s 10
    L_0003: stloc.0 
    L_0004: ldarg.0 
    L_0005: call instance class [System.Collections]System.Collections.Generic.List`1<class Example.Member> Example.MyExample::GetMembers()
    L_000a: stloc.1 
    L_000b: ldloc.0 
    L_000c: stloc.2 
    L_000d: br.s L_000f
    L_000f: ldloc.2 
    L_0010: ret 
}

.method public hidebysig instance int32 ExplicitlyTyped() cil managed
{
    .maxstack 1
    .locals init (
        [0] int32 num,
        [1] class [System.Collections]System.Collections.Generic.List`1<class Example.Member> list,
        [2] int32 num2)
    L_0000: nop 
    L_0001: ldc.i4.s 10
    L_0003: stloc.0 
    L_0004: ldarg.0 
    L_0005: call instance class [System.Collections]System.Collections.Generic.List`1<class Example.Member> Example.MyExample::GetMembers()
    L_000a: stloc.1 
    L_000b: ldloc.0 
    L_000c: stloc.2 
    L_000d: br.s L_000f
    L_000f: ldloc.2 
    L_0010: ret 
}
```

如果有裝 .NET Reflector，可以看到編異後的 C# 程式碼：  

![C# - var 隱含型別(Implicitly Typed) vs 顯式型別(Explicitly Typed) - .NET Reflector](/images/x344.png)

> 兩個方法經過編譯後，根本一模一樣。  
> 因此，不管用隱含型別或顯式型別，效能根本不會改變。  

## 程式碼重構

承上述例子，如果 **GetMembers()** 回傳型別從 `List<Member>` 改為 `IEnumerable<Member>`，所有使用到 **GetMembers()** 的地方都要跟著修改。  
在同專案還好，若是跨專案，又剛好是基底元件時，真的是很令人崩潰...

> 這點是我強烈推薦使用 `var` 的原因，曾經大幅度重構前人留下的產物，被顯式型別搞的層層卡關，此後區域變數一律用 `var`！  

## 結論

1. 大部分在比較隱含型別及顯式型別時，都圍繞在程式碼可讀性。  
如我上述所說見仁見智，每個人觀點不同、習慣不同，所以我對兩方立場都不做評論。  
2. 效能部分就不用擔心了，經編譯後都是一樣的。  
3. 曾被程式碼重構深踩痛處，這點足以讓我傾心推廣 `var`。  
畢竟難保永遠不需要重構。

## 參考

[Implicit vs Explicit - Modern C# Standards and Conventions](https://goo.gl/HyEEeW)  
[var (C# 參考)](https://docs.microsoft.com/zh-tw/dotnet/csharp/language-reference/keywords/var)  
[隱含類型區域變數 (C# 程式設計手冊)](https://docs.microsoft.com/zh-tw/dotnet/csharp/programming-guide/classes-and-structs/implicitly-typed-local-variables)  