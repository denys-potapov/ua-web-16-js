var QUnit = require('qunit-cli');

var Proto = require('../src/js/proto');
var bin = require('../src/js/bin');
var textToSchema = require('../src/js/schema');

var schema = {
	Task: [
		{name: 'title', required: true, type: 'string'},
		{name: 'time', type: 'int'},
	]
}

QUnit.test('encode-test', function ( assert ) {
	var proto = new Proto(schema);
	assert.deepEqual(proto.encode({Task: {title: 'Task title'}}), ['Task', 'Task title', undefined], 'Encoded');
});

QUnit.test('encode-validate-test', function ( assert ) {
	var proto = new Proto(schema);
	assert.throws(
		function () {
			proto.encode({Task: {time: 10}}); 
		},
		/required/,
	'Required validated');
	assert.throws(
		function () {
			proto.encode({Task: {title: 10}}); 
		},
		/string/,
	'Type validated');
});

QUnit.test('decode-test', function ( assert ) {
	var proto = new Proto(schema);
	assert.deepEqual(proto.decode(['Task', 'Task title', undefined]), {Task: {title: 'Task title'}}, 'Decoded');
});

QUnit.test('decode-validate-test', function ( assert ) {
	var proto = new Proto(schema);
	assert.throws(
		function () {
			proto.decode(['Task', 10, undefined]);
		},
		/Unexpected/,
		'Required validated');
});

var schemas = {
	Person: [
		{name: 'name', required: true, type: 'string'}
	],
	Task: [
		{name: 'responsible', required: true, type: 'Person'}
	]
}

QUnit.test('encode-complex-test', function ( assert ) {
	var proto = new Proto(schemas);
	assert.deepEqual(proto.encode({Task: {responsible: {name: 'Bob'}}}), ['Task', ['Bob']], 'Encoded');
});

QUnit.test('decode-complex-test', function ( assert ) {
	var proto = new Proto(schemas);
	assert.deepEqual(proto.decode(['Task', ['Bob']]), {Task: {responsible: {name: 'Bob'}}}, 'Encoded');
});

QUnit.test('bin-encode-test', function ( assert ) {

	assert.deepEqual(bin.encode(['tt', 10]),  [1,2,0,116,0,116,2,0,0,0,10],'bin encoded');
	assert.deepEqual(bin.encode([['tt'], 10]),  [3,6,1,2,0,116,0,116,2,0,0,0,10],'bin array encoded');
});
QUnit.test('bin-decode-test', function ( assert ) {

	assert.deepEqual(bin.decode([1,2,0,116,0,116,2,0,0,0,10]), ['tt', 10], 'bin decoded');
	assert.deepEqual(bin.decode([3,6,1,2,0,116,0,116,2,0,0,0,10]), [['tt'], 10] ,'bin array decoded');

});

QUnit.test('bin-decode-test', function ( assert ) {
	var text = "\
	User {required string name; optional int age; } \
	Time {required string name;} \
	";
	assert.deepEqual(textToSchema(text), 
		{ User:
   			[ { required: true, type: 'string', name: 'name' },
     		  { required: false, type: 'int', name: 'age' } ],
  		Time: [ { required: true, type: 'string', name: 'name' } ] },
   'schema loadedd');
});




