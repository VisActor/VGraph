---
category: examples
group: dag
title: Simple Swimlane - Vertical
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/swim_lane.gif
link: dag/dataAnalysis
option:
---
# Simple Swimlane - Vertical

Migrating the original vgraph demo to vgraph, maintaining the main interaction and layout behavior.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  Rect,
  Text,
  Node,
  Edge,
  Group,
  GraphEvent,
  DAGLayout,
} from '@visactor/vgraph';

const data = {
  nodes: [
    {
      name: 'Objective Setting',
      id: '1',
      groupId: 'Requirements Layer',
    },
    {
      name: 'Data Acquisition',
      id: '2',
      groupId: 'Data Layer',
    },
    {
      name: 'Data Cleaning',
      id: '3',
      groupId: 'Data Layer',
    },
    {
      name: 'Data Organization',
      id: '4',
      groupId: 'Data Layer',
    },
    {
      name: 'Descriptive Analysis',
      id: '5',
      groupId: 'Analysis Layer',
    },
    {
      name: 'Modeling Analysis',
      id: '6',
      groupId: 'Analysis Layer',
    },
    {
      name: 'Insight & Conclusion',
      id: '7',
      groupId: 'Analysis Layer',
    },
    {
      name: 'Model Testing',
      id: '8',
      groupId: 'Analysis Layer',
    },
    {
      name: 'Iterative Optimization',
      id: '9',
      groupId: 'Analysis Layer',
    },
    {
      name: 'Model Loading',
      id: '10',
      groupId: 'Output Layer',
    },
    {
      name: 'Report Writing',
      id: '11',
      groupId: 'Output Layer',
    },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '3', target: '4' },
    { source: '4', target: '5' },
    { source: '4', target: '6' },
    { source: '5', target: '7' },
    { source: '6', target: '8' },
    { source: '7', target: '11' },
    { source: '8', target: '9' },
    { source: '9', target: '10' },
    { source: '10', target: '11' },
  ],
  groups: [
    { id: 'Requirements Layer', children: ['1'] },
    { id: 'Data Layer', children: ['2', '3', '4'] },
    { id: 'Analysis Layer', children: ['5', '6', '7', '8', '9'] },
    { id: 'Output Layer', children: ['10', '11'] },
  ],
};

const groups = ['Requirements Layer', 'Data Layer', 'Analysis Layer', 'Output Layer'];

const container = document.getElementById(CONTAINER_ID);

const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      label: {
        text: nodeData.name,
        fontSize: 14,
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: 'rgba(20, 20, 20, 0.9)',
      },
      width: 140,
      height: 48,
      radius: 4,
      strokeStyle: '#E1E4EB',
      // Custom node layer, DagLayout will layer nodes based on the rank field
      rank: groups.indexOf(nodeData.groupId),
      anchors: [
        [0, 0.5],
        [0.5, 0],
        [0.5, 1],
        [1, 0.5],
      ],
    };
  },
  setNodeStateStyles(state: string, data: any, node: Node) {
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
  setDefaultEdge(edgeData: any) {
    const sourceId = graph.getNodeById(edgeData.source).get('groupId');
    const targetId = graph.getNodeById(edgeData.target).get('groupId');
    // Use straight lines for nodes on the same layer, and horizontal polylines for nodes on different layers
    let type = 'line';
    if (sourceId !== targetId) {
      type = 'hLine';
    }
    return {
      type: type,
      lineWidth: 1,
      strokeStyle: '#D1D5DA',
      endArrow: true,
    };
  },
  setEdgeStateStyles(state: string, edgeData: any, edge: Edge) {
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
      padding: 50,
      lineWidth: 0.5,
      titleSize: 64,
      // Custom group title bar content
      renderGroupTitle(group: any, layer: any, width: number) {
        // Title text
        const text = new Text({
          text: groupData.id,
          x: width / 2,
          y: 22,
          fontSize: 20,
          textBaseline: 'top',
          textAlign: 'center',
          fillStyle: '#7D8599',
        });

        // Top color bar
        const backRect = new Rect({
          left: 0,
          top: 0,
          width: width,
          height: 4,
          radius: [12, 12, 0, 0],
          fillStyle: '#7D8599',
          // The radius is larger than the height of the color bar, clip the excess part.
          // You can comment out the clip to compare the effect.
          clip: new Rect({
            left: 0,
            top: 0,
            width,
            height: 24,
            radius: 12,
          }),
        });
        layer.add(backRect);
        layer.add(text);
      },
    };
  },
  setGroupStateStyles(state: string, groupData: any) {
    const group = graph.getGroupById(groupData.id);
    const titleBg = group.titleLayer.find(
      (shape: any) => shape.type === 'rect'
    );
    const titleText = group.titleLayer.find(
      (shape: any) => shape.type === 'text'
    );
    if (state === 'hover') {
      titleBg.set('fillStyle', '#475466');
      titleText.set('fillStyle', '#545454');
      return {
        fillStyle: '#fff',
      };
    } else {
      titleBg.set('fillStyle', '#7D8599');
      titleText.set('fillStyle', '#7D8599');
    }
  },
});

graph.data(data);
// Since the group size needs to be manually adjusted after each layout,
// the built-in automatic update method is not used to define the group.
new DAGLayout({
  graph,
  rankDir: 'LR',
  nodeSep: 50,
  rankSep: 150,
  ranker: 'custom',
  ignoreGroup: true,
});
let minY = Infinity;
let maxY = -Infinity;
// Get the maximum and minimum y-coordinates of the nodes after layout
graph.getNodes().forEach((node: Node) => {
  const y = node.get('y');
  minY = Math.min(y, minY);
  maxY = Math.max(y, maxY);
});

// Fix the size of each group
graph.getGroups().forEach((group: Group) => {
  group.updateData({
    fixTop: minY - 15,
    fixHeight: maxY - minY + 30,
  });
});

graph.refresh();
graph.fitView();

// hover group
graph.on('group:mouseenter', (e: GraphEvent) => {
  e.target.setState('hover');
});

graph.on('group:mouseleave', (e: GraphEvent) => {
  e.target.setState('default', true);
});

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
graph.on('group:click', (e: GraphEvent) => {
  const group = e.target;
  if (group.get('collapsed')) {
    group.expand();
  } else {
    group.collapse();
  }
});
```
