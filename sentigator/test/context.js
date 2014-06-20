var chai = require("chai");
var sinon = require("sinon");
var mockery = require("mockery");
var supertest = require("supertest");

var sandbox = sinon.sandbox.create();

var context = module.exports = {
    expect: chai.expect,
    sinon: sinon,
    mockery: mockery,
    supertest: supertest,
    sandbox: sandbox
};