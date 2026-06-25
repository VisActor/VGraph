import { Graph } from "../../src/graph";
import { GraphStructure } from "../../src/graph_structure";
import { dealDuplicateEdge } from "../../src/layouts/utils";

describe("src/utils/duplicate_edges.ts", () => {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);
  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode() {
      return { width: 140, height: 40 };
    },
  });
  it("default line should work", () => {
    graph.data({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
        { id: "3", x: -100, y: 0 },
        { id: "4", x: -200, y: 100 },
      ],
      edges: [
        { source: "0", target: "1" },
        { source: "0", target: "1" },
        { source: "1", target: "2" },
        { source: "1", target: "2" },
        { source: "2", target: "3" },
        { source: "2", target: "3" },
        { source: "4", target: "3" },
        { source: "3", target: "4" },
        { source: "4", target: "3" },
      ],
    });
    dealDuplicateEdge(graph, graph.getEdges());
    const edges = graph.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([[50, 3]]);
    expect(edges[1].get("controlPoints")).toEqual([[50, -3]]);
    expect(edges[2].get("controlPoints")).toEqual([
      [47.878679656440355, 47.878679656440355],
    ]);
    expect(edges[3].get("controlPoints")).toEqual([
      [52.121320343559645, 52.121320343559645],
    ]);
    expect(edges[4].get("controlPoints")).toEqual([
      [-47.878679656440355, 47.878679656440355],
    ]);
    expect(edges[5].get("controlPoints")).toEqual([
      [-52.121320343559645, 52.121320343559645],
    ]);
    expect(edges[6].get("controlPoints")).toEqual([[-150, 50]]);
    expect(edges[7].get("controlPoints")).toEqual([
      [-154.2426406871193, 45.757359312880716],
    ]);
    expect(edges[8].get("controlPoints")).toEqual([
      [-145.7573593128807, 54.242640687119284],
    ]);
  });
  it("default line with controlPoints should work", () => {
    graph.data({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
        { id: "3", x: -100, y: 0 },
        { id: "4", x: -200, y: 100 },
      ],
      edges: [
        { source: "0", target: "1", controlPoints: [[50, 50]] },
        { source: "0", target: "1" },
        { source: "1", target: "2", controlPoints: [[51, 50]] },
        { source: "1", target: "2" },
      ],
    });
    dealDuplicateEdge(graph, graph.getEdges());
    const edges = graph.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([[53, 50]]);
    expect(edges[1].get("controlPoints")).toEqual([[47, 50]]);
    expect(edges[2].get("controlPoints")).toEqual([[51, 53]]);
    expect(edges[3].get("controlPoints")).toEqual([[51, 47]]);
  });

  it("default line with scale parameter should work", () => {
    graph.data({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
        { id: "3", x: -100, y: 0 },
        { id: "4", x: -200, y: 100 },
      ],
      edges: [
        { source: "0", target: "1", controlPoints: [[50, 50]] },
        { source: "0", target: "1" },
        { source: "1", target: "2", controlPoints: [[51, 50]] },
        { source: "1", target: "2" },
      ],
    });
    dealDuplicateEdge(graph, graph.getEdges(), true, 10);
    const edges = graph.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([[55, 50]]);
    expect(edges[1].get("controlPoints")).toEqual([[45, 50]]);
    expect(edges[2].get("controlPoints")).toEqual([[51, 55]]);
    expect(edges[3].get("controlPoints")).toEqual([[51, 45]]);
  });

  it("hLine with scale parameter should work", () => {
    graph.data({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
        { id: "3", x: -100, y: 0 },
        { id: "4", x: -200, y: 100 },
      ],
      edges: [
        { source: "0", target: "1", type: "hLine" },
        { source: "0", target: "1", type: "hLine" },
        { source: "2", target: "1", type: "hLine" },
        { source: "1", target: "2", type: "hLine" },
        { source: "1", target: "2", type: "hLine" },
        { source: "3", target: "4", type: "hLine" },
        { source: "4", target: "3", type: "hLine" },
      ],
    });
    dealDuplicateEdge(graph, graph.getEdges(), true, 10);
    const edges = graph.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([[50, 5]]);
    expect(edges[1].get("controlPoints")).toEqual([[50, -5]]);
    expect(edges[2].get("controlPoints")).toEqual([
      [50, 100],
      [50, 0],
    ]);
    expect(edges[3].get("controlPoints")).toEqual(
      [
        [40, 100],
        [40, 0],
      ].reverse()
    );
    expect(edges[4].get("controlPoints")).toEqual(
      [
        [60, 100],
        [60, 0],
      ].reverse()
    );
    expect(edges[5].get("controlPoints")).toEqual([
      [-145, 0],
      [-145, 100],
    ]);
    expect(edges[6].get("controlPoints")).toEqual(
      [
        [-155, 0],
        [-155, 100],
      ].reverse()
    );
  });
  it("bugfix: hLine if dy = 0 should work", () => {
    graph.data({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
        { id: "3", x: -100, y: 0 },
        { id: "4", x: -100, y: 100 },
      ],
      edges: [
        { source: "0", target: "1", type: "hLine" },
        { source: "0", target: "1", type: "hLine" },
        { source: "2", target: "1", type: "hLine" },
        { source: "1", target: "2", type: "hLine" },
        { source: "1", target: "2", type: "hLine" },
        { source: "3", target: "4", type: "hLine" },
        { source: "4", target: "3", type: "hLine" },
      ],
    });
    dealDuplicateEdge(graph, graph.getEdges(), true, 10);
    const edges = graph.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([[50, 5]]);
    expect(edges[1].get("controlPoints")).toEqual([[50, -5]]);
    expect(edges[2].get("controlPoints")).toEqual([
      [50, 100],
      [50, 0],
    ]);
    expect(edges[3].get("controlPoints")).toEqual(
      [
        [40, 100],
        [40, 0],
      ].reverse()
    );
    expect(edges[4].get("controlPoints")).toEqual(
      [
        [60, 100],
        [60, 0],
      ].reverse()
    );
    expect(edges[5].get("controlPoints")).toEqual([[-95, 50]]);
    expect(edges[6].get("controlPoints")).toEqual([[-105, 50]]);
  });

  it("Graph Structure should work", () => {
    const graphStructure = new GraphStructure({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
        { id: "3", x: -100, y: 0 },
        { id: "4", x: -200, y: 100 },
      ],
      edges: [
        { source: "0", target: "1", type: "hLine" },
        { source: "0", target: "1", type: "hLine" },
        { source: "2", target: "1", type: "hLine" },
        { source: "1", target: "2", type: "hLine" },
        { source: "1", target: "2", type: "hLine" },
        { source: "3", target: "4", type: "hLine" },
        { source: "4", target: "3", type: "hLine" },
      ],
    });
    dealDuplicateEdge(graphStructure, graphStructure.getEdges(), true, 10);
    const edges = graphStructure.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([[50, 5]]);
    expect(edges[1].get("controlPoints")).toEqual([[50, -5]]);
    expect(edges[2].get("controlPoints")).toEqual([
      [50, 100],
      [50, 0],
    ]);
    expect(edges[3].get("controlPoints")).toEqual(
      [
        [40, 100],
        [40, 0],
      ].reverse()
    );
    expect(edges[4].get("controlPoints")).toEqual(
      [
        [60, 100],
        [60, 0],
      ].reverse()
    );
    expect(edges[5].get("controlPoints")).toEqual([
      [-145, 0],
      [-145, 100],
    ]);
    expect(edges[6].get("controlPoints")).toEqual(
      [
        [-155, 0],
        [-155, 100],
      ].reverse()
    );
  });
  it("Graph Structure  with default line should work", () => {
    const graphStructure = new GraphStructure({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
        { id: "3", x: -100, y: 0 },
        { id: "4", x: -200, y: 100 },
      ],
      edges: [
        { source: "0", target: "1" },
        { source: "0", target: "1" },
        { source: "1", target: "2" },
        { source: "1", target: "2" },
        { source: "2", target: "3" },
        { source: "2", target: "3" },
        { source: "4", target: "3" },
        { source: "3", target: "4" },
        { source: "4", target: "3" },
      ],
    });
    dealDuplicateEdge(graphStructure, graphStructure.getEdges());
    const edges = graphStructure.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([[50, 3]]);
    expect(edges[1].get("controlPoints")).toEqual([[50, -3]]);
    expect(edges[2].get("controlPoints")).toEqual([
      [47.878679656440355, 47.878679656440355],
    ]);
    expect(edges[3].get("controlPoints")).toEqual([
      [52.121320343559645, 52.121320343559645],
    ]);
    expect(edges[4].get("controlPoints")).toEqual([
      [-47.878679656440355, 47.878679656440355],
    ]);
    expect(edges[5].get("controlPoints")).toEqual([
      [-52.121320343559645, 52.121320343559645],
    ]);
    expect(edges[6].get("controlPoints")).toEqual([[-150, 50]]);
    expect(edges[7].get("controlPoints")).toEqual([
      [-154.2426406871193, 45.757359312880716],
    ]);
    expect(edges[8].get("controlPoints")).toEqual([
      [-145.7573593128807, 54.242640687119284],
    ]);
  });

  it("hLine with controlPoints should work", () => {
    graph.data({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
      ],
      edges: [
        {
          source: "0",
          target: "1",
          type: "hLine",
          controlPoints: [
            [40, -20],
            [80, -20],
          ],
        },
        {
          source: "0",
          target: "1",
          type: "hLine",
          controlPoints: [
            [40, -20],
            [80, -20],
          ],
        },
        {
          source: "2",
          target: "1",
          type: "hLine",
          controlPoints: [
            [40, 20],
            [80, 20],
          ],
        },
        {
          source: "1",
          target: "2",
          type: "hLine",
          controlPoints: [
            [40, 20],
            [80, 20],
          ],
        },
        {
          source: "1",
          target: "2",
          type: "hLine",
          controlPoints: [
            [40, 20],
            [80, 20],
          ],
        },
      ],
    });
    dealDuplicateEdge(graph, graph.getEdges());
    const edges = graph.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([
      [40, -17],
      [80, -17],
    ]);
    expect(edges[1].get("controlPoints")).toEqual([
      [40, -23],
      [80, -23],
    ]);
    expect(edges[2].get("controlPoints")).toEqual([
      [40, 20],
      [80, 20],
    ]);
    expect(edges[3].get("controlPoints")).toEqual([
      [80, 14],
      [40, 14],
    ]);
    expect(edges[4].get("controlPoints")).toEqual([
      [80, 26],
      [40, 26],
    ]);
  });

  it("vLine with controlPoints should work", () => {
    graph.data({
      nodes: [
        { id: "0", x: 0, y: 0 },
        { id: "1", x: 100, y: 0 },
        { id: "2", x: 0, y: 100 },
      ],
      edges: [
        {
          source: "0",
          target: "1",
          type: "vLine",
          controlPoints: [
            [40, -10],
            [80, -20],
          ],
        },
        {
          source: "0",
          target: "1",
          type: "vLine",
          controlPoints: [
            [40, -10],
            [80, -20],
          ],
        },
        {
          source: "2",
          target: "1",
          type: "vLine",
          controlPoints: [
            [40, 10],
            [80, 20],
          ],
        },
        {
          source: "1",
          target: "2",
          type: "vLine",
          controlPoints: [
            [40, 10],
            [80, 20],
          ],
        },
        {
          source: "1",
          target: "2",
          type: "vLine",
          controlPoints: [
            [40, 10],
            [80, 20],
          ],
        },
      ],
    });
    dealDuplicateEdge(graph, graph.getEdges());
    const edges = graph.getEdges();
    expect(edges[0].get("controlPoints")).toEqual([
      [43, -10],
      [83, -20],
    ]);
    expect(edges[1].get("controlPoints")).toEqual([
      [37, -10],
      [77, -20],
    ]);
    expect(edges[2].get("controlPoints")).toEqual([
      [40, 10],
      [80, 20],
    ]);
    expect(edges[3].get("controlPoints")).toEqual([
      [74, 20],
      [34, 10],
    ]);
    expect(edges[4].get("controlPoints")).toEqual([
      [86, 20],
      [46, 10],
    ]);
  });
});
