import { GraphStructure } from "../../src";
import { bellmanFordSP } from "../../src/algorithms";

describe("src/algorithms/bellman_ford_shortest_path.ts", () => {
  //     B - D
  //  A  ↓   ↑   F
  //     C - E
  const graphData = new GraphStructure({
    nodes: [
      {
        id: "A",
      },
      {
        id: "B",
      },
      {
        id: "C",
      },
      {
        id: "D",
      },
      {
        id: "E",
      },
      {
        id: "F",
      },
    ],
    edges: [
      { source: "A", target: "B", weight: 2, id: "AB" },
      { source: "A", target: "C", weight: 4 },
      { source: "B", target: "C", weight: 2 },
      { source: "B", target: "D", weight: 4 },
      { source: "B", target: "E", weight: 2 },
      { source: "C", target: "E", weight: 3 },
      { source: "D", target: "F", weight: 2 },
      { source: "E", target: "D", weight: 1 },
      { source: "E", target: "F", weight: 2 },
    ],
  });

  it("should work without weight", () => {
    const result1: any = bellmanFordSP(graphData, "A", "C");
    expect(result1.path).toEqual(["A", "C"]);
    expect(result1.cost).toBe(1);

    const path2: any = bellmanFordSP(graphData, "A", "D");
    expect(path2.path).toEqual(["A", "B", "D"]);
    expect(path2.cost).toBe(2);
  });

  it("should work with weight", () => {
    const result1: any = bellmanFordSP(graphData, "A", "C", (edge: any) =>
      edge.get("weight")
    );
    expect(result1.path).toEqual(["A", "C"]);
    expect(result1.cost).toBe(4);

    const result2: any = bellmanFordSP(graphData, "A", "D", (edge: any) =>
      edge.get("weight")
    );
    expect(result2.path).toEqual(["A", "B", "E", "D"]);
    expect(result2.cost).toBe(5);
  });

  it("should work with negative weight", () => {
    (graphData.getEdgeById("AB") as any).configs.weight = -2;
    const result1: any = bellmanFordSP(graphData, "A", "C", (edge: any) =>
      edge.get("weight")
    );
    expect(result1.path).toEqual(["A", "B", "C"]);
    expect(result1.cost).toBe(0);

    const result2: any = bellmanFordSP(graphData, "A", "D", (edge: any) =>
      edge.get("weight")
    );
    expect(result2.path).toEqual(["A", "B", "E", "D"]);
    expect(result2.cost).toBe(1);
  });
});
