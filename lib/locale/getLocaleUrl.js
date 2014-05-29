"use strict";

var url = require("url");

function getLocaleUrl(urlParts, urlParams, path, locale) {
    var formerPath = urlParts.pathname,
        result;

    if (urlParams && Object.keys(urlParams).length) {
        path = path.replace(/\:([a-z\_\$]+)/ig, function (str, key) {
            return urlParams[key] || str;
        });
    }

    if (locale === "") {
        urlParts.pathname = path;
    } else {
        urlParts.pathname = "/" + locale + path;
    }
    result = url.format(urlParts);
    urlParts.pathname = formerPath;
    return result;
}

module.exports = getLocaleUrl;