(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global document, window */

var textToSchema = require('./schema')
var bin = require('./bin')
var Proto = require('./proto')

var encode = function () {
  var text = document.getElementById('schema').value
  var obj = JSON.parse(document.getElementById('encode-object').value)
  console.log(text)
  var schema = textToSchema(text)

  var proto = new Proto(schema)
  var arr = proto.encode(obj)
  var bin = bin.encode(arr)

  document.getElementById('encode-binary').value = JSON.stringify(bin)
}

var decode = function () {
  var bin = JSON.stringify(document.getElementById('decode-binary').value)

  var text = document.getElementById('schema').value
  var schema = textToSchema(text)

  var arr = bin.decode(bin)
  var proto = new Proto(schema)
  var obj = proto.decode()

  document.getElementById('decode-object').value = JSON.stringify(obj)
}
document.addEventListener('DOMContentLoaded', encode)
document.addEventListener('DOMContentLoaded', decode)
document.getElementById('encode').addEventListener('click', encode)
document.getElementById('decode').addEventListener('click', decode)

},{"./bin":2,"./proto":3,"./schema":4}],2:[function(require,module,exports){
var encodeNum = function (num) {
  arr = new ArrayBuffer(4)
  view = new DataView(arr)
  view.setUint32(0, num)

  var bytes = []
  var uint8view = new Uint8Array(arr)
  for (var i = 0; i < uint8view.length; i++) {
    bytes.push(uint8view[i])
  }
  return bytes
}

var encodeString = function (str) {
  var bytes = [str.length]
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i)
    bytes.push(code >>> 8)
    bytes.push(code & 0xff)
  }

  return bytes
}

var encodeArray = function (arr) {
  var bytes = []
  arr.forEach(function (el) {
    switch (typeof el) {
      case 'undefined':
        bytes.push(0)
        break
      case 'string':
        bytes.push(1)
        bytes = bytes.concat(encodeString(el))
        break
      case 'number':
        bytes.push(2)
        bytes = bytes.concat(encodeNum(el))
        break
      case 'object':
      case 'array':
        bytes.push(3)
        arrBytes = encodeArray(el)
        bytes.push(arrBytes.length)
        bytes = bytes.concat(arrBytes)
        break
      default:
        throw 'Unknown type' + (typeof el)
    }
  })

  return bytes
}

module.exports.encode = encodeArray

var decodeString = function (bytes) {
  var str = ''
  for (var i = 0; i < bytes.length - 1; i += 2) {
    str += String.fromCharCode(bytes[i] * 0xff + bytes[i + 1])
  }

  return str
}

var decodeNumber = function (bytes) {
  var num = 0
  for (var i = 0; i < 4; i++) {
    num = (num << 2) + bytes[i]
  }

  return num
}

var decodeArray = function (bytes) {
  var arr = []
  var i = 0
  while (i < bytes.length) {
    var type = bytes[i]

    switch (type) {
      case 0:
        arr.push(undefined)
        i++
        break
      case 1:
        var length = bytes[i + 1]

        arr.push(decodeString(bytes.slice(i + 2, i + 2 + length * 2)))
        i += 2 + length * 2
        break
      case 2:
        arr.push(decodeNumber(bytes.slice(i + 1, i + 5)))
        i += 5
        break
      case 3:
        var length = bytes[i + 1]
        arr.push(decodeArray(bytes.slice(i + 2, i + 2 + length)))
        i += 2 + length
        break
      default:
        throw 'Unknown byte at '.i
    }
  }

  return arr
}

module.exports.decode = decodeArray

},{}],3:[function(require,module,exports){
var Proto = function (schemas) {
  this.schemas = schemas
}

Proto.prototype.encodeObj = function (obj, type) {
  var result = []
  this.schemas[type].forEach(function (field) {
    var value = obj[field.name]
    if (!value) {
      if (field.required) {
        throw type + '.' + field.name + ' required'
      }

      result.push(undefined)
      return
    }

    if (field.type in this.schemas) {
      result.push(this.encodeObj(value, field.type))
      return
    }

    if ((typeof value) !== field.type) {
      throw type + '.' + field.name + ' shoud be ' + field.type
    }
    result.push(value)
  }, this)

  return result
}

Proto.prototype.encode = function (obj) {
  var type = Object.keys(obj)[0]
  if (!(type in this.schemas)) {
    throw 'Unknown type '.type
  }

  return [type].concat(this.encodeObj(obj[type], type))
}

Proto.prototype.decodeObj = function (arr, type) {
  var result = {}
  arr.forEach(function (el, i) {
    var field = this.schemas[type][i]
    if (el === undefined) {
      if (field.required) {
        throw 'Unexpected ' + el + ' at ' + field.name
      }

      return
    }
    if (field.type in this.schemas) {
      result[field.name] = this.decodeObj(el, field.type)

      return
    }
    if ((typeof el) != field.type) {
      throw 'Unexpected ' + el + ' at ' + field.name
    }
    result[field.name] = el
  }, this)

  return result
}

Proto.prototype.decode = function (arr) {
  var type = arr[0]
  if (!(type in this.schemas)) {
    throw 'Unknown type '.type
  }
  var obj = {}
  obj[type] = this.decodeObj(arr.slice(1), type)
  return obj
}

module.exports = Proto

},{}],4:[function(require,module,exports){
var getFields = function (fieldsTexts) {
	var fields = [];
	fieldsTexts.split(';').forEach(function (fieldText) {
		fieldText = fieldText.trim();
		if (!fieldText) {
			return;
		}
		opts = fieldText.split(/\s+/);
		fields.push({
			required: (opts[0] == 'required'),
			type: opts[1],
			name: opts[2]
		});
	});

	return fields;
};

module.exports = function textToSchema(text) {
	var rules =  text.match(/\w+\s\{.*?\}/g);
	var schamas = {};
	rules.forEach(function (ruleText){
		var name = ruleText.match(/\w+/);

		schamas[name] = getFields(ruleText.match(/\{(.*?)\}/)[1]);
	});

	return schamas;
}
},{}]},{},[1]);
