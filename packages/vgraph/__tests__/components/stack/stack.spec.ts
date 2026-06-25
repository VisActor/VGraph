import { Graph } from "../../../src/graph";
import { Stack, CommandBase } from "../../../src/components";

describe("/src/stack", () => {
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

  const node = graph.add("node", { id: "111" });

  const stack = new Stack(graph, {
    commands: { base: CommandBase },
  });

  it("default stack should work", () => {
    expect(stack.stack).toEqual([]);
    expect(stack.at).toBe(-1);
    expect(stack.capacity).toBe(20);
    expect(stack.canUndo()).toBe(false);
    expect(stack.canRedo()).toBe(false);
    stack.undo();
    stack.redo();

    stack.execute("base");
    expect(stack.hasCommand("base")).toBe(true);
    expect(stack.stack.length).toBe(1);
    expect(stack.at).toBe(0);
    expect(stack.stack).toEqual([
      {
        name: "base",
        data: {
          selections: {
            node: [],
            edge: [],
            group: [],
          },
          snapshotData: {
            nodes: [
              {
                id: "111",
                width: 100,
                height: 40,
                x: 0,
                y: 0,
              },
            ],
            edges: [],
            groups: [],
          },
          undoMatrix: [1, 0, 0, 1, 0, 0],
        },
      },
    ]);

    expect(stack.canUndo()).toBe(true);
    expect(stack.canRedo()).toBe(false);
    graph.remove(node);
    expect(node.layer.destroyed);

    stack.undo();
    expect(stack.stack.length).toBe(1);
    expect(stack.at).toBe(-1);
    expect(graph.getNodes().length).toBe(1);
    expect(graph.getNodeById("111")).not.toBe(true);
    expect(graph.getNodeById("111").configs).toEqual({
      id: "111",
      width: 100,
      height: 40,
      x: 0,
      y: 0,
    });
    expect(stack.canUndo()).toBe(false);
    expect(stack.canRedo()).toBe(true);
    stack.redo();
    expect(stack.stack.length).toBe(1);
    expect(stack.at).toBe(0);
    expect(stack.canUndo()).toBe(true);
    expect(stack.canRedo()).toBe(false);
  });

  it("stack with custom options should work", () => {
    const stack = new Stack(graph, {
      capacity: 2,
      commands: { base: CommandBase },
    });

    expect(stack.capacity).toBe(2);
    expect(stack.mode).toBe("");

    stack.execute("base");
    expect(stack.stack.length).toBe(1);
    expect(stack.at).toBe(0);
    stack.execute("base");
    expect(stack.stack.length).toBe(2);
    expect(stack.at).toBe(1);
    stack.undo();
    expect(stack.at).toBe(0);
    stack.execute("base");
    expect(stack.at).toBe(1);
    expect(stack.stack.length).toBe(2);
    stack.execute("base");
    expect(stack.at).toBe(1);
    expect(stack.stack.length).toBe(2);
  });

  it("bugfix: execute *2 -> undo * 2 -> execute -> redo, redo should not work", () => {
    const stack = new Stack(graph, {
      capacity: 2,
      commands: { base: CommandBase },
    });
    stack.execute("base");
    stack.execute("base");
    expect(stack.stack.length).toBe(2);
    expect(stack.at).toBe(1);
    stack.undo();
    stack.undo();
    expect(stack.stack.length).toBe(2);
    expect(stack.at).toBe(-1);
    stack.execute("base");
    expect(stack.stack.length).toBe(1);
    expect(stack.at).toBe(0);
    stack.redo();
    expect(stack.stack.length).toBe(1);
    expect(stack.at).toBe(0);
  });
});
