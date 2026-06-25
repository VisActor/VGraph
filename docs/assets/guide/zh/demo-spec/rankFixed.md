# DAG 指定部分层级

在 vgraph 的[有向图布局]()中，可以支持自定义层级。先通过DAGLayout计算出所有节点的层级，然后再结合业务需求修改部分节点的层级为指定层级，从而可以达到指定部分层级的目的。
由于 vgraph 的有向图布局可以通过`rankOnly`选项支持仅计算层级，而不计算节点的位置，而自定义层级可以跳过层级计算。因此虽然执行了两次布局，但总计算量还是一次布局所需的计算消耗。

总的来说，可以通过如下方式进行使用：
```javascript
const perLayout = new DAGLayout({
    graph: data,
    options: {
      rankDir: 'LR',
      nodeSep: 20,
      edgeSep: 10,
      rankSep: 100,
      ranker: 'feasibleTree',
      rankOnly: true,
      // 仅计算rank而不进行布局
    },
});

graph.getNodes().forEach((node: any) => {
  if(node...){
    node.set('rank',...); // 满足条件的节点设置为指定层级
  }
});

new DAGLayout({
    graph,
    options: {
    rankDir: 'LR',
    nodeSep: 20,
    edgeSep: 10,
    rankSep: 50,
    ranker: 'custom', // 不再重新计算布局
    },
});

```