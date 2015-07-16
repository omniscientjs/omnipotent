'use strict';

var chai = require('chai');
var jsdom = require('jsdom');

var React  = require('react/addons'),
    ReactTestUtils = React.addons.TestUtils;

var should = chai.should();

var component = require('omniscient');
var ignore = require('../ignore');

describe('ignore-decorator', function () {

  it('should ignore single property', function () {
    var renderCalled = 0;
    var Component = component(function () {
      renderCalled++;
      return React.DOM.text(null, 'hello');
    });

    var IgnorableComponent = ignore('ignore', Component);
    render(IgnorableComponent({ ignore: 'foo', another: 'bar' }));
    render(IgnorableComponent({ ignore: 'hello', another: 'bar' }));
    render(IgnorableComponent({ ignore: 'hello', another: 'baz' }));
    renderCalled.should.equal(2);
  });

  it('should ignore multiple properties', function () {
    var renderCalled = 0;
    var Component = component(function () {
      renderCalled++;
      return React.DOM.text(null, 'hello');
    });

    var IgnorableComponent = ignore(['ignore', 'another'], Component);

    render(IgnorableComponent({ ignore: 'foo', another: 'bar' }));
    render(IgnorableComponent({ ignore: 'hello', another: 'bar' }));
    render(IgnorableComponent({ ignore: 'hello', another: 'baz' }));

    renderCalled.should.equal(1);
  });

  it('should support jsx', function () {
    var renderCalled = 0;
    var Component = component(function () {
      renderCalled++;
      return React.DOM.text(null, 'hello');
    });

    var IgnorableComponent = ignore('ignore', Component.jsx);
    render(React.createElement(IgnorableComponent, { ignore: 'foo', another: 'bar' }));
    render(React.createElement(IgnorableComponent, { ignore: 'hello', another: 'bar' }));
    render(React.createElement(IgnorableComponent, { ignore: 'hello', another: 'baz' }));
    renderCalled.should.equal(2);
  });

  beforeEach(function () {
    global.document = jsdom.jsdom('<html><body></body></html>');
    global.window = global.document.parentWindow;
  });

  afterEach(function () {
    delete global.document;
    delete global.window;
  });
});

function render (component) {
  React.render(component, global.document.body);
}
