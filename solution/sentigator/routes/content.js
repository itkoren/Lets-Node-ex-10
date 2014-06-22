// Include The 'express' Module
var express = require("express");

// Include The 'aggregator' Module
var aggregator = require("../lib/aggregator");

// Initialize a new express router
var router = express.Router();

router.get("/", function(req, res, next) {
    // Handle HTTP Request
    var qs = req.query;

    aggregator(qs.term, function(err, data) {
        if (err) {
            // Deal with errors
            console.log("Got error: " + err.message);
            res.send(500, err.message);
        }
        else {
            res.json(data);
        }
    });
});

module.exports = router;