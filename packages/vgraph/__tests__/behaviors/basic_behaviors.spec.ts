import { Graph, dragCanvas, hideDetails } from "../../src";
import { BehaviorBase } from "../../src/behaviors/base";

function createShape(keyShape: boolean) {
  return {
    get: jest.fn((key: string) => (key === "_keyShape" ? keyShape : undefined)),
    hide: jest.fn(),
    show: jest.fn(),
  };
}

function createGraph() {
  const nodeShape = createShape(false);
  const nodeKeyShape = createShape(true);
  const node = {
    setState: jest.fn(),
    removeState: jest.fn(),
    layer: {
      children: [nodeShape, nodeKeyShape],
    },
  };
  const edge = {
    hide: jest.fn(),
    show: jest.fn(),
  };
  const canvas = {
    emit: jest.fn(),
  };
  const graph = {
    getMatrix: jest.fn(() => [0.1, 0, 0, 0.1, 0, 0]),
    getNodes: jest.fn(() => [node]),
    getEdges: jest.fn(() => [edge]),
    disableAutoDraw: jest.fn(() => true),
    enableAutoDraw: jest.fn(),
    getGraphBBox: jest.fn(() => ({ left: 0, top: 0, width: 100, height: 100 })),
    getCanvas: jest.fn(() => canvas),
    translate: jest.fn(),
    draw: jest.fn(),
    container: {
      capture: true,
    },
  };

  return { graph, canvas, node, nodeShape, nodeKeyShape, edge };
}

function createRealGraph() {
  const div = document.createElement("div");
  document.body.appendChild(div);
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
      { id: "a", x: 100, y: 100 },
      { id: "b", x: 220, y: 120 },
    ],
    edges: [{ id: "a-b", source: "a", target: "b" }],
  });

  return graph;
}

describe("src/behaviors/base.ts", () => {
  it("should bind, unbind and read behavior configs", () => {
    const handler = jest.fn();
    const graph = {
      on: jest.fn(),
      off: jest.fn(),
    };
    const behavior = {
      ...BehaviorBase,
      configs: {
        enabled: true,
      },
      events: {
        click: "onClick",
        missing: "onMissing",
      },
      onClick: handler,
    };

    behavior.bindEvents(behavior.events, graph as any);

    expect(graph.on).toHaveBeenCalledWith("click", expect.any(Function));
    expect(graph.on).not.toHaveBeenCalledWith("missing", expect.any(Function));
    expect(behavior.get("enabled")).toBe(true);

    behavior.destroy(graph as any);
    expect(graph.off).toHaveBeenCalledWith("click", behavior.onClick);
  });
});

describe("src/behaviors/hide_details.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should hide and restore details across scale threshold after behavior binding", () => {
    const graph = createRealGraph();
    const node = graph.getNodeById("a");

    graph.addBehavior(hideDetails, {
      hideRatio: 0.3,
      hideState: "small",
    });

    graph.scale(0.2);

    expect(node.hasState("small")).toBe(true);

    graph.scale(2);

    expect(node.hasState("small")).toBe(false);

    graph.removeBehavior(hideDetails);
    graph.destroy();
  });
});

describe("src/behaviors/drag_canvas.ts", () => {
  it("should expose canvas or global event maps", () => {
    expect(dragCanvas.getGlobalEvents()).toEqual({ mouseup: "onMouseup" });
    expect(dragCanvas.getEvents()).toEqual({
      "canvas:mousedown": "onMousedown",
      "canvas:touchstart": "onMousedown",
      mousemove: "onMousemove",
      touchmove: "onMousemove",
      mouseup: "onMouseup",
      touchend: "onMouseup",
    });

    expect(
      {
        ...dragCanvas,
        canvasOnly: false,
      }.getEvents()
    ).toEqual({
      mousedown: "onMousedown",
      touchstart: "onMousedown",
      mousemove: "onMousemove",
      touchmove: "onMousemove",
      mouseup: "onMouseup",
      touchend: "onMouseup",
    });
  });

  it("should drag canvas with key-shape hiding and axis locks after behavior binding", () => {
    const graph = createRealGraph();
    const canvas = graph.getCanvas();
    const edge = graph.getEdgeById("a-b");
    const canvasEmit = jest.spyOn(canvas, "emit");
    const edgeHide = jest.spyOn(edge, "hide");
    const edgeShow = jest.spyOn(edge, "show");
    const graphDraw = jest.spyOn(graph, "draw");

    graph.addBehavior(dragCanvas, {
      keyShapeOnly: true,
      xOnly: true,
      shouldHideEdge: jest.fn(() => true),
    });

    graph.emit("canvas:mousedown", {
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      clientX: 10,
      clientY: 12,
    });

    const behavior = graph.getBehavior("dragCanvas")!;
    expect(behavior.dragging).toBe(true);
    expect(canvasEmit).toHaveBeenCalledWith("panzoom:start");
    expect(edgeHide).toHaveBeenCalled();
    expect(graph.getMatrix()[4]).toBe(10);
    expect(graph.getMatrix()[5]).toBe(0);
    expect((graph as any).container.capture).toBe(false);

    graph.emit("mouseup", {});

    expect(canvasEmit).toHaveBeenCalledWith("panzoom:end");
    expect(edgeShow).toHaveBeenCalled();
    expect(graphDraw).toHaveBeenCalled();
    expect(behavior.lastPositions).toBeNull();
    expect(behavior.dragging).toBe(false);
    expect((graph as any).container.capture).toBe(true);

    graph.removeBehavior(dragCanvas);
    graph.destroy();
  });

  it("should handle touch movement and rejected trigger", () => {
    const { graph } = createGraph();
    const context = {
      ...dragCanvas,
      graph,
      limit: true,
      yOnly: true,
      shouldTrigger: jest.fn(() => false),
    };

    expect(
      context.shouldTrigger({
        nativeEvent: {
          buttons: 2,
        },
      })
    ).toBe(false);

    context.onMousedown({
      type: "touchstart",
      nativeEvent: {
        touches: [{ clientX: 0, clientY: 0 }],
      },
    } as any);
    expect(context._bbox).toEqual({ left: 0, top: 0, width: 100, height: 100 });

    context.onMousemove({
      type: "touchmove",
      nativeEvent: {
        touches: [{ clientX: 10, clientY: 12 }],
      },
    } as any);
    expect(context.lastPositions).toBeNull();

    context.shouldTrigger = jest.fn(() => true);
    context.onMousedown({
      type: "touchstart",
      nativeEvent: {
        touches: [{ clientX: 0, clientY: 0 }],
      },
    } as any);
    context.onMousemove({
      type: "touchmove",
      nativeEvent: {
        touches: [
          { clientX: 1, clientY: 1 },
          { clientX: 2, clientY: 2 },
        ],
      },
    } as any);
    expect(context.lastPositions).toBeNull();
  });
});
