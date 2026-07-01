import { selectionIntoView } from "../../src/solutions/utils/view";

type BBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function createEntity(bbox: BBox) {
  return {
    getBBox: jest.fn(() => bbox),
  };
}

function createGraphMock(options?: {
  selections?: { node?: string[]; group?: string[] };
  nodeBoxes?: Record<string, BBox>;
  groupBoxes?: Record<string, BBox>;
  matrix?: number[];
  graphSize?: { width: number; height: number };
  viewPadding?: [number, number, number, number];
  viewCenter?: { x: number; y: number };
  containerBBox?: { width: number; height: number };
}) {
  const {
    selections = {},
    nodeBoxes = {},
    groupBoxes = {},
    matrix = [1, 0, 0, 1, 0, 0],
    graphSize = { width: 100, height: 100 },
    viewPadding = [10, 10, 10, 10],
    viewCenter = { x: 50, y: 50 },
    containerBBox = { width: 80, height: 80 },
  } = options ?? {};

  const nodes = Object.fromEntries(
    Object.entries(nodeBoxes).map(([id, bbox]) => [id, createEntity(bbox)])
  );
  const groups = Object.fromEntries(
    Object.entries(groupBoxes).map(([id, bbox]) => [id, createEntity(bbox)])
  );

  return {
    getGraphSize: jest.fn(() => graphSize),
    getViewPadding: jest.fn(() => viewPadding),
    get: jest.fn((key: string) =>
      key === "_selections"
        ? { node: selections.node ?? [], group: selections.group ?? [] }
        : undefined
    ),
    getNodeById: jest.fn((id: string) => nodes[id]),
    getGroupById: jest.fn((id: string) => groups[id]),
    getMatrix: jest.fn(() => matrix),
    getViewCenter: jest.fn(() => viewCenter),
    getBBox: jest.fn(() => containerBBox),
    viewportToCanvas: jest.fn((x: number, y: number) => ({ x, y })),
    translate: jest.fn(),
    scale: jest.fn(),
  };
}

describe("src/solutions/utils/view.ts", () => {
  it("translates selections back into view when they overflow the top-left bounds", () => {
    const graph = createGraphMock({
      selections: { node: ["node-1"] },
      nodeBoxes: {
        "node-1": { left: -10, top: -5, width: 20, height: 15 },
      },
      matrix: [2, 0, 0, 3, 0, 0],
    });

    selectionIntoView(graph as any);

    expect(graph.translate).toHaveBeenCalledWith(40, 45);
    expect(graph.scale).not.toHaveBeenCalled();
  });

  it("translates group selections back into view when they overflow the bottom-right bounds", () => {
    const graph = createGraphMock({
      selections: { group: ["group-1"] },
      groupBoxes: {
        "group-1": { left: 90, top: 95, width: 20, height: 20 },
      },
    });

    selectionIntoView(graph as any);

    expect(graph.getGroupById).toHaveBeenCalledWith("group-1");
    expect(graph.translate).toHaveBeenCalledWith(-20, -25);
    expect(graph.scale).not.toHaveBeenCalled();
  });

  it("does not translate when all selections are already within the visible viewport", () => {
    const graph = createGraphMock({
      selections: { node: ["node-1"] },
      nodeBoxes: {
        "node-1": { left: 20, top: 20, width: 20, height: 20 },
      },
    });

    selectionIntoView(graph as any);

    expect(graph.translate).not.toHaveBeenCalled();
    expect(graph.scale).not.toHaveBeenCalled();
  });

  it("scales the view when autoScale is enabled and selections exceed the viewport", () => {
    const graph = createGraphMock({
      selections: { node: ["node-1"] },
      nodeBoxes: {
        "node-1": { left: -20, top: 0, width: 140, height: 100 },
      },
      containerBBox: { width: 200, height: 200 },
    });

    selectionIntoView(graph as any, true);

    expect(graph.translate).not.toHaveBeenCalled();
    expect(graph.scale).toHaveBeenCalledWith(4 / 7, [50, 50]);
  });
});
