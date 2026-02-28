# Wasm 有向图布局 WasmDAGLayout

DAG(Directed Acyclic Graph) 是有向无环图，具备严密的拓扑性质，有很强的流程表达能力。DAG 布局是根据图数据中边的方向，自动计算节点的层级及位置的布局算法。

有向图布局的特点在于能明确的展示节点数据层级，并尽量保持连线走向一致，因此多用于展示状态流转，工作流程。vGraph 研究了很多的有向图场景，实现了能适用大多数场景的 DAG 布局算法 `DAGLayout` 和嵌套有向图布局算法 `NestedDAG`。

然而，对于复杂的嵌套场景，`NestedDAG` 算法在部分情况下仍然会存在不必要的连线交叉、连线穿越节点的情况。针对对布局效果具有更高要求的场景，vGraph 通过 wasm 实现了算法更加复杂但布局质量更佳的 `WasmDAGLayout` 算法。

`WasmDAGLayout` 使用方法如下：

```javascript
import { Graph } from '@visactor/vgraph';
import { WasmDAGLayout, loadWasm } from '@visactor/vgraph-wasm';

const graph = new Graph({
...
});

await loadWasm('wasm-path'); // 可以是本地路径，也可以是 cdn文件地址。 

const layout = new WasmDAGLayout({
  graph,
  ...options
}); // 在调用 new WasmDAGLayout 前需要先加载 wasm。
```


## 配置项

| 字段                   | 数据类型                          | 描述                                                                |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| graph                   | Graph \| GraphStructure       | \[必填\] 设置需要布局的数据,可以是 Graph 实例也可以是 GraphStructure。 |
| rankdir                 | 'TB' | 'BT' | 'LR' | 'RL'                              | \[可选\] 设置布局方向，默认值为 'TB'。                                  |
| nodeSep                 | number                             | \[可选\] 设置同层级相邻节点之间的间距，默认值为 `20`。                  |
| rankSep                 | number                             | \[可选\] 设置层级之间的间距，默认值为 `50`。                              |
| linkType                | string                             | \[可选\] 设置连线类型，默认值为 `line`。                                 |
| ranker                  | string                             | \[可选\] 设置布局的分层方式，默认值为 `networkSimplex`。更多 ranker 相关说明请见 [Ranker](#Ranker)  |



## 实例方法
| 实例方法                                  | 返回值                           | 描述               |
| ------------------------------------------- | ---------------------------------- | -------------------- |
| data( Graph \| GraphStructure ) | void                             | 重置数据并重新布局一次           |
| layout()            | void |   重新布局           |

## Ranker

Ranker 用于计算有向图的节点所在层级，有以下不同的分层算法可供不同场景的选择。

### networkSimplex
networkSimplex 是所有 ranker 中效果最好，也是开销最大的 ranker 算法。效果最好是因为用这个 ranker 分层往往能达到连线最短的效果。而开销最大是因为它包含了 feasibleTree 和 longestPath 的过程，再在此基础上迭代优化连线。由于此 ranker 效果最好，因此 DAGLayout 默认使用此 ranker 来分层。如果你的数据量很大，可以尝试使用 feasibleTree 来减少这部分开销。

### feasibleTree
feasibleTree 是通过构造一棵生成树的方式来进行分层。它是 networkSimplex 的前置步骤，也可以独立用于计算分层。两者的分层效果对比如下图。其中 (a) 为 feasibleTree 布局效果，而 (b) 为 networkSimplex。

<img src="/vgraph/guide/api/ranker-diff.png" width="400"/>


### longestPath
使用最长路径算法计算节点分层时，节点会被分配到可能的最低层级。直接后果是底部层级的会很宽，连线总长度也会更长，因此不推荐直接使用。而这个算法执行速度很快，可以很好地扩展，所以会作为其他 ranker 的初始化步骤。
