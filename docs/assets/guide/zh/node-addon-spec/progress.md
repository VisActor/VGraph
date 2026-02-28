# 进度条工具

自定义节点是图可视化应用研发最大的痛点之一。vGraph 总结了业务中常用的自定义节点组件抽象成可配置的工具方法，帮助大家解决一些不方便实现的视觉效果。

进度条顾名思义多用于可视化地展示进行中事件的进度，完成度等。vGraph 封装了普通进度条和环形进度条两种样式，同时添加了更新动画的能力，做到了可以媲美原生 UI 的视觉体验。可以参考示例[进度条节点](/vgraph/demo/nodes/progreessNode)


```javascript
import { ProgressUtils, Layer } from '@visactor/vgraph';

// container 是标签容器，一般情况下是节点自定义方法 shape 中传入的参数 Layer
const container = new Layer({...});

// 生成进度条
const progressLayer = ProgressUtils.init(container, progressOptions);

// 更新进度条，推荐在节点自定义方法 updateShapes 里执行
ProgressUtils.update(progressLayer, updateOptions);
```
## 进度条初始化配置

| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| x        | number | \[必填\] 进度条水平定位，水平进度条为最左侧坐标，环形进度条为圆心横坐标 |
| y        | number | \[必填\] 进度条垂直定位，水平进度条为中心纵坐标，环形进度条为圆心纵坐标 |
| percent  | number | \[必填\] 进度数据，应为 0-1 之间 |
| width        | number | \[必填\] 进度条图形的长度 |
| lineWidth        | number | 进度条的宽度 |
| type        | 'line' \| 'circle' | 进度条类型 |
| color        | string | 进度条颜色 |
| trailColor        | string | 剩余进度条的颜色 |
| lineCap        | 'butt' \| 'round' \| 'square' | 连线端点样式，默认是 round |
| label       |  | 文本配置。默认水平进度条文本在右侧，而环形进度条在环中间 |
| label.text   |  string  | 展示文字 |
| label.fillStyle   |  string  | 展示文字的颜色 |
| label.fontSize   |  number  | 展示文字的字号 |
| label.fontWeight   |  number  | 展示文字的字重 |
| label.lineHeight   |  number  | 展示文字的行高 |
| label.fontFamily   |  number  | 展示文字的字体 |
| label.width   |  number  | 展示文字的最大宽度 |
| label.textOverflow   |  'ellipsis' \| 'clip'  | 文本溢出处理方式，默认为 ellipsis |
| label.triggerId   |  string  | 用于与 Tooltip 等组件配合使用 |

## 进度条更新配置
| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| percent  | number | \[必填\] 进度数据，应为 0-1 之间 |
| updateLabel     | (percent: number) => string | 如果在初始化配置了文本，这个方法可以同步在动画中更新文本 |
| animate     | boolean \| AnimateConfigs | 更新动画配置 |
| animate.duration     | number | 动画执行时长，单位是 ms |
| animate.easing     | 'easelinear' \| 'easeCubic' \| 'easePoly' \| 'easeQuad' \| 'easeSin' | 动画执行方式 |
| animate.onFinish     | () => void | 动画执行完成回调 |
