'use strict';

var React = require('react');
var component = require('omniscient');
var shouldUpdate = require('omniscient/shouldupdate');

module.exports = function (fields, Decoratee) {
  fields = arrify(fields);
  var isJSX = !Decoratee.jsx;
  var composedDisplayName = 'IgnoredFields' +
    (isJSX ? Decoratee.displayName : Decoratee.jsx.displayName);

  var extraMethods = {
    shouldComponentUpdate: shouldUpdate.withDefaults({
      isIgnorable: function (item, key) {
        return fields.indexOf(key) !== -1;
      }
    })
  };

  var IgnoredComponent = component(composedDisplayName, extraMethods, function (props) {
    return isJSX ? React.createElement(Decoratee, props) : Decoratee(props);
  });

  return isJSX ? IgnoredComponent.jsx : IgnoredComponent;
};

function arrify (prop) {
  if (Array.isArray(prop)) return prop;
  return [prop];
}
