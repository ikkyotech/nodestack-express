"use strict";

module.exports = function getLocalisedFactory(app, DEFAULT_LOCALES) {
    var url = require("url"),
        storeLocale = require("./storeLocale"),
        getLocaleUrl = require("./getLocaleUrl"),
        removeLocaleFromPathFactory = require("./removeLocaleFromPathFactory");

    return function getLocalised(path, handler, options) {
        options = options || {};
        options.locales = options.locales || DEFAULT_LOCALES;
        var removeLocaleFromPath = removeLocaleFromPathFactory(options.locales);

        app.get(path, function getLocaleAutoRoute(req, res) {
            req.i18n.setLocaleFromCookie(req);
            var locale = req.i18n.getLocale(),
                urlParts = url.parse(req.url);
            storeLocale(res, locale);

            // Redirect
            res.writeHead(302, {
                'Location': getLocaleUrl(urlParts, path, locale)
            });
            res.end();
        });
        options.locales.forEach(function eachLocale(locale) {
            app.get("/" + locale.id + path, function getLocalizedPage(req, res) {
                storeLocale(res, locale.id);
                options.i18n = req.i18n;
                options.i18n.setLocale(locale.id);
                var urlParts = url.parse(req.url),
                    nonLocaleRoot = removeLocaleFromPath(urlParts.pathname);
                options.getLocaleUrl = function (subPath, pathLocale) {
                    if (arguments.length <= 1) {
                        pathLocale = subPath;
                        subPath = nonLocaleRoot;
                    }
                    return getLocaleUrl(urlParts, subPath, pathLocale || locale);
                };
                handler(req, res, locale, options);
            });
        });
    };
};