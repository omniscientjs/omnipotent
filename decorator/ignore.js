'use strict';

var React = require('react');
var component = require('omniscient');
var shouldUpdate = require('omniscient/shouldupdate');

/**
 * Decorate a component and define props fields that should be ignored by
 * the should component update. This could be values of complex objects such as
 * eventemitters for communicating throuch a channel with parents, callbacks,
 * csps, etc.
 *
 * Require the decorator by doing:
 * ```js
 * var ignore = require('omnipotent/decorator/ignore');
 * // or
 * var ignore = require('omnipotent').decorator.ignore;
 * ```
 *
 * ### Examples:
 * ```js
 * var struct = immstruct({
 *   hero: 'Natasha Romanoff',
 *   ignorable: 'Cain Marko'
 * });
 *
 * var Title = component('View', ({hero, ignore}) =>
 *   <h1>{hero.deref()} vs. {ignore.deref()}</h1>);
 *
 * var IgnoredTitle = ignore('ignorable', Title);
 *
 * function render() {
 *   React.render(
 *     IgnoredTitle({ hero: struct.cursor('hero'), ignore: struct.cursor('ignorable') }),
 *     document.getElementById('content')
 *   );
 * }
 *
 * render();
 * struct.on('swap', render);
 *
 * // Will update
 * struct.cursor().set('hero', 'Natalia Romanova');
 * // Will not update
 * struct.cursor().set('ignorable', 'Juggernaut');
 * // Will update
 * struct.cursor().set('hero', 'Black Widow');
 * ```
 *
 * @param {String|Array} fields - Property names to ignore on props
 * @param {Component} decoratee - Component to decorate
 *
 * @api public
 * @module decorator.ignore
 * @returns {Component} React Component
 */
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
