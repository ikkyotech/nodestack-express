"use strict";

var url = require("url");

function getLocaleUrl(urlParts, path, locale) {
    var formerPath = urlParts.pathname,
        result;
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