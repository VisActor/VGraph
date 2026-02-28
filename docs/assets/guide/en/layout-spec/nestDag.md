# Multi-level Nested NestedDAG

A Directed Acyclic Graph (DAG) is a directed graph with no directed cycles. It has strict topological properties and a strong ability to express processes. The DAG layout is a layout algorithm that automatically calculates the levels and positions of nodes based on the direction of the edges in the graph data.
The characteristic of a directed graph layout is that it can clearly display the hierarchical levels of node data and try to keep the direction of the lines consistent. Therefore, it is often used to display state transitions and workflows. vGraph has studied many directed graph scenarios and implemented a DAG layout algorithm that can be applied to most scenarios.

The characteristic of a multi-level nested directed graph layout is that its nodes have a multi-level nested grouping relationship. It not only needs to clearly display the data levels of the subgraph nodes and maintain a consistent direction of the subgraph node connections, but also needs to maintain the levels and connection directions between the subgraphs.
vGraph has a built-in multi-level nested layout algorithm that is suitable for most scenarios. The usage of the multi-level nested DAG algorithm is as follows:

```javascript
import { Graph, NestedDAG } from '@visactor/vgraph';
// Recommended usage, configured in Graph
const graph = new Graph({
  layout: {
    type: 'nestedDag',
    options: layoutOptions
  }
});

// Second usage, direct instantiation
const graph = new Graph(...);
graph.data(someData);
const layout = new NestedDAG({
      graph,
    ...layoutOptions
    });
graph.set('layout', layout);
```

## Configuration Options

| Field | Data Type | Description |
| --- | --- | --- |
| graph | Graph \| GraphStructure | \[Required] Sets the data to be laid out, which can be a Graph instance or a GraphStructure. |
| customLayout | (subGraph,reuse,rankOnly)=>{} | Custom subgraph DAG layout, suitable for scenarios where the business needs to fine-tune the layout of subgraph nodes. See [Multi-level Nested Demo](/vgraph/demo/dag/multiNested). |
| dagOptions | DagLayoutOptions | Specifies the parameters for the subgraph [DAG layout](/vgraph/guide/layout-spec/dag). |
| minCross | boolean | Enabled by default, global pre-sorting to reduce global line crossings. Please note that after enabling, `customLayout` will be executed twice, once with `rankOnly` as true and once with `rankOnly` as false. When `rankOnly` is true, only `rank` should be executed to reduce calculation and improve efficiency. Refer to the `customLayout` writing style in the [Multi-level Nested Demo](/vgraph/demo/dag/multiNested). After each layout execution, `minCross` will be reset to false to improve running efficiency. |

## Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| layout(reuse:{rank:boolean, order:boolean}) | void | Re-layouts. The `reuse` parameter indicates whether to reuse the previous rank and order. For example, expand and collapse operations can reuse the previous rank and order to improve the layout efficiency of expand and collapse operations. |
