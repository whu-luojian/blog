# JSON.stringify

```js
function jsonStringify(data) {
  let type = typeof data
  if (type !== 'object') {
    // 处理非 null 的基础数据类型和 Function
    // NaN、Infinity、-Infinity 序列化返回 "null"
    if (Number.isNaN(data) || data === Infinity || data === -Infinity) {
      return "null"
    } else if (type === 'function' || type === 'undefined' || type === 'symbol') {
      return undefined
    } else if (type === 'string') {
      return '"' + data + '"'
    }
    return String(data)
  } else {
    if (data === null) {
      return "null"
    } else if (data instanceof Date) {
      // 日期转为字符串
      return jsonStringify(data.toJSON())
    } else if (data instanceof Array) {
      // 处理数组每一项
      let result = []
      data.forEach((item, index) => {
        result[index] = jsonStringify(item)
      })
      result = "[" + result + "]"
      return result.replace(/'/g, '"')
    } else {
      // 处理普通对象
      let result = []
      Object.keys(data).forEach((item) => {
        // key 如果是 symbol 对象，忽略
        if (typeof item !== 'symbol') {
          // 键值为 undefined、function、symbol，忽略
          if (data[item] !== undefined && typeof data[item] !== 'function' && data[item] !== 'symbol') {
            result.push('"' + item + '"' + ":" + jsonStringify(data[item]))
          }
        }
      })
      return ("{" + result + "}").replace(/'/g, '"')
    }
  }
}

// 测试

let a = {
  b: [1, 'a', null]
}

console.log(jsonStringify(a) === JSON.stringify(a))
```
