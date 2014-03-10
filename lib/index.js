"use strict";

module.exports = function setupSite(dirname, configure) {
    var express = require('express'),
        app = express(),
        nconf = require("nconf"),
        getLocalisedFactory = require("./locale/getLocalisedFactory.js"),
        path = require("path"),
        caching;

    nconf = require("./conf/master")(dirname);
    caching = nconf.get('devMode') ? {} : { maxAge: nconf.get('maxAge') * 1000 };

    app.getLocalised = getLocalisedFactory(app, nconf.get('httpBase'), nconf.get('locales'), nconf.get('maxAge'));
    app.baseConf = nconf.get();
    app.baseConf.fbLocale = require("./locale/fbLocale");

    app.getPage = require("./locale/getPage")(app);

    app.configure(function () {
        var stylus = require('stylus'),
            i18n = require("i18n-yaml"),
            browserify = require('browserify-middleware');

        browserify.settings.mode =  nconf.get("devMode") ? "development" : "production";
        browserify.settings.production.cache = nconf.get('maxAge') * 1000;

        if (!nconf.get("devMode")) {
            app.use(express.compress());
        }

        i18n.configure({
            locales: nconf.get('locales').map(function (entry) {
                return entry.id;
            }),
            directory: path.resolve(dirname, 'locales'),
            cookieName: "locale",
            extension: ".yml",
            indent: "    ",
            updateFiles: nconf.get('devMode') || false,
            defaultLocale: nconf.get('locales')[0] || "en"
        });

        app.use(i18n.init);
        /*jslint unparam: true*/
        app.use(function (req, res, next) {
            req.i18n = i18n;
            next();
        });
        /*jslint unparam: false*/
        app.use(express.cookieParser());
        app.use(app.router);

        app.set('view engine', 'jade');
        app.use("/static", express.static(path.resolve(dirname, "static"), caching));
        app.use("/css", stylus.middleware({src: path.resolve(dirname, "stylus"), dest: path.resolve(dirname, "css")}));
        app.use("/css", express.static(path.resolve(dirname, "css"), caching));
        app.use("/scripts", browserify(path.resolve(dirname, "scripts/public")));

        configure(app);
    });

    console.info("Starting server at port: " + nconf.get("PORT") + " (ENV:" + nconf.get("ENV") + ")");
    app.listen(nconf.get("PORT"));
};