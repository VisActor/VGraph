import { Graph } from "../../src/graph";
import { MovePipelineTreeNodeCommand } from "../../src/solutions/dag_flow_editor/commands";

function createGraph() {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 800,
    height: 600,
    container: div,
    setDefaultNode() {
      return {
        width: 100,
        height: 40,
      };
    },
  });

  graph.data({
    nodes: [
      { id: "root", x: 100, y: 100 },
      { id: "old-parent", x: 200, y: 100 },
      { id: "new-parent", x: 300, y: 100 },
      { id: "sibling", x: 400, y: 100 },
      { id: "child", x: 500, y: 100 },
    ],
    edges: [
      { id: "root-to-old", source: "root", target: "old-parent" },
      { id: "old-to-child", source: "old-parent", target: "child" },
      { id: "new-to-sibling", source: "new-parent", target: "sibling" },
    ],
  });

  return graph;
}

describe("src/solutions/dag_flow_editor/commands/move_pipeline_tree_node.ts", () => {
  it("should create a snapshot for moving a tree node to another parent", () => {
    const graph = createGraph();
    const snapshot = MovePipelineTreeNodeCommand.getSnapshot(graph, {
      nodeId: "child",
      parentId: "new-parent",
      index: "0",
    });

    expect(snapshot).toEqual({
      nodeId: "child",
      parentId: "new-parent",
      index: "0",
      formerParentId: "old-parent",
      formerParentOrder: ["child"],
      toParentOrder: ["sibling"],
      removeEdge: expect.objectContaining({
        id: "old-to-child",
        source: "old-parent",
        target: "child",
      }),
      addEdge: {
        id: expect.any(String),
        source: "new-parent",
        target: "child",
      },
    });
  });

  it("should execute and undo moving a tree node", () => {
    const graph = createGraph();
    const snapshot = {
      nodeId: "child",
      parentId: "new-parent",
      index: "0",
      formerParentId: "old-parent",
      formerParentOrder: ["child"],
      toParentOrder: ["sibling"],
      removeEdge: {
        ...graph.getEdgeById("old-to-child").configs,
      },
      addEdge: {
        id: "new-to-child",
        source: "new-parent",
        target: "child",
      },
    };

    const executeResult = MovePipelineTreeNodeCommand.execute(snapshot, graph);

    expect(executeResult).toEqual({ node: ["child"], edge: [], group: [] });
    expect(graph.getEdgeById("old-to-child")).toBeUndefined();
    expect(graph.getEdgeById("new-to-child")).toBeDefined();
    expect(graph.getNodeById("child").sources).toEqual(["new-parent"]);
    expect(graph.getNodeById("old-parent").targets).toEqual([]);
    expect(graph.getNodeById("new-parent").targets).toEqual([
      "child",
      "sibling",
    ]);

    MovePipelineTreeNodeCommand.undo(snapshot, graph);

    expect(graph.getEdgeById("new-to-child")).toBeUndefined();
    expect(graph.getEdgeById("old-to-child")).toBeDefined();
    expect(graph.getNodeById("child").sources).toEqual(["old-parent"]);
    expect(graph.getNodeById("old-parent").targets).toEqual(["child"]);
    expect(graph.getNodeById("new-parent").targets).toEqual(["sibling"]);
  });

  it("should describe execute and undo changes with append order fallback", () => {
    const snapshot = {
      nodeId: "child",
      parentId: "new-parent",
      formerParentId: "old-parent",
      formerParentOrder: ["child", "another-child"],
      toParentOrder: ["sibling"],
      removeEdge: {
        id: "old-to-child",
        source: "old-parent",
        target: "child",
      },
      addEdge: {
        id: "new-to-child",
        source: "new-parent",
        target: "child",
      },
    };

    expect(MovePipelineTreeNodeCommand.getExecuteChanges(snapshot)).toEqual([
      {
        action: "add",
        change: {
          node: [],
          edge: [snapshot.addEdge],
          group: [],
        },
      },
      {
        action: "update",
        change: {
          node: [
            {
              id: "old-parent",
              targets: ["another-child"],
            },
            {
              id: "new-parent",
              targets: ["sibling", "child"],
            },
          ],
          edge: [],
          group: [],
        },
      },
      {
        action: "remove",
        change: {
          node: [],
          edge: [snapshot.removeEdge],
          group: [],
        },
      },
    ]);

    expect(MovePipelineTreeNodeCommand.getUndoChanges(snapshot)).toEqual([
      {
        action: "add",
        change: {
          node: [],
          edge: [snapshot.removeEdge],
          group: [],
        },
      },
      {
        action: "update",
        change: {
          node: [
            {
              id: "old-parent",
              targets: ["child", "another-child"],
            },
            {
              id: "new-parent",
              targets: ["sibling"],
            },
          ],
          edge: [],
          group: [],
        },
      },
      {
        action: "remove",
        change: {
          node: [],
          edge: [snapshot.addEdge],
          group: [],
        },
      },
    ]);
  });
});
