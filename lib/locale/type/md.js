'use strict';


var Type = require('js-yaml/lib/js-yaml/type'),
    marked = require('marked');

function toMarkdown(html) {
    var result;
    try {
        result = require('to-markdown').toMarkdown(html);
    } catch (e) {
        result = e.stack;
    }
    return result;
}


function toHTML(state) {
    try {
        state.result = marked(state.result);
    } catch (e) {
        state.result = e.stack;
    }
    return true;
}

module.exports = new Type('tag:yaml.org,2002:md', {
    loadKind: 'scalar',
    loadResolver: toHTML,
    dumpRepresenter: toMarkdown
});