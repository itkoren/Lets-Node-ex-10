function start() {
    // Include The 'sys' Module
    var sys = require("sys");

    // Include The 'domain' Module
    var domain = require("domain");

    // Create a new domain execution context
    var dmn = domain.create();

    // Create a listener/handler for the domains errors
    dmn.on("error", function (err) {
        console.error(err);
    });

    // Execute our logic inside the created domain
    dmn.run(function () {

        // Include The 'http' Module
        var http = require("http");

        // Include The 'sentigatorer' express application module
        var app = require("./lib/sentigatorer")

        // Include The 'realtimer' Module
        var sjss = require("./lib/realtimer");

        // Create the HTTP Server
        var server = http.createServer(app).listen(app.get("port"), app.get("ip"), function () {
            console.log("Express Server Started. Listening on", server.address().address, ": Port", server.address().port, "-> pid:", process.pid);
        });

        // Register the sockjs server on the HTTP server and start listening
        sjss.installHandlers(server, { prefix: "/realtime" });
    });
}

process.on("uncaughtException", function (err) {
    console.error((new Date()).toUTCString() + " uncaughtException:", err.message);
    console.error(err.stack);

    sys.puts("Caught exception: " + err);
    process.exit(1);
});

// Check if this is the entry point (and application should be started)
// or we should exports the start method to be available for require
// When a file is run directly from Node, require.main is set to its module
if (module === require.main) {
    var app = start();
}
else {
    module.exports = start;
}