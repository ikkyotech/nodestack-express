"use strict";

module.exports = function (dirname) {
    var nconf = require("nconf"),
        addFileConfig = require("./addFileConfig"),
        path = require("path"),
        env,
        https;
    nconf.env(["ENV", "PORT", "DOMAIN", "HTTPS_KEY", "HTTPS_CERT"])
        .argv({
            "env": {
                alias: "ENV",
                demand: false
            },
            "NODE_ENV": {
                alias: "ENV",
                demand: false
            },
            "port": {
                alias: "PORT",
                demand: false
            },
            "domain": {
                alias: "DOMAIN",
                demand: false
            },
            "httpsKey": {
                alias: "HTTPS_KEY",
                demand: false
            },
            "httpsCert": {
                alias: "HTTPS_CERT",
                demand: false
            }
        }).defaults({
            "ENV": "dev"
        });

    env = nconf.get("ENV");

    addFileConfig(nconf, "common", path.resolve(dirname, "config."));
    addFileConfig(nconf, "env", path.resolve(dirname, "config." + env + "."));

    https = false;

    if (nconf.get("HTTPS_CERT") && nconf.get("HTTPS_KEY")) {
        https = {
            key: nconf.get("HTTPS_KEY"),
            cert: nconf.get("HTTPS_CERT")
        };
    }

    return nconf.add("optional", {
        type: "literal",
        store: {
            locales: [{id: "en", name: "English"}],
            port: nconf.get("PORT") || 8080,
            domain: nconf.get("DOMAIN") || "http://localhost:8080",
            https: https,
            maxAge: 300,
            devMode: true
        }
    });
};