import {
  TreeGraph,
  dragCanvas,
  panZoom,
  hideDetails,
  CompactBox as Layout,
} from "../../src";
// import data from '../static/flare.json';

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  function buildTree(depth: number) {
    const id = `${depth}-${Math.random()}`;
    const data: any = { id, children: [] };
    if (depth >= 5) {
      return data;
    }
    for (let i = 0; i < Math.round(Math.random() * 4) + 1; i++) {
      data.children.push(buildTree(depth + 1));
    }
    return data;
  }

  const data = buildTree(0);
  console.log(data);

  const colors = [
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

  const layout = new Layout({
    direction: "LR",
    size() {
      return [800, 600];
    },
    nodeSep() {
      return 20;
    },
    nodeSize() {
      return [100, 40];
    },
    rankSep() {
      return 80;
    },
  });

  const graph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    animate: false,
    layout,
    fitViewAfterLayout: false,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 40,
        type: "category",
        color:
          nodeData.id === data.id
            ? colors[0]
            : colors[Math.round(Math.random() * 9)],
        // strokeStyle: 'green',
        label: {
          text: nodeData.id,
          textAlign: "left",
        },
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        radius: 4,
      };
    },
    setDefaultEdge(edge: any) {
      return {
        type: "hCubic",
      };
    },
    setNodeStateStyles(state: string, nodeData: any) {
      if (state === "hide") {
        return { fillStyle: nodeData.color };
      }
      if (state === "clicked") {
        return { strokeStyle: nodeData.color };
      }
    },
  });

  (window as any)._graph = graph;

  graph.data(data);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(panZoom, { sensitivity: 4 });
  graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: "hide" });

  // 默认状态下将视窗移动到根节点
  const root = graph.getNodeById(data.id);
  graph.focusPoint(root.get("x") + 300, root.get("y"));

  let activeNode: any = null;
  // 点击节点聚焦节点
  graph.on("node:click", (e: any) => {
    graph.set("autoDraw", false);
    if (activeNode) {
      activeNode.removeState("clicked");
    }
    activeNode = e.target;
    graph.setZoomRatio(1);
    activeNode.setState("clicked");
    graph.set("autoDraw", true);
    graph.focus(activeNode, true);
  });
})();
