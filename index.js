'use strict';

var omniscient = require('omniscient');
var immstruct = require('immstruct');

module.exports = {
  decorator: {
    ignore: require('./decorator/ignore'),
    observer: require('./decorator/observer')
  },
  immstruct: immstruct,
  component: omniscient,
  jsxComponent: omniscient.withDefaults({
    jsx: true
  })
};
