import { GraphStructure } from "../../../src/graph_structure";
import {
  insertDummyNodes,
  removeDummyNodes,
} from "../../../src/layouts/dag/order/dummy_nodes";

describe("src/layouts/dag/order/dummy_nodes", () => {
  //      a
  //  b   |   c
  //      d
  const graph = new GraphStructure({
    nodes: [
      { id: "a", rank: 1 },
      { id: "b", rank: 2 },
      { id: "c", rank: 2 },
      { id: "d", rank: 3 },
    ],
    edges: [
      { source: "a", target: "b" },
      { source: "a", target: "d" },
      { source: "a", target: "c" },
    ],
  });

  const a = graph.getNodeById("a");
  const b = graph.getNodeById("b");
  const c = graph.getNodeById("c");
  const d = graph.getNodeById("d");

  it("insertDummyNodes should work", () => {
    expect(a.targets).toEqual(["b", "d", "c"]);
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
    const ranks = {
      1: [a],
      2: [b, c],
      3: [d],
    };
    const dummies = insertDummyNodes(graph, ranks);
    expect(graph.getNodes().length).toBe(5);
    expect(graph.getEdges().length).toBe(4);
    expect(a.targets).toEqual(["b", "_dummy0", "c"]);
    expect(dummies.length).toBe(1);
    expect(dummies[0].relatedEdge.source).toBe("a");
    expect(dummies[0].relatedEdge.target).toBe("d");
    expect(dummies[0].source).toBe("a");
    expect(dummies[0].target).toBe("d");
    expect(dummies[0].nodes.length).toBe(1);

    removeDummyNodes(graph, ranks, dummies, { 1: 0, 2: 1, 3: 2 });
    expect(a.targets).toEqual(["b", "d", "c"]);
    expect(graph.getNodes().length).toBe(4);
    expect(graph.getEdges().length).toBe(3);
  });
});
