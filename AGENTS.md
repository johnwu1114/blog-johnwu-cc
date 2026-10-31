# AGENTS.md

Hexo 7 部落格（版本見 `package.json`），文章以繁體中文撰寫，網址 `https://blog.johnwu.cc`。主題在 `themes/material-flow/`（EJS 模板＋LESS 樣式＋JS）。GitHub Pages 讀 `master` 的 `/docs` 上線。

## 不要手改的檔案

| 檔案 | 原因 | 要改內容時 |
| --- | --- | --- |
| `docs/` | `public_dir` 產出目錄，`npm run deploy` 會先用 `hexo clean` 整個刪掉再重產；目錄名稱不可變更 | 改 `source/` 或 `themes/`，再照〈發佈〉重產 |
| `themes/material-flow/source/js/bundle.js` | Webpack 3 從 `main.js` 打包的產物，自動注入 jQuery、Waves、ScrollReveal | 改 `themes/material-flow/source/js/main.js`，再跑 `npm start` 或 `npm run watch` |
| `_multiconfig.yml` | hexo 以 `--config` 合併多檔時自動重寫，有進版控 | 不改；改 `_config*.yml`，再用〈驗證文章能產生〉最後一行重寫。不要用 `git checkout` 還原，會丟掉還沒 commit 的設定變更 |

## 寫或改文章

文章在 `source/_posts/`，草稿在 `source/_drafts/`，都是 Markdown＋YAML front matter。

1. 先讀 `skills/README.md`（格式）與 `skills/tone.md`（語氣）。
2. 導言後必須插入 `<!-- more -->` 作為摘要斷點。
3. 檔名就是網址：permalink 為 `article/:title.html`，站內連結寫 `/article/<檔名>.html`。
4. 封面圖（`featured_image`）比例統一為 **40:21**（例：800 x 420 px），新文章放 `source/images/b/`；截圖放 `source/images/a/`。
5. 每篇文章可有同名資源資料夾（已啟用 `post_asset_folder`）。
6. `default_layout` 是 `draft`：`hexo new` 會把新文章建在 `source/_drafts/`，要發佈的文章放 `source/_posts/`。

## 驗證文章能產生

產到暫存目錄，不動 `docs/`。沒有 `node_modules` 時先照〈指令〉安裝。

```bash
V="${TMPDIR:-/tmp}/blog-verify"; printf 'public_dir: %s\n' "$V" > "$V.yml"
npx hexo generate --config "_config.yml,_config.links.yml,_config.release.yml,$V.yml"
ls "$V/article/<檔名>.html"
npx hexo list page --config _config.yml,_config.links.yml,_config.release.yml > /dev/null   # 以正式設定重寫 _multiconfig.yml
```

## 指令

| 情境 | 指令 | 載入的設定 |
| --- | --- | --- |
| 安裝 | `npm install -g hexo-cli && npm install` | — |
| 本機預覽（含草稿） | `npm start` | `_config.yml`、`_config.links.yml`、`_config.local.yml` |
| 正式設定預覽（含壓縮） | `npm run preview` | `_config.yml`、`_config.links.yml`、`_config.release.yml` |
| 監聽 JS 變更（搭配 hexo server） | `npm run watch` | — |
| 重產 `docs/`（壓縮＋清除＋產生） | `npm run deploy` | 同正式設定 |

設定檔用途：`_config.yml` 主設定（站台資訊、permalink、外掛）；`_config.links.yml` 獎項認證與友站連結；`_config.release.yml` 啟用壓縮、GA、Facebook SDK；`_config.local.yml` 只有 `render_drafts: true`。

## 發佈

步驟照 `README.md`〈部署〉。`_config.yml` 沒有設定 deployer，`npm run deploy` 只在本機刪掉並重產 `docs/`，不會推送；上線要把 `docs/` commit（慣例訊息 `chore: deploy`）再 push 到 `master`。
