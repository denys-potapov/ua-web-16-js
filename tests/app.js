var QUnit = require('qunit-cli');

var Proto = require('../src/js/proto');

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


