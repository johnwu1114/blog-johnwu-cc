---
title: AI Coding Agent 實戰工作坊 — 中階場 (Claude)
author: John Wu
tags:
  - Vibe Coding
  - Claude Code
  - Prompt Engineering
  - Context Engineering
  - Harness Engineering
  - Skills
  - Superpowers
  - OpenSpec
  - AI 工作坊
  - AI Agent
categories:
  - AI
date: 2026-04-16 21:00:00
featured_image: /images/b/61.png
---

本篇分享 AI Coding Agent 實戰工作坊中階場的內容，以 Claude Code 作為主要示範工具，帶大家從「會用 AI」進一步到「設計 AI 的工作環境」。中階場的核心不是背更多術語，而是**學會判斷結果不穩時，該補哪一層**。

<!-- more -->

<iframe width="560" height="315" src="https://www.youtube.com/embed/b5kWQNVJ4HM" title="AI Coding Agent 實戰工作坊 — 中階場 (Claude)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 簡報下載

* [AI Coding Agent 實戰工作坊 — 中階場 (Claude) (PDF)](/files/20260417-AI-Workshop-02-intermediate.pdf)

## 從單次協作到可重複流程

初階場學的是「完成一次可驗收的人機協作」，中階場要往前一步：

| 角度 | 你在做什麼 |
| :--- | :--- |
| **單次協作** | 把需求講清楚，讓 AI 幫你完成一次任務 |
| **可重複流程** | 設計規則、流程、工具，讓 AI 能穩定完成很多次任務 |

你不只是想做出一道菜，而是開始設計整間廚房怎麼穩定運作。同樣一道菜，有人每次都靠運氣，有人靠制度穩定出餐。

## AI 工作環境的三大支柱

中階場的核心框架是 Prompt / Context / Harness，三者缺一不可：

| 支柱 | 餐廳比喻 | 白話 |
| :--- | :--- | :--- |
| **Prompt** | 你怎麼點餐 | 你給 AI 的指令、限制、輸出要求 |
| **Context** | 菜單、廚房規矩、食材資訊 | AI 取得到的專案知識與外部資訊 |
| **Harness** | 廚房制度、權限、安全檢查 | AI 可以怎麼做、做到哪裡、何時該停下來 |

### 為什麼同一句需求，結果還是會飄？

通常不是單一原因：

1. **Prompt 不夠清楚**：任務、限制、輸出格式沒有講明
2. **Context 不夠完整**：AI 不知道 repo 規範、現有 code、外部資料
3. **Harness 不夠穩**：沒有檢查點、權限邊界或 workflow 約束

**所以要學的不是「寫超長 prompt」，而是判斷這次要補的是哪一層。**

## Prompt — 你怎麼點餐

不是每件事都要用同樣鬆緊度：

| 任務類型 | 建議鬆緊度 |
| :--- | :--- |
| 資料庫遷移 | **嚴格**（指定做法、限制風險） |
| API 實作 | **中等**（講清規格，保留部分空間） |
| Code Review | **中等到寬鬆**（給目標與觀察角度） |
| 寫文件 | **寬鬆**（講清受眾與格式） |

> 越危險的操作，prompt 越要明確；越探索的任務，可以留多一點空間。

## Context — 廚房知道什麼

如果 Prompt 是點餐，那 Context 就是：這是一家什麼餐廳、廚房有什麼規矩、現在有哪些食材、有沒有外部系統可以查資料。

```text
常見 context = 對話內容 + 相關檔案 + 專案指引檔 + 需要時取得的外部資訊
```

⚠ context 不只影響品質，也影響成本與效率——塞太多不相關的東西，判斷會變差、資源也會浪費。

### 專案指引檔是廚房規矩

| 概念 | Claude Code | Codex | Gemini |
| :--- | :--- | :--- | :--- |
| 專案指引檔 | `CLAUDE.md` | `AGENTS.md` | `GEMINI.md` |
| 作用 | 告訴 AI 專案身份、規範、工作方式 | 同類型概念 | 同類型概念 |

你是在跟 AI 說：「這是我們家的廚房，我們平常就是這樣做事」。寫一次，之後每次對話都比較容易站在同一套規則上。

### 專案指引檔怎麼寫才有用？

| 要寫 | 不要寫 |
| :--- | :--- |
| 規則（約束怎麼工作、什麼不能做） | 介紹（項目是什麼、目錄結構） |
| 團隊/倉庫獨有的限制 | 模型本來就會的常識 |
| 長期有效的流程 | 臨時任務（應寫成 Skill 或 Hook） |
| 反面例子「不要這樣做」 | 正面套話「保持優雅」 |

> 每一行都佔全局上下文。不寫就會出錯的才寫進去，同樣錯誤出現兩次再更新。

⚠️ 有研究指出：AI 自己生的指引檔，任務成功率反而**下降**；人寫但塞太多，也幾乎沒幫助。**只寫最小必要規則，效果最好。**

### Prompt 其實是組裝出來的

你寫的不只是一份 CLAUDE.md，而是可組合的模組：

```text
CLAUDE.md → role → policy → stack → skills → templates
━━━━━━━━━━━━━━━━━━━━━━━━━   ━━━━━━━━━━━━━━━━━━━━━━━━━━
     每次都載入（核心）                 按需選用
```

* **核心模組**：身份、規則 — 每次對話都帶著
* **Skills**：怎麼做 — 任務有固定 SOP 時載入
* **Templates**：結構化的資訊格式 — 任務背景、報告、提案都是模板

## Harness — 廚房怎麼被管住

| 機制 | 餐廳比喻 | 說明 |
| :--- | :--- | :--- |
| **權限 / approval** | 哪些事要店長批准 | 高風險操作先確認 |
| **Hooks / 自動檢查** | 出餐前先過品管 | 在特定時機自動跑檢查或流程 |
| **Workflow 約束** | 廚房標準流程 | 先看 code、再改、最後驗證 |

例如在 `.claude/settings.json` 設一個 hook，每次 AI 改完檔案自動跑 lint：

```jsonc
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit",
      "hooks": [{ "type": "command", "command": "pnpm lint --fix" }]
    }]
  }
}
```

> Harness 像安全帶 — 不是綁手綁腳，而是讓你敢放手讓 AI 跑。

### Harness 的兩個面向

| 面向 | 做什麼 |
| :--- | :--- |
| **自動護欄** | hooks、權限、檢查點，防止出錯 |
| **反覆調校** | 根據結果回頭修正 Prompts & Skills |

只有護欄沒有調校，規則會僵化；只有調校沒有護欄，每次都靠人盯。兩者搭配才完整。

## Skills / MCP / Plugins，分別在做什麼？

| 概念 | 白話 |
| :--- | :--- |
| **Prompt** | 你怎麼下指令 |
| **CLAUDE.md / AGENTS.md** | 專案背景與做事方式 |
| **Skills** | 讓 AI 按步驟完成一種任務 |
| **MCP** | 讓 AI 連到外部工具或資料 |
| **Plugins** | 把常用能力打包成可重用組合 |

### Skills — 把做事方法變成 SOP

Skill 把常見任務的流程寫好：

```text
模糊需求 → brainstorming → plan → implementation → verification
```

> Skill 不只是 prompt 模板，而是可重複套用的工作流程。

### MCP — 讓廚房自己去拿資訊

MCP 讓 AI 在需要時自己去查資料或做操作，例如讀 issue、查資料庫、看團隊討論脈絡、讀檔案。關鍵不是「接了多少系統」，而是：**AI 能不能在對的時候，自己拿到它需要的資訊**。

## Live Demo：從 0 到 1 做一個 RWD 任務管理系統

Demo 的主軸是讓 AI 按流程做出產品雛形，對應三大支柱：

* **Prompt / Context**：先定角色與規則
* **Context → Spec**：用 brainstorming 把需求收斂
* **Harness**：用 plan、回饋迴圈推進與修正

### 1. 先建立 Role / Skill 系統

在專案中建立三個 Role Prompts：

* **Frontend**：專注 UI 結構、RWD、互動與元件拆分
* **Backend**：專注 API、資料結構、驗證與錯誤處理
* **QA**：專注測試案例、邊界條件與風險提醒

每個角色再配一個 Skill：

* **Frontend skill**：先定頁面結構，再定 breakpoint，再拆元件
* **Backend skill**：先定 schema，再定 API，再補 validation
* **QA skill**：先寫 test plan，再補 edge cases 與 E2E checklist

### 2. 建立約束條件

用 `/init` 產生 CLAUDE.md，再把規則寫進去：

```txt
/init 這個專案每次執行任務時，只帶一個角色與對應 Skill，Skill 最多 3 個
```

| 情境 | 沒約束 | 有約束 |
| :--- | :--- | :--- |
| 角色混用 | 前後端混扮，風格不一致 | 一次一個角色，職責清楚 |
| Skill 爆量 | 太多 SOP 互相衝突 | 最多 3 個，聚焦當前任務 |
| 規則遺失 | 每次對話都要重新交代 | 寫進 CLAUDE.md，自動生效 |

### 3. Brainstorm 把需求收斂成 Design Spec

安裝 [Superpowers](https://github.com/obra/superpowers) 後：

```text
/superpowers:brainstorm 我想做一個 RWD 的任務管理系統
```

一句模糊需求會被逐步澄清成可落地規格，決定架構方案與技術棧。**關鍵不是直接寫 code，而是把需求先收斂成可以分工與驗收的 spec。**

### 4. 從 Plan 到逐步實作

先把 spec 變成可執行計畫：

* 把 spec 拆出 N 個 tasks
* 依序讓 AI 實作每個 task
* 最後用 build / test 當驗收標準

執行順序：後端 schema + API → 前端元件 + 頁面 → QA 補測試案例與驗收。

### 5. 根據回饋即時修正

請 AI 修改完自動啟動 backend 與 frontend，用瀏覽器實際操作。發現問題時，判斷該補哪一層：

| 問題 | 該補什麼 | 修正方式 |
| :--- | :--- | :--- |
| 手機版任務卡片排版跑掉 | **Context**（規範） | 調整 flex / media query |
| 新增任務後 API 回 404 | **Prompt**（路由細節） | 檢查路由與 controller |
| 篩選「已完成」仍顯示全部 | **Harness**（測試檢查點） | 確認 query 與 filter |

> 成品不會一次到位，關鍵是判斷該補哪一層，再回饋給 AI。

### 6. 用 OpenSpec 提出需求變更

[OpenSpec](https://github.com/Fission-AI/OpenSpec) 是需求、設計、實作、驗收的變更帳本：

1. `openspec init` 啟用
2. `/opsx:explore`：提出需求
3. `/opsx:propose`：建立需求文件及分工規劃
4. `/opsx:apply`：依照 spec 實作
5. `/opsx:archive`：驗收完成後歸檔

> OpenSpec 不是文件倉庫，而是讓每次變更都有脈絡可追。

## 實務提醒：成本與 context 意識

前面提過，context 不只影響品質，也影響成本。這些情況通常都比較耗資源：

| 行為 | 常見影響 | 建議 |
| :--- | :--- | :--- |
| 超長對話 | context 越來越重 | 適時開新對話，保持主題乾淨 |
| 一次塞太多不相關資訊 | 判斷品質下降 | 只給真正相關的內容 |
| 反覆試錯但不收斂 | 花時間也花額度 | 退一步先補 context 或規則 |
| 不必要的多工具串接 | 複雜度上升 | 先解決核心問題，再加工具 |

> 省資源的方法通常不是少問，而是讓每次提問更有結構。

## 三個 Takeaway

1. **Prompt + Context + Harness 三者缺一不可** — 好的結果，通常不是靠單一神 prompt，而是三層一起補
2. **CLAUDE.md / AGENTS.md 是團隊共享的廚房規矩** — 寫一次，之後每次合作都不用重新對齊規矩
3. **Skills + MCP 讓 AI 從聊天工具變成工作環境的一部分** — 不只會回答，還能按流程做事、在需要時自己拿資訊

> 中階的核心不是「更會用 AI」，而是「更會設計 AI 怎麼工作」。

## 參考

* [Claude Code](https://claude.com/claude-code) - Anthropic
* [Superpowers](https://github.com/obra/superpowers) - 可重用技能包
* [OpenSpec](https://github.com/Fission-AI/OpenSpec) - Spec 驅動開發
