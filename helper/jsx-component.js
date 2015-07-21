'use strict';

var omniscient = require('omniscient');

/**
 * Helper to create components that are always JSX components. Making it easier
 * to use JSX by default.
 *
 * Require the helper by doing:
 *
 * ```js
 * var component = require('omnipotent/helper/jsx-component');
 * // or
 * var component = require('omnipotent').jsxComponent;
 * ```
 *
 * @param {String} displayName Component's display name. Used when debug()'ing and by React
 * @param {Array|Object} mixins React mixins. Object literals with functions, or array of object literals with functions.
 * @param {Function} render Properties that do not trigger update when changed. Can be cursors, object and immutable structures
 *
 * @property {Function} shouldComponentUpdate Get default shouldComponentUpdate
 *
 * @api public
 * @module helper.jsxComponent
 * @returns {Component} React Component
 */
module.exorts = omniscient.withDefaults({
  jsx: true
});
