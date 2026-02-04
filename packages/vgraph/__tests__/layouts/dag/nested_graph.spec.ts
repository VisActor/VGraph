import { Graph } from "../../../src/graph";
import { DAGLayout } from "../../../src/layouts/dag";
describe("src/layouts/dag", () => {
  const graphDiv = document.createElement("div");
  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    setDefaultNode() {
      return {
        width: 100,
        height: 40,
      };
    },
  });

  it("DAGLayout should work for nested groups", () => {
    //     (A)
    //    /   \
    //   (B)   C
    //     ↓
    //    (A)
    //    (B)
    //    (C)
    graph.data({
      nodes: [{ id: "A" }, { id: "B" }, { id: "C" }],
      edges: [
        { source: "A", target: "B" },
        { source: "A", target: "C" },
      ],
      groups: [
        {
          id: "group1",
          children: ["A", "B"],
        },
        {
          id: "group2",
          children: ["C"],
        },
      ],
    });

    new DAGLayout({
      graph,
      rankDir: "TB",
      nodeSep: 20,
      edgeSep: 10,
      rankSep: 50,
      ranker: "networkSimplex",
    });

    expect(graph.getNodeById("A").get("x")).toBe(0);
    expect(graph.getNodeById("A").get("y")).toBe(40);
    expect(graph.getNodeById("B").get("x")).toBe(0);
    expect(graph.getNodeById("B").get("y")).toBe(130);
    expect(graph.getNodeById("C").get("x")).toBe(0);
    expect(graph.getNodeById("C").get("y")).toBe(260);

    graph.clear();
  });

  it("DAGLayout should work for link node nested graph1", () => {
    //  (A)     (B)
    //         x
    //  (C, D)  (E)
    //       ↓
    //  (A)     (B)
    //  (E)   (D, C)
    graph.data({
      nodes: [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }, { id: "E" }],
      edges: [
        { source: "A", target: "E" },
        { source: "B", target: "D" },
      ],
      groups: [
        {
          id: "group1",
          children: ["A"],
        },
        {
          id: "group2",
          children: ["B"],
        },
        {
          id: "group3",
          children: ["C", "D"],
        },
        {
          id: "group4",
          children: ["E"],
        },
      ],
    });

    new DAGLayout({
      graph,
      rankDir: "TB",
      nodeSep: 20,
      edgeSep: 10,
      rankSep: 50,
    });

    expect(graph.getNodeById("A").get("x")).toBe(0);
    expect(graph.getNodeById("A").get("y")).toBe(40);
    expect(graph.getNodeById("B").get("x")).toBe(220);
    expect(graph.getNodeById("B").get("y")).toBe(40);
    expect(graph.getNodeById("C").get("x")).toBe(280);
    expect(graph.getNodeById("C").get("y")).toBe(170);
    expect(graph.getNodeById("D").get("x")).toBe(160);
    expect(graph.getNodeById("D").get("y")).toBe(170);
    expect(graph.getNodeById("E").get("x")).toBe(0);
    expect(graph.getNodeById("E").get("y")).toBe(170);

    graph.clear();
  });

  it("DAGLayout should work for link node nested graph2", () => {
    //  (A        B)
    //   |      x
    //  (E)  (C D)
    graph.data({
      nodes: [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }, { id: "E" }],
      edges: [
        { source: "A", target: "D" },
        { source: "A", target: "E" },
        { source: "B", target: "C" },
      ],
      groups: [
        {
          id: "group1",
          children: ["A", "B"],
        },
        {
          id: "group2",
          children: ["C", "D"],
        },
        {
          id: "group3",
          children: ["E"],
        },
      ],
    });

    new DAGLayout({
      graph,
      rankDir: "TB",
      nodeSep: 20,
      edgeSep: 10,
      rankSep: 50,
    });

    expect(graph.getNodeById("A").get("x")).toBe(170);
    expect(graph.getNodeById("A").get("y")).toBe(40);
    expect(graph.getNodeById("B").get("x")).toBe(50);
    expect(graph.getNodeById("B").get("y")).toBe(40);
    expect(graph.getNodeById("C").get("x")).toBe(-60);
    expect(graph.getNodeById("C").get("y")).toBe(170);
    expect(graph.getNodeById("D").get("x")).toBe(60);
    expect(graph.getNodeById("D").get("y")).toBe(170);
    expect(graph.getNodeById("E").get("x")).toBe(220);
    expect(graph.getNodeById("E").get("y")).toBe(170);

    graph.clear();
  });

  it("DAGLayout should work for link node nested graph3", () => {
    //  (A)   (B)
    //      x
    //  (C)   (D)
    //      x
    //  (E)   (F)
    graph.data({
      nodes: [
        { id: "A" },
        { id: "B" },
        { id: "C" },
        { id: "D" },
        { id: "E" },
        { id: "F" },
      ],
      edges: [
        { source: "A", target: "D" },
        { source: "B", target: "C" },
        { source: "C", target: "F" },
        { source: "D", target: "E" },
      ],
      groups: [
        {
          id: "group1",
          children: ["A"],
        },
        {
          id: "group2",
          children: ["B"],
        },
        {
          id: "group3",
          children: ["C"],
        },
        {
          id: "group4",
          children: ["D"],
        },
        {
          id: "group5",
          children: ["E"],
        },
        {
          id: "group6",
          children: ["F"],
        },
      ],
    });

    new DAGLayout({
      graph,
      rankDir: "TB",
      nodeSep: 20,
      edgeSep: 10,
      rankSep: 50,
    });

    expect(graph.getNodeById("A").get("x")).toBe(0);
    expect(graph.getNodeById("A").get("y")).toBe(40);
    expect(graph.getNodeById("B").get("x")).toBe(160);
    expect(graph.getNodeById("B").get("y")).toBe(40);
    expect(graph.getNodeById("C").get("x")).toBe(160);
    expect(graph.getNodeById("C").get("y")).toBe(170);
    expect(graph.getNodeById("D").get("x")).toBe(0);
    expect(graph.getNodeById("D").get("y")).toBe(170);
    expect(graph.getNodeById("E").get("x")).toBe(0);
    expect(graph.getNodeById("E").get("y")).toBe(300);
    expect(graph.getNodeById("F").get("x")).toBe(160);
    expect(graph.getNodeById("F").get("y")).toBe(300);
  });
});
