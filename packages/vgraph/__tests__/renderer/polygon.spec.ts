import { Polygon } from "../../src/renderer/shapes/polygon";
import {
  calculateNPointStar,
  calculateRegularNPolygon,
} from "../../src/renderer/utils/polygon";

const toPrecision = (points: number[][]) =>
  points.map(([x, y]) => [
    x === 0 ? (0).toFixed(10) : x.toFixed(10),
    y === 0 ? (0).toFixed(10) : y.toFixed(10),
  ]); // 保留十位小数，忽略精度丢失

const objectToPrecision = (object: any) =>
  Object.values(object).map((value: any) =>
    value === 0 ? (0).toFixed(10) : value.toFixed(10)
  );

describe("src/shapes/polygon.ts", () => {
  it("calculateBBox should work", () => {
    const arrowVertices = [
      [0, 0],
      [5, -5],
      [5, 0],
      [0, 5],
      [-5, 0],
      [-5, -5],
    ];

    const arrow = new Polygon({
      id: "arrow",
      points: arrowVertices,
      lineWidth: 2,
      fillStyle: "#eee",
      strokeStyle: "#666",
    });

    expect(arrow.calculateBBox()).toEqual({
      left: -5,
      top: -5,
      width: 10,
      height: 10,
    });

    const hexagram = new Polygon({
      id: "hexagram",
      type: "regular",
      n: 6,
      outerRadius: 10,
    });

    expect(objectToPrecision(hexagram.calculateBBox())).toEqual(
      objectToPrecision({
        left: -5 * Math.sqrt(3),
        top: -10,
        width: 10 * Math.sqrt(3),
        height: 20,
      })
    );

    hexagram.set("outerRadius", 20);

    expect(objectToPrecision(hexagram.calculateBBox())).toEqual(
      objectToPrecision({
        left: -10 * Math.sqrt(3),
        top: -20,
        width: 20 * Math.sqrt(3),
        height: 40,
      })
    );
  });
});

describe("src/utils/polygon", () => {
  it("calculateRegularNPolygon should work", () => {
    // 正六边形
    expect(toPrecision(calculateRegularNPolygon(6, 10))).toEqual(
      toPrecision([
        [0, 10],
        [5 * Math.sqrt(3), 5],
        [5 * Math.sqrt(3), -5],
        [0, -10],
        [-5 * Math.sqrt(3), -5],
        [-5 * Math.sqrt(3), 5],
      ])
    );
  });

  it("calculateNPointStar should work", () => {
    // 五角星
    const cos36 = Math.cos(Math.PI * 0.2);
    const sin36 = Math.sin(Math.PI * 0.2);
    const cos72 = Math.cos(Math.PI * 0.4);
    const sin72 = Math.sin(Math.PI * 0.4);
    const cos108 = Math.cos(Math.PI * 0.6);
    const sin108 = Math.sin(Math.PI * 0.6);
    const cos144 = Math.cos(Math.PI * 0.8);
    const sin144 = Math.sin(Math.PI * 0.8);
    const outerR = 20;
    const innerR = (outerR * Math.cos(Math.PI * 0.4)) / Math.cos(Math.PI * 0.2);
    const pentagram = [
      [0, -outerR],
      [innerR * sin36, -innerR * cos36],
      [outerR * sin72, -outerR * cos72],
      [innerR * sin108, -innerR * cos108],
      [outerR * sin144, -outerR * cos144],
      [0, innerR],
      [-outerR * sin144, -outerR * cos144],
      [-innerR * sin108, -innerR * cos108],
      [-outerR * sin72, -outerR * cos72],
      [-innerR * sin36, -innerR * cos36],
    ];
    expect(toPrecision(calculateNPointStar(5, 20))).toEqual(
      toPrecision(pentagram)
    );
  });
});
