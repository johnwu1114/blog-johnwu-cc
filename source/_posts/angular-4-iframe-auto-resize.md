---
title: Angular 4 教學 - IFrame 自動調整大小
author: John Wu
tags:
  - Angular
  - IFrame
  - Component
categories:
  - Angular
date: 2017-08-11 13:37:00
featured_image: /images/a/290.png
---
![Angular 4 教學 - IFrame 自動調整大小](/images/a/290.png)

在網頁新舊版本交界期，`IFrame` 算是蠻常用的手法，在 Angular 4 (Angular 2) 的 SPA 頁面中，利用 `IFrame` 插入舊版網頁，使系統整體感一致。  
`IFrame` 的寬高大小又不能固定不變，太小會留下很多空白，太大會使內外頁都產生 Scrollbar。  
本篇將介紹如何讓 `IFrame` 在  Angular 的 SPA 頁面中，隨著視窗自動調整大小。  

<!-- more -->

## IFrame 太小

如果只是把 `IFrame` 設定寬高 `100%` 實際上他不會真的套用百分比的設定，視窗大於 `IFrame` 時，就會空出空間。如下：

```html
<iframe src="https://blog.johnwu.cc/" width="100%" height="100%"></iframe>
```
![Angular 4 教學 - IFrame 太小](/images/a/291.png)

## IFrame 太大

若把 `IFrame` 設定固定寬高，當視窗大於 `IFrame` 時，就會空出空間；視窗小於 `IFrame` 時，就會同時產生 `IFrame` 及瀏覽器的 Scrollbar。如下：
```html
<iframe src="https://blog.johnwu.cc/" width="600px" height="800px"></iframe>
```
![Angular 4 教學 - IFrame 太小](/images/a/292.png)

## 動態計算

比較好的方式是透過 Page Load 及 Window Resize 的事件，動態計算 `IFrame` 的寬高，讓 `IFrame` 隨著視窗大小自動改變。  

此範例我是用 `Component` 包裝，也可以用 `Directive` 實現一樣的功能。

### 1. MyIFrameComponent

my-iframe.component.ts
```ts
import { Component, Input, ViewChild, ElementRef, HostListener } from "@angular/core";

@Component({
    selector: "my-iframe",
    templateUrl: "/app/my-iframe.component.html",
    styles: ["iframe { margin-bottom: -4px; }"]
})
export class MyIFrameComponent {
    @Input() src: string;
    @ViewChild("frame") frameElement: ElementRef;
    containerMinWidth: number = 0;
    containerMinHeight: number = 0;
    containerWidth: number = this.containerMinWidth;
    containerHeight: number = this.containerMinHeight;

    ngOnInit() {
        this.onResize(window.innerWidth, window.innerHeight);
    }

    @HostListener("window:resize", ["$event.target.innerWidth", "$event.target.innerHeight"])
    onResize(width: number, height: number): void {
        let top = this.frameElement.nativeElement.offsetTop;
        let left = this.frameElement.nativeElement.offsetLeft;

        this.containerWidth = Math.max(width - left, this.containerMinWidth);
        this.containerHeight = Math.max(height - top, this.containerMinHeight);
    }
}
```

my-iframe.component.ts
```html
<iframe  
    #frame
    [src]="src" 
    [style.width.px]="containerWidth" 
    [style.height.px]="containerHeight" 
    height="100%" 
    width="100%"
    frameborder="0" 
    marginheight="0"
    marginwidth="0"></iframe>
```

### 2. 使用 MyIFrameComponent

app.component.ts
```ts
import { Component } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: "my-app",
    templateUrl: "/app/app.component.html"
})
export class AppComponent {
    frameUrl: SafeResourceUrl;

    constructor(private sanitizer: DomSanitizer) {
        let url = "https://blog.johnwu.cc/";
        this.frameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
}
```

app.component.html
```html
<div class="banner">
    Banner
</div>
<div>
    <div class="sidebar">
        Sidebar
    </div>
    <div class="content">
         <my-iframe [src]="frameUrl"></my-iframe> 
    </div>
</div>
```

## 執行結果

![Angular 4 教學 - IFrame 自動調整大小 - 執行結果](/images/a/290.gif)

## 程式碼下載

[my-angular-iframe-auto-resize](https://github.com/johnwu1114/my-angular-iframe-auto-resize)  