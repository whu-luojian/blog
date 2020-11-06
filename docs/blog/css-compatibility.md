# CSS 浏览器兼容性

## 【2020-11-06】flex
为了让 flex 子元素占据剩余空间同时不被内容撑开，我们一般这样设置：

```css
flex: 1;
width: 0
```
但在 firefox 浏览器中并未生效，子元素被内容撑开了，查阅 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex)可知：默认情况下，元素不会缩短至小于内容框尺寸，若想改变这一状况，请设置元素的min-width 与 min-height属性。因此可设置：

```css
/* 宽 */
flex: 1;
width: 0;
min-width: 0;

/* 高 */
flex: 1;
height: 0;
min-height: 0;
```
