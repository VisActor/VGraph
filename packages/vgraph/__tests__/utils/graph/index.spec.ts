import { normalizePadding, isPointInScreen } from "../../../src/utils/graph";

describe("src/graph/index", () => {
  it("normalizePadding should work", () => {
    expect(normalizePadding(5)).toEqual([5, 5, 5, 5]);
    expect(normalizePadding([10, 12])).toEqual([10, 12, 10, 12]);
    expect(normalizePadding([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it("isPointInScreen should work", () => {
    expect(isPointInScreen({ x: -1, y: -1 }, { width: 800, height: 600 })).toBe(
      false
    );
    expect(isPointInScreen({ x: 0, y: -1 }, { width: 800, height: 600 })).toBe(
      false
    );
    expect(
      isPointInScreen({ x: 1000, y: 0 }, { width: 800, height: 600 })
    ).toBe(false);
    expect(isPointInScreen({ x: 50, y: 50 }, { width: 800, height: 600 })).toBe(
      true
    );
  });
});
