# `core-js & polyfill`

## `core-js`

`core-js` 是一个标准的 `javascript` 标准库。它包含了 `ECMAScript 2020` 在内的多项特性的 `polyfills`，以及 `ECMAScript` 在 `proposals` 阶段的特性和 `WHATWG/W3C` 新特性等。它是一个现代化前端项目的“标准套件”。

`core-js` 是一个由 `Lerna` 搭建的 `Monorepo` 风格的项目，它的 `packages` 包含 5 个包：

1. `core-js`

**`core-js` 实现的是基础垫片能力，是整个 `core-js` 的逻辑核心 **。使用方式：

```js
import 'core-js'
// or
import 'core-js/features/array/from'
```

2. `core-js-pure`

`core-js` 实现垫片能力是直接覆盖 `Array`、`Object` 等的 `prototype` 来实现的。`core-js-pure` 提供了不污染全局变量的垫片能力，导出的仅仅是各种特性的实现方法：

```js
import _from from 'core-js-pure/fetaures/array/from'
```

3. `core-js-compact`

`core-js-compact` 维护了按照 [`browserslist`](https://github.com/browserslist/browserslist) 规范的垫片需求数据，来帮助我们找到“符合目标环境”的 `polyfills` 需求合集，如：

```js
const {
    list, // 筛选出全球使用份额大于 2.5% 的浏览器范围需要的模块
    targets 
} = require('core-js-compact')({
    targets: '2.5%'
})
```

`core-js-compact` 可以被 `Babel` 生态使用，由 `Babel` 分析出根据环境需要按需加载的垫片

4. `core-js-builder`

`core-js-builder` 可以结合 `core-js-compact` 以及 `core-js`，并利用 `webpack` 能力，根据需求打包 `core-js` 代码：

```js
// 把符合要求的垫片打包到 my-core-js-bundle.js 文件
require('core-js-builder')({
    targets: '> 0.5%',
    filename: './my-core-js-bundle.js'
}).then(code => ...)
```

5. `core-js-builder`

`core-js-builder` 供 `Node.js` 服务调用，构建出不同场景的垫片包。

## `polyfill` 方案

`polyfill` 就是社区上提供的一段代码，让我们在不兼容某些新特性的浏览器上，使用该特性。完美的 `polyfill` 方案需要做到侵入性最小，工程化、自动化程度最高，业务影响最低，核心原则是按需加载补丁：

- 按照用户终端环境；
- 按照业务代码使用情况。

**`@babel/polyfill` + `@babel/preset-env` + `useBuiltins(entry)` + `preset-env targets`**

`@babel/polyfill` 就是 `core-js` 和 `regenerator-runtime` 两个包的结合，`regenerator-runtime` 提供的是 `generator`、`async`、`await` 的降级实现。

`@babel/preset-env` 定义了 `Babel` 所需插件预设，同时 `babel` 根据 `preset-env targets` 配置的支持环境，自动按需加载 `polyfills`，如：

```js
{
    presets: [
        ["@babel/env", {
            useBuiltIns: 'entry',
            targets: {
                chrome: 44
            }
        }]
    ]
}
```

这样在工程代码入口处的：

```js
import '@babel/polyfill'
```

会被编译成：

```js
import 'core-js/xxx/xxx'
import 'core-js/xxx/xxx'
...
```

**`useBuiltins(usage)`**

`useBuiltins` 配置为 `usage` ，它可以真正根据代码情况，分析 `AST` 进行更细粒度的按需引用，只有项目代码中使用到的新特性才会打补丁。

但是这种基于静态编译的按需加载补丁也是相对的，因为 `javascript` 是一种弱类型的动态语言，比如 `foo.includes`，我们无法判断这里的 `includes` 是数组原型方法还是字符串原型方法，因此一般做法只能将数组原型方法和字符串原型方法同时打包。

**`@babel/plugin-transform-runtime`**

用于重复使用 `babel` 注入的 `helpers` 函数，达到节省代码大小的目的。`helpers` 函数是由 `@babel/runtime` 提供的（同时 `@babel/runtime` 也提供了 `regenerator-runtime`，对 `enerator` 和 `async` 函数进行编译降级）。

- `@babel/plugin-transform-runtime` 需要和 `@babel/runtime` 配合使用；

- `@babel/plugin-transform-runtime` 用于编译时，作为 `devDependencies` 使用；

- `@babel/plugin-transform-runtime` 将业务代码编译，引用 `@babel/runtime `提供的 `helpers`，达到缩减编译产出体积的目的；

- `@babel/runtime` 用于运行时，作为 `ependencies` 使用。

- `@babel/plugin-transform-runtime` 和 `@babel/runtime` 结合除了可以对产出代码瘦身以外，还能避免污染全局作用域。

