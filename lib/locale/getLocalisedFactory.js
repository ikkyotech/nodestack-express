"use strict";

module.exports = function getLocalisedFactory(app, httpBase, defaultLocales, defaultMaxAge) {
    var url = require("url"),
        storeLocale = require("./storeLocale"),
        getLocaleUrl = require("./getLocaleUrl"),
        util = require("util"),
        removeLocaleFromPathFactory = require("./removeLocaleFromPathFactory");

    return function getLocalised(path, handler, options) {
        options = options || {};
        options.httpBase = options.httpBase || httpBase;
        options.locales = options.locales || defaultLocales;
        options.devMode = options.devMode || false;
        options.maxAge = options.maxAge || defaultMaxAge || 60 * 5;
        var removeLocaleFromPath = removeLocaleFromPathFactory(options.locales),
            mainLocale = options.locales && options.locales[0];

        function addPathDomains() {
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

                res.redirect(getLocaleUrl(urlParts, req.params, path, locale));
            });
            options.locales.forEach(function eachLocale(locale) {
                var targetPath = "/" + locale.id + path;
                app.get(targetPath, function getLocalizedPage(req, res) {
                    if (!options.devMode && !res.getHeader('Cache-Control')) {
                        res.setHeader('Cache-Control', 'public, max-age=' + options.maxAge);
                    }
                    storeLocale(res, locale.id);
                    var urlParts = url.parse(req.url),
                        nonLocaleRoot = removeLocaleFromPath(urlParts.pathname);
                    options.getLocalePath = function (subPath, pathLocale) {
                        if (arguments.length <= 1) {
                            pathLocale = subPath;
                            subPath = nonLocaleRoot;
                        }
                        return getLocaleUrl(urlParts, req.params, subPath, pathLocale === null || pathLocale === undefined ? locale.id : pathLocale);
                    };
                    options.getLocaleUrl = function (subPath, pathLocale) {
                        if (arguments.length <= 1) {
                            pathLocale = subPath;
                            subPath = nonLocaleRoot;
                        }
                        var result = getLocaleUrl(urlParts, req.params, subPath, pathLocale === null || pathLocale === undefined ? locale.id : pathLocale);
                        return options.httpBase + result;
                    };
                    handler(req, res, locale, options);
                });
            });
        }

        function addDomainLocales(mainLocale) {
            var localeDomainMap = {};
            options.locales.forEach(function mapLocale(locale) {
                localeDomainMap[locale.domain] = locale;
                if (util.isArray(locale.aliasDomain)) {
                    locale.aliasDomain.forEach(function (aliasDomain) {
                        localeDomainMap[aliasDomain] = locale;
                    });
                } else if (locale.aliasDomain) {
                    localeDomainMap[locale.aliasDomain] = locale;
                }
            });

            function handleRedirect(req, res) {
                var localeId = res.getLocale(),
                    urlParts = url.parse(req.url),
                    locale,
                    domain,
                    redirectUrl,
                    port = req.port,
                    targetPath = urlParts.pathname.replace(/^\/([a-z\_\$]+)\//, function (targetLocale) {
                        localeId = targetLocale;
                        return "";
                    });

                locale = localeDomainMap[localeId] || mainLocale;
                domain = locale.domain;

                if ((req.protocol === "http" && port.toString() !== "80") ||
                        (req.protocol === "https" && port.toString() !== "443")) {
                    domain += ":" + port;
                }

                redirectUrl = req.protocol + "://" + domain + targetPath;

                res.redirect(redirectUrl);
            }

            app.get(path, function (req, res) {

                var locale = localeDomainMap[req.host];

                if (!locale) {
                    handleRedirect(req, res);
                } else {
                    if (!options.devMode && !res.getHeader('Cache-Control')) {
                        res.setHeader('Cache-Control', 'public, max-age=' + options.maxAge);
                    }
                    options.getLocalePath = options.getLocaleUrl = function (subPath, pathLocale) {
                        if (arguments.length <= 1) {
                            pathLocale = subPath;
                            subPath = req.path;
                        }
                        var targetLocale = localeDomainMap[pathLocale] || mainLocale;
                        return req.protocol + "://" + targetLocale.domain + subPath;
                    };
                    options.domain = req.protocol + "://" + locale.domain;
                    res.setLocale(locale.id);
                    handler(req, res, locale, options);
                }
            });
        }

        if (mainLocale && mainLocale.domain) {
            addDomainLocales(mainLocale);
        } else {
            addPathDomains();
        }
    };
};