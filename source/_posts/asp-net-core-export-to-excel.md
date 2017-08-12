---
title: ASP.NET Core 教學 - Open XML SDK 匯出 Excel
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Excel
  - Open XML SDK
categories:
  - ASP.NET Core
date: 2017-08-12 12:54:00
---
![ASP.NET Core 教學 - 匯出 Excel - 執行結果](/images/x294.png)

製作後台網站常有報表匯出 Excel 的需求，ASP.NET Core 可以透過官方出的 Open XML SDK 來匯出 Excel。  
本篇將介紹 ASP.NET Core 利用 Open XML SDK 匯出 Excel 的基本用法。  

<!-- more -->

## 1. 安裝 NuGet 套件

Open XML SDK 這個套件支援 .NET 操作 Word、Excel、PowerPoint。  
打開 NuGet 找到 `DocumentFormat.OpenXml` 並安裝。  

## 2. SpreadsheetDocument

要產生 Excel 檔案，主要是透過 `SpreadsheetDocument` 物件。  
`SpreadsheetDocument` 可以產生實體檔案，也可以直接建立在 `Stream` 之中。  
由於我是要在 ASP.NET Core 的 Request 回傳 Excel 串流讓用戶端下載，不想從檔案讀取 Template 產生額外的 I/O，所以範例會以 `MemoryStream` 為主。  

全空的 Excel 建立方式如下：
```cs
var memoryStream = new MemoryStream();
using (var document = SpreadsheetDocument.Create(memoryStream, SpreadsheetDocumentType.Workbook))
{
    var workbookPart = document.AddWorkbookPart();
    workbookPart.Workbook = new Workbook();

    var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
    worksheetPart.Worksheet = new Worksheet(new SheetData());

    var sheets = workbookPart.Workbook.AppendChild(new Sheets());
    sheets.Append(new Sheet() { Id = workbookPart.GetIdOfPart(worksheetPart), SheetId = 1, Name = "Sheet 1" });
}
```

類別描述：  

| 類別 | 說明 |
| ------ | ------ |
| Workbook | Excel 主要的文件組件的根元素。 |
| Worksheet | Excel 工作表的集合 |
| SheetData | 工作表中的資料 |
| Sheets | Sheet 的集合 |
| Sheet | 工作表與資料的關聯 |

概念上的對應大概如下圖：
![ASP.NET Core 教學 - 類別對應](/images/x294.gif)

如果要從 `MemoryStream` 測試匯出，可以使用 `FileStream` 存成檔案：
```cs
var memoryStream = new MemoryStream();
using (var document = SpreadsheetDocument.Create(memoryStream, SpreadsheetDocumentType.Workbook))
{
    // ...
    
    // 要從 MemoryStream 匯出，必須先儲存 Workbook，並關閉 SpreadsheetDocument 物件
    workbookPart.Workbook.Save();
    document.Close();

    using (var fileStream = new FileStream("test.xlsx", FileMode.Create))
    {
        memoryStream.WriteTo(fileStream);
    }
}
```

## 3. 插入資料

如上述類別描述，資料要放在 `SheetData`，把 `SheetData` 當作表個的方式插入資料：

```cs
// 從 Worksheet 取得要編輯的 SheetData
var sheetData = worksheetPart.Worksheet.GetFirstChild<SheetData>();

// 建立資料列物件
var row = new Row();
// 在資料列中插入欄位
row.Append(
    new Cell() { CellValue = new CellValue(1.ToString()), DataType = CellValues.Number },
    new Cell() { CellValue = new CellValue("John Wu Blog"), DataType = CellValues.String },
    new Cell() { CellValue = new CellValue("https://blog.johnwu.cc/"), DataType = CellValues.String }
);
// 插入資料列 
sheetData.AppendChild(row);

row = new Row();
// 也可以用單一欄位逐各插入
row.Append(new Cell() { CellValue = new CellValue(2.ToString()), DataType = CellValues.Number });
row.Append(new Cell() { CellValue = new CellValue("John Wu Blog"), DataType = CellValues.String });
row.Append(new Cell() { CellValue = new CellValue("https://blog.johnwu.cc/"), DataType = CellValues.String });
sheetData.AppendChild(row);
```
## 4. 範例

把 Open XML SDK 輸出的結果以 `FileStreamResult` 回傳，當用戶開啟這個連結，就會把處理完的檔案變成可下載的串流。  

ExcelController
```cs
using System.IO;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;

namespace MyWebsite.Controllers
{
    [Route("api/[controller]")]
    public class ExcelController : Controller
    {
        private static readonly string[][] _smapleData = new string[][]
        {
            new string[]{ "John Wu Blog","https://blog.johnwu.cc/" },
            new string[]{ "大內攻城粉絲團", "https://www.facebook.com/SoftwareENG.NET" }
        };

        [HttpGet]
        public FileStreamResult Get()
        {
            var memoryStream = new MemoryStream();

            using (var document = SpreadsheetDocument.Create(memoryStream, SpreadsheetDocumentType.Workbook))
            {
                var workbookPart = document.AddWorkbookPart();
                workbookPart.Workbook = new Workbook();

                var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
                worksheetPart.Worksheet = new Worksheet(new SheetData());

                var sheets = workbookPart.Workbook.AppendChild(new Sheets());

                sheets.Append(new Sheet() { Id = workbookPart.GetIdOfPart(worksheetPart), SheetId = 1, Name = "Sheet 1" });

                var sheetData = worksheetPart.Worksheet.GetFirstChild<SheetData>();

                var row = new Row();
                row.Append(
                    new Cell() { CellValue = new CellValue("No."), DataType = CellValues.String },
                    new Cell() { CellValue = new CellValue("Name"), DataType = CellValues.String },
                    new Cell() { CellValue = new CellValue("Links"), DataType = CellValues.String }
                );
                sheetData.AppendChild(row);

                for (var i = 0; i < _smapleData.Length; i++)
                {
                    var data = _smapleData[i];
                    row = new Row();
                    row.Append(
                        new Cell() { CellValue = new CellValue((i + 1).ToString()), DataType = CellValues.Number },
                        new Cell() { CellValue = new CellValue(data[0]), DataType = CellValues.String },
                        new Cell() { CellValue = new CellValue(data[1]), DataType = CellValues.String }
                    );
                    sheetData.AppendChild(row);
                }
            }

            memoryStream.Seek(0, SeekOrigin.Begin);
            return new FileStreamResult(memoryStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
    }
}
```

## 執行結果

![ASP.NET Core 教學 - 匯出 Excel - 執行結果](/images/x294.png)

## 參考

[Open-XML-SDK](https://github.com/OfficeDev/Open-XML-SDK)  
[Read Excel Files Using Open XML SDK In ASP.NET C#](https://social.technet.microsoft.com/wiki/contents/articles/35010.read-excel-files-using-open-xml-sdk-in-asp-net-c.aspx)  
[How to create an Excel file in .NET using OpenXML – Part 1: Basics](http://www.dispatchertimer.com/tutorial/how-to-create-an-excel-file-in-net-using-openxml-part-1-basics/)  
[歡迎使用 Open XML SDK 2.5 for Office](https://msdn.microsoft.com/zh-tw/library/office/bb448854.aspx)  