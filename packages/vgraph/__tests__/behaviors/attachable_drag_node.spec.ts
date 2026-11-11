import { Graph, attachableDragNode } from "../../src";

function createGraph() {
  const div = document.createElement("div");
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    setDefaultNode() {
      return {
        width: 60,
        height: 30,
      };
    },
  });

  graph.data({
    nodes: [
      { id: "parent", x: 100, y: 100 },
      { id: "child", x: 200, y: 100 },
      { id: "candidate", x: 260, y: 100 },
    ],
    edges: [{ id: "parent-child", source: "parent", target: "child" }],
  });

  return graph;
}

describe("src/behaviors/attachable_drag_node.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should expose mouse and global events", () => {
    expect(attachableDragNode.getEvents()).toEqual({
      "node:mousedown": "onMouseDown",
      "node:mouseenter": "onMouseEnter",
      "node:mouseleave": "onMouseLeave",
      mousemove: "onMouseMove",
    });
    expect(attachableDragNode.getGlobalEvents()).toEqual({
      mouseup: "onMouseUp",
    });
  });

  it("should ignore mouse movement when trigger guard returns false", () => {
    const graph = createGraph();
    const child = graph.getNodeById("child");

    graph.addBehavior(attachableDragNode, {
      autoTranslate: false,
      shouldTrigger: jest.fn(() => false),
    });

    graph.emit("node:mousedown", {
      target: child,
      relatedTarget: child.getKeyShape(),
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: child,
      clientX: 10,
      clientY: 10,
    });

    const behavior = graph.getBehavior("attachableDragNode")!;
    expect(behavior.dragging).toBe(false);
    expect(behavior.lastPositions).toBeNull();

    graph.removeBehavior(attachableDragNode);
    graph.destroy();
  });

  it("should drag with delegate and attach to the closest parent", () => {
    const graph = createGraph();
    const child = graph.getNodeById("child");
    const candidate = graph.getNodeById("candidate");
    const onDrop = jest.fn();
    const onDrag = jest.fn();
    const onAttachNode = jest.fn((node) => node);

    graph.addBehavior(attachableDragNode, {
      autoTranslate: false,
      delegate: true,
      onDrop,
      onDrag,
      onAttachNode,
      delegateStyles: {
        opacity: 0.4,
      },
    });

    graph.emit("node:mousedown", {
      target: child,
      relatedTarget: child.getKeyShape(),
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: child,
      clientX: 20,
      clientY: 0,
    });

    const behavior = graph.getBehavior("attachableDragNode")!;
    expect(behavior.dragging).toBe(true);
    expect(behavior.shape).toBeDefined();
    expect(behavior.shape.get("opacity")).toBe(0.4);
    expect(onDrag).toHaveBeenCalledWith(child, 20, 0);

    child.updatePosition(250, 100);
    behavior.updateParent();

    expect(onAttachNode).toHaveBeenCalled();
    expect(behavior.parent).toBe(candidate);
    expect(behavior.tempEdge.isVisible()).toBe(true);

    behavior.onMouseUp({
      target: child,
    } as any);

    expect(onDrop).toHaveBeenCalledWith(child, candidate, { target: child });
    expect(behavior.dragging).toBe(false);
    expect(behavior.shape).toBeNull();

    graph.removeBehavior(attachableDragNode);
    graph.destroy();
  });

  it("should drag without delegate, restore position on rejected drop and clear timers", () => {
    const graph = createGraph();
    const child = graph.getNodeById("child");
    const edge = graph.getEdgeById("parent-child");

    graph.addBehavior(attachableDragNode, {
      autoTranslate: false,
      delegate: false,
      shouldDrop: jest.fn(() => false),
    });

    graph.emit("node:mousedown", {
      target: child,
      relatedTarget: child.getKeyShape(),
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: child,
      clientX: 20,
      clientY: 10,
    });

    const behavior = graph.getBehavior("attachableDragNode")!;
    expect(behavior.dragging).toBe(true);
    expect(edge.isVisible()).toBe(false);
    expect(child.get("x")).toBe(220);
    expect(child.get("y")).toBe(110);

    behavior.interval = setInterval(() => undefined, 100);
    behavior.onMouseUp({
      target: child,
    } as any);

    expect(behavior.interval).toBeNull();
    expect(child.get("x")).toBe(200);
    expect(child.get("y")).toBe(100);
    expect(edge.isVisible()).toBe(true);
    expect(behavior.dragging).toBe(false);

    graph.removeBehavior(attachableDragNode);
    graph.destroy();
  });
});
