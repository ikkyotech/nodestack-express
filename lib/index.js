"use strict";

function renderTemplate(template) {
    /*jslint unparam: true*/
    function doRender(req, res, locale, options) {
        res.render(template, options);
    }
    /*jslint unparam: false*/
    return doRender;
}

function addFileFormat(nconf, name, fileBase, format, parser) {
    nconf.add(name + "_" + format, {
        type: "file",
        file: fileBase + format,
        format: parser
    });
}


var libyaml = require("libyaml"),
    yamlParser = {parse: function (input) {
        return libyaml.parse(input)[0];
    }, stringify: function (input) {
        return libyaml.stringify(input);
    }};

function addFileConfig(nconf, name, fileBase) {
    addFileFormat(nconf, name, fileBase, "json", nconf.formats.json);
    addFileFormat(nconf, name, fileBase, "ini", nconf.formats.ini);
    addFileFormat(nconf, name, fileBase, "yaml", yamlParser);
}

module.exports = function setupSite(dirname, configure) {
    var express = require('express'),
        app = express(),
        nconf = require("nconf"),
        getLocalisedFactory = require("./locale/getLocalisedFactory.js"),
        path = require("path"),
        lodash = require("lodash"),
        env;

    nconf.env(["ENV"])
        .argv({
            "env": {
                alias: "ENV",
                demand: false
            }
        }).defaults({
            "ENV": "dev"
        });

    env = nconf.get("ENV");

    addFileConfig(nconf, "common", path.resolve(dirname, "config."));
    addFileConfig(nconf, "env", path.resolve(dirname, "config." + env + "."));
    nconf.add("optional", {
        type: "literal",
        store: {
            locales: [{id: "en", name: "English"}],
            "PORT": 8080,
            "httpBase": "http://localhost:8080"
        }
    });

    app.getLocalised = getLocalisedFactory(app, nconf.get('httpBase'), nconf.get('locales'));

    app.baseConf = nconf.get();
    app.baseConf.fbLocale = function (locale) {
        var fblookup = {
                ja: "ja_JP",
                en: "en_US",
                de: "de_DE",
                ru: "ru_RU",
                ro: "ro_RO",
                es: "es_ES",
                fr: "fr_FR",
                ko: "ko_KR",
                id: "id_ID"
            },
            valid = ["af_ZA", "ar_AR", "az_AZ", "be_BY", "bg_BG", "bn_IN", "bs_BA", "ca_ES", "cs_CZ", "cx_PH", "cy_GB", "da_DK", "de_DE", "el_GR", "en_GB", "en_PI", "en_UD", "en_US", "eo_EO", "es_ES", "es_LA", "et_EE", "eu_ES", "fa_IR", "fb_LT", "fi_FI", "fo_FO", "fr_CA", "fr_FR", "fy_NL", "ga_IE", "gl_ES", "gn_PY", "he_IL", "hi_IN", "hr_HR", "hu_HU", "hy_AM", "id_ID", "is_IS", "it_IT", "ja_JP", "ka_GE", "km_KH", "ko_KR", "ku_TR", "la_VA", "lt_LT", "lv_LV", "mk_MK", "ml_IN", "ms_MY", "nb_NO", "ne_NP", "nl_NL", "nn_NO", "pa_IN", "pl_PL", "ps_AF", "pt_BR", "pt_PT", "ro_RO", "ru_RU", "sk_SK", "sl_SI", "sq_AL", "sr_RS", "sv_SE", "sw_KE", "ta_IN", "te_IN", "th_TH", "tl_PH", "tr_TR", "uk_UA", "ur_PK", "vi_VN", "zh_CN", "zh_HK", "zh_TW"];
        locale = fblookup[locale] || locale;
        if (valid.indexOf(locale) !== -1) {
            return locale;
        }
        throw new Error("Locale " + locale + " is not supported by facebook!");
    };

    console.info(app.baseConf);

    app.getPage = function (path, template, options) {
        if (options === null || options === undefined) {
            options = app.baseConf;
        } else {
            lodash.defaults(options, app.baseConf);
        }
        app.getLocalised(path, renderTemplate(template), options);
    };

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

    console.info("Starting server at port: " + nconf.get("PORT") + " (ENV:" + env + ")");
    app.listen(nconf.get("PORT"));
};