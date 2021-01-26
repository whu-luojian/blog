# webpack 运行机制和 webpack 5

> <https://github.com/whu-luojian/webpack-demos>

## 运行机制（事件流）

>blogs：<https://juejin.im/post/6844903726981840904>、<https://github.com/jerryOnlyZRJ/webpack-tools/blob/master/docs/webpack-principle.md>

### webpack的运行过程可以简单概述为如下流程：

**初始化配置参数 -> 绑定事件钩子回调 -> 确定Entry逐一遍历 -> 使用loader编译文件 -> 输出文件**

![image-1](webpack-1.png)

- `compiler` ：代表了完整的 webpack 环境配置。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。

- `compilation`： 对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。

- `module`：对于 webpack 来说每个文件都是一个 module，例如：js/css/图片等文件，在编译环节，webpack 会根据不同 module 之间的依赖关系去组合生成 chunk。

![image-2](webpack-2.png)

- `chunk`：由 module 组成，一个 chunk 可以包含多个 module，它是 webpack 编译打包后输出的最终文件。默认的 chunk 数量实际上是由你的入口文件的 js 数量决定的，但是如果你配置动态加载或者提取公共包的话，也会生成新的 chunk。

  - 遍历 module graph 模块依赖图建立起 basic chunk graph 依赖图；
  - 遍历第一步创建的 chunk graph 依赖图，依据之前的 module graph 来优化 chunk graph(由于 chunk graph 是 webpack 最终输出 chunk 的依据，在这一步的处理流程当中会剔除到一些 chunk graph 重复被创建的 chunk)

- `assets`：文件生成。生成 moduleId，生成 chunkId，生成 hash，然后生成最终输出文件的内容，同时每一步之间都会暴露 hook , 提供给插件修改的机会。

![image-3](webpack-3.png)

![webpack运行机制](https://github.com/jerryOnlyZRJ/webpack-tools/raw/master/docs/webpack-steps.jpg)

## loader

> loader api：<https://www.webpackjs.com/api/loaders/>

![image-4](webpack-4.png)

- loader 只是一个导出为函数的 JavaScript 模块，loader上可挂载 `pitch` 方法：

  ```js
  use: [
    'a-loader',
    'b-loader',
    'c-loader'
  ]
  ```

  执行顺序（出栈）：

  ```js
  |- a-loader `pitch`
    |- b-loader `pitch`
      |- c-loader `pitch`
        |- requested module is picked up as a dependency
      |- c-loader normal execution
    |- b-loader normal execution
  |- a-loader normal execution
  ```

- `loaderContext`：loader 上下文（loader 函数中的this）由 webpack 提供，见：<https://www.webpackjs.com/api/loaders/#loader-%E4%B8%8A%E4%B8%8B%E6%96%87>

- 使用 `loader-utils` 库获取 loader 的 options：本质是解析 `this.query`

  ```js
  const loaderUtils = require("loader-utils");

  module.exports = function(content){
      // 获取用户配置的options
      const options = loaderUtils.getOptions(this);
      return content
  }
  ```

- 异步 loader：使用 `async-await` 或 `this.async()` (node 版本较低时)

  ```js
  module.exports = function(content){
      function timeout(delay) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  resolve("{};" + content)
              }, delay)
          })
      }
      const callback = this.async()
      timeout(1000).then(data => {
          callback(null, data)
      })
  }
  ```

- AST：![ast-jsobj](https://github.com/jerryOnlyZRJ/webpack-tools/raw/master/docs/ast-jsobj.png)

## Tapable

> github： <https://github.com/webpack/tapable#tapable>
>
> Hook介绍：<https://juejin.im/post/6844903588112629767>
>
> 源码分析：<https://juejin.im/post/6844903750729990152> 、<https://juejin.im/post/6844903588112629767>

 Tapable 作为 webpack 底层事件流库，提供了很多类型的 Hook，分为同步和异步两个大类(异步中又区分异步并行和异步串行)，而根据事件执行的终止条件的不同，由衍生出 Bail/Waterfall/Loop 类型。

```js
const {
  SyncHook
} = require('tapable')

// 创建一个同步 Hook，['arg1', 'arg2']表示事件接收两个参数
const hook = new SyncHook(['arg1', 'arg2'])

// 注册
hook.tap('a', function (arg1, arg2) {
	console.log('a', arg1, arg2)
})

// 执行
hook.call(1, 2) // a 1 2
```

```js
class SyncHook{
    constructor(){
        this.hooks = [];
    }

    // 订阅事件
    tap(name, fn){
        this.hooks.push(fn);
    }

    // 发布
    call(){
        this.hooks.forEach(hook => hook(...arguments));
    }
}
```

![image-5](webpack-5.png)

## plugin

> webpack plugin：<https://www.webpackjs.com/contribute/writing-a-plugin/>
>
> webpack hook：<https://webpack.js.org/api/compiler-hooks/>
>
> webpack-internal-plugin-relation：<https://alienzhou.github.io/webpack-internal-plugin-relation/>
>
> html-webpack-plugin：<https://github.com/jantimon/html-webpack-plugin>

- 插件是由「具有 `apply` 方法的 prototype 对象（function 或者 class）」所实例化出来的

- webpack 插件机制：

  - 创建：webpack 在其内部对象（complier、compilation）上创建各种钩子
  - 注册：插件将自己的方法注册到对应钩子上，也可以在 complier、compilation 对象上创建插件的自定义钩子
  - 调用：webpack 在编译过程中，会适时地触发（call）相应钩子，因此也就触发了插件注册的方法



```js
const pluginName = 'MyPlugin'
// tapable是webpack自带的package，是webpack的核心实现
// 不需要单独install，可以在安装过webpack的项目里直接require
// 拿到一个同步hook类
const { SyncHook } = require("tapable");
class MyPlugin {
    // 传入webpack config中的plugin配置参数
    constructor(options) {
        console.log('@plugin constructor', options);
    }

    apply(compiler) {
        console.log('@plugin apply');
        // 实例化自定义事件
        compiler.hooks.myPlugin = new SyncHook(['data'])

        compiler.hooks.environment.tap(pluginName, () => {
            //广播自定义事件
            compiler.hooks.myPlugin.call("It's my plugin.")
            console.log('@environment');
        });

        // compiler.hooks.compilation.tap(pluginName, (compilation) => {
            // 你也可以在compilation上挂载hook
            // compilation.hooks.myPlugin = new SyncHook(['data'])
            // compilation.hooks.myPlugin.call("It's my plugin.")
        // });
    }
}
module.exports = MyPlugin
```

## 文件输出

> <https://zhuanlan.zhihu.com/p/76584820>
>
> <https://zhuanlan.zhihu.com/p/32706935>

### 单文件

单文件打包后就是一个 IIFE （立即调用函数）；传入“模块”，使用  `__webpack_require__`进行调用。在单文件下，文件加载后将立即执行业务逻辑。

-  `import 'xxx'`，最终为 `__webpack_require__` 函数执行

```js
(function(modules) { // webpackBootstrap
     function __webpack_require__(moduleId) {
        // ...
    // 执行模块代码
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
     }
     // 引用入口
     return __webpack_require__(__webpack_require__.s = "./src/entryB.js");
 })({
    "./entryB.js": (function(module, __webpack_exports__, __webpack_require__) {
        // ...
    })
});
```

### 多文件

- 抽取第三方模块或公共模块
- 异步组件
- splitChunks

```js
1. 声明了依赖的 chunk 文件列表
2. 当 chunk 文件加载后进行标记完成
3. 文件加载后将检查相关文件是否都加载完成，如是，则开始执行业务逻辑
4. 提供给 chunk 文件加载后的回调方法

// 声明依赖列表
deferredModules.push(["./src/entryA.js","commons"]);

// 缓存已完成的加载
var installedChunks = {
    "entryA": 0
};

function webpackJsonpCallback(data) {
    // 加载后标记完成
    installedChunks[chunkId] = 0;
}

// 检查是否都加载完成，如是，则开始执行业务逻辑
function checkDeferredModules() {
    // 判断 installedChunks 是否完整
    // ...
    if(fulfilled) {
        // 所有都加载，开始执行
        result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
    }
}

// 提供给 chunk 的全局回调方法
var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
jsonpArray.push = webpackJsonpCallback;
```

## webpack 5

> release announcement: <https://webpack.js.org/blog/2020-10-10-webpack-5-release/>
>
> 中文声明：<https://webpack.docschina.org/blog/2020-10-10-webpack-5-release/>
>
> blogs：<https://juejin.im/post/6844903795286081550#heading-3>

### changelog

- 通持久性缓存提高构建性能
- 采用更好的算法和默认行为来改进长期缓存
- 通过优化 Tree Shaking 和代码生成来减少包体积
- 提高 Web 平台的兼容性
- 清除之前为了实现 Webpack4 中某些特性而处于奇怪状态的内部架构
- 尝试现在引入重大更改来为将来的功能做准备，以使我们能够尽可能长时间地使用 Webpack 5

### Major Changes

#### 功能移除

- 移除 v4 版本中不被推荐使用的功能
- `require.include` 语法被废弃，使用时会有 warning。当然这个行为可以通过 `Rule.parser.requireInclude` 来把这个语法改成 allowed, deprecated 或者 disabled
- 去掉自动 Node.js Polyfills 。早期 Webpack 自动 Node.js Polyfills 的主要目的是让更多 Node.js 的模块能够在浏览器运行，但随着模块格局的改变，越来越多的模块只用于浏览器，这个时候再自动 Polyfills 一些 Node 模块（例如 crypto）无疑会增加打包体积，在 Webpack5 之后去掉了这个自动行为，进一步提高 Web 平台的兼容性

#### 长期缓存

- 确定性的模块、模块ID和导出名称
  -  webpack 曾经在编译阶段以特定的方式对模块和代码块进行排序，以递增的方式分配 ID。现在不再是这样了。顺序将不再用于 ID 的生成，取而代之的是，ID 生成的完全控制在插件中。
  - 首先是模块、ID和导出名称都唯一确定下来，背后对应的配置是 `chunkIds: "deterministic", moduleIds: "deterministic", mangleExports: "deterministic"`
  - 该算法以确定性的方式为模块和分块分配短的（3 或 5 位）数字 ID，其中模块和模块ID用 3 ~ 4 位的数字ID，导出名称用 2 位的数字ID，这是包大小和长期缓存之间的一种权衡。由于这些配置将使用确定的 ID 和名称，这意味着生成的缓存失效不再更频繁。
  - 这个设置在生产环境是默认开启的
- 真实内容哈希
  - 在 Webpack5 里会使用文件内容的真实哈希 `[contenthash]`，而不是之前的仅仅使用文件内部结构的哈希
  - 这对于长期缓存有着积极的影响，尤其是代码里面只有注释和变量名修改的时候，Webpack会继续用之前的缓存而不是新的文件内容

#### 开发支持

- Chunk IDs 语义化

  - 开发环境下默认使用新的 Chunk IDs 生成算法（`chunkIds: "named"`），Module ID 是由它的 path 决定的， 一个 Chunk ID 是由 chunk 的内容来决定的。所以我们不再需要 `import(/* webpackChunkName: "name" */ "module")` 来 debugging 了
  - 生成环境默认配置为`chunkIds: "natural"`(使用数字来生成 Chunk ID)， 为了避免把 chunk 里面的敏感内容暴露出去

- **[Module Federation](https://webpack.docschina.org/concepts/module-federation/)**

  > [Webpack 5 Module Federation: JavaScript 架构的变革者](https://zhuanlan.zhihu.com/p/120462530)
  >
  > [探索 webpack5 新特性 Module federation 在腾讯文档中的应用](http://www.alloyteam.com/2020/04/14338/)]
  >
  > [探索webpack5新特性Module-federation](https://juejin.im/post/6844904133837717511)
  >
  > demo：<https://github.com/module-federation/module-federation-examples/tree/master/basic-host-remote>

  Webpack 5 增加了一个新的功能 "模块联邦"，它允许多个 webpack 构建一起工作。

  - Module Federation 使 JavaScript 应用得以在客户端或服务器上动态运行另一个 bundle 或者 build 的代码。
  - Module Federation 使 JavaScript 应用得以从另一个 JavaScript 应用中动态地加载代码 —— 同时共享依赖。
  - 组件共享、微前端

  假设一个网站的每个页面都是独立部署和编译的，我想要这种微前端风格的架构，但不希望页面随着我更改路由而重新加载。我还希望在页面之间动态地共享代码和 vendors, 这样它就像支持 code splitting 的大型 Webpack 构建般高效了。

  访问应用的 home 也将会使这个 “home” 页成为 “host”，如果你切换到 “about” 页，那么这个 host（home 页的 spa）实际上是从另一个独立应用（about 页的 spa）中动态加载一个模块，它并不会加载应用主入口以及另一个完整的应用，**而只会加载几千字节的代码**。如果我在 “about” 页刷新浏览器，“about” 页将会成为 “host”，此时我回到 “home” 页，“about” 页（“host”）将会从 “remote” 获取运行时的一些片段——这个 “remote” 就是 “home” 页。在这个系统中，所有的应用都既是 “remote” 又是 “host”，与其它 federated module 互为消费者与被消费者。

#### 优化

- 嵌套 tree-shaking。Webpack现在会去追踪 export 的链路，对于嵌套场景有更好的优化，比如下面这个例子里 `b` 是不会出现在生产代码里。

```js
// inner.js
export const a = 1;
export const b = 2;

// module.js
import * as inner from "./inner";
export { inner }

// user.js
import * as module from "./module";
console.log(module.inner.a);
```

- 内部模块 tree-shaking。Webpack 4 不会去分析模块中导入和导出之间的依赖关系，Webpack5 里面会通过 `optimization.innerGraph`记录依赖关系。比如下面这个例子，只有 `test` 方法被使用了，`someting` 才会使用。当 `test` 导出未被使用时，`./something` 模块会被忽略。

```js
import { something } from "./something";

function usingSomething() {
return something;
}

export function test() {
return usingSomething();
}
```

- Webpack 5 不仅仅支持 ES module 的 tree Shaking，commonjs规范的模块开始支持了
- node 最小支持版本 Node.js 10.13.0
- Webpack5 插件编写方式
  - compiler.hooks、compilation.hooks 对象被 freeze，不能添加自定义钩子
  - 插件添加自定义钩子采用 WeakMap + static getHooks() 方式，即将自定义钩子维护在插件内部
