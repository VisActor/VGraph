# 图配置

图 Graph 接受点边组结构的数据(详情请见[数据结构](/vgraph/guide/data-structure)小节)，通常用于有向图，力导图，网图等的展示和分析。一般用法如下：

```typescript
import { Graph } from '@visactor/vgraph';

const graph = new Graph(options);  // 图配置项
graph.data(someData);              // 写入数据,一般情况下会直接渲染结果
```

## 配置项

| 字段                | 类型                           | 描述                                                         |
| ------------------- | ------------------------------ | ------------------------------------------------------------ |
| container           | DOMNode \| string              | \[必填\]图容器，可以是 dom 节点，也可以是 dom 对应的 id              |
| width               | number                         | \[必填\]设置图宽度                                             |
| height              | number                         | \[必填\]设置图高度                                             |
| renderMode              | 'canvas' \| 'dom'                       |  \[NEW\] 指定使用 canvas 还是外置 dom 组件渲染节点。默认为`canvas`。用于配合 vgraph-react 或 vgraph-vue 使用。            |
| layout             |  { type: string, options: LayoutOptions } \| LayoutBase      |   \[NEW\] 指定图布局类型和自定义配置项，或直接传入布局实例指定图布局。布局种类和配置项详见「布局」。      |
| autoLayout             |  boolean  |   \[NEW\] 自动布局开关，默认打开。则当调用 graph 上方法增删改节点后会自动刷新布局。建议批量增删改时临时关闭以提高性能。      |
| setDefaultNode      | (nodeData) => NodeConfigs      | 批量设置图中节点配置，具体配置项请见[节点配置项](/vgraph/guide/node-spec/options) |
| setNodeStateStyles  | (state: string, nodeData: any, node: Node) => keyShapeStyles | 设置图中节点 keyShape 在特定状态下的样式                               |
| setDefaultEdge      | (edgeData) => StateConfigs     | 批量设置图中连线的配置，具体配置项请见[连线配置项](/vgraph/guide/edge-spec/options)                 |
| setEdgeStateStyles  | (state:string, edgeData: any, edge: Edge) => keyShapeStyles     | 设置图中连线 keyShape 在特定状态下的样式                               |
| setDefaultGroup     | (groupData) => GroupConfigs    | 批量设置图中分组的配置，具体配置项请见[分组配置项](/vgraph/guide/group-spec/options)                 |
| setGroupStateStyles | (state: string, groupData: any, group: Group) => keyShapeStyles    | 设置图中分组 keyShape 在特定状态下的样式                               |
| padding    | number \| number[] | 指定图边缘留白，用于视口自适应等情况                                                       |
| minRatio   | number             | 指定图的最小缩放比                                           |
| maxRatio   | number             | 指定图的最大缩放比                                           |
| autoDraw   | boolean            | 是否在更新图设置/调用实例方法后自动重绘。默认为 true。当进行批量操作时先置为 false ，操作后主动绘制能提供更好的性能。 |
| linkCenter | boolean            | 连线是否直接连接到节点中心。默认为 false。批量计算连线的连接点有一定消耗。如果对节点与连线的连接点没有要求(不设置锚点 Anchor) 且当节点不透明时，置为 true 能提升性能。 |
| throwError | boolean            | 是否直接抛出异常，默认为 true。如果在生产环境，或认为一些异常是可以存在的，可以设置为 false。则异常信息将以 console.error 的形式提醒。 |

## setDefault\[Node | Edge | Group\]
通常情况下前端通过请求获取到原始数据后，需要依次遍历写入对应实例的配置，因此我们提供了 `setDefault[ Node | Edge | Group ]`的快捷方法来配置。这样的好处是如果后续有数据新增或修改，vGraph 能通过对应的方法直接拿到符合的配置应用。推荐使用此方法配置各个实例。以节点为例，配置的优先级为：



```
 原始数据配置  > setDefaultNode 配置 > vGraph 默认配置
```

## set\[Node | Edge | Group\]StateStyles
vGraph 提供状态机制，用于图中常见的微交互响应。简单的 hover, highlight, disable 状态推荐使用状态机制快速实现。详细介绍请见[状态管理](/vgraph/guide/states)。
