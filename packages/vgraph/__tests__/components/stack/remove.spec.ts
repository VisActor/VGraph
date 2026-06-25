import { Graph } from "../../../src/graph";
import {
  Stack,
  AddCommand,
  SelectCommand,
  RemoveCommand,
} from "../../../src/components";

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

  const stack = new Stack(graph, {
    commands: {
      add: AddCommand,
      select: SelectCommand,
      remove: RemoveCommand,
    },
  });

  stack.execute("add", { configs: { id: "1" }, type: "node" });

  it("remove should work with entity", () => {
    expect(stack.stack.length).toBe(1);
    const node = graph.getNodeById("1");
    stack.execute("remove", { entity: node });
    expect(node.isDestroyed());
    expect(stack.stack.length).toBe(2);
    expect(stack.stack[1].data.entity).toEqual({
      width: 100,
      height: 40,
      id: "1",
      x: 0,
      y: 0,
    });
    expect(stack.stack[1].data.selections).toEqual({
      node: ["1"],
      edge: [],
      group: [],
    });
    expect(stack.stack[1].data.undoMatrix).toEqual([1, 0, 0, 1, 0, 0]);
    expect(stack.stack[1].data.selectionConfigs.node.length).toBe(1);

    expect(graph.getNodes().length).toBe(0);

    stack.undo();
    expect(graph.getNodes().length).toBe(1);
    const newNode = graph.getNodeById("1");
    expect(node !== newNode);
    expect(newNode.get("id")).toBe("1");
    expect(newNode.get("width")).toBe(100);
    expect(newNode.get("height")).toBe(40);

    stack.redo();
    expect(graph.getNodes().length).toBe(0);
    expect(newNode.isDestroyed());
  });

  it("remove should work with selections", () => {
    graph.data({
      nodes: [
        { id: "1", x: 100, y: 100 },
        { id: "2", x: 300, y: 300 },
        { id: "3", x: 100, y: 200 },
      ],
      edges: [
        {
          id: "11",
          source: "1",
          target: "2",
        },
        {
          id: "22",
          source: "1",
          target: "3",
        },
      ],
    });
    stack.execute("select", {
      selections: [graph.getNodeById("2"), graph.getEdgeById("22")],
    });
    expect(stack.stack.length).toBe(2);

    stack.execute("remove");
    expect(stack.stack.length).toBe(3);
    expect(graph.getEdges().length).toBe(0);
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getNodeById("2")).toBe(undefined);
    expect(graph.getEdgeById("11")).toBe(undefined);
    expect(graph.getEdgeById("22")).toBe(undefined);
    expect(graph.get("_selections")).toEqual({
      node: [],
      edge: [],
      group: [],
    });

    stack.undo();
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getNodeById("2").get("x")).toBe(300);
    expect(graph.getNodeById("2").get("y")).toBe(300);
    expect(graph.getEdgeById("11").get("startPoint")).toBe(undefined);
    expect(graph.getEdgeById("11").get("target")).toBe("2");
    expect(graph.getEdgeById("11").get("endPoint")).toBe(undefined);
    expect(graph.getEdgeById("22").get("source")).toBe("1");
    expect(graph.getEdgeById("22").get("startPoint")).toBe(undefined);
    expect(graph.getEdgeById("22").get("target")).toBe("3");
    expect(graph.getEdgeById("22").get("endPoint")).toBe(undefined);
    expect(graph.get("_selections")).toEqual({
      node: ["2"],
      edge: ["22"],
      group: [],
    });

    stack.redo();
    expect(graph.getEdges().length).toBe(0);
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getNodeById("2")).toBe(undefined);
    expect(graph.getEdgeById("11")).toBe(undefined);
    expect(graph.getEdgeById("22")).toBe(undefined);
    expect(graph.get("_selections")).toEqual({
      node: [],
      edge: [],
      group: [],
    });
  });

  it("bugfix: remove node with edge, undo should recover edge.", () => {
    graph.data({
      nodes: [
        { id: "1", x: 100, y: 100 },
        { id: "2", x: 300, y: 300 },
        { id: "3", x: 100, y: 200 },
      ],
      edges: [
        {
          id: "11",
          source: "1",
          target: "2",
        },
        {
          id: "22",
          source: "1",
          target: "3",
        },
      ],
    });
    const node = graph.getNodeById("1");
    stack.execute("remove", { entity: node });
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdgeById("11")).toBeUndefined();
    expect(graph.getEdgeById("22")).toBeUndefined();
    stack.undo();
    expect(graph.getNodes().length).toBe(3);
    expect(graph.getEdgeById("11")).toBeDefined();
    expect(graph.getEdgeById("22")).toBeDefined();
    expect(graph.getEdgeById("11").isVisible()).toBe(true);
    expect(graph.getEdgeById("22").isVisible()).toBe(true);
    expect(graph.getEdgeById("11").get("source")).toBe("1");
    expect(graph.getEdgeById("11").get("target")).toBe("2");
    expect(graph.getEdgeById("22").get("source")).toBe("1");
    expect(graph.getEdgeById("22").get("target")).toBe("3");
    stack.redo();
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdgeById("11")).toBeUndefined();
    expect(graph.getEdgeById("22")).toBeUndefined();
  });
});
