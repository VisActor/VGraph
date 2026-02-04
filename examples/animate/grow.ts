import {
  Graph,
  panZoom,
  dragCanvas,
  GraphEvent,
  Node,
  Edge,
  defaultForces,
  ForceLink,
  ForceDirectedLayout
} from '../../src';
import data from '../static/miserables.json'

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
  '#a305e5',
];

(() => {
  const div = document.createElement('div');
  div.style.position = 'relative';
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  div.style.height = '600px';
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        id: node.id,
        type: 'circle',
        width: 15,
        height: 15,
        fillStyle: colors[0],
        strokeStyle: undefined,
      };
    },
    setDefaultEdge() {
      return {
        hitWidth: 6,
        strokeStyle: '#D1D5DA',
      };
    },
    setEdgeStateStyles(state: string) {
      return {
        strokeStyle: '#FF8406',
      }
    }
  });
  // 写入数据
  graph.data(data);
  const forces = defaultForces(data.edges, 400, 300);
  const forceLink = new ForceLink({
    edges: data.edges,
    options: { distance: 100 }
  });
  forces.set('link', forceLink);
  const fdp = new ForceDirectedLayout({
    // 力导布局部分
    graph,
    forces,
    maxIteration: 100, // 总迭代次数
    onTick: () => {
      graph.refresh(); // 刷新画布
    },
    onEnd: () => {
      graph.fitView();
    },
  });
  graph.refresh();
  graph.fitView();

  // 添加交互
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas, {
    canvasOnly: false
  });

  document.fonts.ready.then(() => {
    graph.draw();
  });

  graph.on('node:mouseenter', (e: GraphEvent) => {
    const node = e.target as Node;
    const id = node.get('id');
    node.edges.forEach((edge: Edge) => {
      if (edge.get('source') !== id) {
        return;
      }
      edge.setState('active');
      graph.animate({
        target: edge as Edge,
        type: 'grow',
      });
    });
  });

  graph.on('node:mouseleave', (e: GraphEvent) => {
    const node = e.target as Node;
    const id = node.get('id');
    graph.stopAnimate();
    node.edges.forEach((edge: Edge) => {
      if (edge.get('source') !== id) {
        return;
      }
      edge.removeState('active');
    });
  });
})();
