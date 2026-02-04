import { GraphStructure } from "../../src";
import { topologicalSort } from "../../src/algorithms";

describe("src/algorithms/topological_sort.ts", () => {
  it("should work", () => {
    const data = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { source: "a", target: "b" },
        { source: "a", target: "c" },
      ],
    });
    const result = topologicalSort(data);
    expect(result.map((n: any) => n.get("id"))).toEqual(["a", "b", "c"]);
  });

  it("should work with multiple headers", () => {
    // a     b
    // c  -  d
    const data = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
      edges: [
        { source: "a", target: "c" },
        { source: "b", target: "d" },
        { source: "c", target: "d" },
      ],
    });
    const result = topologicalSort(data);
    expect(result.map((n: any) => n.get("id"))).toEqual(["a", "b", "c", "d"]);
  });

  it("should not work with cycle", () => {
    const data = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" },
        { source: "c", target: "a" },
      ],
    });
    const result = topologicalSort(data);
    expect(result).toBe(null);
  });

  it("should not work with cycles", () => {
    const data = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" },
        { source: "c", target: "b" },
      ],
    });
    const result = topologicalSort(data);
    expect(result).toBe(null);
  });

  it("should not work with self cycles", () => {
    const data = new GraphStructure({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" },
        { source: "a", target: "c" },
        { source: "c", target: "c" },
      ],
    });
    const result = topologicalSort(data);
    expect(result).toBe(null);
  });
});
