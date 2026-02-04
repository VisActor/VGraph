import {
  getCharLen,
  measureText,
  getFontByConfigs,
} from "../../src/renderer/utils/text";
import { getGradient } from "../../src/renderer/utils/gradients";
import { Rect, Text, Path, Cubic, Quadratic } from "../../src";
import { isPointInPolygon } from "../../src/renderer/utils/polygon";
import {
  getArrowBorder,
  getArrowPoints,
  isPointOnSimpleArrow,
  getArrowByLineWidth,
} from "../../src/renderer/utils/arrow";
import * as IntersectUtil from "../../src/renderer/utils/intersect";

const OS_PLATFORM = process.platform;

function expectValueBySystem(
  value: number,
  macValue: number,
  winValue: number
) {
  if (OS_PLATFORM === "linux") {
    expect(value).toBe(winValue);
  } else {
    expect(value).toBe(macValue);
  }
}

describe("src/utils/text.ts", () => {
  const text = new Text({
    x: 0,
    y: 0,
    text: "",
    fontSize: 12,
    lineHeight: 14,
  });
  it("getCharLen should work", () => {
    let font = getFontByConfigs(text.configs);
    // jest 跑在 jsdom 环境下，canvas 是模拟出来的，实际效果每个文字宽度不同
    let charLen = getCharLen("1", font);

    expectValueBySystem(charLen, 7, 8);

    charLen = getCharLen("2", font);
    expectValueBySystem(charLen, 7, 8);
    text.set("fontSize", 14);
    font = getFontByConfigs(text.configs);
    charLen = getCharLen("a", font);
    expectValueBySystem(charLen, 8, 9);
    charLen = getCharLen("是", font);
    expectValueBySystem(charLen, 14, 17);
  });

  it("measureText should work", () => {
    let textLen = measureText("123123", text.configs);
    expectValueBySystem(textLen, 48, 54);
    textLen = measureText("阿萨德", text.configs);
    expectValueBySystem(textLen, 42, 51);
    text.set("fontSize", 16);
    textLen = measureText("123123", text.configs);
    expectValueBySystem(textLen, 54, 60);
    textLen = measureText("阿萨德", text.configs);
    expectValueBySystem(textLen, 48, 51);
  });
});

describe("src/utils/gradients", () => {
  it("parseLinearGradient should work", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const rect = new Rect({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });
    const gradient = getGradient(
      "l(0) 0:#fff 0.5:#7ec2f3 1:#1890ff",
      rect,
      ctx
    );
    expect(gradient === rect["l(0) 0:#fff 0.5:#7ec2f3 1:#1890ff"]);
  });

  it("parseRadialGradient should work", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const rect = new Rect({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });
    const gradient = getGradient(
      "r(0.5,0.5,0) 0:#fff 0.5:#7ec2f3 1:#1890ff",
      rect,
      ctx
    );
    expect(gradient === rect["r(0.5,0.5,0) 0:#fff 0.5:#7ec2f3 1:#1890ff"]);
    const gradient1 = getGradient(
      "l(0) 0:rgb(255, 0, 100) 0.5:blue 1:#1890ff",
      rect,
      ctx
    );
    expect(gradient1 === rect["l(0) 0:rgb(255, 0, 100) 0.5:blue 1:#1890ff"]);
  });
});

describe("src/utils/polygon", () => {
  it("isPointInPolygon should work", () => {
    // 凸多边形
    //    1----  4
    //    |    \
    //    | 2   \
    // 6  |   3  \  5
    //    |      /
    //    |     /
    //    |    /
    //    -----
    const convexPolygon = [
      [0, 0],
      [50, 0],
      [100, 50],
      [50, 100],
      [0, 100],
    ];
    expect(isPointInPolygon([25, 25], convexPolygon)).toBe(true);
    expect(isPointInPolygon([0, 0], convexPolygon)).toBe(true);
    expect(isPointInPolygon([50, 50], convexPolygon)).toBe(true);
    expect(isPointInPolygon([100, 0], convexPolygon)).toBe(false);
    expect(isPointInPolygon([150, 50], convexPolygon)).toBe(false);
    expect(isPointInPolygon([-50, 50], convexPolygon)).toBe(false);
    // 凹多边形
    //    1\ 3  /|    7
    //    | \  / 5
    //    |2 \/ 4|-----
    //    |           |
    //    |           |
    //    |   -----   |
    //    |   |   |   |
    //    |   |   |   |
    // 8  ----- 6 -----
    const concavePolygon = [
      [0, 0],
      [50, 50],
      [100, 0],
      [100, 50],
      [150, 50],
      [150, 150],
      [100, 150],
      [100, 100],
      [50, 100],
      [50, 150],
      [0, 150],
    ];
    expect(isPointInPolygon([0, 0], concavePolygon)).toBe(true);
    expect(isPointInPolygon([25, 50], concavePolygon)).toBe(true);
    expect(isPointInPolygon([50, 0], concavePolygon)).toBe(false);
    expect(isPointInPolygon([75, 50], concavePolygon)).toBe(true);
    expect(isPointInPolygon([25, 100], concavePolygon)).toBe(true);
    expect(isPointInPolygon([75, 150], concavePolygon)).toBe(false);
    expect(isPointInPolygon([150, 0], concavePolygon)).toBe(false);
    expect(isPointInPolygon([-50, 150], concavePolygon)).toBe(false);
  });
});

describe("src/utils/arrow", () => {
  it("getArrowPoints should work", () => {
    const toPrecision = (points: number[][]) =>
      points.map(([x, y]) => [x.toFixed(10), y.toFixed(10)]); // 保留十位小数，忽略精度丢失
    expect(
      toPrecision(
        getArrowPoints(
          Math.PI / 8,
          [50 + Math.cos(Math.PI / 8), 50 + Math.sin(Math.PI / 8)],
          5,
          Math.PI / 4
        )
      )
    ).toEqual(
      toPrecision([
        [50 - Math.sqrt(8), 50 - Math.sqrt(8)],
        [50, 50],
        [46, 50],
      ])
    );
    expect(
      toPrecision(getArrowPoints(Math.PI / 2, [0, 50], 4, Math.PI / 4))
    ).toEqual(
      toPrecision([
        [Math.sin(Math.PI / 8) * 3, 49 - Math.cos(Math.PI / 8) * 3],
        [0, 49],
        [-Math.sin(Math.PI / 8) * 3, 49 - Math.cos(Math.PI / 8) * 3],
      ])
    );
  });
  it("getArrowBorder should work", () => {
    const toPrecision = (points: number[][]) =>
      points.map(([x, y]) => [x.toFixed(10), y.toFixed(10)]); // 保留十位小数，忽略精度丢失
    expect(
      toPrecision(getArrowBorder(Math.PI / 8, [50, 50], 4, Math.PI / 4))
    ).toEqual(
      toPrecision([
        [50 - Math.sqrt(8), 50 - Math.sqrt(8)],
        [50, 50],
        [46, 50],
      ])
    );
    expect(
      toPrecision(getArrowBorder(Math.PI / 2, [0, 50], 4, Math.PI / 4))
    ).toEqual(
      toPrecision([
        [Math.sin(Math.PI / 8) * 4, 50 - Math.cos(Math.PI / 8) * 4],
        [0, 50],
        [-Math.sin(Math.PI / 8) * 4, 50 - Math.cos(Math.PI / 8) * 4],
      ])
    );
  });
  it("isPointOnSimpleArrow should work", () => {
    const arrow1 = [
      [0, 0],
      [50, 50],
      [100, 0],
    ];
    expect(isPointOnSimpleArrow([25, 25], arrow1)).toBe(true);
    expect(isPointOnSimpleArrow([25, 50], arrow1)).toBe(false);
    expect(isPointOnSimpleArrow([50, 25], arrow1)).toBe(true);
    const arrow2 = getArrowBorder(Math.PI / 8, [50, 50], 5, Math.PI / 4);
    expect(isPointOnSimpleArrow([48, 48], arrow2)).toBe(true);
    expect(isPointOnSimpleArrow([48, 51], arrow2)).toBe(false);
    expect(isPointOnSimpleArrow([45, 45], arrow2)).toBe(false);
  });

  it("getArrowByLineWidth should work", () => {
    expect(getArrowByLineWidth(1, true).width).toBe(6);
    expect(getArrowByLineWidth(1, true).height).toBe(10);

    expect(getArrowByLineWidth(8, true).width).toBe(8);
    expect(getArrowByLineWidth(8, true).height).toBe(12);

    expect(
      getArrowByLineWidth(8, {
        width: 4,
        height: 6,
      }).width
    ).toBe(4);
    expect(
      getArrowByLineWidth(8, {
        width: 4,
        height: 6,
      }).height
    ).toBe(6);

    expect(
      getArrowByLineWidth(8, {
        height: 6,
      }).width
    ).toBe(8);
    expect(
      getArrowByLineWidth(8, {
        height: 6,
      }).height
    ).toBe(6);

    expect(
      getArrowByLineWidth(8, {
        width: 5,
      }).width
    ).toBe(5);
    expect(
      getArrowByLineWidth(8, {
        width: 5,
      }).height
    ).toBe(9);
  });
});

describe("src/utils/intersect", () => {
  const bbox = {
    left: 100,
    top: 100,
    width: 100,
    height: 100,
  };

  it("point intersect should work", () => {
    expect(IntersectUtil.isPointIntersect({ x: 0, y: 0 }, bbox)).toBe(false);
    expect(IntersectUtil.isPointIntersect({ x: 300, y: 0 }, bbox)).toBe(false);
    expect(IntersectUtil.isPointIntersect({ x: 100, y: 0 }, bbox)).toBe(false);
    expect(IntersectUtil.isPointIntersect({ x: 0, y: 300 }, bbox)).toBe(false);
    expect(IntersectUtil.isPointIntersect({ x: 0, y: 100 }, bbox)).toBe(false);
    expect(IntersectUtil.isPointIntersect({ x: 120, y: 120 }, bbox)).toBe(true);
    expect(IntersectUtil.isPointIntersect({ x: 180, y: 120 }, bbox)).toBe(true);
  });

  it("rect intersect should work", () => {
    expect(
      IntersectUtil.isRectIntersect(bbox, {
        left: 50,
        top: 50,
        width: 40,
        height: 40,
      })
    ).toBe(false);
    expect(
      IntersectUtil.isRectIntersect(
        {
          left: 50,
          top: 50,
          width: 40,
          height: 40,
        },
        bbox
      )
    ).toBe(false);
    expect(
      IntersectUtil.isRectIntersect(bbox, {
        left: 50,
        top: 50,
        width: 60,
        height: 40,
      })
    ).toBe(false);
    expect(
      IntersectUtil.isRectIntersect(
        {
          left: 50,
          top: 50,
          width: 60,
          height: 40,
        },
        bbox
      )
    ).toBe(false);
    expect(
      IntersectUtil.isRectIntersect(
        {
          left: 50,
          top: 50,
          width: 60,
          height: 60,
        },
        bbox
      )
    ).toBe(true);
    expect(
      IntersectUtil.isRectIntersect(
        {
          left: 180,
          top: 180,
          width: 60,
          height: 60,
        },
        bbox
      )
    ).toBe(true);
  });

  it("path intersect should work with path", () => {
    const path = new Path({
      strokeStyle: "#ccc",
      lineWidth: 1,
      path: [
        ["M", 98, 98],
        ["L", 300, 98],
      ],
    });

    expect(IntersectUtil.isPathIntersect(path, bbox)).toBe(false);
    path.set("lineWidth", 6);
    expect(IntersectUtil.isPathIntersect(path, bbox)).toBe(true);

    path.set("path", [
      ["M", 90, 90],
      ["A", 25, 25, 0, 1, 0, 140, 90],
    ]);
    expect(IntersectUtil.isPathIntersect(path, bbox)).toBe(true);

    path.set("path", [
      ["M", 40, 90],
      ["A", 25, 25, 0, 1, 0, 90, 90],
    ]);
    expect(IntersectUtil.isPathIntersect(path, bbox)).toBe(false);
    path.destroy();
  });

  it("path intersect should work with cubic", () => {
    const cubic = new Cubic({
      strokeStyle: "#ccc",
      points: [
        [90, 90],
        [150, 200],
        [200, 0],
        [300, 100],
      ],
    });
    expect(IntersectUtil.isPathIntersect(cubic, bbox)).toBe(true);

    cubic.set("points", [
      [48, 68],
      [150, 48],
      [180, 109],
      [250, 98],
    ]);
    expect(IntersectUtil.isPathIntersect(cubic, bbox)).toBe(false);
  });

  it("path intersect should work with quadratic", () => {
    const quad = new Quadratic({
      strokeStyle: "#ccc",
      points: [
        [98, 98],
        [150, 200],
        [198, 98],
      ],
    });
    expect(IntersectUtil.isPathIntersect(quad, bbox)).toBe(true);

    quad.set("points", [
      [98, 98],
      [150, 48],
      [198, 98],
    ]);
    expect(IntersectUtil.isPathIntersect(quad, bbox)).toBe(false);
  });

  it("getRectIntersect should work", () => {
    const bbox = {
      left: 50,
      top: 50,
      width: 20,
      height: 20,
    };
    expect(IntersectUtil.getRectIntersect(bbox, [60, 0])).toEqual([60, 50]);
    expect(IntersectUtil.getRectIntersect(bbox, [0, 60])).toEqual([50, 60]);
    expect(IntersectUtil.getRectIntersect(bbox, [60, 100])).toEqual([60, 70]);
    expect(IntersectUtil.getRectIntersect(bbox, [100, 60])).toEqual([70, 60]);
    expect(IntersectUtil.getRectIntersect(bbox, [0, 0], 2)).toEqual([50, 50]);
    expect(IntersectUtil.getRectIntersect(bbox, [0, 120], 4)).toEqual([50, 70]);
    expect(IntersectUtil.getRectIntersect(bbox, [120, 120], 6)).toEqual([
      64 + 3 * Math.SQRT2,
      64 + 3 * Math.SQRT2,
    ]);
    expect(IntersectUtil.getRectIntersect(bbox, [120, 0], 8)).toEqual([
      62 + 4 * Math.SQRT2,
      58 - 4 * Math.SQRT2,
    ]);
    expect(IntersectUtil.getRectIntersect(bbox, [0, 0], [2, 4, 6, 8])).toEqual([
      50, 50,
    ]);
    expect(
      IntersectUtil.getRectIntersect(bbox, [120, 0], [2, 4, 6, 8])
    ).toEqual([70, 50]);
    expect(
      IntersectUtil.getRectIntersect(bbox, [120, 120], [2, 4, 6, 8])
    ).toEqual([64 + Math.SQRT2 * 3, 64 + Math.SQRT2 * 3]);
    expect(
      IntersectUtil.getRectIntersect(bbox, [0, 120], [2, 4, 6, 8])
    ).toEqual([58 - Math.SQRT2 * 4, 62 + Math.SQRT2 * 4]);
  });
});
