import {
  Graph,
  registerNode,
  Layer,
  dragNode,
  panZoom,
  NoteMarkerUtils,
} from "../../src";

const data = {
  nodes: [
    { id: "node1", x: 400, y: 100 },
    { id: "node2", error: "运行失败", position: "right", x: 250, y: 200 },
    { id: "node3", error: "脚本有误", position: "left", x: 550, y: 200 },
  ],
  edges: [
    { source: "node1", target: "node2" },
    { source: "node1", target: "node3" },
  ],
};

function registerMarkerNodes() {
  registerNode("markerNode", {
    type: "markerNode",
    extends: "rect",
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return nodeData;
    },
    shape(layer: Layer, configs: any) {
      if (!configs.error) {
        return;
      }
      NoteMarkerUtils.init(layer, {
        width: 14,
        height: 16,
        radius: 4,
        position: configs.position,
        fillStyle: "#E33232",
        strokeStyle: "#E33232",
        triggerId: "errorMarker",
      });
    },
  });
}

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  registerMarkerNodes();

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
        type: "markerNode",
        label: node.id,
        width: 140,
        height: 40,
        radius: 4,
        strokeStyle: "#E1E4E8",
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      };
    }, // 定制节点样式
    setDefaultEdge(edgeData) {
      return {
        type: "vLine",
      };
    },
  });

  graph.data(data);

  // graph.add('node', {
  //   x: 100,
  //   y: 100,
  //   label: '带角标的节点'
  // });

  graph.addBehavior(dragNode, {
    delegate: false,
  });
  graph.addBehavior(panZoom);
  console.log(graph);
})();
