---
name: blog-johnwu-posts
description: 撰寫或修改本 repo `source/_posts` 的 Hexo 文章，沿用 John Wu 的既有寫作風格（繁中技術教學口吻、YAML front matter、`<!-- more -->`、主圖與常見章節如 參考/執行結果）。用於起草、更新或統一文章格式。
---

# John Wu Blog Post Skill

## Goal
- 產出與既有文章一致的格式與語氣。
- 內容偏實作教學，必要時包含程式碼與截圖。

## Workflow
1. 釐清主題與目標讀者，對照既有文章選定分類/標籤。
2. 建立 front matter（必填欄位與主圖路徑）。
3. 寫 1–3 段導言，接著插入 `<!-- more -->`。
4. 以步驟化段落完成內容，加入程式碼、執行結果與參考連結。
5. 自檢格式（主圖、章節、code fence）。

## Front Matter
- 只使用必要欄位，除非有充分理由：
  - `title`
  - `author`（固定 `John Wu`）
  - `tags`（YAML list）
  - `categories`（YAML list）
  - `date`（建議 `YYYY-MM-DD HH:mm:ss`）
  - `featured_image`（`/images/` 下的路徑）
- 偶爾會看到的欄位：`updated`、`update_date`、`toc`。

Template:
```yaml
---
title: <標題>
author: John Wu
tags:
  - <Tag1>
  - <Tag2>
categories:
  - <Category>
date: <YYYY-MM-DD HH:mm:ss>
featured_image: /images/b/<編號>.png
---
```

## Body Structure
- 開頭放主圖（與 `featured_image` 一致）。
- 導言 1–3 段，說明問題與解法。
- 導言結束立刻插入 `<!-- more -->`。
- 主章節用 `##`；需要步驟時可編號；子步驟用 `###`。
- 常見收尾章節（視需要加）：
  - `## 執行結果`
  - `## 程式碼下載`
  - `## 參考` (list links)
  - `## 結論`

## Headings and TOC
側欄 TOC（`themes/material-flow/layout/_widget/toc.ejs`）會列出所有層級的標題，`###` 也會進目錄。標題太多或太長，目錄就會變雜亂。

- 每個標題 4–10 字為原則。不要用「：」「——」或問句接副標：想寫「A：B」時標題只留 A，B 寫進內文。
- 每篇目錄以 15–20 條為上限參考。讀者不會想從目錄直接跳過去的小節，改用單獨一行的 `**粗體**`（前後空一行）代替 `###`。
- 粗體小標不要接在保留的 `###` 後面，否則會被讀成那個 `###` 的一部分；總結整組步驟的段落仍用 `###`。
- 同一篇各個 `##` 的子結構要一致，不要前幾節全改粗體、後幾節保留 `###`。核心概念（例如分級表）要留在目錄。作者偏好結構一致，勝過條目最少。
- 系列文的共用章節名稱要一致，例如 `## 簡報下載`、`## Live Demo`、`## 三個 Takeaway`、`## 參考`。

## Content Style
- 使用繁體中文（台灣），技術名詞可保留英文。
- 段落簡短，重點放在可操作的步驟與結論。
- 用粗體強調，提醒用 blockquote。
- 站內文章用 `/article/<slug>.html` 連結。

## Code Blocks
- 使用 fenced code block，語言標記盡量補上（常見：`cs`、`sh`、`bash`、`json`、`yml`、`html`、`ts`、`groovy`）。
- 如有檔名，先用一行文字標示（例如 `Startup.cs`、`appsettings.json`）。
- 範例精簡且可執行，重點在下方補充說明。

## Images
- 新文章的主圖（封面）放 `/images/b/`，比例 40:21（例：800 x 420 px）；截圖使用 `/images/a/`。
- Alt text 以標題或截圖描述為主。
- UI/工具教學需補 `執行結果` 截圖。

## Categories and Tags (Common)
- 選分類與標籤前，先現查既有用法與篇數（`tags` 同理，把 `categories:` 換成 `tags:`）：

```bash
awk '$0=="categories:"{f=1;next} f&&/^  - /{print substr($0,5);next} {f=0}' source/_posts/*.md | sed -E "s/[[:space:]]+$//; s/^['\"](.*)['\"]$/\1/" | sort | uniq -c | sort -rn
```
- 鐵人賽系列需加 `iT 邦幫忙 2018 鐵人賽`，檔名格式 `ironman-dayXX-...`。

## Length Guidance
- 內容長度以中篇教學為主，除非主題需要完整拆解。

## Quality Checklist
- front matter 欄位齊全，YAML list 正確。
- 主圖存在且與 `featured_image` 一致。
- `<!-- more -->` 在導言之後。
- 標題層級與 code fence 完整閉合。
- 外部資訊有附參考連結。
