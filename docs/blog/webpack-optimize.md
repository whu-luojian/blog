# Webpack 性能优化

## 工具

1. **基于时间的分析工具**：统计项目构建过程中在编译阶段的耗时情况。例如 [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)。
2. **基于产物内容的分析工具**：从产物内容着手，分析对产物包体积影响最大的包的构成，找出冗余的、可以被优化的依赖项，减少这些冗余的依赖包模块，不仅能减小最后的包体积大小，也能提升构建模块时的效率。可以使用 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) 分析产物内容。
3. ...

## 编译模块阶段优化

编译模块阶段所耗的时间是从单个入口点开始，编译每个模块的时间的总和。要提升这一阶段的构建效率，大致可以分为三个方向：
1. 减少执行编译的模块。
2. 提升单个模块构建的速度。
3. 并行构建以提升总体效率。

### 减少执行编译的模块

提升编译模块阶段效率的第一个方向就是减少执行编译的模块。

#### 按需引入模块
- **导入时声明特定模块**：一般适用于工具类库性质的依赖包的优化，典型例子是 lodash 依赖包。导入声明时只导入依赖包内的特定模块，不引入整个 lodash，也可借助 lodash-webpack-plugin 插件；
- **babel-plugin-import**：借助 babel-plugin-import 插件实现对 antd、elemen-ui 等组件库的按需加载；

#### IgnorePlugin
有的依赖包，除了项目所需的模块内容外，还会附带一些多余的模块。典型的例子是 moment 这个包，一般情况下在构建时会自动引入其 locale 目录下的多国语言包。
[IgnorePlugin](https://www.webpackjs.com/plugins/ignore-plugin/) 是 webpack 的内置插件，作用是忽略第三方包指定目录。
例如: [moment](https://momentjs.com/) 2.18 会将所有本地化内容和核心功能一起打包（见[该 GitHub issue](https://github.com/moment/moment/issues/2373)）。你可使用 IgnorePlugin 在打包时忽略本地化内容:
```js
//打包 moment 时忽略 moment 下的 ./locale 目录
new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
```

在使用的时候，如果我们需要指定语言，那么需要我们手动的去引入语言包，例如，引入中文语言包:
```js
import moment from 'moment';
import 'moment/locale/zh-cn';// 手动引入
```

也可以使用 [ContextReplacementPlugin](https://www.webpackjs.com/plugins/context-replacement-plugin/) 插件来加载特定的语言包：
```js
// 限定查找 moment/locale 上下文里符合 /zh-cn/ 表达式的文件，
// 因此也只会打包中文语言包（更多详细信息，请查看这个 issue）。
new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
```

#### DllPlugin
[DllPlugin](https://webpack.docschina.org/plugins/dll-plugin/) 的核心思想是将项目依赖的框架等模块单独构建打包，与普通构建流程区分开。比如，使用单独的 webpack 配置（webpack.dll.config.js）将 React 与 react-dom 单独打包成动态链接库，同时生成一个名为 manifest.json 的文件，然后在 webpack.config.js 中使用 [DllReferencePlugin](https://webpack.docschina.org/plugins/dll-plugin/#dllreferenceplugin) 连接 manifest.json 文件，从而映射到相应的依赖上，见[具体步骤](https://juejin.cn/post/6844904093463347208?utm_source=gold_browser_extension%3Futm_source%3Dgold_browser_extension#heading-11)。

#### Externals
Webpack 配置中的 externals 和 DllPlugin 解决的是同一类问题：将依赖的框架等模块从构建过程中移除。它们的区别在于：
1. 在 Webpack 的配置方面，externals 更简单，而 DllPlugin 需要独立的配置文件。
2. DllPlugin 包含了依赖包的独立构建流程，而 externals 配置中不包含依赖框架的生成方式，通常使用已传入 CDN 的依赖包。
3. externals 配置的依赖包需要单独指定依赖模块的加载方式：全局对象、CommonJS、AMD 等。
4. 在引用依赖包的子模块时，DllPlugin 无须更改，而 externals 则会将子模块打入项目包中。

### 提升单个模块的构建速度

提升编译阶段效率的第二个方向，是在保持构建模块数量不变的情况下，提升单个模块构建的速度（减少单个模块不必要的逻辑处理，比如 loader 处理）。

#### include/exclude
Webpack 加载器配置中的 include/exclude，是常用的优化特定模块构建速度的方式之一。include 的用途是只对符合条件的模块使用指定 Loader 进行转换处理。而 exclude 则相反，不对特定条件的模块使用该 Loader（例如不使用 babel-loader 处理 node_modules 中的模块）
1. exclude 的优先级高于 include，尽量避免 exclude，更倾向于使用 include；
2. 通过 include/exclude 排除的模块，**并非不进行编译**，而是使用 Webpack 默认的 js 模块编译器进行编译（例如推断依赖包的模块类型，加上装饰代码等）。

#### noParse
Webpack 配置中的 [module.noParse](https://webpack.docschina.org/configuration/module/#modulenoparse) 则是在上述 include/exclude 的基础上，进一步省略了使用默认 js 模块编译器进行编译的时间。
noParse 属性的值是一个正则表达式或者是一个 function，防止 webpack 解析那些任何与给定正则表达式相匹配的文件。忽略的文件中**不应该含有** import, require, define 的调用，或任何其他导入机制，例如：jquery 、lodash。
vue cli 默认的 noParse 配置为：
```js
module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    ...
}
```

#### Resolve
Webpack 中的 [resolve](https://webpack.docschina.org/configuration/resolve/) 配置制定的是在构建时指定查找模块文件的规则，例如：
- **resolve.modules**：指定查找模块的目录范围。
- **resolve.extensions**：指定查找模块的文件类型范围，默认是 `['.js', '.json']`，如果你要对它进行配置，记住将频率最高的后缀放在第一位，并且控制列表的长度，以减少尝试次数。
- **resolve.mainFields**：指定查找模块的 package.json 中主文件的属性名。
- **resolve.symlinks**：指定在查找模块时是否处理软连接。

#### Source Map
对于生产环境的代码构建而言，根据项目实际情况判断是否开启 Source Map。在开启 Source Map 的情况下，优先选择与源文件分离的类型，例如 "source-map"。
开发环境推荐选择 cheap-module-eval-source-map，在构建速度报错提醒上做了比较好的均衡。

#### TypeScript 编译优化
[ts-loader](https://www.npmjs.com/package/ts-loader) 默认在编译 TS 之前会进行类型检查，因此编译时间往往比较慢，通过加上配置项 transpileOnly: true （仅编译），可以在编译时忽略类型检查，从而大大提高 TS 模块的编译速度，但丧失了 TS 中最重要的类型检查功能，因此许多脚手架中会配合 [ForkTsCheckerWebpackPlugin](https://www.npmjs.com/package/fork-ts-checker-webpack-plugin) （开启一个独立的进程进行 TS 类型检查）一同使用。如 vue-cli 中**生产环境**相关配置为：
```js
module.exports = {
    ...
    module: {
        ...
        rules: [
            ...
            // ts-loader
            {
                test: /\.ts$/,
                use: [
                    'cache-loader',
                    'thread-loader',
                    'babel-loader',
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true, // 仅编译，不做类型检查
                            happyPackMode: true // 配合 HappyPack or thread-loader 使用
                        }
                    }
                ]
            }
        ]
    }，
    plugins: [
        ...
        // fork-ts-checker
        new ForkTsCheckerWebpackPlugin({
            vue: true, // 支持 vue 单文件组件
            tslint: false, // ？
            formatter: 'codeframe',
            checkSyntacticErrors: true
        })
    ]
}
```

### 并行构建以提升总体效率

编译阶段提效的第三个方向是使用并行的方式来提升构建效率。并行构建方案在 webpack 2 时代出现，在 webpack 4 时代发布。
一般项目的开发阶段和小型项目的构建流程不需要并发的模式，因为并发所需的多进程管理和通信带来的额外时间成本可能会超过使用工具带来的收益。并发思路一般用于大中型项目的生产环境构建。常用工具如下：

#### HappyPack 与 thread-loader
这两种工具都作用于模块编译的 loader 上，用于在特定 loader 的编译过程中，以开启多进程的方式加速编译。
[HappyPack](https://www.npmjs.com/package/happypack) 诞生较早，配置较繁琐，[thread-loader](https://www.npmjs.com/package/thread-loader) 参照它的效果实现，配置方式与常规 loader 无异。

#### Parallel-webpack
并发构建的第二种场景是针对**多配置构建**。webpack 的配置文件可以是一个包含多个子配置对象的数组，如：
```js
// webpack.parallel.config.js

const config1 = require('./webpack.doc.config')
const config2 = require('./webpack.bundle.config')
const config3 = require('./webpack.css.config')

module.exports = [config1, config2, config3]
```

在执行这类多配置构建时，默认串行执行，而通过 [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) 可以实现相关配置的并行处理：
```bash
parallel-webpack --config webpack.parallel.config.js
```

## 优化阶段（产物生成）提效

整个优化阶段可以细分为 12 个子任务，每个任务依次对数据进行一定的处理，并将结果传递给下一个任务：
![img-1](webpack-optimize-2.png)

### 提升当前任务工作效率

项目优化阶段主要耗时的任务有两个：
1. 生成 ChunkAssets，即**根据 Chunk 信息生成 Chunk 的产物代码**；
2. 优化 (Chunk)Assets，即**压缩 Chunk 产物代码**。
第一个任务主要在 Webpack 引擎内部的模块中进行处理，主要利用**缓存**进行优化，后文再讲。
主要看下压缩代码的优化方案

#### JS 压缩
Webpack 4 内置了 [TerserWebpackPlugin](https://www.npmjs.com/package/terser-webpack-plugin) 作为默认的 JS 压缩工具，早起主要使用的是 [UglifyjsWebpackPlugin](https://www.npmjs.com/package/uglifyjs-webpack-plugin)。这两个插件压缩功能分别基于 [Terser](https://www.npmjs.com/package/terser) 和 [UglifyJS](https://github.com/mishoo/UglifyJS)，Terser 原本是 Fork 自 Uglify-es 的项目，整体性能上略胜一筹。
TerserWebpackPlugin 中对执行效率产生影响的配置为：
1. Cache：默认开启，使用缓存能极大提升再次构建时的工作效率；
2. Parallel：默认开启，并发在大多数情况下能够提升工作效率。在小型项目中，多进程通信的额外消耗会抵消带来的收益；
3. terserOptions：即 Terser 工具中的 [minify 选项](https://github.com/terser/terser#minify-options)。主要关注 compress 和 mangle 选项：
  1. **compress** 参数作用是执行特定的压缩策略，**主要影响压缩效率**，当 compress 参数为 false 时，压缩阶段效率有明显提升；
  2. **mangle（/ˈmæŋ.ɡəl/ 撕裂，损坏）** 参数作用是对源代码中的变量和函数名称进行压缩，**主要影响压缩质量**，当参数为 true 时，产物体积有明显缩小。
Vue CLI 中相关配置为：
```js
optimization: {
    ...
    minimizer: [
      new TerserPlugin(
        {
          terserOptions: {
            compress: {
              arrows: false,
              collapse_vars: false,
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,
              booleans: true,
              if_return: true,
              sequences: true,
              unused: true,
              conditionals: true,
              dead_code: true,
              evaluate: true
            },
            mangle: {
              safari10: true
            }
          },
          sourceMap: false,
          cache: true,
          parallel: true,
          extractComments: false
        }
      )
    ]
}
```

#### CSS 压缩
CSS 压缩目前主要有三个可选 plugin：
1. [OptimizeCSSAssetsPlugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin)：在 Create-React-App 中使用；
2. [OptimizeCSSNanoPlugin](https://www.npmjs.com/package/@intervolga/optimize-cssnano-plugin)：在 Vue-CLI 中使用；
3. [CSSMinimizerWebpackPlugin](https://www.npmjs.com/package/css-minimizer-webpack-plugin)：020 年 Webpack 社区新发布的 CSS 压缩插件。
这三个插件都默认基于 [cssnano](https://cssnano.co/) 实现，因此在压缩质量方面没有什么差别。在压缩效率方面，最新发布的 CSSMinimizerWebpackPlugin，它**支持缓存和多进程**，这是另外两个工具不具备的，首先推荐使用。
Vue CLI 中 CSS 压缩相关配置为：
```js
plugins: [
    new MiniCssExtractPlugin({
      // 输出的每个 CSS 文件的名称。
      filename: 'css/[name].[contenthash:8].css',
      // 非入口的 chunk 文件名称,机制类似于 output.chunkFilename
      chunkFilename: 'css/[name].[contenthash:8].css'
    }),
    new OptimizeCssnanoPlugin({
      sourceMap: false,
      cssnanoOptions: {
        preset: [
          'default',
          {
            mergeLonghand: false,
            cssDeclarationSorter: false
          }
        ]
      }
    })
]
```

### 提升后续任务工作效率

优化阶段的另一类优化方向是通过对本环节的处理减少后续环节处理内容，以便提升后续环节的工作效率，主要有两个：

#### Split Chunks
[Split Chunks（分包）](https://webpack.js.org/guides/code-splitting/)是指在 Chunk 生成之后，optimizeChunks 阶段将原先以入口点来划分的 Chunks 根据一定的规则（例如异步引入或分离公共依赖等原则），分离出子 Chunk 的过程。
 Webpack 4 中内置 [SplitChunksPlugin](https://www.webpackjs.com/plugins/split-chunks-plugin/) 用于分包：
- 默认的分包规则为 chunks: 'async'，作用是分离动态引入的模块 (import('…'))，在处理动态引入的模块时能够自动分离其中的公共依赖。
- 多入口静态引用相同依赖包的情况，**不会处理分包。设置为 chunks: 'all'，则能够将所有的依赖情况都进行分包处理。**
Vue CLI 相关配置为：
```js
optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10, // 优先级，当一个 module 存在于多个 chunk 时如何分配
          chunks: 'initial'
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    },
    ...
}
```

#### Tree Shaking
[Tree Shaking（摇树）](https://webpack.js.org/guides/tree-shaking/)是指在构建打包过程中，移除那些引入但未被使用的无效代码（Dead-code）。
要让引入的模块支持 Tree Shaking，一般有 4 点需要注意：
1. **ES6 模块**： 首先，只有 ES6 类型的模块才能进行Tree Shaking。因为 ES6 模块的依赖关系是确定的，因此可以进行不依赖运行时的**静态分析**，而 CommonJS 类型的模块则不能。
2. **引入方式**：以 default 方式引入的模块，无法被 Tree Shaking；而引入单个导出对象的方式，无论是使用 import * as xxx 的语法，还是 import {xxx} 的语法，都可以进行 Tree Shaking。
3. **sideEffects**：在 Webpack 4 中，会根据依赖模块 package.json 中的 sideEffects 属性来确认对应的依赖包代码是否会产生副作用。只有 sideEffects 为 false 的依赖包（或不在 sideEffects 对应数组中的文件），才可以实现安全移除未使用代码的功能。常用于对 CSS 文件模块开启副作用模式，以防止被移除。
4. **Babel**：在 Babel 7 之前的 **babel-preset-env** 中，modules 的默认选项为 **'commonjs'**，因此在使用 babel 处理模块时，即使模块本身是 ES6 风格的，也会在转换过程中，因为被转换而导致无法在后续优化阶段应用 Tree Shaking。而在 Babel 7 之后的 @babel/preset-env 中，modules 选项默认为 **'auto'**，它的含义是对 ES6 风格的模块不做转换（等同于 modules: false），而将其他类型的模块默认转换为 CommonJS 风格。因此我们会看到，后者即使经过 babel 处理，也能应用 Tree Shaking。

## 基于缓存的全阶段优化

缓存用来提升再次构建的效率。

### Babel-loader

[Babel-loader](https://webpack.js.org/loaders/babel-loader/) 是绝大部分项目中会使用到的 JS/JSX/TS 编译器。在 Babel-loader 中，与缓存相关的设置主要有：
- **cacheDirectory**：默认为 false，即不开启缓存。当值为 true 时开启缓存并使用默认缓存目录（./node_modules/.cache/babel-loader/），也可以指定其他路径值作为缓存目录。
- **cacheIdentifier**：用于计算缓存标识符。默认使用 Babel 相关依赖包的版本、babelrc 配置文件的内容，以及环境变量等与模块内容一起参与计算缓存标识符。如果上述内容发生变化，即使模块内容不变，也不能命中缓存。
- **cacheCompression**：默认为 true，将缓存内容压缩为 gz 包以减小缓存目录的体积。在设为 false 的情况下将跳过压缩和解压的过程，从而提升这一阶段的速度。

### Cache-loader

在编译过程中利用缓存的第二种方式是使用 [Cache-loader](https://webpack.js.org/loaders/cache-loader/)。在使用时，需要将 cache-loader 添加到对构建效率影响较大的 Loader（如 babel-loader 等）之前：
```js
./webpack.cache.config.js
...
module: {
  rules: [
    {
      test: /\.js$/,
      use: ['cache-loader', 'babel-loader'],
    },
  ],
}
...
```

**使用 cache-loader 后，比使用 babel-loader 的开启缓存选项后的构建时间更短**，主要原因是 babel-loader 中的缓存信息较少，而 cache-loader 中存储的**Buffer 形式的数据处理效率更高**。
**Vue CLI 中对 vue-loader 和 babel-loader 使用了 cache-loader**。

### 生成 ChunkAsset 时的缓存优化

在 Webpack 4 中，生成 ChunkAsset 过程中的缓存优化是受限制的：只有在 watch 模式下，且配置中开启 [cache](https://v4.webpack.js.org/configuration/other-options/#cache) 时（development 模式下自动开启）才能在这一阶段执行缓存的逻辑。这是因为，在 Webpack 4 中，**缓存插件是基于内存的**，只有在 watch 模式下才能在内存中获取到相应的缓存数据对象。而在 Webpack 5 中这一问题得到解决。

### 代码压缩时的缓存优化

在代码压缩阶段：
- 对于 JS 的压缩，TerserWebpackPlugin 和 UglifyJSPlugin 都是支持缓存设置的；
- 而对于 CSS 的压缩，目前最新发布的 CSSMinimizerWebpackPlugin 支持且默认开启缓存，其他的插件如 OptimizeCSSAssetsPlugin 和 OptimizeCSSNanoPlugin 目前还不支持使用缓存。

## Webpack 5 中的优化

Webpack 5 中的变化有很多，完整的功能变更清单参见[官方文档](https://github.com/webpack/changelog-v5)、[中文文档](https://webpack.docschina.org/blog/2020-10-10-webpack-5-release/)，这里我们介绍其中与构建效率相关的几个主要功能点：
- Persistent Caching
- Tree Shaking
- Logs

### Persistent Caching

示例：
```js
./webpack.cache.config.js
…
module.exports = {
  …
  cache: {
    type: 'filesystem',
    cacheLocation: path.resolve(__dirname, '.appcache'),
    buildDependencies: {
      config: [__filename],
    },
  },
  …
}
```

在 Webpack 4 中，cache 只是单个属性的配置，所对应的赋值为 true 或 false，用来代表是否启用缓存，或者赋值为对象来表示在构建中使用的缓存对象。而在 Webpack 5 中，cache 配置除了原本的 true 和 false 外，还增加了许多子配置项，具体功能可以通过[官方文档](https://webpack.js.org/configuration/other-options/#cache)进行查询，例如：
- cache.type：缓存类型。值为 'memory'或‘filesystem’，分别代表基于内存的临时缓存，以及基于文件系统的持久化缓存。在选择 filesystem 的情况下，下面介绍的其他属性生效。
- cache.cacheDirectory：缓存目录。默认目录为 node_modules/.cache/webpack。
- cache.name：缓存名称。同时也是 cacheDirectory 中的子目录命名，默认值为 Webpack 的 ${config.name}-${config.mode}。
- cache.cacheLocation：缓存真正的存放地址。默认使用的是上述两个属性的组合：path.resolve(cache.cacheDirectory, cache.name)。该属性在赋值情况下将忽略上面的 cacheDirectory 和 name 属性。
在 Webpack 4 中，部分插件是默认启用缓存功能的（例如压缩代码的 Terser 插件等），项目在生产环境下构建时，可能无意识地享受缓存带来的效率提升，但是在 Webpack 5 中则不行。无论是否设置 cache 配置，**Webpack 5 都将忽略各插件的缓存设置**（例如 TerserWebpackPlugin），而由引擎自身提供构建各环节的缓存读写逻辑。**因此，项目在迁移到 Webpack 5 时都需要通过上面介绍的 cache 属性来单独配置缓存**。

### Tree Shaking

- **Nested Tree Shaking**：Webpack 5 增加了对嵌套模块的导出跟踪功能，能够找到那些嵌套在最内层而未被使用的模块属性；
- **Inner Module Tree Shaking**： 除了对嵌套引用模块的依赖分析优化外，Webpack 5 中还增加了分析模块中导出项与导入项的依赖关系的功能。通过 optimization.innerGraph（生产环境下默认开启）选项，Webpack 5 可以分析特定类型导出项中对导入项的依赖关系，从而找到更多未被使用的导入模块并加以移除。
- **CommonJS Tree Shaking**：Webpack 5 中增加了对一些 CommonJS 风格模块代码的静态分析功功能：
  - 支持 exports.xxx、this.exports.xxx、module.exports.xxx 语法的导出分析。
  - 支持 object.defineProperty(exports, "xxxx", …) 语法的导出分析。
  - 支持 require('xxxx').xxx 语法的导入分析。

### Logs

第三个 Webpack 5 的效率优化点是它增加了许多内部处理过程的日志，可以通过 stats.logging 来访问。在使用相同配置stats: {logging: "verbose"}的情况下，Webpack 5 构建输出的日志：

![img-2](webpack-optimize-1.png)

Webpack 5 构建输出的日志要丰富完整得多，通过这些日志能够很好地反映构建各阶段的处理过程、耗费时间，以及缓存使用的情况。在大多数情况下，它已经能够代替之前人工编写的统计插件功能了。

