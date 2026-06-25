import { Graph } from "../../src/graph";
import { GRAPH_EVENTS } from "../../src/consts/meta_events";
import { Grid } from "../../src/components/grid";
import {
  MoveNodeCommand,
  NodeMover,
  RemoveCommand,
  Router,
  SelectCommand,
  Stack,
} from "../../src";

describe("components/grid", function () {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);
  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
  });
  it("GridData should work ", () => {
    const gridComponent = new Grid(graph);
    const GridBox = {
      left: 0,
      top: 0,
      width: 1600,
      height: 1200,
    };
    gridComponent.resetMap(GridBox);
    gridComponent.addBBox({ left: 0, top: 0, width: 100, height: 100 });

    const grid = gridComponent.gridData.grid;
    const [col, row] = gridComponent.getIndexByCoord(0, 0);
    expect(grid[row + 0][col + 0]).toBe(1);
    expect(grid[row + 1][col + 1]).toBe(1);
    expect(grid[row + 8][col + 8]).toBe(1);
    expect(grid[row + 9][col + 9]).toBe(1);
    expect(grid[row + 10][col + 10]).toBe(0);

    expect(grid[row + 9][col + 20]).toBe(0);
    expect(grid[row + 9][col + 21]).toBe(0);
    expect(grid[row + 9][col + 29]).toBe(0);

    gridComponent.addBBox({ left: 200, top: 0, width: 100, height: 100 });

    expect(grid[row + 9][col + 20]).toBe(1);
    expect(grid[row + 9][col + 21]).toBe(1);
    expect(grid[row + 9][col + 29]).toBe(1);

    gridComponent.removeBBox([{ left: 200, top: 0, width: 100, height: 100 }]);

    expect(grid[row + 9][col + 20]).toBe(0);
    expect(grid[row + 9][col + 21]).toBe(0);
    expect(grid[row + 9][col + 29]).toBe(0);

    gridComponent.removeBBox([{ left: 0, top: 0, width: 100, height: 100 }]);

    expect(grid[row + 0][col + 0]).toBe(0);
    expect(grid[row + 1][col + 1]).toBe(0);
    expect(grid[row + 8][col + 8]).toBe(0);
    expect(grid[row + 9][col + 9]).toBe(0);
  });

  it("GridData auto expand grid should work ", () => {
    const gridComponent = new Grid(graph);
    gridComponent.addBBox({ left: -10, top: -10, width: 100, height: 100 });
    const { left, top, rows, cols, step, grid } = gridComponent.gridData;
    expect(left).toBeLessThan(0);
    expect(top).toBeLessThan(0);
    expect(rows).toBeGreaterThan(0);
    expect(cols).toBeGreaterThan(0);
    const startCol = Math.floor((-10 - left) / step);
    const startRow = Math.floor((-10 - top) / step);

    expect(grid[startRow][startCol]).toBe(1);
    expect(grid[startRow - 1][startCol - 1]).toBe(0);
    expect(grid[startRow + 1][startCol + 1]).toBe(1);
    expect(grid[startRow + 2][startCol + 2]).toBe(1);
    expect(grid[startRow + 9][startCol + 9]).toBe(1);
    expect(grid[startRow + 11][startCol + 11]).toBe(0);

    gridComponent.removeBBox([
      { left: -10, top: -10, width: 100, height: 100 },
    ]);

    expect(grid[startRow + 1][startCol + 1]).toBe(0);
    expect(grid[startRow + 2][startCol + 2]).toBe(0);
    expect(grid[startRow + 9][startCol + 9]).toBe(0);
  });
  it("Grid refresh should work ", () => {
    graph.clear();
    const gridComponent = new Grid(graph);
    expect(gridComponent.gridData.left).toBe(0);
    expect(gridComponent.gridData.top).toBe(0);
    expect(gridComponent.gridData.rows).toBe(0);
    expect(gridComponent.gridData.cols).toBe(0);
    graph.data({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
    });
    // gridComponent.refresh();
    const { left, top, rows, cols, step, grid } = gridComponent.gridData;

    expect(left).toBeLessThan(0);
    expect(top).toBeLessThan(0);
    expect(rows).toBeGreaterThan(0);
    expect(cols).toBeGreaterThan(0);
    expect(grid[0][0]).toBe(0);
    const startCol = Math.floor((-50 - left) / step);
    const startRow = Math.floor((-15 - top) / step);
    expect(grid[0][0]).toBe(0);
    expect(grid[startRow][startCol]).toBe(1);
    expect(grid[startRow + 1][startCol + 1]).toBe(1);
    expect(grid[startRow + 2][startCol + 2]).toBe(1);
    expect(grid[startRow + 2][startCol + 3]).toBe(1);
    expect(grid[startRow + 3][startCol + 3]).toBe(0);

    expect(grid[startRow][startCol + 15]).toBe(1);
    expect(grid[startRow + 1][startCol + 1 + 15]).toBe(1);
    expect(grid[startRow + 2][startCol + 2 + 15]).toBe(1);
    expect(grid[startRow + 2][startCol + 3 + 15]).toBe(1);
    expect(grid[startRow + 3][startCol + 3 + 15]).toBe(0);

    expect(grid[startRow][startCol + 30]).toBe(1);
    expect(grid[startRow + 1][startCol + 1 + 30]).toBe(1);
    expect(grid[startRow + 2][startCol + 2 + 30]).toBe(1);
    expect(grid[startRow + 2][startCol + 3 + 30]).toBe(1);
    expect(grid[startRow + 3][startCol + 3 + 30]).toBe(0);
  });
  it("Grid refresh should work with alignGrid", () => {
    graph.clear();
    const gridComponent = new Grid(graph);
    expect(gridComponent.gridData.left).toBe(0);
    expect(gridComponent.gridData.top).toBe(0);
    expect(gridComponent.gridData.rows).toBe(0);
    expect(gridComponent.gridData.cols).toBe(0);
    graph.data({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
    });
    gridComponent.refresh(true);
    const { left, top, rows, cols, step, grid } = gridComponent.gridData;

    expect(left).toBeLessThan(0);
    expect(top).toBeLessThan(0);
    expect(rows).toBeGreaterThan(0);
    expect(cols).toBeGreaterThan(0);
    expect(grid[0][0]).toBe(0);
    expect(graph.getNodeById("a").get("x")).toBe(0);
    expect(graph.getNodeById("a").get("y")).toBe(0);
    expect(graph.getNodeById("b").get("x")).toBe(150);
    expect(graph.getNodeById("b").get("y")).toBe(0);
    expect(graph.getNodeById("c").get("x")).toBe(300);
    expect(graph.getNodeById("c").get("y")).toBe(0);
    expect(graph.getNodeById("d").get("x")).toBe(450);
    expect(graph.getNodeById("d").get("y")).toBe(0);
    const startCol = Math.floor((-50 - left) / step);
    const startRow = Math.floor((-15 - top) / step);
    expect(grid[0][0]).toBe(0);
    expect(grid[startRow][startCol]).toBe(1);
    expect(grid[startRow + 1][startCol + 1]).toBe(1);
    expect(grid[startRow + 2][startCol + 2]).toBe(1);
    expect(grid[startRow + 2][startCol + 3]).toBe(1);
    expect(grid[startRow + 3][startCol + 3]).toBe(0);

    expect(grid[startRow][startCol + 15]).toBe(1);
    expect(grid[startRow + 1][startCol + 1 + 15]).toBe(1);
    expect(grid[startRow + 2][startCol + 2 + 15]).toBe(1);
    expect(grid[startRow + 2][startCol + 3 + 15]).toBe(1);
    expect(grid[startRow + 3][startCol + 3 + 15]).toBe(0);

    expect(grid[startRow][startCol + 30]).toBe(1);
    expect(grid[startRow + 1][startCol + 1 + 30]).toBe(1);
    expect(grid[startRow + 2][startCol + 2 + 30]).toBe(1);
    expect(grid[startRow + 2][startCol + 3 + 30]).toBe(1);
    expect(grid[startRow + 3][startCol + 3 + 30]).toBe(0);
  });
  it("Grid API should work", () => {
    const gridComponent = new Grid(graph);
    graph.data({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
    });
    // gridComponent.refresh();
    const { left, top, step } = gridComponent.gridData;
    expect(left).toBe(-305);
    expect(top).toBe(-265);
    const { pos, row, col } = gridComponent.surroundingWalkableByCoord(50, 0)!;
    expect(pos).toEqual([60, 0]);
    expect(col).toBe(Math.floor((60 - left) / step));
    expect(row).toBe(Math.floor((0 - top) / step));

    const startInfo1 = gridComponent.directionWalkableByCoord(49, 0, "L");
    expect(startInfo1).toBeUndefined();

    const startInfo2 = gridComponent.directionWalkableByCoord(49, 0, "R");
    expect(startInfo2).toEqual({ pos: [59, 0], row, col });

    expect(gridComponent.getIndexByCoord(59, 0)).toEqual([col, row]);
    expect(gridComponent.getIndexByCoord(59, 11)).toEqual([col, row + 1]);
    expect(gridComponent.getValueByCoord(49, 0)).toBe(1);
    expect(gridComponent.getValueByCoord(59, 0)).toBe(0);
    expect(gridComponent.getValueByCoord(59, 11)).toBe(0);
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    expect(gridComponent.isWalkable(col - 1, row)).toBe(false);
  });
  it("Grid with graph events should work ", () => {
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
    });
    const gridComponent = new Grid(graph);

    // add
    graph.add("node", { id: "0", width: 100, height: 30, x: 0, y: 0 });
    let [col, row] = gridComponent.getIndexByCoord(0, 0);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(49, 0);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(51, 0);
    expect(gridComponent.isWalkable(col, row)).toBe(true);

    // update
    graph.update(graph.getNodeById("0"), { id: "0", x: 50, y: 50 });
    [col, row] = gridComponent.getIndexByCoord(0, 50);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(-1, 50);
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    [col, row] = gridComponent.getIndexByCoord(49, 50);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(51, 50);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(99, 50);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(101, 50);
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    [col, row] = gridComponent.getIndexByCoord(99, 36);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(99, 29);
    expect(gridComponent.isWalkable(col, row)).toBe(true);

    // remove
    graph.remove(graph.getNodeById("0"));
    [col, row] = gridComponent.getIndexByCoord(0, 0);
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    [col, row] = gridComponent.getIndexByCoord(49, 0);
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    [col, row] = gridComponent.getIndexByCoord(99, 50);
    expect(gridComponent.isWalkable(col, row)).toBe(true);

    // data
    graph.updateData({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
    });

    const { left, top, step } = gridComponent.gridData;
    expect(left).toBe(-305);
    expect(top).toBe(-265);
    const info = gridComponent.surroundingWalkableByCoord(50, 0)!;
    const pos = info.pos;
    row = info.row;
    col = info.col;
    expect(pos).toEqual([60, 0]);
    expect(col).toBe(Math.floor((60 - left) / step));
    expect(row).toBe(Math.floor((0 - top) / step));

    const startInfo1 = gridComponent.directionWalkableByCoord(49, 0, "L");
    expect(startInfo1).toBeUndefined();

    const startInfo2 = gridComponent.directionWalkableByCoord(49, 0, "R");
    expect(startInfo2).toEqual({ pos: [59, 0], row, col });

    expect(gridComponent.getIndexByCoord(59, 0)).toEqual([col, row]);
    expect(gridComponent.getIndexByCoord(59, 11)).toEqual([col, row + 1]);
    expect(gridComponent.getValueByCoord(49, 0)).toBe(1);
    expect(gridComponent.getValueByCoord(59, 0)).toBe(0);
    expect(gridComponent.getValueByCoord(59, 11)).toBe(0);
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    expect(gridComponent.isWalkable(col - 1, row)).toBe(false);

    // move single node
    graph.updateData({
      nodes: [{ id: "a", width: 100, height: 30, x: 0, y: 0 }],
      edges: [],
    });
    const node = graph.getNodeById("a");
    graph.emit(GRAPH_EVENTS.MOVE_START, { targets: [node] });
    node.updatePosition(20, 10);
    graph.emit(GRAPH_EVENTS.MOVE_END, { targets: [node] });
    [col, row] = gridComponent.getIndexByCoord(20, 10);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);

    graph.emit(GRAPH_EVENTS.MOVE_START, { targets: [node] });
    node.updatePosition(50, 10);
    graph.emit(GRAPH_EVENTS.MOVING, { targets: [node] });
    [col, row] = gridComponent.getIndexByCoord(50, 10);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);

    node.updatePosition(100, 40);
    graph.emit(GRAPH_EVENTS.MOVE_END, { targets: [node] });
    [col, row] = gridComponent.getIndexByCoord(100, 40);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);

    // move batch nodes
    graph.updateData({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
    });

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

    graph.emit(GRAPH_EVENTS.MOVE_START, { batch: true, targets: nodes });
    nodes.forEach((node) => {
      node.updatePosition(node.get("x") + 20, node.get("y") + 10);
    });
    graph.emit(GRAPH_EVENTS.MOVING, { batch: true, targets: nodes });
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

    nodes.forEach((node) => {
      node.updatePosition(node.get("x") + 50, node.get("y") + 30);
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
  });
  it("bugfix: refresh with hided node or expanded group should work", () => {
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      setDefaultGroup(group) {
        return {
          fillStyle: "#F3F9FF",
          strokeStyle: "#3073F2",
          title: {
            text: { text: group.id },
          },
        };
      },
    });
    const gridComponent = new Grid(graph, { ignoreGroupTitle: false });
    graph.updateData({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
      groups: [
        {
          id: "group1",
          linkGroupOnCollapse: true,
          children: ["a", "b"],
        },
      ],
    });
    const nodes = graph.getNodes();
    let col: number;
    let row: number;
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
    const node = graph.getNodeById("b");
    node.hide();
    gridComponent.refresh();
    [col, row] = gridComponent.getIndexByCoord(node.get("x"), node.get("y"));
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(true);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(true);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(true);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(true);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);
    node.show();
    gridComponent.refresh();
    [col, row] = gridComponent.getIndexByCoord(node.get("x"), node.get("y"));
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);
    const group = graph.getGroupById("group1");
    group.collapse();
    group.set("fixWidth", 100);
    group.set("fixHeight", 30);
    group.refreshBox();
    const bbox = group.getBBox();
    [col, row] = gridComponent.getIndexByCoord(bbox.left, bbox.top);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(
      bbox.left + bbox.width - 1,
      bbox.top + bbox.height - 1
    );
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row + 1)).toBe(true);
  });

  it("feat: not ignore group title should work", () => {
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      setDefaultGroup(group) {
        return {
          fillStyle: "#F3F9FF",
          strokeStyle: "#3073F2",
          title: {
            text: { text: group.id },
          },
        };
      },
    });
    const gridComponent = new Grid(graph, { ignoreGroupTitle: false });
    graph.data({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
      groups: [
        {
          id: "group1",
          linkGroupOnCollapse: true,
          children: ["a", "b"],
        },
      ],
    });

    const nodes = graph.getNodes();
    let col: number;
    let row: number;
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

    const group = graph.getGroupById("group1");
    const titleLayer = group.titleLayer!;
    const bbox = titleLayer.getBBox();
    [col, row] = gridComponent.getIndexByCoord(bbox.left, bbox.top);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 2, row)).toBe(false);
    [col, row] = gridComponent.getIndexByCoord(
      bbox.left + bbox.width - 0.1,
      bbox.top + bbox.height - 0.1
    );
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row)).toBe(true);
    const gridComponent2 = new Grid(graph, { ignoreGroupTitle: true });
    gridComponent2.refresh();

    nodes.forEach((node) => {
      [col, row] = gridComponent2.getIndexByCoord(node.get("x"), node.get("y"));
      expect(gridComponent2.isWalkable(col, row)).toBe(false);
      expect(gridComponent2.isWalkable(col - 5, row)).toBe(false);
      expect(gridComponent2.isWalkable(col + 4, row)).toBe(false);
      expect(gridComponent2.isWalkable(col + 4, row + 1)).toBe(false);
      expect(gridComponent2.isWalkable(col + 4, row + 2)).toBe(true);
      expect(gridComponent2.isWalkable(col + 5, row)).toBe(false);
      expect(gridComponent2.isWalkable(col + 6, row)).toBe(true);
    });

    [col, row] = gridComponent2.getIndexByCoord(bbox.left, bbox.top);
    expect(gridComponent2.isWalkable(col, row)).toBe(true);
    expect(gridComponent2.isWalkable(col, row + 1)).toBe(true);
    expect(gridComponent2.isWalkable(col + 1, row)).toBe(true);
    expect(gridComponent2.isWalkable(col + 2, row)).toBe(true);
    [col, row] = gridComponent2.getIndexByCoord(
      bbox.left + bbox.width - 0.1,
      bbox.top + bbox.height - 0.1
    );
    expect(gridComponent2.isWalkable(col, row)).toBe(true);
  });

  it("bugfix: dragging & update/remove node should work.", () => {
    const gridComponent = new Grid(graph);
    graph.data({
      nodes: [
        { id: "a", width: 100, height: 30, x: 0, y: 0 },
        { id: "b", width: 100, height: 30, x: 150, y: 0 },
        { id: "c", width: 100, height: 30, x: 300, y: 0 },
        { id: "d", width: 100, height: 30, x: 450, y: 0 },
      ],
      edges: [],
    });

    const router = new Router(gridComponent);
    const stack = new Stack(graph, {
      commands: {
        moveNode: MoveNodeCommand,
        select: SelectCommand,
        remove: RemoveCommand,
      },
    });
    const nodeMover = new NodeMover(graph, {
      router,
      stack,
      alignGrid: false,
    });
    const node1 = graph.getNodeById("a");
    const node2 = graph.getNodeById("b");

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
    expect(node1.get("x")).toBe(5);
    expect(node1.get("y")).toBe(5);
    expect(node2.get("x")).toBe(150);
    expect(node2.get("y")).toBe(0);

    let [col, row] = gridComponent.getIndexByCoord(
      node1.get("x"),
      node1.get("y")
    );
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(true);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);

    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });
    expect(node1.get("x")).toBe(10);
    expect(node1.get("y")).toBe(10);

    [col, row] = gridComponent.getIndexByCoord(node1.get("x"), node1.get("y"));
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);

    graph.update(node1, { width: 200, height: 30 });

    // update
    [col, row] = gridComponent.getIndexByCoord(node1.get("x"), node1.get("y"));
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col + 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 6, row)).toBe(true);

    graph.emit("mousemove", {
      target: node1,
      clientX: 20,
      clientY: 20,
    });
    expect(node1.get("x")).toBe(20);
    expect(node1.get("y")).toBe(20);

    // width和height一起被更新。
    [col, row] = gridComponent.getIndexByCoord(node1.get("x"), node1.get("y"));
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col - 9, row)).toBe(false);
    expect(gridComponent.isWalkable(col - 11, row)).toBe(true);

    // graph.remove(node1);
    stack.execute("remove", { target: node1 });
    // 正常运行不报错
    graph.emit("mousemove", {
      // target: node1,
      clientX: 20,
      clientY: 20,
    });
    // 正常运行不报错
    nodeMover.onMouseUp({} as any);

    // Grid 空间被释放
    expect(gridComponent.isWalkable(col, row)).toBe(true);
    expect(gridComponent.isWalkable(col - 5, row)).toBe(true);
    expect(gridComponent.isWalkable(col + 4, row)).toBe(true);
    expect(gridComponent.isWalkable(col + 4, row + 1)).toBe(true);
    expect(gridComponent.isWalkable(col + 4, row + 2)).toBe(true);
    expect(gridComponent.isWalkable(col - 9, row)).toBe(true);
    expect(gridComponent.isWalkable(col - 11, row)).toBe(true);
  });
});
