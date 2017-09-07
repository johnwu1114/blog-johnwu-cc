---
title: NUnit - 測試案例 TestCaseAttribute
author: John Wu
tags:
  - 'C#'
  - NUnit
  - Unit Test
categories:
  - Unit Test
date: 2017-07-25 13:08:00
featured_image: /images/logo-nunit.png
---
![NUnit - 測試案例 TestCaseAttribute](/images/logo-nunit.png)

本篇將介紹 NUnit 的 TestCaseAttribute，簡化測試案例的程式碼。

<!-- more -->

## TestAttribute

在寫 NUnit 單一測試案例的時候，通常都是用 TestAttribute，如下：
```cs
[TestFixture]
public class MemberBLLTests
{
    // ...

    [Test]
    public void ChangePassword_Success()
    {
        // ...
    }
}
```

延伸上述程式碼，如果要對 ChangePassword 這個動做增加不同的測試案例，用 TestAttribute 的方式就要建立多個 Test Method。如下：
```cs
// ...

[Test]
public void ChangePassword_Same_Password()
{
    // Arrange
    var expected = false;
    var loginName = "johnwu";
    var oldPassword = "pass.123";
    var newPassword = "pass.123";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}

[Test]
public void ChangePassword_Old_Password_Too_Short()
{
    // Arrange
    var expected = false;
    var loginName = "johnwu";
    var oldPassword = "pass";
    var newPassword = "pass.123";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}

[Test]
public void ChangePassword_Old_Password_Too_Long()
{
    // Arrange
    var expected = false;
    var loginName = "johnwu";
    var oldPassword = "01234567890123456789a";
    var newPassword = "pass.123";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}

[Test]
public void ChangePassword_New_Password_Too_Short()
{
    // Arrange
    var expected = false;
    var loginName = "johnwu";
    var oldPassword = "pass.123";
    var newPassword = "pass";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}

[Test]
public void ChangePassword_New_Password_Too_Long()
{
    // Arrange
    var expected = false;
    var loginName = "johnwu";
    var oldPassword = "pass.123";
    var newPassword = "01234567890123456789a";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}

[Test]
public void ChangePassword_LoginName_Too_Short()
{
    // Arrange
    var expected = false;
    var loginName = "john";
    var oldPassword = "pass.123";
    var newPassword = "pass.1234";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}

[Test]
public void ChangePassword_LoginName_Too_Long()
{
    // Arrange
    var expected = false;
    var loginName = "01234567890123456789a";
    var oldPassword = "pass.123";
    var newPassword = "pass.1234";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}

[Test]
public void ChangePassword_LoginName_Incorrect_Format()
{
    // Arrange
    var expected = false;
    var loginName = "john.wu";
    var oldPassword = "pass.123";
    var newPassword = "pass.1234";

    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    Assert.AreEqual(expected, actual);
}
```
> 看起來非常的累贅，每個測試方法除了 Method Name 不一樣之外，就只有 Arrange 不同。

## TestCaseAttribute

NUnit 可以透過 TestCaseAttribute 把測試的參數傳入到測試方法，在 TestCaseAttribute 帶入 object 型態的陣列，該陣列的內容會依照索引傳入到測試方法，如下：
![NUnit - 測試案例 TestCaseAttribute](/images/pasted-244.gif)

## 範例程式碼

```cs
[TestCase(new object[] { "johnwu", "pass.123", "pass.1234" }, 
    ExpectedResult = true, TestName = "ChangePassword_Success")]
[TestCase(new object[] { "johnwu", "pass.123", "pass.123" }, 
    ExpectedResult = false, TestName = "ChangePassword_Same_Password")]
[TestCase(new object[] { "johnwu", "pass", "pass.123" }, 
    ExpectedResult = false, TestName = "ChangePassword_Old_Password_Too_Short")]
[TestCase(new object[] { "johnwu", "01234567890123456789a", "pass.123" }, 
    ExpectedResult = false, TestName = "ChangePassword_Old_Password_Too_Long")]
[TestCase(new object[] { "johnwu", "pass.123", "pass" }, 
    ExpectedResult = false, TestName = "ChangePassword_New_Password_Too_Short")]
[TestCase(new object[] { "johnwu", "pass.123", "01234567890123456789a" }, 
    ExpectedResult = false, TestName = "ChangePassword_New_Password_Too_Long")]
[TestCase(new object[] { "john", "pass.123", "pass.1234" }, 
    ExpectedResult = false, TestName = "ChangePassword_LoginName_Too_Short")]
[TestCase(new object[] { "01234567890123456789a", "pass.123", "pass.1234" }, 
    ExpectedResult = false, TestName = "ChangePassword_LoginName_Too_Long")]
[TestCase(new object[] { "john.wu", "pass.123", "pass.1234" }, 
    ExpectedResult = false, TestName = "ChangePassword_LoginName_Incorrect_Format")]
public bool ChangePassword(string loginName, string oldPassword, string newPassword)
{
    // Act
    var actual = _memberBLL.ChangePassword(loginName, oldPassword, newPassword);

    // Assert
    return actual;
}
```

當有多個測試案例的時候，用 TestCaseAttribute 就會比 TestAttribute 還要簡潔很多。  
但 TestCaseAttribute 有個缺點，參數只能只使用基本型別，不能動態產生物件。  
如果測試案例的參數比較複雜，要改用 [TestCaseSourceAttribute](nunit-test-case-source-attribute.html)。  