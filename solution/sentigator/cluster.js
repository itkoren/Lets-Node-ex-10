// Include The 'cluster' Module
var cluster = require("cluster");

var numCPUs = require("os").cpus().length;

var sentigator = require("./sentigator");

// Check whether it is a forked worker or master
if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs - 1; i++) {
        cluster.fork();
    }

    cluster.on("exit", function(worker, code, signal) {
        console.log("worker " + worker.process.pid + " died");
        // We can use this handler to fork a new worker
        // instead of the one that died
        cluster.fork();
    });
}
else {
    // Workers can share any TCP connection
    // In this case its an Express server
    var app = sentigator();
}