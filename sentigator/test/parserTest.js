var context = require("./context");

var Parser;

var mockSentiment = function(term, callback) {
    setImmediate(function(){
        callback(null, 10);
    });
};

describe("Test parser", function() {
    before(function () {
        // before() is the first thing we run before all your tests.
        // Do one-time setup here.
        context.mockery.enable({ useCleanCache: true });
    });
    beforeEach(function () {
        // beforeEach() is run before each test.
        context.sentiment = context.sandbox.spy(mockSentiment);

        // Replace 'request' with our mock
        context.mockery.registerMock("sentiment", context.sentiment);

        // Explicitly telling mockery using the actual parser is OK
        // without registerAllowable, you will see WARNING in test output
        context.mockery.registerAllowable("../lib/parser", true);

        Parser = require("../lib/parser");
    });
    describe("Test main method", function () {
        it("should return 1 item with score 10", function (done) {
            // Now... Test!
            var parser = new Parser();
            parser.parse({ text: "term to test" });

            setImmediate(function() {
                var items = parser.getItems();
                context.expect(items).to.not.equal(null);
                context.expect(items.length).to.equal(1);
                context.expect(items[0].score).to.equal(10);
                done();
            });
        });
        it("should return 2 item with score 10 each", function (done) {
            // Now... Test!
            var parser = new Parser();
            parser.parse({ text: "term to test 1" });
            parser.parse({ text: "term to test 2" });

            setImmediate(function() {
                var items = parser.getItems();
                context.expect(items).to.not.equal(null);
                context.expect(items.length).to.equal(2);
                context.expect(items[0].score).to.equal(10);
                context.expect(items[1].score).to.equal(10);
                done();
            });
        });
    });
    afterEach(function () {
        // afterEach() is run after each test.
        context.mockery.deregisterAll();
        context.sandbox.restore();
    });
    after(function () {
        // after() is run after all your tests have completed.
        // Do teardown here.
        context.mockery.disable();
    });
});