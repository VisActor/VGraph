import {
  Graph,
  brushSelect,
  dragCanvas,
  dragNode,
  panZoom,
  showDetails,
  dragEdge,
  highlightRelations,
  multipleSelect,
} from "../../src";

function createWheelEvent(
  canvas: HTMLCanvasElement,
  delta: number,
  x: number,
  y: number
) {
  const bbox = canvas.getBoundingClientRect();
  const e: any = new MouseEvent("wheel", {
    clientX: bbox.left + x,
    clientY: bbox.top + y,
  });
  e.wheelDelta = delta;
  e.deltaX = 0;
  e.wheelDeltaY = -240;
  e.deltaY = 2;
  return e;
}

describe("src/behaviors", () => {
  const div = document.createElement("div");
  div.setAttribute("width", "800px");
  div.setAttribute("height", "600px");
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultEdge(data: any) {
      if (data.data === "a") {
        return { strokeStyle: "blue" };
      }
      return { strokeStyle: "red" };
    },
    setNodeStateStyles(state: string) {
      return { strokeStyle: "green" };
    },
    setEdgeStateStyles(state: string, data: any) {
      if (state === "a") {
        return { strokeStyle: "#eee" };
      }
      return { strokeStyle: "#ccc" };
    },
  });

  const node1 = graph.add("node", {
    type: "rect",
    id: "node1",
    x: 100,
    y: 100,
    width: 60,
    height: 30,
  });

  const node2 = graph.add("node", {
    type: "rect",
    id: "node2",
    x: 180,
    y: 230,
    width: 10,
    height: 10,
  });

  const edge = graph.add("edge", {
    source: "node1",
    target: "node2",
    data: "a",
  });

  it("drag canvas should work", () => {
    graph.addBehavior(dragCanvas, {
      shouldTrigger() {
        return false;
      },
    });
    const matrix = graph.getMatrix();
    expect(matrix[4]).toBe(0);
    expect(matrix[5]).toBe(0);

    graph.emit("canvas:mousedown", {
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      clientX: 5,
      clientY: 5,
    });
    expect(graph.getMatrix()[4]).toBe(0);
    expect(graph.getMatrix()[5]).toBe(0);

    graph.removeBehavior(dragCanvas);

    graph.addBehavior(dragCanvas, {
      shouldTrigger() {
        return true;
      },
    });
    graph.emit("canvas:mousedown", {
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      clientX: 5,
      clientY: 5,
    });
    expect(graph.getMatrix()[4]).toBe(5);
    expect(graph.getMatrix()[5]).toBe(5);

    graph.removeBehavior(dragCanvas);
    graph.emit("canvas:mousedown", {
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      clientX: 10,
      clientY: 10,
    });
    expect(graph.getMatrix()[4]).toBe(5);
    expect(graph.getMatrix()[5]).toBe(5);
  });

  it("pan & zoom should work", () => {
    graph.addBehavior(panZoom);
    const canvas = graph.getCanvasDom();

    let wheelEvent = createWheelEvent(canvas, -0.2, 0, 0);
    canvas.dispatchEvent(wheelEvent);
    expect(graph.getMatrix()[0]).toBe(0.98);
    wheelEvent = createWheelEvent(canvas, 0.2, 0, 0);
    canvas.dispatchEvent(wheelEvent);
    expect(graph.getMatrix()[0]).toBe(0.9996);
    canvas.dispatchEvent(wheelEvent);
    expect(graph.getMatrix()[0]).toBe(1.019592);
    graph.removeBehavior(panZoom);

    graph.addBehavior(panZoom, { sensitivity: 5 });
    canvas.dispatchEvent(wheelEvent);
    expect(graph.getMatrix()[0]).toBe(1.0705716);
    canvas.dispatchEvent(wheelEvent);
    expect(graph.getMatrix()[0]).toBe(1.1241001800000001);

    graph.removeBehavior(panZoom);
  });

  it("dragNode with delegate should work", () => {
    graph.resetMatrix();

    graph.addBehavior(dragNode, {
      shouldTrigger() {
        return false;
      },
    });

    graph.emit("node:mousedown", {
      target: node1,
      clientX: 0,
      clientY: 0,
    });
    graph.emit("node:mousemove", {
      target: node1,
      clientX: 5,
      clientY: 5,
    });
    expect(dragNode.dragging).toBe(false);
    expect(dragNode.shape).toBe(undefined);
    graph.removeBehavior(dragNode);

    graph.addBehavior(dragNode, {
      shouldTrigger() {
        return true;
      },
    });
    graph.emit("node:mousedown", {
      target: node1,
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: node1,
      clientX: 5,
      clientY: 5,
    });
    expect(graph.getBehavior("dragNode")!.dragging).toBe(true);
    expect(graph.getBehavior("dragNode")!.shape);
    const shape = graph.getBehavior("dragNode")!.shape;
    if (shape) {
      expect(shape.get("left")).toBe(70);
      expect(shape.get("top")).toBe(85);
      expect(shape.get("width")).toBe(60);
      expect(shape.get("height")).toBe(30);
      expect(shape.getMatrix()).toEqual([1, 0, 0, 1, 5, 5]);
    }
    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });
    if (shape) {
      expect(shape.getMatrix()).toEqual([1, 0, 0, 1, 10, 10]);
    }
    graph.getBehavior("dragNode")!.onMouseUp();
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    graph.removeBehavior(dragNode);
  });

  it("drag without delegate should work", () => {
    const group1 = graph.add("group", {
      id: "group1",
      padding: [12, 12, 12, 12],
    });
    group1.addChild(node1);
    group1.addChild(node2);

    expect(group1.getBBox()).toEqual({
      left: 68,
      top: 83,
      width: 129,
      height: 164,
    });

    graph.addBehavior(dragNode, { delegate: false });
    graph.emit("node:mousedown", {
      target: node1,
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: node1,
      clientX: 5,
      clientY: 5,
    });
    expect(graph.getBehavior("dragNode")!.dragging).toBe(true);
    expect(graph.getBehavior("dragNode")!.shape).toBe(undefined);
    expect(node1.get("x")).toBe(115);
    expect(node1.get("y")).toBe(115);

    expect(group1.getBBox()).toEqual({
      left: 73,
      top: 88,
      width: 124,
      height: 159,
    });

    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });
    expect(graph.getBehavior("dragNode")!.shape).toBe(undefined);
    expect(node1.get("x")).toBe(120);
    expect(node1.get("y")).toBe(120);

    expect(group1.getBBox()).toEqual({
      left: 78,
      top: 93,
      width: 119,
      height: 154,
    });

    graph.getBehavior("dragNode")!.onMouseUp();
    expect(node1.get("x")).toBe(120);
    expect(node1.get("y")).toBe(120);

    node1.updatePosition(112, 112);
    graph.removeBehavior(dragNode);
  });

  it("dragNode with delegate after pan & zoom should work", () => {
    graph.addBehavior(dragNode);
    graph.scale(0.95);
    expect(graph.getMatrix()[0]).toBe(0.95);

    graph.emit("node:mousedown", {
      target: node1,
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: node1,
      clientX: 4.75,
      clientY: 4.75,
    });
    expect(graph.getBehavior("dragNode")!.dragging).toBe(true);
    expect(graph.getBehavior("dragNode")!.shape);
    const shape = graph.getBehavior("dragNode")!.shape;
    if (shape) {
      expect(shape.get("left")).toBe(82);
      expect(shape.get("top")).toBe(97);
      expect(shape.get("width")).toBe(60);
      expect(shape.get("height")).toBe(30);
      expect(shape.getMatrix()).toEqual([1, 0, 0, 1, 5, 5]);
    }
    graph.emit("mousemove", {
      target: node1,
      clientX: 9.5,
      clientY: 9.5,
    });
    if (shape) {
      expect(shape.getMatrix()).toEqual([1, 0, 0, 1, 10, 10]);
    }
    graph.getBehavior("dragNode")!.onMouseUp();
    expect(node1.get("x")).toBe(122);
    expect(node1.get("y")).toBe(122);

    graph.setMatrix([1.14, 0, 0, 1.14, 0, 0]);
    expect(graph.getMatrix()[0]).toBe(1.14);

    graph.emit("node:mousedown", {
      target: node1,
      clientX: 11.4,
      clientY: 11.4,
    });
    graph.emit("mousemove", {
      target: node1,
      clientX: 5.7,
      clientY: 5.7,
    });
    expect(graph.getBehavior("dragNode")!.dragging).toBe(true);
    expect(graph.getBehavior("dragNode")!.shape);
    const shape2 = graph.getBehavior("dragNode")!.shape;
    if (shape2) {
      expect(shape2.get("left")).toBe(92);
      expect(shape2.get("top")).toBe(107);
      expect(shape2.get("width")).toBe(60);
      expect(shape2.get("height")).toBe(30);
      expect(shape2.getMatrix()).toEqual([
        1, 0, 0, 1, -5.000000000000001, -5.000000000000001,
      ]);
    }
    graph.emit("mousemove", {
      target: node1,
      clientX: 0,
      clientY: 0,
    });
    if (shape2) {
      expect(shape2.getMatrix()).toEqual([
        1, 0, 0, 1, -10.000000000000002, -10.000000000000002,
      ]);
    }
    graph.getBehavior("dragNode")!.onMouseUp();
    expect(node1.get("x")).toBe(112);
    expect(node1.get("y")).toBe(112);

    graph.removeBehavior(dragNode);
  });

  it("highlightRelations should work", () => {
    const node3 = graph.add("node", {
      type: "rect",
      id: "node3",
      x: 300,
      y: 300,
      width: 60,
      height: 30,
    });
    graph.addBehavior(highlightRelations);
    graph.emit("node:mouseenter", {
      target: node1,
    });

    node1.setState("test");
    node3.setState("test");

    expect(node1.states.length).toBe(2);
    expect(node1.states).toEqual(["active", "test"]);
    expect(node2.states.length).toBe(1);
    expect(node2.states[0]).toBe("active");
    expect(node3.states.length).toBe(2);
    expect(node3.states).toEqual(["blur", "test"]);

    expect(edge.states.length).toBe(1);
    expect(edge.states[0]).toBe("active");

    graph.emit("node:mouseleave", {
      target: node1,
    });
    expect(node1.states.length).toBe(1);
    expect(node1.states[0]).toBe("test");
    expect(node2.states.length).toBe(0);
    expect(node3.states.length).toBe(1);
    expect(node3.states[0]).toBe("test");
    expect(edge.states.length).toBe(0);
    graph.removeBehavior(highlightRelations);
    node1.removeState("test");
    node3.removeState("test");
  });

  it("bugfix: 多 graph 实例下 behavior 互相影响", () => {
    const graph2 = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultEdge(data: any) {
        if (data.data === "a") {
          return { strokeStyle: "blue" };
        }
        return { strokeStyle: "red" };
      },
      setNodeStateStyles(state: string) {
        return { strokeStyle: "green" };
      },
      setEdgeStateStyles(state: string, data: any) {
        if (state === "a") {
          return { strokeStyle: "#eee" };
        }
        return { strokeStyle: "#ccc" };
      },
    });
    graph.addBehavior(highlightRelations);
    graph2.addBehavior(highlightRelations);

    graph.emit("node:mouseenter", {
      target: node1,
    });

    const node3 = graph.getNodeById("node3");
    expect(node1.states.length).toBe(1);
    expect(node1.states[0]).toBe("active");
    expect(node2.states.length).toBe(1);
    expect(node2.states[0]).toBe("active");
    expect(node3.states.length).toBe(1);
    expect(node3.states[0]).toBe("blur");
  });

  it("showDetails should work", () => {
    const graph2 = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode(node: any) {
        return {
          label: node.id,
          width: 140,
          height: 40,
        };
      },
      setDefaultEdge(data: any) {
        return {
          label: {
            text: `${data.source}-${data.target}`,
            opacity: 0,
          },
        };
      },
      setNodeStateStyles() {
        return { fillStyle: "#ccc" };
      },
      setEdgeStateStyles() {
        return { fillStyle: "#ccc" };
      },
    });
    graph2.addBehavior(showDetails, {
      targets: ["node", "edge"],
      showNodeState: "showLabel",
      showEdgeState: "showEdgeLabel",
    });
    graph2.data({
      nodes: [{ id: "1" }, { id: "2" }],
      edges: [{ id: "12", source: "1", target: "2" }],
    });
    graph2.scale(1.6);
    const n1 = graph2.getNodeById("1");
    const n2 = graph2.getNodeById("2");
    const e1 = graph2.getEdgeById("12");
    expect(n1.getLabel().visible).toBe(true);
    expect(n1.getLabel().get("fontSize")).toBe(6);
    expect(n1.states[0]).toBe("showLabel");
    expect(n2.getLabel().visible).toBe(true);
    expect(n2.getLabel().get("fontSize")).toBe(6);
    expect(n2.states[0]).toBe("showLabel");
    expect(e1.getLabel().visible).toBe(true);
    expect(e1.getLabel().get("fontSize")).toBe(6);
    expect(e1.states[0]).toBe("showEdgeLabel");

    graph2.scale(1.1);
    expect(n1.getLabel().visible).toBe(true);
    expect(n1.getLabel().get("fontSize")).toBe(6);
    expect(n1.states[0]).toBe("showLabel");
    expect(n2.getLabel().visible).toBe(true);
    expect(n2.getLabel().get("fontSize")).toBe(6);
    expect(n2.states[0]).toBe("showLabel");
    expect(e1.getLabel().visible).toBe(true);
    expect(e1.getLabel().get("fontSize")).toBe(6);
    expect(e1.states[0]).toBe("showEdgeLabel");

    graph2.setZoomRatio(0.8);
    expect(n1.getLabel().visible).toBe(false);
    expect(n1.getLabel().get("fontSize")).toBe(12);
    expect(n1.states.length).toBe(0);
    expect(n2.getLabel().visible).toBe(false);
    expect(n2.getLabel().get("fontSize")).toBe(12);
    expect(n2.states.length).toBe(0);
    expect(e1.getLabel().visible).toBe(false);
    expect(e1.getLabel().get("fontSize")).toBe(12);
    expect(e1.states.length).toBe(0);
  });

  it("brush select should work", () => {
    const selected: any = [];
    const fn = jest.fn();
    const select = function (node: any) {
      fn();
      selected.push(node);
    };
    graph.addBehavior(brushSelect, {
      onSelect: select,
    });
    graph.resetMatrix();
    graph.emit("canvas:mousedown", {
      nativeEvent: { metaKey: true },
      clientX: 80,
      clientY: 82,
    });
    graph.emit("mousemove", {
      clientX: 90,
      clientY: 85,
    });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(selected.length).toBe(3);
    expect(selected.map((node: any) => node.get("id"))).toEqual([
      "node1",
      "node2",
      "node3", // node1 node2 在 group 里
    ]);

    selected.splice(0, selected.length);
    graph.emit("canvas:mousedown", {
      clientX: 80,
      clientY: 82,
    });
    graph.emit("mousemove", {
      clientX: 90,
      clientY: 85,
    });
    expect(fn).toHaveBeenCalledTimes(3 + 1);
    expect(selected.length).toBe(1);
    expect(selected.map((node: any) => node.get("id"))).toEqual(["node3"]);
  });

  it("dragEdge should work", () => {
    graph.addBehavior(dragEdge);
    graph.clear();
    graph.resetMatrix();
    const node1 = graph.add("node", {
      type: "rect",
      id: "node1",
      x: 100,
      y: 100,
      width: 60,
      height: 40,
      anchors: [
        {
          show: "always",
          position: [0.5, 0],
          setStyles() {
            return {
              fillStyle: "#F3F9FF",
            };
          },
        },
        {
          show: "hover",
          position: [0.5, 1],
          setStyles() {
            return {
              fillStyle: "#F3F9FF",
            };
          },
        },
      ],
    });

    const anchors = node1.layer.get("__anchors");
    expect(node1.get("anchors")[0].index).toBe(0);
    expect(node1.get("anchors")[1].index).toBe(1);

    const node2 = graph.add("node", {
      type: "rect",
      id: "node2",
      x: 180,
      y: 180,
      width: 60,
      height: 40,
      anchors: [
        {
          show: "always",
          position: [0.5, 0],
          setStyles() {
            return {
              fillStyle: "#F3F9FF",
            };
          },
        },
        {
          show: "hover",
          position: [0.5, 1],
          setStyles() {
            return {
              fillStyle: "#F3F9FF",
            };
          },
        },
      ],
    });

    graph.emit("node:mousedown", {
      clientX: 100,
      clientY: 100,
      target: node1,
      relatedTarget: anchors[1],
      nativeEvent: { button: 1 },
    });

    graph.emit("mousemove", {
      clientX: 120,
      clientY: 120,
    });
    expect(node1.get("anchors")[0].visible).toBe(true);
    expect(node1.get("anchors")[1].visible).toBe(true);
    expect(graph.getEdges().length).toBe(1);
    expect(graph.getEdges()[0].configs.source).toBe("node1");
    expect(graph.getEdges()[0].configs.sourceAnchor).toBe(1);
    // div.getBoundingClientReact width 和 height 都为0，endPoint 无法正确计算
    // expect(graph.getEdges()[0].configs.endPoint).toEqual([120, 120]);

    graph.emit("node:mouseenter", {
      clientX: 180,
      clientY: 140,
      target: node2,
    });

    graph.getBehavior("dragEdge")!.onMouseUp();

    expect(graph.getEdges().length).toBe(1);
    expect(graph.getEdges()[0].configs.source).toBe("node1");
    expect(graph.getEdges()[0].configs.sourceAnchor).toBe(1);
    expect(graph.getEdges()[0].configs.target).toBe("node2");
    expect(node1.get("anchors")[0].visible).toBe(true);
    expect(node1.get("anchors")[1].visible).toBe(false);

    graph.removeBehavior("dragEdge");
    graph.remove(graph.getEdges()[0]);
  });

  it("multipleSelect should work", () => {
    graph.addBehavior(multipleSelect);
    graph.clear();
    const behavior = graph.getBehavior("multipleSelect") as any;
    const node1 = graph.add("node", {
      type: "rect",
      id: "node1",
      x: 100,
      y: 100,
      width: 60,
      height: 30,
    });

    const node2 = graph.add("node", {
      type: "rect",
      id: "node2",
      x: 180,
      y: 230,
      width: 10,
      height: 10,
    });

    const edge = graph.add("edge", {
      source: "node1",
      target: "node2",
      data: "a",
    });

    graph.emit("node:click", {
      target: node1,
      nativeEvent: {},
    });
    expect(behavior.selections).toEqual([node1]);

    graph.emit("node:click", {
      target: node2,
      nativeEvent: {},
    });
    expect(behavior.selections).toEqual([node2]);

    graph.emit("edge:click", {
      target: edge,
      nativeEvent: {},
    });
    expect(behavior.selections).toEqual([edge]);

    graph.emit("node:click", {
      target: node1,
      nativeEvent: { metaKey: true },
    });
    expect(behavior.selections).toEqual([edge, node1]);
    graph.emit("edge:click", {
      target: edge,
      nativeEvent: { metaKey: true },
    });
    expect(behavior.selections).toEqual([node1]);
    graph.emit("node:click", {
      target: node2,
      nativeEvent: { metaKey: true },
    });
    expect(behavior.selections).toEqual([node1, node2]);
    graph.emit("canvas:click");
    expect(behavior.selections).toEqual([]);
  });
});
