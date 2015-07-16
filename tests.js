var chai = require('chai');
var should = chai.should();

var helpers = require('./');

describe('omnipotent', function () {

  it('should expose omniscient', function () {
    helpers.component.should.be.ok();
  });

  it('should expose omniscient with jsx as default', function () {
    var component = helpers.jsxComponent;
    component.should.be.ok();
    (component(function () { }).jsx === void 0).should.be.ok();
  });

  it('should expose immstruct', function () {
    helpers.immstruct.should.be.ok();
  });

});
