
### `decorator.ignore(fields, decoratee)`

Decorate a component and define props fields that should be ignored by
the should component update. This could be values of complex objects such as
eventemitters for communicating throuch a channel with parents, callbacks,
csps, etc.

Functions passed on ignored fields are reused when unchanged, keeping the
implementations/references cross renders.

Require the decorator by doing:
```js
var ignore = require('omnipotent/decorator/ignore');
// or
var ignore = require('omnipotent').decorator.ignore;
```

### Examples:
```js
var struct = immstruct({
  hero: 'Natasha Romanoff',
  ignorable: 'Cain Marko'
});

var Title = component('View', ({hero, ignore}) =>
  {hero.deref()} vs. {ignore.deref()});

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


### Parameters

| param       | type         | description                         |
| ----------- | ------------ | ----------------------------------- |
| `fields`    | String,Array | - Property names to ignore on props |
| `decoratee` | Component    | - Component to decorate             |



**Returns** `Component`, React Component


### `decorator.observer(structure, fields, decoratee)`

The `observer` decorator is a very useful one if you need horizontal data
dependencies. If you require one of your components to get injected data
automatically and update everytime that data changes.

Fields passed to observer should be defined as the following:
```js
{
  namePassedAsProps: ['nested', 'key', 'path'],
  anotherNamePassedAsProps: 'shallowKeyPath'
}
```

Require the decorator by doing:

```js
var observer = require('omnipotent/decorator/observer');
// or
var observer = require('omnipotent').decorator.observer;
```

### Examples:
```jsx
var structure = immstruct({ hero { name: 'Natalia Romanova' } });

var Title = component('View', ({hero}) => {name.deref()});

var ObservedTitle = observer(structure, {
  hero: ['hero', 'name'] // key path in structure
}, Title);

render(ObservedTitle({}));

// Update structure and component
structure.cursor('hero').set('name', 'Black Widow');

// Also for things like async fetch
fetch('./hero.json')
  .then(r => r.json())
  .then(d => structure.cursor().set('hero', Immutable.Map(d));
```


### Parameters

| param       | type                                             | description                                       |
| ----------- | ------------------------------------------------ | ------------------------------------------------- |
| `structure` | ImmstructStructure                               | - Immstruct Structure to get references from      |
| `fields`    | { name: <code>string</code>/<code>Array</code> } | - Object mapping of names and key paths to inject |
| `decoratee` | Component                                        | - Component to decorate                           |



**Returns** `Component`, React Component


### `helper.jsxComponent(displayName, mixins, render)`

Helper to create components that are always JSX components. Making it easier
to use JSX by default.

Require the helper by doing:

```js
var component = require('omnipotent/helper/jsx-component');
// or
var component = require('omnipotent').jsxComponent;
```


### Parameters

| param         | type         | description                                                                                          |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `displayName` | String       | Component's display name. Used when debug()'ing and by React                                         |
| `mixins`      | Array,Object | React mixins. Object literals with functions, or array of object literals with functions.            |
| `render`      | Function     | Properties that do not trigger update when changed. Can be cursors, object and immutable structures  |


### Properties

| property                | type     | description                        |
| ----------------------- | -------- | ---------------------------------- |
| `shouldComponentUpdate` | Function | Get default shouldComponentUpdate  |



**Returns** `Component`, React Component

## Private members 


