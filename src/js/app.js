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
