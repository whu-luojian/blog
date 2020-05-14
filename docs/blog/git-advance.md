# Git 进阶

> 一个学习 Git 的互动型网站：<https://learngitbranching.js.org/?demo=&locale=zh_CN>

## git commit

1. `git commit -a`： `-a, --all` 会 commit all changed files，但是不会添加新添加的文件（untracked files）
2. `git commit --amend`：amend previous commit，即将本次提交追加到上次提交上，用于更改上次提交的内容或者 message

## git stash

默认情况下， `git stash` 命令会把以下修改存储到一个新的堆栈中。堆栈中的内容（stash）可以被所有分支访问.

- 暂存区中的修改
- 工作区中已经存在的文件的修改

也就是说，默认情况下，git stash 命令不会存储下列文件:

- 工作区中新增的文件（untracked files）
- 被版本库忽略的文件（.gitignore 中定义的）

如果你还想要存储 untracked files，可以使用 -u 选项：

```bash
git stash -u
```

如果你还想要存储 untracked files 和被版本库忽略的文件，可以使用 -a 选项：

```bash
# 但是，一般不推荐这么做，因为既然是被版本库忽略的文件，就没有必要再存储起来。除非你有非常特别的需求。
git stash -a
```

如果你想要在 git stash 时，添加一个 message 注解，可以使用 save 选项。

```bash
git stash save "备注信息"
```

执行 ``git stash`` 命令后，工作区就恢复到了上一次 git commit 时的状态。具体表现为：

- 暂存区中的修改看不见了。
- 工作区中已经存在的文件的修改也看不见了。
- 如果使用了 -u 选项，工作区中新添加的文件对于工作区也看不见了。

这样工作区就干净多了。使用 git diff 和 git diff --cached 也看不到工作区和暂存区中的修改了。因为它们都被存储到了一个堆栈中。

然后，我们就可以新建分支，切换到新的分支来处理其他的需求。

#### 常用命令

存储到堆栈

```bash
git stash save -u "备注信息"
```

查看堆栈中 stash 列表

```bash
git stash list
```

查看 stash 内容

```bash
git stash show
git stash show stash@{id}
```

将堆栈中的 stash 应用到工作区

```bash
# 将堆栈中的最近一次 stash，应用到工作区（删除堆栈的内容）
git stash pop

# 将堆栈中的最近一次 stash，应用到工作区（保留堆栈的内容）
git stash apply
# 将堆栈中的最近一次 stash，应用到工作区（保留堆栈的内容）
git stash apply stash@{0}

# 将堆栈中的指定 stash 应用到工作区（保留堆栈的内容）
git stash apply stash@{id} 
```

删除堆栈中的stash

```bash
# 删除指定的 stash
git stash drop stash@{id} 
 
# 删除最近一次的 stash
git stash drop
 
# 删除所有的 stash
git stash clear
```

## git rebase

`git rebase` 一般解释为**变基**，rebase 实际上就是取出一系列的提交记录，“复制”它们，然后在另外一个地方逐个的放下去。rebase 的优势就是可以创造更线性的提交历史。

- **步骤分析**：在 dev 分支（dev 分支是在 master 分支拉出的）执行 `git rebase master` ：首先找到 dev 分支和 master 分支的最近的共同祖先，然后将 dev 分支上共同祖先之后的提交“复制”出来，放置在 master 提交之后，最后将 dev 分支指向 master 分支的最后一个提交。这样由原来的两个分岔的分支，变成重叠的分支，看起来 dev 是从最新的 master 上拉出的分支。
- **使用场景**：从 dev 拉出分支 feature-a。那么当 dev 要合并 feature-a 的内容时，使用 `git merge feature-a`；反过来当 feature-a 要更新 dev 的内容时，使用 `git rebase dev`。使用时主要看两个分支的**"主副"关系**。

- `git rebase --continue`：解决冲突后完成本次 rebase
- `git rebase --abort`：放弃本次 rebase 操作

## git reset

#### 三种参数

1. `--hard`：暂存区、工作区和 HEAD 指向的目录树内容相同（相当于还原，**删除了工作区文件**，不想要代码了）。

2. `--soft`：只更改 HEAD 的指向，暂存区和工作区不变。

3. `--mixed`（默认为`--mixed`）：更改HEAD 的指向及重置暂存区，但是不改变工作区。

#### 常用命令

- `git reset HEAD {filename}`:  取消暂存文件，恢复到已修改未暂存状态。
- `git reset HEAD^`:  表示回退到上一个提交。
- `git reset HEAD~{n}`:  表示回退到`n`个提交之前。它也可以用来合并提交。

- `git reset {version}`:  后面带版本号，直接回退到指定版本。

#### 撤销 git reset

`git reflog` 查看一下历史HEAD的移动，然后`git reset --hard HEAD@{n}`即可！

## git revert

`git revert` 是用一次新的 commit 来回滚之前的 commit，不会丢失之前的代码。`git revert HEAD` 表示回滚到上次提交，即新增一个 commit ，与上个 commit 抵消。

`tips`：

- `git revert` 后多出一条commit ，有回撤操作
- `git reset` 直接把之前 commit 删掉，非 `git reset --hard`  的操作是不会删掉修改代码，如果远程已经有之前代码，需要强推 `git push -f`
- `git revert --abort`：放弃本次 revert 操作
- revert 遇到多个祖先时需要指定parent：[当你决定去 revert 一个merge commit](https://juejin.im/post/5acf4db8f265da239148822d)

## git merge

`git merge --no-ff`：--no-ff 指的是强行关闭fast-forward方式。--no-ff (no fast foward)，使得每一次的合并都创建一个新的commit记录，即要求git merge即使在fast forward条件下也要产生一个新的merge commit，用来避免丢失信息。这对于以后代码进行分析特别有用。

#### 撤销 git merging

1. 方法一：`git reset --hard HEAD~` 回到合并之前的提交或者先通过 `git reflog` 确定 merge 之前所在的 commit，然后使用 `git reset --hard <commit>` 重置头指针。

2. 方法二：`git merge --abort`

## git 修改上次提交

#### 方法一：用 commit -amend

```bash
git add . # 如果只是修改commit message不用输入
git commit -m "commit message" --amend
git push <remote> <branch> -f # 若还没有推送到远端，不用输入 -f
```

#### 方法二：用 git reset

```bash
git reset HEAD^
git add . # 如果只是修改commit message不用输入
git commit -m "commit message"
git push <remote> <branch> -f # 若还没有推送到远端，不用输入 -f
```

`tips`：

- 如果提交已经推送到远端且远程分支上没有新的提交，`git push` 时可以加上 -f 强制覆盖远程仓库，否则先`git pull` 下来再 push

## 开发新功能步骤

1. 从开发分支拉一个功能分支
2. 功能分支开发和测试
3. 功能分支 rebase 开发分支
4. 功能分支合并到开发分支

`tips`：

- 一次提交做一件事，写清楚 comment
- 每次 pull 远程分支时使用 `git pull --rebase`
- 分支从哪拉出来，最后合到哪回去
- 合并之前先 rebase

## fix bug 步骤

#### 测试线bug的修复

和开发步骤类似

#### 线上bug的修复

1. 从master拉一个fix分支（为什么是master）
2. 测试完后 rebase master
3. 合并回master

## Git 工作流

见 <https://juejin.im/post/5ce39cb251882533147bb945#heading-17>

## 其它

#### 分支

- `git push origin -d [branch-name]`：删除远程分支
- `git push origin :branch-name`：删除远程分支

#### tag

推送 tag 到远程仓库：

- `git push origin tag-name`
- `git push origin refs/tag/tag-name`

删除远程仓库 tag

- `git push origin -d tag-name`

- `git push origin :refs/tags/tag-name`：删除远程tag

#### log

- `git log --pretty=oneline`：简洁模式查看 log
- `git reflog`：查看操作记录

## 相关文档

- [一篇文章，教你学会Git](https://juejin.im/post/599e14875188251240632702)
- [git reset 和 git revert](https://juejin.im/post/5b0e5adc6fb9a009d82e4f20)
- [git pull --rebase的正确使用](https://juejin.im/post/5d3685146fb9a07ed064f11b)
- [如何优雅地使用 Git](https://juejin.im/post/5a54386af265da3e3b7a6317#heading-19)
- [git 如何回滚一次错误的合并](https://juejin.im/post/5b5ab8136fb9a04f834659ba)