# 渐变三角形

## attribute，uniform，varying

### attribute 变量

**`attribute` 变量只能在顶点着色器中使用（vertex shader 中使用）**。一般用 `attribute` 变量来表示一些顶点数据，如：顶点坐标、法线、纹理坐标、顶点颜色等。
在应用中，使用 `gl.getAttribLocation` 来获取 `attribute` 变量的位置；使用 `gl.vertexAttrib2f` 等对变量赋值。

### uniform 变量

**`uniform` 变量可以用在顶点着色器和片元着色器中**。一般用 `uniform` 变量来表示变换矩阵、材质、光照参数和颜色等信息。
`uniform` 可以看成是外部应用传递给着色器的常量，着色器只能用，不能改 `uniform` 变量。如果 `uniform` 变量在顶点着色器和片元着色器中的声明方式一样，则它可以在两个着色器中共享（相当于一个被顶点和片元着色器共享的全局变量）。
在应用中，使用 `gl.getUniformLocation` 来获取 `uniform` 变量的位置；使用 `gl.uniform4f` 等对变量赋值。

### varying 变量

**`varying` 变量的作用是从顶点着色器向片元着色器传值**。`varying` 变量只能是 float 类型的，只要在片元着色器中也声明同名 `varying` 变量，顶点着色器赋给该变量的值就会自动传入片元着色器。顶点着色器中的 `varying` 变量值不是直接传递，会先进行内插（interpolate）。

## 绘制

### 思路

1. 在顶点着色器中增加一个 `attribute` 变量 `a_Color`，用来接收顶点的颜色。
2. 在顶点和片元着色器中定义一个 `varying` 类型的变量 `v_Color`，用来传递顶点颜色信息。
3. 利用多缓冲区传递多个数据。创建两个 `buffer`，将 `a_Position` 和 `positionBuffer` 绑定，`a_Color` 和 `colorBuffer` 绑定，然后设置各自读取 `buffer` 的方式。

> 程序中如果有多个 `buffer`，在切换 `buffer` 进行操作时，一定要通过调用 `gl.bindBuffer` 将要操作的 `buffer` 绑定到 `gl.ARRAY_BUFFER` 上，以此来切换需要操作的 `buffer`。

> 另一思路是利用一个缓冲区传递多种数据，注意点就是需要正确设置 `gl.vertexAttribPointer` 的 `stride` 和 `offset` 参数，确保多种数据的正确读取

### 代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>绘制渐变三角形</title>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script type="shader-source" id="vertexShader">
    precision mediump float;
    attribute vec2 a_Position;
    attribute vec2 a_Screen_Size;
    // 接收 JavaScript 传递的顶点颜色
    attribute vec4 a_Color;
    // 往片元着色器传递的颜色
    varying vec4 v_Color;
    void main() {
      vec2 position = (a_Position / a_Screen_Size) * 2.0 - 1.0;
      position = position * vec2(1.0, -1.0);
      gl_Position = vec4(position, 0.0, 1.0);
      v_Color = a_Color;
    }
  </script>
  <script type="shader-source" id="fragmentShader">
    precision mediump float;
    // 接收从顶点着色器传递过来的值
    varying vec4 v_Color;
    void main() {
      vec4 color = v_Color / vec4(255, 255, 255, 1);
      gl_FragColor = color;
    }
  </script>

  <script type="module">
     import { getCanvas, resizeCanvas, getWebGLContext, createShaderFromScript, createProgram, randomColor, createBuffer } from '../utils/webgl-helper.js'
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

    // 找到顶点着色器中的变量 a_Position
    let a_Position = gl.getAttribLocation(program, 'a_Position')
    // 找到顶点着色器中的变量 a_Screen_Size
    let a_Screen_Size = gl.getAttribLocation(program, 'a_Screen_Size')
    // 找到顶点着色器中的变量 a_Color
    let a_Color = gl.getAttribLocation(program, 'a_Color')
    // 为顶点着色器中的 a_Screen_Size 传递 canvas 的宽高信息
    gl.vertexAttrib2f(a_Screen_Size, canvas.width, canvas.height)

    let positionBuffer = createBuffer(gl, a_Position, { size: 2 })
    let colorBuffer = createBuffer(gl, a_Color, { size: 4 })

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

    // 三角形顶点坐标
    let positions = []
    // 颜色
    let colors = []
    canvas.addEventListener('mouseup', e => {
      let x = e.pageX
      let y = e.pageY
      positions.push(x, y)
      let color = randomColor()
      colors.push(color.r, color.g, color.b, color.a)
      if (positions.length % 6 === 0) {
        // 向缓冲区中赋值顶点数据
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)
        // 向缓冲区中赋值顶点颜色数据
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW)
        render(gl, positions)
      }
    })
  </script>
</body>
</html>
```
