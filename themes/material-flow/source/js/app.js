/* eslint-disable */
"use strict";
addLoadingBarProgress(10);

(function ($) {
	const scrollCorrection = 70; // (header height = 50px) + (gap = 20px)

	function scrolltoElement(elem, correction) {
		correction = correction || scrollCorrection;
		var href = decodeURIComponent(elem.getAttribute("href"));
		const $elem = elem.href ? $(href) : $(elem);
		$("html, body").animate({
			"scrollTop": $elem.offset().top - correction
		}, 400);
	}

	function setHeader() {
		if (!window.subData) return;
		const $wrapper = $("header .wrapper");
		const $comment = $(".s-comment", $wrapper);
		const $toc = $(".s-toc", $wrapper);
		const $top = $(".s-top", $wrapper);

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
		});

		// bind events to every btn
		const $commentTarget = $("#comments");
		if ($commentTarget.length) {
			$comment.click(function (e) {
				e.preventDefault();
				e.stopPropagation();
				scrolltoElement($commentTarget);
			});
		} else $comment.remove();

		const $tocTarget = $(".toc-wrapper");
		if ($tocTarget.length && $tocTarget.children().length) {
			$toc.click(function (e) {
				e.stopPropagation();
				$tocTarget.toggleClass("active");
			});
		} else $toc.remove();

		$top.click(function () {
			scrolltoElement(document.body)
		});

	}

	function setHeaderMenu() {
		let $headerMenu = $("header .menu");
		let $underline = $headerMenu.find(".underline");

		function setUnderline($item, transition) {
			$item = $item || $headerMenu.find("li a.active"); //get instant
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
				setTimeout(function () {
					$underline.removeClass("disable-trans")
				}, 0); //get into the queue.
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
			if (name && name.length > 1) {
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
		const sr = ScrollReveal({
			distance: 0
		});
		sr.reveal(".reveal");
	}

	function setTocToggle() {
		const $toc = $(".toc-wrapper");
		if ($toc.length === 0) return;
		$toc.click(function (e) {
			e.stopPropagation();
			$toc.addClass("active");
		});
		$(document).click(function () {
			$toc.removeClass("active")
		});

		$toc.on("click", "a", function (e) {
			e.preventDefault();
			e.stopPropagation();
			scrolltoElement(e.target.tagName.toLowerCase() === "a" ? e.target : e.target.parentElement);
		});

		const liElements = Array.from($toc.find("li a"));
		//function animate above will convert float to int.
		const getAnchor = function () {
			return liElements.map(function (elem) {
				var href = decodeURIComponent(elem.getAttribute("href"));
				return Math.floor($(href).offset().top - scrollCorrection);
			});
		};

		let anchor = getAnchor();
		const scrollListener = function () {
			let anchor = getAnchor();
			const scrollTop = $("html").scrollTop() || $("body").scrollTop();
			if (!anchor) return;
			//binary search.
			let l = 0,
				r = anchor.length - 1,
				mid;
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

	function setVisitsCount() {
		let urls = [];
		let pageviews = {};
		$(".pageviews").each(function () {
			let url = $(this).data("path");
			urls.push(url);
			pageviews[url] = $(this).find(".count");
		}).promise().done(function () {
			$.post(PAGEVIEWS_API, {
				host: window.location.host,
				urls: urls
			}).done(function (result) {
				for (var key in result.pageviews) {
					let count = (result.pageviews[key] || "--").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					if (key === "/") {
						$("#totalPageviews .count").html(count);
					} else {
						pageviews[key].html(count);
					}
				}
			});
		});
	}

	function setPostList() {
		let SingleLine = "SingleLine";
		let DoubleLine = "DoubleLine";
		let postListMode = DoubleLine; // SingleLine or DoubleLine

		let switchPostListMode = function () {
			let postList = $(".post-list");
			if (postListMode !== SingleLine && postList.width() < 800) {
				let leftSideItems = postList.find(".left-side");
				let rightSideItems = postList.find(".right-side").detach();
				let index = 0;
				leftSideItems.each(function () {
					$(rightSideItems[index++]).insertAfter($(this));
				});
				postListMode = SingleLine;
			} else if (postListMode !== DoubleLine && postList.width() >= 800) {
				postList.find(".right-side").detach().appendTo(".post-list");
				postListMode = DoubleLine;
			}
		}

		switchPostListMode();
		$(window).load(switchPostListMode);
		$(window).on("resize", switchPostListMode);
	}

	$.fn.followTo = function (pos, className) {
		var $this = this,
			$window = $(window);

		$window.scroll(function (e) {
			if ($window.scrollTop() > pos) {
				$this.addClass(className);
			} else {
				$this.removeClass(className);
			}
		});
	};

	$(function () {
		//set header
		setHeader();
		setHeaderMenu();
		setHeaderMenuPhone();
		setHeaderSearch();
		setWaves();
		setScrollReveal();
		setTocToggle();
		setVisitsCount();
		setPostList();
		$(".toc-wrapper").followTo(520, "fixed");
		$(".article .video-container").fitVids();

		setTimeout(function () {
			$("#loading-bar-wrapper").fadeOut(500);
		}, 300);

		addLoadingBarProgress(100);
	});

})(jQuery);