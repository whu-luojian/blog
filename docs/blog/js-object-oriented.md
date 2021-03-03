# JavaScript 面向对象：原型和继承

## \__proto__和prototype

**对象的\__proto__属性 = 构造该对象的构造函数的prototype**

- `__proto__ `是每个对象都有的一个属性，可称为隐式原型。
- `prototype` 是函数（除部分内置函数）特有的属性，称为原型属性。这个属性是一个指针，指向一个对象，称为原型对象。原型对象包含所有实例共享的属性和方法。原型对象有一个`constructor`属性，指向原构造函数。
- bind产生的函数没有prototype属性（Function objects created using Function.prototype.bind are exotic objects. They also do not have a prototype property.）
- 一个对象的隐式原型指向构造该对象的构造函数的原型，即指向构造函数的 `prototype`

![原型图](prototype.png)

## Object.create()、Object.getPrototypeOf() 和 Object.setPrototypeOf()

- `Object.create(p)`创建一个以p为原型的对象，即对象的**`__proto__`**属性为p。
- `Object.getPrototypeOf()` 和 `Object.setPrototypeOf()` 用于获取和设置对象的原型（**`__proto__` **属性）

```js
let p = {
  name: "a"
}

let a = {}
let b = new Object()
let c = Object.create(null)
let d = Object.create(p)

console.log(a.__proto__) // Object
console.log(b.__proto__) // Object
console.log(c.__proto__) // undefined
console.log(d.__proto__) // p
console.log(Object.getPrototypeOf(d)) // p

// 将 d 的原型设置为 a，d.__proto__ = a
Object.setPrototypeOf(d, a)
console.log(Object.getPrototypeOf(d)) // a
```

## 继承

封装一个对象由构造函数与原型共同组成，因此继承也为**构造函数的继承**和**原型的继承**两步。

先封装一个父类对象 `Person`：

```js
let Person = function(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.getName = function() {
  return this.name
}

Person.prototype.getAge = function() {
  return this.age
}
```

Student` 继承 `Person

```js
// 构造函数继承
let Student = function(name, age, grade) {
  Person.call(this, name, age)
  this.grade = grade
}

// 原型继承
Student.prototype = Object.create(Person.prototype, {
  // 重新指定新的constructor属性
  constructor: {
    value: Student
  },

  // 添加新的实例共享属性或方法
  getGrade: {
    value: function() {
      return this.grade
    }
  }
})
```

## 实现 new

代码可见 [github]([https://github.com/whu-luojian/interview-questions/blob/master/%E6%89%8B%E5%86%99%E4%BB%A3%E7%A0%81/new.js](https://github.com/whu-luojian/interview-questions/blob/master/手写代码/new.js))

```js
/**
 * 1. 创建一个新对象
 * 2. 新对象的原型指向构造函数的原型
 * 3. 绑定this
 * 4. 确定返回值
 */
// create函数接收的第一个参数为构造函数，其余为构造函数的参数
 function create() {
   // 创建一个空对象
   let obj = {}
   // 获取构造函数（传入的第一个参数）
   let Con = Array.prototype.shift.call(arguments)
   // 链接到原型
   Object.setPrototypeOf(obj, Con.prototype)
   // 绑定this，执行构造函数
   let result = Con.apply(obj, arguments)
   // 如果构造函数返回的不是对象，则返回创建的新对象
   const isObject = typeof result === 'object' && result !== null
   const isFunction = typeof result === 'function'
   return isObject || isFunction ? result : obj
 }
```

