# 你不知道的HTML

## 利用image测试网速，上报数据

利用image标签可以简单实现网络测速，原理就是通过访问服务器上的某张图片，根据图片大小和请求耗时计算出当前访问服务的宽带，计算的当前宽带，准确性一般，基本实现如下：

```js
let startTime = Date.now()
let image = new Image()
image.crossOrigin = 'anonymous' // 跨域获取图片，服务端支持
image.src = 'http://www.test.com/speed_measurement.png' // 图片地址
let imgSize = 3 // 图片大小，3kb
image.onload = () => {
    let endTime = Date.now()
    // 当前网速，单位为kb/s
    let speed = parseInt(imgSize / (endTime - startTime) * 1000);
}
```

为了监控前端应用是否正常运行，通常会在前端收集一些错误与性能等数据，最终我们会将这些数据上报到服务端。上报的方式有很多，目前主流的是利用image的src属性，而且通常使用的是 1x1 像素的透明 gif 图片，原因如下：

- 日志上报不需要响应处理，只需要把数据发送过去就好（服务端定时分析访问日志文件，获取上报请求携带的数据进行分析）
- 避免跨域（img天然支持跨域）
- 图片请求不占用Ajax请求资源
- 不会阻塞页面加载，影响用户体验，只要new Image对象就好
- 1x1 像素的透明 gif的体积最小（ 最小的BMP文件需要74个字节，PNG需要67个字节，而合法的GIF，只需要43个字节 ）

基本实现如下：

```js
let beacon = new Image()
// 上报数据
beacon.src = 'http://www.test.com/beacon.gif?page=...&data=...'
```

## 使用iframe给页面的localStorage扩容

浏览器提供的localStorage本地存储的最大空间是5M，如果不够用呢，这时候就需要考虑来给localStorage扩容。采用的是postMessage和iframe相结合的方法不仅可以解决不同源不能共享localStorage的跨域问题，也可以对主页面的localStorage扩容。

思路如下：

1. 在【A域】下引入【B域】，【A域】空间足够时，读写由【A域】来完成，数据存在【A域】下；当【A域】空间不够时，读写由【B域】来完成，数据存在【B域】下。
2. 【A域】空间不够需要在【B域】读写时，通过postMessage 向【B域】发送跨域消息，【B域】监听跨域消息，在接到指定的消息时进行读写操作。
3. 【B域】接到跨域消息时，如果是写入删除可以不做什么，如果是读取，就要先读取本域本地数据通过postMessage向父页面发送消息。
4. 【A域】在读取【B域】数据时就需要监听来自【B域】的跨域消息。

注意事项：

1. window.postMessage()方法，向【B域】发消息，应用`window.frames[0].postMessage()` 这样iframe内的【B域】才可以接到。
2. 同理，【B域】向 【A域】发消息时应用，`window.parent.postMessage()。`
3. 【A域】的逻辑一定要在iframe 加载完成后进行。

A域页面（ http://localhost:3000/a.html  ）

```html
<body>
	<iframe src="http://localhost:3001/b.html" frameborder="0"></iframe>
	<script>
		window.onload = function() {
			// 发送的数据
			let data = {
				key: 'user',
				value: 'admin'
			}
			// 在页面加载完成后主页面向iframe发送请求
			window.frames[0].postMessage(JSON.stringify(data), 'http://localhost:3001')

			// 主页面监听message事件
			window.addEventListener('message', function(e) {
				console.log(e.data)
			})
		}
	</script>
</body>
```

B域页面（http://localhost:3001/b.html ）

```html
<body>
	<script>
		// iframe 接受消息
		window.addEventListener('message', function(e) {
			if (e.source != window.parent) {
				return
			}
			// 操作localStorage，存储、取、删除
			let data = JSON.parse(e.data)
			localStorage.setItem(data.key, data.value)
			// 向父页面发送反馈信息或者父页面需要的存储信息
			window.parent.postMessage(true, '*')
		})
	</script>
</body>
```

测试结果：

![image-20191129170756410](https://raw.githubusercontent.com/whu-luojian/blog/master/images/image-iframe-localStorage.png)
