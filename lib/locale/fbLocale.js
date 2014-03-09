"use strict";

var fblookup = {
        ja: "ja_JP",
        en: "en_US",
        de: "de_DE",
        ru: "ru_RU",
        ro: "ro_RO",
        es: "es_ES",
        fr: "fr_FR",
        ko: "ko_KR",
        id: "id_ID"
    },
    valid = ["af_ZA", "ar_AR", "az_AZ", "be_BY", "bg_BG", "bn_IN", "bs_BA", "ca_ES", "cs_CZ", "cx_PH", "cy_GB", "da_DK", "de_DE", "el_GR", "en_GB", "en_PI", "en_UD", "en_US", "eo_EO", "es_ES", "es_LA", "et_EE", "eu_ES", "fa_IR", "fb_LT", "fi_FI", "fo_FO", "fr_CA", "fr_FR", "fy_NL", "ga_IE", "gl_ES", "gn_PY", "he_IL", "hi_IN", "hr_HR", "hu_HU", "hy_AM", "id_ID", "is_IS", "it_IT", "ja_JP", "ka_GE", "km_KH", "ko_KR", "ku_TR", "la_VA", "lt_LT", "lv_LV", "mk_MK", "ml_IN", "ms_MY", "nb_NO", "ne_NP", "nl_NL", "nn_NO", "pa_IN", "pl_PL", "ps_AF", "pt_BR", "pt_PT", "ro_RO", "ru_RU", "sk_SK", "sl_SI", "sq_AL", "sr_RS", "sv_SE", "sw_KE", "ta_IN", "te_IN", "th_TH", "tl_PH", "tr_TR", "uk_UA", "ur_PK", "vi_VN", "zh_CN", "zh_HK", "zh_TW"];

module.exports = function (locale) {
    locale = fblookup[locale] || locale;
    if (valid.indexOf(locale) !== -1) {
        return locale;
    }
    throw new Error("Locale " + locale + " is not supported by facebook!");
};