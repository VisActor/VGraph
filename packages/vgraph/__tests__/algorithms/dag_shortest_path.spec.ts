import { GraphStructure } from "../../src";
import { dagSP } from "../../src/algorithms";

describe("src/algorithms/dag_shortest_path", () => {
  //    a
  //  b    c   -  d
  //     e
  const data = new GraphStructure({
    nodes: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }],
    edges: [
      { source: "a", target: "b", weight: 5 },
      { source: "a", target: "c", weight: 2 },
      { source: "c", target: "d", weight: 1 },
      { source: "b", target: "e", weight: 4 },
      { source: "c", target: "e", weight: 3 },
      { source: "d", target: "e", weight: 1 },
    ],
  });

  it("should work without weight", () => {
    const result1: any = dagSP(data, "a", "e");
    expect(result1.path).toEqual(["a", "b", "e"]);
    expect(result1.cost).toBe(2);
    const result2: any = dagSP(data, "a", "d");
    expect(result2.path).toEqual(["a", "c", "d"]);
    expect(result2.cost).toBe(2);
    expect(dagSP(data, "e", "a")).toBe(null);
  });

  it("should work with weight", () => {
    const result: any = dagSP(data, "a", "e", (edge: any) =>
      edge.get("weight")
    );
    expect(result.path).toEqual(["a", "c", "d", "e"]);
    expect(result.cost).toBe(4);

    expect(dagSP(data, "c", "a", (edge: any) => edge.get("weight"))).toBe(null);
  });
});
