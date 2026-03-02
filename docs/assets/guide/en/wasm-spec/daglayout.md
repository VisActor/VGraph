# Wasm Directed Graph Layout (WasmDAGLayout)

A Directed Acyclic Graph (DAG) is a directed graph with no directed cycles. It has strict topological properties and a strong ability to express processes. The DAG layout is a layout algorithm that automatically calculates the levels and positions of nodes based on the direction of the edges in the graph data.

The characteristic of a directed graph layout is that it can clearly display the hierarchical levels of node data and try to keep the direction of the lines consistent. Therefore, it is often used to display state transitions and workflows. vGraph has studied many directed graph scenarios and implemented a DAG layout algorithm, `DAGLayout`, and a nested directed graph layout algorithm, `NestedDAG`, that can be applied to most scenarios.

However, for complex nested scenarios, the `NestedDAG` algorithm may still have unnecessary line crossings and lines passing through nodes in some cases. For scenarios with higher requirements for layout effects, vGraph has implemented the `WasmDAGLayout` algorithm through wasm, which is more complex but provides better layout quality.

The usage of `WasmDAGLayout` is as follows:

```javascript
import { Graph } from '@visactor/vgraph';
import { WasmDAGLayout, loadWasm } from '@visactor/vgraph-wasm';

const graph = new Graph({
...
});

await loadWasm('wasm-path'); // Can be a local path or a CDN file address.

const layout = new WasmDAGLayout({
  graph,
  ...options
}); // Need to load wasm before calling new WasmDAGLayout.
```

## Configuration Options

| Field | Data Type | Description |
| --- | --- | --- |
| graph | Graph \| GraphStructure | \[Required] Sets the data to be laid out, which can be a Graph instance or a GraphStructure. |
| rankdir | 'TB' | 'BT' | 'LR' | 'RL' | \[Optional] Sets the layout direction. The default value is 'TB'. |
| nodeSep | number | \[Optional] Sets the spacing between adjacent nodes at the same level. The default value is `20`. |
| rankSep | number | \[Optional] Sets the spacing between levels. The default value is `50`. |
| linkType | string | \[Optional] Sets the link type. The default value is `line`. |
| ranker | string | \[Optional] Sets the layering method of the layout. The default value is `networkSimplex`. For more information on rankers, see [Ranker](#Ranker). |

## Instance Methods
| Instance Method | Return Value | Description |
| --- | --- | --- |
| data( Graph \| GraphStructure ) | void | Resets the data and re-layouts once. |
| layout() | void | Re-layouts. |

## Ranker

Ranker is used to calculate the level of nodes in a directed graph. There are different layering algorithms to choose from for different scenarios.

### networkSimplex
`networkSimplex` is the best-performing and most expensive ranker algorithm. It is the best because layering with this ranker often achieves the shortest line length. It is the most expensive because it includes the processes of `feasibleTree` and `longestPath`, and then iterates on this basis to optimize the lines. Since this ranker performs the best, DAGLayout uses it by default for layering. If your dataset is large, you can try using `feasibleTree` to reduce this overhead.

### feasibleTree
`feasibleTree` performs layering by constructing a spanning tree. It is a prerequisite step for `networkSimplex` and can also be used independently for layering. The comparison of the layering effects of the two is shown in the figure below. (a) is the layout effect of `feasibleTree`, and (b) is `networkSimplex`.

<img src="/vgraph/guide/api/ranker-diff.png" width="400"/>

### longestPath
When using the longest path algorithm to calculate node layering, nodes will be assigned to the lowest possible level. The direct consequence is that the bottom levels will be very wide, and the total length of the lines will also be longer, so it is not recommended to use it directly. However, this algorithm executes very quickly and can be scaled well, so it is used as an initialization step for other rankers.
