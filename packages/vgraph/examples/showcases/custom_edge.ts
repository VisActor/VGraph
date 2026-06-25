import { Graph, registerEdge, Text, Layer, dragNode, panZoom } from "../../src";

const data = {
  nodes: [
    {
      id: "node1",
      x: 100,
      y: 100,
      label: "node1",
    },
    {
      id: "node2",
      x: 300,
      y: 100,
      label: "node2",
    },
  ],
  edges: [
    {
      source: "node1",
      target: "node2",
      labels: ["hello", "world"],
    },
  ],
};

registerEdge("multipleLabelsEdge", {
  // 扩展内置直线连线
  extends: "line",
  // 在内置直线中画连线，在本 shape 中不画左边 label
  drawCurrentLabel: false,
  getConfigsForShape(edgeData: any) {
    // 返回内置直线部分的配置
    return {
      ...edgeData,
      label: {
        // 配置内置图形画的左边 label 的样式
        text: edgeData.labels[0],
        position: 0,
        offsetX: 10,
        autoRotate: true,
        textBaseline: "bottom",
      },
      otherLabel: {
        // 右侧 label 的配置
        position: 1,
        offsetX: -10,
        autoRotate: true,
        text: edgeData.labels[1],
        textBaseline: "bottom",
      },
    };
  },
  shape(layer: Layer, edgeConfigs: any) {
    const path = layer.find((shape) => shape.get("_keyShape"));
    const { otherLabel } = edgeConfigs;
    // 采用内置节点的文本标签计算方法来计算右侧文本的配置
    const labelConfigs = this.getCustomLabelConfigs(path, {
      label: otherLabel,
    });
    // 配置右边 label 的样式
    const label = new Text(labelConfigs);
    label.set("_rightLabel", true);
    layer.add(label);
    this.rotateLabel(label);
  },
  rotateLabel(label: Text) {
    const rotate = label.get("rotate");
    const x = label.get("x");
    const y = label.get("y");
    label.setMatrix([1, 0, 0, 1, 0, 0]);
    if (rotate) {
      label.translate(-x, -y);
      label.rawRotate(rotate, true);
      label.translate(x, y);
    }
  },
  afterUpdatePath(layer: Layer, configs: any) {
    const path = layer.find((shape) => shape.get("_keyShape"));
    const label = layer.find((shape) => shape.get("_rightLabel"));
    if (label) {
      // 采用内置节点的文本标签计算方法来更新右侧文本的配置
      const labelConfigs = this.getCustomLabelConfigs(path, {
        label: configs.otherLabel,
      });
      label.set(labelConfigs);
      this.rotateLabel(label);
    }
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
        type: "circle",
        width: 50,
        height: 50,
        fillStyle: "#E4EDFE",
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
    setDefaultEdge() {
      return {
        type: "multipleLabelsEdge",
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
  // 写入数据
  graph.data(data);

  graph.addBehavior(dragNode, {
    delegate: false,
  });
  graph.addBehavior(panZoom);
})();
