Omnipotent [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![Gitter][gitter-image]][gitter-url]
=========

Omnipotent is a library combining [Omniscient.js](https://github.com/omniscientjs/omniscient) and [immstruct](https://github.com/omniscientjs/immstruct), for providing opinionated helpers and tools for easier use.

Install `omnipotent` through npm

```shell
$ npm install --save omnipotent
```

## Omniscient

> Omniscient is all about making composable UIs in a functional manner. Having pure, referentially transparent components that gives a simpler static mental model, much like the static HTML - but bringing the views in a more powerful context in a programming language. Views will still be declarative and expressive, but without having to work with clunky and weird DSLs/template engines.

Read more about Omniscient.js in the [repository README](https://github.com/omniscientjs/omniscient) or our [homepage](http://omniscientjs.github.io/).

## Decorators

Decorators are modifiers for functions or components. Without modifying the original target, it extends and creates a new entity which has additional features or different behavior. Read more about decorators in [Reginald Braithwaite book Allongé](https://leanpub.com/javascriptallongesix/read#decorators).

### `ignore(fields : string|Array<string>, component : Component)`

The `ignore` decorator is used to create components which ignore change on
certain property names on props passed to a component.

#### Include

Require the decorator by doing:

```js
var ignore = require('omnipotent/decorator/ignore');
// or
var ignore = require('omnipotent').decorator.ignore;
```

#### Usage

```js
var struct = immstruct({
  hero: 'Natasha Romanoff',
  ignorable: 'Cain Marko'
});

var Title = component('View', ({hero, ignore}) =>
  <h1>{hero.deref()} vs. {ignore.deref()}</h1>);

var IgnoredTitle = ignore('ignorable', Title);

function render() {
  React.render(
    IgnoredTitle({ hero: struct.cursor('hero'), ignore: struct.cursor('ignorable') }),
    document.getElementById('content')
  );
}

render();
struct.on('swap', render);

// Will update
struct.cursor().set('hero', 'Natalia Romanova');
// Will not update
struct.cursor().set('ignorable', 'Juggernaut');
// Will update
struct.cursor().set('hero', 'Black Widow');
```

## Other Helpers

Other helpers are non-catogarized helpers that you can use to ease your development with Omniscient.js and immstruct.

### Component Factory with JSX as default

Many use JSX as default with Omniscient.js. You can create your own module using `withDefaults` on Omniscient with `jsx: true`, but then you'd have to use relative paths or scoped paths in your application. For easier use, you can use omnipotents jsx-defaulted helper.

#### Include

```js
var component = require('omnipotent/helper/jsx-component');
// or
var component = require('omnipotent').jsxComponent;
```

#### Usage

```jsx
var component = require('omnipotent/helper/jsx-component');
var View = component(() => <h1>Hello!</h1>);
React.render(<View />, document.getElementById('content'));
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/Omnipotent
[npm-image]: http://img.shields.io/npm/v/Omnipotent.svg?style=flat

[travis-url]: http://travis-ci.org/omniscientjs/Omnipotent
[travis-image]: http://img.shields.io/travis/omniscientjs/Omnipotent.svg?style=flat

[depstat-url]: https://gemnasium.com/omniscientjs/Omnipotent
[depstat-image]: http://img.shields.io/gemnasium/omniscientjs/Omnipotent.svg?style=flat

[gitter-url]: https://gitter.im/omniscientjs/omniscient?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
