"use strict";

module.exports = function setupSite(dirname, configure) {
    var express = require('express'),
        nconf = require("nconf"),
        getLocalisedFactory = require("./locale/getLocalisedFactory"),
        getLocalisedRedirectFactory = require("./locale/getLocalisedRedirectFactory"),
        path = require("path"),
        envify = require('envify/custom'),
        caching,
        crypto = require("crypto"),
        i18n = require("i18n-yaml"),
        i18nConfig,
        gaze = require("gaze"),
        browserify = require('browserify-middleware'),
        yamlSchema = require("./locale/yamlSchema"),
        basicAuth = nconf.get("basicAuth"),
        basicAuthHandler,
        baseConf,
        preparePorts = require("./util/preparePorts");

    nconf = require("./conf/master")(dirname);
    caching = nconf.get('devMode') ? {} : { maxAge: nconf.get('maxAge') * 1000 };

    if (nconf.get('devMode')) {
        process.env.DEBUG = "i18n:*";
    }

    baseConf = nconf.get();

    browserify.settings("transform", [envify(baseConf)]);
    browserify.settings("cache", !nconf.get("devMode"));
    browserify.settings("precompile", !nconf.get("devMode"));
    browserify.settings.mode =  nconf.get("devMode") ? "development" : "production";
    browserify.settings.production.cache = nconf.get('maxAge') * 1000;

    i18nConfig = {
        locales: nconf.get('locales').map(function (entry) {
            return entry.id;
        }),
        directory: path.resolve(dirname, 'locales'),
        extension: ".yml",
        schema: yamlSchema(path.resolve(dirname, 'locales')),
        indent: "    ",
        updateFiles: false, //nconf.get('devMode') || false,
        defaultLocale: nconf.get('locales')[0] || "en"
    };

    i18n.configure(i18nConfig);

    gaze('**/*', {cwd: i18nConfig.directory}, function () {
        i18n.configure(i18nConfig);
    });

    if (typeof basicAuth === "object") {
        basicAuthHandler = express.basicAuth(function (user, pass) {
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
        });
    }

    function setupApp(portConfig) {
        var app = express(),
            stylus = require('stylus'),
            nib = require('nib');

        if (!nconf.get("devMode")) {
            app.use(express.compress());
        }

        app.getPage = require("./locale/getPage")(app);
        app.getLocalised = getLocalisedFactory(app, nconf.get('domain'), nconf.get('locales'), nconf.get('maxAge'));
        app.getLocaleRedirect = getLocalisedRedirectFactory(app, nconf.get('domain'), nconf.get('locales'));
        app.baseConf = baseConf;
        app.baseConf.fbLocale = require("./locale/fbLocale");
        app.set("x-powered-by", false);

        app.use(function (req, res, next) {
            req.port = portConfig.port;
            next();
            return res;
        });

        if (typeof basicAuth === "object") {
            app.use(basicAuthHandler);
        }

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

        if (typeof configure === "function") {
            configure(app);
        }

        if (portConfig.https) {
            if (!nconf.get('https')) {
                console.warn("Can not start https server at port " + portConfig.https + " (ENV:" + nconf.get("ENV") + ") (missing https certificate)");
            } else {
                console.info("Starting https server at port: " + portConfig.https + " (ENV:" + nconf.get("ENV") + ")");
                require("https").createServer(nconf.get('https'), app).listen(portConfig.https);
            }
        } else {
            console.info("Starting http server at port: " + portConfig.http + " (ENV:" + nconf.get("ENV") + ")");
            require("http").createServer(app).listen(portConfig.http);
        }
    }

    preparePorts(nconf.get('port')).forEach(setupApp);
};