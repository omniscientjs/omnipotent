'use strict';

var omniscient = require('omniscient');
var immstruct = require('omniscient');

module.exports = {
  decorator: {
    ignore: require('./decorator/ignore')
  },
  immstruct: immstruct,
  component: omniscient,
  jsxComponent: omniscient.withDefaults({
    jsx: true
  })
};
