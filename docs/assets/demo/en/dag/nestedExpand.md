---
category: examples
group: dag
title: Nested Layout - Full Data Expand/Collapse
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested_expand.gif
link: dag/nestedExpand
option:
---
# Nested Layout - Full Data Expand/Collapse

Data description: Grouped data can easily cause group overlap and poor readability if you do not relayout each group. VGraph supports nested layouts to achieve better layout results. In complex graphs, collapsing groups by default can greatly improve viewing efficiency, and users can expand the inner structure when they reach parts they care about. <br>Interactions: <code>click node icon</code>: expand group node to view inner structure; <code>click group icon</code>: collapse inner structure of the group.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, Group, GroupUtils, Node, insertStyles } from '@visactor/vgraph';

const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;';
const iconfontStyles = `
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.ttf?t=1685600318362') format('truetype');
}
canvas,
.iconfont {
  font-family: 'iconfont' !important;
}
`;
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');

// Initialize the graph instance
const container = document.getElementById(CONTAINER_ID);
const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.1,
  layout: {
    type: 'nestedDag',
    options: {
      dagOptions: {
        rankDir: 'LR',
        nodeSep: 80,
        edgeSep: 20,
        rankSep: 100,
        adjustControlPoints: true,
      },
    },
  },
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      width: 120,
      height: 40,
      radius: 4,
      fillStyle: '#fff',
      text: nodeData.name != null ? nodeData.name : (nodeData.id != null ? nodeData.id : 'null'),
      label: {
        width: 80,
        text: nodeData.name != null ? nodeData.name : (nodeData.id != null ? nodeData.id : 'null'),
        textOverflow: 'ellipsis',
      },
      rectWidth: 20,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      // Collapsed data will have a node.childNodes parameter. If the original data has this parameter,
      // it needs to be saved separately to prevent loss.
      icons: nodeData.childNodes
        ? [
          {
            show: 'always',
            position: [1, 0.5],
            offsets: [-16, 0],
            setStyles() {
              return {
                fillStyle: '#666',
                icon: expandIcon,
                cursor: 'pointer',
              };
            },
          },
        ]
        : undefined,
    };
  },
  setDefaultEdge() {
    return {
      type: 'line',
      endArrow: true,
    };
  },
  setDefaultGroup(group: any) {
    return {
      linkNode: false,
      fillStyle: '#F3F9FF',
      strokeStyle: '#3073F2',
      padding: 10,
      radius: 4,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      title: {
        text: { text: group.id, fillStyle: '#fff' },
        background: {
          fillStyle: '#3073F2',
        },
        icon: {
          icon: collapseIcon,
          fillStyle: '#fff',
          cursor: 'pointer',
          onClick: (e: any, group: Group) => {
            collapseGroup(group);
          },
        },
      },
    };
  },
});
graph.addBehavior(panZoom);

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186c5d878fe34.json'
)
  .then((response) => response.json())
  .then((rawData) => {
    // Process the original data to collapse all groups
    const data = GroupUtils.getCollapsableData(rawData);
    // Write data
    graph.data(data);
    // Fit to view size
    graph.fitView();
  });

graph.on('node:click', (e) => {
  const node = e.target;
  // If there are collapsed nodes and the click is on the icon on the node
  if (node.get('childNodes') && (e.relatedTarget && e.relatedTarget.type) === 'icon') {
    expandNode(node);
    return;
  }
  // Implement other interactions for clicking nodes here
});

function expandNode(node: Node) {
  // Expand the group
  const group = GroupUtils.expandGroupNode(graph, node);
  // Re-layout
  graph.layout();
  graph.refresh();
  // Focus on the group to prevent the user from losing focus
  graph.focus(group);
}

function collapseGroup(group: Group) {
  // Collapse the group into a node
  const groupNode = GroupUtils.collapseGroup(graph, group);
  // Re-layout
  graph.layout();
  graph.refresh();
  // Focus on the node to prevent the user from losing focus
  graph.focus(groupNode);
  return groupNode;
}
```
