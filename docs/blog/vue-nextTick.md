# vue nextTick 引发的思考

## 背景

最近做项目碰见一个这样的问题，伪代码(vue版本为2.6.x)如下：

```vue
<template>
	<div class="layout">
        <TopBar />
        <div class="main" v-if="isRouterAlive">
            <slot />
    	</div>
    </div>
</template>

<script>
    export default {
        async created() {
            this.admin = await ajax('...')
            if (!admin) {
                this.$router.replace('/403')
            }
            this.$nextTick(() => {
                this.isRouterAlive = true
            })
        }
    }
</script>
```

没有权限的时候，理想中的情况是这样的：

1. 访问首页
2. 调用接口获取用户权限，权限为false
3. 路由跳转到403
4. `this.isRouterAlive = true`，显示403页面

实际情况是这样的：

1. 访问首页
2. 调用接口获取用户权限，权限为false
3. `this.isRouterAlive = true`，显示首页
4. 路由跳转到403，显示403页面

解决方案也很简单，直接`await this.$router.replace('/403')`即可，但好学的我打算一探究竟！

## 分析

很显然，解决问题的关键是 `this.$router.replace` 和 `this.$nextTick`，要分析这个问题必然要分析两者的执行逻辑。

此时我们知道 `this.$router.replace` 返回的是一个 `promise`，`this.$nextTick`中的`timeFunc`实现优先级是 `Promise`  --> `MutationObserver ` --> `setImmediate ` --> `setTimeout` ，因此在浏览器环境下 `this.$nextTick` 也是基于 `Promise`  实现的，我们改造一下代码：

```js
// 案例1
async created() {
    this.$router.replace('/403').then(() => {
        console.log(1)
    })
    this.$nextTick(() => {
        console.log(2)
        this.isRouterAlive = true
    })
}

// 2
// 1
```

控制台先打印 2，再打印 1，很奇怪，为什么同样是 `Promise` ，`nextTick` 会优先输出？

是不是因为`this.$router.replace` 是个多层嵌套的 `Promise`，导致后面跟随的输出1的 `then` 前面还有 隐藏的`then` ，即可以把上面的代码想象成：

```js
function myReplace () {
  return new Promise((resolve) => {
    Promise.resolve().then(() => {
      resolve()
    })
  })
}

async created() {
    myReplace('/403').then(() => {
        console.log(1)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
}

// 2
// 1
```

真的是类似这样吗？我们再改造一下代码：

```js
// 案例2
async created() {
    this.$router.replace('/403').then(() => {
        console.log(1)
    })
    setTimeout(() => {
        console.log(3)
    })
    this.$nextTick(() => {
        console.log(2)
        this.isRouterAlive = true
    })
}

// 2
// 3
// 1
```

咦，为什么 3 比 1 先输出？`this.$router.replace`  不是返回 `Promise` 吗？`Promise` 不是微任务吗？`setTimeout` 不是宏任务吗？

`this.$router.replace`  是返回一个 `Promise` 没错，但是当只有 `Promise` 被 `resolve` 时，才会把输出 1 的 `then` 加入微任务队列，随后执行，而 3 比 1 先输出说明 `this.$router.replace`  内部是先执行一个类似 `setTimeout` 的宏任务，之后 `resolve` ，即：

```js
function myReplace () {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 10) // 延迟一定时间
  })
}

async created() {
    myReplace('/403').then(() => {
        console.log(1)
    })
    setTimeout(() => {
        console.log(3)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
}

// 2
// 3
// 1
```

**那么问题来了， `this.$router.replace`  内部执行的宏任务到底是什么？**

没办法，只能打断点看源码调试了，具体函数调用栈这里就不赘述了。路由403在项目 `router.ts` 中的定义为：

```js
{
    path: '/403',
    name: '403',
    component: () => import('./views/403.vue')
}
```

`this.$router.replace`  函数接受一个 `path` 参数，在示例中即是 '/403' ，`this.$router.replace`  内会根据 `path` 参数找到匹配的 `RouteRecord` （路由记录，记录路由的路径、参数、组件等等），之后调用` resolveAsyncComponents` 方法对匹配的路由记录进行加载处理，因为 403 组件采用异步加载的方式，所以需要先`import('./views/403.vue')` ，之后再进行路由跳转、视图更新。

动态 `import` 是也是基于 `Promise`  的，即：

```js
function myReplace () {
  return new Promise((resolve) => {
    import('./views/403.vue').then(() => {
        resolve()
    })
  })
}

async created() {
    myReplace('/403').then(() => {
        console.log(1)
    })
    setTimeout(() => {
        console.log(3)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
}

// 2
// 3
// 1
```

因此， `this.$router.replace`  内部执行的宏任务是在 `import` 里。

**那么问题又来了，`import` 内部执行的宏任务到底是什么？**

动态 `import` 接受模块的 url 作为参数，因此不难猜测， `import` 内部需要对模块进行请求加载，所以`import` 内部执行的宏任务就是加载模块的 http 请求，即：

```js
function myReplace () {
  return new Promise((resolve) => {
    return new Promise((resolve => {
        ajax('./views/403.vue').then(() => {
        	resolve()
    	})
    }))
  })
}

async created() {
    myReplace('/403').then(() => {
        console.log(1)
    })
    setTimeout(() => {
        console.log(3)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
}

// 2
// 3
// 1
```

分析到这，我们再回过头来看看背景中出现的问题就不难解释了：

```js
async created() {
    this.admin = await ajax('...')
    if (!admin) {
    	this.$router.replace('/403')
    }
    this.$nextTick(() => {
    	this.isRouterAlive = true
    })
}
```

1. 访问首页
2. 调用接口获取用户权限，权限为false
3. 执行 `this.$router.replace('/403')`，触发一个异步加载403模块的宏任务
4. 执行 `this.$nextTick`，添加一个微任务到微任务队列
5. 执行微任务队列，`this.isRouterAlive = true`，显示首页
6. 宏任务异步加载403模块加载完毕，路由跳转到403，显示403页面

**到这就结束了吗？远远没有！**

我们再改造下代码：

```js
// 案例3
async created() {
    this.$router.replace('/403').then(() => {
        console.log(1)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
    this.$nextTick(() => {
        console.log(3)
    })
}
```

当 403 模块是异步加载时，根据前面的分析，不难得出执行代码会依次输出 2、3、1。

**但是当 403 模块不是异步加载呢？**即路由403在项目 `router.ts` 中的定义为：

```js
{
    path: '/403',
    name: '403',
    component: Page403 // Page403为 import Page403 from './views/403.vue'
}
```

此时  `this.$router.replace`  内部并不需要执行 `import`，根据前面的分析，代码等价于：

```js
function myReplace () {
  return new Promise((resolve) => {
    resolve()
  })
}

async created() {
    myReplace('/403').then(() => {
        console.log(1)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
    Promise.resolve().then(() => {
        console.log(3)
    })
}
```

因此当 403 模块是同步加载时，按照前面的分析，执行代码应该依次输出 1、2、3。

但是实际情况下执行代码，输出顺序为 3、1、2。

咦，为什么会先输出 3 ？为什么先执行了 `this.$nextTick` 里的回调？

我们分析下 `nextTick` 的源码，我简化了一下：

```js
const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let timerFunc = Promise.resolve().then(flushCallbacks)

export function nextTick (cb?: Function) {
  callbacks.push(cb)
  if (!pending) {
    pending = true
    timerFunc()
  }
}
```

`nextTick` 中维护了一个全局的 `callbacks` 数组，第一次调用 `nextTick` ：

1. 将回调函数放入`callbacks` 中
2. `pending` 为 `false`，执行 `timeFunc` ，添加微任务 `flushCallbacks` 到微任务队列中

此后同一 `tick` 中再次调用`nextTick`，只会将回调函数放入`callbacks` 中，并不会触发新的微任务。因此同一 `tick` 中多次调用`nextTick` 的回调函数最终会由第一次调用 `nextTick`时添加的微任务 `flushCallbacks` 统一执行。

分析下如下代码：

```js
// 案例4
async created() {
    this.$nextTick(() => {
        console.log(1)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
    this.$nextTick(() => {
        console.log(3)
    })
}

// 1
// 3
// 2
```

1. 第一次调用 `nextTick` ，添加微任务 `flushCallbacks` 到微任务队列中，此时 `callbacks` 有一个输出1的回调函数
2. 执行 `Promise.resolve()`，添加一个输出2的微任务到微任务队列
3. 第二次调用 `nextTick` ，将输出3的回调函数添加到 `callbacks` 数组中
4. 执行微任务队列，执行第一个微任务 `flushCallbacks` ，即依次执行 `callbacks` 数组中的回调函数，依次输出 1，3
5. 执行第二个微任务，输出 2

此时回过头再看案例3，当 403 模块是同步加载时，先输出了3，根据案例4，我们可以猜测到 `this.$router.replace('/403')` 内部调用过一次 `nextTick` ，将微任务 `flushCallbacks` 添加到了微任务队列的前面，因此会先输出3，即当 403 模块是同步加载时，案例3代码等价于：

```js
function syncReplace () {
  return new Promise((resolve) => {
  	this.$nextTick(() => {})
    resolve()
  })
}

async created() {
    syncReplace('/403').then(() => {
        console.log(1)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
    this.$nextTick(() => {
        console.log(3)
    })
}
```

**那么问题来了，`this.$router.replace('/403')` 内部为什么会调用 `nextTick`  ？**

我们打个断点，看下函数调用栈即可一清二楚：

![call stack](vue-nextTick-1.png)

如上图，当403模块是同步加载时，执行`this.$router.replace('/403')`时路由会同步更新，`update `过程会调用 `queueWatcher` 方法， `queueWatcher` 方法内部调用了 `nextTick` （当403模块是同步加载时，执行`this.$router.replace('/403')`时实际上会触发多次 `update` （`watcher`），`nextTick` 会被多次执行，这里暂不深究）。

至此，我们再分析一下案例3的执行过程（当 403 模块是同步加载时）：

```js
// 案例3
async created() {
    this.$router.replace('/403').then(() => {
        console.log(1)
    })
    Promise.resolve().then(() => {
        console.log(2)
    })
    this.$nextTick(() => {
        console.log(3)
    })
}
```

1. 执行 `this.$router.replace('/403')`，路由更新，触发路由相关`watcher` ，第一次调用`nextTick`，添加微任务 `flushCallbacks` 到微任务队列中
2. 将输出1的微任务加入微任务队列
3. 执行 `Promise.resolve()`，添加一个输出2的微任务到微任务队列
4. 执行 `nextTick` ，将输出3的回调函数添加到微任务 `flushCallbacks`的 `callbacks` 数组中
5. 执行微任务队列，执行第一个微任务 `flushCallbacks` ，即依次执行 `callbacks` 数组中的回调函数，输出 3
6. 执行第二个微任务，输出 1
7. 执行第二个微任务，输出 2

## 思考

思考以下代码的输出顺序？

思考题1：

```vue
<template>
	<div class="app">
        {{msg}}
    </div>
</template>

<script>
    export default {
        data() {
            return {
              msg: 'aaa'
            }
        },
        created() {
            this.msg = 'bbb'
            Promise.resolve().then(() => {
        		console.log(1)
    		})
            this.$nextTick(() => {
                console.log(2)
            })
        }
    }
</script>
```

思考题2：

```vue
<template>
	<div class="app">
        {{msg}}
    </div>
</template>

<script>
    export default {
        data() {
            return {
              msg: 'aaa'
            }
        },
        mounted() {
            this.msg = 'bbb'
            Promise.resolve().then(() => {
        		console.log(1)
    		})
            this.$nextTick(() => {
                console.log(2)
            })
        }
    }
</script>
```

