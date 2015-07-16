'use strict';

var React = require('react');
var component = require('omniscient');
var assign = require('lodash.assign');

module.exports = function observer (structure, fields, Decoratee) {
  var isJSX = !Decoratee.jsx;
  var composedDisplayName = 'Observer' +
    (isJSX ? Decoratee.displayName : Decoratee.jsx.displayName);

  var unobservers = [], references = {};
  var extraMethods = {
    componentWillMount: function () {
      var reference, comp = this;
      var update = function () { comp.forceUpdate(); };

      for(var name in fields) {
        if (!fields.hasOwnProperty(name)) continue;
        reference = structure.reference(fields[name]);
        references[name] = reference;

        unobservers = unobservers.concat(reference.observe(update));
      }
    },

    componentWillUnmount: function () {
      unsubscribers.forEach(invoke);
      unobservers = [];
      references = {};
    }
  };

  var IgnoredComponent = component(composedDisplayName, extraMethods, function (props) {
    var extendingProps = {};
    for(var name in references) {
      if (!references.hasOwnProperty(name)) continue;
      extendingProps[name] = references[name].cursor();
    }
    var newProps = assign({}, props, extendingProps);
    return isJSX ? React.createElement(Decoratee, newProps) : Decoratee(newProps);
  });

  return isJSX ? IgnoredComponent.jsx : IgnoredComponent;
};

function invoke (fn) {
  return fn();
}
