// Include The 'sentiment' Module
var sentiment = require("sentiment");

// Constructor
function Parser() {
    // Initialize all instance properties
    this.items = [];
}

// Prototype Methods
/**
 * Performs sentiment parsing on the provided input array of search results.
 *
 * @param {Number} Input item to be parsed
 *
 * @return {void}
 */
// Eteration function for parsing the score of each item returned from the API
// Using the sentiment module API
Parser.prototype.parse = function(item) {
    // Build the returned items array
    this.items.push(item);

    // Parse score using the sentiment API
    sentiment(item.text, function (err, score) {
        item.score = score;
    });
};

/**
 * Get the already parsed items.
 *
 * @return {Array}
 */
Parser.prototype.getItems = function() {
    return this.items;
};

// Export the object
module.exports = Parser;