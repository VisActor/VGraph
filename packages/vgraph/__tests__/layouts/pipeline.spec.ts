import { Graph } from "../../src/graph";
import { PipelineLayout } from "../../src/layouts/pipeline";

function createGraph() {
  const div = document.createElement("div");
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    setDefaultNode() {
      return {
        width: 100,
        height: 40,
      };
    },
  });

  graph.data({
    nodes: [{ id: "root" }, { id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
    edges: [
      { id: "root-a", source: "root", target: "a" },
      { id: "a-b", source: "a", target: "b" },
      { id: "a-c", source: "a", target: "c" },
      { id: "b-d", source: "b", target: "d" },
      { id: "c-d", source: "c", target: "d" },
    ],
  });

  return graph;
}

describe("src/layouts/pipeline/index.ts", () => {
  it("should rank nodes from the configured root", () => {
    const graph = createGraph();
    const layout = new PipelineLayout({
      graph,
      rootId: "root",
      rankDir: "LR",
      rankSep: 60,
      nodeSep: 20,
    });
    graph.getNodeById("root").targets = ["a"];
    graph.getNodeById("a").targets = ["b", "c"];
    graph.getNodeById("b").targets = ["d"];
    graph.getNodeById("c").targets = ["d"];

    const layers = layout.getRank(graph.getNodeById("root"));

    expect(layers[0].map((node: any) => node.get("id"))).toEqual(["root"]);
    expect(layers[1].map((node: any) => node.get("id"))).toEqual(["a"]);
    expect(graph.getNodeById("root").get("rank")).toBe(0);
    expect(graph.getNodeById("a").get("rank")).toBe(1);
    expect(graph.getNodeById("d").get("rank")).toBe(3);
  });

  it("should place rank rows by max node height", () => {
    const graph = createGraph();
    const layout = new PipelineLayout({
      graph,
      rootId: "root",
      rankSep: 20,
    });
    const root = graph.getNodeById("root");
    const a = graph.getNodeById("a");
    const b = graph.getNodeById("b");
    a.set("height", 60);

    const gapYs = layout.placeRankPosition([[root], [a, b]] as any);

    expect(root.get("y")).toBe(20);
    expect(a.get("y")).toBe(90);
    expect(b.get("y")).toBe(90);
    expect(gapYs).toEqual({
      0: { target: -10, source: 50, height: 40 },
      1: { target: 50, source: 130, height: 60 },
    });
  });

  it("should support former layout direction and alignment helpers", () => {
    const graph = createGraph();
    const layout = new PipelineLayout({
      graph,
      rootId: "root",
      rootCoord: [10, 20],
      nodeSize: [100, 40],
      rankDir: "TB",
      rankSep: 50,
      nodeSep: 30,
    } as any);

    layout.formerlayout();

    expect(graph.getNodeById("root").get("x")).toBe(20);
    expect(graph.getNodeById("root").get("y")).toBe(10);
    expect(graph.getNodeById("a").get("rank")).toBe(0);
    expect(graph.getNodeById("d").get("rank")).toBe(2);

    const d = graph.getNodeById("d");
    d.set("aligned", false);
    d.set("x", 10);
    d.set("y", 30);
    expect(layout.getAlign(d, graph)).toBe(30);
    graph.getNodes().forEach((node) => {
      node.set("aligned", true);
    });
    expect(layout.getAlign(d, graph)).toBe(null);
  });

  it("should no-op when root node does not exist", () => {
    const graph = createGraph();
    const layout = new PipelineLayout({
      graph,
      rootId: "missing-root",
    });

    expect(layout.layout()).toBeUndefined();
    expect(layout.formerlayout()).toBeUndefined();
  });
});
