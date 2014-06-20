// Include The 'sys' Module
var sys = require("sys");

// Include The 'path' Module
var path = require("path");

// Include The 'express' Module
var express = require("express");

// Include The 'errorhandler' Module
var errorhandler = require("errorhandler");

// Include The 'morgan' Module
var morgan = require("morgan");

// Include The 'response-time' Module
var responseTime = require("response-time");

// Include The 'routes' Module
var routes = require("../routes");

// Include The 'content' Module
var content = require("../routes/content");

var app = module.exports = express();

if ("development" === app.get("env")) {
    // Gets called in the absence of NODE_ENV too!
    app.use(function (req, res, next) {
        // you always log
        console.error(" %s %s ", req.method, req.url);
        next();
    });
    app.use(morgan({ format: "dev", immediate: true }));
    app.use(errorhandler({ dumpExceptions: true, showStack: true }));
}
else if ("production" === app.get("env")) {
    app.use(errorhandler());
}

// Set All Environments Application Settings
app.set("port", process.env.PORT || 8000);
app.set("ip", process.env.IP || "0.0.0.0");

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "..", "public")));

// Add the responseTime middleware
app.use(responseTime());

app.use("/", routes);
app.use("/content", content);

app.use(function(err, req, res, next){
    console.error(err.stack);
    sys.puts("Caught exception: " + err);

    if (404 === err.status) {
        res.send(404, "** Only Bear Here :) **");
    }
    else {
        res.send(500, "Something broke!");
    }
});