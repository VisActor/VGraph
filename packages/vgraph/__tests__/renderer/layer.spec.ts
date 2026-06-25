import { LayerBase as Layer } from "../../src/renderer/layers/base";
import { Rect } from "../../src/renderer/shapes/rect";
import { Circle } from "../../src/renderer/shapes/circle";
import { Canvas, NodeLayer, EdgeLayer, Icon } from "../../src";

describe("src/layers/base.ts", () => {
  it("add && remove should work", () => {
    const rect = new Rect({
      left: 0,
      top: 0,
      width: 50,
      height: 50,
    });
    const layer = new Layer();
    layer.add(rect);
    expect(layer.children.length).toBe(1);
    expect(layer.children[0]).toEqual(rect);
    expect(rect.getParent()).toEqual(layer);

    const circle = new Circle({
      cx: 0,
      cy: 0,
      r: 10,
    });
    layer.addBefore(circle, rect);
    expect(layer.children.length).toBe(2);
    expect(layer.children[0]).toEqual(circle);
    expect(layer.children[1]).toEqual(rect);
    expect(rect.getParent()).toEqual(layer);
    expect(circle.getParent()).toEqual(layer);

    layer.remove(circle);
    expect(layer.children.length).toBe(1);
    expect(layer.children[0]).toEqual(rect);
    expect(circle.getParent()).toBe(null);
    expect(circle.destroyed);

    layer.destroy();
    expect(layer.children.length).toBe(0);
    expect(rect.destroyed);
    expect(layer.destroyed);
  });

  it("find should work", () => {
    const rect = new Rect({
      left: 0,
      top: 0,
      width: 50,
      height: 50,
      id: "rect",
    });
    const rect1 = new Rect({
      left: 0,
      top: 50,
      width: 50,
      height: 50,
      id: "rect1",
    });
    const layer = new Layer();
    layer.add(rect);
    layer.add(rect1);

    expect(layer.findById("rect")).toEqual(rect);
    expect(layer.find((shape) => shape.get("top") === 50)).toEqual(rect1);
    expect(layer.findAll((shape) => shape.type === "rect").length).toBe(2);
  });

  it("getBBox should work", () => {
    const rect = new Rect({
      left: 50,
      top: 50,
      width: 50,
      height: 50,
      id: "rect",
    });
    const rect1 = new Rect({
      left: 50,
      top: 100,
      width: 50,
      height: 50,
      id: "rect1",
    });
    const layer = new Layer();
    layer.add(rect);
    layer.add(rect1);
    expect(layer.getBBox()).toEqual({
      left: 50,
      top: 50,
      width: 50,
      height: 100,
    });
    rect1.hide();
    expect(layer.getBBox()).toEqual({
      left: 50,
      top: 50,
      width: 50,
      height: 50,
    });

    rect.scale(2, 2);
    expect(layer.getBBox()).toEqual({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
    });

    const layer1 = new Layer();
    layer.add(layer1);
    expect(layer.getBBox()).toEqual({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
    });
  });
});

describe("src/layers/node_layer", () => {
  const div = document.createElement("div");
  document.body.append(div);
  const canvas = new Canvas({
    width: 100,
    height: 100,
    container: div,
  });

  it("nodeLayer should work with transform", () => {
    const nodeLayer = new NodeLayer({
      x: 100,
      y: 100,
      width: 50,
      height: 20,
    });

    expect(nodeLayer.getBBox()).toEqual({
      left: 75,
      top: 90,
      width: 50,
      height: 20,
    });

    nodeLayer.translate(100, 100);
    expect(nodeLayer.getBBox()).toEqual({
      left: 175,
      top: 190,
      width: 50,
      height: 20,
    });

    nodeLayer.set({ x: 50, y: 50 });
    expect(nodeLayer.getBBox()).toEqual({
      left: 125,
      top: 140,
      width: 50,
      height: 20,
    });
  });

  it("appendSize should work", () => {
    const nodeLayer = new NodeLayer({
      x: 100,
      y: 100,
      width: 20,
      height: 20,
    });
    const icon = new Icon({
      x: 0,
      y: -18,
      size: 16,
      icon: "&#xe836;",
    });
    const edge = new EdgeLayer({ id: "edge" });
    nodeLayer.add(icon);
    canvas.add(edge);
    canvas.add(nodeLayer);
    canvas.draw();
    const handler = canvas.eventManager.eventHandler;
    expect(handler.getShapeInLayer({ x: 100, y: 75 }, canvas)).toBe(null);

    nodeLayer.set("appendSize", [16, 0]);
    expect(handler.getShapeInLayer({ x: 100, y: 75 }, canvas)).toBe(icon);

    nodeLayer.destroy();
  });

  it("hitWidth should work", () => {
    const nodeLayer = new NodeLayer({
      x: 200,
      y: 200,
      width: 20,
      height: 20,
    });
    canvas.add(nodeLayer);
    const handler = canvas.eventManager.eventHandler;
    expect(handler.getShapeInLayer({ x: 200, y: 213 }, canvas)).toBe(null);

    nodeLayer.set("hitWidth", 10);
    expect(handler.getShapeInLayer({ x: 200, y: 213 }, canvas)).toBe(nodeLayer);
  });

  it("edgeLayer.shouldDraw should work", () => {
    const node1 = new NodeLayer({
      x: 500,
      y: 100,
      width: 50,
      height: 50,
    });
    const node2 = new NodeLayer({
      x: 400,
      y: 100,
      width: 50,
      height: 50,
    });
    const e = new EdgeLayer({
      source: node1,
      target: node2,
    });
    expect(
      e.shouldDraw({
        left: 0,
        top: 0,
        width: 500,
        height: 500,
      })
    ).toBe(true);

    expect(
      e.shouldDraw({
        left: 0,
        top: 0,
        width: 400,
        height: 50,
      })
    ).toBe(false);

    expect(
      e.shouldDraw({
        left: 0,
        top: 120,
        width: 400,
        height: 400,
      })
    ).toBe(true);

    expect(
      e.shouldDraw({
        left: 0,
        top: 200,
        width: 400,
        height: 400,
      })
    ).toBe(false);

    expect(
      e.shouldDraw({
        left: 600,
        top: 0,
        width: 400,
        height: 400,
      })
    ).toBe(false);
    expect(
      e.shouldDraw({
        left: -50,
        top: 0,
        width: 400,
        height: 400,
      })
    ).toBe(false);
  });
});
