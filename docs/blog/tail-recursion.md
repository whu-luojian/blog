# 尾调用和尾递归

## 尾调用

尾调用是函数式编程中的一个重要概念。当函数执行的最后一个步骤（不一定是最后一行）是函数调用，就叫做尾调用。

```js
// f() 和 g() 都在尾部调用
const a = x => x ? f() : g()
```

函数在调用的时候会在调用栈（call stack）中存有记录，每一条记录叫做一个调用帧（call frame），每调用一个函数，就向栈中 push 一条记录，函数执行结束后依次向外弹出，直到清空调用栈：

```js
function foo () { console.log(111) }
function bar () { foo() }
function baz () { bar() }

baz()
```

![img](https://user-gold-cdn.xitu.io/2018/4/11/162b410edd7877e9?imageslim)

造成这种结果是因为每个函数在尾调用另一个函数的时候，并没有**`return` **该调用，所以 `js` 引擎会认为你还没有执行完，会保留你的调用帧。

**baz()** 里面调用了 **bar()** 函数，并没有 **return** 该调用，所以在调用栈中保持自己的调用帧，同时 **bar()** 函数的调用帧在调用栈中生成，同理，**bar()** 函数又调用了 **foo()** 函数，最后执行到 **foo()** 函数的时候，没有再调用其他函数，这里没有显示声明 **return**，所以这里默认 **return undefined**。

**foo()** 执行完了，销毁调用栈中自己的记录，依次销毁 **bar()** 和 **baz()** 的调用帧，最后完成整个流程。

**尾调用优化**就是在将尾调用的函数的返回值，直接 **`return`**，作为函数返回值。如：

```js
function foo () { console.log(111) }
function bar () { return foo() }
function baz () { return bar() }

baz()
```

**尾调用优化仅仅是我们在编码层面的优化，但是只是在严格模式下少数引擎下才有效。**现如今浏览器并未完全支持，原因有二：

1. 在引擎层面消除递归是一个隐式行为，程序员意识不到；

2. 堆栈信息丢失了，开发者难已调试，所以大多数引擎会保留 `func.arguments`（`func` 最近一次调用所包含的参数） 和 `func.caller` （`func` 最近一次调用的函数）：

   ```js
   function foo(n) {   
       return bar(n*2)
   } 
   function bar() {   
       //查看调⽤帧   
       console.trace() 
   } 
   foo(1)
   ```

   ## 尾递归

   函数调用自身，就是递归；函数尾调用自身，就是尾递归。

   以阶乘为例：

   ```js
   function factorial(n) {
       if (n === 1) {
           return 1
       }
       return n * factorial(n - 1)
   }
   
   factorial(5)           // 120
   factorial(10)          // 3628800
   factorial(10000)      // Uncaught RangeError: Maximum call stack size exceeded
   ```

   上面函数最后一步是 `n * factorial(n - 1)`，并不是尾递归，n 过大就会爆栈，适用尾递归计算阶乘如下：

   ```js
   'use strict';
   function factorial(num, total = 1) {
       if (num === 1) {
           return total
       }
       return factorial(num - 1, num * total)
   }
   
   factorial(5)               // 120
   factorial(10)              // 3628800
   factorial(10000)          // 分情况
   
   // 注意，虽然说这里启用了严格模式，但是经测试，在Chrome和Firefox下，还是会报栈溢出错误，并没有进行尾调用优化
   // Safari浏览器进行了尾调用优化，factorial(500000, 1)结果为Infinity，因为结果超出了JS可表示的数字范围
   // 如果在node v6版本下执行，需要加--harmony_tailcalls参数，node --harmony_tailcalls test.js
   // node最新版本已经移除了--harmony_tailcalls功能
   ```

   我们在代码层面做的尾递归优化在大多数浏览器中并不支持，因此可采用以下方法优化：

   ### 递归改成迭代

   递归改写成 while 或者 reduce

   ```js
   function factorial(n) {
       let res = 1
       while(n > 1) {
           res *= n
           n--
       }
       return res
   }
   ```

   ### 蹦床函数

   蹦床函数，其思想是使用延迟计算稍后执行递归调用，每次执行一个递归。

   ```js
   // 蹦床函数
   function trampoline(f) {
       while (f && f instanceof Function) {
           f = f()
       }
       return f
   }
   
   // 返回一个函数
   function factorial(num, total = 1) {
       if (num === 1) {
           return total
       }
       return () => factorial(num - 1, num * total)
   }
   
   trampoline(factorial(10000)) // => Infinity
   ```

   

