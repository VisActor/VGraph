import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  NodeConfigs,
  Node,
  EdgeData,
  NodeData,
  uuid,
} from "../../../src";
import data from "../../static/miserables.json";

// 可以尝试切换数据
const color = [
  "#5678D6",
  "#EB8D2F",
  "#59A649",
  "#E0BA2D",
  "#A56AAD",
  "#6DBEC9",
  "#D95145",
  "#A0A0AD",
  "#94674E",
  "#ED848F",
  "#a305e5",
  "#000000",
  "#d0ff8f",
];
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
    minRatio: 0.02,
    maxRatio: 8,
    layout: {
      type: "force",
      options: {
        autoFDP: true,
        onTick: () => {
          graph.refresh();
        },
        onEnd: () => {
          graph.refresh();
          graph.fitView();
        },
      },
    },
    linkCenter: true,
    setDefaultNode(node) {
      return {
        type: "circle",
        width: 15,
        height: 15,
        strokeStyle: "#fff",
        fillStyle: color[node.group % 13 || 0],
      };
    }, // 定制节点样式
    setNodeStateStyles(state) {
      if (state === "active") {
        return {
          opacity: 1.0,
        };
      }
      return { opacity: 0.2 };
    },
    setDefaultEdge() {
      return {
        strokeStyle: "#ccc",
      };
    },
    setEdgeStateStyles(state) {
      if (state === "active") {
        return {
          strokeStyle: "#A7A7A7",
        };
      }
      return { opacity: 0.2 };
    },
  });

  const fdp = graph.get("layout");

  // 写入数据
  graph.data(data);
  // 添加交互
  graph.addBehavior(highlightRelations);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode, {
    // 定义拖拽节点的动作会令力导向布局重启
    onDrag: (node: any, x: number, y: number) => {
      node.set("fx", node.get("x"));
      node.set("fy", node.get("y"));
      fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
      fdp.restart();
    },
    onDrop: (node: any) => {
      node.set("fx", undefined);
      node.set("fy", undefined);
      fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
      fdp.restart();
    },
    delegate: false,
  });
  graph.on("node:dblclick", (e) => {
    const target = e.target;
    if (target.get("children")) {
      collapseNode(target.configs, data);
      graph.updateData(data);
      return;
    }
    // mock 数据
    const id = target.get("id");
    const nodes = [] as NodeData[];
    const edges = [] as EdgeData[];
    const autoLayout = graph.disableAutoLayout();
    for (let i = 0; i < 20; i++) {
      const nid = uuid(8) as string;
      nodes.push({
        id: nid,
        group:
          Math.random() > 0.1
            ? target.get("group")
            : Math.round(Math.random() * 10),
      });
      edges.push({ source: id, target: nid });
    }
    edges.push({ source: nodes[0].id, target: nodes[1].id });
    edges.push({ source: nodes[2].id, target: nodes[3].id });
    edges.push({ source: nodes[4].id, target: nodes[5].id });
    edges.push({ source: nodes[5].id, target: nodes[6].id });
    edges.push({ source: nodes[6].id, target: nodes[7].id });

    expandNode(target.configs, { nodes, edges }, data);
    graph.updateData(data); // 对于增量远大于存量的数据是不是可以直接 graph.data
    assignPosition(target, nodes.map((d) => d.id) as string[], graph);
    graph.enableAutoLayout(autoLayout);
  });
  return function cleanup() {
    graph.destroy();
  };
})();

function assignPosition(parent: Node, children: string[], graph: Graph) {
  const { x, y } = parent.configs;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const nodes = graph.getNodes().map((d) => d.configs);
  nodes.forEach((node: NodeConfigs) => {
    if (node.x) {
      if (node.x < minX) {
        minX = node.x;
      }
      if (node.x > maxX) {
        maxX = node.x;
      }
    }
    if (node.y) {
      if (node.y < minY) {
        minY = node.y;
      }
      if (node.y > maxY) {
        maxY = node.y;
      }
    }
  });
  const xRange = maxX - minX;
  const yRange = maxY - minY;
  // const scale = (xRange * yRange) / Math.sqrt(nodes.length);
  // const jiggleScale = scale * 5e2;
  // const nodeIdMap = graph.getNodeMap();
  // children.forEach((nodeId: string) => {
  //   const node = nodeIdMap[nodeId].configs;
  //   if (!node.x) { node.x = x + jiggle() * jiggleScale };
  //   if (!node.y) { node.y = y + jiggle() * jiggleScale };
  //   if (!node.vx) node.vx = 0;
  //   if (!node.vy) node.vy = 0;
  // });
  const initialRadius = Math.max(
    Math.sqrt((xRange * yRange) / nodes.length) * 0.01,
    1
  );
  console.log(initialRadius);
  const initialAngle = Math.PI * (3 - Math.sqrt(5));
  const nodeIdMap = graph.getNodeMap();
  let count = 0;
  children.forEach((nodeId: string) => {
    const node = nodeIdMap[nodeId].configs;
    if (isNaN(node.vx)) {
      node.vx = 0;
    }
    if (isNaN(node.vy)) {
      node.vy = 0;
    }
    const radius = initialRadius * Math.sqrt(0.5 + count);
    const angle = count * initialAngle;
    if (!node.x) {
      count++;
      if (node.fx) {
        node.x = node.fx;
      } else {
        node.x = x + radius * Math.cos(angle) * 5;
      }
    }
    if (!node.y) {
      if (node.fy) {
        node.y = node.fy;
      } else {
        node.y = y + radius * Math.sin(angle) * 5;
      }
    }
  });
}

function collapseNode(targetNode: NodeConfigs, data: any) {
  collapse(targetNode, data);
  const collapseNode = data.nodes.filter((node: any) => node.collapse);
  const collapseEdge = data.edges.filter((edge: any) => edge.collapse);
  data.nodes = data.nodes.filter((node: any) => !node.collapse);
  data.edges = data.edges.filter((edge: any) => !edge.collapse);
  collapseNode.forEach((node: any) => {
    node = undefined;
  });
  collapseEdge.forEach((edge: any) => {
    edge = undefined;
  });
  targetNode.children = undefined;
}
function collapse(targetNode: NodeConfigs, data: any) {
  if (targetNode.children) {
    targetNode.children.forEach((child: NodeConfigs) => {
      collapse(child, data);
      child.collapse = true;
    });
    targetNode.children = null;
  }
  if (targetNode.expendEdges) {
    targetNode.expendEdges.forEach((edge: any) => {
      edge.collapse = true;
    });
  }
}
function expandNode(
  targetNode: NodeConfigs,
  expandData: { nodes: any; edges: any },
  data: any
) {
  targetNode.children = [];
  targetNode.expendEdges = [];
  expandData.nodes.forEach((node: NodeConfigs) => {
    targetNode.children.push(node);
    data.nodes.push(node);
  });
  expandData.edges.forEach((edge: { source: string; target: string }) => {
    data.edges.push(edge);
    targetNode.expendEdges.push(edge);
  });
}
