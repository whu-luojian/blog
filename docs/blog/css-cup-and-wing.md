# 圣杯布局和双飞翼布局

圣杯布局和双飞翼布局解决的问题是一样的：实现两边定宽，中间自适应的三栏布局，同时中间栏要放在文档流前面以优先渲染。

## 圣杯布局

圣杯布局的源于A LIST APART上的一篇文章[In Search of the Holy Grail](https://alistapart.com/article/holygrail/)，圣杯布局的构造过程如下：

DOM结构（四个div，一个容器div，三个布局div）：

```html
<div class="container">
    <div class="middle">middle</div>
    <div class="left">left</div>
    <div class="right">right</div>
</div>
```

1. 三者都设置向左浮动；
2. 设置middle的宽度为100%，left和right 的宽度为定宽；
3. 设置负边距，left设置左边距为负100%，right设置左边距为负的自身宽度；
4. 设置容器container的左右padding为左右子面板的宽度，给左右两个子面板留出空间；
5. 设置两个子面板为相对定位，left面板的left值为负的自身宽度，right面板的right为负的自身宽度。

对应的CSS：

```css
.container {
  height: 300px;
  padding: 0 100px;
}
.middle {
  height: 100%;
  width: 100%;
  float: left;
  background-color: #fff;
}
.left {
  height: 100%;
  width: 100px;
  float: left;
  margin-left: -100%;
  position: relative;
  left: -100px;
  background-color: rgba(255, 0, 0, 0.5)
}
.right {
  height: 100%;
  width: 100px;
  float: left;
  margin-left: -100px;
  position: relative;
  right: -100px;
  background-color: rgba(0, 255, 0, 0.5)
}
```

完整的demo见 <https://jsbin.com/hatepam/edit?html,css,output>。

## 双飞翼布局

双飞翼布局源于淘宝UED，双飞翼布局和圣杯布局的解决方案前几步是相同的，其构造过程如下：

DOM结构（四个div，三个布局div，一个内容div）：

```html
<div class="middle">
    <div class="main">middle</div>
</div>
<div class="left">left</div>
<div class="right">right</div>
```

1. 三者都设置向左浮动；
2. 设置middle的宽度为100%，left和right 的宽度为定宽；
3. 设置负边距，left设置左边距为负100%，right设置左边距为负的自身宽度；
4. 设置内容div main的左右margin为左右面板的宽度，给左右面板留出空间。

对应的CSS：

```css
.middle {
  height: 100%;
  width: 100%;
  float: left;
  background-color: #fff;
}
.main {
  margin: 0 100px;
}
.left {
  height: 100%;
  width: 100px;
  float: left;
  margin-left: -100%;
  background-color: rgba(255, 0, 0, 0.5)
}
.right {
  height: 100%;
  width: 100px;
  float: left;
  margin-left: -100px;
  background-color: rgba(0, 255, 0, 0.5)
}
```

完整的demo见 <https://jsbin.com/fibomih/1/edit?html,css,output>。

## 总结

- 圣杯布局有个问题，当面板的middle部分比两边的子面板宽度小的时候，布局会乱掉。
- 双飞翼布局可以看成圣杯布局的改进方案，不存在圣杯布局的问题，实现也更加简洁。
- 圣杯布局和双飞翼布局的优势并不是左右定宽，中间自适应的三列布局，其重点是中间栏位于文档流前面以优先渲染。
- 不考虑兼容性的情况下，布局本身最优雅的解决方案是弹性布局flex。