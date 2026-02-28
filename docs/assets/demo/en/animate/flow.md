---
category: examples
group: animate
title: Dashed Line Flow
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/flow.gif
link: animate/flow
option:
---
# Dashed Line Flow

The dashed line flow animation can vividly show the trend of data relationships and is suitable for infinite animations in conjunction with some interactions. For example, in this case, when hovering over a node, this animation is applied to the entire related data link.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, Node, Edge, insertStyles } from '@visactor/vgraph';
import React from 'react';
import ReactDOM from 'react-dom';

var iconfontStyles = `
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

const colors = {
  'Not Ready': '#7152E8',
  'Waiting': '#EE8B24',
  'Executing': '#2367EA',
  'Success': '#07A35A',
  'Failure': '#D94147',
  'Terminated': '#5470A5'
};
const icons = {
  'Not Ready': '&#xe60e;',
  'Waiting': '&#xe60c;',
  'Executing': '&#xe60a;',
  'Success': '&#xe6b9;',
  'Failure': '&#xe60b;',
  'Terminated': '&#xe614;'
};

function initGraph() {
  const container = document.getElementById(CONTAINER_ID);
  const graph = new Graph({
    container: CONTAINER_ID,
    width: container.offsetWidth,
    height: container.offsetHeight,
    minRatio: 0.3,
    maxRatio: 8,
    layout: {
      type: 'dag'
    },
    setDefaultNode: function(nodeData) {
      return {
        type: 'tag',
        width: 140,
        height: 40,
        color: colors[nodeData.status],
        label: nodeData.name,
        anchors: [
          [0.5, 0.0],
          [0.5, 1.0]
        ],
        icon: {
          icon: icons[nodeData.status],
          size: 25,
          background: {
            width: 40
          }
        }
      };
    },
    setDefaultEdge: function() {
      return {
        type: 'vLine',
        endArrow: {
          width: 3,
          height: 5
        },
        strokeStyle: '#D1D5DA',
        appendSize: 2
      };
    }
  });
  graph.addBehavior(panZoom);

  graph.on('node:mouseenter', function(e) {
    var node = e.target;
    animateEdges(node, 'target', 'source');
    animateEdges(node, 'source', 'target');
  });

  graph.on('node:mouseleave', function(e) {
    graph.stopAnimate();
  });

  function animateEdges(node, nodePos, relatePos) {
    var nodeId = node.get('id');
    node.edges.forEach(function(edge) {
      if (edge.isAnimating()) {
        return;
      }
      if (edge.get(nodePos) === nodeId) {
        graph.animate({
          target: edge,
          type: 'flow'
        });
        animateEdges(graph.getNodeById(edge.get(relatePos)), nodePos, relatePos);
      }
    });
  }

  fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894ea4d92b77.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      graph.data(data);
      graph.fitView();
    });

  return graph;
}

function App() {
  React.useEffect(function() {
    initGraph();
  }, []);
  return null;
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
