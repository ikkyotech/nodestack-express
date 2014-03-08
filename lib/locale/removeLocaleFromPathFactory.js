"use strict";

module.exports = function removeLocaleFromPathFactory(locales) {
    return function removeLocaleFromPath(path) {
        var locale,
            localePath,
            i;
        for (i = locales.length - 1; i >= 0; i -= 1) {
            locale = locales[i];
            localePath = "/" + locale.id;
            if (path.indexOf(localePath) === 0) {
                return path.substring(localePath.length);
            }
        }
        return path;
    };
};