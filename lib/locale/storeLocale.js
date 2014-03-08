"use strict";

function storeLocale(res, locale) {
    res.cookie('locale', locale, { path: '/', maxAge: 36000000, httpOnly: true });
}

module.exports = storeLocale;