var context = require("./context");
var sentigatorer = require("../lib/sentigatorer");

describe("Test sentigatorer", function() {
    before(function () {
        // before() is the first thing we run before all your tests.
        // Do one-time setup here.
    });
    beforeEach(function () {
        // beforeEach() is run before each test.
    });
    describe("Test main method", function () {
        it("should return 15 results for all inputs", function (done) {
            this.timeout(8000);
            // Now... Test!
            context.supertest(sentigatorer)
                .get("/content?term=unit+testing")
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function (err, res) {
                    context.expect(err).to.equal(null);
                    context.expect(res.body.length).to.equal(15);
                    done();
                });
        });
        it("should return code 500 results for no input", function (done) {
            this.timeout(8000);
            // Now... Test!
            context.supertest(sentigatorer)
                .get("/content")
                .expect(500)
                .end(function (err, res) {
                    context.expect(err).to.equal(null);
                    context.expect(res.text).to.equal("** Only Bear Here :) **");
                    done();
                });
        });
    });
    afterEach(function () {
        // afterEach() is run after each test.
        context.sandbox.restore();
    });
    after(function () {
        // after() is run after all your tests have completed.
        // Do teardown here.
    });
});