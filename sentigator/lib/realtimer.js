// Include The 'sockjs' Module
var sockjs = require("sockjs");

// Include The 'async' Module
var async = require("async");

// Include The 'aggregator' Module
var aggregator = require("../lib/aggregator");

// Initialize a sockjs server
var sjss = module.exports = sockjs.createServer();

// Index for eterating
var index = 0;

// List of all active connections
var conns = [];

// Current timeout reference
var timeout;

// Poll function for polling the services for each connection term
function poll() {
    // Only query the twitxy & google API's since only those have update time on results
    var services = {
        twitxy: true,
        utube: true
    };

    // Iterate
    async.whilst(
        function() {
            return index < conns.length;
        },
        function(next) {
            // Eterate - be careful and use setImmediate n order not to starve the event loop
            setImmediate(function() {
                var conn = conns[index++];
                if (conn.term) {
                    // Query for connection term
                    query(conn, services, next);
                }
                else {
                    next();
                }
            });
        },
        function(err) {
            // Re-set the poller
            setPoller();
        }
    );
}

function setPoller() {
    // Start Polling interval
    index = 0;
    timeout = setTimeout(poll, 5000);
}

// Listen for 'connection' events and handle
sjss.on("connection", function(conn) {

    // Add the connection to the list
    conns.push(conn);

    // Listen for 'data' events from the client and handle
    conn.on("data", function(data) {
        console.log("received: %s", data);

        var parsed = data && JSON.parse(data);
        var term = parsed && parsed.term;

        // Set the connection term
        conn.term = term;

        // Remove the connection from the list to prevent double processing
        conns.splice(conns.indexOf(conn), 1);

        // Delete any previous time flag
        delete conn.updated;

        query(conn, null, function() {
            // Add the connection to the list
            conns.push(conn);
        });
    });

    // Send data to the client
    conn.write(JSON.stringify({ connected: true }));

    conn.on("close", function() {
        console.log("stopping client");

        // Remove the connection from the list
        conns.splice(conns.indexOf(conn), 1);
    });
});

function query(conn, services, callback) {
    if (conn.term) {
        var now = Date.now();
        aggregator(conn.term, services, conn.updated, function(err, data) {
            if (err) {
                // Deal with errors
                console.log("Got error: " + err.message);
                conn.write(JSON.stringify({ error: err }));

                if (callback) {
                    callback(err);
                }
            }
            else {
                conn.updated = now;
                conn.write(JSON.stringify(data));

                if (callback) {
                    callback(null);
                }
            }
        });
    }
}

setPoller();