var parseList = function (tokens, context) {
	var list = [];

	while (context.position < tokens.length) {
		switch (tokens[context.position].type) {
			case 'openBracket':
				context.position++;
				list.push(parseList(tokens, context));
				break;
			case 'closeBracket':
				return list;
			case 'number':
				list.push({type: 'number', value: parseInt(tokens[context.position].value)});
				break;
			case 'string':
				list.push({type: 'string', value: tokens[context.position].value.slice(1, -1)});
				break;
			case 'atom':
				list.push({type: 'atom', value: tokens[context.position].value});
		}
		context.position++;
	}

	throw 'Input should be a valid list';
};

module.exports = function (tokens) {
	if (tokens[0].type !== 'openBracket') {
		throw 'Input should be a valid list';
	}

	return parseList(tokens, {position: 1});
};
