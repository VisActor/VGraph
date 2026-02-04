import { Graph } from "../../../src/graph";
import { Stack, InsertNodeCommand } from "../../../src/components";

describe("/src/commands/add", () => {
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

  graph.add("node", { id: "1" });
  graph.add("node", { id: "2" });
  const edge = graph.add("edge", { source: "1", target: "2", id: "12" });
  const edge2 = graph.add("edge", {
    source: "1",
    target: "2",
    id: "1212",
    sourceAnchor: 0,
    targetAnchor: 1,
  });
  const stack = new Stack(graph, {
    commands: { insertNode: InsertNodeCommand },
  });

  it("add should work for insertNode", () => {
    stack.execute("insertNode", {
      edge,
    });
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getEdges()[1].get("sourceAnchor")).toBe(undefined);
    expect(graph.getEdges()[1].get("targetAnchor")).toBe(undefined);
    expect(graph.getEdges()[2].get("sourceAnchor")).toBe(undefined);
    expect(graph.getEdges()[2].get("targetAnchor")).toBe(undefined);
    expect(graph.getNodes()[2].hasState("select"));
    expect(stack.stack.length).toBe(1);
    expect(graph.getEdgeById("12")).toBe(undefined);
    expect(edge.isDestroyed()).toBe(true);

    stack.undo();
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getEdgeById("12").isDestroyed()).toBe(false);

    stack.redo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodes()[2].hasState("select"));

    stack.undo();

    stack.execute("insertNode", {
      edge: edge2,
      nodeConfigs: {
        id: "newNode",
      },
    });
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getEdges()[1].get("sourceAnchor")).toBe(0);
    expect(graph.getEdges()[1].get("targetAnchor")).toBe(1);
    expect(graph.getEdges()[2].get("sourceAnchor")).toBe(0);
    expect(graph.getEdges()[2].get("targetAnchor")).toBe(1);
    expect(graph.getNodes()[2].get("id")).toBe("newNode");
  });
});
