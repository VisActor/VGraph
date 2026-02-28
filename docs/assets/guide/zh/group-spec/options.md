## 分组
分组用于逻辑相同节点的示意或组织一系列的节点的批量操作。分组可嵌套，并可以指定分组内外节点如何连线以满足不同场景的展示需求。目前 vGraph 支持矩形的分组。

> 分组状态和关系是分组构建后具有的属性，可以通过实例方法进行操作。
> 关键图形 KeyShape 和 状态 States 定义如下：
>
> - 关键图形 KeyShape: 可以认为是分组的骨架架构，用于界定分组容器的主要范围，包括事件捕获，连线连接等的依据。使用详情可见 [关键图形](/vgraph/guide/keyshape) 一节。
> - 状态 States: 分组状态可以认为是在分组结构不变，外观发生改变的场景下使用的简便方法。使用详情可见 [状态管理](/vgraph/guide/states) 一节。


## 分组配置

| 字段        | 类型                                                         | 描述                                                         |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| id          | string                                                       | 分组唯一标识                                                 |
| groupId     | string                                                       | 分组可以嵌套，指定父分组 id                                  |
| padding     | number \| number[]                                           | 分组默认会包裹所有节点。可以指定区域的留白。可以按上右下左依次指定留白。 |
| linkNode    | boolean                                                      | 连线是否直接连到分组的内部节点上。默认 false                 |
| linkGroupOnCollapse    | boolean                | 当配置 linkNode: true 时，分组收起时会默认收起所有分组内节点的连线。配置 linkGroupOnCollapse 可以让分组收起时连线暂时连到分组上。效果可见[分组收起代理连线](/vgraph/demo/groups/linkGroupOnCollapse)        |
| titleSize    | number               |  \[NEW\] 分组标题尺寸，根据 `titlePosition` 配置不同会分别对应标题的宽或高。    |
| titlePosition   | 'left' \| 'top'                                                  | 分组标题位置，默认 `top` 在分组上方。    |
| title       | {// 标题文本,更多配置请见图形对象 - 文本 <br />    text: {     text: string;    ...textConfigs,  },<br />// 标题背景，可省略  <br />    background?: {    height?: number;    fillStyle?: string;    strokeStyle?: string;  },<br />// 右侧 icon，可省略  <br />icon?: {    icon: string;    fillStyle?: string;    size?: number;    onClick?: (e: any) => void;  } | vgraph 支持给分组设置一个文本标题，并配置背景                |
| anchors     | number\[\]\[\] \| AnchorConfigs[]                                  | 配置锚点。如果仅传位置数组，则不显示锚点图形。采用 Object 类型的配置会画出锚点图形。具体请见 [Anchor 配置](/vgraph/guide/group-spec/options#分组锚点) |
| renderGroupTitle | (group: Group, layer: Layer, width: number) => void       | 自行定义分组标题绘制方法。以 (0, 0) 为基准点绘制，默认占满分组的宽度，高度为配置的 titleSize。 |
| fixLeft    | number                                                     | 固定分组的左边缘        |
| fixTop    | number                                                     | 固定分组的上边缘        |
| fixWidth    | number                                                     | 固定分组的宽度        |
| fixHeight    | number                                                     | 固定分组的高度        |

分组都具有唯一的 KeyShape，因此也继承了 KeyShape 的公共配置项。**注意:** KeyShape 配置项的属性和通用配置项的属性是同级的。KeyShape 配置的使用优先级高于节点配置项（比如 color 的配置）。以下为图形对象的公共配置项：

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

## 分组标题
vGraph 总结了业务上常用分组的场景，提供了细致的配置，能满足绝大多数场景。其中标题文本必须，其他组成部分皆为可选。以下是一个完整配置分组的样例
```javascript
const groupData = {
  title: {
    // 标题文本配置
    title: {
      text: {
        text: '分组标题',
        lineHeight: 24,
        fontSize: 12,
        fillStyle: '#fff',
      },
      // 标题右侧 icon 配置，并定义点击事件 handler
      icon: {
        icon: collapseIcon,
        fillStyle: '#fff',
        onClick(e:any, group: Group) {
          if (group.get('collapsed')) {
            e.target.set('icon', collapseIcon);
            group.expand();
          } else {
            e.target.set('icon', expandIcon);
            group.collapse();
          }
        }
      },
      // 标题背景配置
      background: {
        height: 24,
        radius: [4, 4, 0, 0],
        fillStyle: '#3073F2'
      },
    },
    strokeStyle: '#E1E4E8',
    radius: 4,
  },
};
```


<p><img src="/vgraph/guide/api/default-group.gif" width="500"></p>




如果你的分组标题比较复杂，Group 支持配置 `renderGroupTitle` 来自定义标题内容。入参 `width`为标题当前的最大宽度，用于在分组盒模型发生变化时标题能自适应。需要返回标题高度以正确计算分组的定位。以下是一个居中 title 的简单实现。
```typescript
const groupData = {
  renderGroupTitle(group: Group, layer: Layer, width: number) {
    const text = new Text({
      // 标题居中
      x: width / 2,
      y: 12,
      text: '分组标题',
      fontSize: 14,
      textAlign: 'center',
      textBaseline: 'middle',
    });
    layer.add(text);
    // 返回标题高度
    return 24;
  },
  strokeStyle: '#E1E4E8',
  radius: 4,  
}

```
<p><img src="/vgraph/guide/api/customed-group.gif" width="500"></p>

## 分组锚点
锚点 (Anchor) 用于指定分组和连线的连接位置。如果希望连线直接连入到节点上，可以设置分组配置项 `linkNode: true`。如果不指定锚点，则会计算最短连线的连接点作为锚点。锚点定位可以是一个二维数组，每个数组由两个数字组成，规定每个数组以节点左上角为 \[0, 0\]，右下角位置为 \[1, 1\] 的形式确定锚点的位置。锚点的位置应在 0 - 1 之间取值。

在不需要显示 anchor 图形的情况下简单配置位置数组即可。vGraph 也提供一个由配置项组成的数组，如果需要在分组上显示 anchor 图形请用这种方式配置。AnchorConfigs 配置项定义如下：


| 字段         | 类型                       | 描述                                                                                                                         |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| type         | string                     | 锚点类型。默认 'dot'。                                                                                                       |
| position     | number\[\]                 | 长度为 2 的数组，用于指定锚点的相对位置。\[0, 0\] 为左上角，\[1, 1\] 为右下角       |
| offsets     | number\[\]                 | 长度为 2 的数组，用于指定锚点定位的绝对偏移像素值。       |
| linkOffsets     | number\[\]                 | 长度为 2 的数组，用于指定连线与锚点连接点的绝对偏移像素值。       |
| show         | 'always' \| 'hover'        | 锚点图形展示方式，默认常显。也可以设置为鼠标 hover 到节点时显示。                                                            |
| size        |  number    | 配置锚点的直径。目前仅支持宽高一致的锚点。                               |
| setStyles    | (nodeData) => AnchorStyles | 锚点样式设置。 fillStyle: string 配置填充色 strokeStyle: string 配置线条色。 |
| onClick      | (event, nodeData) => void  | 点击锚点时触发的事件。                                                                                                       |
| onMouseEnter | (event, nodeData) => void  | 鼠标移动到锚点时触发的事件。                                                                                                 |
| onMouseLeave | (event, nodeData) => void  | 鼠标移开锚点时触发的事件。                                                                                                   |