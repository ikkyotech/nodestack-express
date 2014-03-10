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

            var locale = req.i18n.getLocale(),
                targetLocale = locale,
                urlParts = url.parse(req.url);

            if (req.cookies && req.cookies.locale) {
                targetLocale = req.cookies.locale;
            }

            if (targetLocale !== locale) {
                req.i18n.setLocale(targetLocale);
                locale = req.i18n.getLocale();
            }

            res.redirect(getLocaleUrl(urlParts, path, locale));
        });
        options.locales.forEach(function eachLocale(locale) {
            app.get("/" + locale.id + path, function getLocalizedPage(req, res) {
                storeLocale(res, locale.id);
                options.i18n = req.i18n;
                options.i18n.setLocale(locale.id);
                /*jslint nomen: true*/
                options.__ = req.i18n.__;
                /*jslint nomen: false*/
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