import { ShapeBase } from "../../src/renderer/shape";
import { Layer } from "../../src";
import { setRenderer } from "../../src/renderer/renderer";

describe("src/shape.ts", () => {
  beforeAll(() => {
    setRenderer("svg");
  });

  afterAll(() => {
    setRenderer("canvas");
  });
  it("init shape should work", () => {
    const shape = new ShapeBase({
      x: 0,
      y: 0,
    });
    expect(shape.matrix).toBe(null);
    expect(shape.visible);
    expect(shape.capture);
    expect(!shape.animating);
    expect(shape.configs).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("getter & setter should work", () => {
    const shape = new ShapeBase({
      fillStyle: "#000",
      strokeStyle: "#fff",
    });

    expect(shape.get("strokeStyle")).toBe("#fff");
    expect(shape.get("fillStyle")).toBe("#000");
    // expect(Object.keys(shape._dirty).length).toBe(0);

    shape.set("strokeStyle", "red");
    expect(shape.get("strokeStyle")).toBe("red");
    // expect(shape._dirty.strokeStyle).toBe('red');
  });

  it("show & hide should work", () => {
    const shape = new ShapeBase({
      x: 0,
      y: 0,
    });
    expect(shape.visible);

    shape.hide();
    expect(!shape.visible);

    shape.show();
    expect(shape.visible);
  });

  it("destroy should work", () => {
    const shape = new ShapeBase({
      x: 0,
      y: 0,
    });
    shape.destroy();
    expect(shape.destroyed);
    const p = new Layer({});
    const parent = new Layer({});
    const child = new ShapeBase({
      x: 0,
      y: 0,
    });
    p.add(parent);
    parent.add(child);
    expect(parent.children.length).toBe(1);
    child.destroy();
    expect(parent.children.length).toBe(0);
    expect(child.destroyed);
    parent.destroy();
    expect(parent.children.length).toBe(0);
    expect(parent.destroyed).toBe(true);
    expect(p.children.length).toBe(0);
  });
});
