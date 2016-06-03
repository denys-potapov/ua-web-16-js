var QUnit = require('qunit-cli');

var tokenize = require('../src/js/tokenize.js');
var parse = require('../src/js/parse.js');
var run = require('../src/js/runtime.js');

QUnit.test('lexer', function ( assert ) {
	var code = "(if \"string\" 10 \"string\") ; comment \n test";
	var tokens = [
		{type: 'openBracket', value: '('},
		{type: 'atom', value: 'if'},
		{type: 'string', value: '"string"'},
		{type: 'number', value: '10'},
		{type: 'string', value: '"string"'},
		{type: 'closeBracket', value: ')'},
		{type: 'atom', value: 'test'},
	];

	assert.deepEqual(tokenize(code), tokens, 'Passed!');
});

QUnit.test('parser', function ( assert ) {
	var tokens = [
		{type: 'openBracket', value: '('},
		{type: 'atom', value: 'if'},
		{type: 'openBracket', value: '('},
		{type: 'number', value: '10'},
		{type: 'number', value: '20'},
		{type: 'closeBracket', value: ')'},
		{type: 'string', value: '"string"'},
		{type: 'closeBracket', value: ')'}
	];
	var ast = [
		{type: 'atom', value: 'if'},
		[{type: 'number', value: 10}, {type: 'number', value: 20}],
		{type: 'string', value: 'string'}
	]
	assert.deepEqual(parse(tokens), ast, 'Passed!');

	tokens = [ 
		{type: 'atom', value: 'if'}
	];

	assert.throws(function () { parse(tokens) }, 'Input should be a valid list', 'Passed!');

	tokens = [
		{type: 'openBracket', value: '('},
		{type: 'atom', value: 'if'},
		{type: 'number', value: '10'},
		{type: 'string', value: '"string"'},
	];
	assert.throws(function () { parse(tokens) }, 'Input should be a valid list', 'Passed!');
});

QUnit.test('runtime-simple', function ( assert ) {
	var code = '(+ "+" string)';
	assert.equal(run(parse(tokenize(code))), "+string", 'Passed!');
});

QUnit.test('runtime-NL', function ( assert ) {
	var code = '(+ NL string)';
	assert.equal(run(parse(tokenize(code))), "\nstring", 'Passed!');
});

QUnit.test('runtime-new', function ( assert ) {
	window = {'Array': Array};
	var code = '(new Array (one two))';
 	assert.deepEqual(run(parse(tokenize(code))), ["one", "two"], 'Passed!');
});

QUnit.test('runtime-map-array', function ( assert ) {
	var code = '([] one ({} value true))';
	assert.deepEqual(run(parse(tokenize(code))), ["one", {value: true}], 'Passed!');
});