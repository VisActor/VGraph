import { GraphStructure } from "../../../src/graph_structure";
import { bilayerBaryCenter } from "../../../src/layouts/dag/order/bilayer_bary_center";
import { bilayerCrossCount } from "../../../src/layouts/dag/order/bilayer_cross_count";

describe("src/bilayer_bary_center", () => {
  it("should calculate bary center", () => {
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
        {
          id: "5",
        },
        {
          id: "6",
        },
        {
          id: "a",
        },
        {
          id: "b",
        },
        {
          id: "c",
        },
        {
          id: "d",
        },
        {
          id: "e",
        },
      ],
      edges: [
        // 乱序给边
        { source: "1", target: "a" },
        { source: "2", target: "c" },
        { source: "2", target: "b" },
        { source: "3", target: "e" },
        { source: "3", target: "a" },
        { source: "3", target: "d" },
        { source: "6", target: "e" },
        { source: "6", target: "c" },
        { source: "4", target: "c" },
        { source: "4", target: "a" },
        { source: "5", target: "d" },
      ],
    });
    const barycenterResult = bilayerBaryCenter(
      [
        graph.getNodeById("1"),
        graph.getNodeById("2"),
        graph.getNodeById("3"),
        graph.getNodeById("4"),
        graph.getNodeById("5"),
        graph.getNodeById("6"),
      ],
      [
        graph.getNodeById("a"),
        graph.getNodeById("b"),
        graph.getNodeById("c"),
        graph.getNodeById("d"),
        graph.getNodeById("e"),
      ]
    );
    expect(barycenterResult.length).toBe(5);
    expect(barycenterResult[0].node.get("id")).toEqual("a");
    expect(barycenterResult[0].weight).toEqual(3);
    expect(barycenterResult[0].baryCenter).toEqual(8 / 3);

    expect(barycenterResult[1].node.get("id")).toEqual("b");
    expect(barycenterResult[1].weight).toEqual(1);
    expect(barycenterResult[1].baryCenter).toEqual(2);

    expect(barycenterResult[2].node.get("id")).toEqual("c");
    expect(barycenterResult[2].weight).toEqual(3);
    expect(barycenterResult[2].baryCenter).toEqual(4);

    expect(barycenterResult[3].node.get("id")).toEqual("d");
    expect(barycenterResult[3].weight).toEqual(2);
    expect(barycenterResult[3].baryCenter).toEqual(4);

    expect(barycenterResult[4].node.get("id")).toEqual("e");
    expect(barycenterResult[4].weight).toEqual(2);
    expect(barycenterResult[4].baryCenter).toEqual(9 / 2);
    expect(
      bilayerCrossCount(
        [
          graph.getNodeById("1"),
          graph.getNodeById("2"),
          graph.getNodeById("3"),
          graph.getNodeById("4"),
          graph.getNodeById("5"),
          graph.getNodeById("6"),
        ],
        [
          graph.getNodeById("a"),
          graph.getNodeById("b"),
          graph.getNodeById("c"),
          graph.getNodeById("d"),
          graph.getNodeById("e"),
        ]
      )
    ).toBe(12);
    barycenterResult.sort((a, b) => {
      if (a.baryCenter !== undefined && b.baryCenter !== undefined) {
        return a.baryCenter - b.baryCenter;
      }
      return 0;
    });
    expect(
      bilayerCrossCount(
        [
          graph.getNodeById("1"),
          graph.getNodeById("2"),
          graph.getNodeById("3"),
          graph.getNodeById("4"),
          graph.getNodeById("5"),
          graph.getNodeById("6"),
        ],
        barycenterResult.map((d: any) => d.node)
      )
    ).toBe(11);
  });

  it("should work with some nodes do not connected to northlayer", () => {
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
          id: "d",
        },
        {
          id: "b",
        },
        {
          id: "c",
        },
        {
          id: "a",
        },
      ],
      edges: [
        { source: "1", target: "b" },
        { source: "1", target: "a" },
        { source: "1", target: "d" },
        { source: "2", target: "1" },
        { source: "3", target: "a" },
        { source: "2", target: "b" },
        { source: "d", target: "c" },
      ],
    });
    const barycenterResult = bilayerBaryCenter(
      [graph.getNodeById("1"), graph.getNodeById("2"), graph.getNodeById("3")],
      [
        graph.getNodeById("d"),
        graph.getNodeById("b"),
        graph.getNodeById("c"),
        graph.getNodeById("a"),
      ]
    );
    expect(barycenterResult.length).toBe(4);
    expect(barycenterResult[0].node.get("id")).toEqual("d");
    expect(barycenterResult[0].weight).toEqual(1);
    expect(barycenterResult[0].baryCenter).toEqual(1);

    expect(barycenterResult[1].node.get("id")).toEqual("b");
    expect(barycenterResult[1].weight).toEqual(2);
    expect(barycenterResult[1].baryCenter).toEqual(3 / 2);

    expect(barycenterResult[2].node.get("id")).toEqual("c");
    expect(barycenterResult[2].weight).toBe(undefined);
    expect(barycenterResult[2].baryCenter).toBe(undefined);

    expect(barycenterResult[3].node.get("id")).toEqual("a");
    expect(barycenterResult[3].weight).toEqual(2);
    expect(barycenterResult[3].baryCenter).toEqual(4 / 2);
  });

  it("should work with weighted edges", () => {
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
          id: "d",
        },
        {
          id: "b",
        },
        {
          id: "c",
        },
        {
          id: "a",
        },
      ],
      edges: [
        { source: "1", target: "b", weight: 3, id: "1b" },
        { source: "1", target: "a", weight: 2 },
        { source: "1", target: "d", weight: 1 },
        { source: "3", target: "a", weight: 4 },
        { source: "2", target: "b", weight: 5 },
        { source: "d", target: "c", weight: 8 },
      ],
    });
    const barycenterResult = bilayerBaryCenter(
      [graph.getNodeById("1"), graph.getNodeById("2"), graph.getNodeById("3")],
      [
        graph.getNodeById("d"),
        graph.getNodeById("b"),
        graph.getNodeById("c"),
        graph.getNodeById("a"),
      ],
      graph.getEdges()
    );
    expect(graph.getEdgeById("1b").get("weight")).toBe(3);

    expect(barycenterResult.length).toBe(4);
    expect(barycenterResult[0].node.get("id")).toEqual("d");
    expect(barycenterResult[0].weight).toEqual(1);
    expect(barycenterResult[0].baryCenter).toEqual(1);

    expect(barycenterResult[1].node.get("id")).toEqual("b");
    expect(barycenterResult[1].weight).toEqual(8);
    expect(barycenterResult[1].baryCenter).toEqual(13 / 8);

    expect(barycenterResult[2].node.get("id")).toEqual("c");
    expect(barycenterResult[2].weight).toBe(undefined);
    expect(barycenterResult[2].baryCenter).toBe(undefined);

    expect(barycenterResult[3].node.get("id")).toEqual("a");
    expect(barycenterResult[3].weight).toEqual(6);
    expect(barycenterResult[3].baryCenter).toEqual(14 / 6);
  });

  it("should work with empty layer", () => {
    const barycenterResult = bilayerBaryCenter([], []);
    expect(barycenterResult.length).toBe(0);
  });
});
