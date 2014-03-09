"use strict";

module.exports = function (dirname) {
    var nconf = require("nconf"),
        addFileConfig = require("./addFileConfig"),
        path = require("path"),
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
};