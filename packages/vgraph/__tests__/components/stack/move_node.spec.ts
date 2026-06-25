import { Graph, GRAPH_EVENTS } from "../../../src/";
import {
  Grid,
  MoveNodeCommand,
  SelectCommand,
  Stack,
} from "../../../src/components";
import { MoveNodeArgs } from "../../../src/components/stack/commands/move_node";
describe("/src/commands/move_node", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 800,
    height: 600,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: nodeData.width ?? 100,
        height: nodeData.height ?? 40,
      };
    },
  });

  const node1 = graph.add("node", { id: "111", x: 50, y: 50 });

  const stack = new Stack(graph, {
    commands: { moveNode: MoveNodeCommand, select: SelectCommand },
  });

  it("move single node should work", () => {
    graph.getNodeById("111").updatePosition(100, 100); // 模拟nodeMover操作
    stack.execute("moveNode", {
      targetId: "111",
      batch: false,
      originMatrix: [1, 0, 0, 1, 0, 0],
      lastPositions: { "111": { x: 100, y: 100 } },
      originPositions: { "111": { x: 50, y: 50 } },
      originGroupBox: {},
      edgeOriginControlPointsMap: {},
    } as MoveNodeArgs);

    expect(graph.getNodeById("111").get("x")).toBe(100);
    expect(graph.getNodeById("111").get("y")).toBe(100);
    expect(stack.at).toBe(0);
    expect(stack.stack[0].data.targetId).toBe(node1.get("id"));
    expect(stack.stack[0].data).toEqual({
      batch: false,
      targetId: node1.get("id"),
      edgeIds: [],
      lastPositions: { "111": { x: 100, y: 100 } },
      originPositions: { "111": { x: 50, y: 50 } },
      originGroupBox: {},
      currentGroupBox: {},
      originMatrix: [1, 0, 0, 1, 0, 0],
      currentMatrix: [1, 0, 0, 1, 0, 0],
      edgeOriginControlPointsMap: {},
      edgeNewControlPointsMap: {},
      selections: {
        edge: [],
        node: [],
        group: [],
      },
    });
    stack.undo();
    expect(graph.getNodeById("111").get("x")).toBe(50);
    expect(graph.getNodeById("111").get("y")).toBe(50);
    expect(stack.at).toBe(-1);
    stack.redo();
    expect(graph.getNodeById("111").get("x")).toBe(100);
    expect(graph.getNodeById("111").get("y")).toBe(100);
    expect(stack.at).toBe(0);
  });
  it("move single node with edge should work", () => {
    graph.update(node1, { x: 50, y: 50 }); // recover
    graph.add("node", { id: "222", x: 350, y: 50 });
    graph.add("edge", {
      id: "1to2",
      source: "111",
      target: "222",
      controlPoints: [
        [100, 80],
        [200, 40],
      ],
    });
    graph.getEdgeById("1to2").set("controlPoints", [
      [150, 80],
      [250, 40],
    ]);
    graph.getNodeById("111").updatePosition(100, 100); // 模拟nodeMover操作
    stack.execute("moveNode", {
      targetId: "111",
      batch: false,
      originGroupBox: {},
      originMatrix: [1, 0, 0, 1, 0, 0],
      lastPositions: { "111": { x: 100, y: 100 } },
      originPositions: { "111": { x: 50, y: 50 } },
      edgeOriginControlPointsMap: {
        "1to2": [
          [100, 80],
          [200, 40],
        ],
      },
      edgeNewControlPointsMap: {
        "1to2": [
          [150, 80],
          [250, 40],
        ],
      },
    });

    expect(graph.getNodeById("111").get("x")).toBe(100);
    expect(graph.getNodeById("111").get("y")).toBe(100);
    expect(graph.getEdgeById("1to2").get("controlPoints")).toEqual([
      [150, 80],
      [250, 40],
    ]);
    expect(stack.at).toBe(1);
    expect(stack.stack[1].data.targetId).toBe(node1.get("id"));
    stack.undo();
    expect(graph.getNodeById("111").get("x")).toBe(50);
    expect(graph.getNodeById("111").get("y")).toBe(50);
    expect(graph.getEdgeById("1to2").get("controlPoints")).toEqual([
      [100, 80],
      [200, 40],
    ]);
    expect(stack.at).toBe(0);
    stack.redo();
    expect(graph.getNodeById("111").get("x")).toBe(100);
    expect(graph.getNodeById("111").get("y")).toBe(100);
    expect(graph.getEdgeById("1to2").get("controlPoints")).toEqual([
      [150, 80],
      [250, 40],
    ]);
  });
  it("move batch nodes should work", () => {
    const node1 = graph.getNodeById("111");
    const node2 = graph.getNodeById("222");
    graph.update(node1, { x: 50, y: 50 });
    graph.update(node2, { x: 350, y: 50 }); // recover
    node1.updatePosition(100, 100); // 模拟nodeMover操作
    node2.updatePosition(450, 200); // 模拟nodeMover操作
    graph.getEdgeById("1to2").set("controlPoints", [
      [150, 80],
      [250, 40],
    ]);
    stack.execute("select", { selections: [node1, node2] });
    stack.execute("moveNode", {
      batch: true,
      originGroupBox: {},
      originMatrix: [1, 0, 0, 1, 0, 0],
      lastPositions: { "111": { x: 100, y: 100 }, "222": { x: 450, y: 200 } },
      originPositions: {
        "111": { x: 50, y: 50 },
        "222": { x: 350, y: 50 },
      },
      edgeOriginControlPointsMap: {
        "1to2": [
          [100, 80],
          [200, 40],
        ],
      },
      edgeNewControlPointsMap: {
        "1to2": [
          [150, 80],
          [250, 40],
        ],
      },
    });
    expect(graph.getNodeById("111").get("x")).toBe(100);
    expect(graph.getNodeById("111").get("y")).toBe(100);
    expect(graph.getNodeById("222").get("x")).toBe(450);
    expect(graph.getNodeById("222").get("y")).toBe(200);
    expect(graph.getEdgeById("1to2").get("controlPoints")).toEqual([
      [150, 80],
      [250, 40],
    ]);
    expect(stack.at).toBe(2);
    expect(stack.stack[2].data.targetId).toBe(undefined);
    expect(stack.stack[2].data.selections.node).toEqual([
      node1.get("id"),
      node2.get("id"),
    ]);
    expect(stack.stack[2].data.lastPositions).toEqual({
      "111": { x: 100, y: 100 },
      "222": { x: 450, y: 200 },
    });
    expect(stack.stack[2].data.originPositions).toEqual({
      "111": { x: 50, y: 50 },
      "222": { x: 350, y: 50 },
    });
    stack.undo();
    expect(graph.getNodeById("111").get("x")).toBe(50);
    expect(graph.getNodeById("111").get("y")).toBe(50);
    expect(graph.getNodeById("222").get("x")).toBe(350);
    expect(graph.getNodeById("222").get("y")).toBe(50);
    expect(graph.getEdgeById("1to2").get("controlPoints")).toEqual([
      [100, 80],
      [200, 40],
    ]);
    expect(stack.at).toBe(1);
    expect(stack.stack[1].data.targetId).toBe(node1.get("id"));
    stack.redo();
    expect(graph.getNodeById("111").get("x")).toBe(100);
    expect(graph.getNodeById("111").get("y")).toBe(100);
    expect(graph.getNodeById("222").get("x")).toBe(450);
    expect(graph.getNodeById("222").get("y")).toBe(200);
    expect(graph.getEdgeById("1to2").get("controlPoints")).toEqual([
      [150, 80],
      [250, 40],
    ]);
  });

  it("moveNode with graph event for grid should work", () => {
    const gridComponent = new Grid(graph);
    graph.updateData({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
    });
    let col: number;
    let row: number;
    const nodes = graph.getNodes();
    graph.emit(GRAPH_EVENTS.MOVE_START, { batch: true, targets: nodes });
    nodes.forEach((node) => {
      node.updatePosition(node.get("x") + 20, node.get("y") + 10);
    });
    graph.emit(GRAPH_EVENTS.MOVE_END, { batch: true, targets: nodes });
    nodes.forEach((node) => {
      [col, row] = gridComponent.getIndexByCoord(node.get("x"), node.get("y"));
      expect(gridComponent.isWalkable(col, row)).toBe(false);
      expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
      expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 6, row)).toBe(true);
    });
    stack.execute("select", { selections: graph.getNodes() });

    stack.execute("moveNode", {
      batch: true,
      originGroupBox: {},
      originMatrix: [1, 0, 0, 1, 0, 0],
      lastPositions: {
        a: { x: 0 + 20, y: 0 + 10 },
        b: { x: 150 + 20, y: 0 + 10 },
        c: { x: 300 + 20, y: 0 + 10 },
        d: { x: 450 + 20, y: 0 + 10 },
      },
      originPositions: {
        a: { x: 0, y: 0 },
        b: { x: 150, y: 0 },
        c: { x: 300, y: 0 },
        d: { x: 450, y: 0 },
      },
    });
    stack.undo();
    expect(graph.getNodeById("a").get("x")).toBe(0);
    expect(graph.getNodeById("a").get("y")).toBe(0);
    expect(graph.getNodeById("b").get("x")).toBe(150);
    expect(graph.getNodeById("b").get("y")).toBe(0);
    expect(graph.getNodeById("c").get("x")).toBe(300);
    expect(graph.getNodeById("c").get("y")).toBe(0);
    expect(graph.getNodeById("d").get("x")).toBe(450);
    expect(graph.getNodeById("d").get("y")).toBe(0);

    // Grid 通过事件触发恢复到原状态。
    nodes.forEach((node) => {
      [col, row] = gridComponent.getIndexByCoord(node.get("x"), node.get("y"));
      expect(gridComponent.isWalkable(col, row)).toBe(false);
      expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
      expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 6, row)).toBe(true);
    });

    stack.redo();
    expect(graph.getNodeById("a").get("x")).toBe(0 + 20);
    expect(graph.getNodeById("a").get("y")).toBe(0 + 10);
    expect(graph.getNodeById("b").get("x")).toBe(150 + 20);
    expect(graph.getNodeById("b").get("y")).toBe(0 + 10);
    expect(graph.getNodeById("c").get("x")).toBe(300 + 20);
    expect(graph.getNodeById("c").get("y")).toBe(0 + 10);
    expect(graph.getNodeById("d").get("x")).toBe(450 + 20);
    expect(graph.getNodeById("d").get("y")).toBe(0 + 10);
    nodes.forEach((node) => {
      [col, row] = gridComponent.getIndexByCoord(node.get("x"), node.get("y"));
      expect(gridComponent.isWalkable(col, row)).toBe(false);
      expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
      expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
      expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
      expect(gridComponent.isWalkable(col + 6, row)).toBe(true);
    });
  });
});
