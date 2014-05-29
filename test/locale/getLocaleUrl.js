"use strict";

var Lab = require("lab"),
    expect = Lab.expect,
    getLocaleUrl = require("../../lib/locale/getLocaleUrl"),
    url = require("url");

Lab.test("Getting a proper locale url", function (done) {
    var parts = url.parse("http://google.com:8080/monster"),
        result = getLocaleUrl(parts, null, "/money", "de");
    expect(result).to.equal("http://google.com:8080/de/money");
    expect(parts.pathname).to.equal("/monster");
    done();
});

Lab.test("Getting non-locale url by passing ''", function (done) {
    var parts = url.parse("http://google.com:8080/de/monster"),
        result = getLocaleUrl(parts, null, "/money", "");
    expect(result).to.equal("http://google.com:8080/money");
    expect(parts.pathname).to.equal("/de/monster");
    done();
});

Lab.test("Param test", function (done) {
    var parts = url.parse("http://google.com:8080/de/monster/alice/profile"),
        result = getLocaleUrl(parts, {name: 'alice', action: 'profile'}, "/money/:name/:action", "");
    expect(result).to.equal("http://google.com:8080/money/alice/profile");
    expect(parts.pathname).to.equal("/de/monster/alice/profile");
    done();
});