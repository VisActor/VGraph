import { Graph } from "../../src/graph";
import { Edge, Node } from "../../src/models/entities";
import {
  MoveNodeCommand,
  SelectCommand,
  Stack,
  Grid,
  NodeMover,
  Router,
} from "../../src/components";

describe("components/node_mover", () => {
  let graph: Graph;
  let node1: Node;
  let node2: Node;
  let edge: Edge;
  beforeEach(() => {
    const div = document.createElement("div");
    div.setAttribute("width", "800px");
    div.setAttribute("height", "600px");
    graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode(node) {
        return {
          anchors: [
            [1.0, 0.5],
            [0, 0.5],
          ],
        };
      },
    });
    node1 = graph.add("node", {
      type: "rect",
      id: "node1",
      x: 100,
      y: 100,
      width: 60,
      height: 30,
    });
    node2 = graph.add("node", {
      type: "rect",
      id: "node2",
      x: 180,
      y: 230,
      width: 10,
      height: 10,
    });
    edge = graph.add("edge", {
      source: "node1",
      target: "node2",
    });
  });
  afterEach(() => {
    graph.destroy();
  });

  it("drag single node should work", async () => {
    const group1 = graph.add("group", {
      id: "group1",
      padding: [12, 12, 12, 12],
    });
    group1.addChild(node1);
    group1.addChild(node2);
    const nodeMover = new NodeMover(graph, {
      alignGrid: false,
    });

    expect(group1.getBBox()).toEqual({
      left: 100 - 30 - 12,
      top: 100 - 15 - 12,
      width: 185 + 12 - (100 - 30 - 12),
      height: 235 + 12 - (100 - 15 - 12),
    });

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
    expect(node1.get("x")).toBe(105);
    expect(node1.get("y")).toBe(105);

    expect(group1.getBBox()).toEqual({
      left: 100 - 30 - 12 + 5,
      top: 100 - 15 - 12 + 5,
      width: 185 + 12 - (100 - 30 - 12) - 5,
      height: 235 + 12 - (100 - 15 - 12) - 5,
    });

    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });

    // expect(node1.get('x')).toBe(105);
    // expect(node1.get('y')).toBe(105);
    // 被节流了
    await sleep(30);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);

    expect(group1.getBBox()).toEqual({
      left: 100 - 30 - 12 + 10,
      top: 100 - 15 - 12 + 10,
      width: 185 + 12 - (100 - 30 - 12) - 10,
      height: 235 + 12 - (100 - 15 - 12) - 10,
    });

    nodeMover.onMouseUp({} as any);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(edge.get("controlPoints")).not.toBeTruthy();
  });

  it("drag selection nodes should work", async () => {
    node1.updatePosition(100, 100);
    node2.updatePosition(180, 230);
    const group1 = graph.add("group", {
      id: "group11",
      padding: [12, 12, 12, 12],
    });
    group1.addChild(node1);
    group1.addChild(node2);
    const nodeMover = new NodeMover(graph, {
      alignGrid: false,
    });

    expect(group1.getBBox()).toEqual({
      left: 100 - 30 - 12,
      top: 100 - 15 - 12,
      width: 185 + 12 - (100 - 30 - 12),
      height: 235 + 12 - (100 - 15 - 12),
    });

    graph.set("_selections", { node: ["node1", "node2"] });

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
    expect(node1.get("x")).toBe(105);
    expect(node1.get("y")).toBe(105);
    expect(node2.get("x")).toBe(185);
    expect(node2.get("y")).toBe(235);

    expect(group1.getBBox()).toEqual({
      left: 100 - 30 - 12 + 5,
      top: 100 - 15 - 12 + 5,
      width: 185 + 12 - (100 - 30 - 12),
      height: 235 + 12 - (100 - 15 - 12),
    });

    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });

    // expect(node1.get('x')).toBe(105);
    // expect(node1.get('y')).toBe(105);
    // expect(node2.get('x')).toBe(185);
    // expect(node2.get('y')).toBe(235);
    // // 被节流了, 但确保最终还是会更新到鼠标位置
    // await sleep(30);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(190);
    expect(node2.get("y")).toBe(240);

    expect(group1.getBBox()).toEqual({
      left: 100 - 30 - 12 + 10,
      top: 100 - 15 - 12 + 10,
      width: 185 + 12 - (100 - 30 - 12),
      height: 235 + 12 - (100 - 15 - 12),
    });

    nodeMover.onMouseUp({} as any);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(edge.get("controlPoints")).not.toBeTruthy();
  });

  it("drag single node should work with router", async () => {
    const gridComponent = new Grid(graph);
    const router = new Router(gridComponent);
    const nodeMover = new NodeMover(graph, {
      router,
      alignGrid: false,
      debounce: true,
    });
    node1.updatePosition(100, 100);
    node2.updatePosition(180, 230);
    gridComponent.refresh(true);
    expect(edge.get("controlPoints")).not.toBeTruthy();
    // not  start
    graph.emit("mousemove", { target: node1, clientX: 5, clientY: 5 });
    expect(node1.get("x")).toBe(100);
    expect(node1.get("y")).toBe(100);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);

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
    expect(node1.get("x")).toBe(105);
    expect(node1.get("y")).toBe(105);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    await sleep(40);
    expect(edge.get("controlPoints")).toEqual([
      [155, 105],
      [155, 230],
    ]);
    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });
    // expect(node1.get('x')).toBe(105);
    // expect(node1.get('y')).toBe(105);
    // expect(node2.get('x')).toBe(180);
    // expect(node2.get('y')).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [155, 105],
      [155, 230],
    ]);
    let [col, row] = gridComponent.getIndexByCoord(
      node1.get("x"),
      node1.get("y")
    );
    expect(gridComponent.isWalkable(col - 2, row - 2)).toBe(true);
    expect(gridComponent.isWalkable(col - 1, row - 1)).toBe(false);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 2, row + 2)).toBe(true);
    // 被节流了, 但确保最终还是会更新到鼠标位置
    await sleep(40);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [160, 110],
      [160, 230],
    ]);
    [col, row] = gridComponent.getIndexByCoord(node1.get("x"), node1.get("y"));
    expect(gridComponent.isWalkable(col - 2, row - 2)).toBe(true);
    expect(gridComponent.isWalkable(col - 1, row - 1)).toBe(false);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 2, row + 2)).toBe(true);
    nodeMover.onMouseUp({} as any);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [160, 110],
      [160, 230],
    ]);
  });
  it("shouldDrop false should recover", async () => {
    const gridComponent = new Grid(graph);
    const router = new Router(gridComponent);
    const nodeMover = new NodeMover(graph, {
      router,
      alignGrid: false,
      debounce: true,
      shouldDrop: () => {
        return false;
      },
    });
    node1.updatePosition(100, 100);
    node2.updatePosition(180, 230);
    gridComponent.refresh(true);
    expect(node1.get("x")).toBe(100);
    expect(node1.get("y")).toBe(100);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).not.toBeTruthy();
    // not  start
    graph.emit("mousemove", { target: node1, clientX: 5, clientY: 5 });
    expect(node1.get("x")).toBe(100);
    expect(node1.get("y")).toBe(100);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);

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
    expect(node1.get("x")).toBe(105);
    expect(node1.get("y")).toBe(105);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    await sleep(40);
    expect(edge.get("controlPoints")).toEqual([
      [155, 105],
      [155, 230],
    ]);
    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [155, 105],
      [155, 230],
    ]);
    let [col, row] = gridComponent.getIndexByCoord(
      node1.get("x"),
      node1.get("y")
    );
    expect(gridComponent.isWalkable(col - 2, row - 2)).toBe(true);
    expect(gridComponent.isWalkable(col - 1, row - 1)).toBe(false);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 2, row + 2)).toBe(true);
    // 被节流了, 但确保最终还是会更新到鼠标位置
    await sleep(30);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [160, 110],
      [160, 230],
    ]);
    [col, row] = gridComponent.getIndexByCoord(node1.get("x"), node1.get("y"));
    expect(gridComponent.isWalkable(col - 2, row - 2)).toBe(true);
    expect(gridComponent.isWalkable(col - 1, row - 1)).toBe(false);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 2, row + 2)).toBe(true);
    nodeMover.onMouseUp({} as any);
    expect(node1.get("x")).toBe(100);
    expect(node1.get("y")).toBe(100);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).not.toBeTruthy();
  });
  it("node Mover should work with stack", async () => {
    const gridComponent = new Grid(graph);
    const router = new Router(gridComponent);
    const stack = new Stack(graph, {
      commands: {
        moveNode: MoveNodeCommand,
        select: SelectCommand,
      },
    });
    const nodeMover = new NodeMover(graph, {
      router,
      stack,
      debounce: true,
      alignGrid: false,
    });
    node1.updatePosition(100, 100);
    node2.updatePosition(180, 230);
    gridComponent.refresh(true);
    // 对齐网格中心
    expect(node1.get("x")).toBe(100);
    expect(node1.get("y")).toBe(100);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);

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
    expect(node1.get("x")).toBe(105);
    expect(node1.get("y")).toBe(105);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    graph.emit("mousemove", {
      target: node1,
      clientX: 10,
      clientY: 10,
    });
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    await sleep(40);
    expect(edge.get("controlPoints")).toEqual([
      [160, 110],
      [160, 230],
    ]);
    const [col, row] = gridComponent.getIndexByCoord(
      node1.get("x"),
      node1.get("y")
    );
    expect(gridComponent.isWalkable(col - 2, row - 2)).toBe(true);
    expect(gridComponent.isWalkable(col - 1, row - 1)).toBe(false);
    expect(gridComponent.isWalkable(col, row)).toBe(false);
    expect(gridComponent.isWalkable(col + 1, row + 1)).toBe(false);
    expect(gridComponent.isWalkable(col + 2, row + 2)).toBe(true);

    expect(stack.at).toBe(-1);
    expect(stack.stack.length).toBe(0);
    nodeMover.onMouseUp({} as any);
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [160, 110],
      [160, 230],
    ]);
    expect(stack.at).toBe(0);
    expect(stack.stack.length).toBe(1);

    // BUGFIX: 分别移动多个节点后 undo, 应该只有最后移动的节点位置恢复。
    graph.emit("node:mousedown", {
      target: node2,
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: node2,
      clientX: 100,
      clientY: 100,
    });
    nodeMover.onMouseUp({} as any);
    stack.undo();
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [160, 110],
      [160, 230],
    ]);

    stack.undo();
    expect(node1.get("x")).toBe(100);
    expect(node1.get("y")).toBe(100);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).not.toBeTruthy();
    stack.redo();
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);
    expect(node2.get("x")).toBe(180);
    expect(node2.get("y")).toBe(230);
    expect(edge.get("controlPoints")).toEqual([
      [160, 110],
      [160, 230],
    ]);
  });

  it("getLimitBox should work", () => {
    const gridComponent = new Grid(graph);
    const router = new Router(gridComponent);
    new NodeMover(graph, {
      router,
      alignGrid: false,
      getLimitBox() {
        return {
          left: 0,
          top: 0,
          width: 200,
          height: 200,
        };
      },
    });
    node1.updatePosition(100, 100);
    gridComponent.refresh(true);
    graph.emit("node:mousedown", {
      target: node1,
      clientX: 100,
      clientY: 100,
    });
    graph.emit("mousemove", {
      target: node1,
      clientX: 110,
      clientY: 110,
    });
    expect(node1.get("x")).toBe(110);
    expect(node1.get("y")).toBe(110);

    graph.emit("mousemove", {
      target: node1,
      clientX: 200,
      clientY: 200,
    });
    expect(node1.get("x")).toBe(170);
    expect(node1.get("y")).toBe(185);

    graph.emit("mousemove", {
      target: node1,
      clientX: 200,
      clientY: 170,
    });
    expect(node1.get("x")).toBe(170);
    expect(node1.get("y")).toBe(155);

    graph.emit("mousemove", {
      target: node1,
      clientX: 250,
      clientY: 170,
    });
    expect(node1.get("x")).toBe(170);
    expect(node1.get("y")).toBe(155);

    graph.emit("mousemove", {
      target: node1,
      clientX: 150,
      clientY: 150,
    });
    expect(node1.get("x")).toBe(70);
    expect(node1.get("y")).toBe(135);

    graph.emit("mousemove", {
      target: node1,
      clientX: 0,
      clientY: 0,
    });
    expect(node1.get("x")).toBe(30);
    expect(node1.get("y")).toBe(15);
  });
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
