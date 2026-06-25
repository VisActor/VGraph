import * as BezierUtils from "../../src/renderer/utils/bezier";
import { getDimAt, getLength } from "../../src/renderer/utils/cubic";

describe("src/utils/bezier", () => {
  it("length should work for quadratic", () => {
    let length = BezierUtils.length([
      {
        x: 100,
        y: 100,
      },
      {
        x: 200,
        y: 200,
      },
      {
        x: 300,
        y: 0,
      },
    ]);

    expect(Math.round(length)).toBe(274);

    length = BezierUtils.length([
      {
        x: -100,
        y: 100,
      },
      {
        x: -200,
        y: 200,
      },
      {
        x: -300,
        y: 0,
      },
    ]);

    expect(Math.round(length)).toBe(274);

    length = BezierUtils.length([
      {
        x: -100,
        y: -100,
      },
      {
        x: -200,
        y: 200,
      },
      {
        x: 300,
        y: 0,
      },
    ]);

    expect(Math.round(length)).toBe(572);
  });

  it("length should work for cubic", () => {
    let length = BezierUtils.length([
      {
        x: 100,
        y: 100,
      },
      {
        x: 200,
        y: 200,
      },
      {
        x: 300,
        y: 0,
      },
      {
        x: 400,
        y: 100,
      },
    ]);

    expect(Math.round(length)).toBe(327);

    length = BezierUtils.length([
      {
        x: -100,
        y: -100,
      },
      {
        x: -200,
        y: 200,
      },
      {
        x: 300,
        y: 0,
      },
      {
        x: -400,
        y: 100,
      },
    ]);

    expect(Math.round(length)).toBe(611);
  });

  it("extrema should work from quadratic", () => {
    const e = BezierUtils.extrema([
      {
        x: 100,
        y: 100,
      },
      {
        x: 200,
        y: 200,
      },
      {
        x: 300,
        y: 0,
      },
    ]);

    expect(e).toEqual([
      {
        x: 166.66666666666669,
        y: 133.33333333333334,
        t: 0.3333333333333333,
      },
    ]);
  });

  it("extrema should work for cubic", () => {
    const e = BezierUtils.extrema([
      {
        x: 100,
        y: 100,
      },
      {
        x: 200,
        y: 200,
      },
      {
        x: 300,
        y: 0,
      },
      {
        x: 400,
        y: 100,
      },
    ]);
    expect(e).toEqual([
      {
        x: 163.39745962155615,
        y: 128.86751345948127,
        t: 0.2113248654051871,
      },
      {
        x: 250,
        y: 100,
        t: 0.5,
      },
      {
        x: 336.6025403784439,
        y: 71.13248654051871,
        t: 0.7886751345948129,
      },
    ]);
  });
});
