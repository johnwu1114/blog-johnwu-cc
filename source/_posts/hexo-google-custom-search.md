---
title: Hexo - 自訂站內搜尋 (Google Custom Search)
author: John Wu
tags:
  - Hexo
  - CSS
categories:
  - Hexo
date: 2017-08-08 22:50:00
featured_image: /images/a/284.png
---
![Hexo - 自訂站內搜尋 (Google Custom Search) - 執行結果](/images/a/284.png)

雖然 Hexo 有提供 Local Search 套件，但我個人覺得不是很好用。  
我比較喜歡用 Google Search，Google Custom Search (GCS) 站內搜尋服務，GCS 可以巧妙的整合在網頁之中，速度又快又可以幫忙統計資訊。  
本篇將介紹如何把 GCS 整合到 Hexo 部落格。  

<!-- more -->

## 1. Google Custom Search

首先要到 GCS 申請自訂搜尋引擎：https://cse.google.com
步驟如下：
![Hexo - 自訂站內搜尋 (Google Custom Search) - 新稱搜尋引擎](/images/a/280.png)

設定要被搜尋的路徑，例如我的部落格文章都放在 `blog.johnwu.cc/article/` 目錄之下，我就設定只要搜尋此目錄。  
> 其他頁面如：Categories、Tags、Archives 等，都屬於索引頁面，沒有必要被搜尋，所以就不設定。  

![Hexo - 自訂站內搜尋 (Google Custom Search) - 設定搜尋引擎](/images/a/281.png)

選擇版面，還可以設定主題風格等。本範例的設定參考就好。
![Hexo - 自訂站內搜尋 (Google Custom Search) - 選擇版面](/images/a/282.png)
![Hexo - 自訂站內搜尋 (Google Custom Search) - 取得程式碼](/images/a/283.png)

取得程式碼後就可以把 GCS 加入至 Hexo 了。

## 2. 自訂搜尋頁面

新增檔案 `/source/search/index.md`，加入 GCS 程式碼。內容如下：
```md
---
title: Search
date: 2017-08-08 05:45:00
type: search
comments: false
---

{% raw %}
<script>
  (function() {
    var cx = '*************************';
    var gcse = document.createElement('script');
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(gcse, s);
  })();
</script>
<gcse:search></gcse:search>
{% endraw %}
```

## 3. 設定 Menu

編輯 `/themes/next/_condig.yml`，把搜尋頁面加入到 Menu。如下：
```yml
menu:
  # ...
  search: /search

menu_icons:
  # ...
  search: search 
```

> 由於我的 Theme 是用 NexT，所以我以 NexT 為例，其他 Theme 的使用者請自行變通一下。

設定完成後，就可以點擊 Menu 就可以看到 GCS 整合到 Hexo 囉～

![Hexo - 自訂站內搜尋 (Google Custom Search) - Menu](/images/a/285.png)

點進去後，畫面完全崩壞：
![Hexo - 自訂站內搜尋 (Google Custom Search) - 跑版](/images/a/286.png)

## 4. 修正 UI

由於 GCS 是動態產生 HTML 在 Hexo 頁面，不是用 IFrame 包裝，所以 CSS 會被主頁影響。  
而 Hexo 的 CSS 複寫了 GCS 的樣式，所以導致 GCS 顯示不正常。  

新建一個 `/themes/next/source/css/_common/components/google-custom-search.styl` 檔案來修正 GCS 跑版的問題。
```css
form.gsc-search-box{
    width: 90% !important;
}

.gsc-control-cse table {
  margin:0;
  border:none;
}

.gsc-control-cse table th, .gsc-control-cse table td {
  margin:0;
  padding:0;
  border:none;
}
.gsc-control-cse table>tbody>tr {
  background: none;
}

.gsc-input-box {
  height: 26px !important;
}

.gsc-input {
  width: 90% !important;
  padding-left: 5px !important;
  margin: 0px 5px !important;
}

.gsst_a {
  padding: 0 4px !important;
  border:none;
}

.gsst_b {
  font-size: inherit;
  position: relative !important;
  right: 30px;
  height: 24px;
}

.gsc-table-result{
  margin: 0 8px !important;
}

.gsc-result .gs-title {
    height: 1.4em !important;
}

.gsc-search-button.gsc-search-button-v2{
  margin-top: 5px !important;
}

.gcsc-branding-clickable{
  line-height: 20px;
  border:none;
}

.gs-title {
  line-height: 24px;
  border:none;
}

.gsc-table-result b {
  color: #dd4b39;
}

```
> 效果若不符合你的需求，再自行斟酌異動。

編輯 `/themes/next/source/css/_common/components/components.styl`，把 `google-custom-search` 加入引用參考。
```css
// ...
@import "google-custom-search";
```

> 如果你 Theme 不是用 NexT，可能不會有 `components.styl`，你可以建立一個 `google-custom-search.css`，直接加入參考到頁面中。

## 移除廣告

如果你真的很不想看到廣告，可以在 `google-custom-search.styl` 加入以下樣式：
```css
.gsc-adBlock {
  display: none !important;
}
```

## 執行結果

![Hexo - 自訂站內搜尋 (Google Custom Search) - 執行結果](/images/a/284.png)

實例連結：[Search](/search/)

## 備註

要使用 Google Custom Search 服務，網站一定要先被 Google 建立索引，沒有被建立索引的頁面都搜尋不到。  
可以使用 [Google 網站管理員](https://www.google.com/webmasters/) 建立索引。  