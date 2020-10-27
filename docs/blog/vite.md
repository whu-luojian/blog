# vite

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

## 支持 `import vue`

1. `import xx from 'vue'` 重写成 `import xx from '/@modules/vue.js'`
2. koa 拦截 @module 开头的请求，去 `node_modules` 里找

## .vue 文件解析

1. `.vue` 的文件拆成了三个请求（分别对应 `script`、`style` 和`template`） ，以 url 的 query 参数进行区分
2. 浏览器会先收到包含 `script` 逻辑的 `App.vue` 的响应，然后解析到 `template` 和 `style` 的路径后，会再次发起 HTTP 请求来请求对应的资源，此时 Vite 对其拦截并再次处理后返回相应的内容。

## 热更新

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

