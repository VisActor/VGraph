import {
  Graph,
  registerNode,
  Icon,
  Layer,
  dragNode,
  panZoom,
  Circle,
  Text,
} from "../../src";

const data = {
  nodes: [
    {
      id: "node1",
      x: 200,
      y: 100,
      ratio: 0.4,
      label: "node1",
      icon: "&#xe612;",
    },
    {
      id: "node2",
      x: 500,
      y: 100,
      ratio: 0.8,
      label: "node2222222222",
      icon: "&#xe601;",
    },
  ],
  edges: [
    {
      source: "node1",
      target: "node2",
    },
  ],
};

registerNode("iconRect", {
  type: "iconRect",
  extends: "rect",
  // 采用内置矩形 rect 的 label 绘制，本身不另行绘制 label
  drawCurrentLabel: false,
  getConfigsForShape(nodeData: any) {
    return {
      ...nodeData,
      radius: 4,
      label: {
        text: nodeData.label,
        textAlign: "left",
        textBaseline: "middle",
        textOverflow: "ellipsis",
        // 为 icon 预留出空间，与 icon 间距为 4px
        offsetX: 18,
      },
    };
  },
  shape(layer: Layer, configs: any) {
    const icon = new Icon({
      // 左 padding 12px + 1/2 icon size
      x: -configs.width / 2 + 19,
      // 垂直居中
      y: 0,
      size: 14,
      icon: configs.icon,
      fillStyle: configs.strokeStyle || "#545454",
    });
    layer.add(icon);
  },
});

registerNode("processCircle", {
  type: "processCircle",
  extends: "rect",
  // 采用内置矩形 rect 的 label 绘制，本身不另行绘制 label
  drawCurrentLabel: false,
  getConfigsForShape(nodeData: any) {
    return {
      ...nodeData,
      radius: 4,
      label: {
        text: nodeData.label,
        textAlign: "left",
        textBaseline: "middle",
        textOverflow: "ellipsis",
        // 为 icon 预留出空间，与 icon 间距为 4px
        offsetX: 48,
      },
    };
  },
  shape(layer: Layer, configs: any) {
    const r = 20;
    const backCircle = new Circle({
      cx: -configs.width / 2 + 28,
      cy: 0,
      r,
      strokeStyle: "#ccc",
      lineWidth: 6,
    });
    const length = Math.PI * 2 * r;
    const frontCircle = new Circle({
      cx: -configs.width / 2 + 28,
      cy: 0,
      r,
      strokeStyle: "#3073F2",
      lineDash: [length * configs.ratio, length * (1 - configs.ratio)],
      lineWidth: 6,
    });
    frontCircle.rotate(90);
    const text = new Text({
      x: -configs.width / 2 + 28,
      y: 0,
      textAlign: "center",
      text: `${Math.round(configs.ratio * 100)}%`,
    });
    layer.add(backCircle);
    layer.add(frontCircle);
    layer.add(text);
  },
});

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
    linkCenter: false,
    setDefaultNode(node) {
      return {
        type: "processCircle",
        width: 200,
        height: 80,
        fillStyle: "#FFF",
        strokeStyle: "#3073F2",
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
  });
  // 写入数据
  graph.data(data);

  graph.addBehavior(dragNode, {
    delegate: false,
  });
  graph.addBehavior(panZoom);
})();
