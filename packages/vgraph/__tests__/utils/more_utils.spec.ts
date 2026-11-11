import { dealDuplicateEdge } from "../../src/layouts/utils/duplicate_edges";
import {
  isPointInScreen,
  normalizePadding,
  resizeToExport,
} from "../../src/utils/graph";
import { isNodeShape } from "../../src/utils/shape";
import { animationFrame, getDefaultBizData } from "../../src/utils/common";
import {
  changeCoordinateBasis,
  crossMultiply,
  dotMultiply,
  normalizeVector,
} from "../../src/utils/math/vector";

function createEdge(
  configs: Record<string, any>,
  terminal?: { startPoint: number[]; endPoint: number[] }
) {
  const store: any = { lineWidth: 1, styles: {}, ...configs };
  const edge: any = {
    controlPoints: store.controlPoints,
    get: jest.fn((key: string) => store[key]),
    set: jest.fn((key: string, value: any) => {
      store[key] = value;
      edge[key] = value;
    }),
  };
  if (terminal) {
    edge.getTerminal = jest.fn(() => terminal);
  }
  return edge;
}

describe("src/layouts/utils/duplicate_edges.ts", () => {
  it("should group duplicate edges and offset hLine/vLine control points", () => {
    const first = createEdge(
      {
        source: "a",
        target: "b",
        type: "hLine",
        styles: { curvePosition: 2, curveOffset: 100 },
      },
      { startPoint: [0, 0], endPoint: [10, 10] }
    );
    const reversed = createEdge(
      {
        source: "b",
        target: "a",
        type: "hLine",
      },
      { startPoint: [0, 0], endPoint: [10, 10] }
    );

    const repeatEdges = dealDuplicateEdge(
      { getNodeMap: jest.fn() } as any,
      [first, reversed] as any
    );

    expect(repeatEdges).toHaveLength(1);
    expect(first.set).toHaveBeenCalledWith("controlPoints", undefined);
    expect(first.controlPoints).toEqual([
      [8, 0],
      [8, 10],
    ]);
    expect(reversed.controlPoints).toEqual([
      [2, 10],
      [2, 0],
    ]);
  });

  it("should offset generic duplicate edges from graph node positions", () => {
    const first = createEdge({ source: "a", target: "b", type: "line" });
    const second = createEdge({ source: "a", target: "b", type: "line" });
    const graph = {
      getNodeMap: jest.fn(() => ({
        a: { get: jest.fn((key: string) => (key === "x" ? 0 : 0)) },
        b: { get: jest.fn((key: string) => (key === "x" ? 10 : 0)) },
      })),
    };

    dealDuplicateEdge(graph as any, [first, second] as any);

    expect(first.controlPoints).toEqual([[5, 3]]);
    expect(second.controlPoints).toEqual([[5, -3]]);
  });

  it("should offset existing control points and support unfiltered edge groups", () => {
    const first = createEdge(
      {
        source: "a",
        target: "b",
        type: "cubic",
        controlPoints: [
          [5, 0],
          [5, 10],
        ],
      },
      { startPoint: [0, 0], endPoint: [10, 10] }
    );
    const reversed = createEdge(
      {
        source: "b",
        target: "a",
        type: "cubic",
        controlPoints: [
          [5, 0],
          [5, 10],
        ],
      },
      { startPoint: [0, 0], endPoint: [10, 10] }
    );

    const repeatEdges = dealDuplicateEdge(
      { getNodeMap: jest.fn() } as any,
      [[first, reversed]] as any,
      false
    );

    expect(repeatEdges).toEqual([[first, reversed]]);
    expect(first.set).toHaveBeenCalledWith("controlPoints", [
      [8, 0],
      [8, 10],
    ]);
    expect(reversed.set).toHaveBeenCalledWith("controlPoints", [
      [2, 10],
      [2, 0],
    ]);
  });
});

describe("src/utils/graph/index.ts", () => {
  it("should normalize padding and check points in screen", () => {
    expect(normalizePadding(4)).toEqual([4, 4, 4, 4]);
    expect(normalizePadding([1, 2])).toEqual([1, 2, 1, 2]);
    expect(normalizePadding([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);

    expect(isPointInScreen({ x: 0, y: 0 }, { width: 10, height: 10 })).toBe(
      true
    );
    expect(isPointInScreen({ x: 11, y: 5 }, { width: 10, height: 10 })).toBe(
      false
    );
    expect(isPointInScreen({ x: 5, y: -1 }, { width: 10, height: 10 })).toBe(
      false
    );
  });

  it("should resize graph for export and return original matrix", () => {
    const graph = {
      getMatrix: jest.fn(() => [1, 0, 0, 1, 5, 6]),
      set: jest.fn(),
      resetMatrix: jest.fn(),
      getGraphBBox: jest.fn(() => ({
        left: 10,
        top: 20,
        width: 200,
        height: 100,
      })),
      translate: jest.fn(),
      scale: jest.fn(),
      changeSize: jest.fn(),
    };

    const result = resizeToExport(graph as any, {
      maxWidth: 100,
      maxHeight: 80,
      padding: [10, 20],
    });

    expect(result).toEqual({
      matrix: [1, 0, 0, 1, 5, 6],
      width: 140,
      height: 100,
    });
    expect(graph.set).toHaveBeenNthCalledWith(1, "emitGraphEvents", false);
    expect(graph.translate).toHaveBeenCalledWith(10, -10);
    expect(graph.scale).toHaveBeenCalledWith(0.7);
    expect(graph.changeSize).toHaveBeenCalledWith(140, 100);
    expect(graph.set).toHaveBeenLastCalledWith("emitGraphEvents", true);
  });
});

describe("src/utils/shape/index.ts", () => {
  it("should detect renderer node shapes and DOM node containers", () => {
    const nodeShape = { type: "shape", parent: { type: "node" } };
    const edgeShape = { type: "shape", parent: { type: "edge" } };
    const orphanShape = { type: "shape", parent: null };
    const container = document.createElement("div");
    const child = document.createElement("span");
    container.className = "vgraph-viewer-node";
    container.appendChild(child);
    document.body.appendChild(container);

    expect(isNodeShape()).toBe(false);
    expect(isNodeShape(nodeShape as any)).toBe(true);
    expect(isNodeShape(edgeShape as any)).toBe(false);
    expect(isNodeShape(orphanShape as any)).toBe(false);
    expect(isNodeShape(child)).toBe(true);
    expect(isNodeShape(document.createElement("span"))).toBe(false);

    document.body.removeChild(container);
  });
});

describe("src/utils/common/index.ts and src/utils/math/vector.ts", () => {
  it("should strip render configs from edge and group business data", () => {
    const edge = {
      type: "edge",
      configs: {
        id: "edge",
        source: "a",
        target: "b",
        styles: {},
        startArrow: true,
        endArrow: true,
        __source: "a",
        __target: "b",
        strokeStyle: "#000",
        cursor: "pointer",
      },
    };
    const group = {
      type: "group",
      configs: {
        id: "group",
        padding: 10,
        title: "Group",
        titlePosition: "top",
        renderGroupTitle: true,
        fillStyle: "#fff",
        custom: 1,
      },
    };

    expect(getDefaultBizData(edge)).toEqual({
      id: "edge",
      source: "a",
      target: "b",
    });
    expect(getDefaultBizData(group)).toEqual({
      id: "group",
      custom: 1,
    });
  });

  it("should provide animation fallback and vector calculations", () => {
    const originalRAF = window.requestAnimationFrame;
    (window as any).requestAnimationFrame = undefined;
    const fallback = animationFrame(jest.fn()) as any;
    const callback = jest.fn();
    const timer = fallback(callback);

    expect(timer).toEqual(expect.any(Number));
    clearTimeout(timer);
    window.requestAnimationFrame = originalRAF;

    expect(normalizeVector([3, 4])).toEqual([0.6000000000000001, 0.8]);
    expect(normalizeVector([0, 0])).toEqual([0, 0]);
    expect(dotMultiply([1, 2], [3, 4])).toBe(11);
    expect(crossMultiply([1, 2], [3, 4])).toBe(-2);
    expect(changeCoordinateBasis([3, 4], [1, 0], [0, 1])).toEqual([3, 4]);
  });
});
