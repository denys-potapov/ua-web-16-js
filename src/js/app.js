/* global document, window */

var log = function (msg) {
	document.getElementById('console').value += '\n' + msg;
};

var execute = function () {
	var parse = require('./parse.js');

};

document.addEventListener('DOMContentLoaded', execute);
document.getElementById('execute').addEventListener('click', execute);
