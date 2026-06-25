import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Graph,
  panZoom,
  dragCanvas,
  NodeMover,
  Grid,
  Router,
  fastrand,
  Node,
} from "@visactor/vgraph";
import { Viewer } from "../../src";
import "./style.less";

const xNodes = 50;
const yNodes = 50;
const nodeWidth = 280;
const nodeHeight = 80;
const rand = fastrand();
rand.setSeed(0);
const nodes: any = [];
const edges: any = [];
let nodeId = 1;
let recentNodeId = 0;
for (let y = 0; y < yNodes; y++) {
  for (let x = 0; x < xNodes; x++) {
    const position = { x: rand() * 12000, y: rand() * 12000 };
    const node = {
      id: `stress-${nodeId.toString()}`,
      x: position.x,
      y: position.y,
    };
    nodes.push(node);
    if (recentNodeId && nodeId <= xNodes * yNodes && rand() < 0.2) {
      edges.push({
        id: `${x}-${y}`,
        source: `stress-${recentNodeId.toString()}`,
        target: `stress-${nodeId.toString()}`,
      });
    }
    recentNodeId = nodeId;
    nodeId++;
  }
}

(() => {
  const App = () => {
    const [graph, setGraph] = useState<null | Graph>(null);
    const viewer = useRef();
    const [value, setValue] = useState("");
    useEffect(() => {
      const g = new Graph({
        container: "viewerExample",
        width: 800,
        height: 600,
        minRatio: 0.01,
        maxRatio: 8,
        renderMode: "dom",
        setDefaultNode(node: any) {
          return {
            width: nodeWidth,
            height: nodeHeight,
            opacity: 0,
            anchors: [{ position: [0, 0.5] }, { position: [1, 0.5] }],
          };
        },
        setDefaultEdge(edgeData: any) {
          return {
            // type: 'pipeline',
            strokeStyle: "#ddd",
            appendSize: 2,
          };
        },
      });
      g.addBehavior(panZoom);
      g.addBehavior(dragCanvas);

      const gridComponent = new Grid(g, { step: 10 });
      gridComponent.refresh();
      const router = new Router(gridComponent);
      new NodeMover(g, {
        router,
        // stack,
        shouldDrop: () => {
          return true;
        },
        alignGrid: true,
      });
      g.data({ nodes, edges });
      g.getEdgeContainer().toFront();
      g.refresh();
      g.fitView();
      setGraph(g);
    }, []);

    function setNode(node: Node) {
      return (
        <div
          style={{ padding: 6, border: "1px solid #E1E4EB", borderRadius: 4 }}
        >
          {node.get("id")}
        </div>
      );
    }

    function getNodeStyles(node: Node) {
      return {
        backgroundColor: "#3073FF",
      };
    }

    return (
      <>
        <div style={{ width: 1000, height: 600 }} id="viewerExample">
          {graph && (
            <Viewer
              graph={graph}
              setNode={setNode}
              hideDetails={{ ratio: 0.02, getNodeStyles }}
            />
          )}
        </div>
      </>
    );
  };
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
