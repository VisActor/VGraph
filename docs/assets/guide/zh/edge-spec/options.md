# 连线配置

连线用于标识节点之间存在的关系及关系的逻辑（例如关系的方向、关系的强度等），通常由一个 source （起始节点）以及一个 target （目标节点）进行控制。

> 连线状态和关系是连线构建后具有的属性，可以通过实例方法进行操作。
> 关键图形 KeyShape 和 状态 States 定义如下：
>
> - 关键图形 KeyShape: 可以认为是连线的骨架架构，用于界定连线的路径，包括事件捕获，节点控制等依据。使用详情可见 [关键图形](/vgraph/guide/keyshape) 一节。
> - 状态 States: 连线状态可以认为是在连线位置不变，外观发生改变的场景下使用的简便方法。使用详情可见 [状态管理](/vgraph/guide/states) 一节。


vGraph 内置了9种连线类型，内置连线类型具有如下的通用配置项。

## 配置项

| 字段         | 类型                                                         | 描述                                                         |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| source       | string                                                       | **\[必填\]** 连线的来源节点 id                               |
| target       | string                                                       | **\[必填\]** 连线的去向节点 id                               |
| type         | 'line' \| 'hLIne' \| 'vLine' \| 'turningLine' \| 'quadratic' \| 'cubic' \|  'loop' \|  'hCubic' \| 'vCubic' \| ... | 连线类型。vgraph 内置了 9 种类型的连线，用户也可以基于这些连线类型扩展引用。默认值为 'line'。详情见[ 内置连线](/vgraph/guide/edge-spec/prebuilt) |
| id           | string                                                       | 连线唯一标识                                                 |
| startArrow   | ArrowType                                                     | 连线的初始端箭头                                             |
| endArrow     | ArrowType                                                     | 连线的末端箭头                                               |
| hitWidth     | number                                                       | 连线热区 (px)。用于扩充连线作用区域，以免用户很难与连线交互。 |
| strokeStyle  | string                                                       | 连线颜色                                                     |
| label        | string \| LabelConfigs                                        | 标签文本配置。若为 string，默认位置在连线中心。具体请见[ Label 配置](/vgraph/guide/edge-spec/options#Label-配置) |
| sourceAnchor | number                                                       | 指定连线连接的 source 节点锚点的 index                       |
| targetAnchor | number                                                       | 指定连线连接的 target 节点锚点的 index                       |

## Label 配置

| 字段         | 类型                                                         | 描述                                                         |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| text         | string                                                       | **\[必填\]** 文本标签内容                                    |
| width        | number                                                       | 限制文本最大宽度                                             |
| height       | number                                                       | 限制文本最大高度                                             |
| fillStyle         | string                                                       | 文本颜色             |
| strokeStyle         | string                                                       | 文本描边颜色             |
| lineWidth         | number                                                       | 文本描边宽度           |
| background         |  RectConfigs                      | 文本背景，定位由文本决定，可以配置 padding 指定外壳的大小。其余样式配置可参考[矩形配置](/vgraph/guide/shape-spec/rect)          |
| autoRotate   | boolean                                                      | 文字是否随连线自动旋转，默认 false。    |
| capture   | boolean           | 自动旋转的 label 在数据量很大时可能拾取效率不好，这时候建议设置 capture 为 false, 通过扩大连线的 hitWidth 来响应事件。         |
| position     | number                                                       | 文字位置相对于连线长度的比例，默认标签在连线中点，position 为 0.5 |
| fontSize     | number                                                       | 文本字号，默认 12                                            |
| lineHeight   | number                                                       | 行高                                                         |
| fontWeight:  | 'normal' \| 'bold' \| 'bolder' \| 'lighter' \| 'number'      | 字重                                                         |
| textOverflow | 'clip' \| 'ellipsis'                                         | 文本溢出处理，截断或省略                                     |
| textAlign    | 'start' \| 'center' \| 'end' \| 'left' \| 'right'            | 文本对齐方式                                                 |
| textBaseline | 'top' \| 'hanging' \| 'middle' \| 'alphabetic' \| 'ideographic' \| 'bottom' | 文本基线位置，默认 ’middle'                                  |
| fontStyle    | 'normal' \| 'italic' \| 'oblique'                            | 文本样式                                                     |
| fontFamily   | string                                                       | 字体                                                         |
| offsetX      | number                                                       | 文本在默认位置下的横向偏移量 (px)                            |
| offsetY      | number                                                       | 文本在默认位置下的纵向偏移量 (px)                            |
| fillStyle    | string                                                       | 文本填充颜色                                                 |
| strokeStyle  | string                                                       | 文本描边颜色                                                 |

节点都具有唯一的 KeyShape，因此也继承了 KeyShape 的公共配置项。**注意:** KeyShape 配置项的属性和通用配置项的属性是同级的。KeyShape 配置的使用优先级高于节点配置项（比如 color 的配置）。以下为图形对象的公共配置项：

| 字段          | 类型                 | 描述                                                                                                                                                                                                                  |
| ------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| opacity       | number               | 透明度                                                                                                                                                                                                                |
| fillStyle     | string               | 填充色                                                                                                                                                                                                                |
| cursor        | string               | 鼠标指针悬停在元素上时显示相应样式，可参考[CSS.cursor](https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor#syntax)                                                                                                |
| strokeStyle   | number \| number\[\] | 描边颜色                                                                                                                                                                                                              |
| lineWidth     | number               | 描边宽度                                                                                                                                                                                                              |
| lineDash      | number \| number\[\] | 划线模式，可参考[CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)                                                                       |
| shadowBlur    | number               | 阴影模糊量，可参考[CanvasRenderingContext2D.shadowBlur](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur)                                                                         |
| shadowColor   | string               | 阴影色                                                                                                                                                                                                                |
| shadowOffsetX | number               | 阴影水平偏移量，可参考[CanvasRenderingContext2D.shadowOffsetX](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX)                                                               |
| shadowOffsetY | number               | 阴影垂直偏移量，可参考[CanvasRenderingContext2D.shadowOffsetY](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY)                                                               |
| clip          | ShapeBase            | 裁剪形状，将指定形状设置为裁剪路径，位于该裁剪形状路径范围内的部分将会保留，其余部分会被剔除，可参考[CanvasRenderingContext2D.clip()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clip) |
| cursor        | string             | 当该形状获得光标焦点时，光标的类型。详情参考[CSS Cursor](https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor)                                                                                                     |

> 注：颜色字符串目前可支持以下格式：rgb, rgba, hsl, hsla, hex(3,6,8 位十六进制数), name, linear gradient, radial gradient 以及 picture 等。

## 箭头配置
连线支持在起始和终止位置添加箭头，对应 startArrow 和 endArrow 配置项。当 startArrow 或 endArrow 被指定为 undefined，null 或 false 时，将不绘制任何箭头，当指定为 true 时，绘制默认的三角箭头，箭头配置项 ArrowType 定义如下：

```typescript
type ArrowType = boolean | {
  type?: 'default' | 'default-round',
  width?: number,
  height?: number,
};
```

| 字段   | 类型   | 描述                                                                 |
| ------ | ------ | -------------------------------------------------------------------- |
| type   | string | 箭头类型，default 为默认三角形箭头，default-round 为圆角的三角形箭头 |
| width  | number | 箭头翼展宽度                                                         |
| height | number | 箭头于终点处的切向高度                                              |
