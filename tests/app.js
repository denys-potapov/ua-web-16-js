var QUnit = require('qunit-cli');

QUnit.test('firts-test', function ( assert ) {

	assert.deepEqual(tokenize(code), tokens, 'Passed!');
});
