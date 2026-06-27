import { GraphStructure } from "../../src";

describe("standard graph structure behavior", () => {
  it("keeps exported data in sync after add and remove operations", () => {
    const graph = new GraphStructure({
      nodes: [{ id: "A" }, { id: "B" }],
      edges: [{ id: "A-B", source: "A", target: "B" }],
      groups: [{ id: "group-1", children: ["A"] }],
    });

    graph.add("node", { id: "C" });
    graph.add("edge", { id: "B-C", source: "B", target: "C" });
    graph.remove(graph.getEdgeById("A-B"));
    graph.remove(graph.getNodeById("A"));

    expect(graph.getData()).toEqual({
      nodes: [{ id: "B" }, { id: "C" }],
      edges: [{ id: "B-C", source: "B", target: "C" }],
      groups: [{ id: "group-1", children: ["A"] }],
    });
    expect(graph.getNodeById("B").sources).toEqual([]);
    expect(graph.getNodeById("B").targets).toEqual(["C"]);
    expect(graph.getNodeById("C").sources).toEqual(["B"]);
  });

  it("throws a clear error for edges that reference missing nodes", () => {
    expect(
      () =>
        new GraphStructure({
          nodes: [{ id: "A" }],
          edges: [{ source: "A", target: "missing" }],
        })
    ).toThrow("Cannot create edge which source is A and target is missing");
  });
});
