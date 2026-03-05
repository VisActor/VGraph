---
category: examples
group: dag
title: Nested Layout - Asynchronous Expand/Collapse
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/nested_async_expand.gif
link: dag/nestedAsyncExpand
option:
---
# Nested Layout - Asynchronous Expand/Collapse

Data description: Grouped data can easily cause group overlap and poor readability if you do not relayout each group. VGraph supports nested layouts to achieve better layout results. For very large datasets, you can request the inner structure only when users expand a node. <br>Interactions: <code>click node icon</code>: expand group node to view inner structure; <code>click group icon</code>: collapse inner structure of the group.

## Key Configurations

- `Graph` / `DAGLayout`: Maintain the original layout and style configuration.
- `setDefaultNode` / `setDefaultEdge`: Preserve the appearance of nodes and lines.
- Interactive behaviors: Retain the expand, collapse, hover, or click logic from the example.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  GroupUtils,
  insertStyles,
  uuid,
} from '@visactor/vgraph';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from '@arco-design/web-react';

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

function initGraph() {
  insertStyles(iconfontStyles, 'vgraph-demo-iconfont');
  // Initialize the graph instance
  const container = document.getElementById(CONTAINER_ID);
  const graphContainer = document.getElementById('graphContainer');
  const graph = new Graph({
    container: 'graphContainer',
    width: (graphContainer && graphContainer.offsetWidth) || container.offsetWidth,
    height: (graphContainer && graphContainer.offsetHeight) || container.offsetHeight,
    layout: {
      type: 'nestedDag',
      options: {
        dagOptions: {
          rankDir: 'LR',
          nodeSep: 80,
          edgeSep: 20,
          rankSep: 120,
          adjustControlPoints: true,
        },
      },
    },
    setDefaultNode(nodeData) {
      return {
        type: 'rect',
        width: 120,
        height: 40,
        radius: 4,
        color: nodeData.group ? '#3073F2' : '#E1E4E8',
        label: {
          width: 80,
          text: nodeData.class || nodeData.id,
          textOverflow: 'ellipsis',
        },
        rectWidth: 20,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],

        icons: nodeData.group
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
    setDefaultGroup(group) {
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
          text: { text: group.class, fillStyle: '#fff' },
          background: {
            fillStyle: '#3073F2',
          },
          icon: {
            icon: collapseIcon,
            fillStyle: '#fff',
            cursor: 'pointer',
            onClick: (e, group) => {
              collapseGroup(group);
            },
          },
        },
      };
    },
  });
  // Write data
  graph.data({
    nodes: [
      { label: 'TOP', class: 'type-TOP', id: '0', group: true },
      { label: 'S', class: 'type-S', id: '1' },
      { label: 'NP', class: 'type-NP', id: '2' },
      { label: 'DT', class: 'type-DT', id: '3' },
      { label: 'This', class: 'type-TK', id: '4' },
      { label: 'VP', class: 'type-VP', id: '5', group: true },
      { label: 'VBZ', class: 'type-VBZ', id: '6' },
      { label: 'is', class: 'type-TK', id: '7' },
      { label: 'NP', class: 'type-NP', id: '8' },
      { label: 'DT', class: 'type-DT', id: '9' },
      { label: 'NN', class: 'type-NN', id: '11' },
      { label: 'type.', class: 'type-.', id: '13' },
      { label: 'sentence', class: 'type-TK', id: '14' },
    ],
    edges: [
      { source: '3', target: '4' },
      { source: '2', target: '3' },
      { source: '1', target: '2' },
      { source: '6', target: '7' },
      { source: '5', target: '6' },
      { source: '8', target: '9' },
      { source: '8', target: '11' },
      { source: '5', target: '8' },
      { source: '1', target: '5' },
      { source: '13', target: '14' },
      { source: '1', target: '13' },
      { source: '0', target: '1' },
    ],
  });

  // Fit to view size
  graph.fitView();
  graph.addBehavior(panZoom);

  function collapseGroup(group) {
    // Collapse the group into a node
    const groupNode = GroupUtils.collapseGroup(graph, group);
    // Re-layout
    graph.layout();
    // Focus on the node to prevent the user from losing focus
    graph.focus(groupNode);
    return groupNode;
  }

  return { graph };
}

function mockData() {
  const nodes = [];
  const edges = [];
  const count = Math.random() * 5 + 1;
  for (let i = 0; i < count; i++) {
    const id = uuid(8);
    nodes.push({ id });

    if (i > 0) {
      edges.push({
        source: nodes[0].id,
        target: id,
      });
    }
  }
  return { nodes, edges };
}

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { graph } = initGraph();
    graph.on('node:click', (e) => {
      const node = e.target;
      // Click on the icon on the node
      if ((e.relatedTarget && e.relatedTarget.type) === 'icon') {
        expandNode(node);
        return;
      }
      // Implement other interactions for clicking nodes here
    });

    function expandNode(node) {
      if (!node.get('childNodes')) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          // Asynchronously request data to expand
          expandGroupNode(node, mockData());
        }, 1000);
      } else {
        // If it has been expanded and has data, expand directly
        expandGroupNode(node);
      }
    }

    function expandGroupNode(node, data) {
      const group = GroupUtils.expandGroupNode(graph, node, data);
      graph.layout();
      // Focus on the group to prevent the user from losing focus
      graph.focus(group);
    }
  }, []);

  return (
    <Spin loading={loading} style={{ width: '100%', height: '100%' }}>
      <div id="graphContainer" style={{ width: '100%', height: '100%', position: 'relative' }} />
    </Spin>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
