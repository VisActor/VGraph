import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  Shape,
  RawTooltip,
  ForceDirectedLayout,
  ForceLink,
  ForceManyBody,
  ForceRadial,
  Circle,
} from "../../../src";
import dataRaw from "../../static/ego.json";
const data = dataRaw as any;

const color = [
  "#4c72b0",
  "#dd8452",
  "#25a868",
  "#c44e52",
  "#8172b3",
  "#937860",
  "#da8bc3",
  "#8c8c8c",
  "#ccb974",
  "#64b5cd",
  "#a305e5",
  "#000000",
  "#d0ff8f",
];
const centerX = 800 / 2;
const centerY = 600 / 2;
const depthUpperBound = 8;
const nodeSize = 15;
(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
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
        type: "circle",
        width: nodeSize,
        height: nodeSize,
        strokeStyle: "#fff",
        label: null,
        fillStyle: color[node.depth % 12 || 0],
      };
    }, // 定制节点样式
    setDefaultEdge() {
      return {
        strokeStyle: "#ccc",
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
  const nodes = graph.getNodes().map((d: any) => d.configs);
  // 注意 这里graph getNodes 的顺序和data.nodes的顺序很有可能会不一致
  // 注意所有用到的nodes应该保持一致

  const centerNodeIdx = nodes.findIndex((d: any) => d.id === "2"); // 圆心节点的索引
  setBfsDepth(centerNodeIdx, graph);
  graph.updateData(data);
  const depths = nodes.map((d: any) => d.depth);
  const maxDepth = Math.max(...depths);
  const depthNum = {} as Map<string, number>;
  depths.forEach((d) => {
    if (!depthNum[d]) {
      depthNum[d] = 1;
    } else {
      depthNum[d]++;
    }
  });
  const maxNum = Math.max(...Object.entries(depthNum).map((kv) => kv[1]));

  const gap = (Math.sqrt(maxNum) * nodeSize) / 2;
  console.log(depthNum, maxNum, gap);
  const radial = 2 * gap + 30;
  // console.log(graph.getNodes());
  nodes[centerNodeIdx].fx = centerX - 0;
  nodes[centerNodeIdx].fy = centerY - 0;
  // 数据处理，定义中心节点到其他节点的深度
  const minRs = nodes.map((d: any) => d.depth * radial - gap);
  const maxRs = nodes.map((d: any) => d.depth * radial + gap); // 限定点的范围是 depth * radius +- gap

  const forces = {
    link: new ForceLink({
      edges: data.edges,
      options: { distance: 0.6 * radial },
    }),
    manybody: new ForceManyBody({ options: { strength: -80 } }), // 基础力导向部分
    radial: new ForceRadial({
      options: {
        minR: minRs,
        maxR: maxRs,
        strength: 0.05,
        withAlpha: false,
        posX: centerX,
        posY: centerY,
      },
    }),
  };
  // 辅助背景圆环
  addBkgShapes(maxDepth, radial, graph);
  const fdp = new ForceDirectedLayout({
    // 力导布局部分
    graph,
    forces,
    clearOnEndOnFirstCall: true,
    maxIteration: 300,
    tickIterations: 10,
    center: { x: centerX, y: centerY },
    onTick: () => {
      graph.refresh(); // 刷新画布
    },
    onEnd: () => {
      graph.fitView(); // 居中并缩放适应画布
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tooltip = new RawTooltip(graph, {
    styles: {
      border: null,
      backgroundColor: null,
    },
    content(entity: any, type: any) {
      if (type === "edge") {
        return `${entity.get("id")}`;
      }
      return `${entity.get("id")}`;
    },
    target: "node",
  });
  return function cleanup() {
    graph.destroy();
  };
})();

function bfs(graph: Graph, startnode: any, callback: any, directed = false) {
  const queue = [] as any;
  queue.push(startnode);
  const visited = {} as any;
  visited[startnode.get("id")] = true;
  while (queue.length > 0) {
    const node = queue.shift();
    node.targets.forEach((vid: string) => {
      const nextNode = graph.getNodeMap()[vid];
      if (!visited[vid]) {
        visited[vid] = true;
        queue.push(nextNode);
        callback(nextNode, node);
      }
    });
    if (!directed) {
      node.sources.forEach((vid: string) => {
        const nextNode = graph.getNodeMap()[vid];
        if (!visited[vid]) {
          visited[vid] = true;
          queue.push(nextNode);
          callback(nextNode, node);
        }
      });
    }
  }
}

function addBkgShapes(maxDepth = 8, radial: number, graph: Graph) {
  const addShape = (rc: number) => {
    const shape = new Circle({
      cx: centerX,
      cy: centerY,
      r: rc,
      opacity: 0.2,
      strokeStyle: "#c44e52",
    });
    shape.capture = false;
    graph.getContainer().add(shape as Shape);
  };
  for (let i = 0; i < maxDepth + 1; i++) {
    addShape((radial * (i + i + 1)) / 2);
  } // 添加辅助圆
  graph.fitView();
  graph.refresh();
}

function setBfsDepth(centerNodeIdx: number, graph: any) {
  graph.getNodes().map((d: any) => d.set("depth", depthUpperBound));
  graph.getNodes()[centerNodeIdx].set("depth", 0);
  bfs(
    graph,
    graph.getNodes()[centerNodeIdx],
    (node: any, parent: any) => {
      if (parent) {
        node.set(
          "depth",
          parent.get("depth") + 1 > depthUpperBound
            ? depthUpperBound
            : parent.get("depth") + 1
        );
      }
    },
    false
  );
}
