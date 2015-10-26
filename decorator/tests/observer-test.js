var chai = require('chai');
var jsdom = require('jsdom');

var immstruct = require('immstruct');
var component = require('omniscient');

var React  = require('react');
var ReactDOM  = require('react-dom');

var should = chai.should();

var observer = require('../observer');

describe('observer', function () {

  it('should listen to reference specified by single string value', function () {
    var structure = immstruct({
      value: 'foo'
    });

    var rendered = 0;
    var Component = observer(structure, {
      value: 'value'
    }, component(function (input) {
      rendered++;
      return React.DOM.text(null, 'Rendered ' + rendered + ' times');
    }));

    render(Component({}));
    rendered.should.equal(1);
    structure.cursor().set('value', 'bar');
    rendered.should.equal(2);
    structure.cursor().set('value', 'baz');
    rendered.should.equal(3);
  });

  it('should listen to reference specified by deep key path', function () {
    var structure = immstruct({ value: { foo: { bar: 'foo' } } });

    var rendered = 0;
    var Component = observer(structure, {
      bar: ['value', 'foo', 'bar']
    }, component(function (props) {
      var val = props.bar.deref();
      rendered++;

      switch(rendered) {
        case 1:
          val.should.equal('foo');
        break;
        case 2:
          val.should.equal('bar');
        break;
        case 3:
          val.should.equal('baz');
        break;
      }

      return React.DOM.text(null, 'Rendered ' + rendered + ' times');
    }));

    render(Component({}));
    rendered.should.equal(1);
    structure.cursor(['value', 'foo']).set('bar', 'bar');
    rendered.should.equal(2);
    structure.cursor(['value', 'foo']).set('bar', 'baz');
    rendered.should.equal(3);
  });

  it('should still use shouldComponentUpdate', function () {
    var structure = immstruct({
      value: 'foo'
    });

    var rendered = 0;
    var Component = observer(structure, {
      value: 'value'
    }, component(function (input) {
      rendered++;
      return React.DOM.text(null, 'Rendered ' + rendered + ' times');
    }));

    render(Component({}));
    rendered.should.equal(1);

    render(Component({}));
    rendered.should.equal(1);

    render(Component({ anotherValue: 'hello' }));
    rendered.should.equal(2);

    structure.cursor().set('value', 'bar');
    rendered.should.equal(3);

    structure.cursor().set('value', 'baz');
    rendered.should.equal(4);
  });

  it('should pass cursors to render-method with existing props', function () {
    var structure = immstruct({ value: 'foo' });
    var rendered = 0;
    var Component = observer(structure, {
      value: 'value'
    }, component(function (props) {
      rendered++;

      var value = props.value,
          anotherValue = props.anotherValue;
      switch(rendered) {
        case 1:
          value.deref().should.equal('foo');
          anotherValue.should.equal('hello');
        break;
        case 2:
          value.deref().should.equal('bar');
          anotherValue.should.equal('hello');
        break;
        case 3:
          value.deref().should.equal('bar');
          anotherValue.should.equal('bye');
        break;
      }

      return React.DOM.text(null, '');
    }));

    render(Component({ anotherValue: 'hello' }));
    rendered.should.equal(1);

    structure.cursor().set('value', 'bar');
    rendered.should.equal(2);

    render(Component({ anotherValue: 'bye' }));
    rendered.should.equal(3);
  });

  it('should be able to listen across different immstruct structures', function () {
    var structure = immstruct({ value: 'foo' });
    var structure2 = immstruct({ different: 'bar' });

    var rendered = 0;

    var MyComp = component(function (props) {
      rendered++;

      var value = props.value.deref(),
          another = props.another.deref(),
          anotherValue = props.anotherValue;

      switch(rendered) {
        case 1:
          value.should.equal('foo');
          another.should.equal('bar');
          anotherValue.should.equal('hello');
        break;
        case 2:
          value.should.equal('bar');
          another.should.equal('bar');
          anotherValue.should.equal('hello');
        break;
        case 3:
          value.should.equal('bar');
          another.should.equal('foo');
          anotherValue.should.equal('hello');
        break;
      }

      return React.DOM.text(null, '');
    });

    var Component = observer(structure, {
      value: 'value'
    }, MyComp);

    Component = observer(structure2, {
      another: 'different'
    }, Component)

    render(Component({ anotherValue: 'hello' }));
    rendered.should.equal(1);

    structure.cursor().set('value', 'bar');
    rendered.should.equal(2);

    structure2.cursor().set('different', 'foo');
    rendered.should.equal(3);
  });

  beforeEach(function () {
    global.document = jsdom.jsdom('<html><body><div id="app"></div></body></html>');
    global.window = global.document.parentWindow;
  });

  afterEach(function () {
    delete global.document;
    delete global.window;
  });

  function render (component) {
    ReactDOM.render(component, global.document.querySelector('#app'));
  }

});
