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
 * Functions passed on ignored fields are reused when unchanged, keeping the
 * implementations/references cross renders.
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
  var composedDisplayName = 'IgnoredFields' + (Decoratee.displayName || Decoratee.name);

  var extraMethods = {
    shouldComponentUpdate: shouldUpdate.withDefaults({
      isIgnorable: function (item, key) {
        return fields.indexOf(key) !== -1;
      }
    }),

    // Add built-in lifetime methods to keep `statics` up to date.
    componentWillMount: createComponentWillMount(fields),
    componentWillReceiveProps: createComponentWillReceiveProps(fields)
  };

  var IgnoredComponent = component(composedDisplayName, extraMethods, Decoratee);
  return IgnoredComponent;
};

function createComponentWillMount(staticsFields) {
  return function componentWillMount () {
    (staticsFields || []).forEach(function (staticsField) {
      var statics = this.props[staticsField];
      if (statics && typeof statics === 'object') {
        Object.keys(statics).forEach(wrapWithDelegate, statics);
      }
    }, this);
  }
}

function createComponentWillReceiveProps (staticsFields) {
  return function componentWillReceiveProps (newProps) {
    (staticsFields || []).forEach(function (staticsField) {
      var currentStatics = this.props[staticsField];
      var newStatics = newProps[staticsField];
      var haveChangedStatics = newStatics !== currentStatics &&
            newStatics && typeof newStatics === 'object';

      if (!haveChangedStatics) {
        return;
      }

      Object.keys(newStatics).forEach(function (key) {
        var newMember = newStatics[key];
        var currentMember = currentStatics && currentStatics[key];
        var delegee;

        if (typeof (newMember) !== 'function') {
          return;
        }

        if (isDelegate(currentMember)) {
          delegee = isDelegate(newMember) ? newMember.delegee : newMember;
          currentMember.delegee = delegee;
          newStatics[key] = currentMember;
        } else {
          newStatics[key] = delegate(newMember);
        }
      });
    }, this);
  };
}

function delegate(delegee) {
  var delegateFunction = function() {
    return delegateFunction.delegee.apply(this, arguments);
  };

  delegateFunction.delegee = delegee;
  delegateFunction.isDelegate = true;
  return delegateFunction;
}

function wrapWithDelegate (key) {
  var statics = this;
  var delegee = statics[key];
  if (typeof delegee === 'function') {
    statics[key] = isDelegate(delegee) ? delegee : delegate(delegee);
  }
}

function isDelegate (value) {
  return value && value.isDelegate;
}

function arrify (prop) {
  if (Array.isArray(prop)) return prop;
  return [prop];
}
