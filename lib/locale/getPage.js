"use strict";

function renderTemplate(template) {
    /*jslint unparam: true*/
    function doRender(req, res, locale, options) {
        res.render(template, options);
    }
    /*jslint unparam: false*/
    return doRender;
}

module.exports = function (app) {
    var lodash = require("lodash");
    return function (path, template, options) {
        if (options === null || options === undefined) {
            options = app.baseConf;
        } else {
            lodash.defaults(options, app.baseConf);
        }
        app.getLocalised(path, renderTemplate(template), options);
    };
};