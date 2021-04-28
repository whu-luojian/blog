# 绘制矩形

矩形的绘制 = 绘制两个（或多个）三角形

## 基本三角形构建

<img src="https://user-gold-cdn.xitu.io/2018/9/11/165c77b134803832?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

一个矩形由两个共线的三角形组成，即 V0, V1, V2, V3，其中 V0 -> V1 -> V2 代表三角形A，V0 -> V2 -> V3代表三角形B。

> 组成三角形的顶点要按照一定的顺序绘制。默认情况下，WebGL 会认为顶点顺序为逆时针时代表正面，反之则是背面，区分正面、背面的目的在于，如果开启了背面剔除功能的话，背面是不会被绘制的。

每个三角形由三个顶点组成，两个矩形共需要六个顶点：

```js
  let positions = [
    30, 30, 255, 0, 0, 1,    //V0
    30, 300, 255, 0, 0, 1,   //V1
    300, 300, 255, 0, 0, 1,  //V2
    30, 30, 0, 255, 0, 1,    //V0
    300, 300, 0, 255, 0, 1,  //V2
    300, 30, 0, 255, 0, 1    //V3
  ]
```

完整代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>绘制矩形</title>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script type="shader-source" id="vertexShader">
    precision mediump float;
    attribute vec2 a_Position;
    attribute vec2 a_Screen_Size;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
      vec2 position = (a_Position / a_Screen_Size) * 2.0 - 1.0;
      position = position * vec2(1.0, -1.0);
      gl_Position = vec4(position, 0.0, 1.0);
      gl_PointSize = 10.0;
      v_Color = a_Color;
    }
  </script>

  <script type="shader-source" id="fragmentShader">
    precision mediump float;
    varying vec4 v_Color;
    void main() {
      vec4 color = v_Color / vec4(255, 255, 255, 1);
      gl_FragColor = color;
    }
  </script>

  <script type="module">
    import { getCanvas, resizeCanvas, getWebGLContext, createShaderFromScript, createProgram } from '../utils/webgl-helper.js'

    const canvas = getCanvas('#canvas')
    resizeCanvas(canvas)

    const gl = getWebGLContext(canvas)
    const vertexShader = createShaderFromScript(gl, gl.VERTEX_SHADER, 'vertexShader')
    const fragmentShader = createShaderFromScript(gl, gl.FRAGMENT_SHADER, 'fragmentShader')
    const program = createProgram(gl, vertexShader, fragmentShader)
    gl.useProgram(program)

    let a_Position = gl.getAttribLocation(program, 'a_Position')
    let a_Screen_Size = gl.getAttribLocation(program, 'a_Screen_Size')
    let a_Color = gl.getAttribLocation(program, 'a_Color')

    gl.vertexAttrib2f(a_Screen_Size, canvas.width, canvas.height)

    gl.enableVertexAttribArray(a_Position)
    gl.enableVertexAttribArray(a_Color)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 24, 0)
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 24, 8)

    // 静态绘制两个三角形，需要六个节点
    let positions = [
      30, 30, 255, 0, 0, 1,    //V0
	    30, 300, 255, 0, 0, 1,   //V1
	    300, 300, 255, 0, 0, 1,  //V2
	    30, 30, 0, 255, 0, 1,    //V0
	    300, 300, 0, 255, 0, 1,  //V2
	    300, 30, 0, 255, 0, 1    //V3
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 6)
  </script>
</body>
</html>
```

## 索引方式绘制

在绘制一个矩形的时候，实际上只需要 V0, V1, V2, V3 四个顶点，而基于基于基本三角形构建的方式我们却存储了六个顶点，对内存造成了浪费。

WebGL 除了提供 `gl.drawArrays` 按顶点绘制的方式以外，还提供了一种按照顶点索引进行绘制的方法：`gl.drawElements`，可以避免重复定义顶点：

> void gl.drawElements(mode, count, type, offset)

- mode: 指定绘制图元的类型：点、线、三角形；
- count: 指定绘制图形的顶点个数；
- type：指定索引缓冲区中值的类型，常用的两个值：`gl.UNSIGNED_BYTE`（无符号8位整数） 和 `gl.UNSIGNED_SHORT`（无符号16位整数）；
- offset：指定索引数组中开始绘制的位置，以字节为单位；

核心代码：

```js
// 顶点数组
let positions = [
  30, 30, 255, 0, 0, 1,    //V0
  30, 300, 255, 0, 0, 1,   //V1
  300, 300, 255, 0, 0, 1,  //V2
  300, 30, 0, 255, 0, 1    //V3]
]

// 索引数组
let indices = [
  0, 1, 2,
  0, 2, 3
]

// 索引 buffer
const indicesBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

// drawElements
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
```

## 基于三角带绘制矩形

```js

// 三角带绘制矩形，注意顶点位置
let positions = [
  30, 300, 255, 0, 0, 1,   //V1
  300, 300, 255, 0, 0, 1,  //V2
  30, 30, 255, 0, 0, 1,    //V0
  300, 30, 0, 255, 0, 1    //V3
]

// 绘制：gl.TRIANGLE_STRIP
gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 6)
```

## 基于三角扇绘制

```js

// 三角扇绘制矩形，注意顶点位置
let positions = [
  30, 30, 255, 0, 0, 1,    //V0
  30, 300, 255, 0, 0, 1,   //V1
  300, 300, 255, 0, 0, 1,  //V2
  300, 30, 0, 255, 0, 1    //V3
]

// 绘制：gl.TRIANGLE_FAN
gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 6)
```
