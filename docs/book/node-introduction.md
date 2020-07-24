## Node.js 简介

- Node.js创始人是大名鼎鼎的 Ryan Dahl。
- Node.js不是一个JavaScript应用，而是一个由C++语言编写而成的JavaScript的运行环境。
- Node.js是一个基于Google所开发的浏览器Chrome V8引擎的JavaScript运行环境，简单来说，就是运行在服务端或后端的JavaScript，支持跨平台。

## Node.js 的结构

![img](https://pic2.zhimg.com/80/v2-2995dfd67f667cd3fc5e5da103153ff1_1440w.jpg)

Node.js的结构大致可以分为三个层次：

## Node.js标准库

Node.js标准库，包含Node.js的包管理器npm以及Node.js的核心模块等，这部分由JavaScript编写而成，是开发者开发过程直接接触调用的。

## 中间层

这一层是JavaScript与底层C/C++沟通的桥梁：

- **Node bindings**：是Nodejs标准库和底层V8引擎等沟通的桥梁，前者通过bindings调用后者，相互交换数据。
- **C/C++ Addons（插件）**：是开发者开发过程中基于基础的V8 API编写的Node.js C++动态链接库，用作高性能或底层模块，供上层的JavaScript调用。

## Node.js基础构建层

- **V8**：Google推出的JavaScript引擎，为JavaScript提供了在非浏览器端运行的环境。
- **libuv**：为 Node.js提供了跨平台、线程池、事件池、异步IO等能力，是Node.js强大的关键。
- **C-ares**：提供了异步处理DNS相关的能力。
- **http parser、OpenSSL、zlib等**：提供包括HTTP解析、SSL、数据压缩等能力。

## Node.js的特点

## 单线程

Node.js保持了JavaScript在浏览器中单线程的特点。这里的单线程是指主线程为“单线程”，所有阻塞部分交给一个线程池处理，然后主线程通过一个队列跟线程池协作。代码主要由一堆callback回调构成，然后主线程在循环过程中适时调用这些代码。

像浏览器中JavaScript与UI共用一个线程一样，JavaScript长时间执行会导致UI的渲染和响应被中断。在Node.js中，长时间的CPU占用也会导致后续的异步I/O发不出调用，已完成的异步I/O的回调函数也会得不到及时执行。

HTML5定制了Web Workers的标准，Web Workers能够创建工作线程来进行计算，以解决JavaScript大计算阻塞UI渲染的问题。工作线程为了不阻塞主线程，通过消息传递的方式来传递运行结果，这也使得工作线程不能访问到主线程中的UI。

Node.js采用了与Web Workers相同的思路来解决单线程中大计算量的问题：child_process。子进程的出现意味着Node可以从容地应对单线程在健壮性和无法利用多核CPU方面的问题。通过将计算分发到各个子进程，可以将大量计算分解掉，然后通过进程之间的事件消息来传递结果。

## 异步、非阻塞I/O

Node.js中绝大多数操作都是以异步的方式进行调用，从文件读取到网络请求等，类似于发起ajax调用。每个调用之间无需等待之前的I/O调用结束，比如两个文件读取任务的耗时取决于最慢的那个文件读取耗时。

## 事件驱动和回调函数

Node.js的设计思想以事件驱动为核心，配合异步I/O，将事件点暴露给业务逻辑。因此Node.js提供的绝大多数API都是基于事件的、异步的风格，开发人员需要根据自己的业务逻辑注册响应的回调函数，回调函数等待相应的事件触发。

## Node.js的应用场景

- 提供 Rest/JSON API 服务
- 网站（express/koa等）
- im即时聊天（[http://socket.io](https://link.zhihu.com/?target=http%3A//socket.io))
- http proxy，组装rpc服务，作为微服务的一部分
- 前端构建工具（grunt/gulp/bower/webpack/fis3)
- 跨平台打包工具（nw.js、electron、cordova）
- 命令行工具
- 编辑器（atom，vscode）

## Node.js核心模块

- **http模块**：创建HTTP服务器、客户端
- **fs模块**：文件读写模块
- **url模块**：url地址处理模块
- **querystring模块**：查询字符串处理模块

## Node.js常用模块

- **util模块**：工具模块，提供对象反序列化等工具函数
- **path模块**：路径处理模块
- **dns模块**：域名处理和域名解析模块

## 参考资料

- 《Node.js 开发实战》
- 《深入浅出 Node.js》
- 知乎live：大前端和 Node.js 那些事