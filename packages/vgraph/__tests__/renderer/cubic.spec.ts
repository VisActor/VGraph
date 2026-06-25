import { Cubic } from "../../src/renderer/shapes/cubic";

describe("src/shapes/cubic.ts", () => {
  const cubic1 = new Cubic({
    strokeStyle: "#ccc",
    points: [
      [100, 100],
      [150, 200],
      [200, 0],
      [300, 100],
    ],
  });

  const cubic2 = new Cubic({
    strokeStyle: "#ccc",
    points: [
      [50, 160],
      [100, 160],
      [150, 250],
      [250, 250],
    ],
  });

  it("getPointAt should work", () => {
    let point = cubic1.getPointAt(0);
    expect(point).toEqual({ x: 100, y: 100 });
    point = cubic1.getPointAt(1);
    expect(point).toEqual({ x: 300, y: 100 });
    point = cubic1.getPointAt(0.2);
    expect(point).toEqual({ x: 130.4, y: 128.80000000000004 });
  });

  it("getBBox should work", () => {
    expect(cubic1.getBBox()).toEqual({
      left: 99.5,
      top: 70.63248654051871,
      width: 201,
      height: 58.73502691896256,
    });

    expect(cubic2.getBBox()).toEqual({
      left: 49.5,
      top: 159.5,
      width: 201,
      height: 91,
    });
  });

  it("getLength should work", () => {
    expect(cubic1.getLength()).toBe(238.34373279025843);
    expect(cubic1.getLength(32)).toBe(238.43935816193476);
    expect(cubic2.getLength()).toBe(223.5449602569252);
    expect(cubic2.getLength(12)).toBe(223.44284567253075);
  });

  it("bugfix: update points will refresh startRad & endRad", () => {
    expect(cubic1.getStartRad()).toEqual({
      x: -0.5716764467598454,
      y: -0.8204791528247611,
      rad: -2.1793439843758646,
    });
    expect(cubic1.getEndRad()).toEqual({
      x: 0.7974790334261178,
      y: 0.6033466592645931,
      rad: 0.6476910284085816,
    });
    cubic1.set("points", [
      [50, 160],
      [100, 160],
      [150, 250],
      [250, 250],
    ]);
    expect(cubic1.getStartRad()).toEqual({
      rad: -2.9756898285051654,
      x: -0.9862696622304793,
      y: -0.16514282716417397,
    });
    expect(cubic1.getEndRad()).toEqual({
      rad: 0.08803804022165652,
      x: 0.9961271541444007,
      y: 0.08792435826423374,
    });
  });
});
