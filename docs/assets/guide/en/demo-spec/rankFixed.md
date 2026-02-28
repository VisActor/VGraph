# DAG Specify Partial Levels

In the [directed graph layout]() of xgraph, you can support custom levels. First, calculate the levels of all nodes through DAGLayout, and then modify the levels of some nodes to the specified levels according to business needs, so as to achieve the purpose of specifying partial levels.
Since the directed graph layout of xgraph can support only calculating the level without calculating the position of the nodes through the `rankOnly` option, and the custom level can skip the level calculation. Therefore, although the layout is executed twice, the total calculation amount is still the calculation consumption required for one layout.

In general, it can be used as follows:
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
      // Only calculate rank without layout
    },
});

graph.getNodes().forEach((node: any) => {
  if(node...){
    node.set('rank',...); // Set the nodes that meet the conditions to the specified level
  }
});

new DAGLayout({
    graph,
    options: {
    rankDir: 'LR',
    nodeSep: 20,
    edgeSep: 10,
    rankSep: 50,
    ranker: 'custom', // No longer recalculate the layout
    },
});

```
