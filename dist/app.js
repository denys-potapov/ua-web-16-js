(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global document, window */

var log = function (msg) {
	document.getElementById('console').value += '\n' + msg;
};

var execute = function () {
	var run = require('./runtime.js');
	var parse = require('./parse.js');
	var tokenize = require('./tokenize.js');
	var code = document.getElementById('code').value;
	try {
		run(parse(tokenize(code)), log);
	} catch (e) {
		log(e);
	}
};

document.addEventListener('DOMContentLoaded', execute);
document.getElementById('execute').addEventListener('click', execute);

},{"./parse.js":2,"./runtime.js":3,"./tokenize.js":4}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}]},{},[1]);
