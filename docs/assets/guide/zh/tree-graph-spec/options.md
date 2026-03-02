# 树图配置
树图 TreeGraph 接受嵌套结构的数据(详情请见[数据结构](/vgraph/guide/data-structure)小节)，通常用于树图，思维导图的展示和分析。一般用法如下：

```typescript
import { TreeGraph } from '@visactor/vgraph';

const graph = new TreeGraph(options);  // 树图配置项
graph.data(someData);              // 写入数据,一般情况下会直接渲染结果
```

## 配置项

由于树图一般都会带有展开收起的交互和对应的动画需求，想在进行数据操作时默认达到比较好的效果就需要指定图的布局方式和动画。因此 TreeGraph 除了 Graph 的配置外支持传入布局和动画配置，配合 TreeGraph 实例方法就能达到较好的效果。

| 字段                | 类型                           | 描述                                                         |
| ------------------- | ------------------------------ | ------------------------------------------------------------ |
| layout             |  { type: string, options: LayoutOptions } \| LayoutBase      |   \[NEW\] 指定图布局类型和自定义配置项，或直接传入布局实例指定图布局。详情请见 [TreeLayout](/vgraph/guide/tree-graph-spec/options#TreeLayout) 小节     |
| animate | Boolean \| AnimateConfigs | 布局变化时的动画效果。详情请见 [Animation](/vgraph/guide/tree-graph-spec/options#Animation) 小节                |
| fitViewAfterLayout | Boolean  |  是否先将图形缩放到适合视窗大小后再进行动画。默认为 true         |
| container           | DOMNode \| string              | \[必填\]图容器，可以是 dom 节点，也可以是 dom 对应的 id              |
| width               | number                         | \[必填\]设置图宽度                                             |
| height              | number                         | \[必填\]设置图高度                                             |
| renderMode              | 'canvas' \| 'dom'                       |  \[NEW\] 指定使用 canvas 还是外置 dom 组件渲染节点。默认为`canvas`。用于配合 vgraph-react 或 vgraph-vue 使用。            |
| autoLayout             |  boolean  |   \[NEW\] 自动布局开关，默认打开。则当调用 graph 上方法增删改节点后会自动刷新布局。建议批量增删改时临时关闭以提高性能。      |
| setDefaultNode      | (nodeData) => NodeConfigs      | 批量设置图中节点配置，具体配置项请见[节点配置项](/vgraph/guide/node-spec/options) |
| setNodeStateStyles  | (nodeData) => keyShapeStyles | 设置图中节点 keyShape 在特定状态下的样式                               |
| setDefaultEdge      | (edgeData) => StateConfigs     | 批量设置图中连线的配置，具体配置项请见[连线配置项](/vgraph/guide/edge-spec/options)                 |
| setEdgeStateStyles  | (edgeData) => keyShapeStyles     | 设置图中连线 keyShape 在特定状态下的样式                               |
| setDefaultGroup     | (groupData) => GroupConfigs    | 批量设置图中分组的配置，具体配置项请见[分组配置项](/vgraph/guide/group-spec/options)                 |
| setGroupStateStyles | (groupData) => keyShapeStyles    | 设置图中分组 keyShape 在特定状态下的样式                               |
| padding    | number \| number[] | 指定图边缘留白，用于视口自适应等情况                                                       |
| minRatio   | number             | 指定图的最小缩放比                                           |
| maxRatio   | number             | 指定图的最大缩放比                                           |
| autoDraw   | boolean            | 是否在更新图设置/调用实例方法后自动重绘。默认为 true。当进行批量操作时先置为 false ，操作后主动绘制能提供更好的性能。 |
| linkCenter | boolean            | 连线是否直接连接到节点中心。默认为 false。批量计算连线的连接点有一定消耗。如果对节点与连线的连接点没有要求(不设置锚点 Anchor) 且当节点不透明时，置为 true 能提升性能。 |
| throwError | boolean            | 是否直接抛出异常，默认为 true。如果在生产环境，或认为一些异常是可以存在的，可以设置为 false。则异常信息将以 console.error 的形式提醒。 |


## TreeLayout

目前 vGraph 支持三种树布局方式。分别有两种指定方式如下：
```typescript
import { CompactBox, TreeGraph } from '@visactor/vgraph';

// 第一种直接在实例化时配置
const graph = new TreeGraph({
  layout: {
    type: 'compactBox',
    options: layoutOptions
  }
});

// 第二种直接实例化一个布局，传入 TreeGraph
const layout = new CompactBox(layoutOptions);

const graph = new TreeGraph({
  layout,
  ...graphOptions,
});
```

| 布局名称         | 布局效果                                                     | 特征                                                         | 适合场景                     |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------- |
| Dendrogram 平衡树 | ![img](/vgraph/guide/api/dendrogram.png#pic_center=300) | 不管树层级如何，总是叶节点对齐，非叶节点根据层级均匀分布     | 组织架构图，亲缘谱系图       |
| MindMap 脑图树    | ![img](/vgraph/guide/api/mindmap.png#pic_center=300) | 深度相同的节点将会被放置在同一层，每棵子树占用空间不会有交叉 | 数据归纳整理，头脑风暴       |
| CompactBox 紧凑树 | ![img](/vgraph/guide/api/compactbox.png#pic_center=300) | 从根节点开始，同一深度的节点在同一层，并且布局时会将节点大小考虑进去尽量节省空间 | 数据量大或展示空间不足的树图 |
| Indented 缩进树 | ![img](/vgraph/guide/api/indented-lr.png#pic_center=300) | 从根节点开始，同一深度的节点在同一层，父子之间排布更紧凑 | 文件夹等信息密集场景 |



除节点配置项 (**width**: 节点宽度, **height**: 节点高度, **collapsed**: 是否收起) 外，也支持如下参数自定义布局。

| 字段      | 类型                      | 描述                                                         |
| --------- | ------------------------- | ------------------------------------------------------------ |
| direction | `LR` \ `RL` \ `TB` \ `BT`  | 布局方向；`LR` 为从左到右布局， `RL` 为从右到左布局， `TB` 为从上到下布局，`BT`为从下到上布局。默认为`TB` 布局                            |
| nodeSep   | (nodeData: any) => number | 指定同层级节点之间的间距                                     |
| rankSep   | (nodeData: any) => number | 指定跨层级节点间距                                           |
| nodeSize  | (nodeData: any) => number | 指定节点大小。推荐在节点上直接配置 `width` 和 `height`       |
| radial    | boolean                   | 是否采用径向树分布。默认为 false。当单层节点特别多时推荐开启以获得更好的浏览体验。径向树分布时会在节点上写入 radial 辅助定义节点文本标签的旋转。具体可见[径向树布局示例](/vgraph/demo/tree/basic) |




## Animation
vGraph 提供精细的动画，默认配置为 `true`，在图初始化，收起节点，展开节点的时候提供默认的动画效果。也可以通过以下配置项来自定义。

| 字段     | 类型       | 描述                                                         |
| -------- | ---------- | ------------------------------------------------------------ |
| duration | number     | 动画持续时间 (ms) ，默认 500                                 |
| delay    | number     | 延迟一定时间 (ms) 开始执行动画                               |
| easing   | string     | 指定动画效果，默认是线性动画 `easelinear`。也支持 `easeCubic`, `easePoly`, `easeQuad`,`easeSin`, `easeExp`, `easeBounce`等多个效果满足特殊场景下的数据表现。 |
| repeat   | boolean    | 是否重复动画。默认为 `false`                                 |
| onFinish | () => void | 动画执行结束回调                                             |
