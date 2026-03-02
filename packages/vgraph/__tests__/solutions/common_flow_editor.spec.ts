import { Graph } from "../../src/graph";
import { CommonFlowEditor } from "../../src";

// mock for jest
const originalClipboard = { ...navigator.clipboard };
class MockDataTransfer {
  constructor() {
    this.items = new Map();
  }
  items: Map<string, string>;
  setData(type: string, value: string) {
    this.items.set(type, value);
  }
  getData(type: string) {
    return this.items.get(type);
  }
}
class MockClipboardEvent {
  clipboardData: MockDataTransfer;
  constructor(type: string, eventInitDict?: EventInit) {
    this.clipboardData = new MockDataTransfer();
  }
  preventDefault() {
    return;
  }
}
beforeEach(() => {
  let clipboardData = "";
  const mockClipboard = {
    writeText: (data: string) => {
      clipboardData = data;
      return new Promise((resolve) => {
        resolve(1);
      });
    },
    readText: () => {
      return new Promise((resolve) => {
        resolve(clipboardData);
      });
    },
  };
  // @ts-ignore
  navigator.clipboard = mockClipboard;
  // @ts-ignore
  global.ClipboardEvent = MockClipboardEvent;
  // @ts-ignore
  global.DataTransfer = MockClipboardEvent;
});

afterEach(() => {
  jest.resetAllMocks();
  // @ts-ignore
  navigator.clipboard = originalClipboard;
});

describe("src/solutions/common_flow_editor", () => {
  const div = document.createElement("div");
  const width = 800;
  const height = 600;
  global.HTMLElement.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    toJSON: () => {},
  });

  it("CommonFlowEditor node and edge API should work", () => {
    const editor = new CommonFlowEditor({
      container: div,
      graphSize: [800, 600],
      data: {
        nodes: [{ id: "node1" }, { id: "node2" }],
        edges: [{ id: "edge1", source: "node1", target: "node2" }],
      },
      setDefaultNode: (nodeData: any) => {
        return {
          type: "rect",
          width: 100,
          height: 30,
        };
      },
    });

    expect(editor).toBeDefined();
    expect(editor.graph).toBeDefined();
    const graph = editor.graph as Graph;
    expect(graph.getNodeById("node1").isVisible()).toBe(true);
    expect(graph.getNodeById("node2").isVisible()).toBe(true);
    expect(graph.getEdgeById("edge1").isVisible()).toBe(true);

    // add node
    editor.addNode({ id: "node3" });
    expect(graph.getNodeById("node3").isVisible()).toBe(true);
    editor.undo();
    expect(graph.getNodeById("node3")).toBeUndefined();
    editor.redo();
    expect(graph.getNodeById("node3").isVisible()).toBe(true);

    // remove node
    editor.removeNode(graph.getNodeById("node1"));
    expect(graph.getNodeById("node1")).toBeUndefined();
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();
    expect(graph.getNodeById("node1").isVisible()).toBe(true);
    expect(graph.getEdgeById("edge1").isVisible()).toBe(true);
    editor.redo();
    expect(graph.getNodeById("node1")).toBeUndefined();
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();

    // update node
    editor.updateNode(graph.getNodeById("node1"), {
      id: "node1",
      x: 100,
      y: 100,
    });
    expect(graph.getNodeById("node1").configs.x).toBe(100);
    expect(graph.getNodeById("node1").configs.y).toBe(100);
    editor.undo();
    expect(graph.getNodeById("node1").configs.x).toBe(0);
    expect(graph.getNodeById("node1").configs.y).toBe(0);
    editor.redo();
    expect(graph.getNodeById("node1").configs.x).toBe(100);
    expect(graph.getNodeById("node1").configs.y).toBe(100);
    editor.undo();

    // add edge
    editor.addEdge({ id: "edge2", source: "node1", target: "node3" });
    expect(graph.getEdgeById("edge2").isVisible()).toBe(true);
    editor.undo();
    expect(graph.getEdgeById("edge2")).toBeUndefined();
    editor.redo();
    expect(graph.getEdgeById("edge2").isVisible()).toBe(true);

    // remove edge
    editor.removeEdge(graph.getEdgeById("edge1"));
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();
    expect(graph.getEdgeById("edge1").isVisible()).toBe(true);
    editor.redo();
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();

    // update edge
    editor.updateEdge(graph.getEdgeById("edge2"), {
      source: "node1",
      target: "node2",
    });
    expect(graph.getEdgeById("edge2").target).toBe(graph.getNodeById("node2"));
    editor.undo();
    expect(graph.getEdgeById("edge2").target).toBe(graph.getNodeById("node3"));
    editor.redo();
    expect(graph.getEdgeById("edge2").target).toBe(graph.getNodeById("node2"));
    editor.undo();

    expect(editor.destroyed).toBe(false);
    editor.destroy();
    expect(editor.graph.entityMap).toEqual({ node: {}, edge: {}, group: {} });
    expect(editor.destroyed).toBe(true);
  });

  it("CommonFlowEditor Copy Cut Paste API should work.", (done) => {
    const editor = new CommonFlowEditor({
      container: div,
      graphSize: [800, 600],
      data: {
        nodes: [{ id: "node1" }, { id: "node2" }],
        edges: [{ id: "edge1", source: "node1", target: "node2" }],
      },
      setDefaultNode: (nodeData: any) => {
        return {
          type: "rect",
          width: 100,
          height: 30,
        };
      },
    });
    expect(editor).toBeDefined();
    expect(editor.graph).toBeDefined();
    const graph = editor.graph as Graph;
    expect(graph.getNodeById("node1").isVisible()).toBe(true);
    expect(graph.getNodeById("node2").isVisible()).toBe(true);
    expect(graph.getEdgeById("edge1").isVisible()).toBe(true);
    editor.addNode({ id: "node3" });
    expect(graph.getNodeById("node3").isVisible()).toBe(true);
    editor.undo();
    expect(graph.getNodeById("node3")).toBeUndefined();
    editor.redo();
    expect(graph.getNodeById("node3").isVisible()).toBe(true);
    editor.selectNode(graph.getNodeById("node1"));
    editor.copy().then(
      () => {
        editor.paste().then(
          () => {
            expect(graph.getNodes().length).toBe(4);
            editor.undo();
            expect(graph.getNodes().length).toBe(3);
            editor.redo();
            expect(graph.getNodes().length).toBe(4);
            editor.selectNode(graph.getNodeById("node1"));
            editor.cut().then(() => {
              expect(graph.getNodes().length).toBe(3);
              expect(graph.getEdgeById("edge1")).toBeUndefined();
              editor.undo();
              expect(graph.getNodes().length).toBe(4);
              expect(graph.getEdgeById("edge1").isVisible()).toBe(true);
              editor.redo();
              expect(graph.getNodes().length).toBe(3);
              expect(graph.getEdgeById("edge1")).toBeUndefined();
              editor.paste().then(
                () => {
                  expect(graph.getNodes().length).toBe(4);
                  expect(graph.getEdgeById("edge1")).toBeUndefined();
                  editor.undo();
                  expect(graph.getNodes().length).toBe(3);
                  editor.redo();
                  expect(graph.getNodes().length).toBe(4);
                  done();
                },
                () => {}
              );
            });
          },
          (err) => {
            console.log("error", err);
          }
        );
      },
      (err) => {
        console.log("error", err);
      }
    );
  });

  it("CommonFlowEditor config options should work", () => {
    let triggerShape: any = null;
    const editor = new CommonFlowEditor({
      container: div,
      graphSize: [800, 600],
      data: {
        nodes: [
          { id: "node1", x: 0, y: 0 },
          { id: "node2", x: 200, y: 0 },
        ],
        edges: [{ id: "edge1", source: "node1", target: "node2" }],
      },
      setDefaultNode(node: any) {
        return {
          type: "title",
          radius: 4,
          width: 150,
          height: 60,
          label: node.name || node.id,
          title: {
            text: node.taskType || "任务名称",
            backgroundColor: "#3073FF",
            height: 30,
            fillStyle: "#FFF",
          },
          anchors: [
            {
              show: "always",
              position: [0.5, 0],
              setStyles() {
                return {
                  fillStyle: "#F3F9FF",
                  strokeStyle: "#3073F2",
                  cursor: "crosshair",
                };
              },
            },
            {
              show: "always",
              position: [0.5, 1],
              setStyles() {
                return {
                  fillStyle: "#F3F9FF",
                  strokeStyle: "#3073F2",
                  cursor: "crosshair",
                };
              },
            },
          ],
        };
      },
      setNodeStateStyles(state: string) {
        if (state === "select") {
          return { strokeStyle: "#F50" };
        }
        return {};
      },
      setDefaultEdge() {
        return {
          type: "vLine",
          endArrow: true,
          hitWidth: 6,
        };
      },
      setEdgeStateStyles(state: string) {
        if (state === "select") {
          return { strokeStyle: "#F50" };
        }
        return {};
      },
      scroller: {
        enable: false,
      },
      nodeMover: {
        options: {
          shouldDrop(e, target) {
            // 示例：禁止节点重叠
            const nodes = target?.graph.getNodes();
            const w1 = target?.configs.width ?? 0;
            const h1 = target?.configs.height ?? 0;
            const x1 = target?.configs.x ?? 0;
            const y1 = target?.configs.y ?? 0;
            for (const node of nodes) {
              if (node === target) {
                continue;
              }
              const { x, y, width, height } = node.configs;
              const lx = Math.abs(x - x1) - 0.5 * (w1 + width);
              const ly = Math.abs(y - y1) - 0.5 * (h1 + height);
              if (lx < 0 && ly < 0) {
                return false;
              }
            }
            return true;
          },
        },
      },
      gridStep: 20,
      edgeEditor: {
        enable: true,
        options: {
          shouldTrigger(e, shape, target, edge) {
            if (!shape) {
              return false;
            }
            triggerShape = shape;
            triggerShape.set("edge", edge);
            return shape?.get("_anchor");
          },
          showAnchors(anchorConfigs, anchorShape, node) {
            if (triggerShape.get("_anchor")) {
              const shapeAnchorIndex = triggerShape.get("anchorIndex");
              const notEdit = !triggerShape.get("edge");
              return (anchorConfigs.index !== shapeAnchorIndex) === notEdit;
            } else {
              return false;
            }
          },
          shouldDrop(source, target, sourceAnchor, targetAnchor) {
            return targetAnchor !== sourceAnchor;
          },
        },
      },
    });
    editor.refreshEdgesPath();
    const graph = editor.getGraph() as Graph;
    const node1 = graph.getNodeById("node1");
    // console.log(graph.getEdgeById('edge1').get('controlPoints'));
    expect(graph.getEdgeById("edge1").get("controlPoints")).toEqual([
      [0, -55],
      [200, -55],
    ]);

    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer,
      clientX: 0,
      clientY: 0,
      nativeEvent: { button: 1 },
    });
    graph.emit("mousemove", {
      target: node1,

      clientX: 6,
      clientY: 6,
    });
    expect(node1.configs.x).toBe(0);
    expect(node1.configs.y).toBe(0);
    graph.emit("mousemove", {
      target: node1,
      clientX: 13,
      clientY: 13,
    });
    expect(node1.configs.x).toBe(20);
    expect(node1.configs.y).toBe(20);
    editor.components.nodeMover?.onMouseUp({} as any);
    expect(node1.configs.x).toBe(20);
    expect(node1.configs.y).toBe(20);
    editor.undo();
    expect(node1.configs.x).toBe(0);
    expect(node1.configs.y).toBe(0);

    editor.redo();
    expect(node1.configs.x).toBe(20);
    expect(node1.configs.y).toBe(20);

    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer.get("__anchors")[1],
      clientX: 20,
      clientY: 45,
      nativeEvent: { button: 1 },
    });

    graph.emit("mousemove", {
      relatedTarget: graph.getContainer(),
      clientX: 200,
      clientY: -35,
    });

    editor.components.edgeEditor?.onMouseUp({} as any);
    expect(graph.getEdges().length).toBe(2);
    editor.undo();
    expect(graph.getEdges().length).toBe(1);
    editor.redo();
    expect(graph.getEdges().length).toBe(2);

    const formerData = editor.getSnapshot();
    node1.set("x", 500);
    graph.add("edge", { source: "node1", target: "node2" });
    expect(graph.getEdges().length).toBe(3);
    const currentData = editor.getSnapshot();
    editor.batchChange({ formerData, currentData });
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById("node1").configs.x).toBe(500);
    editor.undo();
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getNodeById("node1").configs.x).toBe(20);
    editor.redo();
    expect(graph.getEdges().length).toBe(3);

    editor.changeSize(600, 400);
    expect(graph.get("width")).toBe(600);
    expect(graph.get("height")).toBe(400);

    editor.clear();
    expect(graph.getNodes().length).toBe(0);
    expect(graph.getEdges().length).toBe(0);

    editor.undo();
    expect(graph.getNodes().length).toBe(2);
    expect(graph.getEdges().length).toBe(3);
    expect(graph.getNodeById("node1").configs.x).toBe(500);

    editor.redo();
    expect(graph.getNodes().length).toBe(0);
    expect(graph.getEdges().length).toBe(0);
  });

  it("CommonFlowEditor with readonly should work", () => {
    const editor = new CommonFlowEditor({
      container: div,
      graphSize: [800, 600],
      data: {
        nodes: [{ id: "node1" }, { id: "node2" }],
        edges: [{ id: "edge1", source: "node1", target: "node2" }],
      },
      setDefaultNode: (nodeData: any) => {
        return {
          type: "rect",
          width: 100,
          height: 30,
        };
      },
      mode: "read",
    });

    const commands = editor.getCommands();
    commands["select"].mode = ["edit", "read", "read-lax"];
    commands["copy"].mode = ["edit", "read", "read-lax"];
    commands["moveNode"].mode = ["edit", "read-lax"];
    commands["batch"].mode = ["edit", "read-lax"];

    expect(editor).toBeDefined();
    expect(editor.graph).toBeDefined();
    const graph = editor.graph as Graph;
    expect(graph.getNodeById("node1").isVisible()).toBe(true);
    expect(graph.getNodeById("node2").isVisible()).toBe(true);
    expect(graph.getEdgeById("edge1").isVisible()).toBe(true);

    // add node
    let status = editor.addNode({ id: "node3" });
    expect(status).toBe(false);
    expect(graph.getNodeById("node3")).toBeUndefined();
    status = editor.undo() as boolean;
    expect(status).toBe(false);
    status = editor.redo() as boolean;
    expect(status).toBe(false);
    status = editor.addEdge({ id: "edge2", source: "node1", target: "node2" });
    expect(status).toBe(false);
    expect(graph.getEdgeById("edge2")).toBeUndefined();
    status = editor.undo() as boolean;
    expect(status).toBe(false);
    status = editor.redo() as boolean;
    expect(status).toBe(false);

    const node1 = graph.getNodeById("node1");
    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer,
      clientX: 0,
      clientY: 0,
      nativeEvent: { button: 1 },
    });
    graph.emit("mousemove", {
      target: node1,
      clientX: 6,
      clientY: 6,
    });
    expect(node1.configs.x).toBe(0);
    expect(node1.configs.y).toBe(0);
    graph.emit("mousemove", {
      target: node1,
      clientX: 13,
      clientY: 13,
    });
    expect(node1.configs.x).toBe(0);
    expect(node1.configs.y).toBe(0);
    editor.components.nodeMover?.onMouseUp({} as any);
    // not move
    expect(node1.configs.x).toBe(0);
    expect(node1.configs.y).toBe(0);

    editor.changeMode("read-lax");
    editor.components.nodeMover?.enable();
    editor.components.edgeEditor?.disable();

    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer,
      clientX: 0,
      clientY: 0,
      nativeEvent: { button: 1 },
    });
    graph.emit("mousemove", {
      target: node1,

      clientX: 6,
      clientY: 6,
    });
    expect(node1.configs.x).toBe(10);
    expect(node1.configs.y).toBe(10);
    graph.emit("mousemove", {
      target: node1,
      clientX: 13,
      clientY: 13,
    });
    expect(node1.configs.x).toBe(10);
    expect(node1.configs.y).toBe(10);
    editor.components.nodeMover?.onMouseUp({} as any);
    expect(node1.configs.x).toBe(10);
    expect(node1.configs.y).toBe(10);
    editor.undo();
    expect(node1.configs.x).toBe(0);
    expect(node1.configs.y).toBe(0);

    editor.redo();
    expect(node1.configs.x).toBe(10);
    expect(node1.configs.y).toBe(10);
    editor.undo();

    status = editor.addNode({ id: "node3" });
    expect(status).toBe(false);
    expect(graph.getNodeById("node3")).toBeUndefined();
    status = editor.addEdge({ id: "edge2", source: "node1", target: "node2" });
    expect(status).toBe(false);
    expect(graph.getEdgeById("edge2")).toBeUndefined();

    editor.changeMode("edit");

    // add node
    editor.addNode({ id: "node3" });
    expect(graph.getNodeById("node3").isVisible()).toBe(true);
    editor.undo();
    expect(graph.getNodeById("node3")).toBeUndefined();
    editor.redo();
    expect(graph.getNodeById("node3").isVisible()).toBe(true);

    // remove node
    editor.removeNode(graph.getNodeById("node1"));
    expect(graph.getNodeById("node1")).toBeUndefined();
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();
    expect(graph.getNodeById("node1").isVisible()).toBe(true);
    expect(graph.getEdgeById("edge1").isVisible()).toBe(true);
    editor.redo();
    expect(graph.getNodeById("node1")).toBeUndefined();
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();

    // update node
    editor.updateNode(graph.getNodeById("node1"), {
      id: "node1",
      x: 100,
      y: 100,
    });
    expect(graph.getNodeById("node1").configs.x).toBe(100);
    expect(graph.getNodeById("node1").configs.y).toBe(100);
    editor.undo();
    expect(graph.getNodeById("node1").configs.x).toBe(0);
    expect(graph.getNodeById("node1").configs.y).toBe(0);
    editor.redo();
    expect(graph.getNodeById("node1").configs.x).toBe(100);
    expect(graph.getNodeById("node1").configs.y).toBe(100);
    editor.undo();

    // add edge
    editor.addEdge({ id: "edge2", source: "node1", target: "node3" });
    expect(graph.getEdgeById("edge2").isVisible()).toBe(true);
    editor.undo();
    expect(graph.getEdgeById("edge2")).toBeUndefined();
    editor.redo();
    expect(graph.getEdgeById("edge2").isVisible()).toBe(true);

    // remove edge
    editor.removeEdge(graph.getEdgeById("edge1"));
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();
    expect(graph.getEdgeById("edge1").isVisible()).toBe(true);
    editor.redo();
    expect(graph.getEdgeById("edge1")).toBeUndefined();
    editor.undo();

    // update edge
    editor.updateEdge(graph.getEdgeById("edge2"), {
      source: "node1",
      target: "node2",
    });
    expect(graph.getEdgeById("edge2").target).toBe(graph.getNodeById("node2"));
    editor.undo();
    expect(graph.getEdgeById("edge2").target).toBe(graph.getNodeById("node3"));
    editor.redo();
    expect(graph.getEdgeById("edge2").target).toBe(graph.getNodeById("node2"));
    editor.undo();
  });
});
