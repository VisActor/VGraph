import data from "../flare.json";
import { TreeGraph, Dendrogram, Minimap, panZoom, Scroller } from "../../src";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);
  const minimapDiv = document.createElement("div");
  minimapDiv.style.position = "absolute";
  minimapDiv.style.right = "10px";
  minimapDiv.style.top = "10px";
  minimapDiv.style.border = "1px solid #666";
  document.body.append(minimapDiv);

  const layout = new Dendrogram({
    direction: "TB",
    size() {
      return [800, 600];
    },
    nodeSep() {
      return 10;
    },
    nodeSize() {
      return [4, 4];
    },
    rankSep() {
      return 60;
    },
    // radial: true,
  });

  const graph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    animate: true,
    padding: 40,
    layout,
    setDefaultNode(node: any) {
      return {
        id: node.name,
        type: "circle",
        width: 4,
        height: 4,
        fillStyle: "#5F95FF",
      };
    },
    setDefaultEdge() {
      return { strokeStyle: "#ccc" };
    },
  });

  const minimap = new Minimap(graph, {
    container: minimapDiv,
    width: 200,
    height: 150,
    type: "delegate",
    showEdges: true,
    getNodeStyles(node) {
      return {
        fillStyle: node.get("fillStyle"),
        r: 10,
      };
    },
  });
  minimap.destroy();
  new Minimap(graph, {
    container: minimapDiv,
    width: 100,
    height: 75,
    type: "delegate",
    showEdges: true,
    getNodeStyles(node) {
      return {
        fillStyle: node.get("fillStyle"),
        r: 10,
      };
    },
    getEdgeStyles() {
      return {
        strokeStyle: "red",
      };
    },
  });

  graph.data(data);
  graph.addBehavior(panZoom);
  new Scroller(graph);
  (window as any)._graph = graph;
  graph.on("edge:click", (e) => {
    e.target.hide();
    graph.draw();
  });
})();
