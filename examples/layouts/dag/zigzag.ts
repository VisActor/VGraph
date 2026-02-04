import { dragCanvas, Graph, panZoom, registerEdge } from '../../../src';

const NODE_WIDTH = 140;
const NODE_HEIGHT = 40;
const NODE_SEP = 60;
const RANK_SEP = 40;
const MAX_WIDTH = 1000;

registerEdge('zigzagLine', {
  extends: 'turningLine',
  drawCurrentLabel: false,
  getConfigsForShape(configs: any) {
    const { startPoint, endPoint, source } = configs;
    let controlPoints: any = [];
    // 边缘侧
    if (startPoint[0] === endPoint[0]) {
      // 计算控制点
      const x = source.get('x') > MAX_WIDTH / 2 ? (source.get('x') + source.get('width') / 2) : (source.get('x') - source.get('width') / 2);
      const offset = source.get('x') > MAX_WIDTH / 2 ? 20 : -20;
      controlPoints = [
        [ x + offset, startPoint[1]],
        [ x + offset, endPoint[1]]
      ];
      startPoint[0] = x;
      endPoint[0] = x;
    }
    return {
      ...configs,
      controlPoints,
    }
  },
  shape() {},
  afterUpdatePath() { },
});

function layout(graph: Graph) {
  let length = 0;
  let row = 0;
  let step = NODE_WIDTH + NODE_SEP;
  let node = graph.getNodes().find(node => node.sources.length === 0);
  while (node) {
    node.set('x', length);
    node.set('y', row);
    if (length + step > MAX_WIDTH) {
      step *= -1;
      row += (NODE_HEIGHT + RANK_SEP);
      node = node.targets.length > 0 ? graph.getNodeById(node.targets[0]) : undefined;
      continue;
    }
    length += step;
    if (length < 0) {
      length = 0;
      step *= -1;
      row += (NODE_HEIGHT + RANK_SEP);
    }
    node = node.targets.length > 0 ? graph.getNodeById(node.targets[0]) : undefined;
  }
  graph.refresh();
}

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';

  document.body.append(div);
  const nodes: any = [];
  const edges: any = [];
  for (let i = 0; i < 100; i++) {
    nodes.push({ id: i + '' });
    if (i !== 0) {
      edges.push({
        source: `${i - 1}`,
        target: `${i}`
      });
    }
  }
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.1,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        label: node.id,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        fillStyle: undefined,
        radius: 4,
        anchors: [
          [0.0, 0.5],
          [1.0, 0.5],
        ],
      };
    },
    setDefaultEdge(edge: any) {
      return {
        type: 'zigzagLine',
        strokeStyle: '#ddd',
        endArrow: true,
      };
    },
  });
  graph.data({ nodes, edges });

  graph.on('edge:click', (e) => {
    console.log(e.target);
  });
  layout(graph);
  graph.fitView();
  (window as any).__graph = graph;
  graph.addBehavior(panZoom, { sensitivity: 5 });
  graph.addBehavior(dragCanvas);
})();
