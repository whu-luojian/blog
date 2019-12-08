# Git 多账户配置

## 应用场景

我们经常将代码托管到Github、Gitlab这样的网站上，为了避免每次push代码时都要输入用户名和密码，通常会选择使用ssh协议，将公钥保存到托管网站上。日常开发过程中，我们可能遇到需要在同一电脑上配置多个Git账户的情况；Github、公司的Git服务器等，这时候我们需要配置多个ssh。

## 配置步骤

### 1. 取消全局的账户配置

查看全局账户

```bash
git config --global user.name
git config --global user.email
```

如果存在，取消全局设置

```bash
git config --global --unset user.name
git config --global --unset user.email
```

### 2. 创建不同账户的ssh key

进入保存秘钥的目录，根据邮箱生成秘钥

```bash
cd ~/.ssh
ssh-keygen -t rsa -C "github@email.com"
```

输入完成后，会有如下提示：

```bash
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/luojian/.ssh/id_rsa):
```

这里要求对秘钥进行命名，默认的文件名是`id_rsa`。为了方便区分，命名为`id_rsa_github`。秘钥生成后通过`ls`命令，可以看到刚刚生成的密钥对`id_rsa_github`和`id_rsa_github.pub`。其中`id_rsa_github.pub`是公钥。

同样，对于GitLab上的账户，使用公司邮箱注册的，按照相同的步骤生成`id_rsa_gitlab`和`id_rsa_gitlab.pub`。

### 3. 秘钥添加到ssh agent

SSH协议的原理，就是在托管网站上使用公钥，在本地使用私钥，这样本地仓库就可以和远程仓库进行通信。首先将私钥文件添加到ssh agent：

```bash
ssh-agent bash
ssh-add ~/.ssh/id_rsa_github	# 添加GitHub私钥
ssh-add ~/.ssh/id_rsa_gitlab	# 添加GitLab私钥
```

### 4. 本地私钥文件配置管理

由于添加了多个密钥文件，所以需要对这多个密钥进行管理。在`.ssh`目录下新建一个config文件，文件内容如下：

```txt
# github配置
Host github.com	# 网站域名
HostName github.com	# 网站域名
User luojian	# 用户
IdentityFile ~/.ssh/id_rsa_github	# 使用的秘钥文件

# gitlab配置
Host x.xx.xxx.com	# 公司代码仓库的gitlab域名
HostName x.xx.xxx.com	# 公司代码仓库的gitlab域名
User luojian1
IdentityFile ~/.ssh/id_rsa_gitlab
Port 22222	# 公司代码仓库的gitlab端口
```

### 5. 公钥添加到托管网站

将 .ssh 目录下的`id_rsa_github.pub`、`id_rsa_gitlab.pub`内的内容复制分别添加到Github和Gitlab的SSH keys中，添加成功后可使用以下命令测试：

```bash
ssh -T git@github.com
ssh -T git@x.xx.xxx.com	# 公司托管代码仓库域名
```

## 使用

从远端拉取新仓库到本地操作与平常无异；如果是本地新建或已有仓库与远端关联，或者在多账户配置前从远程clone下来的仓库，需要单独配置该仓库的用户名和邮箱，进入本地仓库文件夹配置：

```bash
git config user.name "luojian"
git config user.eamil "xxxxxxxxxx@qq.com"
```

