# vue 3 & vite 介绍

## vue 3 发展现状

一款框架诞生需要经过的阶段

1. 开发
2. alpha版：内部测试版 α
3. beta版：公开测试版 β
4. rc版：release candidate（候选版本）
5. stable版：稳定版

2020年4 月 17 日，vue 3 正式进入 beta 阶段。vue 3框架相关项目状态如下:

| projects            | status                                                       | repo                                                         |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| vue 3（vue-next）   | [![beta](https://camo.githubusercontent.com/35043cce2a552b9c29e6e2267f4c9c9baec31090/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f7675652f6e6578742e737667)](https://www.npmjs.com/package/vue/v/next) | [Github](https://github.com/vuejs/vue-next)  [RFCs](https://github.com/vuejs/rfcs) |
| vue-router          | [![alpha](https://camo.githubusercontent.com/8c14172146de976291c555b24839bd6e7f65a3a7/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f7675652d726f757465722f6e6578742e737667)](https://www.npmjs.com/package/vue-router/v/next) | [Github](https://github.com/vuejs/vue-router-next)           |
| vuex                | [![beta](https://camo.githubusercontent.com/fbf0df4356b468846273e602cac7c43ef6fe7d5d/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f767565782f6e6578742e737667)](https://www.npmjs.com/package/vuex/v/next) | [Github](https://github.com/vuejs/vuex/tree/4.0)             |
| vue-cli             | experimental support via [vue-cli-plugin-vue-next](https://github.com/vuejs/vue-cli-plugin-vue-next) plugin |                                                              |
| vue-class-component | [![alpha](https://camo.githubusercontent.com/fc82739bb3325866c2a1d1f5cef0bd9716ad1a48/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f7675652d636c6173732d636f6d706f6e656e742f6e6578742e737667)](https://www.npmjs.com/package/vue-class-component/v/next) | [Github](https://github.com/vuejs/vue-class-component/tree/next) |
| eslint-plugin-vue   | [![alpha](https://camo.githubusercontent.com/7dc2a967c0c73760ff7a9e82b369f398a4e68e49/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f65736c696e742d706c7567696e2d7675652f6e6578742e737667)](https://www.npmjs.com/package/eslint-plugin-vue/v/next) | [Github](https://github.com/vuejs/eslint-plugin-vue)         |
| rollup-plugin-vue   | [![alpha](https://camo.githubusercontent.com/ae1916f09be64023634f22995210dd4115b12f22/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f726f6c6c75702d706c7567696e2d7675652f6e6578742e737667)](https://www.npmjs.com/package/rollup-plugin-vue/v/next) | [Github](https://github.com/vueComponent/jsx)                |
| vue-devtools        | WIP (beta channel with Vue 3 support in early July)          |                                                              |

vue3 预计八月份发版

## vue 2.x 怎么办

- vue目前稳定的版本：`2.6.x`
- 后续会出最后一个小版本 `2.7.x `，底层代码全面兼容 3.0，可以迁移到 3.0 的部分会给予醒目提示
- 维护18个月之后，除安全漏洞更新之外，其余的不再继续更新

建议：`Vue 3` 虽好，如果你的项目很稳定，且对新功能无过多的要求或者迁移成本过高，则不建议升级。



## 上手 vue3 开发

### vite + vue3

`demo`地址：[**demo**](https://github.com/whu-luojian/vite-vue3)

`vite`：https://github.com/vitejs/vite

`create-vite-app`：https://github.com/vitejs/create-vite-app

- 基于浏览器原生 ES imports 的开发服务器
- 同时不仅有 Vue 文件支持，支持热更新，而且热更新的速度不会随着模块增多而变慢

```bash
$ npm init vite-app <project-name>  // npm init <initializer>
$ cd <project-name>
$ npm install
$ npm run dev

或者

$ yarn create vite-app <project-name>
$ cd <project-name>
$ yarn
$ yarn dev
```

### webpack + vue3

> [vue-cli-plugin-vue-next](https://github.com/vuejs/vue-cli-plugin-vue-next) ：`A Vue CLI plugin for trying out the Vue 3 beta.`

```bash
// 1. 使用 @vue/cli 创建 vue2.x 项目
$ npm install -g @vue/cli
$ vue --version
$ vue create <project-name>

// 2. 将 vue2.x 项目升级到 vue3
$ cd <project-name>
$ vue add vue-next
```

升级后变化：

`package.json`：

```json
"dependencies": {
    "vue": "^3.0.0-beta.1",  			// "^2.6.11" --> "^3.0.0-beta.1"
    "vue-router": "^4.0.0-alpha.6", 	// "^3.2.0"  --> "^4.0.0-alpha.6"
    "vuex": "^4.0.0-alpha.1"			// "^3.4.0"	 --> "^4.0.0-alpha.1"
},
"devDependencies": {
    "@vue/compiler-sfc": "^3.0.0-beta.1",	// 移除"vue-template-compiler": "^2.6.11"
    										// 新增"@vue/compiler-sfc": "^3.0.0-beta.1"
    "@vue/test-utils": "^2.0.0-alpha.1",	// "^1.0.3" --> "^2.0.0-alpha.1"
    "eslint-plugin-vue": "^7.0.0-alpha.0",	// "^6.2.2" --> "^7.0.0-alpha.0"
    "vue-cli-plugin-vue-next": "~0.1.3"		// 新增
},
```

`.eslintrc.js`：

```js
extends: [
--  'plugin:vue/essential',			// 移除
++  'plugin:vue/vue3-essential',	// 新增
    '@vue/standard',
    '@vue/typescript/recommended'
],
```

除了以上变化，`vue` 、`vue-router`、`vuex` 相关文件也变更了（`API` 发生变化了）



## vue 3 亮点

### `Composition API`

与`React Hooks` 类似。

- 组合式 `API`，替换原有的 `Options API`
  - 更好的逻辑复用与代码组织
  - 更好的类型推导

- 可与现有的 `Options API`一起使用

混入(`mixin`) 将不再作为推荐使用， `Composition API`可以实现更灵活且无副作用的复用代码。

API 地址：https://composition-api.vuejs.org/zh/

### `Performance`

- 重写了 `virtual dom`
- 编译模板优化：hoistStatic（静态块提升）、cacheHandlers（事件监听器缓存）、blockTree（跳过static节点，使用patchFlag优化diff性能）等等
- 更高效的组件初始化（mount性能提高50%）
- `update`性能提高 1.3~2 倍
- `ssr`性能提高了 2~3 倍（不依赖`virtual dom`）

https://vue-next-template-explorer.netlify.app/

### `Tree shaking`

- 可以将无用模块“剪辑”，仅打包需要的（比如`v-model,<transition>`，用不到就不会打包）。
- 一个简单“`HelloWorld`”大小仅为：13.5kb
- 11.75kb，仅`Composition API`。
- 包含运行时完整功能：22.5kb
- 拥有更多的功能，却比`Vue 2`更迷你。

很多时候，我们并不需要 `vue`提供的所有功能，在 `vue 2` 并没有方式排除掉，但是 3.0 都可能做成了按需引入。

### `Better TypeScript Support`

- `Vue 3`是用`TypeScript`编写的库，可以享受到自动的类型定义提示
- `class`组件还会继续支持，但是需要引入`vue-class-component@next`，不是很建议使用。

### `Custom Renderer API`

- 自定义渲染器 `API`（runtime 拆分）

### 一些碎片

- Fragment：不再限于模板中的单个根节点，`render` 函数也可以返回数组了
- `<Teleport>`：传送门，对标`React Portal`，用于渲染vue的组件内容到指定的dom节点，做弹窗比较有用
- `<Suspense>`：异步组件，和`async setup()`结合使用



## Composition API

> 文档：https://composition-api.vuejs.org/zh/

### 目的

- 更好的逻辑复用与代码组织，替代 `mixin`
- 更好的类型推导

### 用法：setup + reactivity

#### setup

`setup` 是新的选项，可以理解为 `composition` 的入口，`setup` 函数在 `beforeCreate` 之前调用，函数返回的内容会作为模板的渲染上下文。

#### ref

将基础数据类型包装成一个响应式对象。

#### reactive

接收一个普通对象然后返回该普通对象的响应式代理。等同于 `vue 2.x` 的 `Vue.observable`。

`Proxy` 取代 `Object.defineProperty`

#### effect

函数用于定义副作用，它的参数就是副作用函数。在副作用函数内的响应式数据会与副作用函数之间建立联系，即所谓的依赖收集，当响应式数据变化之后，会导致副作用函数重新执行。

`effect()` 函数来自于 `@vue/reactivity` ，`watchEffect()` 函数来自于 `@vue/runtime-core`。它们的区别在于：`effect()` 是非常底层的实现，`watchEffect()` 是基于 `effect()` 的封装，`watchEffect()` 会维护与组件实例以及组件状态(是否被卸载等)的关系，如果一个组件被卸载，那么 `watchEffect()` 也将被 `stop`。

#### computed

计算属性， ref 对象，本质是 effect



## 性能

### Proxy

`Proxy` 取代 `defineProperty`

- 全语言特性支持：对象属性的增添/删除、数组index/length修改、`Map`、`Set`、`WeakMap`、`WeakSet` 等
- 更好的性能：不需要初始化 `defineProperty`，减少组件初始化开销

### vdom 发展

#### Vue1.x

![img](vue1-vdom.png)

#### React 15

![img](react15-vdom.png)

### Vue 2

![img](vue2-vdom.png)

### React 16 Fiber

![img](react16-vdom.png)

### vue 3

`vdom` 重写：**更多的编译时优化，减少运行时开销**

- 静态标记：纯静态节点会被标记（`_createVNode` 第四个参数不传），`dom diff` 时忽略
- `_createVNode` 第四个参数可以判断哪些属性是动态的，`dom diff` 时只比较动态的属性
- `dom diff` 算法：`vue2` 双端比较，`vue3` 加入了最长递增子序列



## vite

> vite：法语，快的意思；vue 也是法语，视图的意思
>
> https://github.com/vitejs/create-vite-app
>
> https://juejin.im/post/5eaeb6c4f265da7bae2f9914

定位：**更轻、更快的，面向现代浏览器的开发工具**

- 基于浏览器原生的 ES module import 功能，来实现文件的加载
- 开发时无需打包，请求时在服务端按需编译返回，引用多少，编译多少
- 内置 vue 单文件支持（和 vue 不强绑定）、支持 ts，支持热更新，热更新的速度不会随着模块增多而变慢
- 生产环境用 内置的配置好的 rollup 打包，也是面向现代浏览器

### 支持 `import vue`

1. `import xx from 'vue'` 重写成 `import xx from '/@modules/vue.js'`
2. koa 拦截 @module 开头的请求，去 `node_modules` 里找

### .vue 文件解析

1. `.vue` 的文件拆成了三个请求（分别对应 `script`、`style` 和`template`） ，以 url 的 query 参数进行区分
2. 浏览器会先收到包含 `script` 逻辑的 `App.vue` 的响应，然后解析到 `template` 和 `style` 的路径后，会再次发起 HTTP 请求来请求对应的资源，此时 Vite 对其拦截并再次处理后返回相应的内容。

### 热更新

Vite 的是通过 `WebSocket` 来实现的热更新通信。

客户端的代码在 `src/client/client.ts`，主要是创建 `WebSocket` 客户端，监听来自服务端的 HMR 消息推送。

Vite 的 WS 客户端目前监听这几种消息：

- `connected`: WebSocket 连接成功
- `vue-reload`: Vue 组件重新加载（当你修改了 script 里的内容时）
- `vue-rerender`: Vue 组件重新渲染（当你修改了 template 里的内容时）
- `style-update`: 样式更新
- `style-remove`: 样式移除
- `js-update`: js 文件更新
- `full-reload`: fallback 机制，网页重刷新

