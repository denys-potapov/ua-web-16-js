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
