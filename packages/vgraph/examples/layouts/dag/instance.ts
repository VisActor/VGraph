import {
  dragCanvas,
  Graph,
  hideDetails,
  panZoom,
  RawTooltip,
  DAGLayout,
} from "../../../src";
import dataraw from "../../static/instance4.json";
const data5 = JSON.parse(JSON.stringify(dataraw));
const nodes = data5.nodes.map((d: any) => ({
  id: d.id,
  name: d.name,
  rank: d.rank,
  order: d.order,
}));
const nodeMap = {};
nodes.forEach((d: any) => {
  nodeMap[d.id] = d;
});
console.log(
  data5.edges.map((d: any) => ({ source: d.source, target: d.target }))
);
const edges = data5.edges.map((d: any) => ({
  source: d.source,
  target: d.target,
}));
const data: any = {
  nodes,
  edges,
};
(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: "category",
        width: 50,
        height: 30,
        radius: 5,
        label: {
          width: 50,
          text: node.name ?? node.id ?? "null",
          fontSize: 10,
          // textBaseline: 'middle',
          // textAlign: 'center',
        },
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
  });

  graph.data(data);
  (window as any).__graph = graph;
  new DAGLayout({
    graph,
    rankDir: "TB",
    nodeSep: 20,
    edgeSep: 10,
    rankSep: 50,
    ranker: "custom",
  });
  // graph.updateData(graphData.getData());
  // console.log(graphData);

  graph.refresh();
  graph.fitView();
  graph.addBehavior(panZoom, { sensitivity: 5 });
  graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: "hide" });
  graph.addBehavior(dragCanvas);
  let activeNode: any;
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
        return `From ${entity.getSource().get("name")} to ${entity
          .getTarget()
          .get("name")}`;
      }
      return `${entity.get("name")}: ${entity.get("class")}`;
    },
    target: "node",
  });
})();
