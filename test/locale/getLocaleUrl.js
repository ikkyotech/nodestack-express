"use strict";

var Lab = require("lab"),
    expect = Lab.expect,
    getLocaleUrl = require("../../lib/locale/getLocaleUrl"),
    url = require("url");

Lab.test("Getting a proper locale url", function (done) {
    var parts = url.parse("http://google.com:8080/monster"),
        result = getLocaleUrl(parts, "/money", "de");
    expect(result).to.equal("http://google.com:8080/de/money");
    expect(parts.pathname).to.equal("/monster");
    done();
});