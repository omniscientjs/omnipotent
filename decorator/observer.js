'use strict';

var React = require('react');
var component = require('omniscient');
var assign = require('lodash.assign');


/**
 * The `observer` decorator is a very useful one if you need horizontal data
 * dependencies. If you require one of your components to get injected data
 * automatically and update everytime that data changes.
 *
 * Fields passed to observer should be defined as the following:
 * ```js
 * {
 *   namePassedAsProps: ['nested', 'key', 'path'],
 *   anotherNamePassedAsProps: 'shallowKeyPath'
 * }
 * ```
 *
 * Require the decorator by doing:
 *
 * ```js
 * var observer = require('omnipotent/decorator/observer');
 * // or
 * var observer = require('omnipotent').decorator.observer;
 * ```
 *
 * ### Examples:
 * ```jsx
 * var structure = immstruct({ hero { name: 'Natalia Romanova' } });
 *
 * var Title = component('View', ({hero}) => <h1>{name.deref()}</h1>);
 *
 * var ObservedTitle = observer(structure, {
 *   hero: ['hero', 'name'] // key path in structure
 * }, Title);
 *
 * render(ObservedTitle({}));
 *
 * // Update structure and component
 * structure.cursor('hero').set('name', 'Black Widow');
 *
 * // Also for things like async fetch
 * fetch('./hero.json')
 *   .then(r => r.json())
 *   .then(d => structure.cursor().set('hero', Immutable.Map(d));
 * ```
 *
 * @param {ImmstructStructure} structure - Immstruct Structure to get references from
 * @param {{ name : string|Array }} fields - Object mapping of names and key paths to inject
 * @param {Component} decoratee - Component to decorate
 *
 * @api public
 * @module decorator.observer
 * @returns {Component} React Component
 */
module.exports = function observer (structure, fields, Decoratee) {
  var unobservers = [];

  var composedDisplayName = 'Observer' + (Decoratee.displayName || Decoratee.name);

  var references = Object.keys(fields).reduce(function (refs, name) {
    var reference = structure.reference(fields[name]);
    refs[name] = reference;

    return refs;
  }, {});

  var extraMethods = {
    componentWillMount: function () {
      var reference, comp = this;
      var update = function () { comp.forceUpdate(); };
      unobservers = Object.keys(references).map(function (name) {
        return references[name].observe(update);
      });
    },

    componentWillUnmount: function () {
      unobservers.forEach(invoke);
      unobservers = [];
    }
  };

  var ObservedComponent = component(composedDisplayName, extraMethods, function (props) {
    var extendingProps = {};
    for(var name in references) {
      if (!references.hasOwnProperty(name)) continue;
      extendingProps[name] = references[name].cursor();
    }
    var newProps = assign({}, props, extendingProps);
    return Decoratee(newProps);
  });

  return ObservedComponent;
};

function invoke (fn) {
  return fn();
}
