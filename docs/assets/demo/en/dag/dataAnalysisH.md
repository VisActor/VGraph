---
category: examples
group: dag
title: Simple Swimlane - Horizontal
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/swim_lane_h.png
link: dag/dataAnalysisH
option:
---
# Simple Swimlane - Horizontal

Migrating the original vgraph demo to vgraph, maintaining the main interaction and layout behavior.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, DAGLayout, GraphEvent, Node, Edge, Group } from '@visactor/vgraph';

const data = {
  nodes: [
    { id: '2.1.2' },
    { id: '2.2.0' },
    { id: '2.2.1' },
    { id: '2.2.2' },
    { id: '2.3.0' },
    { id: '2.3.1' },
    { id: '2.3.2' },
    { id: '2.4.0' },
    { id: '2.4.1' },
  ],
  edges: [
    { source: '2.1.2', target: '2.2.0' },
    { source: '2.2.0', target: '2.2.1' },
    { source: '2.2.1', target: '2.2.2' },
    { source: '2.2.2', target: '2.3.0' },
    { source: '2.3.0', target: '2.3.1' },
    { source: '2.3.1', target: '2.3.2' },
    { source: '2.3.2', target: '2.4.0' },
    { source: '2.4.0', target: '2.4.1' },
  ],
  groups: [
    { id: '2.1.x', children: ['2.1.2'] },
    { id: '2.2.x', children: ['2.2.0', '2.2.1', '2.2.2'] },
    { id: '2.3.x', children: ['2.3.0', '2.3.1', '2.3.2'] },
    { id: '2.4.x', children: ['2.4.0', '2.4.1'] },
  ],
};

const container = document.getElementById(CONTAINER_ID);

// Initialize the graph instance
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.scrollWidth,
  height: container.scrollHeight,
  setDefaultNode(nodeData) {
    const index = parseInt(nodeData.id.charAt(2), 10) - 1;
    return {
      label: {
        text: nodeData.id,
        fontSize: 14,
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: 'rgba(20, 20, 20, 0.9)',
      },
      type: 'rect',
      width: 140,
      height: 48,
      radius: 3,
      strokeStyle: '#E1E4EB',
      // Custom node layer, DagLayout will layer nodes based on the rank field
      rank: index,
      anchors: [
        [0, 0.5],
        [0.5, 0],
        [0.5, 1],
        [1, 0.5],
      ],
    };
  },
  setNodeStateStyles(state, nodeData, node) {
    const label = node.getLabel();
    if (state === 'hover') {
      label.set('fillStyle', '#2E62F1');
      return { strokeStyle: '#2E62F1' };
    }
    if (state === 'active') {
      label.set('fillStyle', '#fff');
      return {
        fillStyle: '#2E62F1',
        strokeStyle: '#2E62F1',
      };
    }
    if (state === 'default') {
      label.set('fillStyle', 'rgba(20, 20, 20, 0.9)');
      return {
        strokeStyle: '#E1E4EB',
        fillStyle: '#fff',
      };
    }
  },
  setDefaultEdge(edgeData) {
    const sourceId = graph.getNodeById(edgeData.source).get('groupId');
    const targetId = graph.getNodeById(edgeData.target).get('groupId');
    // Use straight lines for nodes on the same layer
    let type = 'line';
    let sourceAnchor = undefined;
    let targetAnchor = undefined;
    if (sourceId !== targetId) {
      // Use vertical polylines for nodes on different layers, and specify connection points
      type = 'vLine';
      sourceAnchor = 2;
      targetAnchor = 1;
    }
    return {
      type: type,
      lineWidth: 1,
      hitWidth: 6,
      strokeStyle: '#D1D5DA',
      endArrow: true,
      sourceAnchor,
      targetAnchor,
    };
  },
  setEdgeStateStyles(state, edgeData, edge) {
    if (state === 'hover') {
      // Avoid display errors when lines overlap
      edge.toFront();
      return {
        strokeStyle: '#2E62F1',
      };
    }
    if (state === 'active') {
      edge.toFront();
      return {
        lineWidth: 2,
        strokeStyle: '#2E62F1',
      };
    }
  },
  setDefaultGroup(groupData) {
    return {
      strokeStyle: '#D9D9D9',
      fillStyle: '#FAFBFC',
      radius: 12,
      linkNode: true,
      padding: 20,
      // Specify that the group title bar is on the left side of the entire group
      titlePosition: 'left',
      title: {
        text: { text: groupData.id, fillStyle: '#626978', y: 45 },
        background: {
          fillStyle: '#F0F3F6',
        },
      },
    };
  },
});
// Write data
graph.data(data);
new DAGLayout({
  graph,
  rankDir: 'TB',
  nodeSep: 24,
  rankSep: 64,
  ranker: 'custom',
  ignoreGroup: true,
});
let minX = Infinity;
let maxX = -Infinity;
graph.getNodes().forEach((node: Node) => {
  const x = node.get('x');
  minX = Math.min(x, minX);
  maxX = Math.max(x, maxX);
});

graph.getGroups().forEach((group: Group) => {
  group.updateData({
    // minX is the center coordinate of the leftmost node, subtract half the width
    fixLeft: minX - 70,
    // maxX - minX is one node width less than the length of the entire row
    fixWidth: maxX - minX + 140,
  });
});
graph.refresh();
// Fit to view size
graph.fitView();
// Add interactions
// hover node
graph.on('node:mouseenter', (e: GraphEvent) => {
  e.target.setState('active');
});

graph.on('node:mouseleave', (e: GraphEvent) => {
  e.target.setState('default', true);
});

//hover edge
graph.on('edge:mouseenter', (e: GraphEvent) => {
  const edge = e.target;
  edge.setState('active');
  edge.source.setState('hover');
  edge.target.setState('hover');
});

graph.on('edge:mouseleave', (e: GraphEvent) => {
  const edge = e.target;
  edge.removeState('active');
  edge.source.setState('default', true);
  edge.target.setState('default', true);
});

// Click group to collapse/expand
graph.on('group:click', (e) => {
  const group = e.target;
  if (group.get('collapsed')) {
    group.expand();
  } else {
    group.collapse();
  }
});
```
