import { Graph } from "../../src/graph";
import { Shape } from "../../src/renderer";
import { ForceDirectedLayout } from "../../src/layouts";
import { ForceDirectedGrouping } from "../../src/components/force_grouping";

// ForceDirectedLayout
// ForceDirectedGrouping

const defaultShapeStyles = {
  opacity: 0.05,
  fillStyle: "#cccccc",
  lineWidth: 2,
  strokeStyle: "#7f7f7f",
};

describe("ForceDirectedGrouping", () => {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);
  const data = {
    nodes: [
      {
        id: "0",
        groupType: 0,
        otherType: 1,
      },
      {
        id: "1",
        groupType: 1,
        otherType: 1,
      },
      {
        id: "2",
        groupType: 2,
        otherType: 2,
      },
      {
        id: "3",
        groupType: 3,
        otherType: 3,
      },
      {
        id: "4",
        groupType: 4,
        otherType: 2,
      },
    ],
    edges: [
      { source: "0", target: "2" },
      { source: "1", target: "2" },
      { source: "4", target: "3" },
      { source: "1", target: "3" },
      { source: "4", target: "2" },
      { source: "2", target: "3" },
    ],
  };
  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        width: 15,
        height: 15,
      };
    },
    setDefaultEdge(edgeData) {
      return {
        lineWidth: 1,
      };
    },
  });
  graph.data(data);

  it("init configure should work and setGetGroupValue should work", (done) => {
    const forceGrouping = new ForceDirectedGrouping({
      graph,
      options: {
        getGroupValue: (d) => d.groupType,
        extraPadding: 100,
      },
    });

    const groups = forceGrouping.getGroups();
    const group0 = forceGrouping.getGroup((v) => {
      return v === 0;
    });
    expect(group0).toStrictEqual({
      0: [data.nodes[0]],
    });
    const group12 = forceGrouping.getGroup((v) => v === 1 || v === 2);
    expect(group12).toStrictEqual({
      1: [data.nodes[1]],
      2: [data.nodes[2]],
    });
    expect(groups).toStrictEqual({
      0: [data.nodes[0]],
      1: [data.nodes[1]],
      2: [data.nodes[2]],
      3: [data.nodes[3]],
      4: [data.nodes[4]],
    });
    const shapes = Object.entries(forceGrouping.getAllGroupShapes()).map(
      (d) => d[1]
    );
    expect(shapes.length).toBe(5);
    expect(shapes[0].configs.opacity).toBe(defaultShapeStyles.opacity);
    expect(shapes[0].configs.fillStyle).toBe(defaultShapeStyles.fillStyle);
    expect(shapes[0].configs.lineWidth).toBe(defaultShapeStyles.lineWidth);
    expect(shapes[0].configs.strokeStyle).toBe(defaultShapeStyles.strokeStyle);
    expect(shapes[0].configs.groupValue).toBe(0);
    expect(shapes[1].configs.groupValue).toBe(1);
    expect(shapes[2].configs.groupValue).toBe(2);
    expect(shapes[3].configs.groupValue).toBe(3);
    expect(shapes[4].configs.groupValue).toBe(4);
    expect(shapes[4].configs.r).toBe(0);
    expect(shapes[4].configs.cx).toBe(0);
    expect(shapes[4].configs.cy).toBe(0);

    const fdp = new ForceDirectedLayout({
      graph,
      tickIterations: 10,
      maxIteration: 10,
      run: false,
      onEnd: () => {
        const groups = forceGrouping.getGroups();
        expect(groups).toStrictEqual({
          0: [data.nodes[0]],
          1: [data.nodes[1]],
          2: [data.nodes[2]],
          3: [data.nodes[3]],
          4: [data.nodes[4]],
        });
        expect(forceGrouping.dummyGroupNodes.length).toBe(5);
        forceGrouping.updateShapes();
        expect(shapes[4].configs.r).toBeGreaterThan(0);
        expect(Math.abs(shapes[4].configs.cx)).toBeGreaterThan(0);
        expect(Math.abs(shapes[4].configs.cy)).toBeGreaterThan(0);
        expect(forceGrouping.groupVelocity.getIteration()).toBe(10);
        expect(forceGrouping.dummyGroupNodes[0].r).toBeGreaterThan(0);
        expect(Math.abs(forceGrouping.dummyGroupNodes[0].vx)).toBeGreaterThan(
          0
        );
        expect(Math.abs(forceGrouping.dummyGroupNodes[0].vy)).toBeGreaterThan(
          0
        );
        expect(Math.abs(forceGrouping.dummyGroupNodes[4].vx)).toBeGreaterThan(
          0
        );
        expect(Math.abs(forceGrouping.dummyGroupNodes[4].vy)).toBeGreaterThan(
          0
        );

        forceGrouping.setGetGroupValue((nodeData) => nodeData.otherType);
        const groups2 = forceGrouping.getGroups();
        expect(groups2).toStrictEqual({
          1: [data.nodes[0], data.nodes[1]],
          2: [data.nodes[2], data.nodes[4]],
          3: [data.nodes[3]],
        });

        const nweShapes = Object.entries(forceGrouping.getAllGroupShapes()).map(
          (d) => d[1]
        );
        expect(nweShapes.length).toBe(3);
        expect(nweShapes[0].configs.r).toBe(0);
        expect(nweShapes[0].configs.cx).toBe(0);
        expect(nweShapes[0].configs.cy).toBe(0);
        forceGrouping.updateShapes(); // updateShapes should work
        expect(nweShapes[0].configs.r).toBeGreaterThan(0);
        expect(Math.abs(nweShapes[0].configs.cx)).toBeGreaterThan(0);
        expect(Math.abs(nweShapes[0].configs.cy)).toBeGreaterThan(0);

        done();
      },
    });
    const forces = fdp.getForces();
    forces.get("collide")!.iterationCallback = forceGrouping.groupVelocity;
    forceGrouping.groupVelocity.setThreshold(5);
    expect(forceGrouping.dummyGroupNodes.length).toBe(0);
    fdp.start();
  });
  describe("setOptions and config shapeStyle should work", () => {
    const color = ["#4c72b0", "#dd8452", "#25a868", "#c44e52", "#8172b3"];
    const forceGrouping = new ForceDirectedGrouping({
      graph,
      options: {
        getGroupValue: (d) => d.groupType,
        shapeStyles: (v) => {
          return {
            fillStyle: null,
            lineWidth: 4,
            strokeStyle: color[v],
            opacity: 1.0,
          };
        },
      },
    });
    const shapes = Object.entries(
      forceGrouping.getGroupShapes((v) => v === 0 || v === 3)
    ).map((d) => d[1]) as Shape[];
    it("config shapeStyle should work", () => {
      expect(shapes.length).toBe(2);
      expect(shapes[0].get("strokeStyle")).toBe(color[0]);
      expect(shapes[0].get("lineWidth")).toBe(4);
      expect(shapes[0].get("opacity")).toBe(1.0);
      expect(shapes[1].get("strokeStyle")).toBe(color[3]);
      expect(shapes[1].get("fillStyle")).toBeNull();
    });

    it("change shapeStyle should work", () => {
      forceGrouping.setOptions({
        shapeStyles: (v) => {
          return {
            fillStyle: color[v + 1],
            opacity: 0.2,
          };
        },
      });
      const shapesMap = forceGrouping.getGroupShapes((v) => v >= 1);
      const shape = shapesMap[1] as Shape;
      expect(shapes[0].destroyed);
      expect(shape.get("fillStyle")).toBe(color[2]);
      expect(shape.get("strokeStyle")).toBe(defaultShapeStyles.strokeStyle);
      expect(shape.get("lineWidth")).toBe(defaultShapeStyles.lineWidth);
      expect(shape.get("opacity")).toBe(0.2);
    });

    it("hideShape and showShape should work", () => {
      const shapesMap = forceGrouping.getGroupShapes((v) => v >= 1);
      const shape = shapesMap[1] as Shape;
      expect(shape.capture);
      expect(shape.visible);
      forceGrouping.hideShape((v) => v === 1);
      expect(!shape.visible);
      expect(shapesMap[2].visible);
      forceGrouping.showShape((v) => v === 1);
      expect(shape.visible);
      expect(shapesMap[2].visible);
    });

    it("updateOptions should work", () => {
      expect(forceGrouping.options.extraPadding).toBe(10);
      expect(forceGrouping.options.shapeDraggable);
      forceGrouping.setOptions({
        extraPadding: 100,
        shapeDraggable: false,
      });
      expect(forceGrouping.options.extraPadding).toBe(100);
      expect(!forceGrouping.options.shapeDraggable);
    });
  });
  describe("updateData should work", () => {
    const graphDiv = document.createElement("div");
    document.body.append(graphDiv);
    const data1 = {
      nodes: [
        {
          id: "0",
          groupType: 0,
          otherType: 1,
        },
        {
          id: "1",
          groupType: 1,
          otherType: 1,
        },
        {
          id: "2",
          groupType: 2,
          otherType: 2,
        },
        {
          id: "3",
          groupType: 3,
          otherType: 3,
        },
        {
          id: "4",
          groupType: 4,
          otherType: 2,
        },
      ],
      edges: [
        { source: "0", target: "2" },
        { source: "1", target: "2" },
        { source: "4", target: "3" },
        { source: "1", target: "3" },
        { source: "4", target: "2" },
        { source: "2", target: "3" },
      ],
    };
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      minRatio: 0.2,
      maxRatio: 8,
      linkCenter: true,
      setDefaultNode(node) {
        return {
          width: 15,
          height: 15,
        };
      },
      setDefaultEdge(edgeData) {
        return {
          lineWidth: 1,
        };
      },
    });
    const newData = {
      nodes: [
        {
          id: "0",
          groupType: "x",
          otherType: 1,
        },
        {
          id: "2",
          groupType: "y",
          otherType: 1,
        },
        {
          id: "4",
          groupType: 1,
          otherType: 2,
        },
        {
          id: "8",
          groupType: 3,
          otherType: 3,
        },
        {
          id: "6",
          groupType: "z",
          otherType: 2,
        },
      ],
      edges: [
        { source: "0", target: "2" },
        { source: "2", target: "8" },
        { source: "4", target: "4" },
        { source: "6", target: "0" },
        { source: "8", target: "2" },
        { source: "2", target: "6" },
      ],
    };
    graph.data(data1);
    const fdGrouping = new ForceDirectedGrouping({
      graph: graph,
      options: {
        getGroupValue: (d) => d.groupType,
      },
    });
    let groups = fdGrouping.getGroups();
    let group0 = fdGrouping.getGroup((v) => {
      return v === 0;
    });
    expect(group0).toStrictEqual({
      0: [data1.nodes[0]],
    });
    expect(groups).toStrictEqual({
      0: [data1.nodes[0]],
      1: [data1.nodes[1]],
      2: [data1.nodes[2]],
      3: [data1.nodes[3]],
      4: [data1.nodes[4]],
    });
    let shapes = Object.entries(
      fdGrouping.getGroupShapes((v) => v === 0 || v === 3)
    ).map((d) => d[1]) as Shape[];
    expect(shapes.length).toBe(2);
    expect(shapes[0].capture);
    expect(shapes[0].visible);
    expect(shapes[1].capture);
    expect(shapes[1].visible);

    graph.updateData(newData);
    fdGrouping.updateData(graph);
    const nodeMap = graph.getNodeMap();
    groups = fdGrouping.getGroups();
    group0 = fdGrouping.getGroup((v) => {
      return v === "x";
    });
    expect(group0).toStrictEqual({
      x: [nodeMap["0"].configs],
    });
    expect(groups).toStrictEqual({
      x: [nodeMap["0"].configs],
      y: [nodeMap["2"].configs],
      1: [nodeMap["4"].configs],
      3: [nodeMap["8"].configs],
      z: [nodeMap["6"].configs],
    });

    shapes = Object.entries(
      fdGrouping.getGroupShapes((v) => v === 0 || v === 3)
    ).map((d) => d[1]) as Shape[];
    // 1 不存在 只有 3 存在
    expect(shapes.length).toBe(1);
    expect(shapes[0].capture);
    expect(shapes[0].visible);
    expect(shapes[0].get("groupValue")).toBe(3);
    expect(shapes[0].get("lineWidth")).toBe(defaultShapeStyles.lineWidth);
    expect(shapes[0].get("opacity")).toBe(defaultShapeStyles.opacity);
  });
});
