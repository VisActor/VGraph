import {
  dragCanvas,
  Graph,
  hideDetails,
  panZoom,
  RawTooltip,
  DAGLayout,
} from "../../../src";
import data from "../../static/nested_dag.json";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  const colors = [
    "#33d6cc",
    "#ffbc0a",
    "#ed55b0",
    "#33d6cc",
    "#8a77ed",
    "#5dcd81",
  ];

  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.1,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: "rect",
        width: 100,
        height: 50,
        radius: 5,
        text: node.name ?? node.id ?? "null",
        color: colors[Math.round(Math.random() * 5)],
        label: {
          width: 80,
          text: node.name ?? node.id ?? "null",
          fontSize: 10,
          // textBaseline: 'middle',
          // textAlign: 'center',
        },
        rectWidth: 20,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        // icons: [{
        //   show: 'always',
        //   setStyles() {
        //     return { fillStyle: '#666', icon: '&#xe77a;', left: 0, top: -26 };
        //   },
        // }]
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      const label: any = node.layer.find((shape: any) => shape.type === "text");
      if (state === "hide") {
        return { fillStyle: data.color };
      }
      if (state === "hover") {
        label.set("fillStyle", "#3370FF");
        return { strokeStyle: "#3370FF" };
      } else {
        label.set("fillStyle", "#666");
        return { strokeStyle: "#ccc" };
      }
    },
    setDefaultEdge(edge: any) {
      return {
        type: "line",
        strokeStyle: "#ddd",
        endArrow: {
          type: "arrow",
          style: "triangleSolid",
          size: 10,
          strokeStyle: "#ddd",
        },
      };
    },
    setDefaultGroup(group: any) {
      return {
        linkNode: false,
        fillStyle: "#F3F9FF",
        strokeStyle: "#3073F2",
        padding: 10,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
      };
    },
  });
  graph.data(data);
  (window as any).__graph = graph;
  new DAGLayout({
    graph,
    rankDir: "LR",
    nodeSep: 50,
    edgeSep: 10,
    rankSep: 100,
    ranker: "networkSimplex",
  });

  // graph.updateData(graphData.getData());
  // console.log(graphData);

  graph.refresh();
  graph.fitView();
  graph.addBehavior(panZoom, { sensitivity: 5 });
  graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: "hide" });
  graph.addBehavior(dragCanvas);
  let activeNode: any;

  graph.on("node:click", (e) => {
    const node = e.target;
    console.log(node.get("x"), node.get("y"));
  });

  graph.on("node:mouseenter", (e) => {
    activeNode = e.target;
    e.target.setState("hover");
  });

  graph.on("node:mouseleave", (e) => {
    activeNode.removeState("hover");
    e.target.setState("default");
  });
  new RawTooltip(graph, {
    styles: {
      border: "1px solid #ccc",
      padding: "8px",
      borderRadius: "4px",
      backgroundColor: "#fff",
    },
    content(entity: any, type: string) {
      if (type === "edge") {
        return `From ${entity.get("source")} to ${entity.get("target")}`;
      }
      return `${entity.get("name")}: ${entity.get("class")}`;
    },
    target: "edge",
  });
})();
