# 绘制点

## 术语

- **图元**：WebGL 能够绘制的基本图形元素，包含三种：点、线段、三角形。
- **片元**：可以理解为像素，像素着色阶段是在片元着色器中。
- **裁剪坐标系**：裁剪坐标系是顶点着色器中的 `gl_Position` 内置变量接收到的坐标所在的坐标系。
- **设备坐标系**：又名 NDC 坐标系，是裁剪坐标系各个分量对 w 分量相除得到的坐标系，特点是 x、y、z 坐标分量的取值范围都在 【-1， 1】之间，可以将它理解为边长为 2 的正方体，坐标系原点在正方体中心。

## 绘制静态点

### 代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>绘制点</title>
</head>
<body>
  <!-- 着色器里的代码要加分号 -->
  <!-- 顶点着色器 -->
  <!-- 告诉 GPU 在裁剪坐标系的圆点（也就是屏幕中心）画一个大小为 10 的点 -->
  <script type="shader-source" id="vertexShader">
    void main() {
      // 声明顶点位置
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      // 声明要绘制的点的大小
      gl_PointSize = 10.0;
    }
  </script>

  <!-- 片元着色器 -->
  <!-- 顶点着色器中的数据经过图元装配和光栅化之后，来到了片元着色器 -->
  <!-- 片元着色器通知 GPU 将光栅化后的像素渲染成红色 -->
  <script type="shader-source" id="fragmentShader">
    void main() {
      // 设置像素颜色为红色
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  </script>

  <script>
    const canvas = document.createElement('canvas')
    document.querySelector('body').appendChild(canvas)
    // 在某些浏览器中，加上实验前缀做兼容处理
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    // 获取顶点着色器源码
    const vertexShaderSource = document.querySelector('#vertexShader').innerHTML
    // 创建顶点着色器对象
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    // 将源码分配给顶点着色器对象
    gl.shaderSource(vertexShader, vertexShaderSource)
    // 编译顶点着色器程序
    gl.compileShader(vertexShader)

    // 获取片元着色器源码
    const fragmentShaderSource = document.querySelector('#fragmentShader').innerHTML
    // 创建片元着色器对象
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    // 将源码分配给片元着色器对象
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    // 编译片元着色器
    gl.compileShader(fragmentShader)

    // 创建着色器程序
    const program = gl.createProgram()
    // 将顶点着色器挂载在着色器程序上
    gl.attachShader(program, vertexShader)
    // 将片元着色器挂载在着色器程序上
    gl.attachShader(program, fragmentShader)
    // 链接着色器程序
    gl.linkProgram(program)

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      // 启用创建好的着色器程序
      gl.useProgram(program)

      // 设置清空画布所用颜色为黑色
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      // 用上一步设置的清空画布颜色清空画布
      gl.clear(gl.COLOR_BUFFER_BIT)

      // 绘制点
      gl.drawArrays(gl.POINTS, 0, 1)
    } else {
      console.error(gl.getProgramInfoLog(program))
    }

  </script>
</body>
</html>
```

**`gl_Position`、`gl_PointSize`、`gl_FragColor` 是 GLSL 的内置属性：**

- `gl_Position`：顶点的裁剪坐标系坐标，包含 X，Y，Z，W 四个坐标分量，顶点着色器接收到这个坐标之后，对它进行透视除法，即将各个分量同时除以 W，转换成 NDC 坐标，NDC 坐标每个分量的取值范围都在 【-1， 1】之间，GPU 获取这个属性值作为顶点的最终位置进行绘制。
- `gl_FragColor`：片元（像素）颜色，包含 R、G、B、A 四个颜色分量，且每个分量的取值范围在【0， 1】 之间，即（R值/255，G值/255，B值/255, A值/1）。GPU 获取这个值作为像素的最终颜色进行着色。
- `gl_PointSize`：绘制到屏幕的点大小，需要注意的是，gl_PointSize 只有在绘制图元是点的时候才生效，绘制线段或者三角形的时候，gl_PointSize 是不起作用的。

- **`vec4`**：包含四个浮点元素的容器类型，vec 是 vector 的单词缩写，`vec4` 代表 4 个浮点数的向量。此外，还有 `vec2`、`vec3` 等。

## 绘制动态点

在鼠标点击过的位置绘制一个随机颜色的点：要求通过中 JavaScript 往着色器程序传入顶点位置和颜色数据，从而改变点的位置和颜色。

### 代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>绘制点</title>
</head>
<body>
  <!-- 着色器里的代码要加分号 -->
  <!-- 顶点着色器 -->
  <!-- 告诉 GPU 在裁剪坐标系的圆点（也就是屏幕中心）画一个大小为 10 的点 -->
  <script type="shader-source" id="vertexShader">
    // 设置浮点数精度为中等精度
    precision mediump float;
    // 接收点在 canvas 坐标系上的坐标（x, y）
    attribute vec2 a_Position;
    // 接收 canvas 的宽高尺寸
    attribute vec2 a_Screen_Size;
    void main() {
      // 将屏幕坐标系转化为裁剪坐标系
      vec2 position = (a_Position / a_Screen_Size) * 2.0 - 1.0;
      position = position * vec2(1.0, -1.0);
      // 声明顶点位置
      gl_Position = vec4(position, 0.0, 1.0);
      // 声明要绘制的点的大小
      gl_PointSize = 10.0;
    }
  </script>

  <!-- 片元着色器 -->
  <!-- 顶点着色器中的数据经过图元装配和光栅化之后，来到了片元着色器 -->
  <!-- 片元着色器通知 GPU 将光栅化后的像素渲染成红色 -->
  <script type="shader-source" id="fragmentShader">
    // 设置浮点数精度为中等精度
    precision mediump float;
    // 接收 JavaScript 传过来的颜色值（RGBA）
    uniform vec4 u_Color;
    void main() {
      // 将普通颜色表示转化为 WebGL 需要的表示方式
      vec4 color = u_Color / vec4(255, 255, 255, 1);
      // 设置像素颜色为红色
      gl_FragColor = color;
    }
  </script>

  <script>
    const canvas = document.createElement('canvas')
    document.querySelector('body').appendChild(canvas)
    // 在某些浏览器中，加上实验前缀做兼容处理
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    // 获取顶点着色器源码
    const vertexShaderSource = document.querySelector('#vertexShader').innerHTML
    // 创建顶点着色器对象
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    // 将源码分配给顶点着色器对象
    gl.shaderSource(vertexShader, vertexShaderSource)
    // 编译顶点着色器程序
    gl.compileShader(vertexShader)

    // 获取片元着色器源码
    const fragmentShaderSource = document.querySelector('#fragmentShader').innerHTML
    // 创建片元着色器对象
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    // 将源码分配给片元着色器对象
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    // 编译片元着色器
    gl.compileShader(fragmentShader)

    // 创建着色器程序
    const program = gl.createProgram()
    // 将顶点着色器挂载在着色器程序上
    gl.attachShader(program, vertexShader)
    // 将片元着色器挂载在着色器程序上
    gl.attachShader(program, fragmentShader)
    // 链接着色器程序
    gl.linkProgram(program)

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      // 启用创建好的着色器程序
      gl.useProgram(program)

      // 找到顶点着色器中的变量 a_Position
      let a_Position = gl.getAttribLocation(program, 'a_Position')
      // 找到顶点着色器中的变量 a_Screen_Size
      let a_Screen_Size = gl.getAttribLocation(program, 'a_Screen_Size')
      // 找到片元着色器中的变量 u_Color
      let u_Color = gl.getUniformLocation(program, 'u_Color')
      // 为顶点着色器中的 a_Screen_Size 传递 canvas 的宽高信息
      gl.vertexAttrib2f(a_Screen_Size, canvas.width, canvas.height)
      // 存储点击位置的数组
      const points = []
      canvas.addEventListener('click', e => {
        points.push({
          x: e.pageX,
          y: e.pageY,
          color: {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
            a: Math.random()
          }
        })
        // 设置清空画布颜色为黑色。
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        // 用上一步设置的清空画布颜色清空画布。
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (let i = 0; i < points.length; i++) {
          let color = points[i].color
          // 为片元着色器中的 u_Color 传递随机颜色
          gl.uniform4f(u_Color, color.r, color.g, color.b, color.a)
          // 为顶点着色器中的 a_Position 传递顶点坐标
          gl.vertexAttrib2f(a_Position, points[i].x, points[i].y)
          // 绘制点
          gl.drawArrays(gl.POINTS, 0, 1)
        }
      })

      // 设置清空画布所用颜色为黑色
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      // 用上一步设置的清空画布颜色清空画布
      gl.clear(gl.COLOR_BUFFER_BIT)
    } else {
      console.error(gl.getProgramInfoLog(program))
    }

  </script>
</body>
</html>
```
