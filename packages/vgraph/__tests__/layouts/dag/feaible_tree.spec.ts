import { GraphStructure } from "../../../src/graph_structure";
import { feasibleTree } from "../../../src/layouts/dag/rank/feasible_tree";

describe("feasible tree", () => {
  it("creates a tree for a trivial input graph", () => {
    const graph = new GraphStructure({
      nodes: [
        { id: "a", rank: 0 },
        { id: "b", rank: 1 },
      ],
      edges: [{ source: "a", target: "b" }],
    });
    const tree = feasibleTree(graph);
    const rankA = graph.getNodes()[0].get("rank");
    const rankB = graph.getNodes()[1].get("rank");
    expect(rankB).toBe(rankA + 1);
    expect(Object.keys(tree.edges).length).toBe(1);
    expect(tree.edges["a-b"]).toBeDefined();
    expect(plainEdge(tree.edges["a-b"])).toEqual(
      plainEdge(graph.getEdges()[0])
    );
  });
  it("correctly shortens slack by pulling a node up", () => {
    const graph = new GraphStructure({
      nodes: [
        { id: "a", rank: 0 },
        { id: "b", rank: 1 },
        { id: "c", rank: 2 },
        { id: "d", rank: 2 },
      ],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" },
        { source: "a", target: "d" },
      ],
    });
    const tree = feasibleTree(graph);
    const rankA = graph.getNodes()[0].get("rank");
    const rankB = graph.getNodes()[1].get("rank");
    const rankC = graph.getNodes()[2].get("rank");
    const rankD = graph.getNodes()[3].get("rank");
    expect(rankB).toBe(rankA + 1);
    expect(rankC).toBe(rankB + 1);
    expect(rankD).toBe(rankA + 1);
    expect(Object.keys(tree.edges).length).toBe(3);
    expect(tree.edges["a-b"]).toBeDefined();
    expect(tree.edges["b-c"]).toBeDefined();
    expect(tree.edges["a-d"]).toBeDefined();
    expect(plainEdge(tree.edges["a-b"])).toEqual(
      plainEdge(graph.getEdges()[0])
    );
    expect(plainEdge(tree.edges["b-c"])).toEqual(
      plainEdge(graph.getEdges()[1])
    );
    expect(plainEdge(tree.edges["a-d"])).toEqual(
      plainEdge(graph.getEdges()[2])
    );
  });
  it("correctly shortens slack by pulling a node down", () => {
    const graph = new GraphStructure({
      nodes: [
        { id: "a", rank: 2 },
        { id: "b", rank: 0 },
        { id: "c", rank: 2 },
      ],
      edges: [
        { source: "b", target: "a" },
        { source: "b", target: "c" },
      ],
    });
    const tree = feasibleTree(graph);
    const rankA = graph.getNodes()[0].get("rank");
    const rankB = graph.getNodes()[1].get("rank");
    const rankC = graph.getNodes()[2].get("rank");
    expect(rankA).toBe(rankB + 1);
    expect(rankC).toBe(rankB + 1);
    expect(Object.keys(tree.edges).length).toBe(2);
    expect(tree.edges["b-a"]).toBeDefined();
    expect(tree.edges["b-c"]).toBeDefined();
    expect(plainEdge(tree.edges["b-a"])).toEqual(
      plainEdge(graph.getEdges()[0])
    );
    expect(plainEdge(tree.edges["b-c"])).toEqual(
      plainEdge(graph.getEdges()[1])
    );
  });
  it("it can correct return a tree", () => {
    const graph = new GraphStructure({
      nodes: [
        { id: "a", rank: 0 },
        { id: "b", rank: 1 },
        { id: "c", rank: 2 },
        { id: "d", rank: 2 },
      ],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" },
        { source: "b", target: "d" },
        { source: "a", target: "d" },
      ],
    });
    const tree = feasibleTree(graph);
    const rankA = graph.getNodes()[0].get("rank");
    const rankB = graph.getNodes()[1].get("rank");
    const rankC = graph.getNodes()[2].get("rank");
    const rankD = graph.getNodes()[3].get("rank");
    expect(rankB).toBe(rankA + 1);
    expect(rankC).toBe(rankB + 1);
    expect(rankD).toBe(rankB + 1); // different with case above
    expect(Object.keys(tree.edges).length).toBe(3); // tree has 3 edges, not 4
    expect(tree.edges["a-b"]).toBeDefined();
    expect(tree.edges["b-c"]).toBeDefined();
    expect(tree.edges["b-d"]).toBeDefined();
  });
});
function plainEdge(edge: any) {
  return { source: edge.get("source"), target: edge.get("target") };
}
