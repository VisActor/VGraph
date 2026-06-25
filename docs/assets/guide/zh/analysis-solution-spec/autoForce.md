# 智能布局关系图

AutoForceGraph 是智能布局关系图组件，为关系网络场景打造的开箱即用解决方案。目前已经落地的场景有 ByteGraph 在线查询可视化等。这是一个纯 js 组件，引用方式为
```javascript
import { AutoForceGraph } from '@visactor/vgraph';

const graph = new AutoForceGraph(options);

```

### 配置项

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| data        | { nodes: \[{ \[id: string\]: any }\], edges: \[{ source: string, target: string, \[k:string\]: any }\] }      | 此关系图组件接受 { nodes, edges } 类型的数据，更多结构相关请见[数据结构](/vgraph/guide/data-structure) |
| container | string              | 图容器 dom 的 id    |
| size     | number[] | 图容器大小，`size:[800, 600]` 表示容器宽为 800px，高为 600 px |
| maxShowEdgeCount | number            |  达到多少图元会自动隐藏连线，默认 7000    |
| forceEdgeVisibility        | boolean |  初始时强制展示/隐藏连线       |
| triggerRelation       | 'hover' \| 'click' |  以什么交互触发高亮关系，默认是 hover  |
| nodeTypeKey       | string | 节点的某个数据项 key，作为节点分类依据 |
| edgeTypeKey      | string | 连线的某个数据项 key，作为连线分类的依据 |
| theme      | { nodes: string[], edges: string[] } | 节点和连线的配色主题 |
| setDefaultNode | (nodeData: { \[id: string\]: any }) => { \[key: string\]: any } | 自定义设置节点默认态样式，默认为直径 15 的圆，颜色由节点分类决定。可以在此处覆盖定义圆的大小，添加文本标签等。 |
| setNodeLabel       | (nodeData: { \[id: string\]: any }) => string | 指定节点的文本标签内容，返回空字符串表示不显示文本标签。可以通过 `updateOption` 实时切换  |
| setNodeStateStyles | (state: string, <br>nodeData: { \[id: string\]: any },<br> node: Node) => { \[key: string\]: any }   | 自定义设置节点状态下的样式，状态可能为 click, hover 以及 blur  |
| setDefaultEdge | (edgeData: { source: string, target: string, \[k:string\]: any }) => { \[key: string\]: any } | 自定义设置连线默认态样式，默认为 1px 直线，颜色由连线分类决定。 |
| setEdgeStateStyles | (state: string, <br>edgeData: { source: string, target: string, \[k:string\]: any },<br> edge: Edge) => { \[key: string\]: any }   | 自定义设置连线状态下的样式，状态可能为 active 或 blur  |

### 实例方法                  
| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| updateOption(k:string, v: any) | void  | 更新图配置 |
| setData(data: { nodes: \[{ \[id: string\]: any }\], edges: \[{ source: string, target: string, \[k:string\]: any }\] }, layout?: boolean) | void  | 重置图中数据, 与配置项中 data 结构相同。默认在设置数据后会重新布局，可以置 layout 为 false 直接绘图。|
| getGraph()                                   | Graph   |  获取解决方案对应的图实例 Graph      |
| expandNode: (parent: Node, data: { nodes: NodeData[], edges: EdgeData[] }, layout?: boolean)                  | void   | 展开 parent 节点的邻接节点，data 是邻接的关系数据，结构与 data 相同。layout 标识是否进行重新布局，默认会重新布局。   |
| collapseNode: (node: Node, layout?: boolean) | void | 收起 node 节点后来展开的邻接节点。layout 标识是否进行重新布局，默认会重新布局。 |
| destroy()                     | void   |  销毁图      |
