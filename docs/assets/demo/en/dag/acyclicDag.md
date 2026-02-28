---
category: examples
group: dag
title: Acyclic DAG Collapse/Expand
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/acyclic_dag.gif
link: dag/acyclicDag
option:
---
# Acyclic DAG Collapse/Expand

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
      edgeSep: 50,
      rankSep: 60,
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
fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d1eac181.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.fitView();
  });

graph.addBehavior(panZoom);

graph.on('node:click', (e: GraphEvent) => {
  const node = e.target;

  graph.disableAutoDraw();
  // Disable automatic layout to improve performance during batch addition/deletion of nodes
  graph.set('autoLayout', false);
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
  // Get a map of nodes with id as key and Node as value
  const nodeMap = graph.getNodeMap();
  let nodes: any = [];
  let edges: any = [];
  const targets = node.targets;
  for (let i = targets.length - 1; i >= 0; i--) {
    const id = targets[i];
    const hideData = getNodeData(nodeMap[id]);
    nodes = nodes.concat(hideData.nodes);
    edges = edges.concat(hideData.edges);
  }
  return { nodes, edges };
}

function getNodeData(node: Node) {
  const nodeMap = graph.getNodeMap();
  let nodes = [node.configs];
  const nodeId = node.get('id');
  let edges: any = [];
  node.edges.forEach((edge: any) => {
    if (edge.get('target') === nodeId) {
      edges.push(edge.configs);
    }
  });
  const targets = node.targets;
  for (let i = targets.length - 1; i >= 0; i--) {
    const id = targets[i];
    // Recursively remove downstream nodes of downstream nodes
    const hideData = getNodeData(nodeMap[id]);
    nodes = nodes.concat(hideData.nodes);
    edges = edges.concat(hideData.edges);
  }
  // Remove all downstream nodes
  graph.remove(node);
  // Record the data of removed nodes and lines for restoration
  return { nodes, edges };
}

function expand(node: Node) {
  node.set('collapsed', false);
  // Restore the deleted nodes and lines
  const { nodes, edges } = node.get('hideData');
  nodes.forEach((nodeData: any) => {
    graph.add('node', nodeData);
  });

  edges.forEach((edgeData: any) => {
    graph.add('edge', edgeData);
  });
}
```
