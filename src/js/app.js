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
