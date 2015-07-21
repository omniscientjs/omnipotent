'use strict';

var React = require('react');
var component = require('omniscient');
var assign = require('lodash.assign');

module.exports = function observer (structure, fields, Decoratee) {
  var isJSX = !Decoratee.jsx;
  var unobservers = [];

  var composedDisplayName = 'Observer' +
    (isJSX ? Decoratee.displayName : Decoratee.jsx.displayName);

  var references = Object.keys(fields).reduce(function (refs, name) {
    var reference = structure.reference(fields[name]);
    refs[name] = reference;

    return refs;
  }, {});

  var extraMethods = {
    componentDidMount: function () {
      var reference, comp = this;
      var update = function () { comp.forceUpdate(); };
      unobservers = Object.keys(references).map(function (name) {
        return references[name].observe(update);
      });
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
