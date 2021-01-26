# webpack 快问快答

> 参考或摘录文章：
>
> 1. [非常详细的解答了5个webpack疑问](https://mp.weixin.qq.com/s/Rl0Zo4o0CP-BhK2ci56CgQ)
> 2. [前端基础建设与架构 30 将](https://kaiwu.lagou.com/course/courseInfo.htm?courseId=584#/content)
> 3. [前端工程化精讲](https://kaiwu.lagou.com/course/courseInfo.htm?courseId=416#/content)

## module，chunk 和 bundle 的区别？

`module`，`chunk`，`bundle` 就是同一份逻辑代码在不同转换场景下取的三个名字：我们直接写出来的是 module，webpack 处理时是 chunk，最后生成浏览器可以直接运行的是 bundle。

![webpack-chunk](webpack-chunk.webp)

如上图：
1. 我们手写下的一个个文件，无论是 ESM 还是 commonJS 或者 AMD，它们都是 `module`；
2. 我们写的 module 源文件传到 webpack 进行打包时，webpack 会根据文件引用关系生成 `chunk` 文件，默认的 chunk 数量实际上是由你的入口文件数量决定的（每一个入口点都是一个 chunk group，在不考虑分包的情况下，一个 chunk group 中只有一个 chunk），但是如果你配置动态加载或者提取公共包的话，也会生成新的 chunk；
3. webpack 处理好 chunk 文件后，最后会输出 `bundle` 文件，这个 bundle 文件包含了经过加载和编译的最终源文件，可以在浏览器中运行。

## filename 和 chunkFilename 区别？

1. `filename` 是指列在 `entry` 中，打包后输出文件的名称：

```js
enrty: {
  index: '../src/index.js'
}
output: {
  filename: '[name].min.js' // index.min.js
}
```

2. `chunkFilename` 就是未列在 `entry` 中，缺又需要打包出来的文件（**动态加载或者提取公共包后生成的 chunk**）名称，如果 chunkFilename 未指定（如 `output.chunkFilename`）,默认以 chunk 文件的 id 作为文件名。

## webpackPrefetch、webpackPreload 和 webpackChunkName 是干什么的？

这几个名词都是 webpack 的[魔法注释](https://webpack.docschina.org/api/module-methods/#magic-comments)，可以组合使用:

1. `webpackChunkName`：在 import 里以注释形式为新 chunk 文件命名，这样将动态加载生成的 新 chunk 命名为 `[my-chunk-name].js` 而不是 `[id].js`。
2. `webpackPrefetch`(预拉取)会在浏览器闲置时下载对应的 chunk。
3. `webpackPreload`(预加载)会在父 chunk 加载时并行下载对应的 chunk。

## hash、chunkhash、contenthash 有什么不同？

1. `hash:` 同一次构建过程中生成的 hash 是一样的，每一次构建后生成的哈希值都不一样，即使文件内容压根没有改变；
2. `chunkhash:` 根据入口文件进行依赖解析，同一 chunk 内的文件 hash 一样；
3. `contenthash:` 根据文件内容，生成 hash 值。

具体可参考文章[从源码看 webpack 的 hash 策略](https://juejin.cn/post/6844903942384517127)

## Webpack 中的 sideEffects

webpack v4 新增了 `sideEffects` 特性，为 tree-shaking 提供更大的优化空间。通过在 package.json 中加入 `sideEffects` 属性来表明模块是否包含 `sideEffects(副作用)` 。

如果所有代码都不包含副作用，可以将 `sideEffects` 置为 `false` ，来告知 webpack ，它可以安全地删除未用到的 `export` 导出。

`sideEffects` 值可以为一个数组，值为包含副作用的代码文件，任何导入的文件都会受到 tree shaking 的影响，这意味着如果在项目中使用类似 css-loader 并导入 css 文件，则需将其添加到 `sideEffects` 列表中，以免在生产模式中无意中将它删除，如 `antd` 的 `sideEffects` 为：

```json
{
  "sideEffects": [
    "dist/*",
    "es/**/style/*",
    "lib/**/style/*",
    "*.less"
  ]
}
```

对于 Webpack 工具，开发者可以在 [`module.rule`](https://github.com/webpack/webpack/issues/6065#issuecomment-351060570) 配置中声明副作用模块。

## Babel 和 Tree Shaking

`Tree Shaking` 依托于 ESM ，而如果使用 `Babel` 对代码进行编译，`Babel` 默认会将 ESM 编译为 CommonJS 模块规范，因此需要配置 `Babel` 对于模块化的编译降级，具体配置项在 [babel-preset-env#modules](https://babeljs.io/docs/en/babel-preset-env#modules) 中。

某些工具链上的工具是依赖 CommonJS 规范的代码的，比如 `Jest`，`Jest` 是基于 Nodejs 开发的，运行在 Node.js 环境，因此使用 `Jest` 进行测试时，需要模块符合 CommonJS 规范，因此需要**根据不同的环境，采用不同的 `Babel` 配置**。
在生产环境，配置：

```js
production: {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false
      }
    ]
  ]
}
```

在测试环境：

```js
test: {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'commonjs'
      }
    ]
  ]
}
```

## Webpack 和 Tree Shaking

Webpack 4.0 以上版本在 mode 为 production 时，会自动开启 `Tree Shaking` 能力。
Webpack 真正执行模块去除，是依赖了 `TerserPlugin`、`UglifyJS` 等压缩插件。Webpack 负责对模块进行分析和标记，压缩插件负责根据标记结果，进行代码删除。Webpack 在分析时，有三类标记：
1. `harmony export`：被使用过的 `export` 会被标记为 `harmony export`；
2. `unused harmony export`：没被使用过的 `export` 会被标记为 `unused harmony export`；
3. `harmony import`：所有 `import` 会被标记为 `harmony import`。

## source map 中 eval、cheap、inline 和 module 是什么意思？

source map 就是一份源码和转换后代码的映射文件。
在 webpack 中，通过设置 devtool 来选择 source map 的预设类型，文档共有[20 余种预设](https://webpack.js.org/configuration/devtool/#devtool)，这些预设基本都是 `eval`、`cheap`、`module`、`inline`、`hidden`、`nosource`、`source-map` 等关键字的组合：
- `false`：不开启 source map 功能。
- `eval`：使用 [EvalDevToolModulePlugin](https://github.com/webpack/webpack/blob/master/lib/EvalDevToolModulePlugin.js) 作为 source map 的处理插件。模块产物代码通过 eval() 封装，模块代码后添加 sourceURL=webpack:/// + 模块引用路径，不生成 source map 内容。
- `cheap`: map 映射只显示行不显示列，忽略源自 loader 的 source map。
- `inline`: 映射文件以 base64 格式编码，加在 bundle 文件最后，不产生独立的 map 文件。
- `module`: 增加对 loader source map 和第三方模块的映射。

常用配置：
- `source-map`：`source-map` 是最大而全的，会生成独立的 map 文件，会显示报错的行列信息。
- `cheap-source-map`：会生成独立的 map 文件，不会产生列映射。
- `eval-source-map`：会以 eval() 函数打包运行模块，不产生独立的 map 文件，会显示报错的行列信息。
- `inline-source-map`：映射文件以 base64 格式编码，加在 bundle 文件最后，不产生独立的 map 文件。
- `cheap-module-eval-source-map`：**开发环境推荐使用**，在构建速度报错提醒上做了比较好的均衡。
- `cheap-module-source-map`: 一般来说，生产环境是不配 source map 的，如果想捕捉线上的代码报错，可以用这个。
