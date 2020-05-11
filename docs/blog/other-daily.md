# 日常记录小知识点

## 【2020-02-16】vue 深度作用选择器

> [vue loader]([https://vue-loader.vuejs.org/zh/guide/scoped-css.html#%E6%B7%B1%E5%BA%A6%E4%BD%9C%E7%94%A8%E9%80%89%E6%8B%A9%E5%99%A8](https://vue-loader.vuejs.org/zh/guide/scoped-css.html#深度作用选择器))

如果你希望 `scoped` 样式中的一个选择器能够作用得“更深”，例如影响子组件，你可以使用 `>>>` 操作符：

```html
<style scoped>
.a >>> .b { /* ... */ }
</style>
```

上述代码将会编译成：

```css
.a[data-v-f3f3eg9] .b { /* ... */ }
```

有些像 Sass 之类的预处理器无法正确解析 `>>>`。这种情况下你可以使用 `/deep/` 或 `::v-deep` 操作符取而代之——两者都是 `>>>` 的别名，同样可以正常工作。

## 【2020-03-06】列表交互点

1. 列表刷新、列表搜索、更改pageSize时均需将页码置为1

## 【2020-03-08】ant-design-vue 踩坑

1. ant-design-vue 太坑，table 的 filter value必须为string

## 【2020-03-10】禁用lodash-webpack-plugin

1.  lodash-webpack-plugin 会影响ant-design-vue组件库的编译，使用中发现如果使用lodash-webpack-plugin插件会导致 Form组件校验崩溃（Form组件使用了lodash），具体原因未知
2. 使用lodash-webpack-plugin后 loadash 深拷贝性能降低千倍（80ms -> 18s）

## 【2020-04-10】vue-cli-service inspect

你可以使用 `vue-cli-service inspect` 来审查一个 Vue CLI 项目的 webpack config：https://cli.vuejs.org/zh/guide/cli-service.html#vue-cli-service-inspect