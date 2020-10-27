# vue3 响应式原理

## 概览

`vue3` 响应式系统的源码在仓库 [vue-next](https://github.com/vuejs/vue-next) 的 `packages/reactivity` 中，源码目录结构如下：

```
packages/reactivity
|-- src
	|-- baseHandlers.ts			// Proxy handler，针对常规对象（Array，Object）
	|-- collectionHandlers.ts	// Proxy handler，针对 Set、Map、WeakMap、WeakMap 集合对象
	|-- computed.ts				// 计算属性，同 vue2 的 computed
	|-- effect.ts				// 依赖收集，响应式处理
	|-- index.ts				// 入口文件，导出 API
	|-- operations.ts			// 触发依赖收集及更新的数据操作类型枚举
	|-- reactive.ts				// 针对对象的响应式代理
	|-- ref.ts					// 针对基本数据类型的响应式代理
|-- README.md					// readme 文档
```

看一眼 `README` 文档：

- 包 `@vue/reactivity` 会被内嵌到面向用户的渲染器（例如：`@vue/runtime-core`）中使用 ，也可单独使用
- 除了 `Object` 、`Array`、`Map`、`WeakMap`、`Set`、`WeakSet` 之外，其他 `JavaScript` [内建对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects) （比如：`Date`、`RegExp`）不能被响应式代理

`vue3` 响应式系统 API 可参看[官方rfc文档]([https://composition-api.vuejs.org/zh/api.html#%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F-api](https://composition-api.vuejs.org/zh/api.html#响应式系统-api)) ，各API使用方式可见：[demo](https://github.com/whu-luojian/vite-vue3)。

主要有四个关键的API:

- `reactive`：针对对象的响应式代理，等同于 `vue 2.x` 的 [`Vue.observable`](https://cn.vuejs.org/v2/api/#Vue-observable)，作用等同于 `vue 2.x` 的 `data` 选项
- `ref`：针对基本类型的响应式代理，返回一个具有 `.value` 属性的响应式包装对象
- `computed`：计算属性，等同于 `vue 2.x` 的 `computed` 选项
- `effect`：用来进行依赖收集的API，作用等同于  `vue 2.x` 的 `watcher`，`computed`、`watch`、`watchEffect` API 都是基于 `effect` 实现的

## reactive



## ref

接受一个参数值并返回一个响应式且可改变的 ref 对象。ref 对象拥有一个指向内部值的单一属性 `.value`。

`ref` 类型定义：

```tsx
declare const RefSymbol: unique symbol

interface Ref<T = any> {
    [RefSymbol]: true // 标识是否是 ref
    value: T // ref 的值
}
```

