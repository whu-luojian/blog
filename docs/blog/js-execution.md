# JavaScript 执行原理

## 词法作用域

JavaScript 采用的是词法作用域，函数的作用域在函数定义的时候就决定了。而与词法作用域相对的是动态作用域，函数的作用域是在函数调用的时候才决定的。

```js
let value = 1
function foo() {
    console.log(value)
}
function bar() {
    let value = 2
    foo()
}
bar()
```

- 假设 JavaScript 采用静态作用域，让我们分析下执行过程：
  - 执行 foo 函数，先从 foo 函数内部查找是否有局部变量 value，如果没有，就根据书写的位置，查找上面一层的代码，也就是 value 等于1，所以结果会打印1。
- 假设 JavaScript 采用动态作用域，让我们分析下执行过程：
  - 执行 foo 函数，依然是从 foo 函数内部查找是否有局部变量 value，如果没有，就从调用函数的作用域，也就是 bar 函数内部查找 value 变量，所以结果会打印2.
- JavaScript 采用的是静态作用域，所以这个例子的结果是1。

## 执行上下文

执行上下文（Execution Context）是 JavaScript 中最基础但最重要的一个概念。执行上下文可以理解为当前代码的执行环境，它会形成一个作用域。 JavaScript 中的运行环境包括以下三种情况：

- 全局环境：JavaScript代码运行起来会首先进入该环境，即全局执行上下文
- 函数环境：当函数调用执行时，进入函数执行上下文
- eval：不建议使用，可忽略

因此在一个 JavaScript 程序中，必定会产生多个执行上下文，JavaScript 引擎会以栈的方式来处理它们，这个栈，称为函数调用栈（call stack）。栈底永远都是全局上下文，而栈顶就是当前正在执行的上下文。当代码在执行过程中，遇到以上三种运行环境，都会产生一个执行上下文，放入栈中，而处于栈顶的上下文执行完毕之后，就会自动出栈。

```js
function fun3() {
    console.log('fun3')
}
function fun2() {
    fun3()
}
function fun1() {
    fun2()
}
fun1()
```

以上例子执行过程如下：

1. 全局执行上下文入栈，ECStack.push(Global Context)；
2. 执行fun1()，创建fun1的执行上下文并入栈，ECStack.push(\<fun1> Function Context)；
3. fun1的执行上下文入栈后，开始执行fun1函数中的可执行代码，fun1中调用了fun2，创建fun2的执行上下文并入栈，ECStack.push(\<fun2> Function Context)；
4. 执行fun2函数中的可执行代码，fun2调用了fun3，ECStack.push(\<fun3> Function Context)；
5. fun3执行完毕，fun3的执行上下文出栈，ECStack.pop();
6. fun2执行完毕，ECStack.pop();
7. fun1执行完毕，ECStack.pop();
8. 最终ECStack中只剩下全局上下文，全局上下文在浏览器窗口关闭后出栈。

当调用一个函数时（激活），一个新的执行上下文就会创建。而一个执行上下文的生命周期可以分为两个阶段：

- **创建阶段：**创建变量对象，建立作用域链，确定this的指向
- **代码执行：**变量赋值，函数引用，以及执行其它代码

## 变量对象

变量对象是与执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明：

- 全局上下文中的变量对象就是全局对象。
- 在函数上下文中，我们用**活动对象**(activation object, AO)来表示变量对象。
- 活动对象和变量对象其实是一个东西，只是变量对象是规范上的或者说是引擎实现上的，不可在JavaScript环境中访问，只有当进入一个执行上下文中，这个执行上下文的变量对象才会被激活，所以才叫activation object，而只有被激活的变量对象，也就是活动对象上的各种属性才能被访问。
- 活动对象是在进入函数上下文时刻被创建的，它通过函数的arguments属性初始化。

变量对象包括：

1. 函数的所有形参（如果是函数上下文）：
   - 由名称和对应值组成的一个变量对象的属性被创建；
   - 没有实参，属性值设为undefined。
2. 函数声明：
   - 由名称和对应值（函数对象（function-object））组成的一个变量对象的属性被创建；
   - 如果变量对象已经存在相同名称的属性，则完全替换这个属性。
3. 变量声明：
   - 由名称和对应值（undefined）组成的一个变量对象的属性被创建；
   - 如果变量名称跟已经声明的形式参数或函数相同，则忽略变量声明，不干扰已经存在的这类属性。

```js
function foo(a) {
    let b = 2;
    function c() {}
    let d = function() {};
    b = 3;
} 
foo(1);
```

执行foo(1)，进入foo的执行上下文，创建阶段，此时的AO是：

```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: undefined,
    c: reference to function c(){},
    d: undefined
}
```

代码执行阶段，顺序执行代码，根据代码，修改变量对象的值，代码执行完后，这时候的AO是：

```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: 3,
    c: reference to function c(){},
    d: reference to FunctionExpression "d"
}
```

## 作用域链

**作用域链，是由当前环境与上层环境的一系列变量对象构成的链表，它保证了当前执行环境对符合访问权限的变量和函数的有序访问。**

- 查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。

- 函数的作用域在函数定义的时候就决定了，因为函数有一个内部属性 [[scope]]，当函数创建的时候，就会保存所有父变量对象到其中，你可以理解 [[scope]] 就是所有父变量对象的层级链，但是注意：[[scope]] 并不代表完整的作用域链！

```js
function foo() {
    function bar() {
        ...
    }
}
```

当函数激活时，进入函数上下文，创建 VO/AO 后，就会将活动对象添加到作用链的前端。这时候执行上下文的作用域链，我们命名为 `ScopeChain`，`ScopeChain = [AO].concat([[Scope]])`。

上面例子当函数创建时，各自的[[scope]]为：

```js
foo.[[scope]] = [
    globalContext.VO
];
 
bar.[[scope]] = [
    fooContext.AO,
    globalContext.VO
];
```

## 闭包

**闭包由两部分组成：执行上下文(代号A)，以及在该执行上下文中创建的函数（代号B）。当B执行时，如果访问了A中变量对象中的值，那么闭包就会产生**。

**在大多数理解中，包括许多著名的书籍，文章里都以函数B的名字代指这里生成的闭包。而在chrome中，则以执行上下文A的函数名代指闭包。**

```js
let scope = "global scope";
function checkscope(){
    let scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
let foo = checkscope();
foo();
```

以上例子简要执行过程：

1. 进入全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈

2. 全局执行上下文初始化

3. 执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 执行上下文被压入执行上下文栈

4. checkscope 执行上下文初始化，创建变量对象、作用域链、this等

5. checkscope 函数执行完毕，checkscope 执行上下文从执行上下文栈中弹出

6. 执行 f 函数，创建 f 函数执行上下文，f 执行上下文被压入执行上下文栈

7. f 执行上下文初始化，创建变量对象、作用域链、this等

8. f 函数执行完毕，f 函数上下文从执行上下文栈中弹出

当 f 函数执行的时候，checkscope 函数上下文已经被销毁(即从执行上下文栈中被弹出)，怎么还会读取到 checkscope 作用域下的 scope 值呢？因为f 执行上下文维护了一个作用域链：

```js
fContext = {
    Scope: [AO, checkscopeContext.AO, globalContext.VO],
}
```

## 具体执行分析

```js
let scope = "global scope";
function checkscope(){
    let scope = "local scope";
    function f(){         
        return scope;
    }
    return f();
}
checkscope();
```

1. 执行全局代码，创建全局执行上下文，全局上下文被压入执行上下文栈

   ```js
   ECStack = [
       globalContext
   ];
   ```

2. 全局上下文初始化

   ```js
   globalContext = {
       VO: [global],
       Scope: [globalContext.VO],
       this: globalContext.VO
   }
   ```

3. 初始化的同时，checkscope 函数被创建，保存作用域链到函数的内部属性[[scope]]

   ```js
   checkscope.[[scope]] = [
       globalContext.VO
   ];
   ```

4. 执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 函数执行上下文被压入执行上下文栈

   ```js
   ECStack = [
       checkscopeContext,
       globalContext
   ];
   ```

5. checkscope 函数执行上下文初始化：

   1. 复制函数 [[scope]] 属性创建作用域链；

   2. 用 arguments 创建活动对象；

   3. 初始化活动对象，即加入形参、函数声明、变量声明；

   4. 将活动对象压入 checkscope 作用域链顶端。同时 f 函数被创建，保存作用域链到 f 函数的内部属性[[scope]]。

   ```js
   checkscopeContext = {
       AO: {
           arguments: {
               length: 0
           },
           scope: undefined,
           f: reference to function f(){}
   	},
       Scope: [AO, globalContext.VO],
       this: undefined
   }
   ```

6. 执行 f 函数，创建 f 函数执行上下文，f 函数执行上下文被压入执行上下文栈

   ```js
   ECStack = [
       fContext,
       checkscopeContext,
       globalContext
   ];
   ```

7. f 函数执行上下文初始化：

   1. 复制函数 [[scope]] 属性创建作用域链；
   2. 用 arguments 创建活动对象；
   3. 初始化活动对象，即加入形参、函数声明、变量声明；
   4. 将活动对象压入 f 作用域链顶端。

   ```js
   fContext = {
       AO: {
           arguments: {
               length: 0
           }
   	},
       Scope: [AO,  checkscopeContext.AO, globalContext.VO],
       this: undefined
   }
   ```

8. f 函数执行，沿着作用域链查找 scope 值，返回 scope 值

9. f 函数执行完毕，f 函数上下文从执行上下文栈中弹出

10. checkscope 函数执行完毕，checkscope 执行上下文从执行上下文栈中弹出

11. 执行完毕，此时：

    ```js
    ECStack = [
        globalContext
    ];
    ```

    