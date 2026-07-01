import { DAGFlowEditor } from "../../src";

function createEditor(options?: {
  data?: { nodes: any[]; edges: any[] };
  onChange?: jest.Mock;
  onClickNode?: jest.Mock;
  mask?: {
    enable: boolean;
    onVisibleChange?: jest.Mock;
  };
}) {
  const div = document.createElement("div");
  document.body.appendChild(div);

  const editor = new DAGFlowEditor({
    container: div,
    graphSize: [800, 600],
    data: options?.data,
    scroller: {
      enable: false,
    },
    setDefaultNode(nodeData: any) {
      return {
        width: nodeData.width ?? 100,
        height: nodeData.height ?? 40,
      };
    },
    setDefaultEdge() {
      return {
        lineWidth: 1,
      };
    },
    onChange: options?.onChange ?? jest.fn(),
    onClickNode: options?.onClickNode,
    mask: options?.mask,
  });

  return { editor, div };
}

describe("src/solutions/dag_flow_editor/index.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should initialize an empty editor with virtual root and initial node", () => {
    const { editor } = createEditor();
    const graph = editor.getGraph();

    expect(graph.getNodeById("initial")).toBeDefined();
    expect(graph.getNodeById("vgraphDagFlowRoot")).toBeDefined();
    expect(graph.getNodeById("vgraphDagFlowRoot").isVisible()).toBe(false);
    expect(graph.getEdges().length).toBe(1);

    const data = editor.exportData();
    expect(data.nodes.map((node: any) => node.id)).toEqual(["initial"]);
    expect(data.edges).toEqual([]);

    editor.destroy();
  });

  it("should set, export and snapshot DAG data without virtual root edge", () => {
    const { editor } = createEditor({
      data: {
        nodes: [{ id: "a", targets: ["b"] }, { id: "b" }, { id: "c" }],
        edges: [{ id: "a-b", source: "a", target: "b" }],
      },
    });
    const graph = editor.getGraph();

    expect(graph.getNodeById("vgraphDagFlowRoot").isVisible()).toBe(false);
    expect(graph.getNodeById("a").targets).toEqual(["b"]);
    expect(graph.getNodeById("c").sources).toEqual(["vgraphDagFlowRoot"]);

    const exported = editor.exportData(
      (entity: any) => ({ id: entity.get("id") }),
      (edge: any) => ({ id: edge.get("id") })
    );
    expect(exported.nodes.map((node: any) => node.id)).toEqual(["a", "c", "b"]);
    expect(exported.edges).toEqual([{ id: "a-b", source: "a", target: "b" }]);

    const snapshot = editor.getSnapshot();
    expect(snapshot.selections).toEqual({ node: [], edge: [], group: [] });
    expect(
      snapshot.nodes.some((node: any) => node.id === "vgraphDagFlowRoot")
    ).toBe(true);

    editor.destroy();
  });

  it("should add, update, select, undo and redo through editor APIs", () => {
    const onChange = jest.fn();
    const { editor } = createEditor({
      data: {
        nodes: [{ id: "a" }, { id: "b" }],
        edges: [{ id: "a-b", source: "a", target: "b" }],
      },
      onChange,
    });
    const graph = editor.getGraph();

    editor.selectNode("a");
    expect(editor.getSelectedNode()).toBe(graph.getNodeById("a"));

    editor.addTarget("a", { id: "new-child" });
    expect(graph.getNodeById("new-child").sources).toContain("a");

    editor.updateNode("new-child", { fillStyle: "#f00" });
    expect(graph.getNodeById("new-child").get("fillStyle")).toBe("#f00");

    const undoData = editor.undo();
    expect(undoData).toBeDefined();
    expect(graph.getNodeById("new-child").get("fillStyle")).not.toBe("#f00");

    const redoData = editor.redo();
    expect(redoData).toBeDefined();
    expect(graph.getNodeById("new-child").get("fillStyle")).toBe("#f00");
    expect(onChange).toHaveBeenCalled();

    editor.destroy();
  });

  it("should collapse, expand and remove downstream nodes", () => {
    const { editor } = createEditor({
      data: {
        nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
        edges: [
          { id: "a-b", source: "a", target: "b" },
          { id: "b-c", source: "b", target: "c" },
        ],
      },
    });
    const graph = editor.getGraph();
    jest.spyOn(editor, "reLayout").mockImplementation(() => undefined);

    editor.collapseNode("a");
    expect(graph.getNodeById("a").get("collapsed")).toBe(true);
    expect(graph.getNodeById("b").isVisible()).toBe(false);
    expect(graph.getNodeById("c").isVisible()).toBe(false);

    editor.expandNode("a");
    expect(graph.getNodeById("a").get("collapsed")).toBe(false);
    expect(graph.getNodeById("b").isVisible()).toBe(true);
    expect(graph.getNodeById("c").isVisible()).toBe(true);

    editor.removeNode("b", true);
    expect(graph.getNodeById("b")).toBeUndefined();
    expect(graph.getNodeById("c")).toBeUndefined();

    editor.destroy();
  });

  it("should handle source, sibling and tree move workflows with undo and redo", () => {
    const { editor } = createEditor({
      data: {
        nodes: [{ id: "root" }, { id: "a" }, { id: "b" }, { id: "c" }],
        edges: [
          { id: "root-a", source: "root", target: "a" },
          { id: "a-b", source: "a", target: "b" },
          { id: "root-c", source: "root", target: "c" },
        ],
      },
    });
    const graph = editor.getGraph();

    editor.addSource("b", { id: "new-source" });
    expect(graph.getNodeById("new-source").targets).toContain("b");

    editor.addSiblingBefore("c", { id: "before-c" });
    editor.addSiblingAfter("c", { id: "after-c" });
    expect(graph.getNodeById("root").targets).toEqual(
      expect.arrayContaining(["before-c", "c", "after-c"])
    );

    editor.moveTreeNode("b", "c", 0);
    expect(graph.getNodeById("b").sources).toEqual(["c"]);
    expect(graph.getNodeById("c").targets[0]).toBe("b");

    const undoData = editor.undo();
    expect(undoData).toEqual(
      expect.objectContaining({ name: "movePipelineTreeNode" })
    );
    expect(graph.getNodeById("b").sources).toEqual(["new-source"]);

    const redoData = editor.redo();
    expect(redoData).toEqual(
      expect.objectContaining({ name: "movePipelineTreeNode" })
    );
    expect(graph.getNodeById("b").sources).toEqual(["c"]);

    editor.destroy();
  });

  it("should select by click, invoke mask lifecycle and resize the editor", () => {
    const onClickNode = jest.fn();
    const onVisibleChange = jest.fn();
    const { editor } = createEditor({
      data: {
        nodes: [{ id: "a" }, { id: "b" }],
        edges: [{ id: "a-b", source: "a", target: "b" }],
      },
      onClickNode,
      mask: {
        enable: true,
        onVisibleChange,
      },
    });
    const graph = editor.getGraph();
    const node = graph.getNodeById("a");
    const mask = graph.get("mask");

    graph.emit("node:click", {
      target: node,
      nativeEvent: {},
    });

    expect(editor.getSelectedNode()).toBe(node);
    expect(onClickNode).toHaveBeenCalledWith(node, expect.any(Object));
    expect(mask.visible).toBe(true);
    expect(onVisibleChange).toHaveBeenCalledWith(true);

    mask.emit("click", { target: mask });

    expect(mask.visible).toBe(false);
    expect(graph.get("_selections")).toEqual({ node: [], edge: [], group: [] });
    expect(onVisibleChange).toHaveBeenCalledWith(false);

    editor.changeSize(320, 240);
    expect(graph.get("width")).toBe(320);
    expect(graph.get("height")).toBe(240);
    expect(mask.get("width")).toBe(320);
    expect(mask.get("height")).toBe(240);

    editor.destroy();
  });
});
