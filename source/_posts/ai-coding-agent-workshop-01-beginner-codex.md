---
title: AI Coding Agent 實戰工作坊 — 初階場 (Codex)
author: John Wu
tags:
  - Vibe Coding
  - Codex
  - Prompt Engineering
  - Context Engineering
  - Superpowers
  - OpenSpec
  - AI 工作坊
  - AI Agent
categories:
  - AI
date: 2026-04-15 18:00:00
featured_image: /images/b/60.png
---

本篇分享 AI Coding Agent 實戰工作坊初階場的內容，以 Codex 作為主要示範工具，帶大家從零開始體驗 AI 輔助開發的完整流程。初階場的核心目標不是背名詞，而是**完成一次可驗收的人機協作**。

<!-- more -->

<iframe width="560" height="315" src="https://www.youtube.com/embed/pwbbTtk3K1Y" title="AI Coding Agent 實戰工作坊 — 初階場 (Codex)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 簡報下載

* [AI Coding Agent 實戰工作坊 — 初階場 (Codex) (PDF)](/files/20260415-AI-Workshop-01-beginner.pdf)

## 三個心智模型轉換

在開始使用 AI 工具之前，先調整三個思維方式：

| 以前 | 現在 |
| :--- | :--- |
| **搜尋** — Google、Stack Overflow 找答案 | **對話** — 直接問 AI，它給你完整答案 |
| **複製貼上** — 找到 code 改改看能不能用 | **描述意圖** — 說你要什麼，AI 量身打造 |
| **獨自開發** — 自己想、自己寫 | **人機協作** — 你做決策，AI 做執行 |

這就是所謂的 **Vibe Coding**：不再逐行手寫，而是用自然語言「說出你要什麼」，AI 生成第一版，你負責驗收和迭代。

## AI 開發的六個層次

工作坊用「開餐廳」的比喻來串聯所有觀念：

| 你說的話 | 餐廳比喻 | 對應概念 |
| :--- | :--- | :--- |
| 「我想吃辣的」 | 先做一版試吃再調整 | **Vibe Coding** |
| 「宮保雞丁，不要花生，少油」 | 講越具體，出餐越準 | **Prompts** |
| 「這是川菜館，大火快炒」 | 廚房規矩寫好 | **Project Instructions** |
| 食譜 + 檢查點 + 工具清單 | 標準作業流程 | **Skills** |
| 接上供應商、倉庫、外送系統 | 對外接口 | **MCP** |

### Prompts — 你當下怎麼開口

你對 AI 說的每一句話都是 Prompt。描述越具體，AI 的結果越接近你要的。

同一個需求，不同說法差很多：

| | Prompt | 預期結果 |
| :--- | :--- | :--- |
| ❌ | 「改好一點」 | AI 不知道要改什麼 |
| ⚠️ | 「UI 醜醜的，幫我改」 | AI 隨便改，可能不是你要的 |
| ✅ | 「把背景改成草地主題，地鼠換成卡通風格，按鈕加圓角和陰影，被打到時要有特效，游標變錘子」 | AI 精準執行 |

### Project Instructions — 讓 AI 先了解你的專案

在專案根目錄放一個專案指引檔（Codex 用 `AGENTS.md`），AI 每次開工都會自動讀取，不用每次重講。

```markdown
# 打地鼠遊戲

## 技術棧
HTML + CSS + vanilla JavaScript，不用任何框架

## 規則
- 所有文字使用繁體中文
- CSS 使用卡通風格，圓角 + 明亮配色
- 每次修改後要能直接開 index.html 測試
```

> 寫一次，全團隊受益。

### Skills — 讓 AI 按照流程做事

把常見工作流程寫成可重用的能力，讓 AI 在需要時套用。例如建立一個 `code-review` Skill，每次做收尾檢查時自動執行：

1. 檢查有沒有 `console.log` 殘留
2. 確認所有文字都是繁體中文
3. 測試遊戲能不能正常開啟
4. 列出這次改了哪些檔案

不用每次重複交代，寫一次就能重複使用。進一步還可以安裝 [Superpowers](https://github.com/obra/superpowers) 這類整套技能包，直接取得 brainstorming、TDD、code review 等常見 workflow。

### MCP — 讓 AI 連接外部工具與資料

讓 AI 不只看你貼的內容，還能連到外部系統查資料、讀文件、做操作。例如：

* 連 GitLab → 讀 Issue、MR
* 連 JIRA → 讀 Ticket
* 連 Telegram → 收發訊息

AI 從「只會聊天」進一步變成「能查、能讀、能動手做事」。

## 補充觀念

### Context — AI 看到的全貌

每次你跟 AI 對話，工具會整理相關的 Context 給它：

```
你的 prompt + 對話歷史 + 相關檔案內容
+ 專案指引檔（如 AGENTS.md）
+ 需要時載入的 Skills
+ 呼叫 MCP 後取得的結果
```

Context 越大通常越慢、越貴；對話越長，前面的重點越可能被稀釋。所以：**講重點、必要時開新對話、不要把什麼都塞進去**。

### Models — AI 的法術強度

不同模型像遊戲裡不同等級的法術：

| 法術等級 | 感覺 | 適合場景 |
| :--- | :--- | :--- |
| **小招級** | 最快、最省 | 整理文案、格式修正、簡單問答 |
| **主力技** | 速度和品質平衡 | 日常 feature 開發、大部分工作 |
| **大招級** | 處理難題比較穩 | 卡很久的 bug、架構設計、複雜重構 |

原則很簡單：**簡單事別亂開大招，殺雞不用牛刀**。同一個模型也有不同的推理程度（蓄力時間），蓄力越久答案通常越完整，但也更慢更貴，不是每次都要拉滿。

### Token — AI 的魔力值

Token 是 AI 處理資訊的計量單位。你講得越多、AI 回得越多、對話越長，消耗就越大。強模型、長對話、重工具使用通常都更耗資源。所以：**講重點，少廢話，卡住就開新對話**。

## 實作心法

### 選題三判準

* **小** — 單一功能、單一 bug、單一整理任務
* **清楚** — 你能用一句話說清楚要它做什麼
* **可驗收** — 能用測試、畫面、或 checklist 判斷結果

### 開口模板

**工程師：**「這是我的小任務：____。請你先做第一版，如果需要修改程式碼就直接改，最後告訴我怎麼驗收。」

**QA：**「這是我要測的功能：____。請幫我整理成 test checklist 或 bug report，格式要清楚、可直接拿去用。」

**BA：**「這是我的需求描述：____。請幫我整理成 user story、acceptance criteria，並指出哪裡還不夠清楚。」

### 卡住時怎麼接著問

* 「測試失敗，錯誤如下，請修到通過：____」
* 「結果跟我預期不同，差異是：____」
* 「先不要一次做完，請拆成 3 個步驟」
* 「先告訴我你準備怎麼改，再開始動手」

## 安全提醒

AI 不是保險箱，以下內容**不要貼給 AI**：

| 類型 | 範例 | 風險 |
| :--- | :--- | :--- |
| 機密程式碼 | 核心演算法、未公開功能 | 敏感資訊送進第三方服務 |
| 客戶資料 | 個資、交易紀錄 | 違反隱私法規 |
| 認證資訊 | API key、密碼、token | 外洩即可被利用 |
| 內部文件 | 未公開的商業策略 | 競爭資訊外洩 |

> 是否可使用，依公司政策、工具設定與資料分級規範為準。不確定能不能貼？先用公開或模擬資料。

## 三個 Takeaway

1. **AI 是你的 Pair Programmer** — AI 是協作者，不是代做者；你要負責驗收
2. **AI 不只靠 Prompts** — 不是越長越好，而是越清楚越好；先講目標、限制、驗收
3. **AI 會犯錯** — 卡住時不要自己硬修；把錯誤和預期差異丟回 AI

## 參考

* [Codex](https://chatgpt.com/codex) - OpenAI
* [Superpowers](https://github.com/obra/superpowers) - 可重用技能包
* [OpenSpec](https://github.com/Fission-AI/OpenSpec) - Spec 驅動開發
