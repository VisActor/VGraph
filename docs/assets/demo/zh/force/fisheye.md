---
category: examples
group: force
title: 鱼眼放大镜
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/fisheye.gif
 link: force-spec/fisheye
option:
---
# 鱼眼放大镜

数据描述: miserables数据。<br> 通过鱼眼放大镜组件轻松观察局部结构。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  dragCanvas,
  dragNode,
  Graph,
  panZoom,
  FisheyePlugin,
  ForceLink,
  ForceManyBody,
  ForceCenter,
} from '@visactor/vgraph';

const colorPastel = [
  '#a1c9f4',
  '#ffb482',
  '#8de5a1',
  '#ff9f9b',
  '#d0bbff',
  '#debb9b',
  '#fab0e4',
  '#cfcfcf',
  '#eeea92',
  '#b9f2f0',
];

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const setDefaultNode = (nodeData) => {
  return {
    type: nodeData.type || 'circle',
    width: nodeData.r,
    height: nodeData.r,
    strokeStyle: 'rgba(0.5,0.5,0.5,0.2)',
    fillStyle: colorPastel[nodeData.group % 10],
    label: {
      text: nodeData.id,
      width: 100,
      fontSize: 11,
      textBaseline: 'middle',
      textAlign: 'center',
      fillStyle: '#000',
      opacity: 0,
    },
  };
};

const graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: true,
  layout: {
    type: 'force',
    options: {
      forces: {
        manybody: new ForceManyBody({
          options: {
            strength: -30,
          },
        }),
        link: new ForceLink({
          options: {
            distance: 30,
          },
        }),
        center: new ForceCenter({
          options: {
            x: width / 2,
            y: height / 2,
          },
        }),
      },
      maxIteration: 300,
      tickIterations: 10,
      onTick: () => {
        graph.refresh();
      },
      onEnd: () => {
        graph.fitView();
      },
      clearOnEndOnFirstCall: true,
    },
  },
  setDefaultNode,
  setDefaultEdge() {
    return {
      strokeStyle: '#ccc',
    };
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json'
)
  .then((response) => response.json())
  .then((data) => {
    data.nodes.forEach((node) => {
      node.r = Math.random() * 24 + 12;
    });
    graph.data(data);
    graph.addBehavior(panZoom);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(dragNode);
    new FisheyePlugin(graph);
  });
```
