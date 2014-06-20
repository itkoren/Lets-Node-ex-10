// Include The 'request' Module
var request = require("request");

// Include The 'async' Module
var async = require("async");

// Include The 'JSONStream' Module
var jsonStream = require("JSONStream");

// Include The 'event-stream' Module
var eventStream = require("event-stream");

// Include The 'parser' Module
var Parser = require("./parser");

var aggregate = module.exports = function(term, services, asfrom, callback) {

    // Validating existence of term
    if (term) {
        if ("function" === typeof services) {
            callback = services;
            services = void 0;
        }
        else if ("function" === typeof asfrom) {
            callback = asfrom;
            asfrom = void 0;
        }
        if (!services) {
            // Default all to true
            services = {
                twitxy: true,
                google: true,
                utube: true
            };
        }
        async.auto({
                twitxy: function (callback) {
                    var parser = new Parser();
                    if (!services.twitxy) {
                        callback(null, parser.getItems());
                    }
                    else {
                        request("http://twitxy.itkoren.com/?lang=en&count=5&term=" + encodeURIComponent(term))
                            .pipe(jsonStream.parse("statuses.*"))
                            .pipe(eventStream.mapSync(function (data) {
                                if (!asfrom || asfrom < new Date(data.created_at).getTime()) {
                                    parser.parse({
                                        src: "Twitter",
                                        text: data.text,
                                        score: 0
                                    });
                                }
                            })).on("error", function (e) {
                                // Deal with errors
                                console.error("Got \"twitxy\" error: " + e.message);
                            }).on("end", function () {
                                console.log("End Of Twitter Search Stream");
                                callback(null, { items: parser.getItems() });
                            });
                    }
                },
                google: function (callback) {
                    var parser = new Parser();
                    var hasUTube = false;
                    if (!services.google) {
                        callback(null, { items: parser.getItems(), hasUTube: hasUTube });
                    }
                    else {
                        request("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&language=en&resultSize=5&q=" + encodeURIComponent(term))
                            .pipe(jsonStream.parse("responseData.results.*"))
                            .pipe(eventStream.mapSync(function (data) {
                                parser.parse({
                                    src: "Google",
                                    text: data.title,
                                    score: 0
                                });

                                // Check if in utube
                                if (!hasUTube && -1 !== data.unescapedUrl.indexOf("youtube.com")) {
                                    hasUTube = true;
                                }
                            })).on("error", function (e) {
                                // Deal with errors
                                console.error("Got \"Google\" error: " + e.message);
                            }).on("end", function () {
                                console.log("End Of Google Search Stream");
                                callback(null, { items: parser.getItems(), hasUTube: hasUTube });
                            });
                    }
                },
                utube: ["google", function (callback, results) {
                    var parser = new Parser();

                    if (!services.utube || results.google.hasUTube) {
                        callback(null, parser.getItems());
                    }
                    else {
                        request("https://gdata.youtube.com/feeds/api/videos?max-results=5&alt=json&orderby=published&v=2&q=" + encodeURIComponent(term))
                            .pipe(jsonStream.parse("feed.entry.*"))
                            .pipe(eventStream.mapSync(function (data) {
                                if (!asfrom || asfrom < new Date(data.updated.$t).getTime()) {
                                    parser.parse({
                                        src: "UTube",
                                        text: data.title.$t,
                                        score: 0
                                    });
                                }
                            })).on("error", function (e) {
                                // Deal with errors
                                console.error("Got \"UTube\" error: " + e.message);
                            }).on("end", function () {
                                console.log("End Of Utube Search Stream");
                                callback(null, { items: parser.getItems() });
                            });
                    }
                }]
            },
            // optional callback
            function (err, results) {
                // the results array will equal ['one','two'] even though
                // the second function had a shorter timeout.
                if (err) {
                    // Deal with errors
                    console.log("Got error: " + err.message);
                    callback(new Error("** Only Bear Here :) **"));
                }
                else {
                    var items = results.twitxy.items.concat(results.google.items, results.utube.items);
                    callback(null, items);
                }
            });
    }
    else {
        // No search term supplied, just return
        console.log("Search failed!");
        console.log("Parameters are missing");
        callback(new Error("** Only Bear Here :) **"));
    }
};