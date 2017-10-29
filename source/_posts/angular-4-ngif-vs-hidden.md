---
title: Angular 4 教學 - *ngIf vs [hidden] 比較
author: John Wu
tags:
  - Angular
  - TypeScript
categories:
  - Angular
date: 2017-10-29 21:45:00
featured_image: /images/x376.png
---

![Angular 4 教學 - *ngIf vs [hidden] 比較 - [hidden] 陷阱 - 1](/images/x376.png)

Angular 4 要顯示或隱藏 HTML 通常會用 `*ngIf` 或 `[hidden]`，但剛開始寫 Angular 的人可能會有點混淆這兩個方法。  
本篇將介紹 Angular 4 (Angular 2) 的 `*ngIf` 及 `[hidden]` 比較。  

<!-- more -->

## *ngIf

在 HTML 的元素屬性中插入 `*ngIf="條件"`，當條件建立時，該 HTML 元素才會**顯示**在畫面上，反之則**不顯示**。
```html
<div *ngIf="checked">
  *ngIf
</div>
```

`*ngIf` 做法是將整個 HTML 元素從 DOM 加入或移除。  
> 當 HTML 的元素較為複雜時，使用 `*ngIf` 就要小心一點，太頻繁的變換狀態可能會造成負擔。

### 執行結果  

![Angular 4 教學 - *ngIf vs [hidden] 比較 - *ngIf 範例](/images/x374.png)

## [hidden]

在 HTML 的元素屬性中插入 `[hidden]="條件"`，當條件建立時，該 HTML 元素則**不顯示**在畫面上，反之才會**顯示**。
```html
<div [hidden]="!checked">
  [hidden]
</div>
```

`[hidden]` 是在 HTML 元素插入屬性 hidden，並沒有破壞原本的 DOM，所以效率會比 `*ngIf` 稍微好一些。  

### 執行結果  

![Angular 4 教學 - *ngIf vs [hidden] 比較 - *ngIf [hidden]](/images/x375.png)

## [hidden] 陷阱

由於 HTML 元素的 hidden 屬性是由 Browser 控制，效果同 CSS `display: none;`，如果該 HTML 元素有被賦予其他的 CSS，並複寫了 `display`，hidden 屬性就會被影響。  
如下範例：
```html
<style>
    .sample {
        margin-bottom: 10px;
    }
    .displayBlock { 
        display: block; 
    }
</style>

<input type="checkbox" [(ngModel)]="checked" />

<div *ngIf="checked" class="sample">
    Sample 1: *ngIf
</div>

<div [hidden]="!checked" class="sample">
    Sample 2: [hidden]
</div>

<div *ngIf="checked" class="sample displayBlock">
    Sample 3: *ngIf with css display: block.
</div>

<div [hidden]="!checked" class="sample displayBlock">
    Sample 4: [hidden] with css display: block.
</div>
```

### 執行結果  

![Angular 4 教學 - *ngIf vs [hidden] 比較 - [hidden] 陷阱 - 1](/images/x376.png)
![Angular 4 教學 - *ngIf vs [hidden] 比較 - [hidden] 陷阱 - 2](/images/x377.png)

當 checked 為 false 時，預期結果是 4 個範例都不在畫面中顯示，但實際上 Sample 4 的 `display` 被 displayBlock 複寫了，所以還是顯示在畫面上。  
> 由於 hidden 屬性並不是使用 `display: none !important;`，所以沒控制好 CSS 就可能會發生超出你預期的結果。
