# Linux 常用命令

> Linux 命令语法：
>
> 命令格式：命令 【-选项】 【参数】

### 1. pwd

打印当前工作目录

- 英文：print working directory

```bash
$ pwd
/c/Users/luojian
```

### 2. ls

列出目录内容

- 英文：list

- 常用选项：

  - -l：（line）按行输出，详细信息展示
  - -a：（all）显示所有文件，包括隐藏文件

  另外，这些参数可以组合使用，例如 ls -la，按行显示当前目录下所有文件的详细信息

### 3. cd

切换目录

- 英文：change directory

```bash
cd		# 进入用户主目录（home）
cd ~	# 进入用户主目录
cd /	# 进入根目录
cd .	# 当前目录
cd ..	# 返回上级目录
cd ../..	# 返回上两级目录
cd dir	# 进入dir目录，dir为相对路径或者绝对路径
```

### 4. mkdir

创建目录/文件夹

- 英文：make directory

```bash
mkdir temp	# 在当前目录下创建文件夹temp
mkdir test/temp	# 在当前目录下的test文件夹中创建temp目录
```

### 5. rmdir

删除目录/文件夹

- 英文：remove directory

### 6. rm

删除文件

- 英文：remove
- 常用选项
  - -f：（force）忽略不存在的文件，强制删除，不会出现警告信息
  - -i：（interactive）互动模式，在删除前会询问用户是否确认删除
  - -r：（recursive, 递归的）将列出的全部目录及其子目录递归删除

### 7. mv

移动或者重命名文件

- 英文：move
- 常用选项
  - -f：如果目标文件已存在，不会询问而直接覆盖
  - -i：若目标文件已经存在，会询问是否覆盖
  - -u：（update）若目标文件已经存在，且比目标文件新，才会更新

```bash
mv file1 file2 file3 dir	# 将文件file1、file2、file3移动到目录dir中
mv file1 file2	# 将文件file1重命名为file2
mv * ../	# 移动当前文件夹下的所有文件到上一级目录
```

### 8. cp

将源文件或目录复制到目标文件或目录中

- 英文：copy
- 常用选项
  - -f：强制复制文件或目录，不论目标文件或目录是否已经存在
  - -i：覆盖既有文件前先询问用户
  - -r：递归处理，将指定目录下的所有文件和子目录递归处理

### 9. touch

更新文件的访问时间或者创建一个空文件

```bash
touch a.txt	# 当a.txt已经存在时，将a.txt的访问时间更新为当前时间；当a.txt不存在时，创建空文件a.txt
```

### 10. vim

创建或打开文件并使用vim编辑器编辑

```bash
vim a.txt	# a.txt不存在时，创建a.txt，同时使用vim编辑器打开a.txt
```

vim编辑器有三种模式：命令模式（command mode）、输入模式（insert mode）和底线命令模式（last line mode）：

刚刚启动vim，即 vim a.txt时，进入命令模式，此时输入i（或任意非esc键进入输入模式），输入模式下可对文件进行编辑，输入模式下按esc键，退出输入模式，切换到命令模式，此时按:（英文冒号）进入底线命令模式，此时：

- q：退出vim
- w：保存文件
- wq：保存并退出

### 11. ps

查看当前系统的进程状态

- 英文：process

### 12. kill

发送信号到进程

- 常用选项
  - -s sig：信号名称
  - -n sig：信号名称对应的数字
  - -l：列出信号名称

```bash
kill -s KILL PID	# 强制中止进程id为PID的进程
kill -n 9 PID	# 同上，强制中止进程id为PID的进程（KILL信号对应的数字为9）
```

### 13. df

查看磁盘空间占用情况

- 常用选项
  - -a：列出所有的文件系统
  - -k：以KB为单位显示各文件系统的状态
  - -m：以MB为单位显示各文件系统的状态
  - -h：以人们较易阅读的 GB、MB、KB 等格式自行显示

