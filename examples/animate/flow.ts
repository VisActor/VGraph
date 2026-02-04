import {
  Graph,
  panZoom,
  dragCanvas,
  DAGLayout,
  GraphEvent,
  Node,
  Edge
} from '../../src';
import data from '../static/job.json';

const colors: any = {
  未就绪: '#7152E8',
  等待执行: '#EE8B24',
  执行中: '#2367EA',
  成功: '#07A35A',
  失败: '#D94147',
  终止: '#5470A5'
};
const icons: any = {
  未就绪: '&#xe60e;',
  等待执行: '&#xe60c;',
  执行中: '&#xe60a;',
  成功: '&#xe6b9;',
  失败: '&#xe60b;',
  终止: '&#xe614;'
};

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
    minRatio: 0.01,
    maxRatio: 8,
    linkCenter: false,
    setDefaultNode(node: any) {
      return {
        type: 'tag',
        width: 120,
        height: 40,
        color: colors[node.status],
        label: node.name,
        anchors: [
          [0.5, 0.0],
          [0.5, 1.0]
        ],
        icon: {
          icon: icons[node.status],
          size: 25,
          background: {
            width: 40
          },
        }
      };
    },
    setDefaultEdge() {
      return {
        type: 'vLine',
        endArrow: {
          width: 3,
          height: 5
        },
        strokeStyle: '#D1D5DA',
        appendSize: 2
      };
    }
  });
  // 写入数据
  graph.data(data);
  new DAGLayout({ graph });
  graph.refresh();
  graph.fitView();
  // 添加交互
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);

  document.fonts.ready.then(() => {
    graph.draw();
  });

  graph.on('node:mouseenter', (e: GraphEvent) => {
    const node = e.target as Node;
    animateEdges(node, 'target', 'source');
    animateEdges(node, 'source', 'target');
  });

  graph.on('node:mouseleave', (e: GraphEvent) => {
    graph.stopAnimate();
  });

  function animateEdges(node: Node, nodePos: 'source' | 'target', relatePos: 'source' | 'target') {
    const nodeId = node.get('id');
    node.edges.forEach((edge: Edge) => {
      if (edge.isAnimating()) {
        return;
      }
      if (edge.get(nodePos) === nodeId) {
        graph.animate({
          target: edge,
          type: 'flow',
        });
       animateEdges(graph.getNodeById(edge.get(relatePos)), nodePos, relatePos);
      }
    });
  }

})();