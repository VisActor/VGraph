import { GraphStructure } from "../../src/graph_structure";
import { breadthFirstSearch, dijkstraSP } from "../../src/algorithms";
import {
  connectedComponents,
  isMultiComponentsForData,
} from "../../src/layouts/utils";

function createLinearGraph(size: number) {
  return new GraphStructure({
    nodes: Array.from({ length: size }, (_, index) => ({ id: `n${index}` })),
    edges: Array.from({ length: size - 1 }, (_, index) => ({
      source: `n${index}`,
      target: `n${index + 1}`,
    })),
  });
}

describe("standard graph algorithm behavior", () => {
  it("traverses each reachable node once even with cycles and parallel edges", () => {
    const graph = new GraphStructure({
      nodes: ["A", "B", "C", "D"].map((id) => ({ id })),
      edges: [
        { source: "A", target: "B" },
        { source: "A", target: "B" },
        { source: "B", target: "C" },
        { source: "C", target: "A" },
        { source: "C", target: "D" },
      ],
    });
    const visited: string[] = [];

    breadthFirstSearch(graph, graph.getNodeById("A"), ({ currentNode }) => {
      visited.push(currentNode.get("id"));
    });

    expect(visited).toEqual(["A", "B", "C", "D"]);
  });

  it("returns a zero-cost path when the shortest path starts and ends at the same node", () => {
    const graph = createLinearGraph(3);

    expect(dijkstraSP(graph, "n1", "n1")).toEqual({
      path: ["n1"],
      cost: 0,
    });
  });

  it("reports disconnected components and leaf count consistently", () => {
    const graph = new GraphStructure({
      nodes: ["A", "B", "C", "D", "E"].map((id) => ({ id })),
      edges: [
        { source: "A", target: "B" },
        { source: "B", target: "C" },
        { source: "D", target: "E" },
      ],
    });

    expect(connectedComponents(graph)).toEqual({
      components: {
        A: 0,
        B: 0,
        C: 0,
        D: 1,
        E: 1,
      },
      numLeaf: 4,
      isMultiComponents: true,
    });
  });

  it("handles empty graph data when checking connectivity", () => {
    expect(isMultiComponentsForData({ nodes: [], edges: [] })).toEqual({
      numLeaf: 0,
      isMultiComponents: false,
    });
  });
});
