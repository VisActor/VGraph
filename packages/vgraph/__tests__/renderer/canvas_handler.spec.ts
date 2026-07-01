import CanvasEvents, {
  isPointInRect,
  isPointOnArc,
  isPointOnCircle,
  isPointOnLine,
} from "../../src/renderer/events/canvas_handler";

function createCanvas(children: any[] = []) {
  const dom = document.createElement("canvas");
  return {
    type: "layer",
    visible: true,
    capture: true,
    exactMatch: false,
    children,
    painter: {
      getDomNode: jest.fn(() => dom),
    },
    clientToCanvas: jest.fn((clientX: number, clientY: number) => ({
      x: clientX * 2,
      y: clientY * 2,
    })),
    get: jest.fn((key: string) => {
      if (key === "pixelRatio") {
        return 2;
      }
      if (key === "opacity") {
        return 1;
      }
      return undefined;
    }),
    hasTransform: jest.fn(() => false),
    isLayer: jest.fn(() => true),
  } as any;
}

function createLayer(overrides: Record<string, any> = {}) {
  return {
    type: "layer",
    visible: true,
    capture: true,
    exactMatch: false,
    children: [],
    get: jest.fn((key: string) => (key === "opacity" ? 1 : undefined)),
    getBBoxForHit: jest.fn(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    })),
    hasTransform: jest.fn(() => false),
    isLayer: jest.fn(() => true),
    ...overrides,
  } as any;
}

function createShape(type: string, configs: Record<string, any> = {}) {
  const shape: any = {
    type,
    configs,
    visible: true,
    capture: true,
    calculateBBox: jest.fn(
      () => configs.bbox ?? { left: 0, top: 0, width: 10, height: 10 }
    ),
    getBBox: jest.fn(
      () => configs.bbox ?? { left: 0, top: 0, width: 10, height: 10 }
    ),
    getHitWidth: jest.fn(() => configs.hitWidth ?? 4),
    getVertices: jest.fn(() => configs.vertices ?? []),
    getSegments: jest.fn(() => configs.segments ?? []),
    getStartRad: jest.fn(() => ({ rad: 0 })),
    getEndRad: jest.fn(() => ({ rad: 0 })),
    getMatrix: jest.fn(() => configs.matrix ?? [1, 0, 0, 1, 0, 0]),
    hasTransform: jest.fn(() => Boolean(configs.matrix)),
    isLayer: jest.fn(() => false),
    get: jest.fn((key: string) => {
      if (key === "opacity") {
        return configs.opacity ?? 1;
      }
      if (key === "fixed") {
        return configs.fixed;
      }
      if (key === "clip") {
        return configs.clip;
      }
      if (key === "points") {
        return configs.points;
      }
      if (key === "left") {
        return configs.left;
      }
      if (key === "top") {
        return configs.top;
      }
      if (key === "width") {
        return configs.width;
      }
      if (key === "height") {
        return configs.height;
      }
      return configs[key];
    }),
  };
  return shape;
}

describe("src/renderer/events/canvas_handler.ts geometry helpers", () => {
  it("should detect points in rect, line, circle and arc strokes", () => {
    expect(
      isPointInRect(
        { left: 0, top: 0, width: 10, height: 10 },
        { x: 10, y: 10 }
      )
    ).toBe(true);
    expect(
      isPointInRect({ left: 0, top: 0, width: 10, height: 10 }, { x: 11, y: 5 })
    ).toBe(false);

    expect(isPointOnLine(0, 0, 10, 0, 4, { x: 5, y: 1 })).toBe(true);
    expect(isPointOnLine(0, 0, 10, 0, 4, { x: 20, y: 1 })).toBe(false);

    expect(isPointOnCircle(0, 0, 10, 4, { x: 10, y: 0 })).toBe(true);
    expect(isPointOnCircle(0, 0, 10, 4, { x: 0, y: 0 })).toBe(false);

    expect(
      isPointOnArc(["A", 0, 0, 10, 5, 0, Math.PI, 0, 0], 4, {
        x: 10,
        y: 0,
      })
    ).toBe(true);
  });
});

describe("src/renderer/events/canvas_handler.ts CanvasEvents", () => {
  it("should find shapes in nested layers and fall back to node layers", () => {
    const childShape = createShape("rect", {
      bbox: { left: 0, top: 0, width: 20, height: 20 },
    });
    const hiddenShape = createShape("rect", {
      bbox: { left: 0, top: 0, width: 20, height: 20 },
      opacity: 0,
    });
    const nodeLayer = createLayer({
      type: "node",
      children: [hiddenShape, childShape],
      getBBoxForHit: jest.fn(() => ({
        left: 0,
        top: 0,
        width: 50,
        height: 50,
      })),
    });
    const canvas = createCanvas([nodeLayer]);
    const handler = new CanvasEvents(canvas);

    expect(handler.getShape({ clientX: 5, clientY: 5 } as MouseEvent)).toBe(
      childShape
    );
    expect(handler.viewportPoint).toEqual({ x: 5, y: 5 });
    expect(handler.getShapeInLayer({ x: 80, y: 80 }, nodeLayer)).toBeNull();

    nodeLayer.children = [];
    expect(handler.getShapeInLayer({ x: 10, y: 10 }, nodeLayer)).toBe(
      nodeLayer
    );

    nodeLayer.exactMatch = true;
    expect(handler.getShapeInLayer({ x: 10, y: 10 }, nodeLayer)).toBeNull();

    nodeLayer.visible = false;
    expect(handler.getShapeInLayer({ x: 10, y: 10 }, nodeLayer)).toBeNull();
  });

  it("should evaluate shape visibility, fixed points, clipping and fill hits", () => {
    const handler = new CanvasEvents(createCanvas());
    const clip = createShape("rect", {
      bbox: { left: 50, top: 50, width: 10, height: 10 },
    });
    const fixedRect = createShape("rect", {
      fixed: true,
      bbox: { left: 5, top: 5, width: 10, height: 10 },
    });
    const clippedCircle = createShape("circle", {
      cx: 0,
      cy: 0,
      r: 10,
      fillStyle: "#000",
      clip,
    });

    expect(
      handler.isPointInShape({ x: 100, y: 100 }, fixedRect, false, {
        x: 6,
        y: 6,
      })
    ).toBe(true);
    expect(
      handler.isPointInShape({ x: 0, y: 0 }, clippedCircle, false, {
        x: 0,
        y: 0,
      })
    ).toBe(false);
    expect(handler.isPointInFill({ x: 0, y: 0 }, clippedCircle)).toBe(true);

    const zeroRect = createShape("rect", {
      bbox: { left: 0, top: 0, width: 0, height: 0 },
    });
    expect(
      handler.isPointInShape({ x: 0, y: 0 }, zeroRect, false, { x: 0, y: 0 })
    ).toBe(false);
  });

  it("should evaluate stroke hits for rect, circle, polygon, rhombus and path", () => {
    const handler = new CanvasEvents(createCanvas());
    const rect = createShape("rect", {
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      strokeStyle: "#000",
      hitWidth: 4,
    });
    const circle = createShape("circle", {
      cx: 0,
      cy: 0,
      r: 10,
      strokeStyle: "#000",
      hitWidth: 4,
    });
    const polygon = createShape("polygon", {
      strokeStyle: "#000",
      hitWidth: 4,
      vertices: [
        [0, 0],
        [10, 0],
        [10, 10],
      ],
    });
    const rhombus = createShape("rhombus", {
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      strokeStyle: "#000",
      hitWidth: 4,
    });
    const path = createShape("path", {
      strokeStyle: "#000",
      hitWidth: 4,
      segments: [
        {
          type: "line",
          configs: {
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
            ],
          },
        },
        {
          type: "arc",
          configs: {
            params: ["A", 0, 0, 10, 10, 0, Math.PI, 0, 0],
          },
        },
      ],
    });

    expect(handler.isPointInStroke({ x: 5, y: 1 }, rect)).toBe(true);
    expect(handler.isPointInStroke({ x: 10, y: 0 }, circle)).toBe(true);
    expect(handler.isPointInStroke({ x: 5, y: 1 }, polygon)).toBe(true);
    expect(handler.isPointInStroke({ x: 5, y: 1 }, rhombus)).toBe(true);
    expect(handler.isPointInStroke({ x: 5, y: 1 }, path)).toBe(true);

    const unknown = createShape("unknown", { strokeStyle: "#000" });
    expect(handler.isPointInStroke({ x: 0, y: 0 }, unknown)).toBe(false);
  });

  it("should map transformed points and ignore unsupported arrow shapes", () => {
    const handler = new CanvasEvents(createCanvas());
    const transformed = createShape("rect", {
      matrix: [1, 0, 0, 1, 10, 20],
    });

    expect(handler.getActualPoint({ x: 15, y: 25 }, transformed)).toEqual({
      x: 5,
      y: 5,
    });
    expect(handler.isPointOnArrow({ x: 0, y: 0 }, createShape("rect"))).toBe(
      false
    );
  });
});
