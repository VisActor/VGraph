import { Graph } from "../../src/graph";
import { AStarFinder } from "../../src/components/utils/pathfinder/astar";
import { Grid } from "../../src/components/grid";
import { compressPath, convertPath } from "../../src/components/utils/path";

describe("algorithms/PathFinder", function () {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);
  const graph = new Graph({
    container: graphDiv,
    width: 10,
    height: 10,
  });
  it("AStar PathFinder with default options should work", () => {
    const gridComponent = new Grid(graph);
    const GridBox = {
      left: 0,
      top: 0,
      width: 1600,
      height: 1200,
    };
    gridComponent.resetMap(GridBox);
    gridComponent.addBBox({ left: 0, top: 0, width: 100, height: 100 });
    gridComponent.addBBox({ left: 200, top: 0, width: 100, height: 100 });
    gridComponent.addBBox({ left: 400, top: 0, width: 100, height: 100 });
    const finder = new AStarFinder();
    const startPoint1 = [105, 55];
    const endPoint1 = [155, 105];
    const { left, top, step } = gridComponent.gridData;
    const path1 = compressPath(
      finder.findPath(startPoint1, endPoint1, gridComponent.gridData)
    );
    const controlPoints1 = convertPath(left, top, step, path1);
    expect(controlPoints1?.length).toBe(2);
    let [col, row] = gridComponent.getIndexByCoord(
      startPoint1[0],
      startPoint1[1]
    );
    expect(path1).toEqual([
      [col, row],
      [col + 5, row + 5],
    ]);
    expect(controlPoints1).toEqual([
      [105, 55],
      [155, 105],
    ]);

    const startPoint2 = [105, 55];
    const endPoint2 = [395, 55];
    const path2 = compressPath(
      finder.findPath(startPoint2, endPoint2, gridComponent.gridData)
    );
    const controlPoints2 = convertPath(left, top, step, path2);
    [col, row] = gridComponent.getIndexByCoord(startPoint2[0], startPoint2[1]);
    expect(controlPoints2?.length).toBe(6);
    expect(path2).toEqual([
      [col, row],
      [col + 5, row],
      [col + 10, row + 5],
      [col + 19, row + 5],
      [col + 24, row],
      [col + 29, row],
    ]);
    expect(controlPoints2).toEqual([
      [105, 55],
      [155, 55],
      [205, 105],
      [295, 105],
      [345, 55],
      [395, 55],
    ]);
  });

  it("AStar PathFinder with never diagonal should work", () => {
    const gridComponent = new Grid(graph);
    const GridBox = {
      left: 0,
      top: 0,
      width: 1600,
      height: 1200,
    };
    gridComponent.resetMap(GridBox);

    gridComponent.addBBox({ left: 0, top: 0, width: 100, height: 100 });
    gridComponent.addBBox({ left: 200, top: 0, width: 100, height: 100 });
    gridComponent.addBBox({ left: 400, top: 0, width: 100, height: 100 });
    const finder = new AStarFinder({ allowDiagonal: "never" });
    const startPoint1 = [105, 55];
    const endPoint1 = [155, 105];
    const { left, top, step } = gridComponent.gridData;
    const path1 = compressPath(
      finder.findPath(startPoint1, endPoint1, gridComponent.gridData)
    );
    const controlPoints1 = convertPath(left, top, step, path1);
    expect(controlPoints1?.length).toBe(6);
    expect(controlPoints1).toEqual([
      [105, 55],
      [105, 75],
      [115, 75],
      [115, 95],
      [155, 95],
      [155, 105],
    ]);

    const startPoint2 = [105, 55];
    const endPoint2 = [395, 55];
    const path2 = compressPath(
      finder.findPath(startPoint2, endPoint2, gridComponent.gridData)
    );
    const controlPoints2 = convertPath(left, top, step, path2);
    expect(controlPoints2?.length).toBe(6);

    expect(controlPoints2).toEqual([
      [105, 55],
      [195, 55],
      [195, 105],
      [305, 105],
      [305, 55],
      [395, 55],
    ]);
  });
  it("AStar PathFinder with lessDiversion should work", () => {
    const gridComponent = new Grid(graph);
    const GridBox = {
      left: 0,
      top: 0,
      width: 1600,
      height: 1200,
    };
    gridComponent.resetMap(GridBox);

    gridComponent.addBBox({ left: 0, top: 0, width: 100, height: 100 });
    gridComponent.addBBox({ left: 200, top: 0, width: 100, height: 100 });
    gridComponent.addBBox({ left: 400, top: 0, width: 100, height: 100 });
    const finder1 = new AStarFinder({ lessDiversion: true });
    const startPoint1 = [105, 55];
    const endPoint1 = [155, 105];
    const { left, top, step } = gridComponent.gridData;
    const path1 = compressPath(
      finder1.findPath(startPoint1, endPoint1, gridComponent.gridData)
    );
    const controlPoints1 = convertPath(left, top, step, path1);
    expect(controlPoints1?.length).toBe(2);
    expect(controlPoints1).toEqual([
      [105, 55],
      [155, 105],
    ]);

    const startPoint2 = [105, 55];
    const endPoint2 = [395, 55];
    const path2 = compressPath(
      finder1.findPath(startPoint2, endPoint2, gridComponent.gridData)
    );
    const controlPoints2 = convertPath(left, top, step, path2);
    expect(controlPoints2?.length).toBe(6);
    expect(controlPoints2).toEqual([
      [105, 55],
      [155, 55],
      [205, 105],
      [295, 105],
      [345, 55],
      [395, 55],
    ]);
    const finder2 = new AStarFinder({
      allowDiagonal: "never",
      lessDiversion: true,
    });
    const startPoint3 = [105, 55];
    const endPoint3 = [155, 105];
    const path3 = compressPath(
      finder2.findPath(startPoint3, endPoint3, gridComponent.gridData)
    );
    const controlPoints3 = convertPath(left, top, step, path3);
    expect(controlPoints3?.length).toBe(3);
    expect(controlPoints3).toEqual([
      [105, 55],
      [155, 55],
      [155, 105],
    ]);
    const startPoint4 = [105, 55];
    const endPoint4 = [395, 55];
    const path4 = compressPath(
      finder2.findPath(startPoint4, endPoint4, gridComponent.gridData)
    );
    const controlPoints4 = convertPath(left, top, step, path4);
    expect(controlPoints4?.length).toBe(5);
    expect(controlPoints4).toEqual([
      [105, 55],
      [195, 55],
      [195, 105],
      [395, 105],
      [395, 55],
    ]);
  });
});
