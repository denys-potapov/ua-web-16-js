var Proto = function (schemas) {
	this.types = ['string', 'number', 'boolean'];
	this.schemas = schemas;
}

var encodeObj = function (obj, schema) {
	var result = [];
	schema.forEach(function(field) {
		result.push(obj[field.name]);
	}, this);

	return result;
}

Proto.prototype.encode = function (obj) {
	var type = Object.keys(obj)[0];
	if (!(type in this.schemas)) {
		throw "Unknown type " . type;
	}

	return [type].concat(encodeObj(obj[type], this.schemas[type]));
}

var decodeObj = function (arr, schema) {
	var result = {};
	arr.forEach(function(el, i) {
		result[schema[i].name] = el;
	}, this);
	console.log(result);
	return result;
}

Proto.prototype.decode = function (arr) {
	var type = arr[0];
	if (!(type in this.schemas)) {
		throw "Unknown type " . type;
	}

	return decodeObj(arr.slice(1), this.schemas[type]);
}

module.exports = Proto;
