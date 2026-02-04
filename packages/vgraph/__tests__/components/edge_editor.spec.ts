import {
  AddCommand,
  EdgeEditor,
  SelectCommand,
  Stack,
  UpdateCommand,
} from "../../src";
import { EdgeEditorOptions } from "../../src/components/edge_editor";
import { Graph } from "../../src/graph";
import { Node } from "../../src/models/entities";
// import { MoveNodeCommand, SelectCommand, Stack, Grid, NodeMover, Router } from '../../src/components';
describe("components/edge_editor", () => {
  let graph: Graph;
  let node1: Node;
  let node2: Node;
  let edgeEditorOptions: EdgeEditorOptions;
  beforeEach(() => {
    const div = document.createElement("div");
    div.setAttribute("width", "800px");
    div.setAttribute("height", "600px");
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
    graph = new Graph({
      width: width,
      height: height,
      container: div,
      setDefaultNode(node) {
        return {
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
    });
    node1 = graph.add("node", {
      type: "rect",
      id: "node1",
      x: 100,
      y: 100,
      width: 60,
      height: 30,
    });
    node2 = graph.add("node", {
      type: "rect",
      id: "node2",
      x: 200,
      y: 100,
      width: 60,
      height: 30,
    });
    graph.add("edge", {
      source: "node1",
      target: "node2",
    });
    edgeEditorOptions = {
      editTerminal: false,
      magnet: true,
      magnetAnchorStyles: {
        fillStyle: "#3073F2",
        strokeStyle: "rgba(48, 115, 242, 0.2)",
        lineWidth: 8,
      },
      shouldTrigger(ev: any, triggerShape: any, node: Node) {
        if (!triggerShape) {
          return false;
        }
        if (!triggerShape.get) {
          return triggerShape?.classList.contains("vgraph-react-viewer-anchor");
        }
        const anchorIndex = triggerShape?.get("anchorIndex");
        if (anchorIndex === undefined) {
          return false;
        }
        return true;
      },
    };
  });
  afterEach(() => {
    graph.destroy();
  });
  it("EdgeEditor add edge with stack should work.", () => {
    const stack = new Stack(graph, {
      commands: {
        add: AddCommand,
        update: UpdateCommand,
        select: SelectCommand,
      },
    });
    const edgeEditor = new EdgeEditor(graph, { ...edgeEditorOptions, stack });
    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer.get("__anchors")[0],
      clientX: 100,
      clientY: 85,
      nativeEvent: { button: 1 },
    });
    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#F3F9FF");

    graph.emit("mousemove", {
      relatedTarget: graph.getContainer(),
      clientX: 200,
      clientY: 85,
    });

    // 待吸附锚点高亮
    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#3073F2");

    edgeEditor.onMouseUp({} as any);
    expect(graph.getEdges().length).toBe(2);
    stack.undo();
    expect(graph.getEdges().length).toBe(1);
    stack.redo();
    expect(graph.getEdges().length).toBe(2);
  });

  it("EdgeEditor add edge without stack should work.", () => {
    const edgeEditor = new EdgeEditor(graph, edgeEditorOptions);
    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer.get("__anchors")[0],
      clientX: 100,
      clientY: 85,
      nativeEvent: { button: 1 },
    });

    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#F3F9FF");
    expect(node2.layer.get("__anchors")[0].get("strokeStyle")).toBe("#3073F2");

    graph.emit("mousemove", {
      relatedTarget: graph.getContainer(),
      clientX: 200,
      clientY: 85,
    });

    // 待吸附锚点高亮
    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#3073F2");
    expect(node2.layer.get("__anchors")[0].get("strokeStyle")).toBe(
      "rgba(48, 115, 242, 0.2)"
    );
    expect(node2.layer.get("__anchors")[0].get("lineWidth")).toBe(8);

    edgeEditor.onMouseUp({} as any);

    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#F3F9FF");
    expect(node2.layer.get("__anchors")[0].get("strokeStyle")).toBe("#3073F2");

    expect(graph.getEdges().length).toBe(2);
  });
  it("EdgeEditor update edge should work.", () => {
    const stack = new Stack(graph, {
      commands: {
        add: AddCommand,
        update: UpdateCommand,
        select: SelectCommand,
      },
    });
    const edgeEditor = new EdgeEditor(graph, {
      ...edgeEditorOptions,
      stack,
      editTerminal: true,
    });
    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer.get("__anchors")[0],
      clientX: 100,
      clientY: 85,
      nativeEvent: { button: 1 },
    });
    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#F3F9FF");

    graph.emit("mousemove", {
      relatedTarget: graph.getContainer(),
      clientX: 200,
      clientY: 85,
    });

    // 待吸附锚点高亮
    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#3073F2");

    edgeEditor.onMouseUp({} as any);
    expect(graph.getEdges().length).toBe(2);

    expect(graph.getEdges()[1].configs.sourceAnchor).toBe(0);
    expect(graph.getEdges()[1].configs.targetAnchor).toBe(0);

    // 更新连线失败
    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer.get("__anchors")[0],
      clientX: 100,
      clientY: 85,
      nativeEvent: { button: 1 },
    });

    graph.emit("mousemove", {
      relatedTarget: graph.getContainer(),
      clientX: 150,
      clientY: 85,
    });

    edgeEditor.onMouseUp({} as any);
    expect(graph.getEdges().length).toBe(2);
    expect(graph.getEdges()[0].configs.sourceAnchor).toBeUndefined();
    expect(graph.getEdges()[0].configs.targetAnchor).toBeUndefined();

    expect(graph.getEdges()[1].configs.sourceAnchor).toBe(0);
    expect(graph.getEdges()[1].configs.targetAnchor).toBe(0);

    stack.execute("select", { selections: [] });

    // 新增连线
    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer.get("__anchors")[1],
      clientX: 100,
      clientY: 115,
      nativeEvent: { button: 1 },
    });

    graph.emit("mousemove", {
      relatedTarget: graph.getContainer(),
      clientX: 200,
      clientY: 85,
    });
    edgeEditor.onMouseUp({} as any);

    expect(graph.getEdges().length).toBe(3);
    stack.undo();

    expect(graph.getEdges().length).toBe(2);
    stack.redo();
    expect(graph.getEdges().length).toBe(3);
    stack.undo();

    stack.execute("select", { selections: [graph.getEdges()[1]] });

    // 更新连线成功
    graph.emit("node:mousedown", {
      target: node1,
      relatedTarget: node1.layer.get("__anchors")[0],
      clientX: 100,
      clientY: 85,
      nativeEvent: { button: 1 },
    });

    graph.emit("mousemove", {
      relatedTarget: graph.getContainer(),
      clientX: 100,
      clientY: 115,
    });

    edgeEditor.onMouseUp({} as any);
    expect(graph.getEdges().length).toBe(2);

    expect(graph.getEdges()[1].configs.sourceAnchor).toBe(1);
    expect(graph.getEdges()[1].configs.targetAnchor).toBe(0);

    stack.undo();

    expect(graph.getEdges()[1].configs.sourceAnchor).toBe(0);
    expect(graph.getEdges()[1].configs.targetAnchor).toBe(0);

    stack.redo();
    expect(graph.getEdges()[1].configs.sourceAnchor).toBe(1);
    expect(graph.getEdges()[1].configs.targetAnchor).toBe(0);
  });

  it("editAnchorStyles should work", () => {
    const stack = new Stack(graph, {
      commands: {
        add: AddCommand,
        update: UpdateCommand,
        select: SelectCommand,
      },
    });
    new EdgeEditor(graph, {
      ...edgeEditorOptions,
      stack,
      editTerminal: true,
      editAnchorStyles: {
        fillStyle: "#7073F2",
      },
    });
    stack.execute("select", { selections: [graph.getEdges()[0]] });
    expect(node1.layer.get("__anchors")[0].get("fillStyle")).toBe("#7073F2");
    expect(node2.layer.get("__anchors")[0].get("fillStyle")).toBe("#7073F2");
  });
});
