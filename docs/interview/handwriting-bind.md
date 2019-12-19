# bind

> 语法：
>
> ```js
> function.bind(thisArg[, arg1[, arg2[, ...]]])
> ```

`bind()`返回一个**绑定函数**（**bound function**，BF），绑定函数可看做原函数的拷贝，并拥有指定的 **`this`** 值和初始参数，bind函数特点：

- `bind()` 方法创建一个新的绑定函数。绑定函数是一个 exotic function object（怪异函数对象，ECMAScript 2015 中的术语），它包装了原函数对象。在 `bind()` 被调用时，这个新函数的 this 被指定为 `bind()` 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。
- 绑定函数（怪异函数对象）没有 prototype 属性，但是能使用 new 操作符创建对象。这种行为就像把原函数当成构造器，提供的 this 值会被忽略，但前置参数仍会提供给模拟函数。

## 绑定函数

```js
let fToBound = function(a, b) {
  this.a = a
  this.b = b
}

fToBound.prototype.c = 3

let o = {}

let fbound = fToBound.bind(o, 1)

console.log(fToBound.name)	// fToBound
console.log(fbound.name)	// bound fToBound

let obj = new fbound(2)
console.log(obj.constructor === fToBound)	// true
console.log(obj.__proto__ === fToBound.prototype)	// true
console.log(obj.c)	// 3
```

vscode 调试面板查看绑定函数 fbound 和 obj：

![image-20191219153323611](C:\Users\luojian\AppData\Roaming\Typora\typora-user-images\image-20191219153323611.png)

由上可知，绑定函数有如下特点：

- 绑定函数有如下内部属性：
  - **`[[BoundArgs]]`**：前置参数数组，对包装函数做任何调用都会优先用数组元素填充参数列表
  - **`[[BoundThis]]`**：调用包装函数时始终作为this值传递的值
  - **`[[TargetFunction]]`**：包装的对象函数
- 绑定函数没有 prototype 属性
- 绑定函数的 name 属性等于 bound 加上原函数的 name
- 绑定函数被 new 构造调用时相当于把原函数当做构造函数

当调用绑定函数时，它调用 **`[[TargetFunction]]`** 上的内部方法 **`[[Call]]`**，就像这样 **`Call(boundThis, args)`**。其中，**boundThis** 是 **`[[BoundThis]]`**，**args** 是 **`[[BoundArgs]]`** 加上通过函数调用传入的参数列表。

## polyfill

```js
if (!Function.prototype.bind) {
    Function.prototype.bind = function() {
        let fToBound = this // 缓存原函数
  		let boundThis = arguments[0]  // 绑定函数的this值
  		let boundArgs = Array.prototype.slice.call(arguments, 1) // 绑定函数的前置参数数组

        /**
         * bind只能被函数调用
         */
  		if (typeof fToBound !== 'function') {
    		throw new TypeError('Function.prototype.bind - ' + 'what is trying to be bound is not callable')
  		}

      	/**
       	 * 绑定函数
         * 绑定函数被new构造调用（this instanceof fBound为true）时，this不变
         */
  		let fBound = function() {
    		let _this = this instanceof fBound ? this : boundThis
    		let args = boundArgs.concat(Array.prototype.slice.call(arguments))
    		return fToBound.apply(_this, args)
 		}

  		/**
   		 * 维护原型关系
   		 * 绑定函数标准上是没有prototype，绑定函数被new构造调用相当于把原函数当做构造器，因此
   		 * polyfill时需要将绑定函数的prototype指向原函数的prototype
   		 */
  		if(fToBound.prototype) {
            /**
     		 * 和标准保持一致，使用fBound.prototype = fToBound.prototype，因为
     		 * let obj = new fBound()
     		 * obj.__proto__ === fToBound.prototype // true
     		 * 风险就是修改fBound.prototype就是修改fToBound.prototype
             */
    		fBound.prototype = fToBound.prototype

            // fBound.prototype = Object.create(fToBound.prototype, {
            //   constructor: {
            //     value: fToBound
            //   }
            // })
 		}

  		return fBound
	}
}
```

具体代码见<[https://github.com/whu-luojian/interview-questions/blob/master/%E6%89%8B%E5%86%99%E4%BB%A3%E7%A0%81/bind.js](https://github.com/whu-luojian/interview-questions/blob/master/手写代码/bind.js)>

