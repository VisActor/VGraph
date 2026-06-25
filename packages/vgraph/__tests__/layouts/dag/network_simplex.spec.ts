import { EdgeStructure, GraphStructure } from "../../../src/graph_structure";
import {
  cutValue,
  enterEdge,
  exchangeEdges,
  initCutValues,
  initLowLimValues,
  initTree,
  leaveEdge,
  networkSimplex,
} from "../../../src/layouts/dag/rank/network_simplex";
import { normalizeRanks } from "../../../src/layouts/utils";
import { getNodeEdges } from "../../../src/layouts/dag/rank/utils";
import { longestPath } from "../../../src/layouts/dag/rank";

// TODO?: 重复边(multi edge)目前想不到需求，讨论过后暂时不写

function gansnerData() {
  const gansnerGraph = new GraphStructure({
    nodes: [
      { id: "a" },
      { id: "b" },
      { id: "c" },
      { id: "d" },
      { id: "e" },
      { id: "f" },
      { id: "g" },
      { id: "h" },
    ],
    edges: [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
      { source: "c", target: "d" },
      { source: "d", target: "h" },
      { source: "a", target: "e" },
      { source: "e", target: "g" },
      { source: "g", target: "h" },
      { source: "a", target: "f" },
      { source: "f", target: "g" },
    ],
  });
  const gansnerTree: any = {};
  gansnerTree.nodes = {};
  gansnerGraph.getNodes().forEach((node: any) => {
    gansnerTree.nodes[node.get("id")] = node;
  });
  const edges = gansnerGraph.getEdges();
  gansnerTree.edges = {
    "a-b": edges[0],
    "b-c": edges[1],
    "c-d": edges[2],
    "d-h": edges[3],
    "h-g": edges[6],
    "g-e": edges[5],
    "g-f": edges[8],
  };
  return [gansnerTree, gansnerGraph];
}

describe("network simplex", () => {
  it("can assign a rank to a single node", () => {
    const graph = new GraphStructure({
      nodes: [{ id: "a" }],
      edges: [],
    });
    networkSimplex(graph);
    normalizeRanks(graph);
    const nodes = graph.getNodes();
    expect(nodes[0].get("rank")).toBe(0);
  });
  it("can assign a rank to a 2-node connected graph", () => {
    const graph = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }],
      edges: [{ source: "a", target: "b" }],
    });
    networkSimplex(graph);
    normalizeRanks(graph);
    const nodes = graph.getNodes();
    expect(nodes[0].get("rank")).toBe(0);
    expect(nodes[1].get("rank")).toBe(1);
  });
  it("can assign ranks for a diamond", () => {
    const graph = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "d" },
        { source: "a", target: "c" },
        { source: "c", target: "d" },
      ],
    });
    networkSimplex(graph);
    normalizeRanks(graph);
    const nodes = graph.getNodes();
    expect(nodes[0].get("rank")).toBe(0);
    expect(nodes[1].get("rank")).toBe(1);
    expect(nodes[2].get("rank")).toBe(1);
    expect(nodes[3].get("rank")).toBe(2);
  });
  it("uses the minlen attribute on the edge", () => {
    const graph = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "d" },
        { source: "a", target: "c" },
        { source: "c", target: "d", minlen: 2 },
      ],
    });
    networkSimplex(graph);
    normalizeRanks(graph);
    const nodes = graph.getNodes();
    expect(nodes[0].get("rank")).toBe(0);
    expect(nodes[1].get("rank")).toBe(2);
    expect(nodes[2].get("rank")).toBe(1);
    expect(nodes[3].get("rank")).toBe(3);
  });

  it("can rank the gansner graph", () => {
    const [gansnerTree, gansnerGraph] = gansnerData();
    networkSimplex(gansnerGraph);
    normalizeRanks(gansnerGraph);
    const nodes = gansnerGraph.getNodes();
    expect(nodes[0].get("rank")).toBe(0);
    expect(nodes[1].get("rank")).toBe(1);
    expect(nodes[2].get("rank")).toBe(2);
    expect(nodes[3].get("rank")).toBe(3);
    expect(nodes[7].get("rank")).toBe(4);
    expect(nodes[4].get("rank")).toBe(1);
    expect(nodes[5].get("rank")).toBe(1);
    expect(nodes[6].get("rank")).toBe(2);
  });
  // TODO?: it("can handle multi-edges",()=>{});
  describe("leaveEdge", () => {
    it("returns undefined if there is no edge with a negative cutvalue", () => {
      const tree: any = {};
      tree.nodes = {
        a: { id: "a" },
        b: { id: "b" },
        c: { id: "c" },
      };
      tree.edges = {
        "a-b": new EdgeStructure({ source: "a", target: "b" }),
        "b-c": new EdgeStructure({ source: "b", target: "c" }),
      };
      tree.cutValue = {
        "a-b": 1,
        "b-c": 1,
      };
      tree.getCutValue = (source: string, target: string) => {
        return (
          tree.cutValue[source + "-" + target] ??
          tree.cutValue[target + "-" + source]
        );
      };
      const edge = leaveEdge(tree);
      expect(edge).toBe(null);
    });
    it("returns an edge if one is found with a negative cutvalue", () => {
      const tree: any = {};
      tree.nodes = {
        a: { id: "a" },
        b: { id: "b" },
        c: { id: "c" },
      };
      tree.edges = {
        "a-b": new EdgeStructure({ source: "a", target: "b" }),
        "b-c": new EdgeStructure({ source: "b", target: "c" }),
      };
      tree.cutValue = {
        "a-b": 1,
        "b-c": -1,
      };
      tree.getCutValue = (source: string, target: string) => {
        return (
          tree.cutValue[source + "-" + target] ??
          tree.cutValue[target + "-" + source]
        );
      };
      const edge = leaveEdge(tree) as any;
      expect(edge.get("source")).toBe("b");
      expect(edge.get("target")).toBe("c");
    });
  });

  describe("enterEdge", () => {
    it("finds an edge from the head to tail component", () => {
      const graph = new GraphStructure({
        nodes: [
          { id: "a", rank: 0 },
          { id: "b", rank: 2 },
          { id: "c", rank: 3 },
        ],
        edges: [
          { source: "a", target: "b" },
          { source: "b", target: "c" },
          { source: "a", target: "c" },
        ],
      });
      const tree: any = {};
      tree.nodes = {};
      graph.getNodes().forEach((node: any) => {
        tree.nodes[node.get("id")] = node;
      });
      const edges = graph.getEdges();
      tree.edges = {
        "b-c": edges[1],
        "c-a": edges[2],
      };
      initTree(tree, graph);
      initLowLimValues(tree, "c");
      const outEdge = enterEdge(tree, graph, edges[1]) as any;
      expect(outEdge).not.toBe(null);
      expect(outEdge.get("source")).toBe("a");
      expect(outEdge.get("target")).toBe("b");
    });
    it("works when the root of the tree is in the tail component", () => {
      const graph = new GraphStructure({
        nodes: [
          { id: "a", rank: 0 },
          { id: "b", rank: 2 },
          { id: "c", rank: 3 },
        ],
        edges: [
          { source: "a", target: "b" },
          { source: "b", target: "c" },
          { source: "a", target: "c" },
        ],
      });
      const tree: any = {};
      tree.nodes = {};
      graph.getNodes().forEach((node: any) => {
        tree.nodes[node.get("id")] = node;
      });
      const edges = graph.getEdges();
      tree.edges = {
        "b-c": edges[1],
        "c-a": edges[2],
      };
      initTree(tree, graph);
      initLowLimValues(tree, "b");
      const outEdge = enterEdge(tree, graph, edges[1]) as any;
      expect(outEdge).not.toBe(null);
      expect(outEdge.get("source")).toBe("a");
      expect(outEdge.get("target")).toBe("b");
    });
    it("finds the edge with the least slack", () => {
      const graph = new GraphStructure({
        nodes: [
          { id: "a", rank: 0 },
          { id: "b", rank: 1 },
          { id: "c", rank: 3 },
          { id: "d", rank: 4 },
        ],
        edges: [
          { source: "a", target: "d" },
          { source: "a", target: "c" },
          { source: "c", target: "d" },
          { source: "b", target: "c" },
        ],
      });
      const tree: any = {};
      tree.nodes = {};
      graph.getNodes().forEach((node: any) => {
        tree.nodes[node.get("id")] = node;
      });
      const edges = graph.getEdges();
      tree.edges = {
        "c-d": edges[2],
        "d-a": edges[0],
        "a-b": new EdgeStructure({ source: "a", target: "b" }), // 测试用例居然还有非graph上的边
      };
      initTree(tree, graph);
      initLowLimValues(tree, "a");
      const outEdge = enterEdge(tree, graph, edges[2]) as any;
      expect(outEdge).not.toBe(null);
      expect(outEdge.get("source")).toBe("b");
      expect(outEdge.get("target")).toBe("c");
    });
    it("finds an appropriate edge for gansner graph #1 #2 #3 and #4", () => {
      // #1
      const [tree, graph] = gansnerData();
      const edges = graph.getEdges();
      initTree(tree, graph);
      longestPath(graph);
      initLowLimValues(tree, "a");
      let outEdge = enterEdge(tree, graph, edges[6]) as any;
      expect(outEdge).not.toBe(null);
      expect(outEdge.get("source")).toBe("a");
      expect(outEdge.get("target")).toBe("e");
      // #2
      initTree(tree, graph);
      longestPath(graph);
      initLowLimValues(tree, "e");
      outEdge = enterEdge(tree, graph, edges[6]) as any;
      expect(outEdge).not.toBe(null);
      expect(outEdge.get("source")).toBe("a");
      expect(outEdge.get("target")).toBe("e");

      // #3
      initTree(tree, graph);
      longestPath(graph);
      initLowLimValues(tree, "a");
      outEdge = enterEdge(
        tree,
        graph,
        new EdgeStructure({ source: "h", target: "g", debug: true })
      ) as any;
      expect(outEdge).not.toBe(null);
      expect(outEdge.get("source")).toBe("a");
      expect(outEdge.get("target")).toBe("e");

      // #4
      initTree(tree, graph);
      longestPath(graph);
      initLowLimValues(tree, "e");
      outEdge = enterEdge(
        tree,
        graph,
        new EdgeStructure({ source: "h", target: "g", debug: true })
      ) as any;
      expect(outEdge).not.toBe(null);
      expect(outEdge.get("source")).toBe("a");
      expect(outEdge.get("target")).toBe("e");
    });
  });
  describe("initLowLimValues", () => {
    it("assigns low, lim, and parent for each node in a tree", () => {
      const graph = new GraphStructure({
        nodes: [
          { id: "a" },
          { id: "b" },
          { id: "c" },
          { id: "d" },
          { id: "e" },
        ],
        edges: [
          { source: "a", target: "b" },
          { source: "b", target: "a" },
          { source: "a", target: "c" },
          { source: "c", target: "d" },
          { source: "d", target: "c" },
          { source: "c", target: "e" },
        ],
      });
      const tree: any = {};
      tree.nodes = {};
      graph.getNodes().forEach((node: any) => {
        tree.nodes[node.get("id")] = node;
      });
      const edges = graph.getEdges();
      tree.edges = {
        "a-b": edges[0],
        "b-a": edges[1],
        "a-c": edges[2],
        "c-d": edges[3],
        "d-c": edges[4],
        "c-e": edges[5],
      };
      initTree(tree, graph);
      initLowLimValues(tree, Object.keys(tree.nodes)[0]);
      const lims = Object.keys(tree.nodes).map((n: any) => tree.lim[n]);
    });
  });
  describe("exchangeEdges", () => {
    it("exchanges edges and updates cut values and low/lim numbers", () => {
      const [tree, graph] = gansnerData();
      initTree(tree, graph);
      longestPath(graph);
      initLowLimValues(tree, Object.keys(tree.nodes)[0]);
      exchangeEdges(
        tree,
        graph,
        new EdgeStructure({ source: "g", target: "h" }),
        new EdgeStructure({ source: "a", target: "e" })
      );
      expect(tree.getCutValue("a", "b")).toBe(2);
      expect(tree.getCutValue("b", "c")).toBe(2);
      expect(tree.getCutValue("c", "d")).toBe(2);
      expect(tree.getCutValue("d", "h")).toBe(2);
      expect(tree.getCutValue("a", "e")).toBe(1);
      expect(tree.getCutValue("e", "g")).toBe(1);
      expect(tree.getCutValue("g", "f")).toBe(0);
      expect(
        Object.keys(tree.nodes)
          .map((id: string) => tree.lim[id])
          .sort()
      ).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
    it("updates ranks", () => {
      const [tree, graph] = gansnerData();
      initTree(tree, graph);
      longestPath(graph);
      initLowLimValues(tree, Object.keys(tree.nodes)[0]);
      exchangeEdges(
        tree,
        graph,
        new EdgeStructure({ source: "g", target: "h" }),
        new EdgeStructure({ source: "a", target: "e" })
      );
      normalizeRanks(graph);
      const nodes = graph.getNodes();
      expect(nodes.map((d: any) => d.get("rank"))).toEqual([
        0, 1, 2, 3, 1, 1, 2, 4,
      ]);
    });
  });
  describe("calcCutValue", () => {
    it("works for a 2-node tree with c -> p", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "c" }, { id: "p" }],
        edges: [{ source: "c", target: "p" }],
      });
      const tree: any = {};
      tree.nodes = { c: graph.getNodes()[0], p: graph.getNodes()[1] };
      tree.edges = { "p-c": new EdgeStructure({ source: "p", target: "c" }) };
      initTree(tree, graph);
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(1);
    });
    it("works for a 2-node tree with c <- p", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "p" }, { id: "c" }],
        edges: [{ source: "p", target: "c" }],
      });
      const tree: any = {};
      tree.nodes = { p: graph.getNodes()[0], c: graph.getNodes()[1] };
      tree.edges = { "p-c": new EdgeStructure({ source: "p", target: "c" }) };
      initTree(tree, graph);
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(1);
    });
    it("works for 3-node tree with gc -> c -> p", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }],
        edges: [
          { source: "gc", target: "c" },
          { source: "c", target: "p" },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "p-c": new EdgeStructure({ source: "p", target: "c" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(3);
    });
    it("works for 4-node tree with gc -> c -> p -> o, with o -> c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "gc", target: "c" },
          { source: "c", target: "p" },
          { source: "p", target: "o" },
          { source: "o", target: "c", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
        "p-o": new EdgeStructure({ source: "p", target: "o" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(-4);
    });
    it("works for 4-node tree with gc -> c -> p -> o, with o <- c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "gc", target: "c" },
          { source: "c", target: "p" },
          { source: "p", target: "o" },
          { source: "c", target: "o", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
        "p-o": new EdgeStructure({ source: "p", target: "o" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(10);
    });
    it("works for 4-node tree with o -> gc -> c -> p, with o -> c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "o", target: "gc" },
          { source: "gc", target: "c" },
          { source: "c", target: "p" },
          { source: "o", target: "c", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "o-gc": new EdgeStructure({ source: "o", target: "gc" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(-4);
    });
    it("works for 4-node tree with o -> gc -> c -> p, with o <- c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "o", target: "gc" },
          { source: "gc", target: "c" },
          { source: "c", target: "p" },
          { source: "c", target: "o", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "o-gc": new EdgeStructure({ source: "o", target: "gc" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(10);
    });
    it("works for 4-node tree with gc -> c <- p -> o, with o -> c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "p", target: "o" },
          { source: "gc", target: "c" },
          { source: "p", target: "c" },
          { source: "o", target: "c", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "o-gc": new EdgeStructure({ source: "o", target: "gc" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(6);
    });
    it("works for 4-node tree with gc -> c <- p -> o, with o <- c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "p", target: "o" },
          { source: "gc", target: "c" },
          { source: "p", target: "c" },
          { source: "c", target: "o", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "o-gc": new EdgeStructure({ source: "o", target: "gc" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(-8);
    });
    it("works for 4-node tree with o -> gc -> c <- p, with o -> c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "o", target: "gc" },
          { source: "gc", target: "c" },
          { source: "p", target: "c" },
          { source: "o", target: "c", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "o-gc": new EdgeStructure({ source: "o", target: "gc" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(6);
    });
    it("works for 4-node tree with o -> gc -> c <- p, with o <- c", () => {
      const graph = new GraphStructure({
        nodes: [{ id: "gc" }, { id: "c" }, { id: "p" }, { id: "o" }],
        edges: [
          { source: "o", target: "gc" },
          { source: "gc", target: "c" },
          { source: "p", target: "c" },
          { source: "c", target: "o", weight: 7 },
        ],
      });
      const tree: any = {};
      tree.nodes = {
        gc: graph.getNodes()[0],
        c: graph.getNodes()[1],
        p: graph.getNodes()[2],
      };
      tree.edges = {
        "gc-c": new EdgeStructure({ source: "gc", target: "c" }),
        "o-gc": new EdgeStructure({ source: "o", target: "gc" }),
        "c-p": new EdgeStructure({ source: "c", target: "p" }),
      };
      initTree(tree, graph);
      tree.cutValue["gc-c"] = 3;
      initLowLimValues(tree, "p");
      const nodeEdges = getNodeEdges(graph);
      cutValue(tree, nodeEdges, "c");
      expect(tree.getCutValue("c", tree.parent["c"])).toBe(-8);
    });
  });
  describe("initCutValues", () => {
    it("works for gansnerGraph", () => {
      const [tree, graph] = gansnerData();
      initTree(tree, graph);
      initLowLimValues(tree, Object.keys(tree.nodes)[0]);
      initCutValues(tree, graph);
      expect(tree.getCutValue("a", "b")).toBe(3);
      expect(tree.getCutValue("b", "c")).toBe(3);
      expect(tree.getCutValue("c", "d")).toBe(3);
      expect(tree.getCutValue("d", "h")).toBe(3);
      expect(tree.getCutValue("g", "h")).toBe(-1);
      expect(tree.getCutValue("e", "g")).toBe(0);
      expect(tree.getCutValue("f", "g")).toBe(0);
    });
    it("works for updated gansnerGraph", () => {
      const [tree, graph] = gansnerData();
      initTree(tree, graph);
      tree.removeEdge("g", "h");
      tree.addEdge(new EdgeStructure({ source: "a", target: "e" }));
      initLowLimValues(tree, Object.keys(tree.nodes)[0]);
      initCutValues(tree, graph);
      expect(tree.getCutValue("a", "b")).toBe(2);
      expect(tree.getCutValue("b", "c")).toBe(2);
      expect(tree.getCutValue("c", "d")).toBe(2);
      expect(tree.getCutValue("d", "h")).toBe(2);
      expect(tree.getCutValue("a", "e")).toBe(1);
      expect(tree.getCutValue("e", "g")).toBe(1);
      expect(tree.getCutValue("f", "g")).toBe(0);
    });
  });
});
