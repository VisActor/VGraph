---
category: examples
group: tree
title: 径向树图
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/radial.gif
 link: demo-spec/treeBasic
option:
---
# 径向树图

数据描述: Flare 工具库的文件架构，其中当子节点数量膨胀很快时推荐使用径向树图展示。 <br>交互操作：<code>panZoom 画布</code>: 视图导航；<code>hover 节点</code>: 高亮起止路径；<code>drag 节点</code>: 拖拽节点；<code>click 节点</code>: 伸缩 / 展开树结构。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  TreeGraph,
  panZoom,
  dragCanvas,
  dragNode,
  Node,
  Edge,
} from '@visactor/vgraph';

const container = document.getElementById(CONTAINER_ID);

const graph = new TreeGraph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: {
    type: 'dendrogram',
    options: {
      direction: 'LR',
      size() {
        return [800, 600];
      },
      nodeSize() {
        return [8, 8];
      },
      rankSep() {
        return 100;
      },
      nodeSep() {
        return 10;
      },
      radial: true,
    },
  },
  linkCenter: true,
  setDefaultNode(node) {
    return {
      id: node.name,
      type: 'circle',
      width: 8,
      height: 8,
      strokeStyle: '#4c72b0',
      fillStyle: node.value ? '#4c72b0' : '#fff',
      label: {
        text: node.name,
        width: 100,
        textAlign: 'left',
        textBaseline: 'middle',
        fontSize: node.value ? 10 : 14,
        offsetX: 10,
        rotate: Math.PI * 2 - node.rad,
      },
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    };
  },
  setNodeStateStyles(state) {
    if (state === 'enter') {
      return {
        fillStyle: '#07A35A',
      };
    } else if (state === 'hover') {
      return {
        strokeStyle: '#07A35A',
        lineWidth: 3,
      };
    }
  },
  setDefaultEdge() {
    return {
      type: 'vCubic',
      strokeStyle: '#ccc',
    };
  },
  setEdgeStateStyles(state) {
    if (state === 'hover') {
      return {
        strokeStyle: '#07A35A',
      };
    }
  },
});

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186bfc559e342.json'
)
  .then((response) => response.json())
  .then((data) => {
    graph.data(data);
    graph.fitView();
  });

let moveNode;
let targetNode;
graph.addBehavior(dragNode, {
  delegate: true,
  shouldTrigger(e) {
    return e.target.get('id') !== 'flare';
  },
  onDragStart(node) {
    moveNode = node;
    graph.setChildrenVisibility(node, false);
    node.hide();
  },
  onDragEnter(node) {
    if (!moveNode) {
      return;
    }
    targetNode = node;
    node.setState('enter');
  },
  onDragLeave(node) {
    targetNode = undefined;
    node.removeState('enter');
  },
  shouldDrop(e) {
    this.target.show();
    graph.setChildrenVisibility(this.target, true);
    return !!targetNode;
  },
  onDrop(node) {
    if (!targetNode) {
      return;
    }
    graph.moveNode(node, targetNode);
    targetNode.removeState('enter');
    graph.getNodes().forEach((n) => {
      const label = n.get('label');
      if (n.get('rad') != null && n.get('rad') !== Math.PI * 2 - label.rotate) {
        n.updateData({ rad: n.get('rad') });
      }
    });
    if (targetNode.get('collapsed')) {
      targetNode.setState('hover', true);
    } else {
      node.setState('hover', true);
    }
    targetNode = undefined;
  },
});

graph.on('node:click', (e) => {
  if (!e.target.get('children')) {
    return;
  }
  const currentNode = e.target;
  graph.set('autoDraw', false);
  graph.toggleCollapse(currentNode);
  graph.getNodes().forEach((node) => {
    const label = node.getLabel();
    if (
      node.get('rad') !== undefined &&
      node.get('rad') !== Math.PI * 2 - label.rotate
    ) {
      node.updateData({ rad: node.get('rad') });
    }
  });
  graph.set('autoDraw', true);
  graph.draw();
});

graph.on('node:mouseenter', (e) => {
  const node = e.target;
  if (node.get('id') === 'flare') {
    return;
  }
  graph.getNodes().forEach((n) => {
    n.removeState('hover');
  });
  graph.getEdges().forEach((edge) => {
    edge.removeState('hover');
  });

  if (!targetNode) {
    node.setState('hover');
    node.edges.forEach((edge) => {
      edge.setState('hover');
    });
    let source = node.sources.concat();
    let target = node.targets.concat();

    while (source.length) {
      const n = graph.getNodeById(source.shift());
      n.setState('hover');
      source = source.concat(n.sources);
      n.edges.forEach((edge) => {
        if (edge.target === n) {
          edge.setState('hover');
        }
      });
    }

    while (target.length) {
      const n = graph.getNodeById(target.shift());
      n.setState('hover');
      target = target.concat(n.targets);
      n.edges.forEach((edge) => {
        if (edge.source === n) {
          edge.setState('hover');
        }
      });
    }
  }
});

graph.on('node:mouseleave', () => {
  graph.getNodes().forEach((node) => {
    node.removeState('hover');
  });
  graph.getEdges().forEach((edge) => {
    edge.removeState('hover');
  });
});
```
