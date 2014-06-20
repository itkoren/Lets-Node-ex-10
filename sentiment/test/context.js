var chai = require("chai");
var sinon = require("sinon");
var mockery = require("mockery");

var sandbox = sinon.sandbox.create();

var context = module.exports = {
    expect: chai.expect,
    sinon: sinon,
    mockery: mockery,
    sandbox: sandbox
};