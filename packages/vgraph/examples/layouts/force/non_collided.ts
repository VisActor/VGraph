import {
  Graph,
  panZoom,
  dragCanvas,
  dragNode,
  ForceCollision,
  ForceManyBody,
  ForceX,
  ForceY,
  Node,
} from "../../../src";
// 生成随机的数据
function bubbleData() {
  const k = 4;
  const nClusters = 10;
  const r = () => Math.random() * 3 * k + k;
  const nodes = Array.from({ length: 200 }, (_, i) => ({
    r: r(),
    group: i && i % nClusters,
  }));
  const data = { nodes, edges: [] };
  return data;
}
const data = bubbleData();

const color = [
  "#5778A4",
  "#E49444",
  "#D14A3E",
  "#85B6B2",
  "#6A9F58",
  "#E7CA60",
  "#A87C9F",
  "#F2A2A9",
  "#966A62",
  "#B3B3B9",
];
(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);
  // 初始化 graph 实例
  const width = 800;
  const height = 600;
  const nonCollisionForce = {
    x: new ForceX({ options: { x: width / 2, strength: 0.1 } }),
    y: new ForceY({ options: { y: height / 2, strength: 0.1 } }),
    repul: new ForceManyBody({ options: { strength: -10 } }), // 上面三个力会导致重叠的节点分布。 可以尝试注释掉 collision 看看效果变化
    collision: new ForceCollision({
      options: { radius: data.nodes.map((d) => d.r) },
    }), // 设置无重叠的力，设置节点半径作为碰撞半径
  };
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    layout: {
      type: "force",
      options: {
        forces: nonCollisionForce,
        maxIteration: 300, // 总迭代次数
        tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
        onTick: () => {
          graph.refresh();
        },
        onEnd: () => {
          graph.fitView();
        },
        clearOnEndOnFirstCall: true,
        //   initMode: 'random',
      },
    },
    setDefaultNode(nodeData: { [k: string]: any }) {
      return {
        type: "circle",
        width: nodeData.r * 2,
        height: nodeData.r * 2,
        strokeStyle: "#fff",
        fillStyle: color[nodeData.group % 12],
      };
    }, // 定制节点样式
  });
  // 写入数据
  graph.data(data);

  // 添加交互
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode, {
    // 定义拖拽节点的动作会令力导向布局重启
    onDrag: (node: Node, x: number, y: number) => {
      node.configs.fx = node.configs.x;
      node.configs.fy = node.configs.y;
      graph.layout();
    },
    onDrop: (node: Node) => {
      node.configs.fx = undefined;
      node.configs.fy = undefined;
      graph.layout();
    },
    delegate: false,
  });
  return function cleanup() {
    graph.destroy();
  };
})();
