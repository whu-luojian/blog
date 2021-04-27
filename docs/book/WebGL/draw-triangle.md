# 三角形和线段

## 三角形图元

WebGL 的基本图元包含点、线段、三角形，而三角形又分为三类：

- 基本三角形（`TRIANGLES`）
基本三角形是一个个独立的三角形，如果我们给着色器提供六个顶点，那么 WebGL 会绘制两个三角形，前三个顶点绘制一个，后三个顶点绘制另一个，互不相干。比如我们有六个顶点，则绘制完如下：

<img src="https://user-gold-cdn.xitu.io/2018/9/5/165a8dc0abecae80?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

- 三角带（TRIANGLE_STRIP）
同样六个顶点，如果采用三角带的方式绘制的话，则会绘制 【v1，v2，v3】，【v2，v3，v4】，【v3，v4，v5】，【v4，v5，v6】四个三角形，如下图：

<img src="https://user-gold-cdn.xitu.io/2019/1/22/16875b8e51710e48?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

- 三角扇（TRIANGLE_FAN）
三角扇的绘制方式是以第一个顶点作为所有三角形的顶点进行绘制的：

<img src="https://user-gold-cdn.xitu.io/2018/9/5/165a8dc2bb044266?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

## 线段图元

线段图元分为三类：

- 基本线段（`LINES`）：绘制每一条线段都需要明确指定构成线段的两个端点。

- 带状线段（`LINE_STRIP`）：绘制线段时，采用前一个顶点作为当前线段的起始端点。

- 环状线段（`LINE_LOOP`）：环状线段除了包含 LINE_STRIP 的绘制特性，还有一个特点就是将线段的终点和第一个线段的起点进行连接，形成一个线段闭环。


## 绘制动态三角形

### 代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>动态绘制三角形</title>
</head>
<body>
  <!-- 着色器里的代码要加分号 -->
  <!-- 顶点着色器 -->
  <script type="shader-source" id="vertexShader">
    // 设置浮点数精度为中等精度
    precision mediump float;
    // 接收顶点坐标 (x, y)
    attribute vec2 a_Position;
    // 接收 canvas 的尺寸
    attribute vec2 a_Screen_Size;
    void main() {
      vec2 position = (a_Position / a_Screen_Size) * 2.0 - 1.0;
      position = position * vec2(1.0, -1.0);
      // 声明顶点位置
      gl_Position = vec4(position, 0.0, 1.0);
      gl_PointSize = 10.0;
    }
  </script>

  <!-- 片元着色器 -->
  <script type="shader-source" id="fragmentShader">
    // 设置浮点数精度为中等精度
    precision mediump float;
    // 接收 JavaScript 传过来的颜色值（RGBA）
    uniform vec4 u_Color;
    void main() {
      // 将普通颜色表示转化为 WebGL 需要的表示方式
      vec4 color = u_Color / vec4(255, 255, 255, 1);
      // 设置像素颜色
      gl_FragColor = color;
    }
  </script>

  <canvas id="canvas"></canvas>

  <script type="module">
    import { getCanvas, resizeCanvas, getWebGLContext, createShaderFromScript, createProgram, randomColor } from '../utils/webgl-helper.js'
    //获取canvas
    const canvas = getCanvas('#canvas')
    // 全屏
    resizeCanvas(canvas)

    //获取webgl绘图环境
    const gl = getWebGLContext(canvas)

    //创建顶点着色器
    const vertexShader = createShaderFromScript(gl, gl.VERTEX_SHADER,'vertexShader')
    //创建片元着色器
    const fragmentShader = createShaderFromScript(gl, gl.FRAGMENT_SHADER,'fragmentShader')

    //创建着色器程序
    const program = createProgram(gl ,vertexShader, fragmentShader)
    //告诉 WebGL 运行哪个着色器程序
    gl.useProgram(program)

    // 三角形顶点坐标
    let positions = []
    // 找到顶点着色器中的变量 a_Position
    let a_Position = gl.getAttribLocation(program, 'a_Position')
    // 找到顶点着色器中的变量 a_Screen_Size
    let a_Screen_Size = gl.getAttribLocation(program, 'a_Screen_Size')
    // 找到片元着色器中的变量 u_Color
    let u_Color = gl.getUniformLocation(program, 'u_Color')
    // 为顶点着色器中的 a_Screen_Size 传递 canvas 的宽高信息
    gl.vertexAttrib2f(a_Screen_Size, canvas.width, canvas.height)

    // 创建缓存区，用于一次传递多个顶点数据
    let buffer = gl.createBuffer()
    // 绑定该缓冲区为 WebGL 当前缓冲区 gl.ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    // 每次取两个数组
    let size = 2
    // 每个数据的类型是 32 位浮点型
    let type = gl.FLOAT
    // 不需要归一化数据
    let normalize = false
    // 每次迭代运行需要移动数据数 * 每个数据所占内存，到下一个数据开始点
    let stride = 0
    // 从缓冲区起始位置开始读取
    let offset = 0
    // 将 a_Position 变量获取数据的缓冲区指向当前绑定的 buffer：顶点如何从 buffer 中获取数据
    gl.vertexAttribPointer(a_Position, size, type, normalize, stride, offset)
    // 启用属性 a_Position
    gl.enableVertexAttribArray(a_Position)

    // 设置清空画布颜色为黑色。
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // 用上一步设置的清空画布颜色清空画布
    gl.clear(gl.COLOR_BUFFER_BIT)

    function render(gl, positions) {
      // 用上一步设置的清空画布颜色清空画布
      gl.clear(gl.COLOR_BUFFER_BIT)
      // 绘制图元设置为三角形
      let primitiveType = gl.TRIANGLES
      // 从顶点数组的开始位置取顶点数据
      let drawOffset = 0
      gl.drawArrays(primitiveType, drawOffset, positions.length / 2)
    }

    canvas.addEventListener('mouseup', e => {
      let x = e.pageX
      let y = e.pageY
      positions.push(x, y)
      if (positions.length % 6 === 0) {
        // 向缓冲区中复制新的顶点数据
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)
        let color = randomColor()
        // 为片元着色器中的 u_Color 传递随机颜色
        gl.uniform4f(u_Color, color.r, color.g, color.b, color.a)
        render(gl, positions)
      }
    })
  </script>
</body>
</html>
```

## 缓冲区
缓冲区是常驻于内存中的 javascript 对象，存储着即将推送到着色器中的 attribute 对象。缓冲区如同一个长长的队列，着色器每处理完一个顶点（或其它 attribute 对象），缓冲区就提供下一个顶点给着色器处理。
不使用缓冲区清况下，一次只能画一个点，使用缓冲区一次可以绘制多个点。

### 创建步骤

1. 创建缓冲区对象
```js
let buffer = gl.createBuffer()
```

2. 绑定缓冲区对象
```js
/**
 * target:
 *   gl.ARRAY_BUFFER: 指缓冲区中包含了顶点数据
 *   gl.ELEMENT_ARRAY_BUFFER: 指缓冲区中包含了顶点数据的索引值
*/
gl.bindBuffer(target, buffer)
```

3. 将数据写入缓冲区对象
```js
/**
 * target: 同上
 * size: Float32Array对象，该对象是基于数组 vertices 建立的。在 JavaScript 中，数组是一个文本对象，
 *       而 Float32Array 对象是一个二进制对象，性能更高
 * usage: 表示程序将如何使用缓冲区中的数据
 *    gl.STATIC_DRAW：只会向缓冲区对象中写入一次数据，但需要绘制很多次
 *    gl.STREAM_DRAW：只会向缓冲区对象中写入一次数据，然后绘制若干次，意味着数据每帧都不同
 *    gl.DYNAMIC_DRAW：会向缓冲区对象多次写入数据，并绘制很多次，意味着数据可以被频繁更改
*/
gl.bufferData(target, size, usage)
```

4. 将缓冲区对象分配给一个 attribute 变量
```js
/**
 * index: 指定待分配 attribute 变量存储位置，一般通过 getAttribLocation 获取
 * size：指定缓冲区中每个顶点的分量个数
 * type：数据类型
 *    gl.BYTE：字节型，取值范围[-128, 127]
 *    gl.SHORT：短整型，取值范围[-32768, 32767]
 *    gl.UNSIGNED_BYTE：无符号字节型，取值范围[0, 255]
 *    gl.UNSIGNED_SHORT：无符号短整型，取值范围[0, 65535]
 *    gl.FLOAT: 浮点型（default）
 * normalized：表明是否将非浮点型的数据归一化到[0, 1]或[-1, 1]之间
 * stride：指定相邻的两个顶点间的字节数，[0, 255]
 * offset：指定缓冲区对象的偏移量，即 attribute 变量从缓冲区何处开始存储（从0开始）
*/
gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
```

5. 开启 attribute 变量
```js
/**
 * index: 同上
*/
gl.enableVetexAttribArray(index)
```

6. 绘制图像
```js
/**
 * mode: 需要绘制的图形形状
 *    gl.POINTS：绘制一个点
 *    gl.LINES：绘制一条线
 *    gl.LINE_STRIP：绘制一条直线到一个顶点
 *    gl.LINE_LOOP：绘制一条首尾相连的线
 *    gl.TRIANGLES：绘制一个三角形
 *    gl.TRIANGLE_STRIP：绘制三角形带
 *    gl.TRIANGLE_FAN: 绘制一系列组成扇形的相邻三角形
 * first：绘制的开始点
 * count：需要绘制的图形个数
*/
gl.drawArrays(mode, first, count)
```
