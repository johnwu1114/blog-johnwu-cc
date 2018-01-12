---
title: C# 編碼規範指南 (Coding Standard Guide)
author: John Wu
tags:
  - 'C#'
categories:
  - 'C#'
date: 
featured_image: /images/.png
---
![ASP.NET Core 教學 - Routing - 運作方式](/images/pasted-115.png)


<!-- more -->

## 1.	NAMING CONVENTIONS

* 命名方式只能用 `camelCase` 或 `PascalCase`。  
* 避免使用全大寫或全小寫的wording，除了單一個word可以全小寫。  
* 透過命名就能淺而易見，如果一個命名，還需要註解來解釋它，就代表他還不夠清楚表示意思。e.g.:  

```cs
// Bad!
int d; // elapsed time in days 

// Good!
int elapsedTimeInDays;
int daysSinceCreation;
```

*	Longer names 比 Shorter names 好，至少搜尋容易定位。  
* 單一字母的命名，最多只允許在很短的迴圈或 method 中使用。  
*	不要使用特殊或多重意義的縮寫。  
*	避免使用具有特殊意義的關鍵字命名。  
*	代表同樣意思、同一件事、同一個東西時，命名應該一致。  
*	避免用不同字眼代表同一件事，例如info與data。  
*	避免兩個命名太長且太相像。e.g.:  
 * XYZControllerForEfficientHandlingOfStrings  
 * XYZControllerForEfficientStorageOfStrings  
* 使用可以發音的字詞，可以幫助溝通。e.g.:

```cs
// Bad!
class DtaRcrd102
{
    private DateTime genymdhms;
    private const string pszqint = "102";
}

// Good!
class Customer
{
    private DateTime generationTimestamp;
    private const string recordId = "102";
}
```

* `PascalCase` / `camelCase` 使用時機如下表:
 * `P` = PascalCase
 * `c` = camelCase
 * `_c` = camelCase 前綴 `_`

| Identifier      | Public    | Protected/<br />Internal    | Private   | Notes                         |  
| :------         | :------:  | :------:              | :------:  | :------                       |
| Project File<br />專案檔(*.csproj)  | P         |                       |           | 名稱同 Assembly & Namespace。   |
| Source File<br />程式碼檔(*.cs)   | P         |                       |           | 名稱同 class。   |
| Class or Struct<br />類別/結構  | P         | P  | P  | 如使用設計模式或遵從父類架構，則**後綴**帶上父類名稱。<br />e.g.: *User**Controller**.cs*   |
| Interface<br />介面   | P         | P  | P  | 前綴 **I**。e.g.:* **I**Repository.cs*   |
| Method<br />方法   | P         | P  | P  | 使用動詞。 |
| Property<br />屬性   | P         | P  | P  | 不需要前綴 Get/Set。 |
| Field<br />欄位    | P         | P  | _c  | 建議只用在 Private 空間。   |
| Constant<br />常數    | P         | P  | _c  |    |
| Static Field<br />靜態欄位   | P         | P  | _c  | 建議只用在 Private 空間。  |
| Enum<br />列舉   | P         | P  | P  | 不需要前綴 Enum。 |
| Delegate<br />委派   | P         | P  | P  |  |
| Event<br />事件   | P         | P  | P  |  |
| Local Variable<br />區域變數   |          |   | c  | 避免單一字母 |
| Parameter<br />參數   |          |   | c  |   | |

## 2. CODING STYLE

* `{ }` 大括號的 `{` 與 `}` 各自獨立新的一行，判斷式都一定要加上 `{ }`。
* **變數**：宣告變數時，每個變數都獨立一行。
* **順序**：
```cs
public Sample : ISample {
  // Constant Fields
  private int _constantField = 1;

  // Fields
  private int _field = 1;

  // Constructors
  public Sample() { 

  }

  // Destructors
  ~Sample() { 

  }
}
```

## 參考

* [Lance's C# Coding Standards v1.1.5](https://aspblogs.blob.core.windows.net/media/lhunt/Publications/CSharp%20Coding%20Standards.pdf)  
* [[C#]Code Convention Sample](https://dotblogs.com.tw/hatelove/archive/2011/12/21/csharp-code-convention.aspx)
* [[如何提升系統品質-Day16]Code Convention](https://ithelp.ithome.com.tw/articles/10079251)
