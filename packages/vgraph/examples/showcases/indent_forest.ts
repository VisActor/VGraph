import {
  TreeGraph,
  panZoom,
  registerNode,
  Layer,
  Rect,
  Text,
  Icon,
  Circle,
  Node,
  registerEdge,
} from "../../src";
import { IndentForestLayout } from "./indent_forest_layout";
import rawData from "../static/multi_tree.json";

const IMG_URL =
  "https://lf3-static.bytednsdoc.com/obj/eden-cn/luphsleh7upspfbpx/%E5%B1%95%E5%BC%80.svg";

// 注册节点，默认中心坐标为(0, 0), 则坐标范围在(-width / 2, -height / 2) 到 (width / 2, height / 2)
registerNode("underline", {
  extends: "rect",
  drawCurrentLabel: false,
  getConfigsForShape(nodeData: any) {
    return {
      ...nodeData,
      strokeStyle: null,
      opacity: 0,
    };
  },
  shape(layer: Layer, nodeData: any) {
    const { width, height, color } = nodeData;
    // 节点下方的连线
    const rect = new Rect({
      left: -width / 2,
      top: height / 2 - 8.5,
      width,
      height: 1,
      fillStyle: color,
    });
    layer.add(rect);
    const badge = new Layer();
    layer.set("badge", badge);
    layer.add(badge);
    this.updateShapes!(layer, nodeData);
  },
  updateShapes(layer: Layer, nodeData: any) {
    if (!nodeData.children || nodeData.children.length === 0) {
      return;
    }
    const badgeContainer = layer.get("badge");
    const { width, height, color } = nodeData;
    badgeContainer.clear();
    if (!nodeData.collapsed) {
      const bkg = new Circle({
        cx: -width / 2 + 8,
        cy: height / 2 - 8,
        r: 5,
        fillStyle: "#fff",
      });
      const icon = new Icon({
        x: -width / 2 + 8,
        y: height / 2 - 8,
        fillStyle: nodeData.color,
        size: 10,
        icon: "&#xe613;",
        action: "collapse",
      });
      badgeContainer.add(bkg);
      badgeContainer.add(icon);
    } else {
      const childCount = getChildrenCount(nodeData) + "";
      // 收起时数量的文字
      const text = new Text({
        x: width / 2 - 6,
        y: height / 2 - 8,
        fillStyle: "#FFF",
        text: childCount,
        textAlign: "right",
        action: "expand",
      });
      const rectWidth = text.getBBox().width + 12;
      // 收起时数量文本背后的矩形
      const bg = new Rect({
        left: width / 2 - rectWidth,
        top: height / 2 - 15,
        width: rectWidth,
        height: 14,
        radius: 6,
        fillStyle: color,
        action: "expand",
      });
      badgeContainer.add(bg);
      badgeContainer.add(text);
    }
  },
});

registerEdge("stepLine", {
  extends: "turningLine",
  drawCurrentLabel: false,
  getConfigsForShape(configs: any) {
    const { startPoint, endPoint } = configs;
    return {
      ...configs,
      controlPoints: [[startPoint[0], endPoint[1]]],
    };
  },
  shape() {},
  afterUpdatePath() {},
});

function getChildrenCount(nodeData: any) {
  const children = nodeData.children;
  if (!children || children.length === 0) {
    return 0;
  }
  let count = children.length;
  children.forEach((child: any) => {
    count += getChildrenCount(child);
  });

  return count;
}

// 限制展开的层级，用于切换默认展开层数
function showTreeData(depth = 1) {
  data.children.forEach((nodeData: any) => {
    showData(nodeData, depth, 0);
  });
}

function showData(nodeData: any, depth: number, current: number) {
  if (nodeData.children.length === 0) {
    nodeData.children = nodeData.primary_metrics;
  }
  if (current < depth) {
    nodeData.collapsed = false;
    nodeData.children.forEach((nodeData: any) => {
      showData(nodeData, depth, 1);
    });
  } else if (current === depth) {
    nodeData.collapsed = true;
  }
}

const data = {
  id: "root",
  children: rawData.items,
};

const NODE_COLORS = [
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
];

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const layout = new IndentForestLayout({
    direction: "LR",
    indent: 14,
    subIndent: 60,
    size() {
      return [800, 600];
    },
    nodeSep() {
      return 20;
    },
    nodeSize(nodeData: any) {
      return [nodeData.width, nodeData.height];
    },
    rankSep() {
      return 40;
    },
  });

  const text = new Text({
    x: 0,
    y: 0,
    textAlign: "left",
    text: "",
    fontSize: 10,
    fontWeight: 500,
  });

  const graph: TreeGraph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    animate: true,

    fitViewAfterLayout: false,
    layout,
    setDefaultNode(node: any) {
      if (node.depth === 1) {
        return {
          type: "rect",
          width: 100,
          height: 36,
          fillStyle: "#E3E5EB",
          strokeStyle: "#E3E5EB",
          radius: 8,
          label: {
            text: node.nodeLabel,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 500,
            fillStyle: "#1B1F23",
            width: 76,
            textOverflow: "ellipsis",
          },
          anchors: [[0.5, 1]],
        };
      }
      text.set("text", node.nodeLabel);
      return {
        type: "underline",
        label: {
          text: node.nodeLabel,
          fontSize: 10,
          fontWeight: 500,
          fillStyle: "#1B1F23",
          width: 76,
          textOverflow: "ellipsis",
          offsetY: -6,
        },
        color: node.color || NODE_COLORS[Math.round(Math.random() * 9)],
        width: text.getBBox().width + 40,
        height: 18,
        anchors: [{ position: [0, 1], offsets: [8, -8] }],
      };
    },
    setDefaultEdge(edgeData: any) {
      const target = graph.getNodeById(edgeData.target);
      return {
        strokeStyle: target.get("color"),
        type: "stepLine",
      };
    },

    setEdgeStateStyles(state: string) {
      if (state === "blur") {
        return {
          opacity: 0.3,
        };
      }
    },
  });
  showTreeData();
  // 写入数据
  graph.data(data as any);
  const root = graph.getNodeById("root");
  const firstNode = graph.getNodeById(data.children[0].id as any);
  root.updatePosition(firstNode.get("x"), firstNode.get("y"));
  root.hide();
  graph.fitView();

  graph.addBehavior(panZoom, {
    limit: true,
  });
  graph.refresh();

  graph.on("node:click", (e) => {
    console.log(e.target);
    if (e.relatedTarget?.get("action") === "expand") {
      expandChild(e.target);
      graph.expand(e.target);
      e.target.updateData();
    }
    if (e.relatedTarget?.get("action") === "collapse") {
      graph.collapse(e.target);
      e.target.updateData();
    }
  });

  (window as any).graph = graph;

  function expandChild(node: Node) {
    node.get("children")?.forEach((nodeData: any) => {
      const child = graph.getNodeById(nodeData.id);
      child.updateData({ collapsed: true });
    });
  }
})();
