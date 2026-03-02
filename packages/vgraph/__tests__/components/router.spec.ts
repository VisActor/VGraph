import { Graph } from "../../src/graph";
import { Grid, Router } from "../../src/components";
describe("algorithms/PathFinder", function () {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);
  const graph = new Graph({
    container: graphDiv,
    width: 10,
    height: 10,
  });
  // it('Router with default options should work', () => {
  //   const gridComponent = new Grid(graph);
  //   const router = new Router(gridComponent);
  //   gridComponent.addBBox({ left: 0, top: 0, width: 100, height: 100 });
  //   gridComponent.addBBox({ left: 200, top: 0, width: 100, height: 100 });
  //   gridComponent.addBBox({ left: 400, top: 0, width: 100, height: 100 });
  //   const startPoint1 = [105, 55];
  //   const endPoint1 = [155, 105];
  //   let controlPoints1 = router.findPath(startPoint1, endPoint1, { start: true, end: true });
  //   expect(controlPoints1?.length).toBe(3);
  //   expect(controlPoints1).toEqual([
  //     [105, 55],
  //     [105, 105],
  //     [155, 105],
  //   ]);

  //   controlPoints1 = router.findPath(startPoint1, endPoint1);
  //   expect(controlPoints1?.length).toBe(3);
  //   expect(controlPoints1).toEqual([
  //     [125, 55],
  //     [125, 105],
  //     [135, 105],
  //   ]);

  //   const startPoint2 = [105, 55];
  //   const endPoint2 = [395, 55];
  //   let controlPoints2 = router.findPath(startPoint2, endPoint2, { start: true, end: true });
  //   expect(controlPoints2?.length).toBe(5);
  //   expect(controlPoints2).toEqual([
  //     [105, 55],
  //     [195, 55],
  //     [195, 105],
  //     [395, 105],
  //     [395, 55],
  //   ]);

  //   controlPoints2 = router.findPath(startPoint2, endPoint2);
  //   expect(controlPoints2?.length).toBe(5);
  //   expect(controlPoints2).toEqual([
  //     [125, 55],
  //     [195, 55],
  //     [195, 105],
  //     [375, 105],
  //     [375, 55],
  //   ]);
  // });
  // it('Router with custom options should work', () => {
  //   const gridComponent = new Grid(graph);
  //   const router = new Router(gridComponent, { allowDiagonal: 'always' });
  //   gridComponent.addBBox({ left: 0, top: 0, width: 100, height: 100 });
  //   gridComponent.addBBox({ left: 200, top: 0, width: 100, height: 100 });
  //   gridComponent.addBBox({ left: 400, top: 0, width: 100, height: 100 });
  //   const startPoint1 = [105, 55];
  //   const endPoint1 = [155, 105];
  //   let controlPoints1 = router.findPath(startPoint1, endPoint1, { start: true, end: true });
  //   expect(controlPoints1?.length).toBe(2);
  //   expect(controlPoints1).toEqual([
  //     [105, 55],
  //     // [155, 85],
  //     [155, 105],
  //   ]);

  //   controlPoints1 = router.findPath(startPoint1, endPoint1);
  //   expect(controlPoints1?.length).toBe(3);
  //   expect(controlPoints1).toEqual([
  //     [125, 55],
  //     [135, 65],
  //     [135, 105],
  //   ]);

  //   const startPoint2 = [105, 55];
  //   const endPoint2 = [395, 55];
  //   let controlPoints2 = router.findPath(startPoint2, endPoint2, { start: true, end: true });
  //   expect(controlPoints2).toEqual([
  //     [105, 55],
  //     [155, 55],
  //     [205, 105],
  //     [295, 105],
  //     [345, 55],
  //     [395, 55],
  //   ]);

  //   controlPoints2 = router.findPath(startPoint2, endPoint2);
  //   expect(controlPoints2).toEqual([
  //     [125, 55],
  //     [155, 55],
  //     [205, 105],
  //     [295, 105],
  //     [345, 55],
  //     [375, 55],
  //   ]);
  // });

  // it('Router with multi anchor should find shortest path.', () => {
  //   const gridComponent = new Grid(graph);
  //   const router = new Router(gridComponent, { allowDiagonal: 'always' });
  //   graph.add('node', {
  //     id: 'node1', width: 100, height: 30, x: 0, y: 0,
  //     anchors: [[0, 0.5], [0.5, 0], [0.5, 1], [1, 0.5],],
  //   });
  //   const node2 = graph.add('node', {
  //     id: 'node2', width: 100, height: 30, x: 0, y: 60,
  //     anchors: [[0, 0.5], [0.5, 0], [0.5, 1], [1, 0.5],],
  //   });
  //   const edge = graph.add('edge', { source: 'node1', target: 'node2' });
  //   gridComponent.refresh();
  //   router.updateEdgePath(edge);
  //   expect(edge.get('controlPoints')).toEqual([[0, 35], [0, 25]]);
  //   node2.configs.y = 40;
  //   node2.updatePosition();
  //   gridComponent.refresh();
  //   router.updateEdgePath(edge);
  //   expect(edge.get('controlPoints')).toEqual([[-70, 0], [-70, 40]]);
  // })

  it("bugfix: router with non anchor should work right", () => {
    const gridComponent = new Grid(graph);
    const router = new Router(gridComponent, { allowDiagonal: "never" });
    graph.data({ nodes: [], edges: [] });
    graph.add("node", {
      id: "node1",
      width: 100,
      height: 30,
      x: 0,
      y: 0,
      anchors: [
        [0, 0.5],
        [0.5, 0],
        [0.5, 1],
        [1, 0.5],
      ],
    });
    graph.add("node", {
      id: "node2",
      width: 100,
      height: 30,
      x: 30,
      y: 60,
    });
    const edge = graph.add("edge", { source: "node1", target: "node2" });
    gridComponent.refresh();
    router.updateEdgePath(edge);
    expect(edge.get("controlPoints")).toEqual([
      [0, 25],
      [22.5, 25],
      [22.5, 45],
    ]);
    const edgeConfigs = edge.getEdgeConfigs();
    expect(edgeConfigs.controlPoints).toEqual([
      [0, 25],
      [22.5, 25],
    ]);
    expect(edgeConfigs.startPoint).toEqual([0, 15]);
    expect(edgeConfigs.endPoint).toEqual([22.5, 45]);
    graph.destroy();
  });

  it("router should work for group", () => {
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      setDefaultNode() {
        return {
          width: 140,
          height: 40,
          anchors: [
            [0.5, 0],
            [0.5, 1],
          ],
        };
      },
      setDefaultGroup(groupData: any) {
        return {
          linkNode: true,
          titleSize: 36,
          padding: 20,
          title: {
            text: {
              text: groupData.id,
              fillStyle: "#626978",
            },
            background: {
              fillStyle: "#F0F3F6",
            },
          },
          anchors: [
            [0.5, 0],
            [0.5, 1],
          ],
        };
      },
    });
    const grid = new Grid(graph, {
      ignoreGroupTitle: false,
      step: 10,
      extraWidth: 5,
    });
    const router = new Router(grid, { minDist: 20 });
    graph.data({
      nodes: [
        { id: "1", x: 100, y: 300 },
        { id: "2", x: 300, y: 500 },
        { id: "3", x: 100, y: 0 },
      ],
      edges: [{ source: "1", target: "2", sourceAnchor: 1, targetAnchor: 0 }],
      groups: [{ id: "group1", children: ["1", "2"] }],
    });
    const titleBBox = graph.getGroups()[0].titleLayer?.getBBox();
    const [row, col] = grid.getIndexByCoord(
      titleBBox!.left + 10,
      titleBBox!.top + 10
    );
    expect(grid.isWalkable(row, col)).toBe(false);
    const edge = graph.getEdges()[0];
    // 分组内
    router.updateEdgePath(edge);
    expect(edge.get("controlPoints")).toEqual([
      [100, 460],
      [300, 460],
    ]);
    // 分组间，绕过分组标题
    const edge1 = graph.add("edge", {
      source: "1",
      target: "3",
      sourceAnchor: 0,
      targetAnchor: 1,
    });
    router.updateEdgePath(edge1);
    expect(edge1.get("controlPoints")).toEqual([
      [100, 270],
      [0, 270],
      [0, 40],
      [100, 40],
    ]);
    // 分组和节点
    const edge2 = graph.add("edge", {
      source: "group1",
      target: "3",
      sourceAnchor: 0,
      targetAnchor: 1,
    });
    router.updateEdgePath(edge2);
    expect(edge2.get("controlPoints")).toEqual([
      [200, 40],
      [100, 40],
    ]);

    graph.destroy();
  });
});
