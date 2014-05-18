"use strict";

module.exports = function getLocalisedFactory(app, httpBase, defaultLocales, defaultMaxAge) {
    var url = require("url"),
        storeLocale = require("./storeLocale"),
        getLocaleUrl = require("./getLocaleUrl"),
        removeLocaleFromPathFactory = require("./removeLocaleFromPathFactory");

    return function getLocalised(path, handler, options) {
        options = options || {};
        options.httpBase = options.httpBase || httpBase;
        options.locales = options.locales || defaultLocales;
        options.devMode = options.devMode || false;
        options.maxAge = options.maxAge || defaultMaxAge || 60 * 5;
        var removeLocaleFromPath = removeLocaleFromPathFactory(options.locales);

        app.get(path, function getLocaleAutoRoute(req, res) {

            var locale = res.getLocale(),
                targetLocale = locale,
                urlParts = url.parse(req.url);

            if (req.cookies && req.cookies.locale) {
                targetLocale = req.cookies.locale;
            }

            if (targetLocale !== locale) {
                res.setLocale(targetLocale);
                locale = res.getLocale();
            }

            res.redirect(getLocaleUrl(urlParts, path, locale));
        });
        options.locales.forEach(function eachLocale(locale) {
            var targetPath = "/" + locale.id + path;
            /*
            if (/\/$/.test(targetPath)) {
                app.get(targetPath.substr(0, targetPath.length - 1), function (req, res) {
                    res.redirect(targetPath);
                    return req;
                });
            }
            */
            app.get(targetPath, function getLocalizedPage(req, res) {
                storeLocale(res, locale.id);
                var urlParts = url.parse(req.url),
                    nonLocaleRoot = removeLocaleFromPath(urlParts.pathname);
                options.getLocalePath = function (subPath, pathLocale) {
                    if (arguments.length <= 1) {
                        pathLocale = subPath;
                        subPath = nonLocaleRoot;
                    }
                    return getLocaleUrl(urlParts, subPath, pathLocale === null || pathLocale === undefined ? locale.id : pathLocale);
                };
                options.getLocaleUrl = function (subPath, pathLocale) {
                    if (arguments.length <= 1) {
                        pathLocale = subPath;
                        subPath = nonLocaleRoot;
                    }
                    if (!options.devMode && !res.getHeader('Cache-Control')) {
                        res.setHeader('Cache-Control', 'public, max-age=' + options.maxAge);
                    }
                    var result = getLocaleUrl(urlParts, subPath, pathLocale === null || pathLocale === undefined ? locale.id : pathLocale);
                    return options.httpBase + result;
                };
                handler(req, res, locale, options);
            });
        });
    };
};