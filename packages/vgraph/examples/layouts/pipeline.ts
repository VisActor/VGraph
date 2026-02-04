import {
  LAYOUT_TYPES,
  Graph,
  panZoom,
  dragNode,
  dragCanvas,
  GraphEvent,
  Node,
} from "../../src";
import data from "../static/job.json";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.1,
    maxRatio: 8,
    autoLayout: true,
    layout: {
      type: "pipeline",
      options: {
        rootId: "1",
        rankDir: "LR",
        nodeSep: 20,
        rankSep: 50,
        coordAssignment: "treeLike",
      },
    },
    setDefaultNode(node: any) {
      return {
        width: 140,
        height: 40,
        radius: 12,
        label: node.id,
        anchors: [
          [0.0, 0.5],
          [1.0, 0.5],
        ],
      };
    },
    setDefaultEdge(edge: any) {
      return {
        id: edge.source + "-" + edge.target,
        type: "hLine",
        strokeStyle: "#ddd",
        endArrow: {
          type: "arrow",
          style: "triangleSolid",
          size: 10,
          strokeStyle: "#ddd",
        },
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
  graph.data(data);
  graph.fitView();
  graph.addBehavior(panZoom, { sensitivity: 5 });
  //graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: 'hide' });
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);

  graph.on("node:click", (e: GraphEvent) => {
    const node = e.target as Node;
    node.set("collapsed", !node.get("collapsed"));
    console.log(node.get("x"), node.get("y"));
    node.targets.forEach((id: string) => {
      setChildrenVisibility(id, graph, !node.get("collapsed"));
    });
    graph.layout(node.get("id"));
    console.log(node.get("x"), node.get("y"));
  });
  (window as any).graph = graph;
  graph.draw();

  function setChildrenVisibility(id: string, graph: Graph, show: boolean) {
    const node = graph.getNodeById(id);
    node.targets.forEach((childId: string) => {
      setChildrenVisibility(childId, graph, show);
    });
    show ? node.show() : node.hide();
  }
})();
