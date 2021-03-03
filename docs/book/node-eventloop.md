# NodeJS 事件循环

## NodeJS 运行机制

![node](node.png)
这个图就是整个 NodeJS 的运行原理，从左到右，从上到下，NodeJS 被分为了 4 层：
1. 应用层：JavaScript 交互层，用户代码、NodeJS 模块等，这些代码会交给 V8 引擎处理；
2. V8 引擎层：解析应用层的 JavaScript 代码，和下层交互；
3. Node API 层：Node 内建（底层）模块或三方插件，一般用 C 或 C++ 实现，和操作系统交互；
4. LIBUV 层：跨平台的底层封装，实现了事件循环、文件操作等，是异步 IO 的核心。

## libuv 架构

![libuv](libuv.png)
nodejs 实现异步机制的核心便是 libuv，libuv 承担着 nodejs 与文件、网络等异步任务的沟通桥梁。nodejs 中的异步事件有：
- 非 I/O：
  - 定时器（setTimeout、setInterval）
  - microtask（promise）
  - process.nextTick
  - setImmediate
- I/O:
  - 网络 I/O
  - 文件 I/O
- ...

## 异步 I/O

NodeJS 采用线程池来模拟异步 I/O。
libuv内部维护着一个默认4个线程的线程池，这些线程负责执行文件I/O操作、DNS操作、用户异步代码。当 js 层传递给 libuv 一个操作任务时，libuv 会把这个任务加到队列中。之后分两种情况：
- 线程池中的线程都被占用的时候，队列中任务就要进行排队等待空闲线程。
- 线程池中有可用线程时，从队列中取出这个任务执行，执行完毕后，线程归还到线程池，等待下个任务。同时以事件的方式通知event-loop，event-loop接收到事件执行该事件注册的回调函数。

> 当然，如果觉得4个线程不够用，可以在nodejs启动时，设置环境变量UV_THREADPOOL_SIZE来调整，出于系统性能考虑，libuv 规定可设置线程数不能超过128个。

完成整个异步 I/O 环节有事件循环、观察者和请求对象。

![node-io](node-io.png)

**事件循环**

在进程启动时，node会创建一个主循环，用于询问是否有待处理事件以及处理每一个异步事件后续的回调。每执行一次循环体的过程称为Tick。如果有待处理事件及相关回调，则取出事件并执行对应回调。如下图是事件循环模型：

**观察者**

事件循环中正是通过观察者判断是否有事件需要处理。每个事件循环可以有一个或多个观察者，每个观察者可能对应多个事件。

**请求对象**

在调用异步I/O后，到I/O操作完成并执行对应回调的过程中，存在一个中间产物——请求对象。它是一个状态集，保存了当前异步I/O的所有状态。以fs.readFile()为例，该方法调用Node的核心模块，进而调用C++内建模块执行对应操作。在这个过程中，node底层会将传入的参数、执行的方法以及回调函数封装成一个FSReqWrap请求对象，将回调函数赋给oncomplete_sym属性上，并将其放入线程池等待执行。而此时JavaScript线程会继续执行后续操作。

**执行回调**

当线程池中I/O操作完成，会将执行结果赋给result属性，同时会将该请求对象加入到I/O观察者队列中。在事件循环过程中，询问I/O观察者是否有事件待处理，如果存在，则取出请求对象中的result作为结果参数，oncomplete_sym属性作为回调执行。

## EventLoop

### NodeJS 启动过程

1. 调用 platformInit 方法，初始化 nodejs 的运行环境；
2. 调用 performance_node_start 方法，对 nodejs 进行性能统计；
3. openssl 设置的判断；
4. 调用 v8_platform.Initialize，初始化 libuv 线程池；
5. 调用 V8::Initialize，初始化 V8 环境；
6. 创建一个 nodejs 运行实例；
7. 启动上一步创建好的实例；
8. 开始执行 js 文件，同步代码执行完毕后，进入事件循环；
9. 在没有任何可监听的事件时，销毁 nodejs 实例，程序执行完毕。

### 事件循环

![node-eventloop](node-eventloop.png)

NodeJS 的事件循环有 6 个阶段（6 类观察者）：
1. timers 阶段：执行 setTimeout 和 setInterval 中到期的 callback；
2. I/O(pending) callbacks 阶段：上一轮少数的 I/O callback 会延迟到这一阶段执行，这些事件有一个叫 pending 的双向链表维护；
3. idle，prepare 阶段：内部调用；
4. poll 阶段：最重要的阶段，执行 I/O callback；
5. check 阶段：执行 setImmediate 的 callback；
6. close 阶段：执行 close 事件的 callback。
NodeJS 事件循环每个阶段完成后，就会执行微任务 microTask 队列（nextTick 和 Promise）。

### process.nextTick 、Promise、setImmediate
在具体实现上，process.nextTick() 的回调函数保存在一个数组中，setImmediate() 的结果则是保存在链表中。

在行为上，process.nextTick() 在每轮循环中都会将数组中的回调函数全部执行完，而 setImmediate()  在每轮循环中执行链表中的一个回调函数。
nextTick 和 Promise 都是微任务， 微任务 nextTick 优先级要比 Promise 要高。

```js
// 微任务 nextTick 优先级要比 Promise 要高
Promise.resolve().then(() =>{
  console.log('promise 延迟执行1')
})

process.nextTick(() => {
  console.log('nextTick 延迟执行1')
})

process.nextTick(() => {
  console.log('nextTick 延迟执行2')
})

setImmediate(() => {
  console.log('setImmediate 延迟执行1')

  // 进入下一循环
  Promise.resolve().then(() =>{
    console.log('promise 延迟执行2')
  })

  // 进入下一循环
  process.nextTick(() => {
    console.log('强势插入')
  })
})

setImmediate(() => {
  console.log('setImmediate 延迟执行2')
})

console.log('正常执行')
```

输出：
```js
正常执行
nextTick 延迟执行1
nextTick 延迟执行2
promise 延迟执行1
setImmediate 延迟执行1
强势插入
promise 延迟执行2
setImmediate 延迟执行2
```
