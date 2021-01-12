# vue web端埋点方案优化

浏览器的页面型产品/服务的日志采集可以分为两大类：

1. 页面浏览日志。页面浏览日志是指当一个页面被浏览器加载呈现时采集的日志，也是目前所有互联网产品的两大基本指标：页面浏览量（Page View，PV）和访客数（Unique Visitors，UV）的统计基础。
2. 页面交互日志。当页面加载和渲染完成之后，用户在页面上执行各类操作时采集的日志，比如点击某个查询按钮。

## 现状

现有项目针对 `PV` 和交互日志的埋点代码如下：

```vue
// index.vue
<template>
  <a-button @click="onClick">查询</a-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Page extends Vue {
  // PV 埋点
  mounted() {
    window.DATracker.track('page_id', {})
  }

  // 交互埋点
  onClick() {
    window.DATracker.track('event_id', {})
  }
}
</script>
```

存在的问题：

- `PV` 埋点需要配合 `mounted` 生命周期使用，同一段代码在开发过程中存在拷贝来拷贝去的问题；
- 业务代码强依赖埋点 `SDK`  `window.DATracker` 。一般来说，引入外部依赖或组件需要考虑两点：
  - 如果当前依赖库不能使用了，能否实现业务上的无痛切换；
  - 如果需要批量修改依赖的属性，如何解决？例如：修改基础组件的字段，或者统一上报某些信息。

## 优化方案

### 页面交互埋点

针对页面交互埋点，可以统一封装一个 `trackEvent` 方法：

```js
// utils/track.ts

/**
 * 日志上报
 * @param id 事件id
 * @param data 上报数据
 */
export const trackEvent = (id, data = {}) => {
  window.DATracker.track(id, data)
}
```

在需要使用的地方引入 `trackEvent` 调用即可,如此可将业务代码和埋点外部依赖隔离开。

### PV 埋点

针对 `PV` 埋点，我们在 `mounted` 生命周期调用 `trackEvent` 上报日志也可实现将业务代码和埋点外部依赖隔离开，但是需要额外引入 `mounted` 生命周期相关代码，并不是最优解。

**1. 高阶组件 or mixin**

我们可以参考一下 `React` 的做法，`React` 一般使用高阶组件抽取公共逻辑，一个非常经典的场景就是页面埋点统计，大概是这样：

```jsx
const trackPageView = (pageName) => {
  // 发送埋点信息
}

const PV = (pageName) => {
  return (WrappedComponent) => {
    return class Wrap extends Component {
      componentDidMount() {
        trackPageView(pageName)
      }
      render() {
        return <WrappedComponent {...this.props} />
      }
    }
  }
}

// 通过装饰器使用
@PV('用户页面')
class UserPage extends React.Component {
  ...
}
```

在 `Vue` 中复用代码的主要方式是 `mixin` ，并且也很少提到高阶组件的概念，因为在 `Vue` 中实现高阶组件并不像 `React` 中那样简单。

在 `React` 中，一个函数就是一个组件，那么高阶组件就是高阶函数，在 `React` 中写高阶组件就是写高阶函数，比较简单。那么在 `Vue` 中，组件是什么？

在不使用 `vue-class-component` 的情况下，我们在单文件中组件的定义其实就是一个普通的选项对象。例如：

```js
export default {
  name: 'BaseComponent',
  props: {...},
  mixins: [...],
  methods: {...}
}
```

当我们从单文件中导入一个组件的时候：

```js
import BaseComponent from './base-component.vue'
console.log(BaseComponent)
```

虽然单文件组件会被 `vue-loader` 处理，但处理后的结果，即 `BaseComponent` 仍然还是一个普通的 `JSON` 对象，只有把这个对象注册为组件（`components` 选项）之后，`	Vue` 才会以该对象为参数创建一个构造函数，该构造函数就是生产组件实例的构造函数。所以在 `Vue` 中组件确实是函数，只不过是最终结果罢了，在这之前 `Vue` 中组件就是一个普通对象，因此 `Vue` 中的高阶组件可以这样定义：**接收一个纯对象，并返回一个新的纯对象**，如下代码：

```js
const hoc = (WrappedComponent) => {
  return {
    mounted() {
      console.log('hoc mounted')
    },
    props: WrappedComponent.props
    render(h) {
      return h(WrappedComponent, {
        on: this.$listeners,
        attrs: this.$attrs,
        props: this.$props
      })
    }
  }
}
```

但是以上 `hoc` 并不可用，`Vue` 高阶组件除了需要透传 `props` 、`attrs` 、`event` 之外，还需要处理 `slot` 、`scopedSlot` 等等，具体可参考文章[探索 `Vue` 高阶组件](https://juejin.cn/post/6844903545607553032)

如上，**在不使用 `vue-class-component` 的情况下，`Vue` 高阶组件的实现和使用是比较困难、收益较低的**。

然目前为了使用 `typescript`， `Vue` 项目开发多数会借助 `vue-class-component` ，实现基于类的 `Vue` 组件开发，如下：

```vue
<template>
  <div>用户页</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class UserPage extends Vue {}
</script>

```

这时候的 `Vue` 组件又是什么呢？

```js
import UserPage from './UserPage.vue'
console.log(UserPage)
```

`UserPage` 如下：

![image-20210111153334299](image-20210111153334299.png)

`UserPage` 打印出来是一个 `VueComponent` 的构造函数，构造函数上挂载了构造组件实例所需的选项，我们可以基于特定需求动态改造这些选项（**本质还是 `mixin`**）。

针对 `PV` 埋点，我们需要做的就是在组件的 `mounted` 生命周期中加入对应的日志上报代码即可，如下：

```js
// utils/track.ts

/**
 * PV 埋点装饰器
 * @param id 页面id
 * @param data 上报数据
 * @returns 日志上报代码注入函数
 */
export const PV = (id, data = {}) => {
  return (target) => {
    ;(target.options.mounted || (target.options.mounted = [])).push(() => {
      window.DATracker.track(id, data)
    })
  }
}
```

使用方法和 `React` 高阶组件一致，使用类装饰器：

```vue
// index.vue
<template>
  <a-button @click="onClick">查询</a-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { PV, trackEvent } from '@/utils/track.ts'

@PV('page_id') // PV 埋点，需置于 @Component 外层
@Component({})
export default class Page extends Vue {
  // 交互埋点
  onClick() {
    trackEvent('event_id', {})
  }
}
</script>
```

缺点：

- **针对 `keep-alive` 的页面，需要增加 `activated` 生命周期的处理。**
- **`PV` 埋点代码耦合到各个组件中，难以定位。**
- **从现有代码中不能宏观把握项目的页面埋点情况，容易少埋漏埋，不便维护。**

**2. 使用路由守卫**

`PV` 埋点本质上针对路由的埋点，访问某个页面，即等价于进入某个路由，因此可以借助全局路由守卫来进行 `PV` 埋点。

首先需要维护一份全局的 `PV` 埋点信息：

```js
export const PVInfoMap = {
  '/a/b': ...
}
```

然后在全局路由守卫中进行信息上报：

```js
// router.beforeResolve和router.beforeEach 类似，区别是在导航被确认之前，
// 同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被调用
router.beforeResolve((to, from, next) => {
  if (PVInfoMap[to.path]) {
    // 信息上报
  }
  next()
})
```



但有两个问题需要解决：

1. 大多数情况下，一个 `path` 对应一个页面，我们只需判断 `PVInfoMap[to.path]` 是否存在即可，存在则需要进行埋点。然对于 `Tabs` 而言，一个 `Tab` 对应一个页面，多个 `Tab` 页的 `path` 是可能相等的，不同的是 `query` 参数，例如：`/a?tab=1` 和 `/a?tab=2` ，因此页面的判断需要考虑 `query` 参数。

2. 路由参数变化是会触发全局守卫的。比如进入页面 `/user` 时触发了一次 `beforeResolve` 守卫，信息上报了一次，然后在页面 `/user` 中执行以下代码更新路由 `query` 参数，此时又会触发一次 `beforeResolve` 守卫，造成 `PV` 信息多次上报。

   ```js
   this.$router
       .replace({
         query: {
           ...this.$route.query,
           appId: String(this.appId)
         }
   	})
       .catch(() => {})
   ```



为解决以上问题，首先`PVInfoMap` 需支持 `query` 参数信息，设计结构如下：

```typescript
interface PVInfoRouteMap {
  [props: string]: { // 路由路径
    id: string // 页面id
    data?: Record<string, any> // 上报的额外信息
    query?: Record<string, string> // 需匹配的路由参数
  }
}

// 例如：
export const PVInfoMap: PVInfoRouteMap = {
  '/user/detail': {
    id: 'user_detail_page.pv'
  },
  '/task': {
    query: {
      tab: '1'
    },
    id: 'task_todo_page.pv'
  }
}
```

然后在全局路由守卫中进行 `from.path`、`to.path` 的比对，如果相同则不上报，避免重复上报的问题：

```typescript
/**
 * PV 埋点
 * @param id 页面id
 * @param data 上报数据
 */
const trackPage = (id, data = {}) => {
  window.DATracker.track(id, data)
}

router.beforeResolve((to, from, next) => {
  const { id, query, data } = PVInfoMap[to.path] || {}
  // 是否需要埋点
  if (id) {
    // 是否有路由参数
    if (query && Object.keys(query).length) {
      const isMatch = (route) => {
        if (!route) {
          return false
        }
        return Object.keys(query).every((key) => {
          return query[key] === route.query[key]
        })
      }
      // 避免重复上报
      if (isMatch(to) && !isMatch(from)) {
        trackPage(id, data || {})
      }
    } else {
      // 避免重复上报
      if (from?.path !== to.path) {
        trackPage(id, data || {})
      }
    }
  }
  next()
})
```





