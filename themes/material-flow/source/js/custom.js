$(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCcY-L4ygQnu0Q4cUVoFBJNecNYvuFQ-zw",
        authDomain: "blog-johnwu-cc.firebaseapp.com",
        databaseURL: "https://blog-johnwu-cc.firebaseio.com",
        projectId: "blog-johnwu-cc",
        storageBucket: "blog-johnwu-cc.appspot.com",
        messagingSenderId: "57548469306"
    };
    window.firebase.initializeApp(config);
    var database = window.firebase.database();

    function changeUrlToKey(url) {
        return url.replace(new RegExp('\\/|\\.', 'g'), "_");
    }

    function readVisits(selector, url, isReadOnly) {
        var db_key = changeUrlToKey(window.location.host) + "/" + changeUrlToKey(url);
        database.ref(db_key).once("value").then(function (result) {
            var count = parseInt(result.val() || 0);
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
        var postUrl = $(this).data("path");
        var isReadOnly = (window.location.pathname === "/")
        || window.location.pathname.startsWith("/page/")
        || window.location.pathname.startsWith("/tags/")
        || window.location.pathname.startsWith("/categories/")
        || window.location.pathname.startsWith("/archives/");
        readVisits($(this).find(".count"), postUrl, isReadOnly);
    });
});