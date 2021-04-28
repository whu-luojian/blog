# WebGL

本系列文章为学习 WebGL 过程中的摘抄和总结，主要参考资料为掘金小册《WebGL 入门和实践》，学习过程中及本系列文章中的代码示例及注释见：<https://github.com/whu-luojian/webgl-abc>。

## WebGL

WebGL 是一组基于 JavaScript 语言的`图形规范`，浏览器厂商按照这组规范进行实现，为 Web 开发者提供一套 3D 图形相关的 API。
这些 API 能够让 Web 开发者使用 JavaScript 语言直接和显卡（GPU）进行通信。当然 WebGL 的 GPU 部分也有对应的编程语言，简称 `GLSL`。我们用它来编写运行在 GPU 上的着色器程序，着色器接收 CPU（WebGL 使用 JavaScript）传递过来的数据，然后对这些数据进行流水线处理，最终显示在屏幕上。

## GLSL

GLSL 全称 `OpenGL Shading Language`，OpenGL 着色语言，用来在 OpenGL 编写着色器程序的语言。着色器程序是在显卡（GPU）上运行的简短程序，代替了 GPU 固定`渲染管线`的一部分，使 GPU 渲染过程中的某些部分允许开发者通过编程进行控制。

![webgl-1](webgl-1.png)

上图简单演示了 WebGL 对一个红色三角形的渲染过程，绿色部分为开发者可以通过编程控制的部分：
- **JavaScript 程序**：处理着色器需要的`顶点坐标`、`法向量`、`颜色`、`纹理`等信息，并负责为着色器提供这些数据。
- **顶点着色器**：接收 `JavaScript` 传递过来的`顶点信息`，将顶点绘制到对应坐标。
- **图元装配阶段**：将顶点装配成指定`图元类型`，如三角形图元。
- **光栅化阶段**：将三角形内部区域用空像素进行填充。
- **片元着色器**：为三角形内部的像素填充颜色信息。

一般情况下，最初的顶点坐标是相对于`模型中心`的，不能直接传递到着色器中，我们需要对`顶点坐标`按照一系列步骤执行`模型转换`，`视图转换`、`投影转换`，转换之后的坐标才是 WebGL 可接受的坐标，即`裁剪空间坐标`。

实际上，对顶点信息的变换操作既可以在 `JavaScript` 中进行，也可以在`着色器程序`中进行。通常我们都是在 `JavaScript` 中生成一个包含了所有变换的`最终变换矩阵`，然后将该矩阵传递给着色器，利用 `GPU` 并行计算优势对所有顶点执行变化。