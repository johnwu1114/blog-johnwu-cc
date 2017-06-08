title: .NET Core - AES 加解密
author: John Wu
tags:
  - .NET Core
  - 'C#'
  - AES
categories:
  - .NET Core
date: 2017-06-08 10:38:00
---
![AES Cryptography](/images/pasted-183.png)

在 .NET Core 的 System.Security.Cryptography 已經找不到 RijndaelManaged 了。  
取而代之的是 Aes.Create()，基本上是無痛升級，只是換幾個字而已。  

<!-- more -->

## .NET Framework

原本在 .NET Framework 要使用 AES 加解密的程式碼如下：

```cs
namespace Cryptography
{
    public static class EncryptUtil
    {
        public static string EncryptAES(string text, string key, string iv)
        {
            var sourceBytes = System.Text.Encoding.UTF8.GetBytes(text);
            var aes = new System.Security.Cryptography.RijndaelManaged();
            aes.Mode = System.Security.Cryptography.CipherMode.CBC;
            aes.Padding = System.Security.Cryptography.PaddingMode.PKCS7;
            aes.Key = System.Text.Encoding.UTF8.GetBytes(key);
            aes.IV = System.Text.Encoding.UTF8.GetBytes(iv);
            var transform = aes.CreateEncryptor();
            return System.Convert.ToBase64String(transform.TransformFinalBlock(sourceBytes, 0, sourceBytes.Length));
        }

        public static string DecryptAES(string text, string key, string iv)
        {
            var encryptBytes = System.Convert.FromBase64String(text);
            var aes = new System.Security.Cryptography.RijndaelManaged();
            aes.Mode = System.Security.Cryptography.CipherMode.CBC;
            aes.Padding = System.Security.Cryptography.PaddingMode.PKCS7;
            aes.Key = System.Text.Encoding.UTF8.GetBytes(key);
            aes.IV = System.Text.Encoding.UTF8.GetBytes(iv);
            var transform = aes.CreateDecryptor();
            return System.Text.Encoding.UTF8.GetString(transform.TransformFinalBlock(encryptBytes, 0, encryptBytes.Length));
        }
    }
}
```

## .NET Core

以下是 .NET Core 使用 AES 加解密的程式碼：

```cs
namespace Cryptography
{
    public static class EncryptUtil
    {
        public static string EncryptAES(string text, string key, string iv)
        {
            var sourceBytes = System.Text.Encoding.UTF8.GetBytes(text);
            var aes = System.Security.Cryptography.Aes.Create();
            aes.Mode = System.Security.Cryptography.CipherMode.CBC;
            aes.Padding = System.Security.Cryptography.PaddingMode.PKCS7;
            aes.Key = System.Text.Encoding.UTF8.GetBytes(key);
            aes.IV = System.Text.Encoding.UTF8.GetBytes(iv);
            var transform = aes.CreateEncryptor();
            return System.Convert.ToBase64String(transform.TransformFinalBlock(sourceBytes, 0, sourceBytes.Length));
        }
        
        public static string DecryptAES(string text, string key, string iv)
        {
            var encryptBytes = System.Convert.FromBase64String(text);
            var aes = System.Security.Cryptography.Aes.Create();
            aes.Mode = System.Security.Cryptography.CipherMode.CBC;
            aes.Padding = System.Security.Cryptography.PaddingMode.PKCS7;
            aes.Key = System.Text.Encoding.UTF8.GetBytes(key);
            aes.IV = System.Text.Encoding.UTF8.GetBytes(iv);
            var transform = aes.CreateDecryptor();
            return System.Text.Encoding.UTF8.GetString(transform.TransformFinalBlock(encryptBytes, 0, encryptBytes.Length));
        }
    }
}
```
> 從上圖可以看到，也就只有一行不一樣，基本上是無痛升級。

## 參考

https://stackoverflow.com/questions/38333722/how-to-use-rijndael-encryption-with-a-net-core-class-library-not-net-framewo