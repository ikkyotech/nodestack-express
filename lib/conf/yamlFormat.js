"use strict";

var libyaml;

module.exports = {
    parse: function (input) {
        if (!libyaml) {
            libyaml = require("libyaml");
        }
        return libyaml.parse(input)[0];
    },
    stringify: function (input) {
        if (!libyaml) {
            libyaml = require("libyaml");
        }
        return libyaml.stringify(input);
    }
};