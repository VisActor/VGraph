---
category: examples
group: dag
title: 有向图灵活定制层级
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/rankfixed_dag.png
link: dag/rankFixed
option:
---
# 有向图灵活定制层级

原始 vgraph demo 迁移到 vgraph，保持主要交互与布局行为。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  dragCanvas,
  Graph,
  panZoom,
  dragNode,
  highlightRelations,
  DAGLayout,
  GraphStructure
} from '@visactor/vgraph';

const colors = [
  '#4c72b0',
  '#8c8c8c',
  '#25a868',
  '#c44e52',
  '#8172b3',
  '#937860',
  '#da8bc3',
  '#d0ff8f',
  '#ccb974',
  '#64b5cd',
  '#a305e5',
  '#000000',
  '#dd8452',
];
const nodeWidth = 120;
const nodeHeight = 30;

const container = document.getElementById(CONTAINER_ID);

const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  minRatio: 0.02,
  maxRatio: 8,
  setDefaultNode(nodeData) {
    const nodeType = nodeData && nodeData.nodeType;
    const nodeColor = colors[nodeType != null ? nodeType : 5];
    return {
      type: 'category',
      radius: 4,
      width: nodeWidth,
      height: nodeHeight,
      color: nodeColor,
      strokeStyle: nodeColor,
      label: {
        text: nodeData.label,
        textOverflow: 'ellipsis',
      },
      icon: {
        icon: '&#xe60d;',
        background: {
          fillStyle: '#EBEDFF',
        },
      },
      anchors: [
        [0.0, 0.5],
        [1.0, 0.5],
      ],
    };
  },
  setNodeStateStyles(state, data) {
    const node = graph.getNodeById(data.id);
    const label = node.layer.find(shape => shape.type === 'text');
    if (state === 'hide') {
      return { fillStyle: data.color };
    }
    if (state === 'hover') {
      label.set('fillStyle', '#3370FF');
      return { strokeStyle: '#3370FF' };
    } else {
      label.set('fillStyle', '#666');
      return { strokeStyle: '#ccc' };
    }
  },
  setDefaultEdge(edge) {
    return {
      id: edge.source + '-' + edge.target,
      // type: "hLine",
      type: 'hCubic',
      endArrow: {
        width: 3,
        height: 5,
      },
      strokeStyle: '#e2e2e2',
      appendSize: 2,
    };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return {
        strokeStyle: '#A7A7A7',
      };
    }
    return { opacity: 1.0 };
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/rankfixed.json'
  // 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/rankfixed_largedata.json'
)
  .then((response) => response.json())
  .then((data) => {
    const NodeTypeToRank = {
      0: 0,
      2: 1,
      3: 2,
    };
    console.time('layout and draw');

    preLayout2(data);
    data.nodes.forEach(node => {
      node.rank =
        node.nodeType in NodeTypeToRank
          ? NodeTypeToRank[node.nodeType] - 3
          : node.rank;
    });
    // // 使用下面这段代码替换上面这段代码，可以得到更为紧凑的布局
    // const dummyGraph = preLayout(data);
    // dummyGraph.nodes.map((d: any) => {
    //   d.rank = Math.max(3, d.rank + 2);
    // });
    // data.nodes.forEach((node: any) => {
    //   node.rank = node.rank ? node.rank : NodeTypeToRank[node.nodeType];
    // });

    graph.data(data);
    graph.addBehavior(panZoom, { sensitivity: 5 });
    graph.addBehavior(dragCanvas);
    graph.addBehavior(dragNode, {
      onDrop: target => {
        // console.log(target);
      },
    });
    graph.addBehavior(highlightRelations);
    new DAGLayout({
      graph,
      rankDir: 'LR',
      nodeSep: 20,
      edgeSep: 10,
      rankSep: 50,
      ranker: 'custom',
    });
    // dagLayout.layout();
    graph.refresh();
    graph.fitView();
    graph.draw();
    console.timeEnd('layout and draw');
  });

// 将指定的节点构建为虚拟根节点来预计算rank
// 这种方式可以得到更加紧凑的布局
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function preLayout(data) {
  const nodes = data.nodes;
  const nodeWidth = 120;
  const nodeHeight = 30;
  nodes.map(node => {
    node.width = nodeWidth;
    node.height = nodeHeight;
    node.rank = undefined;
  });
  //
  const nodeIds = nodes.map((node) => node.id);
  const hasNode = {};
  nodeIds.map((id) => (hasNode[id] = true));
  const edges = data.edges.filter(
    (edge) => hasNode[edge.source] && hasNode[edge.target]
  );
  data.edges = edges;
  // 构造新的graph, 新的Graph将nodeType为0,2,3的节点用dummyRoot表示。
  const rootNodeIds = nodes
    .filter((node) => [0, 2, 3].includes((node && node.nodeType)))
    .map((node) => node.id);
  const rootNodeMap = {};
  rootNodeIds.map((id) => (rootNodeMap[id] = true));
  const otherNodes = nodes.filter(
    (node) => ![0, 2, 3].includes((node && node.nodeType))
  );
  const newEdges = [];
  const hasEdge = {};
  edges.forEach((edge) => {
    const source = rootNodeMap[edge.source] ? 'dummyRoot' : edge.source;
    const target = rootNodeMap[edge.target] ? 'dummyRoot' : edge.target;
    if (target === 'dummyRoot') {
      const id = `${target}_and_${source}`;
      if (!hasEdge[id]) {
        newEdges.push({ source: target, target: source });
        hasEdge[id] = true;
      }
    } else {
      const id = `${source}_and_${target}`;
      if (!hasEdge[id]) {
        newEdges.push({ source, target });
        hasEdge[id] = true;
      }
    }
  });

  const dummyNode = {
    id: 'dummyRoot',
    label: 'dummyRoot',
    nodeType: 0,
    width: nodeWidth,
    height: nodeHeight,
  };
  const newNodes = otherNodes;
  newNodes.push(dummyNode);
  const dummyGraph = {
    nodes: newNodes,
    edges: newEdges,
  };

  new DAGLayout({
    graph: dummyGraph,
    rankDir: 'LR',
    nodeSep: 20,
    edgeSep: 10,
    rankSep: 100,
    ranker: 'feasibleTree',
    rankOnly: true,
    // 仅计算rank而不进行布局
  });
  return dummyGraph;
}

// 这类方法无需进行构建新图的rank预计算
// 缺点是布局结果不那么紧凑
// 可以将L103-106替换为 L107-114查看效果变化
function preLayout2(data) {
  const nodes = data.nodes;
  const nodeWidth = 120;
  const nodeHeight = 30;
  nodes.map(node => {
    node.width = nodeWidth;
    node.height = nodeHeight;
    node.rank = undefined;
  });
  //
  const nodeIds = nodes.map((node) => node.id);
  const hasNode = {};
  nodeIds.map((id) => (hasNode[id] = true));
  const edges = data.edges.filter(
    (edge) => hasNode[edge.source] && hasNode[edge.target]
  );
  data.edges = edges;
  new DAGLayout({
    graph: new GraphStructure(data),
    rankDir: 'LR',
    nodeSep: 20,
    edgeSep: 10,
    rankSep: 100,
    ranker: 'feasibleTree',
    rankOnly: true,
    // 仅计算rank而不进行布局
  });
}
```
