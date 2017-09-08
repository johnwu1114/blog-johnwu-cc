function AlexaSiteStatsWidget() {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var jsUrlRegex = /http[s]?:\/\/.*\/js\/site-stats\.min\.js.?p=(.)(.)((?:[&]|&amp;)url=([^\?&]*))?/i;
    var imageSrcPrefix = "http://xsltcache.alexa.com/site_stats/gif/";
    var detailURLPrefix = "https://www.alexa.com/siteinfo/";

    this.replaceScripts = function replaceScripts() {
        var scriptElements = document.getElementsByTagName("script");
        var thisScript = scriptElements[scriptElements.length - 1];
        var scriptSource = thisScript.src;
        if (scriptSource != null) {
            var urlMatched = scriptSource.match(jsUrlRegex);
            var decodedURL = decodeURIComponent(urlMatched[4] || document.location.hostname);
            if (urlMatched != null) {
                var base64EncodedURL = encode64(decodedURL);
                var imageURL = imageSrcPrefix + urlMatched[1] + "/" + urlMatched[2] + "/" +
                    base64EncodedURL + "/s.gif";
                var img = new Image();
                img.src = imageURL;
                img.setAttribute("border", "0");
                if (urlMatched[1] == "s")
                    img.alt = "Alexa Certified Traffic Ranking for " + decodedURL;
                else
                    img.alt = "Alexa Certified Site Stats for " + decodedURL;
                var newLink = document.createElement('a');
                newLink.setAttribute("href", detailURLPrefix + decodedURL);
                newLink.setAttribute("target", "_blank");
                newLink.className = 'AlexaSiteStatsWidget';
                newLink.appendChild(img);
                thisScript.parentNode.insertBefore(newLink, thisScript);
            }
        }
    }

    function encode64(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        } while (i < input.length);

        return output;
    }
}
new AlexaSiteStatsWidget().replaceScripts();