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
    var req = {
            url: location,
            headers: {
                'accept-language': "en"
            }
        },
        res = mock.mock("redirect").takes('/de' + location)
                .mock("getLocale").returns("de");
    handler(req, res);
    res.assert();
}

function testCookieRootHandler(location, handler) {
    var req = {
            cookies: {
                'locale': "en"
            }
        },
        res = mock.mock("redirect").takes('/de' + location)
                    .mock("getLocale").returns("de").times(2)
                    .mock("setLocale").takes("en");
    req.url = location;
    handler(req, res);
    res.assert();
}

function testLocaleHandler(location, locale, handler) {
    var req = {},
        res = mock.mock("setLocale").takes(locale)
            .mock('cookie').takes('locale', locale, { path: '/', maxAge: 36000000, httpOnly: true })
            .mock('getHeader').takes('Cache-Control').returns(null).times(4)
            .mock('setHeader').takes('Cache-Control', 'public, max-age=300').times(4)
            .mock('render').takesF(function (view, options) {
                if (view === "foo") {
                    expect(options.foo).to.equal("bar");
                    expect(options.locales).to.deep.equal(LOCALES);
                    expect(options.getLocalePath("de")).to.match(/^\/de\/test\/?$/);
                    expect(options.getLocalePath("")).to.match(/^\/test\/?$/);
                    expect(options.getLocalePath("/test", null)).to.match(/^\/(de|en|ja)\/test\/?$/);
                    expect(options.getLocalePath("/", "de")).to.equal("/de/");
                    expect(options.getLocaleUrl("de")).to.match(/^http\:\/\/localhost\:8080\/de\/test\/?$/);
                    expect(options.getLocaleUrl("/", "de")).to.equal("http://localhost:8080/de/");
                    expect(options.getLocaleUrl("")).to.match(/^http\:\/\/localhost\:8080\/test\/?$/);
                    expect(options.getLocaleUrl("/test", null)).to.equal("http://localhost:8080/" + locale + "/test");
                    return true;
                }
                return false;
            });
    req.url = location;
    handler(req, res);
    res.assert();
}

function testRedirectHandler(location, handler) {
    var req = {},
        res = mock.mock("redirect").takesF(function (location) {
            expect(/^\/(en|de|ja)\/test\/$/.test(location)).to.equals(true);
            return true;
        });

    req.url = location;
    handler(req, res);
    res.assert();
}

Lab.test("Getting a proper locale url", function (done) {
    var mockApp = mock.mock("get").takesF(function (location, handler) {
            var isRootUrl = /^\/test\/?$/.test(location),
                isRedirectUrl = /^\/(en|de|ja)\/test$/.test(location),
                subUrlParts = /^\/(en|de|ja)\/test\/$/.exec(location);

            if (isRedirectUrl) {
                testRedirectHandler(location, handler);
            } else if (isRootUrl) {
                testRootHandler(location, handler);
                testCookieRootHandler(location, handler);
            } else if (subUrlParts) {
                testLocaleHandler(location, subUrlParts[1], handler);
            } else {
                return false;
            }
            return true;
        }).returns(null).times(7),
        getLocalised = getLocalisedFactory(mockApp, "http://localhost:8080", LOCALES);

    /*jslint unparam: true*/
    getLocalised("/test/", function (req, res, locale, options) {
        res.render("foo", options);
    }, {"foo": "bar"});
    /*jslint unparam: false*/

    mockApp.assert();
    done();
});

Lab.test("Getting a proper locale url", function (done) {
    var mockApp = mock.mock("get").takesF(function (location, handler) {
            var isRootUrl = /^\/test\/?$/.test(location),
                subUrlParts = /^\/(en|de|ja)\/test$/.exec(location);

            if (isRootUrl) {
                testRootHandler(location, handler);
                testCookieRootHandler(location, handler);
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