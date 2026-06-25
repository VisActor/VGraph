---
category: examples
group: force
title: 自动配置力导向图
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/force_basic.png
 link: force-spec/force
option:
---
# 自动配置力导向图

日常业务场景中通常在一个图里要处理不同数据量不同数据特征的数据，如果这些数据都用一套力配置往往展示有瑕疵。VGraph 根据输入数据的特征计算配置了默认的力。可以在 <a href="/vgraph/guide/layout-spec/force#自动配置力函数">自动配置力函数</a> 了解更多

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
} from '@visactor/vgraph';

const color = [
  '#5678D6',
  '#EB8D2F',
  '#59A649',
  '#E0BA2D',
  '#A56AAD',
  '#6DBEC9',
  '#D95145',
  '#A0A0AD',
  '#94674E',
  '#ED848F',
  '#a305e5',
  '#000000',
  '#d0ff8f',
];

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const createButton = document.createElement('button');
createButton.innerText = 'Toggle Data';
createButton.onclick = toggleData;
createButton.style.position = 'absolute';
createButton.style.left = '5px';
createButton.style.top = '5px';
createButton.style.zIndex = '999';
container.appendChild(createButton);

const graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.02,
  maxRatio: 8,
  linkCenter: true,
  layout: {
    type: 'force',
    options: {
      maxIteration: 300,
      tickIterations: 10,
      onTick: () => {
        graph.refresh();
      },
      autoFDP: true,
    },
  },
  setDefaultNode(nodeData) {
    return {
      type: 'circle',
      width: 15,
      height: 15,
      strokeStyle: '#fff',
      fillStyle: nodeData.group ? color[nodeData.group % 13] : color[0],
    };
  },
  setNodeStateStyles(state) {
    if (state === 'active') {
      return {
        opacity: 1.0,
      };
    }
    return { opacity: 0.2 };
  },
  setDefaultEdge() {
    return {
      strokeStyle: '#ccc',
    };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return {
        strokeStyle: '#A7A7A7',
      };
    }
    return { opacity: 0.2 };
  },
});

let visData;
let coraData;

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac5677.json'
)
  .then((response) => response.json())
  .then((data1) => {
    return fetch(
      'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_1894df02c6b14.json'
    )
      .then((response) => response.json())
      .then((data2) => {
        visData = data1;
        coraData = data2;
        dealData(visData);
        setData(visData, graph);
        graph.addBehavior(highlightRelations);
        graph.addBehavior(panZoom);
        graph.addBehavior(dragCanvas);
        graph.addBehavior(dragNode);
      });
  });

let dataName = 'vis';
function toggleData() {
  if (dataName === 'vis') {
    dataName = 'cora';
    setData(coraData, graph);
  } else {
    dataName = 'vis';
    setData(visData, graph);
  }
}

function setData(data, graph) {
  if (!graph) {
    return;
  }
  graph.clear();
  graph.data(JSON.parse(JSON.stringify(data)));
}

function dealData(data) {
  const nodes = data.nodes;
  nodes.forEach((node) => {
    node.id = node.name;
  });
  data.links.forEach((edge) => {
    edge.source = nodes[edge.source].id;
    edge.target = nodes[edge.target].id;
  });
  data.edges = data.links;
  return data;
}
```
