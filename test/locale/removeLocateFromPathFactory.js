"use strict";

var Lab = require("lab"),
    expect = Lab.expect,
    removeLocaleFromPathFactory = require("../../lib/locale/removeLocaleFromPathFactory");

Lab.test("Trying to remove a locale prefix from the url", function (done) {
    var removeLocaleFromPath = removeLocaleFromPathFactory([{id: "en"}, {id: "de"}]);
    expect(removeLocaleFromPath("/")).to.equal("/");
    expect(removeLocaleFromPath("/de/")).to.equal("/");
    expect(removeLocaleFromPath("/de/test")).to.equal("/test");
    expect(removeLocaleFromPath("/test")).to.equal("/test");
    done();
});