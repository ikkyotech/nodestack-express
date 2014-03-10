"use strict";

function addFileFormat(nconf, name, fileBase, format, parser) {
    nconf.add(name + "_" + format, {
        type: "file",
        file: fileBase + format,
        format: parser
    });
}

module.exports = function addFileConfig(nconf, name, fileBase) {
    addFileFormat(nconf, name, fileBase, "json", nconf.formats.json);
    addFileFormat(nconf, name, fileBase, "ini", nconf.formats.ini);
    addFileFormat(nconf, name, fileBase, "yml", require("./yamlFormat.js"));
};