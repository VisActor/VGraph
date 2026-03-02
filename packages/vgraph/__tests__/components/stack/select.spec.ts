import { Graph } from "../../../src/graph";
import { Stack, SelectCommand } from "../../../src/components";
import { GRAPH_EVENTS } from "../../../src";

describe("/src/commands/select", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 800,
    height: 600,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 40,
      };
    },
  });

  graph.data({
    nodes: [
      {
        id: "0",
      },
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
      { id: "edge", source: "0", target: "2" },
      { source: "1", target: "2" },
      { source: "4", target: "3" },
      { source: "1", target: "3" },
    ],
  });

  const stack = new Stack(graph, {
    commands: { select: SelectCommand },
  });

  it("select should work", () => {
    const node = graph.getNodeById("0");
    stack.execute("select", { selections: [node] });
    expect(node.hasState("select"));
    expect(stack.stack.length).toBe(0);
    expect(graph.get("_selections")).toEqual({
      node: ["0"],
      edge: [],
      group: [],
    });

    const node1 = graph.getNodeById("1");
    const edge1 = graph.getEdgeById("edge");
    stack.execute("select", { selections: [node1, edge1] });
    expect(graph.get("_selections")).toEqual({
      node: ["1"],
      edge: ["edge"],
      group: [],
    });
    expect(node.hasState("select")).toBe(false);
    expect(node1.hasState("select"));
    expect(edge1.hasState("select"));
    expect(stack.stack.length).toBe(0);

    stack.execute("select", { selections: [] });
    expect(graph.get("_selections")).toEqual({
      node: [],
      edge: [],
      group: [],
    });
    expect(node1.hasState("select")).toBe(false);
    expect(edge1.hasState("select")).toBe(false);
    expect(stack.stack.length).toBe(0);
  });

  it("select same entity should not execute", () => {
    let i = 0;
    graph.on(GRAPH_EVENTS.BATCH_STATE_END, () => {
      i++;
    });
    const node = graph.getNodeById("0");
    stack.execute("select", { selections: [node] });
    expect(i).toBe(1);
    stack.execute("select", { selections: [node] });
    expect(i).toBe(1);
    stack.execute("select", { selections: [node, graph.getNodeById("1")] });
    expect(i).toBe(2);
    stack.execute("select", { selections: [node, graph.getNodeById("1")] });
    expect(i).toBe(2);
    stack.execute("select", { selections: [] });
    expect(i).toBe(3);
    stack.execute("select", { selections: [] });
    expect(i).toBe(3);
  });
});
