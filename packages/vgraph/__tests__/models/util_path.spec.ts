import { NodeLayer } from "../../src";
import {
  getCurveLoopAnchors,
  getLoopControlPoints,
} from "../../src/models/factories/path";

describe("./utils/path.ts", () => {
  const node = new NodeLayer({
    x: 200,
    y: 300,
    width: 100,
    height: 80,
  });
  it("top getLoopAnchor should work", () => {
    const { startPoint, endPoint } = getCurveLoopAnchors(node, {
      loop: {
        position: "top",
      },
    });
    expect(startPoint).toEqual([183.4314575050762, 260]);
    expect(endPoint).toEqual([216.5685424949238, 260]);

    const reverse = getCurveLoopAnchors(node, {
      loop: {
        position: "top",
        clockwise: false,
      },
    });
    expect(reverse.startPoint).toEqual([216.5685424949238, 260]);
    expect(reverse.endPoint).toEqual([183.4314575050762, 260]);
  });

  it("bottom getLoopAnchor should work", () => {
    const { startPoint, endPoint } = getCurveLoopAnchors(node, {
      loop: {
        position: "bottom",
      },
    });
    expect(startPoint).toEqual([216.5685424949238, 340]);
    expect(endPoint).toEqual([183.4314575050762, 340]);

    const reverse = getCurveLoopAnchors(node, {
      loop: {
        position: "bottom",
        clockwise: false,
      },
    });
    expect(reverse.startPoint).toEqual([183.4314575050762, 340]);
    expect(reverse.endPoint).toEqual([216.5685424949238, 340]);
  });

  it("left getLoopAnchor should work", () => {
    const { startPoint, endPoint } = getCurveLoopAnchors(node, {
      loop: {
        position: "left",
      },
    });
    expect(startPoint).toEqual([150, 320.71067811865476]);
    expect(endPoint).toEqual([150, 279.28932188134524]);

    const reverse = getCurveLoopAnchors(node, {
      loop: {
        position: "left",
        clockwise: false,
      },
    });
    expect(reverse.startPoint).toEqual([150, 279.28932188134524]);
    expect(reverse.endPoint).toEqual([150, 320.71067811865476]);
  });

  it("right getLoopAnchor should work", () => {
    const { startPoint, endPoint } = getCurveLoopAnchors(node, {
      loop: {
        position: "right",
      },
    });
    expect(startPoint).toEqual([250, 279.28932188134524]);
    expect(endPoint).toEqual([250, 320.71067811865476]);

    const reverse = getCurveLoopAnchors(node, {
      loop: {
        position: "right",
        clockwise: false,
      },
    });
    expect(reverse.startPoint).toEqual([250, 320.71067811865476]);
    expect(reverse.endPoint).toEqual([250, 279.28932188134524]);
  });

  it("getLoopAnchor should work for circle", () => {
    const circleNode = new NodeLayer({
      x: 200,
      y: 300,
      width: 100,
      height: 100,
    });
    const right = getCurveLoopAnchors(circleNode, {
      type: "circle",
      loop: {
        position: "right",
        clockwise: false,
      },
    });

    expect(right.startPoint).toEqual([246.19397662556435, 319.13417161825447]);
    expect(right.endPoint).toEqual([246.19397662556435, 280.86582838174553]);

    const top = getCurveLoopAnchors(circleNode, {
      type: "circle",
      loop: {
        position: "top",
        clockwise: false,
      },
    });

    expect(top.startPoint).toEqual([219.1341716182545, 246.19397662556435]);
    expect(top.endPoint).toEqual([180.8658283817455, 246.19397662556435]);
  });

  it("top getLoopControlPoints should work", () => {
    const loopConfigs = {
      position: "top",
    };
    const { startPoint, endPoint } = getCurveLoopAnchors(node, {
      loop: loopConfigs,
    });
    const [cp1, cp2] = getLoopControlPoints(node, {
      startPoint,
      endPoint,
      loop: loopConfigs,
    });
    expect(cp1).toEqual([150.2943725152286, 180]);
    expect(cp2).toEqual([249.7056274847714, 180]);
  });

  it("right getLoopControlPoints should work", () => {
    const loopConfigs = {
      position: "right",
      dist: 80,
    };
    const { startPoint, endPoint } = getCurveLoopAnchors(node, {
      loop: loopConfigs,
    });
    const [cp1, cp2] = getLoopControlPoints(node, {
      startPoint,
      endPoint,
      loop: loopConfigs,
    });
    expect(cp1).toEqual([330, 246.15223689149764]);
    expect(cp2).toEqual([330, 353.84776310850236]);
  });
});
