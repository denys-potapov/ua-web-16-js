var lexemes = [
	{regExp: /^\(/, type: 'openBracket'},
	{regExp: /^\)/, type: 'closeBracket'},
	{regExp: /^\s+/, type: false}, // whitespace
	{regExp: /^\;[^\n\r]+/, type: false}, // comment
	{regExp: /^\d+/, type: 'number'},
	{regExp: /^\".*?\"/, type: 'string'},
	{regExp: /^[^ \f\n\r\t\v\(\)]+/, type: 'atom'}
];

module.exports = function (code) {
	var tokens = [];

	while (code.length > 0) {
		for (var i = 0; i < lexemes.length; i++) {
			var match = code.match(lexemes[i].regExp);
			if (match !== null) {
				code = code.substr(match[0].length);
				if (lexemes[i].type) {
					tokens.push({type: lexemes[i].type, value: match[0]});
				}
			}
		}
	}

	return tokens;
};
