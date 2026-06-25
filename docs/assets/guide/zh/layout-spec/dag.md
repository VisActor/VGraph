# 有向图布局 DAGLayout

DAG(Directed Acyclic Graph) 是有向无环图，具备严密的拓扑性质，有很强的流程表达能力。DAG 布局是根据图数据中边的方向，自动计算节点的层级及位置的布局算法。



有向图布局的特点在于能明确的展示节点数据层级，并尽量保持连线走向一致，因此多用于展示状态流转，工作流程。vGraph 研究了很多的有向图场景，实现了能适用大多数场景的 DAG 布局算法。 DAG 布局算法的使用如下：

```javascript
import { Graph, DAGLayout } from '@visactor/vgraph';
// 推荐引用方式，配置在 Graph 中
const graph = new Graph({
  layout: {
    type: 'dag', 
    options: layoutOptions
  }
});

// 第二种引用方式，直接实例化
const graph = new Graph(...);
graph.data(someData);
const layout = new DAGLayout({
    graph,
    ...layoutOptions
});
graph.set('layout', layout);
```


## 配置项

| 字段                   | 数据类型                          | 描述                                                                                                                                |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| graph                   | Graph \| GraphStructure       | \[必填\] 设置需要布局的数据,可以是 Graph 实例也可以是 GraphStructure。 |
| options                 |  DagLayoutOptions      | 配置布局参数 |
| options                |                                   |                                                                                                                                     |
| options.rankSep   | number                            | 指定层级之间的间距        |
| options.nodeSep | number                            | 指定同层级相邻节点之间的间距   |
| options.edgeSep       | number | 指定同层级节点与穿过的连线之间的间距                             |
| options.rankDir              | 'TB' \| 'BT' \| 'LR' \| 'RL'                            |   布局方向。其中 TB 指从上到下布局，LR 指从左到右布局      |
| options.align              | 'UL' \| 'UR' \| 'DL' \| 'DR' \| 'L' \|'R' \| 'T' \| 'B' \|undefined                           |   对齐方向。UL 指左上角对齐，DR指右下角对齐。L 为左对齐，R 为右对齐。如为 undefined，则综合考虑四种对齐方式，布局结果会尽可能居中对齐。      |
| options.alignPeerNodes              | 'center' \| 'left' \| 'right' \| 'top' \| 'bottom'                            |   指定同层级的节点如何对齐，默认是 center。   |
| options.ranker      | 'networkSimplex' \| 'longestPath' \| 'feasibleTree' \| 'bfs' \| 'custom'                           | 指定布局的分层方式，默认是 networkSimplex。更多 ranker 相关说明请见 [Ranker](#Ranker)  |
| options.order      | 'minCross' \|'custom'                          | 指定每层节点的排布方式，默认是 minCross。更多 order 相关说明请见 [Order](#Order)  |
| options.acyclicer      |  'greedy' \| 'dfs'         | 指定环检测方法，默认为 'dfs'  |
| options.bfsRoot      |  Node \| NodeStructure   | 当 ranker 为 bfs 时必填，指定从哪个节点开始遍历  |
| options.linkNode      |  boolean   | 嵌套分组时若直接连线到跨分组的节点时开启。可参考[嵌套布局-连接节点](/vgraph/demo/dag/nestedNodes)。  |
| options.ignoreGroup     |  boolean   | 若图本身有分组，但是不希望进行嵌套分组时可置为 true。可参考[简易泳道图](/vgraph/demo/dag/dataAnalysis)。  |
| options.cache         | false |   当业务需要展开收起节点时全量数据布局后缓存位置，可以最大程度保留整体结构。可参考[有向图展开收起](/vgraph/demo/dag/acyclicDag)。当有数据新增时，可通过 `setOption('cache', true)` 再次缓存。         |
| options.rankOnly         | false |    如若仅希望计算 rank，而不希望进行后续的 order 和 position 计算时，可设置  `rankOnly` 为 `true` 。 可参考[有向图灵活定制层级](/vgraph/demo/dag/rankFixed)。  |
| options.adjustControlPoints         | false |   自动调整连线走向，适用于同层级节点大小差异很大或分组嵌套布局的场景下。   |
| options.allControlPoints         | false |   自动计算所有连线的走向，所有连线都是横平竖直的连线。   |


## 实例方法

| 实例方法                                  | 返回值                           | 描述               |
| ------------------------------------------- | ---------------------------------- | -------------------- |
| data( Graph \| GraphStructure \| { nodes: Node\[\], edges: Edge\[\] }) | void                             | 设置数据           |
| layout()            | void|   重新布局           |
| setOption(k:string, v: any)            | void |  更新布局设置         |

## Ranker

Ranker 用于计算有向图的节点所在层级，有以下不同的分层算法可供不同场景的选择。

### networkSimplex
networkSimplex 是所有 ranker 中效果最好，也是开销最大的 ranker 算法。效果最好是因为用这个 ranker 分层往往能达到连线最短的效果。而开销最大是因为它包含了 feasibleTree 和 longestPath 的过程，再在此基础上迭代优化连线。由于此 ranker 效果最好，因此 DAGLayout 默认使用此 ranker 来分层。如果你的数据量很大，可以尝试使用 feasibleTree 来减少这部分开销。

### feasibleTree
feasibleTree 是通过构造一棵生成树的方式来进行分层。它是 networkSimplex 的前置步骤，也可以独立用于计算分层。两者的分层效果对比如下图。其中 (a) 为 feasibleTree 布局效果，而 (b) 为 networkSimplex。





<img src="/vgraph/guide/api/ranker-diff.png" width="400"/>



### longestPath
使用最长路径算法计算节点分层时，节点会被分配到可能的最低层级。直接后果是底部层级的会很宽，连线总长度也会更长，因此不推荐直接使用。而这个算法执行速度很快，可以很好地扩展，所以会作为其他 ranker 的初始化步骤。

### bfs
`bfs` 是 vGraph 独有的一种 ranker。我们在实际的业务场景中发现一些场景下数据的层级是有特定意义的，而上述 ranker 为保证连线走向一致，无法保证与一个节点相关的节点都在同一层级。于是我们研发了 bfs ranker。用户可以指定一个节点，从这个节点出发的 n 度关系就在此节点的 n 层上/下方。于此同时，也可能产生同层级节点之间的连线。

### custom
`custom` 作为 bfs 的一种补充，适应于需要逐层展开节点的场景。由于逐层展开这个交互的特殊性，每个节点的层级在用户交互时已知。因此可以直接设置 ranker 为 `custom`。DAGLayout 会根据节点上的 `rank` 对节点分层。

```javascript
// 根据节点层级为节点分层做准备
graph.getNodes().forEach(node => {
  node.set('rank', rank);
});

const layout = new DAGLayout({
  graph,
  options: {
    ...,
    rank: 'custom'
  },
});
```

## Order
Order 用于指定同层级节点之间的相互顺序。order 的默认值为 `minCross`，DAGLayout 会计算出一个连线交叉最少的顺序，以避免传达误导性图信息的视觉异常。



当你的图场景中需要对每层的节点顺序进行控制，可以将 order 设置为 `custom`。DAGLayout 会根据节点上的 `order` 数据项对同层级节点进行排序。


```javascript
// 根据节点状态编码 stateCode 对同层级节点排序
graph.getNodes().forEach(node => {
  node.set('order', node.stateCode);
});

const layout = new DAGLayout({
  graph,
  options: {
    ...,
    order: 'custom'
  },
});
```

<!-- 可以复制该配置到代码中并以此配置力导向布局实例，方便调试和修改力函数配置。 -->

