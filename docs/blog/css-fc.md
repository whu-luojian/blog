# CSS 格式化上下文

格式化上下文（Formatting Context）是 W3C CSS2.1 规范中的一个概念。它是指页面中的一块渲染区域，遵循着一套特定的渲染规则，它决定了其子元素将如何定位，以及和其它元素的相互作用关系。

页面上的元素形成的 Box（盒子， Box 是 CSS 布局的基本单位）都会参与到格式化上下文中（尺寸、布局、排版），不同类型的 Box 会参与不同的格式化上下文，且只能参与到一种格式化上下文，主要有：BFC、IFC。

## BFC

Block Formatting Contexts，块级格式化上下文，以下元素会生成BFC：

- 文档根元素 html
- float 熟悉不为 none
- position 为 absolute 或 fixed
- display 为 inline-block、table-cell、table-caption、flex、inline-flex
- overflow 不为 visible
- display 为 flow-root（显式创建 BFC，无任何副作用）

BFC 布局规则：

1. BFC 是页面上一个隔离的独立容器，容器内的子元素不会影响到外面的元素，外面的元素也不会影响到内部子元素
2. 在 BFC 中，内部的 Box 会在垂直方向，一个接一个放置

2. Box 垂直方向的距离由 margin 决定。属于同一个 BFC 的两个相邻 Box 的 margin 会发生重叠（margin 塌陷）

3. 在 BFC 中，每个元素的 margin box 的左边，与包含块 border box 的左边相接触。即使存在浮动也是如此

4. BFC 区域不会与 float box 重叠
5. 计算 BFC 的高度时，浮动元素也参与计算

BFC 应用：

- 分属于不同 BFC 阻止 margin 塌陷（规则2）
- 自适应两栏布局（规则4，demo：<https://jsbin.com/mehofol/edit?html,css,output>）
- 阻止元素被浮动元素覆盖、阻止因浮动元素引发的文字环绕现象（规则4）
- 包含浮动元素（规则5）

## IFC

Inline Formatting Contexts，内联/行级格式化上下文，以下元素会生成 IFC：

- display 为 inline、inline-block、inline-table
- 行内元素

IFC 布局规则（line box（行盒）由 inline-level box 组成）：

1. inline-level box 在水平方向上根据 direction 依次布局
2. margin/padding 在竖直方向无效，水平方向有效
3. width/height 对非替换行内元素无效，非替换元素宽度由元素内容决定，高度由 line-height 决定
4. line box 的高度是最顶端 inline-level box 的顶边到最底端 inline-level box 的底边的距离
5. vertical-align 属性生效
6. inline-level box 在 line box 中的水平分布由 text-align 决定
7. 当一个 inline-level box 的宽度超过了 line-box 的宽度，line-box 会被分割（换行）。如果此 line-level box 不可分割（例如：单个字符或语言指定的文字打断规则不允许在此 inline-level box 中出现打断，或该 inline-level box 受 white-space 属性为 nowrap 或 pre 的影响），那么该 inline-level box 会溢出该 line box
8. 当一个inline-level box的宽度超过了line-box的宽度，line-box会被分割（换行）。如果此line-level box不可分割（例如：单个字符或语言指定的文字打断规则不允许在此inline-level box中出现打断，或该inline-level box受 white-space 属性为 nowrap 或 pre 的影响），那么该 inline-level box 会溢出该 line box。
9. 浮动或者绝对定位会转化为 block，参与到 BFC 中

