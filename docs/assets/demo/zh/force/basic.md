---
category: examples
group: force
title: 社交关系
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/force_demo.gif
 link: demo-spec/forceBasic
option:
---
# 社交关系

数据描述：《悲惨世界》人物社交关系。 <br> 交互操作：<code>hover节点</code>: 展示人物名称；<code>click节点</code>: 展示人物相邻节点；<code>drag节点</code>: 调整布局结构；<code>shift + click节点</code>: 寻找人物之间的潜在社交关系；<code>alt + click节点</code>: 展示人物联系密切的好友；<code>click 图例</code>隐藏对应分组节点；<code>click画布</code>: 重置原始状态。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  panZoom,
  dragCanvas,
  dragNode,
  Node,
  ForceLink,
  ForceManyBody,
  ForceCollision,
  ForceCenter,
  ForceX,
  ForceY,
  CategoryLegend,
  RawTooltip,
  Edge,
} from '@visactor/vgraph';

const colors = [
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
  '#666',
];

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;
const x = width / 2;
const y = height / 2;
const forces = {
  link: new ForceLink({ options: { distance: 30 } }),
  charge: new ForceManyBody({ options: { strength: -30 } }),
  posX: new ForceX({ options: { x, strength: 0.01 } }),
  posY: new ForceY({ options: { y, strength: 0.01 } }),
  collide: new ForceCollision({ options: { radius: (nodeData) => nodeData.width * 0.5 + 2 } }),
  center: new ForceCenter({ options: { x: x, y: y } }),
};

const graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.3,
  maxRatio: 8,
  linkCenter: true,
  layout: {
    type: 'force',
    options: {
      forces,
      onTick: () => {
        graph.refresh();
      },
      onEnd: () => {
        graph.fitView();
      },
      maxIteration: 300,
      tickIterations: 10,
    },
  },
  setDefaultNode(nodeData) {
    return {
      type: 'circle',
      width: 10,
      height: 10,
      strokeStyle: '#fff',
      fillStyle: colors[nodeData.group],
    };
  },
  setNodeStateStyles(state, nodeData) {
    if (state === 'hover') {
      return {
        strokeStyle: nodeData.fillStyle,
      };
    } else if (state === 'active') {
      return {
        fillStyle: '#1E54C9',
      };
    } else if (state === 'click') {
      return {
        fillStyle: '#3073F2',
      };
    }
  },
  setDefaultEdge(edgeData) {
    return {
      lineWidth: edgeData.value / 3,
      strokeStyle: '#ccc',
    };
  },
  setEdgeStateStyles(state, edgeData) {
    if (state === 'active') {
      return {
        strokeStyle: 'rgba(48, 115, 242, 0.4)',
      };
    }
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
  });

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(dragNode, {
  delegate: false,
  onDrop(node) {
    node.set('click', node.get('click') ? false : true);
  },
});

const legendDiv = document.createElement('div');
legendDiv.style.position = 'absolute';
legendDiv.style.right = '10px';
legendDiv.style.top = '10px';
legendDiv.style.border = '1px solid #ccc';
container.append(legendDiv);
new CategoryLegend(graph, {
  container: legendDiv,
  encodeAttr: 'group',
  target: 'node',
  title: {
    text: '节点图例',
    background: {
      height: 20,
      fillStyle: '#eee',
    },
  },
  encodeStyles(nodeData) {
    return {
      marker: {
        type: 'circle',
        fillStyle: nodeData.fillStyle,
      },
      label: 'group' + nodeData.group,
    };
  },
  width: 100,
  height: 200,
  hover: {
    enable: true,
    legendActiveState: 'active',
    graphActiveState: 'hover',
  },
  click: {
    enable: true,
    filter: true,
    multiple: true,
  },
  setLegendStateStyles(state, markerData) {
    if (state === 'active') {
      return {
        strokeStyle: markerData.fillStyle ? markerData.fillStyle : '#ccc',
        lineWidth: 3,
        textStyles: {
          fontWeight: 'bolder',
        },
      };
    }
  },
});

new RawTooltip(graph, {
  styles: {
    border: '1px solid #ccc',
    padding: '4px',
    borderRadius: '4px',
    backgroundColor: '#fff',
    fontSize: '10px',
  },
  content(entity) {
    return 'Name: ' + entity.get('id') + ' <br/> Group: ' + entity.get('group');
  },
  target: 'node',
});

graph.on('node:mouseenter', (e) => {
  e.target.setState('hover');
});

graph.on('node:mouseleave', (e) => {
  e.target.removeState('hover');
});

graph.on('node:click', (e) => {
  graph.getNodes().forEach((node) => {
    node.clearStates();
    if (e.target.get('id') !== node.get('id')) {
      node.set('click', false);
      node.set('filter', false);
    }
  });
  graph.getEdges().forEach((edge) => {
    edge.clearStates();
  });

  if (e.nativeEvent.altKey) {
    filterEdge(e.target, 10);
  } else {
    highlightNode(e.target);
  }
});

graph.on('canvas:click', () => {
  graph.getNodes().forEach((node) => {
    node.clearStates();
    node.set('click', false);
    node.set('filter', false);
  });
  graph.getEdges().forEach((edge) => {
    edge.clearStates();
  });
});

function filterEdge(node, value) {
  if (!node.get('filter')) {
    node.set('filter', true);
    node.edges.forEach((edge) => {
      if (edge.get('value') > value) {
        edge.setState('active');
        edge.source.setState('active');
        edge.target.setState('active');
      }
    });
    node.setState('click');
  } else {
    node.set('filter', false);
  }
}

function highlightNode(node) {
  if (!node.get('click')) {
    node.set('click', true);
    node.edges.forEach((edge) => {
      edge.setState('active');
      edge.source.setState('active');
      edge.target.setState('active');
    });
    node.setState('click', true);
  } else {
    node.set('click', false);
  }
}
```
