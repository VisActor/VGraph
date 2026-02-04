import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  ForceDirectedLayout,
  ForceCollision,
  ForceLink,
  ForceManyBody,
  ForceCenter,
  ForceX,
  ForceY,
  Rect,
  Shape,
} from '../../../src';
import data from '../../static/miserables.json';

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
    setDefaultNode(node) {
      return {
        type: 'circle',
        width: 20,
        height: 20,
        strokeStyle: '#fff',
        fillStyle: color[node.group % 12],
        label: {
          text: node.id,
          fontSize: 8,
          textBaseline: 'middle',
          textAlign: 'center',
          offsetX: 0,
          offsetY: 12,
          fillStyle: '#333',
          opacity: 1,
        },
      };
    }, // 定制节点样式
    setDefaultEdge() {
      return {
        strokeStyle: '#ddd',
      };
    },
  });
  // 写入数据
  graph.data(data);
  // 添加交互
  graph.addBehavior(highlightRelations);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);

  const nodes = graph.getNodes();
  const collisionForce = new ForceCollision({
    options: {
      width: nodes.map((d: any) => {
        return d.layer.getBBoxForHit().width + 3;
      }), // 定义碰撞的宽度和高度为节点的实际画布宽度和高度
      height: nodes.map((d: any) => {
        return d.layer.getBBoxForHit().height;
      }),
      // radius: 10,
    },
  });
  const consForceX = new ForceX({
    options: {
      strength: 0.5,
      minX: 150 + 10,
      maxX: 800 - 150 - 10,
      withAlpha: false,
    },
  });
  const consForceY = new ForceY({
    options: {
      strength: 0.5,
      minY: 150 + 10,
      maxY: 600 - 150 - 10,
      withAlpha: false,
    },
  });
  const forces = {
    link: new ForceLink({ edges: data.edges, options: { distance: 30 } }),
    charge: new ForceManyBody({ options: { strength: -60 } }),
    collide: collisionForce, // 可以尝试取消无重叠对比效果
    center: new ForceCenter({ options: { x: 800 / 2, y: 600 / 2 } }),
    consX: consForceX,
    consY: consForceY,
  };

  const fdp = new ForceDirectedLayout({
    // 力导布局部分
    graph,
    forces,
    maxIteration: 300, // 总迭代次数
    tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
    onTick: () => {
      graph.refresh(); // 刷新画布
    },
  });
  graph.removeBehavior('dragNode');
  graph.addBehavior(dragNode, {
    // 定义拖拽节点的动作会令力导向布局重启
    onDrag: (node: any, x: number, y: number) => {
      node.set('fx', node.get('x'));
      node.set('fy', node.get('y'));
      fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
      fdp.restart();
    },
    onDrop: (node: any) => {
      node.set('fx', undefined);
      node.set('fy', undefined);
      fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
      fdp.restart();
    },
    delegate: false,
  });
  const addShape = () => {
    const shape = new Rect({
      left: 150,
      top: 150,
      width: 500,
      height: 300,
      opacity: 0.2,
      strokeStyle: '#c44e52',
    });
    shape.capture = false;
    graph.getContainer().add(shape as Shape);
  };
  addShape();
  return function cleanup() {
    graph.destroy();
  };
})();
