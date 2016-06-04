var Proto = function (schemas) {
	this.schemas = schemas;
}

Proto.prototype.encodeObj = function (obj, type) {
	var result = [];
	this.schemas[type].forEach(function(field) {
		if (field.type in this.schemas) {
			result.push(this.encodeObj(obj[field.name], field.type))
		} else {
			result.push(obj[field.name]);			
		}
	}, this);

	return result;
}

Proto.prototype.encode = function (obj) {
	var type = Object.keys(obj)[0];
	if (!(type in this.schemas)) {
		throw "Unknown type " . type;
	}

	return [type].concat(this.encodeObj(obj[type], type));
}

var decodeObj = function (arr, schema) {
	var result = {};
	arr.forEach(function(el, i) {
		result[schema[i].name] = el;
	}, this);

	return result;
}

Proto.prototype.decode = function (arr) {
	var type = arr[0];
	if (!(type in this.schemas)) {
		throw "Unknown type " . type;
	}
	var obj = {};
	obj[type] = decodeObj(arr.slice(1), this.schemas[type]);
	return obj;
}

module.exports = Proto;
