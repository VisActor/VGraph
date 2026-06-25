import {
  isMathEqual,
  degToRadian,
  translate,
  rotate,
  scale,
  invert,
  multiply,
} from "../../../src/utils/math";

describe("src/math/matrix", () => {
  it("isMathEqual should work", () => {
    expect(isMathEqual(0.33, 1 / 3)).toBe(false);
    expect(isMathEqual(0.6, 3 * 0.2)).toBe(true);
  });

  it("degToRadian should work", () => {
    expect(degToRadian(0)).toBe(0);
    expect(degToRadian(60)).toBe(Math.PI / 3);
    expect(degToRadian(180)).toBe(Math.PI);
  });

  it("translate should work", () => {
    const matrix = translate([1, 0, 0, 1, 0, 0], 50, 50);
    expect(matrix).toEqual([1, 0, 0, 1, 50, 50]);
  });

  it("scale should work", () => {
    const matrix = scale([1, 0, 0, 1, 0, 0], 2, 2);
    expect(matrix).toEqual([2, 0, 0, 2, 0, 0]);
  });

  it("rotate should work", () => {
    const matrix = rotate([1, 0, 0, 1, 0, 0], 45);
    expect(matrix).toEqual([
      Math.SQRT2 / 2,
      -Math.sin(Math.PI / 4),
      Math.sin(Math.PI / 4),
      Math.SQRT2 / 2,
      0,
      0,
    ]);
  });

  it("invert should work", () => {
    let matrix = invert([1, 0, 0, 1, 0, 0]);
    expect(matrix).toEqual([1, -0, -0, 1, 0, 0]);
    matrix = invert([2, 0, 0, 2, 0, 0]);
    expect(matrix).toEqual([1 / 2, -0, -0, 1 / 2, 0, 0]);
  });

  it("multiply should work", () => {
    const matrix: number[] = [];
    multiply([2, 1, 1, 2, 1, 1], [1, 0, 0, 1, 0, 0], matrix);
    expect(matrix).toEqual([2, 1, 1, 2, 1, 1]);
    multiply([2, 1, 1, 2, 1, 1], [1, 2, 1, 1, 2, 1], matrix);
    expect(matrix).toEqual([4, 5, 3, 3, 6, 5]);
  });
});
