# 你真的了解 FPS 吗

## 背景知识

### 屏幕成像原理

屏幕是由无数个像素点组成的，每个像素点由红绿蓝（光的三原色）三个子像素组成，每个像素点通过调整红绿蓝子像素的颜色配比来显示颜色，最终所有的像素点拼出一个完整的画面。

### LCD 与 OLED

LCD（Liquid Crystal Display），液晶显示器。

OLED（OrganicLight-Emitting Diode）有机发光二极管。

![image-20200529141342940](oled-lcd.png)

上图是LCD屏幕和OLED屏幕每个像素点的纵切截面图。

液晶本身并不会发光，LCD的发光原理主要靠背光层，也就是上图的Back-light，这部分由大量LED背光组组成，用来显示白光。液晶层（Liquid crystal）被夹在两层偏振片和两层透明电极之间，当我们通过电极层对液晶施以电场，就会让液晶分子感应产生电荷，进而改变晶体分子排列方向，从而控制亮度。至于获得彩色的方法，就是在控制液晶透光率的基础上，往每个液晶单元上加一层滤色片（Color filter），控制色彩的亮度，就能获得想要的各种颜色。

OLED不需要LCD屏幕那样的背光层，也不需要控制出光量的液晶层，OLED是一种通电后可以自行发光的有机二极管，所有OLED屏幕就像一个有着无数个小的彩色灯泡组合的屏幕，通过控制二极管电压就能改变屏幕亮度和颜色。

### 刷新率

刷新率指的是屏幕或显示器的物理能力，指的是1s内屏幕重新刷新的次数，单位是Hz，市场上的显示器屏幕刷新率一般为60Hz。60Hz什么概念？1秒钟刷新60次，也就是说显示器1秒钟可以给你呈现60帧画面。

## FPS

frames per second，帧率，指的是GPU提供画面的速度，对于浏览器来说，就是浏览器重绘的速度。由于现在广泛使用的屏幕都有固定的刷新率都是 60Hz， 在两次硬件刷新之间浏览器进行两次重绘是没有意义的只会消耗性能。因此浏览器会利用这个间隔 16ms（1000ms/60）适当地对绘制进行节流，帧率为60fps。**可以理解为浏览器每16ms生产一张画面，显示器每16ms消费一张画面**，浏览器生产画面过快会造成丢帧，生产过慢则会造成卡顿。

### 渲染帧的流程

渲染帧是指浏览器一次完整绘制过程，帧之间的时间间隔是 DOM 视图更新的最小间隔。 由于主流的屏幕刷新率都在 60Hz，那么渲染一帧的时间就必须控制在 16ms 才能保证不掉帧。 也就是说每一次渲染都要在 16ms 内页面才够流畅不会有卡顿感。 这段时间内浏览器需要完成如下事情：

- 脚本执行（JavaScript）：脚本造成了需要重绘的改动，比如增删 DOM、请求动画等
- 样式计算（CSS Object Model）：级联地生成每个节点的生效样式。
- 布局（Layout）：计算布局，执行渲染算法
- 重绘（Paint）：各层分别进行绘制（比如 3D 动画）
- 合成（Composite）：合成各层的渲染结果

最初 Webkit 使用定时器进行渲染间隔控制， 2014 年时开始 [使用显示器的 vsync 信号控制渲染](https://bugs.chromium.org/p/chromium/issues/detail?id=337617)（其实直接控制的是合成这一步）。 这意味着 16ms 内多次 commit 的 DOM 改动会合并为一次渲染。

### requestIdleCallback 和 requestAnimationFrame

requestAnimationFrame的回调会在每一帧确定执行，属于高优先级任务。

而requestIdleCallback的回调是在浏览器一帧的剩余空闲时间内执行，属于低优先级任务。

![image-20200529165810487](life-of-a-frame.png)

图中一帧包含了用户的交互、js的执行、以及requestAnimationFrame的调用，布局计算以及页面的重绘等工作。 假如某一帧里面要执行的任务不多，在不到16ms（1000/60)的时间内就完成了上述任务的话，那么这一帧就会有一定的空闲时间，这段时间就恰好可以用来执行requestIdleCallback的回调，如下图所示：

![image-20200529165937828](requestIdleCallback.png)

### 实时FPS计算

利用requestAnimationFrame这个 API 可以在浏览器在下一个渲染前执行某个回调的特性来计算：

```js
let start = Date.now()
let count = 0

function nextFrame(){
  requestAnimationFrame(function(){
    count ++
    // 每16帧计算一次FPS
    if(count % 16 === 0){
      const time = (Date.now() - start) / count // 每帧耗时
      const ms = Math.round(time * 1000) / 1000 // 四舍五入，保留三位小数
      const fps = Math.round(100000 / ms) / 100 // fps，保留两位小数
      console.log(`count: ${count}\t${ms}ms/frame\t${fps}fps`)
    }
    nextFrame()
  })
}
nextFrame()
```





## 参考链接

- [一块屏幕是如何刷新自己的](https://user.guancha.cn/main/content?id=228552)
- [OLED 和 LCD 有什么区别](https://www.zhihu.com/question/22263252/answer/410201820)
- [浏览器的 16ms 渲染帧](https://harttle.land/2017/08/15/browser-render-frame.html)

- [前端性能优化之浏览器渲染优化——打造60FPS页面](https://juejin.im/entry/5ad31ea16fb9a028c97a8173)

