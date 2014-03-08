# About

This is a simple nodejs-express site system that standardizes configuration for the specific use of express for simple, localised homepages that only use nodejs technologies.

It presets browserify, jade and stylus so you just need to create those folders and you are good to go.

It also set's up a locale system that should allow you to have a localised system setup in a jiffy!

## Setup

Install this to your new project with 

```
$ npm i nodestack-express --save
```

Then setup your server.js with

```
"use strict";

var site = require('nodestack-express');

site(__dirname, {
    locales: [
        {id: 'en', name:'English'},
        {id: 'de', name:'Deutsch'},
        {id: 'ja', name:'日本語'}
    ],
    configure: function (app) {
        app.getLocalised('/subpage', function(req, res, localeId, options) {
    		// localeId ... en, de or ja
    		// options .... Options with i18n settings added (will use the options object from the next line if given)
        }, options);
        app.getPage('/subpage', 'view', {me: true}); // Automatically renders a localised view
    }
});
```

## Configuration

The system differnciates between configurations for various environments. The default environment is "dev". You have to make sure that there is a config.dev.json in your project root from which it can load the development configuration. If you want to support different environments all you need to do is add another config.x.json file in your root.

You can change environments by either setting the environment variable "ENV" to something different, by defining a argument when starting the server like:

```
$ node server.js --env=prod
```