# cloneDeep

## 使用slice或者concat进行数组深拷贝

- 对于值都是普通数据类型的数组，可以使用数组的 `slice` 或者 `concat` 函数来进行深拷贝。

```js
let a = [1, 2, 3]
let b = a.slice(0) //或者 let b = a.concat()
b[0] = 0
console.log(a[0] === 1) //true,改变b不影响a
```

- 若数组的项不是普通数据类型，而是引用数据类型，则使用 `slice` 或 `concat` 进行拷贝则只能进行一层深拷贝，也就是数组项内部不能进行深拷贝。如下，数组第一项为一个对象，改变b数组第一项中对象的key属性值，对应的a数组也被改变了。

```js
let a = [{
  key: 1
}]
let b = a.slice(0) //或者 let b = a.concat()
b[0].key = 0
console.log(a[0].key === 0) //true,改变b影响a
```

## 使用`JSON`序列化函数进行深拷贝

```js
function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj))
}
```

1. 支持数组和常规对象深拷贝

```js
let obj = [{
  key: 1
}]
let newObj = cloneDeep(obj)
newObj[0].key = 0
console.log(obj[0].key) // 1
```

2. 不支持 `undefined` ，会转成 `null`

```js
let a = [1, , 2]
let b = colne(a)
console.log(a[1]) // undefined
console.log(b[1]) // null
```

3. 不支持函数、`RegExp`、`Date` 对象，会报错

```js
let func = function() {
  console.log(1)
}
let newFunc = colne(func)  //直接报错
```

## ES6 终极版

```js
const isObject = obj => {
  return typeof obj === "object" && obj != null
}

const cloneDeep = (obj, hash = new WeakMap()) => {
  if (!isObject(obj)) {
    return obj
  }

  if (hash.has(obj)) { // 避免成环
    return hash.get(obj)
  }

  const type = [Date, RegExp, Set, Map, WeakMap, WeakSet]
  if (type.includes(obj.constructor)) {
    return new obj.constructor(obj)
  }

  const allDesc = Object.getOwnPropertyDescriptors(obj) // 遍历传入参数所有键的特性
  const cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc) // 继承原型
  hash.set(obj, cloneObj)

  for (let key of Reflect.ownKeys(obj)) {
    // Reflect.ownKeys(obj)可以拷贝不可枚举属性和Symbol类型
    // 注意：writable 为 false 的属性会赋值失败，因此 writable 为 false 的属性是浅拷贝
    cloneObj[key] = isObject(obj[key]) ? cloneDeep(obj[key], hash) : obj[key]
  }

  return cloneObj
}

// 测试
let obj = {
  bigInt: BigInt(12312),
  set: new Set([2]),
  map: new Map([
    ["a", 22],
    ["b", 33]
  ]),
  num: 0,
  str: "",
  boolean: true,
  unf: undefined,
  nul: null,
  obj: {
    name: "我是一个对象",
    id: 1
  },
  arr: [0, 1, 2],
  func: function () {
    console.log("我是一个函数")
  },
  date: new Date(0),
  reg: new RegExp("/我是一个正则/ig"),
  [Symbol("1")]: 1
}

Object.defineProperty(obj, "inenumerable", {
  enumerable: false,
  value: [1, [2]]
})

obj = Object.create(obj, Object.getOwnPropertyDescriptors(obj))
obj.loop = obj

let cloneObj = cloneDeep(obj)

console.log("obj", obj)
console.log("cloneObj", cloneObj)

for (let key of Reflect.ownKeys(cloneObj)) {
  if (isObject(cloneObj[key])) {
    // 注意：inenumerable 属性 writable 为 false, 为浅拷贝，输出 true
    console.log(`${key}相同吗？ `, cloneObj[key] === obj[key])
  }
}

// set相同吗？  false
// map相同吗？  false
// obj相同吗？  false
// arr相同吗？  false
// date相同吗？  false
// reg相同吗？  false
// innumerable相同吗？  true
// loop相同吗？  false
```