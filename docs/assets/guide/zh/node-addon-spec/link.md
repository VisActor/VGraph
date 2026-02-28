# 链接组件

自定义节点是图可视化应用研发最大的痛点之一。vGraph 总结了业务中常用的自定义节点组件抽象成可配置的工具方法，帮助大家解决一些不方便实现的视觉效果。

在节点上展示链接，用于做数据详情跳转等是一个常见需求。vGraph 封装了链接的视觉和交互，通过轻松配置就可以获得接近 html UI 的体验。可参考示例[带链接的节点](/vgraph/demo/nodes/linkNode)。

<img src="/vgraph/guide/node/link_node.gif" width="600">

```jsvascript
import { LinkUtils } from '@visactor/vgraph';

// container 是标签容器，一般情况下是节点自定义传入的参数 Layer
const container = new Layer({...});

// 生成链接
const linkLayer = LinkUtils.init(container, linkOption);
```
| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| x        | number | \[必填\] 链接文本的横坐标，根据 align 不同表现不同 |
| align       | 'left' \| 'center' \| 'right' | 链接对齐方式 |
| y        | number | \[必填\] 链接文本中心的纵坐标 |
| text       | string |  \[必填\] 链接文本 |
| onClick        | (e: LayerEvent) => void; |  \[必填\] 点击链接事件 |
| disabled        | boolean | 是否是禁用样式 |
| maxWidth        | number | 链接的最大长度 |
| defaultColor    | string | 默认状态下链接颜色 |
| hoverColor    | string | 鼠标悬停链接的颜色 |
| activeColor    | string | 点击链接的颜色 |
| disabledColor    | string | 禁用链接的颜色 |
| triggerId        | string | 能与原生和 React 组件 Tooltip 配合使用触发提示 |
| cursor        | string | 鼠标悬停的鼠标样式 |
| icon | { icon: string; size?: number; } | 定义链接前方 icon  |
| label | TextConfigs | 定义链接文本样式，详情可见[文本图形配置项](/vgraph/guide/shape-spec/text#Text-配置项)  |
| underline | boolean \| { strokeStyle?: string; lineDash?: number[]; } | 链接下划线设置 |