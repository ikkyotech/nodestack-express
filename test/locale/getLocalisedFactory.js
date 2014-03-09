"use strict";

var Lab = require("lab"),
    expect = Lab.expect,
    getLocalisedFactory = require("../../lib/locale/getLocalisedFactory"),
    mock = require("nodemock"),
    url = require("url"),
    LOCALES = [
        {id: 'en', name: 'English'},
        {id: 'de', name: 'Deutsch'},
        {id: 'ja', name: '日本語'}
    ];

function testRootHandler(location, handler) {
    var req = {},
        i18n = mock.mock("setLocaleFromCookie").takes(req)
                   .mock("getLocale").returns("de"),
        res = mock.mock("writeHead").takes(302, {'Location': '/de' + location})
                  .mock('cookie').takes('locale', 'de', { path: '/', maxAge: 36000000, httpOnly: true })
                  .mock("end");
    req.url = location;
    req.i18n = i18n;
    handler(req, res);
    i18n.assert();
    res.assert();
}

function testLocaleHandler(location, locale, handler) {
    var req = {},
        i18n = mock.mock("setLocale").takes(locale),
        res = mock.mock('cookie').takes('locale', locale, { path: '/', maxAge: 36000000, httpOnly: true })
            .mock('render').takesF(function (view, options) {
                if (view === "foo") {
                    expect(options.foo).to.equal("bar");
                    expect(options.locales).to.deep.equal(LOCALES);
                    expect(options.i18n).to.equal(i18n);
                    expect(options.getLocalePath("de")).to.equal("/de/test");
                    expect(options.getLocalePath("")).to.equal("/test");
                    expect(options.getLocalePath("/test", null)).to.equal("/" + locale + "/test");
                    expect(options.getLocalePath("/", "de")).to.equal("/de/");
                    expect(options.getLocaleUrl("de")).to.equal("http://localhost:8080/de/test");
                    expect(options.getLocaleUrl("/", "de")).to.equal("http://localhost:8080/de/");
                    expect(options.getLocaleUrl("")).to.equal("http://localhost:8080/test");
                    expect(options.getLocaleUrl("/test", null)).to.equal("http://localhost:8080/" + locale + "/test");
                    return true;
                }
                return false;
            });
    req.url = location;
    req.i18n = i18n;
    handler(req, res);
    i18n.assert();
    res.assert();
}

Lab.test("Getting a proper locale url", function (done) {
    var mockApp = mock.mock("get").takesF(function (location, handler) {
            var isRootUrl = "/test" === location,
                subUrlParts = /^\/(en|de|ja)\/test$/.exec(location);

            if (isRootUrl) {
                testRootHandler(location, handler);
            } else if (subUrlParts) {
                testLocaleHandler(location, subUrlParts[1], handler);
            } else {
                return false;
            }
            return true;
        }).returns(null).times(4),
        getLocalised = getLocalisedFactory(mockApp, "http://localhost:8080", LOCALES);

    /*jslint unparam: true*/
    getLocalised("/test", function (req, res, locale, options) {
        res.render("foo", options);
    }, {"foo": "bar"});
    /*jslint unparam: false*/

    mockApp.assert();
    done();
});