"use strict";

module.exports = function setupSite(dirname, configure) {
    var express = require('express'),
        app = express(),
        nconf = require("nconf"),
        getLocalisedFactory = require("./locale/getLocalisedFactory"),
        getLocalisedRedirectFactory = require("./locale/getLocalisedRedirectFactory"),
        path = require("path"),
        envify = require('envify/custom'),
        caching,
        port,
        crypto = require("crypto");

    nconf = require("./conf/master")(dirname);
    caching = nconf.get('devMode') ? {} : { maxAge: nconf.get('maxAge') * 1000 };
    port = nconf.get('port');

    if (nconf.get('devMode')) {
        process.env.DEBUG = "i18n:*";
    }

    app.getLocalised = getLocalisedFactory(app, nconf.get('domain'), nconf.get('locales'), nconf.get('maxAge'));
    app.getLocaleRedirect = getLocalisedRedirectFactory(app, nconf.get('domain'), nconf.get('locales'));
    app.baseConf = nconf.get();
    app.baseConf.fbLocale = require("./locale/fbLocale");

    app.getPage = require("./locale/getPage")(app);

    app.configure(function () {
        var stylus = require('stylus'),
            nib = require('nib'),
            i18n = require("i18n-yaml"),
            browserify = require('browserify-middleware'),
            yamlSchema = require("./locale/yamlSchema"),
            basicAuth = nconf.get("basicAuth");

        browserify.settings("transform", [envify(app.baseConf)]);
        browserify.settings.mode =  nconf.get("devMode") ? "development" : "production";
        browserify.settings.production.cache = nconf.get('maxAge') * 1000;

        if (!nconf.get("devMode")) {
            app.use(express.compress());
        }

        if (typeof basicAuth === "object") {
            app.use(express.basicAuth(function (user, pass) {
                var userPass = basicAuth[user];
                if (userPass === undefined || userPass === null) {
                    console.warn("Authentication failed for '" + user + "' (not existant)");
                    return false;
                }
                if (typeof userPass !== "object") {
                    userPass = basicAuth[user] = {
                        type: "plain",
                        password: userPass
                    };
                }
                if (userPass.type === "plain") {
                    return userPass.password === pass;
                }
                if (userPass.type === "md5" || userPass.type === "sha1" || userPass.type === "sha256" || userPass.type === "sha512") {
                    return crypto.createHash(userPass.type).update(pass).digest("hex") === userPass.password;
                }
                console.warn("Authentication failed for '" + user + "' (broken user settings)");
                return false;
            }));
        }

        i18n.configure({
            locales: nconf.get('locales').map(function (entry) {
                return entry.id;
            }),
            directory: path.resolve(dirname, 'locales'),
            extension: ".yml",
            schema: yamlSchema(path.resolve(dirname, 'locales')),
            indent: "    ",
            updateFiles: false, //nconf.get('devMode') || false,
            defaultLocale: nconf.get('locales')[0] || "en"
        });

        app.use(i18n.init);
        app.use(express.cookieParser());
        app.use(app.router);

        app.set('view engine', 'jade');
        app.use("/static", express.static(path.resolve(dirname, "static"), caching));
        app.use("/static", express.static(path.resolve(dirname, "common/static"), caching));
        app.use("/css", stylus.middleware({
            src: path.resolve(dirname, "stylus"),
            dest: path.resolve(dirname, "css"),
            compile: function (str, path) {
                var options = this;
                return stylus(str)
                    .set('filename', path)
                    .set('compress', options.compress)
                    .set('firebug', options.firebug)
                    .set('linenos', options.linenos)
                    .use(nib());
            }
        }));
        app.use("/css", express.static(path.resolve(dirname, "css"), caching));
        try {
            app.use("/scripts", browserify(path.resolve(dirname, "scripts/public")));
        } catch (ignore) {}
        try {
            app.use("/scripts", browserify(path.resolve(dirname, "common/scripts/public")));
        } catch (ignore) {}

        configure(app);
    });

    if (port === "443" || nconf.get('https')) {
        console.info("Starting https server at port: " + port + " (ENV:" + nconf.get("ENV") + ")");
        require("https").createServer(nconf.get('https'), app).listen(port);
    } else {
        console.info("Starting http server at port: " + port + " (ENV:" + nconf.get("ENV") + ")");
        require("http").createServer(app).listen(port);
    }
};