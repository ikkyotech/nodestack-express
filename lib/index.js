"use strict";

function renderTemplate(template) {
    /*jslint unparam: true*/
    function doRender(req, res, locale, options) {
        res.render(template, options);
    }
    /*jslint unparam: false*/
    return doRender;
}

module.exports = function setupSite(dirname, options) {
    var express = require('express'),
        app = express(),
        nconf = require("nconf"),
        getLocalisedFactory = require("./locale/getLocalisedFactory.js"),
        path = require("path"),
        PORT,
        LOCALES = options.locales || [{en: "English"}];

    nconf.env(["ENV"]).argv({
        "env": {
            alias: "ENV",
            demand: false
        }
    }).defaults({"ENV": "dev"}).file({
        file: path.resolve(dirname, "config." + nconf.get("ENV") + ".json")
    });

    PORT = nconf.get("PORT");
    app.getLocalised = getLocalisedFactory(app, LOCALES);

    app.getPage = function (path, template, options) {
        app.getLocalised(path, renderTemplate(template), options);
    };

    app.configure(function () {
        var stylus = require('stylus'),
            i18n = require("i18n-2"),
            browserify = require('browserify-middleware');

        i18n.expressBind(app, {
            locales: LOCALES.map(function (entry) {
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

        options.configure(app);
    });
    console.info("Starting server at port: " + PORT + " (ENV:" + nconf.get("ENV") + ")");
    app.listen(PORT);
};