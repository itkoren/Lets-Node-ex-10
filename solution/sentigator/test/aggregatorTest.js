var context = require("./context");
var Reader = require("../../../reader");

var aggregator;

function generateMockResponse(url, data) {
    var stub = {};
    if (-1 !== url.indexOf("twitxy")) {
        stub = {
            statuses: [
                {
                    text: data
                }
            ]
        };
    }
    else if (-1 !== url.indexOf("googleapis")) {
        stub = {
            responseData: {
                results: [
                    {
                        title: data,
                        unescapedUrl: ""
                    }
                ]
            }
        };
    }
    else if (-1 !== url.indexOf("youtube")) {
        stub = {
            feed: {
                entry: [
                    {
                        title: {
                            $t: data
                        }
                    }
                ]
            }
        };
    }

    return JSON.stringify(stub);
}

var mockRequest = function(url) {
    var reader = new Reader(generateMockResponse(url, "Test Text"));

    setImmediate(function(){
        // "Start" the reader.
        reader.resume();
    });

    return reader;
};


describe("Test aggregator", function() {
    before(function () {
        // before() is the first thing we run before all your tests.
        // Do one-time setup here.
        context.mockery.enable({ useCleanCache: true });
    });
    beforeEach(function () {
        // beforeEach() is run before each test.
        context.request = context.sandbox.spy(mockRequest);

        // Replace 'request' with our mock
        context.mockery.registerMock("request", context.request);

        context.mockery.registerAllowables([
            "jsonparse"
            , "stream"
            , "through"
            , "from"
            , "duplexer"
            , "map-stream"
            , "pause-stream"
            , "split"
            , "string_decoder"
            , "stream-combiner"
            , "async"
            , "JSONStream"
            , "event-stream"
            , "sentiment"
            , "require.async"
            , "./AFINN.json"
            , "./parser"
        ]);

        // Explicitly telling mockery using the actual aggregator is OK
        // without registerAllowable, you will see WARNING in test output
        context.mockery.registerAllowable("../lib/aggregator", true);

        aggregator = require("../lib/aggregator");
    });
    describe("Test main method", function () {
        it("should return 3 for all input", function (done) {
            // Now... Test!
            aggregator("term", function(err, data) {
                context.expect(err).to.equal(null);
                context.expect(data.length).to.equal(3);
                done();
            });
        });
        it("should be called 3 times with defined url's", function (done) {
            // Now... Test!
            aggregator("term", function(err, data) {
                context.expect(err).to.equal(null);
                context.expect(context.request.callCount).to.equal(3);
                context.expect(context.request.firstCall.args[0]).to.equal("http://twitxy.itkoren.com/?lang=en&count=5&term=term");
                context.expect(context.request.secondCall.args[0]).to.equal("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&language=en&resultSize=5&q=term");
                context.expect(context.request.thirdCall.args[0]).to.equal("https://gdata.youtube.com/feeds/api/videos?max-results=5&alt=json&orderby=published&v=2&q=term");
                done();
            });
        });
        it("should return 3 for all input", function (done) {
            // Now... Test!
            aggregator("", function(err, data) {
                context.expect(err).to.be.a("object");
                context.expect(err.message).to.equal("** Only Bear Here :) **");
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