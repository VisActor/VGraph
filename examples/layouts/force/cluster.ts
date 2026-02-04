import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  ForceDirectedLayout,
  ForceLink,
  ForceManyBody,
  IntraClusterForce,
  InterClusterForce,
  ForceX,
  ForceY,
  ForceCollision,
  ForceCenter,
} from '../../../src';
import viscoauthorRaw from '../../static/visCoauthor.json';
// function bubbleData() {
//   const k = 8;
//   const nClusters = 5;
//   const r = () => Math.random() * 3 * k + k;
//   const nodes = Array.from({ length: 200 }, (_, i) => ({
//     r: r(),
//     group: i && i % nClusters,
//   }));
//   const data = { nodes, edges: [] };
//   return data;
// }
// const data = bubbleData();
const data = dealData(JSON.parse(JSON.stringify(viscoauthorRaw)));

const color = [
  '#4c72b0',
  '#dd8452',
  '#25a868',
  '#c44e52',
  '#8172b3',
  '#937860',
  '#da8bc3',
  '#8c8c8c',
  '#ccb974',
  '#64b5cd',
  '#a305e5',
  '#000000',
  '#d0ff8f',
];
(() => {
    const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);
  // 初始化 graph 实例
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        type: 'circle',
        width: 10,
        height: 10,
        strokeStyle: '#fff',
        fillStyle: color[node.group % 13],
      };
    }, // 定制节点样式
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
  // 写入数据
  graph.data(data);
  // 添加交互
  graph.addBehavior(highlightRelations);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  const x = 800 / 2;
  const y = 600 / 2;
  const forces = {
    link: new ForceLink({ edges: data.edges, options: { distance: 0 } }), // 力导向吸引力
    manybody: new ForceManyBody({ options: { strength: -100 } }), // 力导向排斥力，整体依旧呈现力导向布局。
    attrCluster: new IntraClusterForce({ options: { strength: 0.2 } }), // 类内吸引力, 如果聚簇效果不够显著可以尝试增加该值
    repulCluster: new InterClusterForce({ options: { strength: -10 } }), // 类间排斥力，可注释掉这两行看看效果
    x: new ForceX({ options: { x, strength: 0.2 } }), // 由于类间的排斥力，可能会导致不同类相距较远，通过中心里使得节点集中在中心位置
    y: new ForceY({ options: { y, strength: 0.2 } }), //
    collision: new ForceCollision({
      options: { radius: (d: any) => d.r || 5 },
    }),
    center: new ForceCenter({ options: { x, y } }),
  };

  const fdp = new ForceDirectedLayout({
    // 力导布局部分
    graph,
    forces,
    clearOnEndOnFirstCall: true,
    maxIteration: 300, // 总迭代次数
    tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
    onTick: () => {
      graph.refresh(); // 刷新画布
    },
    onEnd: () => {
      graph.fitView(); // 居中并缩放适应画布
    },
  });
  graph.removeBehavior('dragNode');
  graph.addBehavior(dragNode, {
    // 定义拖拽节点的动作会令力导向布局重启
    onDrag: (node: any, x: number, y: number) => {
      node.configs.fx = node.configs.x;
      node.configs.fy = node.configs.y;
      fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
      fdp.restart();
    },
    onDrop: (node: any) => {
      node.configs.fx = undefined;
      node.configs.fy = undefined;
      fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
      fdp.restart();
    },
    delegate: false,
  });
  return function cleanup() {
    graph.destroy();
  };
})();

function dealData(data: any) {
  const nodes = data.nodes;
  nodes.forEach((node: any) => {
    node.id = node.name;
  });
  data.links.forEach((edge: any) => {
    edge.source = nodes[edge.source].id;
    edge.target = nodes[edge.target].id;
  });
  data.edges = data.links;
  return data;
}
