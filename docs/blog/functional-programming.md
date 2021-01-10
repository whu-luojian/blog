# 函数式编程

函数式编程是和面向对象编程（Object-oriented programming）和过程式编程（Procedural programming）并列的编程范式。

## 范畴论

- 范畴论是函数式编程的起源。
- 范畴论（Category Theory）是数学中的一个抽象分支，能够形式化诸如集合论（set theory）、类型论（type theory）、群论（group theory）以及逻辑学（logic）等数学分支中的一些概念。

![img](http://www.ruanyifeng.com/blogimg/asset/2017/bg2017022210.jpg)

- **范畴**是一组**对象**及其关系的集合，这些对象之间的关系（称为**态射**，morphisms）在**组合**（composition ）和**结合性**（associativity）方面表现良好。上图中，各个点与它们之间的箭头，就构成一个范畴。同一个范畴的所有成员（对象），就是不同状态的“变形”（transformation），箭头表示范畴成员之间的关系，正式名称叫做“态射”（morphism）。
- 集合范畴由集合和它们之间的关系（映射）组成；群范畴由群和它们之间的关系（群同态）组成；拓扑空间范畴由拓扑空间和它们之间的关系（连续映射）组成。在函数式编程中，成员（对象）就是数据类型，例如 `String`、`Boolean`、`Number` 和 `Object` 等等；“态射”就是标准的、普通的纯函数。
- 本质上，函数式编程只是范畴论的运算方法，跟数理逻辑、微积分、行列式是同一类东西，都是数学方法。它是一种数学运算，理论上通过函数，就可以从范畴的一个成员，算出其他成员，因此函数式编程要求函数必须是纯函数。

## 纯函数

> 纯函数是这样一种函数，即相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用。

```js
// 不纯的
let minimum = 21

let checkAge = function(age) {
  return age >= minimum
}


// 纯的
let checkAge = function(age) {
  let minimum = 21
  return age >= minimum
}
```

### 副作用

副作用是在计算结果的过程中，系统状态的一种变化，或者与外部世界进行的可观察的交互。

副作用可能包含，但不限于：

- 更改文件系统
- 往数据库插入记录
- 发送一个 `http` 请求
- 可变数据
- 打印/log
- 获取用户输入
- DOM查询
- 访问系统状态

概括来讲，只要是跟函数外部环境发生的交互就都是副作用。

### 数学中的函数

![img](https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-M4muAGLNCRVf0FD1jja%2F-M4muC3cBhYYn0VJky6B%2F-M4muEM0nwvSdpoVd6bg%2Ffunction-sets.gif?generation=1586770803852414&alt=media)![img](https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-M4muAGLNCRVf0FD1jja%2F-M4muC3cBhYYn0VJky6B%2F-M4muEM2QPWALjZWvt5j%2Frelation-not-function.gif?generation=1586770803598157&alt=media)

**纯函数就是数学中的函数**：

- 函数是两种数值之间的关系：输入和输出。
- 每一个输入值返回且只返回一个输出值，即一一映射。
- 不同的输入可以有相同的输出。

### 纯函数的好处

#### 可缓存性

纯函数总能够根据输入来做缓存，实现缓存的一种典型方式是 `memoize` 技术。

```js
const memoize = function(f) {
  const cache = {}

  return function(...args) {
    const arg_str = JSON.stringify(args)
    cache[arg_str] = cache[arg_str] || f.apply(f, args)
    return cache[arg_str]
  }
}

const squareNumber = memoize(x => x * x)

squareNumber(4); // => 16

squareNumber(4); // => 16  从缓存中读取输入值为 4 的结果

```

#### 可移值性

纯函数的依赖很明确，纯函数的所有依赖必须通过参数传递，从函数签名我们就可以推断出纯函数的作用。

纯函数和环境无关，可以在任何地方运行，可移植性可以意味着把函数序列化（serializing）并通过 socket 发送。也可以意味着代码能够在 web workers 中运行。

#### 可测试性

纯函数让测试更加容易。我们不需要伪造一个“真实的”环境，或者每一次测试之前都要配置、之后都要断言状态（assert the state）。只需简单地给函数一个输入，然后断言输出就好了。

## 柯里化（curry）

> 柯里化（curry）和组合（compose）是函数式编程的两个最基本的运算。

### 偏函数/局部应用（partial application）

偏函数是指固定一个函数的一个或多个参数，然后产生另一个更小元的函数，也就是将一个 n 元函数转换成一个 n - x 元函数。

```js
// 生成偏函数的工厂
const partial = (f, ...args) => (...moreArgs) => f(...args, ...moreArgs)
const rightPartial = (f, ...args) => (...moreArgs) => f(...moreArgs, ...args)

const add = (a, b, c) => a + b + c

// 固定参数 1 和 2，返回一个单参数函数
const fiveThree = partial(add, 1, 2) // 等价于 add.bind(null, 1, 2)

fiveThree(3) // => 6
```

### 柯里化

柯里化是将一个多参数函数转换成多个嵌套单参数函数，也就是将一个 n 元函数转换成 n 个嵌套的一元函数。也就是把 `f(a, b, c)` 转换成 `f(a)(b)(c)`。

```js
const add = (a, b, c) => a + b + c

// 柯里化之后
// const curryAdd = a => b => c => a + b + c
const curryAdd = function(a) {
    return function(b) {
        return function(c) {
            return a + b + c
        }
    }
}

add(1, 2, 3) === curryAdd(1)(2)(3) === 6
```

```js
// 柯里化工厂函数， curry 函数也允许一次传递多个参数
const curry = fn => {
    return judge = (...args) => args.length === fn.length
        ? fn(...args)
    	: (...moreArgs) => judge(...args, ...moreArgs)
}

const add = (a, b, c) => a + b + c

const curryAdd = curry(add)

add(1, 2, 3) // => 6
curryAdd(1, 2, 3) // => 6
curryAdd(1, 2)(3) // => 6
curryAdd(1)(2, 3) // => 6
curryAdd(1)(2)(3) // => 6
```

### 反柯里化

- 函数柯里化，是固定部分参数，返回一个接受剩余参数的函数，也称部分计算函数，目的是为了缩小适用范围，创建一个针对性更强的函数。
- 反柯里化函数，从字面将，意义和用法跟函数柯里化正好相反，扩大适用范围，创建一个应用范围更广的函数。使本来只有特定对象才适用的方法，扩展到更多的对象。

```js
const unCurring = function(fn) {
    return function(...args) {
        const obj = args.shift()
        return fn.apply(obj, args)
    }
}

const push = unCurring(Array.prototype.push)
// 对象也能 push
const obj = {}
push(obj, 'one', 'two') // => {0: 'one', 1: 'two', length: 2}

```



## 组合（compose）

![img](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/images/cat_comp1.png)

![img](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/images/cat_comp2.png)

如果一个值要经过多个函数，才能变成另外一个值，为了解决函数嵌套（洋葱式代码`h(g(f(x)))`）就可以把所有中间步骤合并成一个函数，这叫做函数组合（compose）。

```js
const compose = (f, g) => (x => f(g(x)))

// first:: [a] -> a
const first = arr => arr[0]
// reverse:: [a] -> [a]
const reverse = arr => arr.reverse()

const last = compose(first, reverse)

last([1, 2, 3, 4]) // => 4
```

```js
// 通用 compose 函数
const compose = (...funcs) => {
    const identity = x => x
    return funcs.reduce((a, b) => (...args) => a(b(...args)), identity)
}
```

**compose 函数特点：**

- 参数是多个函数，返回值是一个“组合函数”；
- 组合函数内的所有函数从右至左依次执行，从右向左执行更加能够反映数学上的含义；
- 组合函数内除了第一个执行函数的参数是多元的，其他函数的参数都是接收上一个函数的返回值。一般来说，约定每个函数都为一元函数。

**结合律：**

![img](http://www.ruanyifeng.com/blogimg/asset/2017/bg2017022209.png)

```js
/**
* 以下三种方式效果一致
*/
compose(f, compose(g, h))
compose(compose(f, g), h)
compose(f, g, h)
```

### pipe（管道）

- compose 函数的数据流是从右至左，pipe 函数的数据流是从左至右（gulp、rxjs）。

```js
// rxjs 是主流的基于函数式编程的响应式编程库
import { from } from 'rxjs'
import { map, filter, catchError } from 'rxjs/operators'

from([1, 2, 3]).pipe(
  filter(x => x % 2 === 0), // 过滤出偶数
  map(x => x * x), // 求平方
  catchError(err => console.error(err)) // 错误处理
).subscribe(console.log)

```

```js
pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
  if (operations.length === 0) {
    return this as any;
  }
  if (operations.length == 1) {
     return operation[0];
  }
  
  return operations.reduce((prev, fn) => fn(prev), this);
}
```

函数式编程有三大特性：声明式的，不可变的，没有副作用的。函数式的程序就是通过管道把数据在一系列纯函数之间传递的程序。



## 范畴与容器

我们可以把范畴想象成是一个容器，里面包含两样东西：值（value）、值的变形关系（函数）。

```js
const Container = function(x) {
    this.__value = x
}

// of 函数用于生成新的容器
Container.of = function(x) {
    return new Container(x)
}
```

函数不仅可以用于同一个范畴之间值的转换，还可以用于将一个范畴转成另一个范畴。这就涉及到了函子（Functor）。

实现了 `of` 方法的 `functor` 称为 `pointed functor`。

## 函子（Functor）

函子是函数式编程里面最重要的数据类型，也是基本的运算单位和功能单位。

它首先是一种范畴，也就是说，是一个容器，包含了值和变形关系。**比较特殊的是，它的变形关系可以依次作用于每一个值，将当前容器变形成另一个容器。**

![img](https://gblobscdn.gitbook.com/assets%2F-M4muAGLNCRVf0FD1jja%2F-M4muC3cBhYYn0VJky6B%2F-M4muCdj085CCBMXut9Y%2Fcatmap.png?alt=media)

- **函子的标志就是容器具有`map`方法。该方法将容器里面的每一个值，映射到另一个容器。**

```js
class Functor {
    constructor(x) {
        this.__value = x
    }
    
    map(f: Function): Functor {
        return Functor.of(f(this.__value))
    }
}

Functor.of = function(x) {
    return new Functor(x)
}
```

- 上面代码中，`Functor` 是一个函子，它的 `map` 方法接受函数 f 作为 参数，然后返回一个新的函子，里面包含的值是被 f 处理过的 （`f(this.val)`）。 
- 函数式编程里面的运算，都是通过函子完成，即运算不直接针对值，而是针对这个值的容器----函子。函子本身具有对外接口（`map`方法），各种函数就是运算符，通过接口接入容器，引发容器里面的值的变形。`Container` 里的值传递给 `map` 函数之后，就可以任我们操作；操作结束后，为了防止意外再把它放回它所属的 `Container`。这样做的结果是，我们能连续地调用 `map`，运行任何我们想运行的函数。一直调用 `map`，就是组合（`compose`）。

### Maybe 函子

函子通过 `map` 接受各种函数，处理容器内部的值。容器内部的值可能是一个空值（比如`null`），而外部函数未必有处理空值的机制，这时很可能就会出错。

```js
Functor.of(null).map(x => x.toString()) // => TypeError
```

`Maybe` 函子就是用来处理这种情况的。`Maybe` 的 `map` 函数会先进行空值检查，然后才调用传进来的函数，这样处理空值就不会出错了。

```js
class Maybe extends Functor {
    isNullOrUndefined() {
        return this.__value === null || this.__value === undefined
    }
    
    map(f) {
        return this.isNullOrUndefined() ? Maybe.of(null) : Maybe.of(f(this.__value))
    }
}

Maybe.of = function(x) {
    return new Maybe(x)
}

Maybe.of(null).map(x => x.toString()) // => Maybe(null)
```

### Either 函子

`Either` 函子是一种更纯粹的处理错误的方式，`Either` 函子内部有两个值：左值（`Left`）和右值（`Right`）。右值是正常情况下使用的值，左值是右值不存在时使用的默认值。

```js
// Left
class Left extends Functor { 
    map(f) {
        return this
    }
}
Left.of = function(x) {
  	return new Left(x);
}

// Right
class Right extends Functor { 
    map(f) {
        return new Right.of(f(this.__value))
    }
}
Right.of = function(x) {
  	return new Right(x)
}

const getAge = user => user.age ? Right.of(user.age) : Left.of("ERROR!")

getAge({name: 'stark', age: '21'})
    .map(age => 'Age is ' + age) //=> Right('Age is 21') 

getAge({name: 'stark'})
    .map(age => 'Age is ' + age); //=> Left('ERROR!') 
```

- `Left` 可以让调用链中任意一环的错误立刻返回到调用链的尾 部，这给我们错误处理带来了很大的方便，再也不用一层又一 层的 `try/catch`。

### IO 函子

从`localStorage` 中取值的函数会产生副作用，但是把它包裹在另个函数里延迟执行可以使它看起来像一个纯函数。

```js
const getFromStorage = function(key) {
    return function() {
        return localStorage[key]
    }
}
```

`IO` 函子的 `__value` 是一个函数，它把不纯的操作（比如 IO、网络请求）包裹到一个函数内，目的是延迟执行这个非纯动作。

```js
class IO {
    constructor(f: Function) {
        this.__value = f
    }
    
    map(f) {
        return IO.of(compose(f, this.__value))
    }
}

IO.of = function(x) {
    return new IO(function() {
        return x
    })
}
```

### AP 函子（application functor）

函子里面包含的值，完全可能是函数。我们可以想象这样一种情况，一个函子的值是数值，另一个函子的值是函数。

```js
function addTwo(x) {
  return x + 2
}

const A = Functor.of(2)
const B = Functor.of(addTwo)
```

我们想让函子 `B` 内部的函数，可以使用函子 `A` 内部的值进行运算。这时就需要用到 `ap` 函子。

 `ap` 函子是实现了 实现了 `ap` 方法的 `pointed functor` ，赋予不同 `functor` 可以相互应用（`apply`）的能力。

```js
class Ap extends Functor {
  	ap(F: Functor) {
    	return Ap.of(this.__value(F.__value))
  	}
}

Ap.of = function(x) {
    return new Ap(x)
}

Ap.of(addTwo).ap(Functor.of(2)) // => Ap(4)
```

`ap` 函子的意义在于，对于那些多参数的函数，就可以从多个容器之中取值，实现函子的链式操作。

```js
function add(x) {
    return function(y) {
        return x + y
    }
}

Ap.of(add).ap(Functor(2)).ap(Functor(3)) // => Ap(5)
```

### Monad 函子

函子是一个容器，可以包含任何值。函子之中再包含一个函子，也是完全合法的。但是，这样就会出现多层嵌套的函子。

```js
Functor.of(Functor.of(Functor.of(6)))
```

上面的函子如果要取出内部的值，就要连续取三次 `this.__value`。这个时候需要 `monad` 函子。

`monad` 是可以变扁（`flatten`）的 `pointed functor` 。

```js
class Monad extends Functor {
  	join() {
    	return this.__value
  	}
    
  	flatMap(f) {
    	return this.map(f).join()
  	}
}
```

**Monad 函子的作用是，总是返回一个单层的函子。**它有一个 `flatMap` 方法，与`map`方法作用相同，唯一的区别是如果生成了一个嵌套函子， `flatMap`  会取出后者内部的值，保证返回的永远是一个单层的容器，不会出现嵌套的情况，即嵌套的函子会被铺平（`flatten`）。

## 应用

- `Rxjs` （函数响应式编程）
- `lodash` 、`underscore`
- `redux` (状态机和函数式编程)

![](data:image/png;base64,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)

```js
store -> container
state -> __value
action -> Functor
reducer -> map
middleware -> IO functor(异步)
```



## 总结

- 函数式编程不是万能的，它和 `OOP` 一样，只是一种编程范式而已。`OOP` 降低复杂度是靠良好的封装、继承、多态以及接口定义；函数式编程是通过纯函数以及它们的组合、柯里化、`Functor` 等技术来降低系统复杂度。
- 很多实际应用中是很难用函数式编程去表示的，只要记住函数对于外部状态的依赖是造成系统复杂性大大提高的主要原因，尽量让函数尽可能纯净就行。

