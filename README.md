# John Wu's Blog

[blog.johnwu.cc](https://blog.johnwu.cc) 的原始碼。使用 Hexo 7 與主題 `material-flow`（Material Design 風格），內容以 ASP.NET Core、Angular、Jenkins、Docker、Kubernetes 等技術教學為主，近期也有 AI Agent 主題。

## 安裝

```bash
npm install -g hexo-cli && npm install
```

## 寫文章

1. 在 `source/_posts/` 新增 `<檔名>.md`，檔名就是網址：`https://blog.johnwu.cc/article/<檔名>.html`。
2. 封面圖比例 40:21（例：800 x 420 px），放 `source/images/b/`；截圖放 `source/images/a/`。
3. 格式與語氣照 `skills/README.md`、`skills/tone.md`。
4. `npm start` 本機預覽（含草稿），預設網址 <http://localhost:4000>。

## 部署

網站由 GitHub Pages 讀 `master` 的 `/docs` 提供。`npm run deploy` 只會在本機重產 `docs/`，**不會推送**，要自己 commit 再 push：

```bash
npm run deploy                     # 壓縮 JS、刪掉並重產 docs/
git add docs
git commit -m "chore: deploy"
git push origin master
```

push 後等 GitHub Pages 建置完成，再開網站確認。建置狀態可以這樣查，回 `built` 就是完成：

```bash
gh api repos/johnwu1114/blog-johnwu-cc/pages --jq .status
```

## 其他指令

| 指令 | 用途 |
| --- | --- |
| `npm start` | 本機預覽，含草稿（`_config.local.yml`） |
| `npm run preview` | 用正式設定預覽，含壓縮（`_config.release.yml`） |
| `npm run watch` | 監聽主題 JS 變更，搭配 hexo server 使用 |

## 目錄

| 路徑 | 內容 |
| --- | --- |
| `source/_posts/` | 已發布文章 |
| `source/_drafts/` | 草稿 |
| `source/images/` | 圖片（封面 `b/`，截圖 `a/`） |
| `themes/material-flow/` | 主題（EJS 模板、LESS 樣式、JS） |
| `docs/` | 產出的靜態網站，GitHub Pages 的來源；目錄名稱不可變更 |
| `skills/` | 文章寫作規範 |
| `AGENTS.md` | 給 AI coding agent 的指引 |

設定檔：`_config.yml` 主設定、`_config.links.yml` 獎項認證與友站連結、`_config.release.yml` 正式環境（壓縮、GA、Facebook SDK）、`_config.local.yml` 本機開發（`render_drafts: true`）。
