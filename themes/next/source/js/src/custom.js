$(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAKKANW-V9A83noXk9Spk6FTf93-zM1luk",
        authDomain: "johnwu-19dd3.firebaseapp.com",
        databaseURL: "https://johnwu-19dd3.firebaseio.com",
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    var oriUrl = window.location.host;
    function readVisits(url, selector, isReadOnly) {
        var db_key = decodeURI(url.replace(new RegExp('\\/|\\.', 'g'), "_"));
        database.ref(db_key).once("value").then(function (result) {
            var count = parseInt(result.val() || 0);
            if (!isReadOnly) {
                count += 1;
                database.ref(db_key).set(count);
            }
            if (selector.length > 0) {
                selector.html(count);
            };
        });
    }
    readVisits(oriUrl, $("#visits .count"));

    $(".pageviews").each(function () {
        var postUrl = oriUrl + $(this).data("path");
        var isReadOnly = window.location.pathname === "/";
        readVisits("page/" + postUrl, $(this).find(".count"), isReadOnly);
    });
});