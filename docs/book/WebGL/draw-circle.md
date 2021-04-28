# 绘制圆和圆环

## 绘制圆

<img src="https://user-gold-cdn.xitu.io/2018/9/21/165fb3037eeca21b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

1. 将圆形分割成以圆心为共同顶点的若干个三角形，三角形越多，圆形越平滑；
2. 以 `gl.TRIANGLE_FAN` 三角扇形形式绘制。


[源码](https://github.com/whu-luojian/webgl-abc/blob/main/src/pages/draw-circle.html)，关键代码：

```js
/**
 * 生成圆形的顶点数组
 * x: 圆心的 x 坐标
 * y：圆心的 y 坐标
 * radius：圆的半径
 * n: 三角形数量
*/
function createCircleVertex(x, y, radius, n) {
  const positions = [x, y, 255, 0, 0, 1]
  for (let i = 0; i <= n; i++) {
    let angle = 2 * Math.PI * i / n
    positions.push(x + radius * Math.sin(angle), y + radius * Math.cos(angle), 255, 0, 0, 1)
  }
  return positions
}

let positions = createCircleVertex(300, 300, 50, 100)

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

gl.clearColor(0, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

// 以 `gl.TRIANGLE_FAN` 三角扇形形式绘制
gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 6)
```

## 绘制圆环

<img src="https://user-gold-cdn.xitu.io/2018/12/27/167ed9b3702ca350?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

1. 建立两个圆，一个内圆，一个外圆，划分 n 个近似于扇形的三角形，每个三角形的两条边都会和内圆和外圆相交，产生四个交点，这四个交点组成一个近似矩形，然后将矩形划分为两个三角形；
2. 以 `gl.TRIANGLE_STRIP` 三角带形式绘制。

[源码](https://github.com/whu-luojian/webgl-abc/blob/main/src/pages/draw-ring.html)，关键代码：

```js
/**
 * 生成圆环的顶点数组
 * x: 圆心的 x 坐标
 * y：圆心的 y 坐标
 * rinnerRadius：内圆的半径
 * outerRadius：外圆的半径
 * n: 三角形数量
*/
function createRingVertex(x, y, innerRadius, outerRadius, n) {
  const positions = []
  for (let i = 0; i <= n; i++) {
    let angle = 2 * Math.PI * i / n
    let color = randomColor()
    positions.push(x + innerRadius * Math.sin(angle), y + innerRadius * Math.cos(angle), color.r, color.g, color.b,color.a)
    positions.push(x + outerRadius * Math.sin(angle), y + outerRadius * Math.cos(angle), color.r, color.g, color.b,color.a)
  }
  return positions
}

let positions = createRingVertex(300, 300, 50, 100, 100)

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

gl.clearColor(0, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

// 以 `gl.TRIANGLE_STRIP` 三角带形式绘制
gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 6)
```
