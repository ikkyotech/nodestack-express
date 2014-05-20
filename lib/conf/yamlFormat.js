"use strict";

var jsyaml;

module.exports = {
    parse: function (input) {
        var result;
        if (!jsyaml) {
            jsyaml = require("js-yaml");
        }
        try {
            result = jsyaml.safeLoad(input);
        } catch (e) {
            console.error(e.message);
        }
        return result;
    },
    stringify: function (input) {
        if (!jsyaml) {
            jsyaml = require("js-yaml");
        }
        return jsyaml.safeDump(input);
    }
};