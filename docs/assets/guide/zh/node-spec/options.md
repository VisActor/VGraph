# 节点

节点由几大部分组成：

<img src="/vgraph/guide/node/NodeOverall.png" width = "80%" />

图形部分可在构建前通过配置项进行配置。节点的图形部分包含关键图形，其他图形和锚点。

vGraph 内置了 8 种常用节点，不同的内置节点定义了不同的关键图形 KeyShape 和其他图形 Shapes。详情请见[内置节点](/vgraph/guide/node-spec/prebuilt)小节。文本标签，图标和锚点为所有内置节点共有的配置项，默认都为空。标题和 image 只有特定内置节点可配置。

> 节点状态和关系是节点构建后具有的属性，可以通过实例方法进行操作。
> 关键图形 KeyShape 和 状态 States 定义如下：
>
> - 关键图形 KeyShape: 可以认为是节点的骨架架构，用于界定节点的主要范围，包括事件捕获，连线连接等的依据。使用详情可见 [关键图形](/vgraph/guide/keyshape) 一节。
> - 状态 States: 节点状态可以认为是在节点结构不变，外观发生改变的场景下使用的简便方法。使用详情可见 [状态管理](/vgraph/guide/states) 一节。

## 示例

```javascript
const graph = new Graph({
  container: 'div',
  width: 800,
  height: 600,
});
graph.add('node', {
  id: 'rect',
  type: 'rect',
  x: 70,
  y: 100,
  width: 100,
  height: 50,
  label: 'rect',
  icons: [{
      setStyles: (data: any) => {
        return {
          icon: '&#xe68c;',
          size: 25,
          cursor: 'pointer',
        };
      },
      position: [0.1, 0.5],
  }],
  radius: 25,
});
```

![img](/vgraph/guide/node/rect_icon.png)

也可以在数据中配置或者实例化图时全局配置:

```js
// 在数据中配置
const nodes = [{
    id:'rect',
    type:'rect',
    x: 70,
    y: 100,
    width: 100,
    height: 50,
    label:'rect',
    icons:...,
    anchors:...,
  },
  ...
]
// 或者实例化图时全局配置
const graph = new Graph({
    container: 'div',
    width: 800,
    height: 600,
    setDefaultNode: (node)=>{
      ...;
      return {...};
    };
});
```

## 通用配置项

| 字段    | 类型                                                                                          | 描述                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| id      | string                                                                                        | **\[必填\]** 节点的唯一标识，边引用节点的标识                                                                                              |
| type    | 'rect' \| 'circle' \| 'image' \| 'title' \| 'category' \| 'tag' \| 'capsule' \| 'icon' \| ... | 节点类型。vGraph 内置了 8 种类型的节点，用户也可以基于这些节点类型扩展引用。默认值为 'rect'。具体请见 [内置节点](/vgraph/guide/node-spec/prebuilt) |
| x       | number                                                                                        | 节点中心位置的横坐标                                                                                                                       |
| y       | number                                                                                        | 节点中心位置的纵坐标                                                                                                                       |
| width   | number                                                                                        | [必填] 节点的宽度                                                                                                                                 |
| height  | number                                                                                        | [必填] 节点的高度                                                                                                                                 |
| groupId | string                                                                                        | 节点所属的 group 的 Id                                                                                                                     |
| color   | string                                                                                        | 节点颜色，根据节点类型不同表现不同                                                                                                         |
| label   | string \| LabelConfigs                                                                        | 标签文本配置。若为 string，则根据节点类型不同摆放在默认位置。自定义配追具体请见下方[ LabelConfigs](/vgraph/guide/node-spec/options#LabelConfigs)   |
| icons   | IconConfigs[]                                                                                 | 设置节点上的图标数组。具体请见下方 [IconConfigs](/vgraph/guide/node-spec/options#IconConfigs)                                                      |
| disableIcons   | boolean        | 当 disableIcons 为 true 时，icon 将不会在 hover 时出现。            |
| anchors | number\[\]\[\] \| AnchorConfigs\[\]                                                           | 设置节点上的锚点。具体请见下方 [AnchorConfigs](/vgraph/guide/node-spec/options#AnchorConfigs)                                                      |
| disableAnchors   | boolean        | 当 disableAnchors 为 true 时，anchor 将不会在 hover 时出现。            |

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

### Label

内置节点均可配置 Label，不同节点可能会有不同的默认配置。

| 字段         | 类型                                                                        | 描述                             |
| ------------ | --------------------------------------------------------------------------- | -------------------------------- |
| text         | string                                                                      | **\[必填\]** 文本标签内容        |
| width        | number                                                                      | 限制文本最大宽度                 |
| height       | number                                                                      | 限制文本最大高度                 |
| fontSize     | number                                                                      | 文本字号，默认 12                |
| lineHeight   | number                                                                      | 行高                             |
| fontWeight:  | 'normal' \| 'bold' \| 'bolder' \| 'lighter' \| _number_                     | 字重                             |
| textOverflow | 'clip' \| 'ellipsis'                                                        | 文本溢出处理，截断或省略         |
| textAlign    | 'start' \| 'center' \| 'end' \| 'left' \| 'right'                           | 文本对齐方式                     |
| textBaseline | 'top' \| 'hanging' \| 'middle' \| 'alphabetic' \| 'ideographic' \| 'bottom' | 文本基线位置，默认 ’middle'      |
| fontStyle    | 'normal' \| 'italic' \| 'oblique'                                           | 文本样式                         |
| fontFamily   | string                                                                      | 字体                             |
| offsetX      | number                                                                      | 文本在默认位置下的横向偏移量(px) |
| offsetY      | number                                                                      | 文本在默认位置下的纵向偏移量(px) |
| fillStyle    | string                                                                      | 文本填充颜色                     |
| strokeStyle  | string                                                                      | 文本描边颜色                     |
| padding  | number        |  文本和 keyShape 的间距，默认为 12               |
| rotate  | number        |  文本旋转弧度，例如 Math.PI / 2 为旋转 90°             |


#### label 示例

```js
const graph = new Graph({
  ...,
  setDefaultNode: (node)=>{
    ...
    label: {
        text: node.id,
        width: 100,
        fontSize: 11,
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: '#000',
        opacity: 1,
    },
  },
});
```

### Icons

业务场景下会有大量的节点 icon 辅助用户理解，给用户提供简洁的交互方式。vgraph 可以接受 [iconfont](https://www.iconfont.cn/), [Font Awesome](https://fontawesome.com/) 等字体文件形式的图标，应用到节点上。

icons 配置应当是一个 IconConfigs 数组。

#### IconConfigs

| 字段        | 类型                     | 描述                                                                                                                              |
| ----------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| setStyles   | (configs) => IconStyle   | **\[必填\]**icon 样式设置，参数为节点的配置信息。由于经常会有根据节点数据变换 icon 和样式的需求。回调函数模式能执行更高效的更新。 |
| setBgStyles | (configs) => IconBgStyle | icon 背景样式设置，参数为节点的配置信息。考虑到 icon 可能会因背景色导致看不清的情况，可以为 icon 添加一个圆形或矩形背景。         |
| position    | number []                | \[**必填**\]以节点左上角为 \[0, 0\]，右下角位置为 \[1, 1\] 的形式确定 icon 的位置。使得节点在缩放等情况时都能按预期显示图标。     |
| offset      | number[]                 | 横向和纵向的像素级偏移。可以往节点内部偏移，也可以是外部。                                                                        |
| show        | 'always' \| 'hover'      | 图标展示方式，默认常显。也可以设置为鼠标 hover 到节点时显示。                                                                     |
| onClick     | (e, nodeData) => void;   | Icon 点击事件回调                                                                                                                 |

#### IconStyles

icon 可配置的样式如下：

| 字段       | 类型   | 描述                                                              |
| ---------- | ------ | ----------------------------------------------------------------- |
| icon       | string | 图标引用代码，类似`&#xe77a;`                                      |
| fillStyle  | string | 图标填充色                                                        |
| size       | number | 图标尺寸，目前仅支持宽高一致的 icon                               |
| fontFamily | string | 字体文件需要先引用进来，并定义名称，在以下例子中应为 'iconfont'。 |

```css
@font-face {
  font-family: 'iconfont';
  src: url('');
}
```

#### IconBgStyles

icon 背景可配置的样式如下：

| 字段   | 类型                         | 描述                                                   |
| ------ | ---------------------------- | ------------------------------------------------------ |
| type   | 'rect' \| 'circle'           | **\[必填\]**背景形状，目前支持使用矩形或圆形。         |
| size   | number                       | 背景大小，默认与 icon 一致。                           |
| styles | RectConfigs \| CircleConfigs | 背景的样式配置信息，可以指定背景填充色、描边或阴影等。 |
#### icons 示例

```js
{
  ...,
	icons: [
    {
      setStyles: (data: any) => {
        return {
          icon: '&#xe68c;',
          size: 25,
          cursor: 'pointer',
        };
      },
      position: [0.2, 0.5],
    },
  ],
}
```

![img](/vgraph/guide/node/rect_icon.png)

可以看到 icon 在左边的位置产生了。

### Anchors

anchors （锚点）用于指定节点和连线的连接位置。如果不指定锚点，连线会计算两个节点之间的最短连线。锚点定位可以是一个二维数组，每个数组由两个数字组成，规定每个数组以节点左上角为 \[0, 0\]，右下角位置为 \[1, 1\] 的形式确定锚点的位置。锚点的位置应在 0 - 1 之间取值，定义如下：

```js
// 左图锚点
{
  ...,
  anchors: [
    [0.5, 0.0],
    [0.5, 1.0],
    [0.0, 0.5],
    [1.0, 0.5],
  ],
}
// 右图锚点
{
  ...,
  anchors: [
    [0.5, 0.0],
    [0.5, 1.0],
  ],
}
```

分别定义四个锚点和两个锚点效果如下。

<img src="/vgraph/guide/node/anchors.png" width = "50%" />

在不需要显示 anchor 图形的情况下简单配置位置数组即可。vGraph 也提供一个由配置项组成的数组，如果需要在节点上显示 anchor 图形请用这种方式配置。AnchorConfigs 配置项定义如下：
#### AnchorConfigs

| 字段         | 类型                       | 描述                                                                                                                         |
| ------------ | -------------------------- | s---------------------------------------------------------------------------------------------------------------------------- |
| type         | string                     | 锚点类型。默认 'dot'。                                                                                                       |
| position     | number\[\]                 | 长度为 2 的数组，用于指定锚点的相对位置。\[0, 0\] 为左上角，\[1, 1\] 为右下角       |
| offsets     | number\[\]                 | 长度为 2 的数组，用于指定锚点定位的绝对偏移像素值。       |
| linkOffsets     | number\[\]                 | 长度为 2 的数组，用于指定连线与锚点连接点的绝对偏移像素值。       |
| show         | 'always' \| 'hover'        | 锚点图形展示方式，默认常显。也可以设置为鼠标 hover 到节点时显示。                                                            |
| size         | number       | 自定义锚点的直径。目前仅支持宽高一致的锚点。                                |
| setStyles    | (nodeData) => AnchorStyles | 锚点样式设置。 fillStyle: string 配置填充色 strokeStyle: string 配置线条色。 |
| onClick      | (event, nodeData) => void  | 点击锚点时触发的事件。                                                                                                       |
| onMouseEnter | (event, nodeData) => void  | 鼠标移动到锚点时触发的事件。                                                                                                 |
| onMouseLeave | (event, nodeData) => void  | 鼠标移开锚点时触发的事件。                                                                                                   |

#### anchors 示例

```js
{
  anchors: [
    {
      show: 'hover',
      position: [0, 0.5],
      setStyles() {
        return { fillStyle: 'green' };
      },
    }, {
      position: [1, 0.5],
      setStyles() {
        return { fillStyle: 'green' };
      },
      onClick(e: any, nodeData: any) {
        console.log(e);
      }
    }
  ],
}
```

以上配置定义了两个 anchor，分别位于节点左右两侧，左侧锚点需要在节点获取到鼠标焦点时才会显示，而右侧锚点则定义了一个鼠标点击事件。

<img src="/vgraph/guide/node/anchor_configs.png" width = "50%" />