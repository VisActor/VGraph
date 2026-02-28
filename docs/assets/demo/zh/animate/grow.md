---
category: examples
group: animate
title: 连线延伸
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/grow.gif
link: animate/grow
option:
---
# 连线延伸

连线延伸动画适合展示节点的直接关联关系，可以做单次动画也可以做无限动画。例如此案例中 hover 节点时配合 state 机制对全部以此节点为起点的连线应用单次动画。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, dragCanvas, ForceDirectedLayout, defaultForces, ForceLink, Node, Edge } from '@visactor/vgraph';
import React from 'react';
import ReactDOM from 'react-dom';

function initGraph() {
  const container = document.getElementById(CONTAINER_ID);
  const graph = new Graph({
    container: CONTAINER_ID,
    width: container.offsetWidth,
    height: container.offsetHeight,
    minRatio: 0.3,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode: function() {
      return {
        type: 'circle',
        width: 15,
        height: 15,
        strokeStyle: null,
        fillStyle: '#5678D6'
      };
    },
    setEdgeStateStyles: function() {
      return {
        strokeStyle: '#FF8406'
      };
    }
  });

  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);

  fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      graph.data(data);
      var forces = defaultForces(data.edges, 400, 300);
      var forceLink = new ForceLink({
        edges: data.edges,
        options: { distance: 100 }
      });
      forces.set('link', forceLink);
      var fdp = new ForceDirectedLayout({
        graph: graph,
        forces: forces,
        maxIteration: 200,
        clearOnEndOnFirstCall: true,
        onTick: function() {
          graph.refresh();
        },
        onEnd: function() {
          graph.fitView();
        }
      });
      graph.set('layout', fdp);
    });

  graph.on('node:mouseenter', function(e) {
    var node = e.target;
    var id = node.get('id');
    node.edges.forEach(function(edge) {
      if (edge.get('source') !== id) {
        return;
      }
      edge.setState('active');
      graph.animate({
        target: edge,
        type: 'grow'
      });
    });
  });

  graph.on('node:mouseleave', function(e) {
    graph.stopAnimate();
    var node = e.target;
    var id = node.get('id');
    node.edges.forEach(function(edge) {
      if (edge.get('source') !== id) {
        return;
      }
      edge.removeState('active');
    });
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
