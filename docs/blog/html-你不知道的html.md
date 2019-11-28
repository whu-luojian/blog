# 你不知道的HTML

## 利用image测试网速，上报数据

利用image标签可以简单实现网络测速，原理就是通过访问服务器上的某张图片，根据图片大小和请求耗时计算出当前访问服务的宽带，计算的当前宽带，准确性一般，基本实现如下：

```js
let startTime = Date.now()
let image = new Image()
image.crossOrigin = 'anonymous' // 跨域获取图片，服务端支持
image.src = 'www.test.com/speed_measurement.png' // 图片地址
let imgSize = 3 // 图片大小，3kb
image.onload = () => {
    let endTime = Date.now()
    // 当前网速，单位为kb/s
    let speed = parseInt(imgSize / (endTime - startTime) * 1000);
}
```

