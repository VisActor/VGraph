import { panZoom } from "../../src";

function createShape(keyShape: boolean) {
  return {
    get: jest.fn((key: string) => (key === "_keyShape" ? keyShape : undefined)),
    hide: jest.fn(),
    show: jest.fn(),
  };
}

function createContext(overrides: Record<string, any> = {}) {
  const dom = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  const canvas = {
    getCanvasDom: jest.fn(() => dom),
    emit: jest.fn(),
    clientToCanvas: jest.fn((x: number, y: number) => ({ x, y })),
    get: jest.fn((key: string) => (key === "pixelRatio" ? 2 : undefined)),
  };
  const nodeShape = createShape(false);
  const nodeKeyShape = createShape(true);
  const edgeShape = createShape(false);
  const edgeKeyShape = createShape(true);
  const graph = {
    canvas,
    getCanvas: jest.fn(() => canvas),
    isAnimating: jest.fn(() => true),
    getNodes: jest.fn(() => [
      {
        layer: {
          children: [nodeShape, nodeKeyShape],
        },
      },
    ]),
    getEdges: jest.fn(() => [
      {
        id: "edge",
        layer: {
          children: [edgeShape, edgeKeyShape],
        },
      },
    ]),
    draw: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    setCapture: jest.fn(),
    getZoomRatio: jest.fn(() => 1),
    clientToViewport: jest.fn((x: number, y: number) => ({ x, y })),
    getGraphBBox: jest.fn(() => ({ left: 0, top: 0, width: 100, height: 100 })),
  };

  return {
    context: {
      ...panZoom,
      graph,
      ...overrides,
    },
    graph,
    canvas,
    dom,
    shapes: {
      nodeShape,
      nodeKeyShape,
      edgeShape,
      edgeKeyShape,
    },
  };
}

function createWheelEvent(overrides: Record<string, any> = {}) {
  return {
    clientX: 10,
    clientY: 20,
    deltaX: 0,
    deltaY: 0,
    wheelDelta: 1,
    wheelDeltaX: 0,
    wheelDeltaY: 0,
    ctrlKey: false,
    preventDefault: jest.fn(),
    ...overrides,
  } as any;
}

describe("src/behaviors/pan_zoom.ts", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("should register and remove wheel listener", () => {
    const { context, dom } = createContext();

    context.init();
    expect(dom.addEventListener).toHaveBeenCalledWith("wheel", context._event);

    context.destroy();
    expect(dom.removeEventListener).toHaveBeenCalledWith(
      "wheel",
      context._event
    );
  });

  it("should hide non-key shapes before pan zoom and restore them after delay", () => {
    jest.useFakeTimers();
    const { context, canvas, shapes } = createContext({
      keyShapeOnly: true,
      keyShapeVisible: true,
      showKeyShapeDelay: 20,
      shouldHideEdge: jest.fn(() => true),
      limit: true,
      padding: 12,
    });

    context.beforePanZoom();

    expect(canvas.emit).toHaveBeenCalledWith("panzoom:start");
    expect(shapes.nodeShape.hide).toHaveBeenCalled();
    expect(shapes.nodeKeyShape.hide).not.toHaveBeenCalled();
    expect(shapes.edgeShape.hide).toHaveBeenCalled();
    expect(shapes.edgeKeyShape.hide).toHaveBeenCalled();
    expect(context._bbox).toEqual({ left: 0, top: 0, width: 100, height: 100 });

    jest.advanceTimersByTime(20);

    expect(shapes.nodeShape.show).toHaveBeenCalled();
    expect(shapes.edgeKeyShape.show).toHaveBeenCalled();
    expect(canvas.emit).toHaveBeenCalledWith("panzoom:end");

    jest.advanceTimersByTime(500);
    expect(context._bbox).toBeNull();
  });

  it("should translate wheel movement with clamps and axis locks", () => {
    const { context, graph } = createContext({
      xOnly: true,
      maxTranslateOffset: 30,
    });
    const ev = createWheelEvent({
      deltaX: 80,
      deltaY: -80,
      wheelDeltaX: 10,
      wheelDeltaY: -10,
    });

    context.translate(ev);

    expect(graph.translate).toHaveBeenCalledWith(-15, 0);
    expect(graph.setCapture).toHaveBeenCalledWith(true);
    expect(ev.preventDefault).toHaveBeenCalled();

    context.yOnly = true;
    context.xOnly = false;
    context.translate(
      createWheelEvent({
        deltaX: -80,
        deltaY: 20,
        wheelDeltaX: -100,
        wheelDeltaY: 100,
      })
    );
    expect(graph.translate).toHaveBeenLastCalledWith(0, -20);
  });

  it("should scale around viewport point for wheel zoom directions", () => {
    const { context, graph } = createContext();
    const zoomIn = createWheelEvent({ wheelDelta: 1 });

    context.scale(zoomIn);

    expect(graph.scale).toHaveBeenCalledWith(1.02, [10, 20]);
    expect(zoomIn.preventDefault).toHaveBeenCalled();

    graph.getZoomRatio.mockReturnValue(6);
    const zoomOut = createWheelEvent({ wheelDelta: -1 });
    context.scale(zoomOut);

    expect(graph.scale).toHaveBeenLastCalledWith(0.9, [10, 20]);
  });

  it("should route wheel events by trigger guard, modifier and zoom mode", () => {
    const { context, graph } = createContext({
      shouldTrigger: jest.fn(() => false),
    });
    const blocked = createWheelEvent();

    context.onWheel(blocked);

    expect(blocked.preventDefault).toHaveBeenCalled();
    expect(graph.translate).not.toHaveBeenCalled();

    context.shouldTrigger = jest.fn(() => true);
    context.zoom = false;
    context.onWheel(createWheelEvent({ deltaX: 4, deltaY: 6 }));
    expect(graph.translate).toHaveBeenCalled();

    context.zoom = true;
    context.zoomModifierKey = "metaKey";
    context.onWheel(
      createWheelEvent({ deltaX: 8, deltaY: 10, metaKey: false })
    );
    expect(graph.translate).toHaveBeenLastCalledWith(-4, -5);
  });

  it("should handle touch translate, zoom and gesture helpers", () => {
    const { context, graph } = createContext();
    const start = {
      nativeEvent: {
        touches: [
          { clientX: 0, clientY: 0 },
          { clientX: 10, clientY: 0 },
        ],
      },
    };

    context.onTouchStart(start as any);

    expect(context.center).toEqual({ x: 5, y: 0 });
    expect(
      context.getGuesture(
        [
          { clientX: 4, clientY: 0 },
          { clientX: 14, clientY: 0 },
        ],
        context.last
      )
    ).toBe("drag");
    expect(
      context.getDistance(
        { clientX: 0, clientY: 0 },
        { clientX: 3, clientY: 4 }
      )
    ).toBe(5);

    context.touchTranslate([
      { clientX: 6, clientY: 7 },
      { clientX: 16, clientY: 7 },
    ] as any);
    expect(graph.translate).toHaveBeenCalledWith(6, 7);

    context.last = [
      { clientX: 0, clientY: 0 },
      { clientX: 10, clientY: 0 },
    ];
    context.touchZoom([
      { clientX: 0, clientY: 0 },
      { clientX: 20, clientY: 0 },
    ] as any);
    expect(graph.scale).toHaveBeenCalledWith(2, [2.5, 0]);

    const preventDefault = jest.fn();
    context.last = [
      { clientX: 0, clientY: 0 },
      { clientX: 10, clientY: 0 },
    ];
    context.onTouchMove({
      nativeEvent: {
        touches: [
          { clientX: 4, clientY: 0 },
          { clientX: 14, clientY: 0 },
        ],
        preventDefault,
      },
    } as any);
    expect(preventDefault).toHaveBeenCalled();

    context.onTouchMove({
      nativeEvent: {
        touches: [{ clientX: 4, clientY: 0 }],
        preventDefault: jest.fn(),
      },
    } as any);
    context.onTouchEnd();
    expect(context.center).toBeNull();
  });
});
