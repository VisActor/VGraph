# 多层嵌套的 NestedDAG

DAG(Directed Acyclic Graph) 是有向无环图，具备严密的拓扑性质，有很强的流程表达能力。DAG 布局是根据图数据中边的方向，自动计算节点的层级及位置的布局算法。
有向图布局的特点在于能明确的展示节点数据层级，并尽量保持连线走向一致，因此多用于展示状态流转，工作流程。vGraph 研究了很多的有向图场景，实现了能适用大多数场景的 DAG 布局算法。

而多层嵌套的有向图布局的特点在于其节点具有多层嵌套的分组关系，不仅需要明确展示子图节点的数据层级，保持子图节点的连线走向一致，还需要保持子图之间的层级及连线走向。
vGraph 内置了适用大多数场景的多层嵌套布局算法，多层嵌套 DAG 算法使用方法如下：

```javascript
import { Graph, NestedDAG } from '@visactor/vgraph';
// 推荐引用方式，配置在 Graph 中
const graph = new Graph({
  layout: {
    type: 'nestedDag', 
    options: layoutOptions
  }
});

// 第二种引用方式，直接实例化
const graph = new Graph(...);
graph.data(someData);
const layout = new NestedDAG({
      graph,
    ...layoutOptions
    });
graph.set('layout', layout);    
```

## 配置项

| 字段         | 数据类型                | 描述                                                                                                          |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| graph        | Graph \| GraphStructure | \[必填\] 设置需要布局的数据,可以是 Graph 实例也可以是 GraphStructure。                                        |
| customLayout | (subGraph,reuse,rankOnly)=>{}    | 自定义子图 DAG 布局，适用于业务对子图节点布局进行微调的场景。可参考[多层嵌套 Demo](/vgraph/demo/dag/multiNested)。 |
| dagOptions   | DagLayoutOptions        | 指定子图[DAG 布局](/vgraph/guide/layout-spec/dag)的参数。                                                             |
| minCross        | boolean | 默认开启， 全局预排序以减少全局的连线交叉。请注意，开启后会执行两遍 customLayout，一次 rankOnly 为 true 一次 rankOnly 为 false，rankOnly 为 true 时应该仅执行 rank 来减少计算量提高效率。 参考[多层嵌套 Demo](/vgraph/demo/dag/multiNested) 中 customLayout 写法。每次执行完布局后将把minCross重新设置为false，以提高运行效率。 |

## 实例方法

| 实例方法                                    | 返回值 | 描述                                                                                                                                  |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| layout(reuse:{rank:boolean, order:boolean}) | void   | 重新布局。 reuse 参数为是否重用之前的 rank 和 order，例如展开和收起操作可以重用之前的 rank 和 order，从而提高展开收起操作的布局效率。 |
