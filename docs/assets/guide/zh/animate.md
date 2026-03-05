# 动画

动画是图分析应用的重要组成部分，动画的巧妙运用能极大提升应用的使用效率和用户体验。vGraph 封装了图分析中常用的动画效果，用户可以直接引用。也提供通用的动画接口，可以灵活自定义任何动画。

vGraph 封装的动画接口 `animate(options) => string;` 会返回一个动画 id 可用于终止动画。封装配置由以下四部分组成：
- 动画对象 `target`: 具体的节点/连线实例；
- 动画类型 `type`: 指定执行的封装动画的种类；
- 自定义配置 `custom`: 根据动画类型不同自定义配置也不同；
- 通用配置 `common`: 动画时长，动效等通用配置。


## 节点发散动画 diffuse
节点扩散动画常用于突出展示一个或多个节点。可以是无限动画，例如[此案例](/vgraph/demo/animate/diffuse)中用于进行异常节点的告警。也可以是有限动画做轻量的节点聚焦。
```javascript
graph.animate({
  target: node,
  type: 'diffuse',
  custom: {...},
  common: {...}
});
```

**custom 配置项**

| custom 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| fillStyle | string | 扩散形状的填充色， 默认是节点配置的 color |
| strokeStyle | string | 扩散形状的线条色， 默认是 null |
| opacity | number | 扩散形状的透明度，默认是 0.3 |
| size| number\[\] | 扩散形状的最大尺寸，默认在节点原大小的基础上四边扩散出 10px |

**common 配置项**

| common 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| duration | number | 单次动画持续时长(ms), 默认 400 |
| repeat | boolean \| number | 重复是否重复，当配置 number 时表示动画重复次数。默认 2 |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | 动画效果，默认为 'easelinear' |
| onFinish | () => void; | 动画结束回调 |

## 节点加载动画 loading
节点加载动画常用在单个节点数据请求等待时做用户友好的过渡。例如[此案例](/vgraph/demo/animate/loading)中请求数据刷新节点到状态更新节点之间等待动画。
```javascript
graph.animate({
  target: node,
  type: 'loading',
  custom: {...},
  common: {...}
});
```

**custom 配置项**

| custom 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| x | number | 加载圆环圆心的横坐标, 默认为节点中心 0 |
| y | number | 加载圆环圆心的纵坐标, 默认为节点中心 0 |
| r | number | 加载圆环的半径，默认为 8px |
| lineWidth | number | 加载圆环的厚度, 默认为 2px |
| color | string | 加载圆环的颜色 |
| mask | boolean \| Record<string, any> | 背景蒙版配置，可参考 [rect 配置](/vgraph/guide/shape-spec/rect) |


**common 配置项**

| common 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| duration | number | 单次动画持续时长(ms), 默认 1000 |
| repeat | boolean \| number | 重复是否重复，当配置 number 时表示动画重复次数。默认 true |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | 动画效果，默认为 'easelinear' |
| onFinish | () => void; | 动画结束回调 |

## 节点闪烁动画 flash
节点闪烁动画常用在轻量聚焦单个节点，例如[此案例](/vgraph/demo/animate/flash)中查找节点功能会将节点移动到视窗中心，并用闪烁动画进行轻量的聚焦。但不推荐设置为无限动画。

```javascript
graph.animate({
  target: node,
  type: 'flash',
  custom: {...},
  common: {...}
});
```

**custom 配置项**




custom 配置内容为节点的[关键图形](/vgraph/guide/keyshape)样式，flash 动画进行过程中会应用这些样式，在动画结束后恢复原状。图形样式配置可参考 [rect 配置](/vgraph/guide/shape-spec/rect)。
**注**：custom 适合与 `graph.stopAnimate()`配合做简单样式调整的无限动画，能便利的自动恢复动画前的连线状态。如果是执行单次动画并且需要将动画状态保留下来直到鼠标移出的情况适合与 `setState` 结合使用来实现，可参考[此案例](/vgraph/demo/animate/grow)。


**common 配置项**




| common 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| duration | number | 单次动画持续时长(ms), 默认 400 |
| repeat | boolean \| number | 重复是否重复，当配置 number 时表示动画重复次数。默认 2 |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | 动画效果，默认为 'easelinear' |
| onFinish | () => void; | 动画结束回调 |

## 虚线连线动画 flow
虚线连线动画能生动的展示出数据的关系走向，适合配合一些交互做无限动画。例如[此案例](/vgraph/demo/animate/flow)中 hover 节点时对整条相关数据链路应用此动画。

```javascript
graph.animate({
  target: edge,
  type: 'flow',
  custom: {...},
  common: {...}
});
```

**custom 配置项**
custom 配置内容为节点的[关键图形](/vgraph/guide/keyshape)样式，flash 动画进行过程中会应用这些样式，在动画结束后恢复原状。图形样式配置可参考 [rect 配置](/vgraph/guide/shape-spec/path)。



| custom 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| strokeStyle | string | 动画时连线颜色，默认为 #3073FF |
| lineDash | number\[\] | 虚线样式，可参考[CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)。默认为 \[4, 2\]     |


**common 配置项**

| common 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| duration | number | 单次动画持续时长(ms), 默认 400 |
| repeat | boolean \| number | 重复是否重复，当配置 number 时表示动画重复次数。默认 为 true |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | 动画效果，默认为 'easelinear' |
| onFinish | () => void; | 动画结束回调 |


## 连线延伸动画 grow
连线延伸动画适合展示节点的直接关联关系，可以做单次动画也可以做无限动画。例如[此案例](/vgraph/demo/animate/grow)中 hover 节点时配合 state 机制对全部以此节点为起点的连线应用单次动画。

```javascript
graph.animate({
  target: edge,
  type: 'grow',
  custom: {...},
  common: {...}
});
```

**custom 配置项**


custom 配置内容为节点的[关键图形](/vgraph/guide/keyshape)样式，flash 动画进行过程中会应用这些样式，在动画结束后恢复原状。图形样式配置可参考 [rect 配置](/vgraph/guide/shape-spec/path)。
**注**：custom 配置适合与 `graph.stopAnimate()`配合做简单样式调整的无限动画，能便利的自动恢复动画前的连线状态。如果是执行单次动画并且需要将动画状态保留下来直到鼠标移出的情况适合与 `setState` 结合使用来实现，可参考[本案例](/vgraph/demo/animate/grow)。
<br />
<br />

**common 配置项**

| common 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| duration | number | 单次动画持续时长(ms), 默认 800 |
| repeat | boolean \| number | 重复是否重复，当配置 number 时表示动画重复次数。默认 为 1。 |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | 动画效果，默认为 'easelinear' |
| onFinish | () => void; | 动画结束回调 |


## 连线轨迹动画 trail
连线轨迹动画适合展示数据的关系走向，可以做单次动画也可以做无限动画，可用于流水线的运行展示等。例如[此案例](/vgraph/demo/animate/trail)中对连线定义的无限动画。

```javascript
graph.animate({
  target: edge,
  type: 'trail',
  custom: {...},
  common: {...}
});
```

**custom 配置项**

| custom 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| length | number | 光点长度, 默认 30(px) |
| getColorStops | (ratio: number) =>  {stop: number, color: string}[] | 光点的渐变色, stop 范围 0-1, color 为对应百分比的颜色。配置同[createLinearGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)。|

<br />

**common 配置项**

| common 配置项      | 类型   | 描述                                     |
| ----------- | ------ | ---------------------------------------- |
| duration | number | 单次动画持续时长(ms), 默认 800 |
| repeat | boolean \| number | 重复是否重复，当配置 number 时表示动画重复次数。默认 为 1。 |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | 动画效果，默认为 'easelinear' |
| onFinish | () => void; | 动画结束回调 |
