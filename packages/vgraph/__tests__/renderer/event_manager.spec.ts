import EventManager from "../../src/renderer/events";

function createShape(options: Record<string, any> = {}) {
  const shape: any = {
    destroyed: false,
    emit: jest.fn((eventType: string, event: any) => {
      if (options.stopOn === eventType) {
        event.stopPropagation();
      }
    }),
    get: jest.fn((key: string) =>
      key === "cursor" ? options.cursor : undefined
    ),
    getParent: jest.fn(() => options.parent ?? null),
    type: options.type ?? "shape",
  };
  return shape;
}

function createManager() {
  const dom = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    style: {} as Record<string, string>,
  };
  const canvas: any = {
    capture: true,
    emit: jest.fn(),
    getParent: jest.fn(() => null),
    painter: {
      getDomNode: jest.fn(() => dom),
    },
    type: "canvas",
  };
  const manager = new EventManager(canvas);
  manager.eventHandler = {
    getShape: jest.fn(),
    mousemove: jest.fn(),
    mouseup: jest.fn(),
  };
  return { manager, canvas, dom };
}

describe("src/renderer/events/index.ts", () => {
  it("should register and remove canvas DOM events", () => {
    const { manager, dom } = createManager();

    expect(dom.addEventListener).toHaveBeenCalledWith(
      "dblclick",
      manager.handleEvent,
      false
    );
    expect(dom.addEventListener).toHaveBeenCalledWith(
      "contextmenu",
      expect.any(Function),
      false
    );

    manager.destroy();

    expect(dom.removeEventListener).toHaveBeenCalledWith(
      "mousemove",
      manager.handleEvent
    );
    expect(dom.removeEventListener).toHaveBeenCalledWith(
      "touchcancel",
      manager.handleEvent
    );
  });

  it("should dispatch handleEvent, click and canvas fallback events", () => {
    const { manager, canvas } = createManager();
    const shape = createShape();
    manager.eventHandler.getShape.mockReturnValue(shape);

    manager.handleEvent({ type: "mousedown", clientX: 10, clientY: 10 } as any);
    manager.handleEvent({ type: "mouseup", clientX: 12, clientY: 12 } as any);

    expect(shape.emit).toHaveBeenCalledWith(
      "mousedown",
      expect.objectContaining({ target: shape, clientX: 10 })
    );
    expect(shape.emit).toHaveBeenCalledWith(
      "click",
      expect.objectContaining({ target: shape, clientX: 12 })
    );
    expect(manager.eventHandler.mouseup).toHaveBeenCalled();

    manager.eventHandler.getShape.mockReturnValue(null);
    manager.handleEvent({ type: "mousemove", clientX: 1, clientY: 2 } as any);
    expect(canvas.emit).toHaveBeenCalledWith(
      "mousemove",
      expect.objectContaining({ target: canvas })
    );

    canvas.capture = false;
    manager.handleEvent({ type: "mouseup", clientX: 0, clientY: 0 } as any);
    expect(manager.eventHandler.mouseup).toHaveBeenCalledTimes(1);
  });

  it("should manage mouse enter, leave, cursor and bubbling paths", () => {
    const { manager, dom } = createManager();
    const parent = createShape({ cursor: "move" });
    const former = createShape({ cursor: "grab" });
    const shape = createShape({ cursor: "pointer", parent });

    manager.mousemove({ clientX: 1, clientY: 1 } as any, shape);

    expect(dom.style.cursor).toBe("pointer");
    expect(shape.emit).toHaveBeenCalledWith(
      "mouseover",
      expect.objectContaining({ target: shape })
    );
    expect(shape.emit).toHaveBeenCalledWith(
      "mouseenter",
      expect.objectContaining({ target: shape })
    );
    expect(parent.emit).toHaveBeenCalledWith(
      "mouseenter",
      expect.objectContaining({ target: parent })
    );

    manager.mousemove({ clientX: 1, clientY: 1 } as any, shape);
    expect(
      shape.emit.mock.calls.filter(([event]) => event === "mouseover")
    ).toHaveLength(1);

    manager.preShape = former;
    manager.enterPath = [former];
    manager.mousemove({ clientX: 2, clientY: 2 } as any, null as any);

    expect(former.emit).toHaveBeenCalledWith(
      "mouseout",
      expect.objectContaining({ target: former })
    );
    expect(former.emit).toHaveBeenCalledWith(
      "mouseleave",
      expect.objectContaining({ target: former })
    );
    expect(dom.style.cursor).toBe("default");
    expect(manager.preShape).toBeNull();
  });

  it("should build event objects, stop bubbling and find layer parents", () => {
    const { manager } = createManager();
    const parent = createShape({ type: "node" });
    const child = createShape({ parent, stopOn: "custom" });
    const event = manager.getEvent(
      "custom",
      { clientX: 3, clientY: 4 } as any,
      child
    );

    expect(event).toEqual(
      expect.objectContaining({
        type: "custom",
        target: child,
        clientX: 3,
        clientY: 4,
        bubbles: true,
      })
    );

    manager.emitEvent("custom", { clientX: 3, clientY: 4 } as any, child);
    expect(child.emit).toHaveBeenCalled();
    expect(parent.emit).not.toHaveBeenCalledWith("custom", expect.anything());
    expect(manager.getLayerParent(child)).toBe(parent);
    expect(manager.getLayerParent(null)).toBeNull();
  });
});
