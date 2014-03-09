"use strict";

module.exports = function setupSite(dirname, configure) {
    var express = require('express'),
        app = express(),
        nconf = require("nconf"),
        getLocalisedFactory = require("./locale/getLocalisedFactory.js"),
        path = require("path");

    nconf = require("./conf/master")(dirname);

    app.getLocalised = getLocalisedFactory(app, nconf.get('httpBase'), nconf.get('locales'));
    app.baseConf = nconf.get();
    app.baseConf.fbLocale = require("./locale/fbLocale");

    app.getPage = require("./locale/getPage")(app);

    app.configure(function () {
        var stylus = require('stylus'),
            i18n = require("i18n-2"),
            browserify = require('browserify-middleware');

        i18n.expressBind(app, {
            locales: nconf.get('locales').map(function (entry) {
                return entry.id;
            }),
            directory: path.resolve(dirname, 'locales'),
            cookieName: "locale",
            devMode: nconf.get('devMode')
        });

        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);

        app.set('view engine', 'jade');
        app.use("/static", express.static(path.resolve(dirname, "static")));
        app.use("/stylus", stylus.middleware({src: path.resolve(dirname, "stylus")}));
        app.use("/stylus", express.static(path.resolve(dirname, "stylus")));
        app.use("/scripts", browserify(path.resolve(dirname, "scripts/public")));

        app.getPage('/', 'home');

        configure(app);
    });

    console.info("Starting server at port: " + nconf.get("PORT") + " (ENV:" + nconf.get("ENV") + ")");
    app.listen(nconf.get("PORT"));
};