---
category: examples
group: animate
title: 虚线连线
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/flow.gif
link: animate/flow
option:
---
# 虚线连线

虚线连线动画能生动的展示出数据的关系走向，适合配合一些交互做无限动画。例如此案例中 hover 节点时对整条相关数据链路应用此动画。

## 代码演示

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
  未就绪: '#7152E8',
  等待执行: '#EE8B24',
  执行中: '#2367EA',
  成功: '#07A35A',
  失败: '#D94147',
  终止: '#5470A5'
};
const icons = {
  未就绪: '&#xe60e;',
  等待执行: '&#xe60c;',
  执行中: '&#xe60a;',
  成功: '&#xe6b9;',
  失败: '&#xe60b;',
  终止: '&#xe614;'
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
