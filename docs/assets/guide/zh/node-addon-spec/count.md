# 数量统计牌
vGraph 精心设计关系图中的常用交互并沉淀成工具方便复用。数量统计牌多用于树图中节点收起子节点时显示收起节点数量，数量统计牌工具会根据文本长度自适应计算，点击数量可再次展开子节点。可以在[紧凑树收起展开](/vgraph/demo/practiceCases/CompactBox)体验。


``` javascript
import { CountBadgeUtils } from '@visactor/vgraph';
// 初始化 node 的统计牌
badgeLayer = CountBadgeUtils.init(node, options);
// 销毁 node 上对应统计牌
CountBadgeUtils.remove(node, badgeLayer);
```
数量统计牌配置如下：

| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| text        | string | \[必填\] 统计牌上显示的文本 |
| position        | 'left' \| 'right' \|  'top' \| 'bottom' | 统计牌的定位。目前支持在节点的上下左右四个方向。默认为右侧。 |
| color        | string | 统计牌主题色 |
| label        |  | 统计牌文本样式配置 |
| label.fillStyle        | string  | 统计牌文本颜色 |
| label.fontSize        | number | 统计牌文本字号 |
| label.fontFamily        |  string | 统计牌文本字体 |
| background        |  | 统计牌文本背景配置 |
| background.fillStyle        | string | 统计牌文本背景颜色 |
| background.strokeStyle        | string | 统计牌文本边框颜色 |
| background.radius       |  number | 统计牌文本边框圆角 |
| onMouseEnter       | (e: GraphEvent) => void | 鼠标移入统计牌事件 |
| onMouseLeave       | (e: GraphEvent) => void | 鼠标移出统计牌事件 |
| onClick       | (e: GraphEvent) => void | 统计牌点击事件 |
