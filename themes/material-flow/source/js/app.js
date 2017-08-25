/* eslint-disable */
var customSearch;
(function ($) {

	"use strict";
	const scrollCorrection = 70; // (header height = 50px) + (gap = 20px)
	function scrolltoElement(elem, correction) {
		correction = correction || scrollCorrection;
		const $elem = elem.href ? $(elem.getAttribute("href")) : $(elem);
		$("html, body").animate({ "scrollTop": $elem.offset().top - correction }, 400);
	};

	function setHeader() {
		if (!window.subData) return;
		const $tocWrapper = $(".toc-wrapper");
		const $wrapper = $("header .wrapper");
		const $comment = $(".s-comment", $wrapper);
		const $toc = $(".s-toc", $wrapper);
		const $top = $(".s-top", $wrapper);

		var resetTocWrapperPosition = function () {
			if (!$tocWrapper.is(":visible")) return;
			if ($tocWrapper.css("margin-top") < "50px") {
				$tocWrapper.css("top", "");
			} else {
				let scrollTop = $(window).scrollTop();
				let top = parseInt($tocWrapper.css("top"));
				if (top > 0 || scrollTop <= 340) {
					$tocWrapper.css("top", Math.max(0, (340 - scrollTop)));
				}
			}
		}

		resetTocWrapperPosition();
		$(window).resize(function () {
			let count = 0;
			let interval = setInterval(function () {
				resetTocWrapperPosition();
				if (++count == 3) clearInterval(interval);
			}, 200);
		});

		$wrapper.find(".nav-sub .logo").text(window.subData.title);
		let pos = $(document).scrollTop();
		$(document, window).scroll(function () {
			const scrollTop = $(document).scrollTop();
			const del = scrollTop - pos;
			if (del >= 20 && scrollTop >= 50) {
				pos = scrollTop;
				$wrapper.addClass("sub");
			} else if (del <= -20) {
				pos = scrollTop;
				$wrapper.removeClass("sub");
			}
			resetTocWrapperPosition();
		});
		// bind events to every btn
		const $commentTarget = $("#comments");
		if ($commentTarget.length) {
			$comment.click(function (e) { e.preventDefault(); e.stopPropagation(); scrolltoElement($commentTarget); });
		} else $comment.remove();

		const $tocTarget = $(".toc-wrapper");
		if ($tocTarget.length && $tocTarget.children().length) {
			$toc.click(function (e) { e.stopPropagation(); $tocTarget.toggleClass("active"); });
		} else $toc.remove();

		$top.click(function () { scrolltoElement(document.body) });

	}
	function setHeaderMenu() {
		let $headerMenu = $("header .menu");
		let $underline = $headerMenu.find(".underline");
		function setUnderline($item, transition) {
			$item = $item || $headerMenu.find("li a.active");//get instant
			transition = transition === undefined ? true : !!transition;
			if (!transition) $underline.addClass("disable-trans");
			if ($item && $item.length) {
				$item.addClass("active").siblings().removeClass("active");
				$underline.css({
					left: $item.position().left,
					width: $item.innerWidth()
				});
			} else {
				$underline.css({
					left: 0,
					width: 0
				});
			}
			if (!transition) {
				setTimeout(function () { $underline.removeClass("disable-trans") }, 0);//get into the queue.
			}
		}
		$headerMenu.on("mouseenter", "li", function (e) {
			setUnderline($(e.currentTarget));
		});
		$headerMenu.on("mouseout", function () {
			setUnderline();
		});
		//set current active nav
		let $active_link = null;
		if (location.pathname === "/" || location.pathname.startsWith("/page/")) {
			$active_link = $(".nav-home", $headerMenu);
		} else {
			let name = location.pathname.match(/\/(.*?)\//);
			if (name.length > 1) {
				$active_link = $(".nav-" + name[1], $headerMenu);
			}
		}
		setUnderline($active_link, false);
	}
	function setHeaderMenuPhone() {
		let $switcher = $(".l_header .switcher .s-menu");
		$switcher.click(function (e) {
			e.stopPropagation();
			$("body").toggleClass("z_menu-open");
			$switcher.toggleClass("active");
		});
		$(document).click(function (e) {
			$("body").removeClass("z_menu-open");
			$switcher.removeClass("active");
		});
	}
	function setHeaderSearch() {
		let $switcher = $(".l_header .switcher .s-search");
		let $header = $(".l_header");
		let $search = $(".l_header .m_search");
		if ($switcher.length === 0) return;
		$switcher.click(function (e) {
			e.stopPropagation();
			$header.toggleClass("z_search-open");
			$search.find("input").focus();
		});
		$(document).click(function (e) {
			$header.removeClass("z_search-open");
		});
		$search.click(function (e) {
			e.stopPropagation();
		})
	}
	function setWaves() {
		Waves.attach(".flat-btn", ["waves-button"]);
		Waves.attach(".float-btn", ["waves-button", "waves-float"]);
		Waves.attach(".float-btn-light", ["waves-button", "waves-float", "waves-light"]);
		Waves.attach(".flat-box", ["waves-block"]);
		Waves.attach(".float-box", ["waves-block", "waves-float"]);
		Waves.attach(".waves-image");
		Waves.init();
	}
	function setScrollReveal() {
		const $reveal = $(".reveal");
		if ($reveal.length === 0) return;
		const sr = ScrollReveal({ distance: 0 });
		sr.reveal(".reveal");
	}
	function setTocToggle() {
		const $toc = $(".toc-wrapper");
		if ($toc.length === 0) return;
		$toc.click(function (e) { e.stopPropagation(); $toc.addClass("active"); });
		$(document).click(function () { $toc.removeClass("active") });

		$toc.on("click", "a", function (e) {
			e.preventDefault();
			e.stopPropagation();
			scrolltoElement(e.target.tagName.toLowerCase === "a" ? e.target : e.target.parentElement);
		});

		const liElements = Array.from($toc.find("li a"));
		//function animate above will convert float to int.
		const getAnchor = function () {
			liElements.map(function (elem) { Math.floor($(elem.getAttribute("href")).offset().top - scrollCorrection) });
		};

		let anchor = getAnchor();
		const scrollListener = function () {
			const scrollTop = $("html").scrollTop() || $("body").scrollTop();
			if (!anchor) return;
			//binary search.
			let l = 0, r = anchor.length - 1, mid;
			while (l < r) {
				mid = (l + r + 1) >> 1;
				if (anchor[mid] === scrollTop) l = r = mid;
				else if (anchor[mid] < scrollTop) l = mid;
				else r = mid - 1;
			}
			$(liElements).removeClass("active").eq(l).addClass("active");
		}
		$(window)
			.resize(function () {
				anchor = getAnchor();
				scrollListener();
			})
			.scroll(function () {
				scrollListener()
			});
		scrollListener();
	}

	// function getPicture() {
	// 	const $banner = $(".banner");
	// 	if ($banner.length === 0) return;
	// 	const url = ROOT + "js/lovewallpaper.json";
	// 	$.get(url).done(res => {
	// 		if (res.data.length > 0) {
	// 			const index = Math.floor(Math.random() * res.data.length);
	// 			$banner.css("background-image", "url(" + res.data[index].big + ")");
	// 		}
	// 	})
	// }

	// function getHitokoto() {
	// 	const $hitokoto = $("#hitokoto");
	// 	if($hitokoto.length === 0) return;
	// 	const url = "http://api.hitokoto.us/rand?length=80&encode=jsc&fun=handlerHitokoto";
	// 	$("body").append("<script	src="%s"></script>".replace("%s",url));
	// 	window.handlerHitokoto = (data) => {
	// 		$hitokoto
	// 			.css("color","transparent")
	// 			.text(data.hitokoto)
	// 		if(data.source) $hitokoto.append("<cite> ——  %s</cite>".replace("%s",data.source));
	// 		else if(data.author) $hitokoto.append("<cite> ——  %s</cite>".replace("%s",data.author));
	// 		$hitokoto.css("color","white");
	// 	}
	// }


	$(function () {
		//set header
		setHeader();
		setHeaderMenu();
		setHeaderMenuPhone();
		setHeaderSearch();
		setWaves();
		setScrollReveal();
		setTocToggle();
		// getHitokoto();
		// getPicture();


		$(".article .video-container").fitVids();

		setTimeout(function () {
			$("#loading-bar-wrapper").fadeOut(500);
		}, 300);

		if (SEARCH_SERVICE === "google") {
			customSearch = new window.GoogleCustomSearch({
				apiKey: GOOGLE_CUSTOM_SEARCH_API_KEY,
				engineId: GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
				imagePath: "/images/"
			});
		}
		else if (SEARCH_SERVICE === "algolia") {
			customSearch = new window.AlgoliaSearch({
				apiKey: ALGOLIA_API_KEY,
				appId: ALGOLIA_APP_ID,
				indexName: ALGOLIA_INDEX_NAME,
				imagePath: "/images/"
			});
		}
		else if (SEARCH_SERVICE === "hexo") {
			customSearch = new window.HexoSearch({
				imagePath: "/images/"
			});
		}
		else if (SEARCH_SERVICE === "azure") {
			customSearch = new window.AzureSearch({
				serviceName: AZURE_SERVICE_NAME,
				indexName: AZURE_INDEX_NAME,
				queryKey: AZURE_QUERY_KEY,
				imagePath: "/images/"
			});
		}
		else if (SEARCH_SERVICE === "baidu") {
			customSearch = new window.BaiduSearch({
				apiId: BAIDU_API_ID,
				imagePath: "/images/"
			});
		}

	});

})(jQuery);