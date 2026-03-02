# 角标工具

自定义节点是图可视化应用研发最大的痛点之一。vGraph 总结了业务中常用的自定义节点组件抽象成可配置的工具方法，帮助大家解决一些不方便实现的视觉效果。

角标多用于展示数据异常或者需要关注的补充信息。vGraph 封装了角标的定义工具，并可以配合自带的 Tooltip 等组件一同使用达到更好的提示体验。可以参考示例[角标节点](/graphs/nodes_noteNode)

```javascript
import { NoteMarkerUtils, Layer } from '@visactor/vgraph';

// container 是标签容器，一般情况下是节点自定义传入的参数 Layer
const container = new Layer({...});

// 生成角标
const markerLayer = MarkerUtils.init(container, markerOption);
```


| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| width        | number | \[必填\] 角标长度 |
| height        | number | \[必填\] 角标高度 |
| position       | 'left' \| 'right' |  角标相对于节点的位置，目前支持左上和右上方向 |
| radius        | number | 自定义角标的圆角 |
| triggerId        | string | 能与原生和 React 组件 Tooltip 配合使用触发提示 |