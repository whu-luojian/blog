# Rxjs 入门

本系列文章为学习Rxjs过程中的摘抄和总结，主要学习书籍为《深入浅出Rxjs》，学习版本为Rxjs v6，学习过程中及本系列文章中的代码示例及注释见：<https://github.com/whu-luojian/hello-rxjs>。

## Reactive Extension

[Reactive Extension](http://reactivex.io)，也叫ReactiveX，或者简称Rx，指的是实践响应式编程的一套工具，或者说Rx是一套通过可监听流来做异步编程的API。

Rx的概念最初由微软公司实现并开源，也就是Rx.NET，因为Rx带来的编程方式大大改进了异步编程模型，在.NET之后，众多开发者在其他平台和语言上也实现了Rx的类库。Rxjs也就是Rx的JavaScript语言实现。

## Stream

Rx是针对同步或异步数据流的编程。在Rx世界里，几乎一切都可以看成数据流，变量、属性、数据结构、用户输入、点击事件、ajax请求等等都可以产生流。开发者可以监听这些流并调用特定的逻辑对他们进行处理。

基于流的概念，Rx提供了一系列神奇的函数工具集，称为操作符，使用它们可以创建、转化、过滤、合并这些流等等。一个流或者一系列流可以作为另一个流的输入。你可以合并两个流，从一堆流中过滤出你感兴趣的流，或者将值从一个流映射到另一个流。

流是Rx的核心，流是包含了有时序、正在进行事件的序列，可以发射值、错误、完成信号。我们异步地捕获发射的事件，定义一系列函数在值被发射后，在错误被发射后，在完成信号被发射后执行。有时，我们忽略对错误、完成信号的处理，仅仅关注对值的处理。

## Observable、Observer和Subscription

在Rx中，流是被观测的主体，处理流的函数是观测者，对流进行监听，称为订阅。在Rxjs中，流用Observable表示，表示可以被观察的对象；处理流的函数用Observer表示，表示观察者；而连接两者的便是订阅subscribe，这种订阅关系称为Subscription。

Rxjs的Observable是观察者模式和迭代器模式的组合，是基于推送（push）的运行时执行（lazy）的多值集合。Observable是多数据值的生产者，向Observer（被动的消费者）推送数据。

- **函数**调用后同步计算并返回单一值
- **生成器函数|遍历器**遍历过程中同步计算并返回0个到无穷多个值
- **Promise**异步执行返回或者不返回单一值
- **Observable**同步或者异步计算并返回0个到无穷多个值

Observable在执行过程中，可以推送三种类型的值：

- "Next"通知：实际产生的数据，包括数字、字符串、对象等
- "Error"通知：一个JavaScript错误或者异常
- "Complete"通知：一个不带有值得事件

在Observable的执行过程中，0个或者多个"Next"通知会被推送，在错误或者完成通知被推送后，Observable不会再推送任何其它通知。

**例**：当source$被订阅后，会立即（同步地）推送1，2，3三个值；1s之后，继续推送4这个值，最后推送结束通知；如若过程中出错，则推送错误信息：

```js
import { Observable } from 'rxjs'

// 构建一个可观察对象/数据流
const source$ = new Observable(observer => {
    try {
        observer.next(1)
    	observer.next(2)
        observer.next(3)
        setTimeout(() => {
            observer.next(4)
            observer.complete()
        }, 1000)
    } catch (err) {
        observer.error(err)
    }
})
```

为得到source$推送的值，需要订阅（subscribe）source$。subscribe是Observable的实例成员函数，subscribe可以接受一个Observer对象作为参数，可以包含next、complete和error三个方法，用于接受Observable的三种不同事件，如果我们根本不关心某种事件的话，也可以不实现对应的方法；subscribe同时支持直接接受函数作为参数，第一个函数参数用于处理next通知，第二个函数参数用于处理error通知，第三个函数参数用于处理complete通知：

```js
console.log('start')
const subscription = source$.subscribe({
    next: value => console.log(value),
    error: err => console.error(err),
    complete: () => console.log('done')
})
// 等价于↓
const subscription = source$.subscribe(
    console.log,
    console.error,
    () => console.log('done')
)
console.log('end')
```

程序执行后，将在控制台输出如下结果：

```js
start
1
2
3
end
4
done
```

Observable的执行可能是无限的，作为观察者需要主动中断执行：我们需要特定的API去终止执行过程。因为特定的观察者都有特定的执行过程，一旦观察者获得想要的数据后就需要终止执行过程以免带来计算时对内存资源的浪费。在`source$.subscribe`被调用时，观察者会与其执行作用域绑定，同时返回一个`Subscription`类型的对象，Subscription对象表示执行过程，通过调用subscription.unsubscribe即可终止执行过程，取消订阅：

```js
subscription.unsubscribe()
```

## Hot Observable 和 Cold Observable

Observable 有 Cold 和 Hot 之分。

Hot Observable 无论有没有 Observer 订阅，事件始终都会发生。当 Hot Observable 有多个订阅者时，Hot Observable 与订阅者们的关系是一对多的关系，可以与多个订阅者共享信息。点击事件、ajax事件生成的Observable就是Hot Observable，无论只有多少个订阅者，始终只有一个数据发射者。

Cold Observable 只有 Observer 订阅时，才开始执行发射数据流的代码。并且 Cold Observable 和 Observer 只能是一对一的关系，当有多个不同的订阅者时，消息是重新完整发送的。也就是说对 Cold Observable 而言，有多个 Observer 的时候，他们各自的事件是独立的。上文的示例就是Cold Observable ，每次订阅都会从头发射出1、2、3，隔1s发射4然后complete。

