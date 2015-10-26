'use strict';

var chai = require('chai');
var jsdom = require('jsdom');

var React  = require('react');
var ReactDOM  = require('react-dom');

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

      var Component = ignore('statics', component([mixin], function (input) {
        renderCalled = renderCalled + 1;
        onChange = input.statics.onChange;
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

      var Component = ignore('statics', component([mixin], function (input) {
        renderCalled = renderCalled + 1;
        onChange.should.equal(input.statics.onChange);
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
      var statics;
      var Component = ignore('statics', component(function (input) {
        onChange = input.statics.onChange;
        statics = input.statics;
        renders = renders + 1;
        return DOM.text(null, 'hello');
      }));

      render(Component({
        statics: {
          onChange: function () {
            return 1;
          }
        }
      }));

      renders.should.equal(1);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);

      var original = onChange;

      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({
        statics: {
          onChange: function () {
            return 2;
          }
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

      render(Component({a: 1,
        statics: {
          onChange: function () {
            return 3;
          }
        }
      }));

      renders.should.equal(2);
      onChange.should.be.a('function');
      statics.should.be.a('object');
      statics.onChange.should.equal(onChange);
      onChange.should.equal(original);

      onChange().should.equal(3);
      statics.onChange().should.equal(3);

      render(Component({a: 1,
        statics: {
          onChange: function () {
            return 4;
          }
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
      var Component = ignore('statics', component(function (input) {
        statics = input.statics;
        if (statics && statics.onChange)
          onChange = statics.onChange;

        renders = renders + 1;
        return DOM.text(null, 'hello');
      }));

      var changeHandler = function () { return 1; };
      var handlers = {onChange: changeHandler };

      render(Component({statics: handlers}));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({ statics: handlers }));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 1, statics: handlers }));

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
      var Component = ignore('statics', component(function (input) {
        statics = input.statics;
        onChange = statics.onChange;
        renders = renders + 1;
        return DOM.text(null, 'hello');
      }));

      var changeHandler = function () { return 1; };

      render(Component({
        statics: {
          onChange: changeHandler
        }
      }));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({ statics: {onChange: changeHandler}}));

      renders.should.equal(1);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 1, statics: { onChange: changeHandler }}));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 1, statics: {onChange: onChange}}));

      renders.should.equal(2);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      render(Component({a: 2, statics: {onChange: onChange}}));

      renders.should.equal(3);
      onChange.delegee.should.equal(changeHandler);
      onChange().should.equal(1);
      statics.onChange().should.equal(1);

      done();
    });

    it('delegates should not nest', function (done) {
      var renders = [];
      var handlers = {};

      var A = ignore('statics', component('a', function (input) {
        renders.push("A");
        handlers.a = input.statics.onChange;
        return DOM.div({key: 'a'}, [
          B('b', { b: input.b, statics: input.statics }),
          C('c', { c: input.c, statics: input.statics })
        ]);
      }));

      var B = ignore('statics', component('b', function (input) {
        renders.push("B");
        handlers.b = input.statics.onChange;
        return DOM.span({ key: 'b'}, [input.b.text]);
      }));

      var C = ignore('statics', component('c', function (input) {
        renders.push("C");
        handlers.c = input.statics.onChange;
        return DOM.div({ key: 'c'},
          D('d', {
            d: input.c.d,
            statics: input.statics
          })
        );
      }));

      var D = ignore('statics', component('d', function (input) {
        renders.push("D");
        handlers.d = input.statics.onChange;
        return DOM.span({ key: 'd'}, [input.d]);
      }));

      var changeHandler = function () { return 1; };

      render(A({b: {text: 1}, c: {d: [2]}, statics: {onChange: changeHandler}}));

      renders.splice(0).join('->').should.equal('A->B->C->D');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 1}, c: {d: [2]}, statics: {onChange: changeHandler}}));

      renders.splice(0).join('->').should.equal('');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 11}, c: {d: [2]}, statics: {onChange: changeHandler}}));

      renders.splice(0).join('->').should.equal('A->B');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      render(A({b: {text: 11}, c: {d: [22]}, statics: {onChange: changeHandler}}));

      renders.splice(0).join('->').should.equal('A->C->D');
      handlers.a.delegee.should.equal(changeHandler);
      handlers.b.delegee.should.equal(changeHandler);
      handlers.c.delegee.should.equal(changeHandler);
      handlers.d.delegee.should.equal(changeHandler);

      var onChange = function () { return 2; };
      render(A({b: {text: 11}, c: {d: [22]}, statics: {onChange: onChange}}));

      renders.splice(0).join('->').should.equal('');
      handlers.a.delegee.should.equal(onChange);
      handlers.b.delegee.should.equal(onChange);
      handlers.c.delegee.should.equal(onChange);
      handlers.d.delegee.should.equal(onChange);

      done();
    });

    it('update no handler to handler', function (done) {
      var renders = [];
      var handlers = {};

      var Component = ignore('ignorable', component(function (input) {
        renders.push(1);
        handlers.onChange = (input.ignorable || {}).onChange;
        return DOM.text('');
      }));

      var onChange = function () {};
      render(Component({}));

      renders.length.should.equal(1);
      (handlers.onChange === void 0).should.be.true;

      render(Component({a: 1, ignorable: {onChange: onChange}}));

      renders.length.should.equal(2);
      handlers.onChange.delegee.should.equal(onChange);

      var onUpdate = function () {};
      render(Component({a: 1, ignorable: {onChange: onUpdate}}));

      renders.length.should.equal(2);
      handlers.onChange.delegee.should.equal(onUpdate);

      done();
    });

    it('adds delagees to multiple ignorables', function (done) {
      var renders = [];
      var handlers1 = {};
      var handlers2 = {};

      var Component = ignore(['ignorable1', 'ignorable2'], component(function (input) {
        renders.push(1);
        handlers1.onChange = (input.ignorable1 || {}).onChange;
        handlers2.onChange = (input.ignorable2 || {}).onChange;
        return DOM.text('');
      }));

      var onChange1 = function () {};
      var onChange2 = function () {};
      render(Component({}));

      renders.length.should.equal(1);
      (handlers1.onChange === void 0).should.be.true;
      (handlers2.onChange === void 0).should.be.true;

      render(Component({
        a: 1,
        ignorable1: {onChange: onChange1},
        ignorable2: {onChange: onChange2}
      }));

      renders.length.should.equal(2);
      handlers1.onChange.delegee.should.equal(onChange1);
      handlers2.onChange.delegee.should.equal(onChange2);

      var onUpdate1 = function () {};
      var onUpdate2 = function () {};
      render(Component({
        a: 1,
        ignorable1: {onChange: onUpdate1},
        ignorable2: {onChange: onUpdate2}
      }));

      renders.length.should.equal(2);
      handlers1.onChange.delegee.should.equal(onUpdate1);
      handlers2.onChange.delegee.should.equal(onUpdate2);

      done();
    });
  });
  beforeEach(function () {
    // React needs a dom before being required
    // https://github.com/facebook/react/blob/master/src/vendor/core/ExecutionEnvironment.js#L39
    global.document = jsdom.jsdom('<html><body><div id="app"></div></body></html>');
    global.window = global.document.defaultView;
    global.navigator = global.window.navigator;
  });

  afterEach(function () {
    delete global.document;
    delete global.window;
    delete global.navigator;
  });

  function render (component) {
    ReactDOM.render(component, global.document.querySelector('#app'));
  }

});
