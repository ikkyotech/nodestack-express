"use strict";

var Schema = require("js-yaml/lib/js-yaml/schema.js");

module.exports = function (directory) {
    return new Schema({
        include: [
            require("js-yaml/lib/js-yaml/schema/default_full")
        ],
        explicit: [
            require('./type/md'),
            require('./type/import')(directory)
        ]
    });
};