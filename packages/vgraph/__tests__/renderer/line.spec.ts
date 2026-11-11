import {
  drawArc,
  getArcProjectionDist,
  getDimAt,
  getProjectionDist,
} from "../../src/renderer/utils/line";

function createCanvasContextMock() {
  return {
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    arc: jest.fn(),
  };
}

describe("src/renderer/utils/line.ts", () => {
  it("getDimAt should interpolate a dimension by progress", () => {
    expect(getDimAt(0, 10, 30)).toBe(10);
    expect(getDimAt(0.5, 10, 30)).toBe(20);
    expect(getDimAt(1, 10, 30)).toBe(30);
  });

  it("getProjectionDist should return the perpendicular distance to a line", () => {
    expect(getProjectionDist({ x: 3, y: 4 }, 0, 0, 10, 0)).toBe(4);
    expect(getProjectionDist({ x: 3, y: 4 }, 0, 0, 0, 10)).toBe(3);
    expect(getProjectionDist({ x: 0, y: 0 }, 1, 1, 1, 1)).toBeNaN();
  });

  it("drawArc should normalize ellipse transforms around canvas arc", () => {
    const ctx = createCanvasContextMock();
    const pathSegment = {
      configs: {
        params: ["A", 10, 20, 30, 15, Math.PI / 4, Math.PI / 2, Math.PI / 6, 1],
      },
    };

    drawArc(ctx as any, pathSegment);

    expect(ctx.translate).toHaveBeenNthCalledWith(1, 10, 20);
    expect(ctx.rotate).toHaveBeenNthCalledWith(1, Math.PI / 6);
    expect(ctx.scale).toHaveBeenNthCalledWith(1, 1, 0.5);
    expect(ctx.arc).toHaveBeenCalledWith(
      0,
      0,
      30,
      Math.PI / 4,
      (Math.PI * 3) / 4,
      false
    );
    expect(ctx.scale).toHaveBeenNthCalledWith(2, 1, 2);
    expect(ctx.rotate).toHaveBeenNthCalledWith(2, -Math.PI / 6);
    expect(ctx.translate).toHaveBeenNthCalledWith(2, -10, -20);
  });

  it("drawArc should handle taller ellipses and counter-clockwise arcs", () => {
    const ctx = createCanvasContextMock();
    const pathSegment = {
      configs: {
        params: ["A", 0, 0, 10, 20, 0, Math.PI, 0, 0],
      },
    };

    drawArc(ctx as any, pathSegment);

    expect(ctx.scale).toHaveBeenNthCalledWith(1, 0.5, 1);
    expect(ctx.arc).toHaveBeenCalledWith(0, 0, 20, 0, Math.PI, true);
    expect(ctx.scale).toHaveBeenNthCalledWith(2, 2, 1);
  });

  it("getArcProjectionDist should project to a point on a counter-clockwise arc", () => {
    const out: number[] = [];
    const dist = getArcProjectionDist(
      { x: 7, y: 7 },
      0,
      0,
      10,
      0,
      Math.PI,
      0,
      out
    );

    expect(out[0]).toBeCloseTo(Math.sqrt(50));
    expect(out[1]).toBeCloseTo(Math.sqrt(50));
    expect(dist).toBeCloseTo(10 - Math.sqrt(98));
  });

  it("getArcProjectionDist should clamp clockwise projections to the nearest arc end", () => {
    const out: number[] = [];
    const dist = getArcProjectionDist(
      { x: 0, y: 10 },
      0,
      0,
      10,
      0,
      Math.PI,
      1,
      out
    );

    expect(out[0]).toBeCloseTo(10);
    expect(out[1]).toBeCloseTo(0);
    expect(dist).toBeCloseTo(Math.sqrt(200));
  });
});
