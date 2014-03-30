"use strict";

module.exports = function getLocalisedRedirectFactory(app, httpBase, defaultLocales) {
    return function getLocalisedRedirect(path, targetUrl) {
        var redirect = function (req, res) {
            res.redirect(targetUrl);
        };
        app.get(path, redirect);
        defaultLocales.forEach(function eachLocale(locale) {
            var targetPath = "/" + locale.id + path;
            app.get(targetPath, redirect);
        });
    };
};