import {
  dragCanvas,
  Graph,
  panZoom,
  dragNode,
  highlightRelations,
  DAGLayout,
  GraphStructure,
} from "../../../src";
import largeDecisionData from "../../static/rankfixed.json";
import { fastrand } from "../../../src/layouts";
// import largeDecisionData from '../../static/rankfixed_largedata.json';
console.time();
const nodes = largeDecisionData.nodes;
const nodeWidth = 120;
const nodeHeight = 30;
const rand = fastrand();
rand.setSeed(0);
nodes.map((node: any) => {
  node.width = Math.max(50, nodeWidth + (rand() - 0.5) * 800);
  node.height = nodeHeight + (rand() - 0.5) * 20;
  node.rank = undefined;
});
const nodeIds = nodes.map((node) => node.id);
const hasNode = {};
nodeIds.map((id) => (hasNode[id] = true));
const edges = largeDecisionData.edges.filter(
  (edge) => hasNode[edge.source] && hasNode[edge.target]
);
const dataDecision = { nodes, edges };

// 构造新的graph
const rootNodeIds = nodes
  .filter((node) => [0, 2, 3].includes(node?.nodeType))
  .map((node) => node.id);
const rootNodeMap = {};
rootNodeIds.map((id) => (rootNodeMap[id] = true));
const otherNodes = nodes.filter((node) => ![0, 2, 3].includes(node?.nodeType));
const newEdges: any[] = [];
const hasEdge = {};
edges.forEach((edge) => {
  const source = rootNodeMap[edge.source] ? "dummyRoot" : edge.source;
  const target = rootNodeMap[edge.target] ? "dummyRoot" : edge.target;
  if (target === "dummyRoot") {
    const id = `${target}_and_${source}`;
    if (!hasEdge[id]) {
      newEdges.push({ source: target, target: source });
      hasEdge[id] = true;
    }
  } else {
    const id = `${source}_and_${target}`;
    if (!hasEdge[id]) {
      newEdges.push({ source, target });
      hasEdge[id] = true;
    }
  }
});

const dummyNode = {
  id: "dummyRoot",
  label: "dummyRoot",
  nodeType: 0,
  width: nodeWidth,
  height: nodeHeight,
};
const newNodes = otherNodes as any;
newNodes.push(dummyNode);
const newData = {
  nodes: newNodes,
  edges: newEdges,
} as any;
console.log("nodes.length", nodes.length, "edges.length", edges.length);
// const tempGraph = new GraphStructure(newData); // 无法处理自环
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const perLayout = new DAGLayout({
  graph: new GraphStructure(newData),
  rankDir: "LR",
  nodeSep: 20,
  edgeSep: 10,
  rankSep: 100,
  ranker: "networkSimplex",
  rankOnly: true,
});
console.log("preLayoutEnd");

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  const colors = [
    "#4c72b0",
    "#8c8c8c",
    "#25a868",
    "#c44e52",
    "#8172b3",
    "#937860",
    "#da8bc3",
    "#d0ff8f",
    "#ccb974",
    "#64b5cd",
    "#a305e5",
    "#000000",
    "#dd8452",
  ];
  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: "category",
        radius: 4,
        width: node.width,
        height: node.height,
        color: colors[node?.nodeType ?? 5],
        strokeStyle: colors[node?.nodeType ?? 5],
        label: {
          text: node.label,
          textOverflow: "ellipsis",
        },
        icon: {
          icon: "&#xe60d;",
          background: {
            fillStyle: "#EBEDFF",
          },
        },
        anchors: [
          [0.0, 0.5],
          [1.0, 0.5],
        ],
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
        // if (state === "active") {
        //     return {
        //       opacity: 1.0
        //     };
        //   }
        //   return { opacity: 0.2 };
      }
    },
    setDefaultEdge(edge: any) {
      return {
        id: edge.source + "-" + edge.target,
        // type: "hLine",
        type: "hCubic",
        endArrow: {
          width: 3,
          height: 5,
        },
        strokeStyle: "#e2e2e2",
        appendSize: 2,
      };
    },
    setEdgeStateStyles(state) {
      if (state === "active") {
        return {
          strokeStyle: "#A7A7A7",
        };
      }
      return { opacity: 0.5 };
    },
  });

  // graph.data(newData);
  (window as any).__graph = graph;

  const NodeTypeToRank = {
    0: 0,
    2: 1,
    3: 2,
  };
  newNodes.map((d: any) => {
    d.rank = Math.max(3, d.rank + 2);
  });
  nodes.forEach((node: any) => {
    node.rank = node.rank ? node.rank : NodeTypeToRank[node.nodeType];
  });

  // layout.layout();
  graph.data(dataDecision);
  new DAGLayout({
    graph,
    rankDir: "LR",
    nodeSep: 20,
    edgeSep: 20,
    rankSep: 100,
    ranker: "custom",
    alignPeerNodes: "left",
  });
  graph.refresh();
  graph.fitView();
  graph.addBehavior(panZoom, { sensitivity: 5 });
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode, {
    onDrop: (target: any) => {
      // console.log(target);
    },
  });
  graph.on("node:click", (e) => {
    console.log(e.target);
  });
  graph.addBehavior(highlightRelations);
  graph.draw();
  console.log("nodes.length", nodes.length, "edges.length", edges.length);
  console.timeEnd();

  document.fonts.ready.then(() => {
    graph.draw();
  });
})();
