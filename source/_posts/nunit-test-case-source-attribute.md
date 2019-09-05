---
title: NUnit - 測試案例 TestCaseSourceAttribute
author: John Wu
tags:
  - 'C#'
  - NUnit
  - Unit Test
categories:
  - Unit Test
date: 2017-07-25 13:58:00
featured_image: /images/featured/nunit.png
---
![NUnit - 測試案例 TestCaseSourceAttribute](/images/featured/nunit.png)

前篇介紹[NUnit - 測試案例 TestCaseAttribute](nunit-test-case-attribute.html)，簡化測試案例程式碼。  
本篇將延伸介紹 NUnit 透過 TestCaseSourceAttribute 帶入較複雜的參數。  

<!-- more -->

## TestCaseAttribute

假設測試案例的參數，需要帶入動態產生的物件，如下：
```cs
[TestCase(new object[] {"Success", "johnwu", "pass.123", new Member { IsActive = true } }, TestName = "Login_Success")]
public void Login(string expectedMessage, string loginName, string password, Member member)
{
    // ...
}
```
上述的程式碼在編譯時期就會有問題 ，因為 `new Member { IsActive = true } }` 不是 Attribute 的合法型別。  

> Attribute 的參數類型只能使用以下型別：
* 基本型別 (bool, byte, char, double, float, int, long, short)
* string 
* object 
* System.Type  
* enum  
* 以上型別的單維陣列

如果要傳入其它型別物件的話，就不能使用 TestCaseAttribute。要改用 TestCaseSourceAttribute。

## TestCaseSourceAttribute

### 1. Object Array

先宣告一個靜態的 Object Array，把測試案例的參數如同 TestCaseAttribute 的用法帶入。如下：
```cs
private static object[] LoginTestCases
{
    get
    {
        var cases = new List<object>();
        cases.Add(new object[] { "Success", "johnwu", "pass.123", new Member { IsActive = true } });
        cases.Add(new object[] { "LoginNameOrPasswordIncorrect", "johnwu", "pass.123", null });
        cases.Add(new object[] { "Inactive", "johnwu", "pass.123", new Member() });
        cases.Add(new object[] { "LoginNameOrPasswordIncorrect", "john", "pass.123", new Member() });
        cases.Add(new object[] { "LoginNameOrPasswordIncorrect", "johnwu", "pass", new Member() });
        cases.Add(new object[] { "LoginNameOrPasswordIncorrect", "01234567890123456789a", "pass.123", new Member() });
        cases.Add(new object[] { "LoginNameOrPasswordIncorrect", "johnwu", "01234567890123456789a", new Member() });
        return cases.ToArray();
    }
}
```

在測試案例的方法加上 TestCaseSourceAttribute，把測試案例的名稱帶入。如下：
```cs
//[TestCaseSource("LoginTestCases")]
[TestCaseSource(nameof(LoginTestCases))]
public void Login(string expectedMessage, string loginName, string password, Member member)
{
    // ...
}
```
透過 TestCaseSourceAttribute 帶入靜態的屬性或欄位，就可以動態把物件產生出來，傳入自訂型別的物件。  


### 2. TestCaseData

測試案例用 Object Array 的方式傳入 TestCaseSourceAttribute，會遇到一個問題，就是測試結果不易閱讀。  
TestCaseAttribute 可以帶入 TestName，測試結果可以清楚看到每一個測試案例的名稱，比要容易理解測試用途。如下：
![NUnit - 測試案例 TestCaseAttribute - 測試結果](/images/a/244.png)

用 TestCaseSourceAttribute 的話，從測試結果只能看到測試方法名稱及參數內容，當測試案例複雜的時候，很難一下子從參數內容反推測試案例的主要用途。如下：
![NUnit - 測試案例 TestCaseSourceAttribute - 測試結果](/images/a/245.png)

比較好的方式是回傳 TestCaseData 集合，為了方便管理測試案例，我會把測試案例用類別包裝，集中放到自訂的 TestCases 目錄。  
TestCases\LoginTestCases.cs
```cs
internal class LoginTestCases
{
    public static IEnumerable<TestCaseData> TestCases
    {
        get
        {
            yield return new TestCaseData("johnwu", "pass.123", new Member { IsActive = true })
                .Returns("Success")
                .SetName("Login_Success");

            yield return new TestCaseData("johnwu", "pass.123", null)
                .Returns("LoginNameOrPasswordIncorrect")
                .SetName("Login_Member_Not_Found");

            yield return new TestCaseData("johnwu", "pass.123", new Member { IsActive = false })
                .Returns("Inactive")
                .SetName("Login_Member_Is_Inactive");

            yield return new TestCaseData("john", "pass.123", new Member())
                .Returns("LoginNameOrPasswordIncorrect")
                .SetName("Login_LoginName_Too_Short");

            yield return new TestCaseData("johnwu", "pass", new Member())
                .Returns("LoginNameOrPasswordIncorrect")
                .SetName("Login_Password_Too_Short");

            yield return new TestCaseData("01234567890123456789a", "pass.123", new Member())
                .Returns("LoginNameOrPasswordIncorrect")
                .SetName("Login_LoginName_Too_Long");

            yield return new TestCaseData("johnwu", "01234567890123456789a", new Member())
                .Returns("LoginNameOrPasswordIncorrect")
                .SetName("Login_Password_Too_Long");
        }
    }
}
```

在測試案例的方法加上 TestCaseSourceAttribute，把測試案例的類別來源及名稱帶入。如下：
```cs
[TestCaseSource(typeof(LoginTestCases), nameof(LoginTestCases.TestCases))]
public string Login(string loginName, string password, Member member)
{
    // ...
    return actual;
}
```

再次查看執行結果，就可以看到測試案例名稱囉！
![NUnit - 測試案例 TestCaseSourceAttribute - 測試結果](/images/a/246.png)