# 标签工具
自定义节点是图可视化应用研发最大的痛点之一。vGraph 总结了业务中常用的自定义节点组件抽象成可配置的工具方法，帮助大家解决一些不方便实现的视觉效果。



标签多用于自定义节点中，可配置含有业务含义的图标，也可以配置添加/关闭功能。可以生成单个标签，也可以生成一排标签，并自带溢出处理。可以在[带有标签的自定义节点](/vgraph/demo/nodes/customTagNode) 体验。

```javascript
import { TagUtils, Layer } from '@visactor/vgraph';

// container 是标签容器，一般情况下是节点自定义传入的参数 Layer
const container = new Layer({...});

// 生成单个标签
const tagLayer = TagUtils.initTag(container, tagOption);

// 移除单个标签
TagUtils.removeTag(tagLayer);
```


单个标签的配置如下：

| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| text        | string | \[必填\] 标签上显示的文本 |
| left        | number | \[必填\] 标签左上角横坐标 |
| top        | number | \[必填\] 标签左上角纵坐标 |
| maxWidth        | number | 标签最大宽度 |
| theme        | 'rect' \| 'capsule' | 标签样式，默认为矩形 |
| label        |  | 标签文本样式自定义 |
| label.fillStyle        | string  |标签文本颜色 |
| label.fontSize        | number | 标签文本字号 |
| label.lineHeight        | number | 标签文本行高 |
| label.triggerId       | string | 用于与 tooltip 绑定 |
| label.fontFamily        |  string | 统计牌文本字体 |
| background        |  | 标签背景配置 |
| background.fillStyle        | string | 标签背景填充色 |
| background.strokeStyle        | string | 标签背景边框颜色 |
| background.padding       |  number \| nunber\[\] | 标签四周留白 |
| background.radius       |  number | 标签边框圆角 |
| icon       |  number | 标签左侧图标配置 |
| icon.icon       |  string | 标签左侧图标的 iconfont 引用 |
| icon.fillStyle       |  number | 标签左侧图标颜色 |
| icon.size       |  number | 标签左侧图标尺寸 |
| icon.onClick       |  (e: GraphEvent, layer: Layer) => void | 标签左侧图标点击事件 |
| close       |  number | 标签右侧关闭图标配置 |
| close.icon       |  string | 标签右侧关闭图标的 iconfont 引用 |
|  close.fillStyle       |  number | 标签右侧关闭图标颜色 |
|  close.size       |  number | 标签右侧关闭图标尺寸 |
|  close.onClick       |  (e: GraphEvent, layer: Layer) => void | 标签右侧关闭图标点击事件 |


TagUtils 对单行多文本也有较好支持。可参考[可删除标签的节点](/vgraph/demo/nodes/customDeleteTagNode)
```javascript
import { TagUtils, Layer } from '@visactor/vgraph';

// container 是标签容器，一般情况下是节点自定义传入的参数 Layer
const container = new Layer({...});

// 生成多个标签
const tagsLayer = TagUtils.initTag(container, tagsOption);

// 移除单个标签
TagUtils.removeTag(tagLayer);

// 添加单个标签
TagUtils.addTag(tagsLayer, tagOption);
```

| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| left        | number | \[必填\] 标签左上角横坐标 |
| top        | number | \[必填\] 标签左上角纵坐标 |
| maxWidth        | number | 标签所在行最大宽度 |
| theme        | 'rect' \| 'capsule' | 标签样式，默认为矩形 |
| tags        | tagOption | 标签文本样式。配置参考单个标签配置，left,top 将自动计算无须传入。 |
| overflowTag        | tagOption | 溢出计数的标签样式。配置参考单个标签配置，left,top 将自动计算无须传入。 |
