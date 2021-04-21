# 操作符基础及Rxjs 6

任何⼀种Reactive Extension的实现，都包含⼀个操作符的集合。⼀个操作符是返回⼀个
Observable对象的函数 。操作符其实就是解决某个具体应⽤问题的模式。 当我们要⽤RxJS解决问题时，⾸先需要创建Observable对象，于是需要创建类操作符；当需要将多个数据流中的数据汇合到⼀起处理时，需要合并类操作符；当需要筛选去除⼀些数据时，需要过滤类操作符；当希望把数据流中的数据变化为其他数据时，需要转化类操作符；⽽对数据流的处理可能引起异常，所以为了让程序更加强壮，我们需要异常处理类操作符；最后，要让⼀个数据流的数据可以提供给多个观察者，我们需要多播类操作符。

## 操作符分类

根据不同的维度，操作符也有不同的分类⽅式。

### 功能分类

根据功能，操作符可以分为以下类别：

1. 创建类：create、of、empty、never、from、interval、time、fromEvent等
2. 转化类：map、mapTo、pluck等
3. 过滤类：filter、skip、first、last、take、throttle、debounce等
4. 合并类：concat、merge、zip、combineLatest等
5. 多播类：multicast、publish、share等
6. 异常处理类：throw、catchError、retry、finalize等
7. 条件执行类：takeUntil，delayWhen、retryWhen等
8. 辅助类：tap、count、reduce、max等

### 静态和实例分类

除了按照功能分类之外，操作符还可以从存在形式这个⽅⾯来分类具体来说，就是操作符的实现函数和Observable类的关系。
所有的操作符都是函数，不过有的操作符是Observable类的静态函数，也就是不需要Observable实例就可以执⾏的函数，所以称为“静态操作符”；另⼀类操作符是Observable的实例函数，前提是要有⼀个创建好的Observable对象，这⼀类称为“实例操作符” 。

⼀个操作符应该是静态的形式还是实例的形式， 完全由其功能决定。⽆论是静态操作符还是实例操作符，它们都会返回⼀个Observable对象。在链式调⽤中，静态操作符只能出现在⾸位，实例操作符则可以出现在任何位置，因为链式调⽤中各级之间靠Observable对象来关联，⼀个静态函数在链式调⽤的中间位置是不可能有容⾝之处的。

## Rxjs 6

RxJs 6于2018年4月24日正式发布，RxJS 6在拥有更小API的同时，带来了更整洁的引入方式。

### import 路径

Rxjs 6模块化更加清晰：

- `rxjs`：创建方法、类型、调度程序和工具库。

```js
import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs'
```

- `rxjs/operators`：操作符

```js
import { map, filter, scan } from 'rxjs/operators'
```

- `rxjs/webSocket`：webSocket subject 实现

```js
import { webSocket } from 'rxjs/webSocket'
```

- `rxjs/ajax`：Rx ajax实现

```js
import { ajax } from 'rxjs/ajax'
```

- `rxjs/testing`：Rxjs的测试工具库

```js
import { TestScheduler } from 'rxjs/testing'
```

### 管道操作pipeline

Rxjs 6 要求使用新的管道操作符语法替换旧有的链式操作。上一个操作符方法的结果会被传递到下一个操作符方法中。使用`pipe()`包裹所以的操作符方法，示例：

```js
import { range } from 'rxjs'
import { map, filter, scan, catchError } from 'rxjs/operators'

const source$ = range(1, 10)
source$.pipe(
  filter(x => x % 2 === 0), // 过滤出偶数
  map(x => x * x), // 求平方
  scan((acc, x) => acc + x, 0), // 累加
  catchError(err => console.error(err)) // 错误处理
).subscribe(console.log)
```

