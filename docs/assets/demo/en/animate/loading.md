---
category: examples
group: animate
title: Node Loading
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/loading.gif
link: animate/loading
option:
---
# Node Loading

The node loading animation is often used as a user-friendly transition when waiting for a single node's data request. For example, in this case, it's the waiting animation between requesting data to refresh a node and the node's state update.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, Node, insertStyles } from '@visactor/vgraph';
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

function initGraph() {
  const container = document.getElementById(CONTAINER_ID);
  const graph = new Graph({
    container: CONTAINER_ID,
    width: container.offsetWidth,
    height: container.offsetHeight,
    minRatio: 0.2,
    maxRatio: 8
  });
  graph.addBehavior(panZoom);

  graph.add('node', {
    type: 'title',
    x: 200,
    y: 200,
    width: 176,
    height: 82,
    strokeStyle: '#E1E4E8',
    radius: 4,
    title: {
      text: 'Task name',
      fillStyle: 'rgba(20, 20, 20, 0.9)',
      height: 28,
      backgroundColor: '#E0E9FF'
    },
    label: {
      text: 'Start time: 2020-10-10 00:00:00\nEnd time: 2020-10-10 12:00:00',
      color: 'rgba(20, 20, 20, 0.45)',
      fontSize: 10
    },
    icons: [
      {
        show: 'always',
        position: [1, 0],
        offsets: [-12, 14],
        setStyles: function() {
          return {
            fillStyle: 'rgba(20, 20, 20, 0.45)',
            icon: '&#xec08;',
            cursor: 'pointer'
          };
        }
      }
    ]
  });

  graph.on('node:click', function(e) {
    var node = e.target;
    var uuid = graph.animate({
      target: node,
      type: 'loading',
      custom: {
        mask: true
      }
    });
    setTimeout(function() {
      graph.stopAnimate(uuid);
      node.updateData({
        title: {
          text: 'Task name',
          fillStyle: 'rgba(20, 20, 20, 0.9)',
          height: 28,
          backgroundColor: '#F1D4D5'
        }
      });
    }, 2000);
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
