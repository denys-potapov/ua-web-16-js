var evl = function (ast, stack) {
	if (ast.type == 'atom') {
		return (ast.value in stack) ? stack[ast.value]: ast.value;
	}
	if (!Array.isArray(ast)) {
		return (ast.value ? ast.value : ast);
	}

	if (!(ast[0].value in stack)) {
		throw 'Undefined atom ' + ast[0].value;
	}

	return stack[ast[0].value](ast, stack);
};

var define = function (ast, stack) {
	stack[ast[1][0].value] = function (bind, stack) {
		var newStack = Object.create(stack);
		var bindings = listEvl(bind, stack);
		for (var i = 1; i < ast[1].length; i++) {
			newStack[ast[1][i].value] = bindings[i];
		}
		try {
			var result = evl(ast[2], newStack);
		} catch (e) {
			throw('Error at ' + ast[1][0].value + '(' + JSON.stringify(bindings) + '): ' + e)
		}
		if (stack.debug) {
			stack.debug('DEBUG: ' + ast[1][0].value + '(' + JSON.stringify(bindings) + '): ' + JSON.stringify(result));
		}
		return result;
	};

	return stack[ast[1][0].value];
};

var applyEvl = function (callback) {
	return function (ast, stack) {
		return callback.apply(callback, listEvl(ast, stack).slice(1));
	};
};

var listEvl = function (ast, stack) {
	return ast.map(function (e, i) { return evl(e, stack); });
};

var globals = {
	'define': define,
	'true': true,
	'false': false,
	'NL': '\n',
	'console': console,
	'document': (typeof document !== 'undefined') ? document : null,
	'window': (typeof window !== 'undefined') ? window : null,

	'+': applyEvl(function (a, b) { return a + b; }),
	'.': applyEvl(function (obj, prop) { return obj[prop]; }),
	'do': applyEvl(function () { return arguments[arguments.length - 1]; }),
	'bind': applyEvl(function (obj, prop, value) { return obj[prop] = value; }),

	'set': function (ast, stack) { return (stack[ast[1].value] = evl(ast[2], stack)); },
	'if': function (ast, stack) { return evl(ast[1], stack) ? evl(ast[2], stack) : evl(ast[3], stack); },
	'new': function (ast, stack) {
		var cls = window[evl(ast[1], stack)];
		var args = [null].concat(listEvl(ast[2], stack));

		return new (Function.prototype.bind.apply(cls, args));
	},
	'send': function (ast, stack) {
		var obj = evl(ast[1], stack);

		return obj[evl(ast[2], stack)].apply(obj, listEvl(ast[3], stack));
	},
	'[]': function (ast, stack) { return listEvl(ast, stack).slice(1); },
	'{}': function (ast, stack) {
		var result = {};
		for (var i = 2; i < ast.length; i += 2) {
			result[evl(ast[i - 1], stack)] = evl(ast[i], stack);
		}
		return result;
	},
	'fun': function (ast, stack) {
		return function () {
			var fun = evl(ast[1], stack);
			var args = [fun];
			for (var i = 0; i < arguments.length; i += 1) {
				args.push(arguments[i]);
			}
			fun(args, stack);
		};
	}
};

module.exports = function (ast, debug) {
	globals.debug = debug;
	globals.console = {log: debug};

	return evl(ast, globals);
};
