# Yarn 安装机制

`Yarn` 是一个由 `Facebook` 、`Google` 、`Exponent` 和 `Tilde` 构建的新的 `JavaScript` 包管理器。它的出现是为了解决历史上 `npm` 的某些不足（比如 `npm` 对于依赖的完整性和一致性保障，以及 `npm` 安装速度过慢的问题等）。

## 安装理念

- **确定性**：通过 `yarn.lock` 等机制，保证相同的依赖关系在任何机器和环境下，都可以以相同的方式被安装。
- **扁平化安装**：将依赖包的不同版本，按照一定策略，归结为单个版本，以避免创建多个副本造成冗余（`npm` 目前也有相同的优化）。
- **网络性能更好**：`Yarn` 采用了请求排队的理念，类似并发连接池，能够更好地利用网络资源；同时引入了更好的安装失败时的重试机制。
- **缓存机制**：采用缓存机制，实现了离线模式（`npm` 目前也有类似实现）。

## `yarn.lock`

1. `yarn.lock` 结构整体和 `package-lock.json` 结构类似。`yarn.lock` 并没有使用 `json` 格式，而是采用了一种可读性较高的自定义标记格式。
2. **`yarn.lock` 中子依赖的版本号不是固定版本 。**这说明 `yarn.lock` 和 `package.json` 配合才能确定 `node_modules` 目录结构。

## 安装机制

![img](https://s0.lgstatic.com/i/image/M00/8A/17/CgqCHl_ZflCANVu8AAJJZZYzwhs026.png)

1. 检测包（`checking`）：

   - 检测项目中是否存在 `npm` 相关文件，比如 `package-lock.json` 等。如果有，则提示用户注意：这些文件的存在可能导致冲突。
   - 这一步骤中，也会检查系统 `OS` 、`CPU` 等信息。

2. 解析包（`resolving packages`）：

   - 获取首层依赖：`dependencies` 、`devDependcies` 、`optionalDependencies`；
   - 遍历首层依赖以及递归查找每个依赖下嵌套依赖的版本信息，将解析过和正在解析的包用一个 `Set` 数据结构存储，保证统一版本范围内的包不会被重复解析：对于没有解析过的包，先尝试从 `yarn.lock` 中获取版本信息，如若找不到则向 `Registry` 发起请求获取满足版本范围内的已知最高的包信息；
   - 最终确定所有依赖的具体版本信息以及下载地址。

   ![Drawing 2.png](https://s0.lgstatic.com/i/image/M00/84/9F/CgqCHl_TbimACnDOAAFMC14gP8I289.png)

3. 获取包（`fetching packages`）:

   - 检查缓存中是否当前依赖包，未命中缓存则下载包到缓存目录。

   ![Drawing 3.png](https://s0.lgstatic.com/i/image/M00/84/94/Ciqc1F_TbjKAThkOAAEsp0sOHUc622.png)

4. 链接包（`linking packages`）：

   - 解析 `peerDependencies` ，如果找不到符合 `peerDependencies` 的包，则进行 `warning` 提示；
   - 遵循**扁平化原则**，将项目中的依赖复制到项目 `node_modules` 下。

5. 构建包 (`building packages`)：

   - 如果依赖包中存在二进制文件需要进行编译，则执行编译构建。

## 扁平化安装

早期 `npm`（`npm v2`）的设计非常简单，在安装依赖时将依赖放到项目的 `node_modules`文件中；同时如果某个直接依赖 A 还依赖其他模块 B，作为间接依赖，模块 B 将会被下载到 A 的 `node_modules` 文件夹中，依此递归执行，最终形成了一颗巨大的依赖模块树，表现为：

- 项目依赖树层级非常深，不利于调试和排查问题；
- 依赖树的不同分支里，可能存在同样版本的相同依赖；

带来的问题是：

1. 依赖重复安装，浪费较大空间资源，也使得安装速度过慢；
2. 目录层级太深，导致文件路径太长，导致 `windows` 系统下删除 `node_modules` 文件夹失败。

`npm v3` 之后，`node_modules` 的结构改成了扁平结构：

- 不管是直接依赖还是子依赖的依赖，优先放置在 `node_modules` 根目录；
- 遇到相同依赖，判断已放置在依赖树中的依赖是否符合新依赖的版本范围，如果符合则跳过；不符合则在当前依赖的 `node_modules` 下放置该依赖。



