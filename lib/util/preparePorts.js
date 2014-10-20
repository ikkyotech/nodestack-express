"use strict";

var util = require("util");

function createPort(listen, redirect) {
    return {
        listen: listen,
        redirect: redirect || listen
    };
}

function clean(port, type) {
    var listen,
        redirect;
    if (typeof port === "number") {
        port = port.toString();
    }
    if (typeof port === "string") {
        listen = port;
        redirect = port;
    } else if (util.isArray(port)) {
        listen = (port[0] || "80").toString();
        redirect = (port[1] || listen).toString();
    } else if (typeof port === "object") {
        if (port.https) {
            return clean(port.https, "https");
        }
        if (port.http) {
            return clean(port.http, "http");
        }
        listen = (port.listen || "80").toString();
        redirect = (port.redirect || listen).toString();
    }
    if (!type && redirect === "443") {
        type = "https";
    }
    if (type === "https") {
        return { https: createPort(listen, redirect) };
    }
    return { http: createPort(listen, redirect) };
}

module.exports = function preparePorts(ports) {

    if (!util.isArray(ports)) {
        ports = [ports];
    }

    return ports.map(clean);
};