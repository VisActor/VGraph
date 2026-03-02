import {
  TreeGraph,
  panZoom,
  dragCanvas,
  Node,
  Edge,
  GraphEvent,
} from "../../../src";

const div = document.createElement("div");
div.style.border = "1px solid #666";
div.style.width = "800px";
div.style.height = "600px";

document.body.append(div);
// 初始化 graph 实例
const graph = new TreeGraph({
  container: div,
  width: div.offsetWidth,
  height: div.offsetHeight,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: {
    type: "dendrogram",
    options: {
      direction: "LR",
      size() {
        return [800, 600];
      },
      nodeSize() {
        return [8, 8];
      },
      rankSep() {
        return 100;
      },
      nodeSep() {
        return 10;
      },
      // 可以通过注释 radial: true 查看默认生态树效果来做对比
      radial: true,
    },
  },
  linkCenter: true,
  setDefaultNode(node) {
    return {
      id: node.name,
      type: "circle",
      width: 8,
      height: 8,
      strokeStyle: "#4c72b0",
      fillStyle: node.value ? "#4c72b0" : undefined,
      label: {
        text: node.name,
        width: 100,
        textAlign: "left",
        textBaseline: "middle",
        fontSize: node.value ? 10 : 14,
        offsetX: 10,
        rotate: Math.PI * 2 - node.rad,
        // capture: false,
      },
    };
  },
  setNodeStateStyles(state: string) {
    if (state === "enter") {
      return {
        fillStyle: "#07A35A",
      };
    } else if (state === "hover") {
      return {
        strokeStyle: "#07A35A",
        lineWidth: 3,
      };
    }
  },
  setDefaultEdge() {
    return {
      type: "vCubic",
      strokeStyle: "#ccc",
    };
  },
  setEdgeStateStyles(state: string) {
    if (state === "hover") {
      return {
        strokeStyle: "#07A35A",
      };
    }
  },
});

// 添加交互
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
import data from "../../static/radial_tree_data.json";

// 写入数据
graph.data(data);
// 适应窗口大小
graph.fitView();

// 监听 click 事件收起展开子树
graph.on("node:click", (e: GraphEvent) => {
  if (!e.target.get("children")) {
    return;
  }
  const currentNode = e.target as Node;
  graph.set("autoDraw", false);
  graph.toggleCollapse(currentNode);
  graph.getNodes().forEach((node: Node) => {
    const label = node.getLabel();
    if (
      node.get("rad") !== undefined &&
      node.get("rad") !== Math.PI * 2 - label.rotate
    ) {
      node.updateData({ rad: node.get("rad") });
    }
  });
  graph.set("autoDraw", true);
  graph.draw();
});

// 鼠标移入节点，高亮路径
graph.on("node:mouseenter", (e: GraphEvent) => {
  const node = e.target as Node;
  // 根节点 hover 不做处理
  if (node.get("id") === "flare") {
    return;
  }
  graph.getNodes().forEach((node: any) => {
    node.removeState("hover");
  });
  graph.getEdges().forEach((edge: any) => {
    edge.removeState("hover");
  });

  node.setState("hover");
  node.edges.forEach((edge: any) => {
    edge.setState("hover");
  });
  let source = node.sources.concat();
  let target = node.targets.concat();

  while (source.length) {
    const node = graph.getNodeById(source.shift() as string);
    node.setState("hover");
    source = source.concat(node.sources);
    node.edges.forEach((edge: any) => {
      if (edge.target === node) {
        edge.setState("hover");
      }
    });

    while (target.length) {
      const node = graph.getNodeById(target.shift() as string);
      node.setState("hover");
      target = target.concat(node.targets);
      node.edges.forEach((edge: Edge) => {
        if (edge.source === node) {
          edge.setState("hover");
        }
      });
    }
  }
});
// 鼠标移出节点复原
graph.on("node:mouseleave", () => {
  graph.getNodes().forEach((node: Node) => {
    node.removeState("hover");
  });
  graph.getEdges().forEach((edge: Edge) => {
    edge.removeState("hover");
  });
});
