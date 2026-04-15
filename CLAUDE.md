# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

John Wu 的技術部落格，使用 Hexo 7.3.0 靜態網站產生器，主題為 `material-flow`（Material Design 風格）。網站語言為繁體中文，內容以 ASP.NET Core、Angular、Jenkins、Docker、Kubernetes 等技術教學為主。

網站網址：`https://blog.johnwu.cc`

## 常用指令

```bash
# 安裝
npm install -g hexo-cli && npm install

# 本機開發（含草稿預覽）
npm start
# 等同：webpack -d && hexo server --config _config.yml,_config.links.yml,_config.local.yml

# 正式環境預覽（含壓縮）
npm run preview

# 監聽 JS 變更（搭配 hexo server 使用）
npm run watch

# 部署（壓縮 + 清除 + 產生 + 部署）
npm run deploy
```

## 設定檔結構

多設定檔合併機制，依環境載入不同組合：

- `_config.yml` — 主設定（站台資訊、permalink、外掛設定）
- `_config.links.yml` — 獎項認證與友站連結
- `_config.release.yml` — 正式環境（啟用壓縮、GA、Facebook SDK）
- `_config.local.yml` — 本機開發（`render_drafts: true`）

## 架構

- `source/_posts/` — 已發布文章（Markdown + YAML front matter）
- `source/_drafts/` — 草稿
- `source/images/` — 圖片資源（主圖在 `featured/`，截圖在 `a/`）
- `themes/material-flow/` — 主題（EJS 模板 + LESS 樣式 + JS）
- `docs/` — 產出目錄（`public_dir`），供 GitHub Pages 使用
- `skills/` — Claude Code 寫作技能定義（語氣與格式規範）

### 前端建置

Webpack 3 負責打包主題 JS：
- 進入點：`themes/material-flow/source/js/main.js`
- 輸出：`themes/material-flow/source/js/bundle.js`
- 自動注入 jQuery、Waves、ScrollReveal

## 文章格式重點

- Permalink 格式：`article/:title.html`
- 預設 layout 為 `draft`（新文章建在 `_drafts/`）
- 啟用 `post_asset_folder`，每篇文章可有對應資源資料夾
- 導言後必須插入 `<!-- more -->` 作為摘要斷點
- 寫作風格與格式規範詳見 `skills/README.md` 和 `skills/tone.md`
