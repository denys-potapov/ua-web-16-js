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
