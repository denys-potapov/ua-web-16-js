var QUnit = require('qunit-cli');

var Proto = require('../src/js/proto');
var bin = require('../src/js/bin');

var schema = {
	Task: [
		{name: 'title', mode: 'required', type: 'string'},
		{name: 'time', mode: 'optional', type: 'int'},
	]
}

QUnit.test('encode-test', function ( assert ) {
	var proto = new Proto(schema);
	assert.deepEqual(proto.encode({Task: {title: 'Task title'}}), ['Task', 'Task title', undefined], 'Encoded');
});

QUnit.test('decode-test', function ( assert ) {
	var proto = new Proto(schema);
	assert.deepEqual(proto.decode(['Task', 'Task title', undefined]), {Task: {title: 'Task title', time: undefined}}, 'Decoded');
});

var schemas = {
	Person: [
		{name: 'name', mode: 'required', type: 'string'}
	],
	Task: [
		{name: 'responsible', mode: 'required', type: 'Person'}
	]
}

QUnit.test('encode-complex-test', function ( assert ) {
	var proto = new Proto(schemas);
	assert.deepEqual(proto.encode({Task: {responsible: {name: 'Bob'}}}), ['Task', ['Bob']], 'Encoded');
});

QUnit.test('bin-encode-test', function ( assert ) {

	assert.deepEqual(bin.encode(['tt', 10]),  [1,2,0,116,0,116,2,0,0,0,10],'bin encoded');
	assert.deepEqual(bin.encode([['tt'], 10]),  [3,6,1,2,0,116,0,116,2,0,0,0,10],'bin array encoded');
});
QUnit.test('bin-decode-test', function ( assert ) {

	assert.deepEqual(bin.decode([1,2,0,116,0,116,2,0,0,0,10]), ['tt', 10], 'bin decoded');
	assert.deepEqual(bin.decode([3,6,1,2,0,116,0,116,2,0,0,0,10]), [['tt'], 10] ,'bin array decoded');

});



