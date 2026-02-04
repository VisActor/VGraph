import { DAGLayout, Graph, Node, registerNode, panZoom, Layer, Rect, Path, Text, LAYOUT_TYPES } from '../../../src';
const data: any = {
  nodes: [
    { id: 'root', rank: 0 },
    { id: 'up-1', rank: -1 },
    { id: 'up-1-1', rank: -2 },
    { id: 'up-1-1-1', rank: -3 },
    { id: 'up-1-1-2', rank: -3 },
    { id: 'up-2', rank: -1 },
    { id: 'down-1', rank: 1 },
    { id: 'down-2', rank: 1 },
    { id: 'down-2-1', rank: 2 },
    { id: 'down-2-1-1', rank: 3 },
    { id: 'down-2-2', rank: 2 },
    { id: 'down-3', rank: 1 },
  ],
  edges: [
    { source: 'up-1', target: 'root' },
    { source: 'up-1-1', target: 'up-1' },
    { source: 'up-1-1-1', target: 'up-1-1' },
    { source: 'up-1-1-2', target: 'up-1-1' },
    { source: 'up-2', target: 'root' },
    { source: 'root', target: 'down-1' },
    { source: 'root', target: 'down-2' },
    { source: 'down-2', target: 'down-2-1' },
    { source: 'down-2-1', target: 'down-2-1-1' },
    { source: 'down-2-1-1', target: 'root' },
    { source: 'down-2', target: 'down-2-2' },
    { source: 'root', target: 'down-3' },
  ],
};

registerNode('cdpNode', {
  extends: 'rect',
  getConfigsForShape(nodeData: any) {
    return {
      ...nodeData,
      strokeStyle: '#E1E4E8',
      radius: 8,
    };
  },
  shape(layer: Layer, nodeData: any) {
    const overturn = nodeData.rank < 0;
    // 左侧分类色条
    const category = new Rect({
      left: -95,
      top: -20,
      width: 4,
      height: 40,
      fillStyle: nodeData.color,
      radius: [8, 0, 0, 8],
      clip: new Rect({
        left: -95,
        top: -20,
        width: 4,
        height: 40,
      }),
    });
    layer.add(category);

    const sumLayer = new Layer({ id: 'sumLayer' });
    layer.add(sumLayer);
    layer.set('sumLayer', sumLayer);
    const link = new Path({
      path: overturn
        ? [
            ['M', -95, 0],
            ['L', -102, 0],
          ]
        : [
            ['M', 95, 0],
            ['L', 102, 0],
          ],
      lineWidth: 2,
      strokeStyle: '#3073F2',
    });
    sumLayer.add(link);
    const text = new Text({
      x: overturn ? -110 : 110,
      y: 0,
      textAlign: overturn ? 'right' : 'left',
      text: '123',
      fontWeight: 500,
      fillStyle: '#3073F2',
      action: 'expand',
    });
    const width = text.getBBox().width + 16;
    const bg = new Rect({
      left: overturn ? -102 - width : 102,
      top: -10,
      width,
      height: 20,
      radius: 8,
      fillStyle: '#F3F9FF',
      strokeStyle: '#3073F2',
      hitWidth: 10,
      action: 'expand',
    });
    sumLayer.add(bg);
    sumLayer.add(text);
    sumLayer.hide();
  },
});

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    layout: {
      type: 'dag',
      options: {
        rankDir: 'LR',
        nodeSep: 50,
        edgeSep: 50,
        rankSep: 110,
        ranker: 'custom',
      },
    },
    setDefaultNode(node: any) {
      if (node.id === 'root') {
        return {
          width: 124,
          height: 40,
          fillStyle: '#07A35A',
          strokeStyle: null,
          radius: 8,
          label: {
            x: 0,
            y: 0,
            text: '首末次标签',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 500,
            fillStyle: '#fff',
          },
          anchors: [
            [0, 0.5],
            [1, 0.5],
          ],
        };
      }
      return {
        label: node.id,
        type: 'cdpNode',
        color: '#07A35A',
        width: 190,
        height: 40,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
      };
    },
    setDefaultEdge() {
      return {
        type: 'hLine',
        styles: {
          radius: 8,
        },
        lineWidth: 1,
        endArrow: true,
      };
    },
    setEdgeStateStyles(state: string) {
      if (state === 'blur') {
        return {
          opacity: 0.3,
        };
      }
    },
  });
  // 写入数据
  graph.data(data);
  graph.addBehavior(panZoom);
  graph.refresh();
  // 适应视图大小
  graph.fitView();

  graph.on('node:click', (e) => {
    const node = e.target;
    if (node.get('collapsed') && e.relatedTarget?.get('action') !== 'expand') {
      return;
    }
    graph.set('autoDraw', false);
    if (node.get('collapsed')) {
      expand(node);
    } else {
      const data = collapse(node);
      node.set('hideData', data);
    }
    graph.layout(node.get('id'));
    graph.refresh();
    graph.set('autoDraw', true);
    graph.draw();
  });

  function showSum(node: Node) {
    const appendSize = node.get('rank') > 0 ? [0, 60, 0, 0] : [0, 0, 0, 60];
    node.layer.set('appendSize', appendSize);
    node.layer.get('sumLayer').show();
    node.set('collapsed', true);
  }

  function expand(node: Node) {
    node.set('collapsed', false);
    node.layer.get('sumLayer').hide();

    const { nodes, edges } = node.get('hideData');
    nodes.forEach((nodeData: any) => {
      const n = graph.add('node', nodeData);
      if (n.get('hideData')) {
        showSum(n);
      }
    });

    edges.forEach((edgeData: any) => {
      graph.add('edge', edgeData);
    });
  }

  function collapse(node: Node) {
    node.set('collapsed', true);
    showSum(node);
    const nodeMap = graph.getNodeMap();
    const nodeRank = node.get('rank');
    let nodes: any = [];
    let edges: any = [];
    const targets = nodeRank > 0 ? node.targets : node.sources;
    for (let i = targets.length - 1; i >= 0; i--) {
      const id = targets[i];
      const hideData = getNodeData(nodeMap[id], nodeRank);
      if (hideData) {
        nodes = nodes.concat(hideData.node);
        edges = edges.concat(hideData.edges);
      }
    }
    console.log({ nodes, edges });
    return { nodes, edges };
  }

  function getNodeData(node: Node, rank: number) {
    const nodeMap = graph.getNodeMap();
    let nodes: any = [];
    const nodeId = node.get('id');
    const nodeRank = node.get('rank');
    if ((rank > 0 && nodeRank < rank) || (rank < 0 && nodeRank > rank)) {
      return;
    }
    const forwardEdges: any = [];
    let edges: any = [];
    node.edges.forEach((edge: any) => {
      const sourceRank = nodeMap[edge.get('source')].get('rank');
      const targetRank = nodeMap[edge.get('target')].get('rank');
      if (
        (rank > 0 && edge.get('target') === nodeId) ||
        (rank < 0 && edge.get('source') === nodeId) ||
        sourceRank > targetRank
      ) {
        forwardEdges.push(edge.configs);
      }
    });
    const targets = nodeRank > 0 ? node.targets : node.sources;
    for (let i = targets.length - 1; i >= 0; i--) {
      const id = targets[i];
      const hideData = getNodeData(nodeMap[id], node.get('rank'));
      if (hideData) {
        nodes = nodes.concat(hideData.node);
        edges = edges.concat(hideData.edges);
      }
    }
    if (nodes.length > 0) {
      node.set('hideData', { nodes, edges });
    }
    const nodeConfigs = node.configs;
    graph.remove(node);
    return { node: nodeConfigs, edges: forwardEdges };
  }
})();
