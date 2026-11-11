import { edgeReallocate } from "../../../src/layouts/nested_dag/edge_reallocate";
import {
  getBBoxForParent,
  normalizePosition,
} from "../../../src/layouts/nested_dag/normalize";
import {
  adjustOrder,
  assignOrder,
  initOrder,
  sortByBaryCenter,
} from "../../../src/layouts/nested_dag/pre_order";
import { GraphStructure } from "../../../src/graph_structure";

function createEdge(configs: Record<string, any>) {
  return {
    get: jest.fn((key: string) => configs[key]),
    set: jest.fn((key: string, value: any) => {
      configs[key] = value;
    }),
    configs,
  } as any;
}

describe("src/layouts/nested_dag helpers", () => {
  it("should reallocate edges to the lowest common ancestor groups", () => {
    const root = {
      depth: 0,
      children: [] as any[],
      edges: [] as any[],
    };
    const groupA: any = {
      id: "groupA",
      parent: root,
      children: [] as any[],
      edges: [],
    };
    const groupB: any = {
      id: "groupB",
      parent: root,
      children: [] as any[],
      edges: [],
    };
    const nodeA: any = { id: "nodeA", parent: groupA };
    const nodeB: any = { id: "nodeB", parent: groupB };
    const nodeC: any = { id: "nodeC", parent: groupA };
    root.children = [groupA, groupB];
    groupA.children = [nodeA, nodeC];
    groupB.children = [nodeB];
    const entityMap = {
      nodeA,
      nodeB,
      nodeC,
      groupA,
      groupB,
    };
    const edges = [
      createEdge({ id: "a-b", source: "nodeA", target: "nodeB" }),
      createEdge({ id: "a-c", source: "nodeA", target: "nodeC" }),
    ];

    edgeReallocate(edges, root, entityMap);

    expect(root.edges).toEqual([
      {
        id: "a-b",
        source: "groupA",
        originSource: "nodeA",
        target: "groupB",
        originTarget: "nodeB",
      },
    ]);
    expect(groupA.edges).toEqual([
      {
        id: "a-c",
        source: "nodeA",
        originSource: "nodeA",
        target: "nodeC",
        originTarget: "nodeC",
      },
    ]);
    expect(groupA.depth).toBe(1);
    expect(nodeA.depth).toBe(2);
    expect(nodeA.entityEdges).toEqual([]);
  });

  it("should compute parent bbox and normalize child positions with control points", () => {
    const graph = new GraphStructure({
      nodes: [
        { id: "a", x: 10, y: 20, width: 20, height: 10 },
        { id: "b", x: 50, y: 60, width: 30, height: 20 },
      ],
      edges: [],
    } as any);
    const parent: any = {
      padding: [10, 20],
      titleHeight: 15,
    };

    getBBoxForParent(graph, parent, 5);

    expect(parent.padding).toEqual([10, 20, 10, 20]);
    expect(parent.width).toBe(105);
    expect(parent.height).toBe(90);

    const group = {
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      padding: [10, 10, 10, 10],
      titleHeight: 20,
      collapsed: false,
      uniqueEdges: [
        {
          controlPoints: [
            [1, 2],
            [3, 4],
          ],
        },
      ],
      children: [
        { id: "a", x: 0, y: 0, width: 10, height: 10 },
        { id: "b", x: 20, y: 20, width: 10, height: 10 },
      ],
    } as any;

    normalizePosition(group);

    expect(group.children[0].x).toBe(65);
    expect(group.children[0].y).toBe(95);
    expect(group.children[1].x).toBe(85);
    expect(group.children[1].y).toBe(115);
    expect(group.uniqueEdges[0].controlPoints).toEqual([
      [66, 97],
      [68, 99],
    ]);
  });

  it("should initialize, adjust and assign order for nested ranks", () => {
    const root = {
      absoluteRank: 0,
      startOrder: 0,
      children: [] as any[],
      rankKeys: ["0", "1"],
      rankMap: {},
    } as any;
    const leafA: any = {
      id: "a",
      rank: 0,
      depthCoefficient: 0.01,
      parent: root,
      children: null,
    };
    const group = {
      id: "group",
      rank: 1,
      _order: 0,
      depthCoefficient: 0.01,
      parent: root,
      children: [] as any[],
      rankKeys: ["0"],
      rankMap: {},
      startOrder: 0,
    } as any;
    const leafB: any = {
      id: "b",
      rank: 0,
      depthCoefficient: 0.0001,
      parent: group,
      children: null,
    };
    group.children = [leafB];
    group.rankMap = { "0": [leafB] };
    root.children = [leafA, group];
    root.rankMap = { "0": [leafA], "1": [group] };

    initOrder(root);
    const width = adjustOrder(root);
    assignOrder(root);

    expect(leafA.order).toBe(0);
    expect(group.order).toBe(0);
    expect(group.absoluteRank).toBe(0.01);
    expect(leafB.absoluteRank).toBe(0.01);
    expect(width).toBe(1);
    expect(group._order).toBe(0);
  });

  it("should sort entities by barycenter while preserving entities without barycenter", () => {
    const root = {
      id: "root",
      startOrder: 0,
      children: [] as any[],
      rankKeys: ["0"],
      rankMap: {},
    } as any;
    const top = {
      id: "top",
      parent: root,
      absoluteRank: 0,
      absoluteOrder: 0,
      children: null,
      entityEdges: [],
    };
    const lowerA = {
      id: "lowerA",
      parent: root,
      absoluteRank: 1,
      absoluteOrder: 0,
      children: null,
      entityEdges: [],
    };
    const lowerB = {
      id: "lowerB",
      parent: root,
      absoluteRank: 1,
      absoluteOrder: 1,
      children: null,
      entityEdges: [],
    };
    const noBary = {
      id: "noBary",
      parent: root,
      absoluteRank: 1,
      absoluteOrder: 2,
      children: null,
      entityEdges: [],
    };
    lowerA.entityEdges = [createEdge({ source: "top", target: "lowerA" })];
    lowerB.entityEdges = [createEdge({ source: "top", target: "lowerB" })];
    root.children = [top, lowerB, noBary, lowerA];
    root.rankMap = { "0": [lowerB, noBary, lowerA] };
    const entityMap = {
      root,
      top,
      lowerA,
      lowerB,
      noBary,
    };

    sortByBaryCenter(root, "down", entityMap);

    expect(root.rankMap["0"].map((item: any) => item.id)).toEqual([
      "lowerB",
      "noBary",
      "lowerA",
    ]);
    expect(lowerA.absoluteOrder).toBe(2);
    expect(lowerB.absoluteOrder).toBe(0);

    const collapsed = { collapsed: true, children: [lowerA] };
    expect(sortByBaryCenter(collapsed as any, "up", entityMap)).toBeUndefined();
  });
});
