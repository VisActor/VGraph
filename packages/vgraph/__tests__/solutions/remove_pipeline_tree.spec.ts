import { Graph } from "../../src/graph";
import { RemovePipelineTreeCommand } from "../../src/solutions/dag_flow_editor/commands";

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
      { id: "child", x: 200, y: 100 },
      { id: "grandchild", x: 300, y: 100 },
      { id: "sibling", x: 400, y: 100 },
    ],
    edges: [
      { id: "root-to-child", source: "root", target: "child" },
      { id: "child-to-grandchild", source: "child", target: "grandchild" },
      { id: "root-to-sibling", source: "root", target: "sibling" },
    ],
  });

  return graph;
}

describe("src/solutions/dag_flow_editor/commands/remove_pipeline_tree.ts", () => {
  it("should snapshot a removable pipeline subtree with parent order", () => {
    const graph = createGraph();
    const snapshot: any = RemovePipelineTreeCommand.getSnapshot(graph, {
      nodeId: "child",
      subTree: ["child", "grandchild"],
    });

    expect(snapshot.nodeId).toBe("child");
    expect(snapshot.subTree).toEqual(["child", "grandchild"]);
    expect(snapshot.parentId).toBe("root");
    expect(snapshot.parentOrder).toEqual(["child", "sibling"]);
    expect(snapshot.selectionConfigs.node.map((node: any) => node.id)).toEqual([
      "child",
      "grandchild",
    ]);
    expect(snapshot.selectionConfigs.edge.map((edge: any) => edge.id)).toEqual([
      "root-to-child",
      "child-to-grandchild",
    ]);
  });

  it("should execute, undo and redo removing a pipeline subtree", () => {
    const graph = createGraph();
    const snapshot: any = RemovePipelineTreeCommand.getSnapshot(graph, {
      nodeId: "child",
      subTree: ["child", "grandchild"],
    });

    const executeResult = RemovePipelineTreeCommand.execute(snapshot, graph);

    expect(executeResult).toEqual({ node: [], edge: [], group: [] });
    expect(graph.getNodeById("child")).toBeUndefined();
    expect(graph.getNodeById("grandchild")).toBeUndefined();
    expect(graph.getEdgeById("root-to-child")).toBeUndefined();

    const undoResult = RemovePipelineTreeCommand.undo(snapshot, graph);

    expect(undoResult).toEqual({ node: ["child"], edge: [], group: [] });
    expect(graph.getNodeById("child")).toBeDefined();
    expect(graph.getNodeById("grandchild")).toBeDefined();
    expect(graph.getEdgeById("root-to-child")).toBeDefined();

    const redoResult = RemovePipelineTreeCommand.redo(snapshot, graph);

    expect(redoResult).toEqual({ node: [], edge: [], group: [] });
    expect(graph.getNodeById("child")).toBeUndefined();
    expect(graph.getNodeById("grandchild")).toBeUndefined();
    expect(graph.getEdgeById("root-to-child")).toBeUndefined();
  });

  it("should describe execute and undo changes for collaboration", () => {
    const snapshot = {
      nodeId: "child",
      parentId: "root",
      parentOrder: ["child", "sibling"],
      selectionConfigs: {
        node: [{ id: "child" }, { id: "grandchild" }],
        edge: [{ id: "root-to-child" }, { id: "child-to-grandchild" }],
        group: [],
      },
    };

    expect(RemovePipelineTreeCommand.getExecuteChanges(snapshot)).toEqual([
      {
        action: "remove",
        change: snapshot.selectionConfigs,
      },
      {
        action: "update",
        change: {
          node: [
            {
              id: "root",
              targets: ["sibling"],
            },
          ],
          edge: [],
          group: [],
        },
      },
    ]);

    expect(RemovePipelineTreeCommand.getUndoChanges(snapshot)).toEqual([
      {
        action: "add",
        change: snapshot.selectionConfigs,
      },
      {
        action: "update",
        change: {
          node: [
            {
              id: "root",
              targets: ["child", "sibling"],
            },
          ],
          edge: [],
          group: [],
        },
      },
    ]);
  });
});
