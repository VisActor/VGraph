import { DAGLayout, Graph, Node } from '../../../src';
import data from '../../static/flow.json';
// const data: any = {
//   nodes: [
//     { name: '原始资金', id: 1 },
//     { name: '股权债权', id: 2 },
//     { name: '产品开发', id: 3 },
//     { name: '固定资产', id: 4 },
//     { name: '工资费用', id: 5 },
//     { name: '产品宣传', id: 6 },
//     { name: '产品销售', id: 7 },
//     { name: '公司营收', id: 8 },
//     { name: '税务', id: 9 },
//     { name: '股利发放', id: 10 },
//     { name: '公司经营', id: 11 }
//   ],
//   edges: [
//     { source: 1, target: 2 },
//     { source: 1, target: 3 },
//     { source: 1, target: 4 },
//     { source: 1, target: 5 },
//     { source: 2, target: 8 },
//     { source: 3, target: 6 },
//     { source: 6, target: 7 },
//     { source: 7, target: 8 },
//     { source: 8, target: 9 },
//     { source: 8, target: 10 },
//     { source: 8, target: 11 }
//   ]
// };
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
    setDefaultNode(node: any) {
      return {
        label: {
          width: 80,
          text: node.name,
          fontSize: 16,
          textBaseline: 'middle',
          textAlign: 'center',
        },
        type: 'rect',
        width: 100,
        height: 30,
        radius: 5,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);

      if (state === 'blur') {
        // blur 状态下给整个节点添加透明度
        node.layer.set('opacity', 0.2);
        return undefined;
      } else {
        // 非 blur 状态下恢复节点透明度
        node.layer.set('opacity', 1);
        return undefined;
      }
    },
    setDefaultEdge() {
      return {
        type: 'hLine',
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
  // 应用布局
  const layout = new DAGLayout({
    graph,
    rankDir: 'LR',
    nodeSep: 50,
    edgeSep: 5,
    rankSep: 60,
    ranker: 'feasibleTree',
  });
  graph.refresh();
  // 适应视图大小
  graph.fitView();

  graph.on('node:click', (e) => {
    const node = e.target;
    const position = getNodeRelativePos(node);
    graph.set('autoDraw', false);
    if (node.get('collapsed')) {
      expand(node);
    } else {
      const data = collapse(node);
      node.set('hideData', data);
    }
    layout.layout();
    graph.refresh();
    const currentPos = getNodeRelativePos(node);
    graph.translate(position.x - currentPos.x, position.y - currentPos.y);
    graph.set('autoDraw', true);
    graph.draw();
  });

  function getNodeRelativePos(node: Node) {
    const { x, y } = node.configs;
    return graph.canvasToViewport(x, y);
  }

  function collapse(node: Node) {
    node.set('collapsed', true);
    const nodeMap = graph.getNodeMap();
    let nodes: any = [];
    let edges: any = [];
    const targets = node.targets;
    for (let i = targets.length - 1; i >= 0; i--) {
      const id = targets[i];
      const hideData = getNodeData(nodeMap[id]);
      nodes = nodes.concat(hideData.nodes);
      edges = edges.concat(hideData.edges);
    }
    return { nodes, edges };
  }

  function getNodeData(node: Node) {
    const nodeMap = graph.getNodeMap();
    let nodes = [node.configs];
    const nodeId = node.get('id');
    let edges: any = [];
    node.edges.forEach((edge: any) => {
      if (edge.get('target') === nodeId) {
        edges.push(edge.configs);
      }
    });
    const targets = node.targets;
    for (let i = targets.length - 1; i >= 0; i--) {
      const id = targets[i];
      const hideData = getNodeData(nodeMap[id]);
      nodes = nodes.concat(hideData.nodes);
      edges = edges.concat(hideData.edges);
    }
    graph.remove(node);
    return { nodes, edges };
  }

  function expand(node: Node) {
    node.set('collapsed', false);
    const { nodes, edges } = node.get('hideData');
    nodes.forEach((nodeData: any) => {
      graph.add('node', nodeData);
    });

    edges.forEach((edgeData: any) => {
      graph.add('edge', edgeData);
    });
  }
})();
