// Include The 'require.async' Module
require("require.async")(require);

/**
 * Tokenizes an input string.
 *
 * @param {String} Input
 *
 * @return {Array}
 */
function tokenize (input) {
    return input
            .replace(/[^a-zA-Z ]+/g, "")
            .replace("/ {2,}/", " ")
            .toLowerCase()
            .split(" ");
}

/**
 * Performs sentiment analysis on the provided input "term".
 *
 * @param {String} Input term
 *
 * @return {Object}
 */
module.exports = function (term, callback) {

	// Include the AFINN Dictionary JSON asynchronously
	require.async("./AFINN.json", function(afinn) {

        // Split line term to letters only words array
        var words = tokenize(term || "");
        var score = 0;
        var rate;
        var i = 0;

        function calculate(word) {
            // Get the word rate from the AFINN dictionary
            rate = afinn[word];
            if (rate) {
                // Add current word rate to the final calculated sentiment score
                score += rate;
            }

            // Defer next turn execution (Eteration)
            setImmediate(function() {
                // Use callback for completion
                if (i === (words.length - 1)) {
                    callback(null, score);
                }
                else {
                    // Invoke next turn
                    calculate(words[++i]);
                }
            });
        }

        // Start calculating
        calculate(words[i]);
	});
};
