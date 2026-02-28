---
category: examples
group: dag
title: Cyclic DAG Collapse/Expand
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/cycle_dag.gif
link: dag/cycleDag
option:
---
# Cyclic DAG Collapse/Expand

Migrating the original vgraph demo to vgraph, maintaining the main interaction and layout behavior.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, Node, panZoom, GraphEvent } from '@visactor/vgraph';

const container = document.getElementById(CONTAINER_ID);
// Initialize the graph instance
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  layout: {
    type: 'dag',
    options: {
      rankDir: 'LR',
      nodeSep: 50,
      edgeSep: 20,
      rankSep: 60,
      cache: true,
    },
  },
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 100,
      height: 30,
      radius: 4,
      // Anchors are used to specify the relative positions where connections are allowed
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    };
  },
  setDefaultEdge() {
    return {
      type: 'line',
      lineWidth: 1,
      endArrow: true,
    };
  },
});

graph.data({
  nodes: [
    { label: 'TOP', class: 'type-TOP', id: '0' },
    { label: 'S', class: 'type-S', id: '1', strokeStyle: '#3370FF' },
    { label: 'NP', class: 'type-NP', id: '2' },
    { label: 'DT', class: 'type-DT', id: '3' },
    { label: 'This', class: 'type-TK', id: '4' },
    { label: 'VP', class: 'type-VP', id: '5', strokeStyle: '#3370FF' },
    { label: 'VBZ', class: 'type-VBZ', id: '6' },
    { label: 'NP', class: 'type-NP', id: '8', strokeStyle: '#3370FF' },
    { label: 'type.', class: 'type-.', id: '13' },
    { label: 'sentence', class: 'type-TK', id: '14' },
  ],
  edges: [
    { source: '3', target: '4' },
    { source: '2', target: '3' },
    { source: '1', target: '2' },
    { source: '5', target: '6' },
    { source: '5', target: '8', strokeStyle: '#3370FF' },
    { source: '1', target: '5', strokeStyle: '#3370FF' },
    { source: '13', target: '14' },
    { source: '1', target: '13' },
    { source: '0', target: '1' },
    { source: '8', target: '1', strokeStyle: '#3370FF' },
  ],
});
graph.fitView();

graph.addBehavior(panZoom);
graph.on('node:click', (e: GraphEvent) => {
  const node = e.target;
  // Disable automatic layout to improve performance during batch addition/deletion of nodes
  graph.set('autoLayout', false);
  graph.disableAutoDraw();
  if (node.get('collapsed')) {
    expand(node);
  } else {
    const data = collapse(node);
    node.set('hideData', data);
  }
  // Restore automatic layout after batch operations
  graph.set('autoLayout', true);
  // Fix the operated node and refresh the layout
  graph.layout(node.get('id'));
  graph.enableAutoDraw();
});

function collapse(node: Node) {
  node.set('collapsed', true);

  const nodeRank = node.get('rank');
  let nodes: any = [];
  let edges: any = [];
  const targets = nodeRank > 0 ? node.targets : node.sources;
  for (let i = targets.length - 1; i >= 0; i--) {
    const id = targets[i];
    const hideData = getNodeData(graph.getNodeById(id), nodeRank);
    if (hideData) {
      nodes = nodes.concat(hideData.nodes);
      edges = edges.concat(hideData.edges);
    }
  }
  return { nodes, edges };
}

function getNodeData(node: Node, rank: number) {
  let nodes: any = [];
  const nodeId = node.get('id');
  // DagLayout writes a rank field on the node to indicate the layer of the node.
  // Unidirectionally collapse nodes based on rank to avoid infinite loops in cycles.
  const nodeRank = node.get('rank');
  if ((rank > 0 && nodeRank < rank) || (rank < 0 && nodeRank > rank)) {
    return;
  }
  let edges: any = [];
  node.edges.forEach((edge: any) => {
    const sourceRank = graph.getNodeById(edge.get('source')).get('rank');
    const targetRank = graph.getNodeById(edge.get('target')).get('rank');
    if (
      (rank > 0 && edge.get('target') === nodeId) ||
      (rank < 0 && edge.get('source') === nodeId) ||
      sourceRank > targetRank
    ) {
      edges.push(edge.configs);
    }
  });
  const targets = nodeRank > 0 ? node.targets : node.sources;
  for (let i = targets.length - 1; i >= 0; i--) {
    const hideData = getNodeData(
      graph.getNodeById(targets[i]),
      node.get('rank')
    );
    if (hideData) {
      nodes = nodes.concat(hideData.nodes);
      edges = edges.concat(hideData.edges);
    }
  }
  nodes.push(node.configs);
  graph.remove(node);
  return { nodes, edges };
}

function expand(node: Node) {
  node.set('collapsed', false);
  const { nodes, edges } = node.get('hideData');
  // Restore the deleted nodes and lines
  nodes.forEach((nodeData: any) => {
    graph.add('node', nodeData);
  });

  edges.forEach((edgeData: any) => {
    graph.add('edge', edgeData);
  });
}
```
