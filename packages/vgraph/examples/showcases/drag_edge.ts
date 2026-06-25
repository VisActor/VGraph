import { Graph, dragNode, panZoom, dragEdge, AnchorConfigs } from "../../src";

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
  edges: [{ source: "node1", target: "node2" }],
};

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
        // type: 'circle',
        width: 100,
        height: 40,
        radius: 4,
        // fillStyle: '#E4EDFE',
        strokeStyle: "#3073F2",
        anchors: [
          {
            show: "hover",
            position: [0, 0.5],
            setStyles() {
              return {
                size: 6,
                fillStyle: "#F3F9FF",
                strokeStyle: "#3073F2",
                cursor: "crosshair",
              };
            },
          },
          {
            show: "hover",
            position: [1, 0.5],
            setStyles() {
              return {
                size: 6,
                fillStyle: "#F3F9FF",
                strokeStyle: "#3073F2",
                cursor: "crosshair",
              };
            },
          },
          {
            show: "hover",
            position: [0.5, 0],
            setStyles() {
              return {
                size: 6,
                fillStyle: "#F3F9FF",
                strokeStyle: "#3073F2",
                cursor: "crosshair",
              };
            },
          },
          {
            show: "hover",
            position: [0.5, 1],
            setStyles() {
              return {
                size: 6,
                fillStyle: "#F3F9FF",
                strokeStyle: "#3073F2",
                cursor: "crosshair",
              };
            },
          },
        ],
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
        type: "line",
        endArrow: true,
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

  graph.remove(graph.getEdges()[0]);
  graph.addBehavior(dragNode, {
    delegate: false,
    shouldTrigger(ev: any, triggerShape: any) {
      return !triggerShape?.get("_anchor");
    },
  });
  let firstAnchor: any = null;
  graph.addBehavior(dragEdge, {
    magnet: true,
    magnetAnchorStyles: {
      fillStyle: "#3073F2",
      strokeStyle: "rgba(48, 115, 242, 0.2)",
      lineWidth: 8,
    },
    shouldTrigger(ev: any, triggerShape: any) {
      firstAnchor = triggerShape;
      return triggerShape?.get("_anchor");
    },
    onDragStart() {
      firstAnchor.set("fillStyle", "#3073F2");
    },
    showAnchors: (anchorConfigs: AnchorConfigs) => anchorConfigs.index! <= 2,
    shouldDrop(
      sourceNode: Node,
      targetNode: Node,
      sourceAnchor: number,
      targetAnchor: number
    ) {
      firstAnchor.set("fillStyle", "#fff");
      return targetAnchor !== undefined;
    },
  });
  graph.addBehavior(panZoom);

  (window as any).graph = graph;
})();
