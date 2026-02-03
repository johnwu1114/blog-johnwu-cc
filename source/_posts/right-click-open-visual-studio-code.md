---
title: Visual Studio Code - 右鍵開啟檔案或資料夾
author: John Wu
tags:
  - Visual Studio
  - VS Code
  - Windows
categories:
  - VS Code
date: 2017-07-20 23:12:30
featured_image: /images/featured/vs-code.png
---
![Visual Studio Code - 右鍵開啟檔案或資料夾](/images/featured/vs-code.png)

有些檔案預設不是用 Visual Studio Code 開啟，但又想用 VS Code 編輯時，要先開啟 VS Code 再拖拉要編輯的檔案至 VS Code 裡面，操作起來步驟有點繁瑣。  
比較方便的方法是在右鍵選單中加入開啟 VS Code 的選項。  

<!-- more -->

## 安裝時啟用

在安裝 Visual Studio Code 的時候，其中有兩個選項是問，要不要把開啟 VS Code 加入到右鍵選單中，如下圖：
![Visual Studio Code - 右鍵開啟檔案或資料夾 - 安裝時啟用](/images/a/238.png)

如果你跟我一樣不小心忽略了這個選項就直接安裝的話，也不用急著重裝，可以透過其它方式把 VS Code 加入選單中。

## Windows 註冊檔

隨意建立一個 `*.txt` 的檔案，把以下內容貼入到 `*txt`。
```powershell
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\Open with VS Code]
@="Edit with VS Code"
"Icon"="C:\\Program Files\\Microsoft VS Code\\Code.exe,0"

[HKEY_CLASSES_ROOT\*\shell\Open with VS Code\command]
@="\"C:\\Program Files\\Microsoft VS Code\\Code.exe\" \"%1\""

[HKEY_CLASSES_ROOT\Directory\shell\vscode]
@="Open Folder as VS Code Project"
"Icon"="\"C:\\Program Files\\Microsoft VS Code\\Code.exe\",0"

[HKEY_CLASSES_ROOT\Directory\shell\vscode\command]
@="\"C:\\Program Files\\Microsoft VS Code\\Code.exe\" \"%1\""

[HKEY_CLASSES_ROOT\Directory\Background\shell\vscode]
@="Open Folder as VS Code Project"
"Icon"="\"C:\\Program Files\\Microsoft VS Code\\Code.exe\",0"

[HKEY_CLASSES_ROOT\Directory\Background\shell\vscode\command]
@="\"C:\\Program Files\\Microsoft VS Code\\Code.exe\" \"%V\""
```
> 如果你是安裝 32 位元的 VS Code，請把路徑改為 `C:\\Program Files (x86)\\`

接著把 `*.txt` 名稱改為 `VSCodeRightClick.reg`，如下：
![Visual Studio Code - 右鍵開啟檔案或資料夾 - VSCodeRightClick.reg](/images/a/238.gif)

滑鼠左鍵雙擊 `VSCodeRightClick.reg` 然後同意註冊，完成後就可以在右鍵選單中看到 VS Code 了。

![Visual Studio Code - 右鍵開啟檔案或資料夾](/images/a/239.png)

## 參考

http://thisdavej.com/right-click-on-windows-folder-and-open-with-visual-studio-code/