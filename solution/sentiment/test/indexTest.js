var context = require("./context");

var afinnMock = {
    "hello": 1,
    "node": 2,
    "bye": -2
};

var sentiment;

describe("Test sentiment", function() {
    before(function () {
        // before() is the first thing we run before all your tests.
        // Do one-time setup here.
        context.mockery.enable();
    });
    beforeEach(function () {
        // beforeEach() is run before each test.
        // Replace './AFINN.json' with our mock
        context.mockery.registerMock("./AFINN.json", afinnMock);

        context.mockery.registerAllowable("require.async");

        // Explicitly telling mockery using the actual sentiment is OK
        // without registerAllowable, you will see WARNING in test output
        context.mockery.registerAllowable("../index");

        sentiment = require("../index");
    });
    describe("Test main method", function () {
        it("should return 3 for input of \"Hello Node\"", function (done) {
            // Now... Test!
            sentiment("Hello Node", function(err, data) {
                context.expect(err).to.equal(null);
                context.expect(data).to.equal(3);
                done();
            });
        });
        it("should return 0 for input of \"Bye Node\"", function (done) {
            // Now... Test!
            sentiment("Bye Node", function(err, data) {
                context.expect(err).to.equal(null);
                context.expect(data).to.equal(0);
                done();
            });
        });
        it("should return 2 for input of \"Lets Node\"", function (done) {
            // Now... Test!
            sentiment("Lets Node", function(err, data) {
                context.expect(err).to.equal(null);
                context.expect(data).to.equal(2);
                done();
            });
        });
    });
    afterEach(function () {
        // afterEach() is run after each test.
        context.mockery.deregisterAll();
    });
    after(function () {
        // after() is run after all your tests have completed.
        // Do teardown here.
        context.mockery.disable();
    });
});