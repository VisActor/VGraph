import { Graph } from "../../src/graph";
import { FisheyePlugin } from "../../src/components";

describe("fisheye should work", () => {
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
  it("default fisheye should work", () => {
    const fisheye = new FisheyePlugin(graph, {});

    expect(fisheye.shape).not.toBe(null);
    expect(fisheye.shape!.type).toBe("circle");
    expect(fisheye.shape!.get("r")).toBe(0);
    expect(fisheye.shape!.get("fillStyle")).toBe("#AAA");
    expect(fisheye.shape!.get("opacity")).toBe(0.2);

    fisheye.onMove(100, 100);
    expect(fisheye.shape!.get("r")).toBe(120);
    expect(fisheye.shape!.getMatrix()).toEqual([1, 0, 0, 1, 100, 100]);

    fisheye.disable();
    fisheye.onMove(200, 200);
    expect(fisheye.shape!.get("r")).toBe(120);
    expect(fisheye.shape!.getMatrix()).toEqual([1, 0, 0, 1, 100, 100]);

    fisheye.enable();
    fisheye.onMove(200, 200);
    expect(fisheye.shape!.get("r")).toBe(120);
    expect(fisheye.shape!.getMatrix()).toEqual([1, 0, 0, 1, 200, 200]);

    fisheye.destroy();
  });

  it("custom fisheye should work", () => {
    const fisheye = new FisheyePlugin(graph, {
      inEyeR: 200,
      bkgShape: {
        fillStyle: "#f50",
      },
    });

    expect(fisheye.shape).not.toBe(null);
    expect(fisheye.shape!.type).toBe("circle");
    expect(fisheye.shape!.get("r")).toBe(0);
    expect(fisheye.shape!.get("fillStyle")).toBe("#f50");
    expect(fisheye.shape!.get("opacity")).toBe(0.2);

    fisheye.onMove(100, 100);
    expect(fisheye.shape!.get("r")).toBe(200);
    expect(fisheye.shape!.getMatrix()).toEqual([1, 0, 0, 1, 100, 100]);

    fisheye.updateOption("bkgShape", null);
    expect(fisheye.shape).toBe(null);

    fisheye.destroy();
  });

  it("canvas coordinate fisheye should update on transform and option changes", () => {
    const fisheye = new FisheyePlugin(graph, {
      coordinateSystem: "canvas",
      showLabel: "none",
      isSetState: true,
      isScaling: true,
      inEyeR: 80,
      r: 160,
    });

    graph.scale(2);
    graph.emit("transformed", { type: "scale", ratio: 2 });

    expect(fisheye.shape!.get("r")).toBe(40);
    graph.getNodes().forEach((node) => {
      expect(node.configs.fisheye).toBeDefined();
      expect(node.hasState("inEye") || node.hasState("outEye")).toBe(true);
    });

    fisheye.updateOption("distortion", 5);
    expect(fisheye.fisheye.getDistortion()).toBe(5);
    fisheye.updateOption("r", 120);
    expect(fisheye.fisheye.getRadius()).toBe(120);
    fisheye.updateOption("inEyeR", 60);
    expect(fisheye.fisheye.getInEyeRadius()).toBe(60);

    fisheye.stop();
    fisheye.onMove(300, 300);
    expect(fisheye.isEnable).toBe(false);

    fisheye.destroy();
    graph.resetMatrix();
  });
});
