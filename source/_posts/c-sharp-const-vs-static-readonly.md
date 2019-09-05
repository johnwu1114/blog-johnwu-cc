---
title: C# - const vs static readonly
author: John Wu
tags:
  - 'C#'
categories:
  - 'C#'
date: 2017-09-21 00:26:00
featured_image: /images/a/346.png
---
![C# - const vs static readonly - .NET Reflector](/images/a/346.png)

偶而遇到有人問 `const` 跟 `static readonly` 有什麼差別，如果是使用基本型別或字串，可能會感覺差不多。  
大部分的人都會回答是賦予值的階段不同，`const` 是編譯時賦予值，`static readonly` 是執行時賦予值。  
本篇將介紹 `const` 跟 `static readonly` 的差異。  

<!-- more -->

## 基本介紹

### const 

```cs
public const string ConstString = "ConstString - 1";
```

`const` 的特色：  
1. 只能在宣告時給值  
2. 無法修改內容  
3. 只能是基本型別或字串  

### readonly

```cs
public static readonly string ReadonlyString = "ReadonlyString - 1";
```

`readonly` 的特色：  
1. 只能在宣告時或建構子給值  
2. 建構子執行完畢後，無法再修改內容  
3. 跟一般變數一樣可以是任意型別  

> 宣告 `static readonly` 只能在**靜態建構子**修改內容

## 執行比較

我建了兩個範例專案，結構如下：  
![C# - const vs static readonly - 範例專案結構](/images/a/345.png)

Example 是給 ExampleApp 參考使用，在 Example 新增一個 Sample.cs：
```cs
namespace Example
{
    public class Sample
    {
        public const string ConstString = "ConstString - 1";
        public static readonly string ReadonlyString = "ReadonlyString - 1";
    }
}
```

在 ExampleApp 中輸出這個常數：
```cs
using System;
using Example;

namespace ExampleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine($"{nameof(Sample.ConstString)} = {Sample.ConstString}");
            Console.WriteLine($"{nameof(Sample.ReadonlyString)} = {Sample.ReadonlyString}");
            Console.Read();
        }
    }
}
```

Output 結果：
```
ConstString = ConstString - 1
ReadonlyString = ReadonlyString - 1
```

輸出就如程式邏輯一樣，看似 `const` 跟 `static readonly` 有什麼差別。  
但實際上編譯出來的內容卻差很多，`ExampleApp.Program.Main` 經過編譯後產生的 IL 如下：
```cs
.method private hidebysig static void Main(string[] args) cil managed
{
    .entrypoint
    .maxstack 8
    L_0000: nop 
    L_0001: ldstr "{0} = {1}"
    L_0006: ldstr "ConstString"
    L_000b: ldstr "ConstString - 1"
    L_0010: call string [System.Runtime]System.String::Format(string, object, object)
    L_0015: call void [System.Console]System.Console::WriteLine(string)
    L_001a: nop 
    L_001b: ldstr "{0} = {1}"
    L_0020: ldstr "ReadonlyString"
    L_0025: ldsfld string [Example]Example.Sample::ReadonlyString
    L_002a: call string [System.Runtime]System.String::Format(string, object, object)
    L_002f: call void [System.Console]System.Console::WriteLine(string)
    L_0034: nop 
    L_0035: call int32 [System.Console]System.Console::Read()
    L_003a: pop 
    L_003b: ret 
}
```

如果有裝 .NET Reflector，可以看到編異後的 C# 程式碼：  

![C# - const vs static readonly - .NET Reflector](/images/a/346.png)

> `Sample.ConstString` 被轉換成 `"ConstString - 1"`。  

乍看之下似乎覺得很合理，你可能心裡會想：  
> 就**編譯時賦予值**啊！有什麼好說的！  

但卻落入一個陷阱，假設更新 Example.dll 而不異動 ExampleApp.exe 的情況，會發生什麼事？  

![C# - const vs static readonly - 更新 Example.dll](/images/a/347.png)

例如把 Example 的 Sample.cs 修改成下面內容：
```cs
namespace Example
{
    public class Sample
    {
        public const string ConstString = "ConstString - 2";
        public static readonly string ReadonlyString = "ReadonlyString - 2";
    }
}
```

程式依然能正常執行，但 Output 結果會是如下：
```
ConstString = ConstString - 1
ReadonlyString = ReadonlyString - 2
```

你可能會有點意外，但實際上就真的是**編譯時賦予值**啊！  

ExampleApp 在第一次被編譯時，就已經把所有用到 `const` 的內容帶入其中，沒有重新編譯的情況下，`const` 的內容都不會改變。
而 `static readonly` 每次程式啟動都會去 Example 取得內容，所以 ExampleApp 就算沒有重新編譯，還是可以拿到 Example 更新後的值。


## 結論

`static readonly` 是比較建議的常數使用方法，可以比較彈性使用。  
`const` 建議的使用時機大概有兩種情況：  
1. 內容必須要在**編譯時期**決定時。  
2. 非常非常非常需要程式啟動效能時。  

## 參考

[const (C# 參考)](https://docs.microsoft.com/zh-tw/dotnet/csharp/language-reference/keywords/const)  
[readonly (C# 參考)](https://docs.microsoft.com/zh-tw/dotnet/csharp/language-reference/keywords/readonly)  