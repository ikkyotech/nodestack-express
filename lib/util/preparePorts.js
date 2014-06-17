"use strict";

var util = require("util");

module.exports = function preparePorts(ports) {

    if (!util.isArray(ports)) {
        ports = [ports];
    }

    return ports.map(function (port) {
        if (typeof port === "number") {
            port = port.toString();
        }
        if (typeof port === "string") {
            if (port === "443") {
                port = { https: port };
            } else {
                port = { http: port };
            }
        }
        return port;
    });
};