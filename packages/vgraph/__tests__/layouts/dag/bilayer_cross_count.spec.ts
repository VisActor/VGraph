import { GraphStructure } from "../../../src/graph_structure";
import { bilayerCrossCount } from "../../../src/layouts/dag/order/bilayer_cross_count";

describe("src/bilayer_cross_count", () => {
  it("should calculate cross counts", () => {
    const graph = new GraphStructure({
      nodes: [
        {
          id: "1",
        },
        {
          id: "2",
        },
        {
          id: "3",
        },
        {
          id: "4",
        },
      ],
      edges: [
        { source: "1", target: "4" },
        { source: "2", target: "3" },
      ],
    });
    expect(
      bilayerCrossCount(
        [graph.getNodeById("1"), graph.getNodeById("2")],
        [graph.getNodeById("3"), graph.getNodeById("4")]
      )
    ).toBe(1);

    expect(
      bilayerCrossCount(
        [graph.getNodeById("1"), graph.getNodeById("2")],
        [graph.getNodeById("3"), graph.getNodeById("4")],
        graph.getEdges()
      )
    ).toBe(1);
  });

  it("should work with edge weight", () => {
    const graph = new GraphStructure({
      nodes: [
        {
          id: "1",
        },
        {
          id: "2",
        },
        {
          id: "3",
        },
        {
          id: "4",
        },
      ],
      edges: [
        { source: "1", target: "4", weight: 2 },
        { source: "2", target: "3", weight: 3 },
      ],
    });
    expect(
      bilayerCrossCount(
        [graph.getNodeById("1"), graph.getNodeById("2")],
        [graph.getNodeById("3"), graph.getNodeById("4")]
      )
    ).toBe(1);

    expect(
      bilayerCrossCount(
        [graph.getNodeById("1"), graph.getNodeById("2")],
        [graph.getNodeById("3"), graph.getNodeById("4")],
        graph.getEdges()
      )
    ).toBe(6);
  });

  it("should work when there is no cross", () => {
    const graph = new GraphStructure({
      nodes: [
        {
          id: "1",
        },
        {
          id: "2",
        },
        {
          id: "3",
        },
      ],
      edges: [{ source: "1", target: "3" }],
    });
    expect(
      bilayerCrossCount(
        [graph.getNodeById("1"), graph.getNodeById("2")],
        [graph.getNodeById("3")]
      )
    ).toBe(0);
    expect(
      bilayerCrossCount(
        [graph.getNodeById("1"), graph.getNodeById("2")],
        [graph.getNodeById("3")],
        graph.getEdges()
      )
    ).toBe(0);
  });
});
