import { Rect } from "../../src/renderer/shapes/rect";

describe("src/shapes/rect.ts", () => {
  it("init should work", () => {
    const rect = new Rect({
      left: 50,
      top: 40,
      width: 100,
      height: 60,
      fillStyle: "#ccc",
    });

    expect(rect.type).toBe("rect");
    expect(rect.get("left")).toBe(50);
    expect(rect.get("top")).toBe(40);
    expect(rect.get("width")).toBe(100);
    expect(rect.get("height")).toBe(60);
    expect(rect.get("fillStyle")).toBe("#ccc");
    expect(rect.get("strokeStyle")).toBe(undefined);
    expect(rect.get("radius")).toBe(0);
  });

  it("getBBox should work", () => {
    const rect = new Rect({
      left: 50,
      top: 40,
      width: 100,
      height: 60,
      fillStyle: "#ccc",
    });
    let bbox = rect.getBBox();
    expect(bbox).toEqual({
      left: 50,
      top: 40,
      width: 100,
      height: 60,
    });

    rect.set("strokeStyle", "#666");
    bbox = rect.getBBox();
    expect(bbox).toEqual({
      left: 49.5,
      top: 39.5,
      width: 101,
      height: 61,
    });

    rect.set("lineWidth", 4);
    bbox = rect.getBBox();
    expect(bbox).toEqual({
      left: 48,
      top: 38,
      width: 104,
      height: 64,
    });

    rect.scale(2, 2);
    bbox = rect.getBBox();
    expect(bbox).toEqual({
      left: 96,
      top: 76,
      width: 208,
      height: 128,
    });

    rect.rotate(90);
    bbox = rect.getBBox();
    expect(bbox).toEqual({
      left: 136,
      top: 36,
      width: 128,
      height: 208,
    });
  });
});
