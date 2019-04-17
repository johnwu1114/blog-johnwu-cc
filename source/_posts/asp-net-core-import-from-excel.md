---
title: ASP.NET Core 教學 - Open XML SDK 匯入 Excel
author: John Wu
tags:
  - ASP.NET Core
  - 'C#'
  - Excel
  - Open XML SDK
categories:
  - ASP.NET Core
date: 2019-04-17 21:54:00
featured_image: /images/x294.png
---
![ASP.NET Core 教學 - 匯出 Excel - 執行結果](/images/x294.png)

之前介紹過 ASP.NET Core 用 Open XML SDK 匯出 Excel 的功能，但沒介紹匯入 Excel。  
被網友提問後，馬上補了這篇介紹 ASP.NET Core 利用 Open XML SDK 匯入 Excel 的基本用法。  

<!-- more -->

## 安裝 NuGet 套件

Open XML SDK 這個套件支援 .NET 操作 Word、Excel、PowerPoint。  
打開 NuGet 找到 `DocumentFormat.OpenXml` 並安裝。  

## View

```html
<form method="post" enctype="multipart/form-data" action="/api/import">
    <input type="file" name="files" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
    <input type="submit" value="送出" />
</form>
```

## SpreadsheetDocument

要操作 Excel 檔案，主要是透過 `SpreadsheetDocument` 物件。  
`SpreadsheetDocument` 可以讀取檔案，也可以直接讀取 `Stream`。  
此範例是從 ASP.NET Core 的 Request 取得 `FileStream`，進而讀取 Excel 檔案：

```cs
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using MyWebsite.Filters;

namespace MyWebsite.Controllers
{
    [Route("api/[controller]")]
    public class ImportController : Controller
    {
        [HttpPost]
        [DisableFormValueModelBinding]
        public async Task<IActionResult> Post()
        {
            await Request.StreamFile(file =>
            {
                using (var document = SpreadsheetDocument.Open(file.FileStream, false))
                {
                    var workbookPart = document.WorkbookPart;
                    var sheet = workbookPart.Workbook.Sheets.GetFirstChild<Sheet>();
                    var worksheet = ((WorksheetPart)workbookPart.GetPartById(sheet.Id)).Worksheet;
                    var sheetData = worksheet.GetFirstChild<SheetData>();

                    foreach (var row in sheetData.ChildElements.Select(x=>x as Row))
                    {
                        // 取得每一行
                        foreach(var cell in row.ChildElements.Select(x => x as Cell))
                        {
                            // 取得每一欄
                            var innerText = cell.CellValue.Text;
                            // Do somethings
                        }
                    }
                }
                return file.FileStream;
            });
            return Ok();
        }
    }
}
```

> `DisableFormValueModelBinding` 及 `Request.StreamFile` 擴充方法請參考 [[鐵人賽 Day23] ASP.NET Core 2 系列 - 上傳/下載檔案
](/article/ironman-day23-asp-net-core-upload-download-files.html)

## 參考

[Open-XML-SDK](https://github.com/OfficeDev/Open-XML-SDK)  
[Read Excel Files Using Open XML SDK In ASP.NET C#](https://social.technet.microsoft.com/wiki/contents/articles/35010.read-excel-files-using-open-xml-sdk-in-asp-net-c.aspx)  
[How to create an Excel file in .NET using OpenXML – Part 1: Basics](https://goo.gl/TU7QMY)  
[歡迎使用 Open XML SDK 2.5 for Office](https://msdn.microsoft.com/zh-tw/library/office/bb448854.aspx)  