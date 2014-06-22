var https = require("https");
var fs = require("fs");
var httpProxy = require("http-proxy");
var seaport = require("seaport");

// Connect to the seaport service
var ports = seaport.connect(process.env.SPIP || process.env.IP || "localhost", process.env.SPPORT || 9090);

// Get the needed server version
var version = process.env.SRVER || "0.0.x";

if ("0" === version) {
    version = "*";
}

//
// Create a HttpProxy object for each target
//
var proxies = {};
var ids = [];

// Build the proxies list
function buildProxies() {
    var addresses = ports.query("sentigator@" + version);

    // Very optimistic flow :-)
    // Set the new list
    for (var i = 0; i < addresses.length; i++) {
        var target = addresses[i];
        if (-1 === ids.indexOf(target.id)) {
            // Add the new proxy to the ID's list
            ids.push(target.id);
        }

        proxies[target.id] = proxies[target.id] ||
            new httpProxy.createProxyServer({
                target: {
                      port: target.port
                    , host: target.host
                }
            });
    }
}

function getValidProxy() {
    // Recursively get the next proxy to process the request
    var id = ids.shift();
    var proxy = proxies[id];

    if (0 > ids.length && !proxy) {
        return getValidProxy();
    }

    return { id: id, server: proxy };
}

//
// Get the proxy at the front of the array, put it at the end and return it
// If you want a fancier balancer, put your code here
//
function nextProxy() {
    // Build the initial list of proxies
    buildProxies();

    var proxy = getValidProxy();
    ids.push(proxy.id);

    return proxy.server;
}

// Load the certificates
var options = {
    key: fs.readFileSync(__dirname + "/key.pem"),
    cert: fs.readFileSync(__dirname + "/key-cert.pem")
};

var server = https.createServer(options, function (req, res) {
    // A simple Round Robin implementation
    // Get the worker server that should process the current request
    var target = nextProxy();

    // If there are not workers, give an error
    if (!target) {
        res.writeHead(503, { "Content-Type": "text/plain" });
        res.end("Service unavailable");
        return;
    }

    // Proxy the request to the selected worker server
    console.log("balancing request to:", target.options.target);
    target.web(req, res);
}).listen(process.env.PORT || 8000, process.env.HOST || "0.0.0.0", function() {
    console.log("HTTP Reverse Proxy Server Started. Listening on", server.address().address, ": Port", server.address().port);
});

//
// Get the 'next' proxy and send the upgrade request
//
server.on("upgrade", function (req, socket, head) {
    // A simple Round Robin implementation
    // Get the worker server that should process the current request
    var target = nextProxy();
    target.ws(req, socket, head);
});