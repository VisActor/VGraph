import {
  Canvas,
  Rect,
  Circle,
  Text,
  Image,
  Cubic,
  Quadratic,
  Path,
  Polygon,
  NodeLayer,
  GroupLayer,
} from "../../src";

function mockEvent(type: string) {
  return new MouseEvent(type);
}

describe("src/event/index.ts", () => {
  let div: HTMLDivElement;
  let canvas: Canvas;
  let rect: Rect;
  let rect2: Rect;
  let handler: Canvas["eventManager"]["eventHandler"];

  beforeEach(() => {
    div = document.createElement("div");
    document.body.append(div);
    canvas = new Canvas({
      width: 400,
      height: 400,
      container: div,
    });

    rect = new Rect({
      left: 100,
      top: 50,
      width: 100,
      height: 100,
      fillStyle: "blue",
      strokeStyle: "blue",
    });

    rect2 = new Rect({
      left: 0,
      top: 0,
      width: 20,
      height: 20,
      fillStyle: "#ccc",
    });

    canvas.add(rect);
    handler = canvas.eventManager.eventHandler;
  });

  afterEach(() => {
    canvas.destroy();
    div.remove();
  });

  it("get rect should work", () => {
    expect(handler.getShapeInLayer({ x: 100, y: 50 }, canvas)).toEqual(rect);
    expect(handler.getShapeInLayer({ x: 150, y: 150 }, canvas)).toEqual(rect);
    expect(handler.getShapeInLayer({ x: 50, y: 50 }, canvas)).toBe(null);

    rect.set("fillStyle", null);
    rect.set("lineWidth", 4);
    expect(handler.getShapeInLayer({ x: 100, y: 50 }, canvas)).toEqual(rect);
    expect(handler.getShapeInLayer({ x: 150, y: 140 }, canvas)).toBe(rect);
    expect(handler.getShapeInLayer({ x: 50, y: 50 }, canvas)).toBe(null);

    rect.set("fillStyle", "blue");
    expect(handler.getShapeInLayer({ x: 100, y: 50 }, canvas)).toEqual(rect);
    expect(handler.getShapeInLayer({ x: 150, y: 140 }, canvas)).toBe(rect);

    rect.capture = false;
    expect(handler.getShapeInLayer({ x: 100, y: 50 }, canvas)).toEqual(null);
    expect(handler.getShapeInLayer({ x: 150, y: 140 }, canvas)).toBe(null);

    rect.capture = true;
  });

  it("get circle should work", () => {
    const circle = new Circle({
      cx: 100,
      cy: 100,
      r: 50,
      fillStyle: "yellow",
      strokeStyle: "yellow",
    });
    canvas.add(circle);
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toEqual(circle);
    expect(handler.getShapeInLayer({ x: 100, y: 150 }, canvas)).toEqual(circle);
    expect(handler.getShapeInLayer({ x: 150, y: 140 }, canvas)).toEqual(rect);

    circle.set("fillStyle", null);
    expect(handler.getShapeInLayer({ x: 100, y: 150 }, canvas)).toEqual(circle);
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toEqual(rect);
    canvas.remove(circle);
  });

  it("get text should work", () => {
    const text = new Text({
      x: 100,
      y: 100,
      fontSize: 14,
      text: "test text shape",
      textAlign: "center",
    });
    canvas.add(text);
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toEqual(text);
    expect(handler.getShapeInLayer({ x: 90, y: 110 }, canvas)).toEqual(text);

    text.set("textAlign", "start");
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toEqual(text);
    expect(handler.getShapeInLayer({ x: 90, y: 110 }, canvas)).toBe(null);

    text.set("textAlign", "right");
    expect(handler.getShapeInLayer({ x: 90, y: 110 }, canvas)).toEqual(text);
    expect(handler.getShapeInLayer({ x: 110, y: 100 }, canvas)).toEqual(rect);

    text.set("textBaseline", "middle");
    expect(handler.getShapeInLayer({ x: 90, y: 112 }, canvas)).toBe(null);
    expect(handler.getShapeInLayer({ x: 90, y: 107 }, canvas)).toEqual(text);

    text.set("textBaseline", "bottom");
    expect(handler.getShapeInLayer({ x: 90, y: 96 }, canvas)).toBe(text);
    expect(handler.getShapeInLayer({ x: 90, y: 112 }, canvas)).toBe(null);
    expect(handler.getShapeInLayer({ x: 90, y: 107 }, canvas)).toBe(null);

    canvas.remove(text);
  });

  it("get image should work", () => {
    const img = new Image({
      left: 200,
      top: 200,
      width: 50,
      height: 50,
      url: "",
    });
    canvas.add(img);
    expect(handler.getShapeInLayer({ x: 200, y: 200 }, canvas)).toBe(img);
    expect(handler.getShapeInLayer({ x: 250, y: 250 }, canvas)).toBe(img);

    canvas.remove(img);
  });

  it("get quadratic should work", () => {
    const quad = new Quadratic({
      points: [
        [100, 100],
        [150, 200],
        [200, 100],
      ],
      lineWidth: 2,
      strokeStyle: "#666",
    });
    canvas.add(quad);
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toBe(quad);
    expect(handler.getShapeInLayer({ x: 120, y: 132 }, canvas)).toBe(quad);
    expect(handler.getShapeInLayer({ x: 130, y: 156 }, canvas)).toBe(null);

    quad.set("fillStyle", "red");
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toBe(quad);
    expect(handler.getShapeInLayer({ x: 120, y: 132 }, canvas)).toBe(quad);
    expect(handler.getShapeInLayer({ x: 150, y: 100 }, canvas)).toBe(quad);

    // 加箭头之前获取不到quad
    expect(handler.getShapeInLayer({ x: 102, y: 109 }, canvas)).toBe(rect);
    quad.set("startArrow", true);
    // 加箭头之后可以获取到quad
    expect(handler.getShapeInLayer({ x: 102, y: 109 }, canvas));

    canvas.remove(quad);
  });

  it("get cubic should work", () => {
    const cubic = new Cubic({
      points: [
        [100, 100],
        [150, 200],
        [200, 0],
        [300, 100],
      ],
      strokeStyle: "#666",
      lineWidth: 2,
    });

    canvas.add(cubic);
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toBe(cubic);
    expect(handler.getShapeInLayer({ x: 130.4, y: 128 }, canvas)).toBe(cubic);
    expect(handler.getShapeInLayer({ x: 150, y: 100 }, canvas)).toBe(rect);

    cubic.set("fillStyle", "red");
    expect(handler.getShapeInLayer({ x: 100, y: 100 }, canvas)).toBe(cubic);
    expect(handler.getShapeInLayer({ x: 130.4, y: 128 }, canvas)).toBe(cubic);
    expect(handler.getShapeInLayer({ x: 150, y: 100 }, canvas)).toBe(cubic);

    // 加箭头之前获取不到cubic
    expect(handler.getShapeInLayer({ x: 103, y: 108 }, canvas)).toBe(rect);
    cubic.set("startArrow", true);
    // 加箭头之后可以获取到cubic
    expect(handler.getShapeInLayer({ x: 103, y: 108 }, canvas)).toBe(cubic);

    canvas.remove(cubic);
  });

  it("get path should work", () => {
    const path = new Path({
      path: [
        ["M", 50, 50],
        ["H", 150],
        ["V", 150],
        ["a", 50, 50, 0, 0, 1, -150, 0],
        ["L", 50, 150],
        ["Z"],
      ],
      lineWidth: 2,
      strokeStyle: "#666",
    });
    canvas.add(path);
    expect(handler.getShapeInLayer({ x: 50, y: 50 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 150, y: 150 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 75, y: 225 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 75, y: 150 }, canvas)).toBe(null);

    path.set("fillStyle", "blue");
    expect(handler.getShapeInLayer({ x: 50, y: 50 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 150, y: 150 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 75, y: 225 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 75, y: 150 }, canvas)).toBe(path);

    canvas.remove(path);
  });

  it("get polygon should work", () => {
    const hexagram = new Polygon({
      id: "hexagram",
      type: "star",
      n: 6,
      outerRadius: 5 * Math.sqrt(3),
      cx: 50,
      cy: 250,
      lineWidth: 2,
      strokeStyle: "#666",
    });
    canvas.add(hexagram);
    expect(
      handler.getShapeInLayer({ x: 50, y: 250 + 5 * Math.sqrt(3) }, canvas)
    ).toBe(hexagram);
    expect(handler.getShapeInLayer({ x: 50, y: 250 }, canvas)).toBe(null);
    expect(handler.getShapeInLayer({ x: 55, y: 250 }, canvas)).toBe(hexagram);

    hexagram.set("fillStyle", "blue");

    expect(
      handler.getShapeInLayer({ x: 50, y: 250 + 5 * Math.sqrt(3) }, canvas)
    ).toBe(hexagram);
    expect(handler.getShapeInLayer({ x: 50, y: 250 }, canvas)).toBe(hexagram);
    expect(handler.getShapeInLayer({ x: 55, y: 250 }, canvas)).toBe(hexagram);

    canvas.remove(hexagram);
  });

  it("mouseenter & mouseleave for shape should work", () => {
    let called = false;
    rect.on("mouseenter", () => {
      called = true;
    });
    canvas.eventManager.handleEvent({
      clientX: 150,
      clientY: 150,
      type: "mousemove",
    });
    expect(called);
    called = false;
    rect.on("mouseleave", () => {
      called = true;
    });
    canvas.eventManager.mousemove(mockEvent("mousemove"), canvas);
    expect(called);
    rect.removeAllListeners();
  });

  it("mouseenter & mouseleave should work for nodeLayer", () => {
    const node = new NodeLayer({
      left: 0,
      top: 0,
      width: 200,
      height: 150,
    });
    node.add(rect);
    rect.set("cursor", "pointer");
    node.add(rect2);
    canvas.add(node);
    let mouseenter = false;
    node.on("mouseenter", () => {
      mouseenter = true;
    });
    let mouseleave = false;
    node.on("mouseleave", () => {
      mouseleave = true;
    });
    canvas.eventManager.mousemove(mockEvent("mousemove"), canvas);
    expect(!mouseenter);
    canvas.eventManager.mousemove(mockEvent("mousemove"), rect);
    expect(canvas.getCanvasDom().style.cursor).toBe("pointer");
    expect(mouseenter);
    canvas.eventManager.mousemove(mockEvent("mousemove"), rect2);
    expect(canvas.getCanvasDom().style.cursor).toBe("default");
    expect(!mouseleave);
    canvas.eventManager.mousemove(mockEvent("mousemove"), rect);
    expect(!mouseleave);
    canvas.eventManager.mousemove(mockEvent("mousemove"), canvas);
    expect(mouseleave);
  });

  it("mouseenter & mouseleave should work for group layer", () => {
    const group = new GroupLayer({
      padding: 10,
    });
    const rect3 = new Rect({
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      fillStyle: "#666",
    });
    group.add(rect3);
    let mouseenter = false;
    group.on("mouseenter", () => {
      mouseenter = true;
    });
    let mouseleave = false;
    group.on("mouseleave", () => {
      mouseleave = true;
    });
    canvas.eventManager.mousemove(mockEvent("mousemove"), canvas);
    expect(!mouseenter);
    canvas.eventManager.mousemove(mockEvent("mousemove"), group);
    expect(mouseenter);
    mouseenter = false;
    canvas.eventManager.mousemove(mockEvent("mousemove"), rect3);
    expect(!mouseenter);
    expect(!mouseleave);
    canvas.eventManager.mousemove(mockEvent("mousemove"), group);
    expect(!mouseenter);
    expect(!mouseleave);
    canvas.eventManager.mousemove(mockEvent("mousemove"), canvas);
    expect(!mouseenter);
    expect(mouseleave);
  });

  it("stopPropagation should work", () => {
    const node = new NodeLayer({
      id: "node",
      left: 0,
      top: 0,
      width: 200,
      height: 150,
    });
    node.add(rect);
    canvas.add(node);
    let click = false;
    node.on("click", () => {
      click = true;
    });
    canvas.eventManager.handleEvent({
      type: "click",
      clientX: 150,
      clientY: 150,
    });
    expect(click);
    click = false;
    rect.on("click", (e) => {
      e.stopPropagation();
    });
    canvas.eventManager.handleEvent({
      type: "click",
      clientX: 150,
      clientY: 150,
    });
    expect(click).toBe(false);
  });

  it("bugfix: hit test should work for filled paths", () => {
    canvas.clear();
    let clicked = false;
    const leftArrow = new Path({
      id: "leftArrow",
      path: [["M", 0, 60], ["L", 80, 0], ["L", 80, 120], ["Z"]],
      fillStyle: "#ccc",
    });

    const rightArrow = new Path({
      id: "rightArrow",
      path: [["M", 100, 0], ["L", 180, 60], ["L", 100, 120], ["Z"]],
      fillStyle: "#ccc",
    });

    canvas.add(leftArrow);
    canvas.add(rightArrow);

    leftArrow.on("click", () => {
      clicked = true;
    });

    canvas.eventManager.handleEvent({
      type: "click",
      clientX: 40,
      clientY: 40,
    });
    expect(clicked);

    clicked = false;

    canvas.eventManager.handleEvent({
      type: "click",
      clientX: 120,
      clientY: 40,
    });
    expect(clicked).toBe(false);
  });

  it("bugfix: drag should not emit click", () => {
    canvas.clear();
    const rt = new Rect({
      left: 10,
      top: 10,
      width: 90,
      height: 60,
      fillStyle: "#ccc",
      strokeStyle: "#ccc",
    });
    canvas.add(rt);
    let clicked = false;
    rt.on("click", () => {
      clicked = true;
    });
    canvas.eventManager.handleEvent({
      type: "mousedown",
      clientX: 20,
      clientY: 20,
    });
    canvas.eventManager.handleEvent({
      type: "mouseup",
      clientX: 21,
      clientY: 20,
    });
    expect(clicked);
    clicked = false;
    canvas.eventManager.handleEvent({
      type: "mousedown",
      clientX: 20,
      clientY: 20,
    });
    canvas.eventManager.handleEvent({
      type: "mouseup",
      clientX: 60,
      clientY: 60,
    });
    expect(!clicked);
  });

  it("capture should work", () => {
    canvas.clear();
    let clicked = false;
    canvas.on("mousedown", () => {
      clicked = true;
    });
    canvas.setCapture(false);
    canvas.eventManager.handleEvent({
      type: "mousedown",
      clientX: 20,
      clientY: 20,
    });

    expect(clicked).toBe(false);

    canvas.setCapture(true);
    canvas.eventManager.handleEvent({
      type: "mousedown",
      clientX: 20,
      clientY: 20,
    });
    expect(clicked).toBe(true);
  });

  it("bugfix: quadratic and cubic path stroke handler should work", () => {
    canvas.clear();
    const path = new Path({
      path: [
        ["M", 50, 50],
        ["Q", 50, 100, 100, 100],
        ["C", 150, 100, 200, 150, 200, 200],
      ],
      lineWidth: 2,
      strokeStyle: "#666",
    });
    canvas.add(path);
    expect(handler.getShapeInLayer({ x: 50, y: 50 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 57, y: 79 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 200, y: 200 }, canvas)).toBe(path);
    expect(handler.getShapeInLayer({ x: 57, y: 69 }, canvas)).toBe(null);
    expect(handler.getShapeInLayer({ x: 168, y: 124 }, canvas)).toBe(null);

    canvas.remove(path);
  });

  it("fixed shape should work", () => {
    canvas.clear();
    const rect = new Rect({
      fixed: true,
      left: 0,
      top: 0,
      width: 20,
      height: 20,
      fillStyle: "#ccc",
    });

    canvas.add(rect);
    expect(handler.getShapeInLayer({ x: 10, y: 10 }, canvas)).toBe(rect);
    canvas.translate(200, 200);
    expect(handler.getShapeInLayer({ x: 10, y: 10 }, canvas)).toBe(rect);
    canvas.scale(2);
    expect(handler.getShapeInLayer({ x: 10, y: 10 }, canvas)).toBe(rect);
  });
});
