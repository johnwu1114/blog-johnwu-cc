$(function () {
    // Initialize Firebase
    let config = {
        apiKey: "AIzaSyCcY-L4ygQnu0Q4cUVoFBJNecNYvuFQ-zw",
        authDomain: "blog-johnwu-cc.firebaseapp.com",
        databaseURL: "https://blog-johnwu-cc.firebaseio.com",
        projectId: "blog-johnwu-cc",
        storageBucket: "blog-johnwu-cc.appspot.com",
        messagingSenderId: "57548469306"
    };
    window.firebase.initializeApp(config);
    let database = window.firebase.database();

    function changeUrlToKey(url) {
        return url.replace(new RegExp('\\/|\\.', 'g'), "_");
    }

    function readVisits(selector, url, isReadOnly) {
        let db_key = changeUrlToKey(window.location.host) + "/" + changeUrlToKey(url);
        database.ref(db_key).once("value").then(function (result) {
            let count = parseInt(result.val() || 0);
            if (!isReadOnly) {
                count += 1;
                database.ref(db_key).set(count);
            }
            if (selector.length > 0) {
                selector.html(count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            };
        });
    }
    readVisits($("#visits .count"), "/");

    $(".pageviews").each(function () {
        let postUrl = $(this).data("path");
        let isReadOnly = (window.location.pathname === "/") ||
            window.location.pathname.startsWith("/page/") ||
            window.location.pathname.startsWith("/tags/") ||
            window.location.pathname.startsWith("/categories/") ||
            window.location.pathname.startsWith("/archives/");
        readVisits($(this).find(".count"), postUrl, isReadOnly);
    });

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

    $(window).load(switchPostListMode);
    $(window).on("resize", switchPostListMode);
});