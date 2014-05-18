"use strict";

var Schema = require("js-yaml/lib/js-yaml/schema.js");

module.exports = function (directory) {
    var importer = require('./type/import')(directory),
        schema = new Schema({
            include: [
                require("js-yaml/lib/js-yaml/schema/default_full")
            ],
            explicit: [
                require('./type/md'),
                importer
            ]
        });
    importer.schema = schema;
    return schema;
};