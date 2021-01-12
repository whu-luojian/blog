# npm 安装机制

`npm` 的核心目标：

> Bring the best of open source to you, your team and your company.
>
> 给你和你的团队、你的公司带来最好的开源库和依赖。

`npm` 最重要的一环就是安装和维护依赖。

![068739612.png](https://s0.lgstatic.com/i/image2/M01/02/A9/Cip5yF_axkqAclTFAAJmlxGYSmI551.png)

`npm install` 执行之后：

1. 检查并获取 `npm` 配置，优先级为：**项目级的 `.npmrc` 文件 > 用户级的 `.npmrc` 文件 > 全局级的 `.npmrc` 文件 > `npm` 内置的 `.npmrc` 文件**。
2. 检查项目中是否有 `package-lock.json` 文件。
3. 如果有，则检查 `package-lock.json` 和 `package.json` 声明的依赖是否一致：
   - 一致，则直接 `package-lock.json` 中的信息，从缓存或网络资源中加载依赖；
   - 不一致，按照 `npm` 版本进行处理，不同 `npm` 版本处理会有所不同，具体处理方式如上图所示。
4. 如果没有，则根据 `package.json` 递归构建依赖树。然后按照构建好的依赖树下载完整的依赖资源，在下载时就会检查是否存在相关资源缓存：
   - 存在，则将缓存内容解压到 `node_modules` 中；
   - 不存在，先从 `npm` 远程仓库下载包，校验包的完整性，并添加到缓存，同时解压到 `node_modules`。
5. 最后生成 `package-lock.json` 文件。

构建依赖树时，当前依赖项目不管是直接依赖还是子依赖的依赖，都应该按照**扁平化原则**，优先将依赖放置在 `node_modules` 根目录。在这个过程中，遇到相同模块就判断已放置在依赖树中的模块是否符合新模块的版本范围，如果符合则跳过；不符合则在当前模块的 `node_modules` 下放置该模块（最新版本 `npm` 规范）。