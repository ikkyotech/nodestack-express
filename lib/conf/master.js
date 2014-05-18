"use strict";

module.exports = function (dirname) {
    var nconf = require("nconf"),
        addFileConfig = require("./addFileConfig"),
        path = require("path"),
        env;
    nconf.env(["ENV", "PORT", "DOMAIN"])
        .argv({
            "env": {
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
            }
        }).defaults({
            "ENV": "dev"
        });

    env = nconf.get("ENV");

    addFileConfig(nconf, "common", path.resolve(dirname, "config."));
    addFileConfig(nconf, "env", path.resolve(dirname, "config." + env + "."));

    return nconf.add("optional", {
        type: "literal",
        store: {
            locales: [{id: "en", name: "English"}],
            port: nconf.get("PORT") || 8080,
            domain: nconf.get("DOMAIN") || "http://localhost:8080",
            https: false,
            maxAge: 300,
            devMode: true
        }
    });
};