# 任务实例血缘场景解决方案

InstanceLineageGraph 是任务实例血缘图谱组件，为任务实例血缘场景打造的开箱即用解决方案。目前已经落地的场景有 dorado 实例 DAG。此组件支持[通用模式](/vgraph/demo/solutions/commonInst)和[统计模式](/vgraph/demo/solutions/statsInst)两种展示形式，对应关系查看和影响面分析两种场景。这是一个纯 js 组件，引用方式为
```javascript
import { InstanceLineageGraph } from '@visactor/vgraph';

const graph = new InstanceLineageGraph(options);

```

### 配置项

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| data        | GraphStructure      | 任务血缘组件接受 GraphStructure 类型的数据，结构大概为 { nodes, edges }, 更多结构相关请见[GraphStructure](/vgraph/guide/data-structure#GraphStructure-数据结构) |
| container | string              | 图容器 dom 的 id    |
| size     | number[] | 图容器大小，`size:[800, 600]` 表示容器宽为 800px，高为 600 px |
| baseNodeId | string              | 主实例节点 id。    |
| mode        | 'COMMON' \| 'STATS' | COMMON: 通用模式 <br> STATS: 统计模式       |
| nodeSep       | number | 布局中相邻节点之间的距离。默认 20。自定义时建议大于节点高度的一半，以正常展示自环等关系。   |
| rankSep       | number | 布局中两层节点之间的距离。默认 50。 |
| minRatio      | number | 图最小缩放比。 |
| maxRatio      | number | 图最大缩放比。 |
| onClickNode | (nodeData: any) => void | 点击节点事件 |
| maxChildCount | number   | \[通用模式\] 父节点下同层最多展示几个明细节点，超过这个数量会展示统计节点|
| onClickClusterNode | (showedIds: string[], childrenIds: string[], clusterData: any) => void | \[通用模式\]快速展开统计节点的某一分类节点事件。<br>showedIds: 已展开节点的 id <br> childrenIds: 收起的所有节点 id <br> clusterData: 聚类节点数据|
| onShowNodesFromCluster | (clusterData: any, idsToShow: string[], showedIds: string[]) => void | \[通用模式\]快速展开统计节点的某一分类节点事件。 <br> clusterData: 聚类节点数据 <br>idsToShow: 待展开节点的 id <br>showedIds: 已展开节点的 id|
| display | 'ALL' \| 'RANKS' | \[统计模式\] 展示方式。 <br> ALL: 所有节点都统计在一起 <br> RANKS: 分层统计节点 |
| setGroupData | (nodeData: any) => string \| { value: string, color: string }   |  \[统计模式\] 指定分组的数据维度，color 为节点的主题颜色 |
| onExpandStatsGroup | (nodeIds: string[]) => void; | \[统计模式\] 展开单个统计节点事件。 nodeIds: 此统计节点包含的任务实例 id |
| renderGroupTitle | (groupData: any, layer: Layer, width: number, options: any) => void   | \[统计模式\]自定义统计模式分组头的样式。<br>groupData: 分组数据 <br> layer: 绘图图层，往此图层中添加图形 <br> width: 分组头的长度，随视窗和统计节点数量不同 <br> options: 所有配置项 |
| setNodeStyles | (nodeData: any) => any | 设置节点默认样式，也可以在此配置节点类型 |
| setNodeStateStyles | (state: string, nodeData: any, node: Node) => any | 设置节点在不同状态下的样式，如果用内置节点，直接将返回值配置在此即可 |

### 实例方法                  
| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| changeMode(mode: 'COMMON' \| 'STATS' ) | void  | 切换图模式 |
| updateOption(k:string, v: any) | void  | 更新图配置 |
| setData(data: GraphStructure) | void  | 重置图中数据 |
| expandNode(parentId: string, nodes: nodeData[], edges: [], type: 'UPSTREAM' \| 'DOWNSTREAM',) | void    | 展开节点。<br> parentId: 父节点 id <br> nodes: 展开的节点数据，数据结构同 GraphStructure 中的 node <br> edges: 展开节点之间的关系，数据结构同 GraphStructure 中的 edge <br> type: 展开的是 UPSTREAM 上游还是 DOWNSTREAM 下游 |
| collapseNode(nodeId: string, direction: 'DOWNSTREAM' \| 'UPSTREAM') | void    | 收起 id 为 nodeId 节点的全部上下游      |
| hideNode(nodeId: string)               | void    |  隐藏节点，会同时隐藏节点的所有子节点    |
| showNodesFromCluster(clusterId: string, nodeIds: string[])      | void     | 从聚类节点中展开明细节点。<>        |
| focusNode(nodeId: string)                                   | void    | 将指定节点展示在视窗中心                     |
| getGraph()                                   | Graph   |  获取解决方案对应的图实例 Graph      |
| destroy()                     | void   |  销毁图      |

### 内置节点
**注：出于信息安全需要 1.3.6 版本以后节点不再内置状态图片链接。请通过配置 register 方法使用，也可以配置成任意类型的节点。最新接入方式可见[任务实例血缘-通用模式](/vgraph/demo/solutions/commonInst)。**

为了满足更多场景的需求，InstanceLineage 并没有指定的节点类型，但提供了推荐的节点注册方法可以复用。用户也可自行注册更贴合你业务场景的节点，在 `setNodeStyles` 配置项中设置 `type` 为你注册的节点名称即可。以下是推荐节点的注册方法：

``` javascript
import { registerInstanceNode, registerClusterNode } from '@visactor/vgraph';
// 根据配置项自动生成节点状态更新的展示 function，建议配置到组件的 setNodeStateStyles 上
const setNodeStateStyleFn = registerInstanceNode(options);
registerClusterNode(graphStructure, {
  // 聚合详情右侧箭头的图片资源
  arrowImg: IMG_URL
});
```

各部分配置项如下：

| 字段        | 类型                | 描述                                                         |
| ----------- | ------------------- | ------------------------------------------------------------ |
| expandImgUrl    | string  |  展开节点上/下游 icon 的图片链接   |
| collapseImgUrl   | string  |  收起节点上/下游 icon 的图片链接   |
| setDefaultNode  | (nodeData: any) => { bkg: string; text: string; icon: string; } | 根据节点数据返回不同的节点样式，bkg 代表标题背景色，text 为文本颜色，icon 为标题前的图片链接  |
| setHighlightNode  | (nodeData: any) => { color: string; icon: string; } | 根据节点数据返回不同的高亮节点样式，color 为高亮时的标题背景色， icon 为标题文本前的图片链接  |
