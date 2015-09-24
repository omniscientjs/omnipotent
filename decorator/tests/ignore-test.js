'use strict';

var chai = require('chai');
var jsdom = require('jsdom');

var React  = require('react/addons'),
    ReactTestUtils = React.addons.TestUtils;

var DOM = React.DOM;

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

  describe('hot swapping statics', function () {
    it('passing componentWillReceiveProps as mixin', function (done) {
      var onChange = null;
      var willReceivePropsCalled = 0;
      var renderCalled = 0;
      var mixin = {
        componentWillReceiveProps: function (props) {
          props.statics.onChange.should.equal(this.props.statics.onChange);
          onChange.should.equal(this.props.statics.onChange);
          willReceivePropsCalled = willReceivePropsCalled + 1;
        }
      };

      var Component = ignore('statics', component([mixin], function (input, output) {
        renderCalled = renderCalled + 1;
        onChange = output.onChange;
        return DOM.text(null, 'hello');
      }));

      render(Component({ statics: {onChange: function () { return 1; } } }));
      renderCalled.should.equal(1);
      onChange().should.equal(1);

      render(Component({ statics: {onChange: function () { return 2; } } }));
      renderCalled.should.equal(1);
      onChange().should.equal(2);

      render(Component({ statics:  {onChange: function () { return 3; } } }));
      renderCalled.should.equal(1);
      onChange().should.equal(3);

      render(Component({a: 1, statics: {onChange: function () { return 4; } } }));
      renderCalled.should.equal(2);
      onChange().should.equal(4);
      willReceivePropsCalled.should.equal(1);

      done();
    });

    it('passing componentWillMount as mixin', function (done) {
      var onChange = null;
      var willMountCalled = 0;
      var renderCalled = 0;
      var mixin = {
        componentWillMount: function () {
          onChange = this.props.statics.onChange;
          willMountCalled = willMountCalled + 1;
        }
      };

      var Component = ignore('statics', component([mixin], function (input, output) {
        renderCalled = renderCalled + 1;
        onChange.should.equal(output.onChange);
        return DOM.text(null, 'hello');
      }));

      render(Component({ statics: { onChange: function () { return 1; } } }));
      renderCalled.should.equal(1);
      willMountCalled.should.equal(1);
      onChange().should.equal(1);


      render(Component({ statics: { onChange: function () { return 2; } } }));
      renderCalled.should.equal(1);
      willMountCalled.should.equal(1);
      onChange().should.equal(2);

      render(Component({a: 1, statics: { onChange: function () { return 3; } } }));
      renderCalled.should.equal(2);
      willMountCalled.should.equal(1);
      onChange().should.equal(3);

      render(Component({a: 1, statics: { onChange: function () { return 4; } } }));
      renderCalled.should.equal(2);
      willMountCalled.should.equal(1);
      onChange().should.equal(4);

      done();
    });

    it('statics handlers get updated', function (done) {
      var renders = 0;
      var onChange = null;
      var statics = statics;
      var Component = component(function (input, output) {
        onChange = output.onChange;
        statics = output;
        renders = renders + 1;
        return DOM.text(null, 'hello');
      });

      render(Component({}, {
        onChange: function () {
          return 1;
        }
      }));

      renders.should.equal(1);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);

      var original = onChange;

      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({}, {
        onChange: function () {
          return 2;
        }
      }));

      renders.should.equal(1);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);
      onChange.should.equal(original);

      onChange().should.equal(2);
      statics.onChange().should.equal(2);

      var onChange2 = onChange;

      render(Component({a: 1}, {
        onChange: function () {
          return 3;
        }
      }));

      renders.should.equal(2);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);
      onChange.should.equal(original);

      onChange().should.equal(3);
      statics.onChange().should.equal(3);

      render(Component({a: 1}, {
        onChange: function () {
          return 4;
        }
      }));

      renders.should.equal(2);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);
      onChange.should.equal(original);

      onChange().should.equal(4);
      statics.onChange().should.equal(4);

      done();
    });

    it('statics do not hot swap unless updated', function (done) {
      var renders = 0;
      var onChange = null;
      var statics = statics;
      var Component = component(function (input, output) {
        onChange = output.onChange;
        statics = output;
        renders = renders + 1;
        return DOM.text(null, 'hello');
      });

      var changeHandler = function () { return 1; };
      var handlers = {onChange: changeHandler };

      render(Component({}, handlers));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({}, handlers));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 1}, handlers));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      done();
    });

    it('should never delegate to delegee', function (done) {
      var renders = 0;
      var onChange = null;
      var statics = statics;
      var Component = component(function (input, output) {
        onChange = output.onChange;
        statics = output;
        renders = renders + 1;
        return DOM.text(null, 'hello');
      });

      var changeHandler = function () { return 1; };

      render(Component({}, {onChange: changeHandler}));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({}, {onChange: changeHandler}));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 1}, {onChange: changeHandler}));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 1}, {onChange: onChange}));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 2}, {onChange: onChange}));

      renders.should.equal(3);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      done();
    });

    it('delegates should not nest', function (done) {
      var renders = [];
      var handlers = {};

      var A = component('a', function (input, output) {
        renders.push("A");
        handlers.a = output.onChange;
        return DOM.div({key: 'a'}, [
          B('b', input.b, output),
          C('c', input.c, {onChange: output.onChange})
        ]);
      });

      var B = component('b', function (input, output) {
        renders.push("B");
        handlers.b = output.onChange;
        return DOM.span({ key: 'b'}, [input.text ]);
      });

      var C = component('c', function (input, output) {
        renders.push("C");
        handlers.c = output.onChange;
        return DOM.div({ key: 'c'}, [D('d', input.d, {onChange: output.onChange})]);
      });

      var D = component('d', function (input, output) {
        renders.push("D");
        handlers.d = output.onChange;
        return DOM.span({ key: 'd'}, input.d);
      });

      var changeHandler = function () { return 1; };

      render(A({b: {text: 1}, c: {d: [2]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('A->B->C->D');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 1}, c: {d: [2]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 11}, c: {d: [2]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('A->B');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 11}, c: {d: [22]}}, {onChange: changeHandler}));

      renders.splice(0).join('->').should.equal('A->C->D');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      var onChange = function () { return 2; };
      render(A({b: {text: 11}, c: {d: [22]}}, {onChange: onChange}));

      renders.splice(0).join('->').should.equal('');
      handlers.a.delegee.should.equal(onChange);
      handlers.b.delegee.should.equal(onChange);
      handlers.c.delegee.should.equal(onChange);
      handlers.d.delegee.should.equal(onChange);

      done();
    });

    it('update no handler to handler', function (done) {
      var renders = [];
      var handlers = null;

      var Component = component(function (input, output) {
        renders.push(1);
        handlers = output;
        return DOM.text('');
      });

      var onChange = function () {};
      render(Component({}, {}));


      renders.length.should.equal(1);
      (handlers.onChange === void 0).should.be.true;

      render(Component({a: 1}, {onChange: onChange}));

      renders.length.should.equal(2);
      handlers.onChange.delegee.should.equal(onChange);

      var onUpdate = function () {};
      render(Component({a: 1}, {onChange: onUpdate}));

      renders.length.should.equal(2);
      handlers.onChange.delegee.should.equal(onUpdate);

      done();
    });
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
