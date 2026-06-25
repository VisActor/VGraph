import { EdgeLayer, NodeLayer, Layer, Graph, Path } from "../../src";
import { MatrixUtils } from "../../src/utils";
import { EDGE_TYPES } from "../../src/consts/edge_types";
import {
  getEdgeMethods,
  registerEdge,
  unRegisterEdge,
} from "../../src/models/factories";
import { getDefaultLoopAnchors } from "../../src/models/factories/path";

describe("/src/factories/edge.ts", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultEdge(data: any) {
      if (data.data === "a") {
        return { strokeStyle: "blue" };
      }
      return { strokeStyle: "red" };
    },
    setEdgeStateStyles(state: string, data: any) {
      if (state === "a") {
        return { strokeStyle: "#eee" };
      }
      return { strokeStyle: "#ccc" };
    },
  });

  const node1 = graph.add("node", {
    type: "rect",
    id: "node1",
    x: 20,
    y: 80,
    width: 60,
    height: 40,
  });

  const node2 = graph.add("node", {
    type: "rect",
    id: "node2",
    x: 280,
    y: 320,
    width: 60,
    height: 40,
  });
  it("should work for line", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("line");
    const path = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
    });
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 200, 200],
    ]);
    expect(path.get("lineWidth")).toBe(1);
    expect(path.get("hitWidth")).toBe(4);
    expect(path.get("strokeStyle")).toBe("#C9CDD4");
    expect(path.get("endArrow")).toBe(false);
    lineMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      styles: { endArrow: true },
    });
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 200, 200],
    ]);
    expect(path.get("endArrow"));
    layer.destroy();
  });

  it("should work for default label", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("line");
    const path = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      label: "edge text",
    });
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 200, 200],
    ]);
    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("text")).toBe("edge text");
      expect(label.get("x")).toBe(150);
      expect(label.get("y")).toBe(150);
      expect(label.get("textAlign")).toBe("center");
      expect(label.getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
    }
    layer.destroy();
  });

  it("should work for rotate label", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("line");
    const path = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      controlPoints: [[150, 150]],
      label: {
        text: "rotate text",
        offsetX: 0,
        offsetY: 0,
        autoRotate: true,
      },
    });
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 150, 150],
      ["L", 200, 200],
    ]);
    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);

    const matrix = [1, 0, 0, 1, 0, 0];
    MatrixUtils.translate(matrix, -150, -150);
    MatrixUtils.rotate(matrix, 315);
    MatrixUtils.translate(matrix, 150, 150);
    if (label) {
      expect(label.get("text")).toEqual("rotate text");
      expect(label.get("x")).toBe(150);
      expect(label.get("y")).toBe(150);
      expect(label.getMatrix()).toEqual(matrix);
    }

    lineMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [100, 200],
      label: {
        text: "rotate text",
        offsetX: 10,
        offsetY: 0,
        autoRotate: true,
      },
    });

    expect(label);
    if (label) {
      expect(label.get("x")).toBe(110);
      expect(label.get("y")).toBe(150);
      const m = [1, 0, 0, 1, 0, 0];
      MatrixUtils.translate(m, -110, -150);
      MatrixUtils.rotate(m, 270);
      MatrixUtils.translate(m, 110, 150);
      expect(label.getMatrix()).toEqual(m);
    }
  });

  it("quadratic should work", () => {
    const layer = new EdgeLayer();
    const quadraticMethods = getEdgeMethods("quadratic");
    const curve = quadraticMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 100],
    });
    expect(curve.get("points")).toEqual([
      [100, 100],
      [150, 80],
      [200, 100],
    ]);

    quadraticMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [200, 100],
      controlPoints: [[150, 50]],
    });
    expect(curve.get("points")).toEqual([
      [100, 100],
      [150, 50],
      [200, 100],
    ]);

    quadraticMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [200, 100],
      controlPoints: [[150, 50]],
      label: {
        text: "quadratic",
        position: 0,
      },
    });

    const label = layer.find((shape) => shape.get("_label"));
    expect(label);

    if (label) {
      expect(label.get("text")).toBe("quadratic");
      expect(label.get("x")).toBe(100);
      expect(label.get("y")).toBe(100);
      expect(label.get("textAlign")).toBe("start");
      expect(label.getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
    }
    layer.destroy();
  });

  it("cubic should work", () => {
    const layer = new EdgeLayer();
    const cubicMethods = getEdgeMethods("cubic");
    const curve = cubicMethods.init(layer, {
      startPoint: [50, 100],
      endPoint: [250, 300],
      label: {
        text: "end text",
        position: 1,
        autoRotate: true,
      },
      source: node1,
      target: node2,
    });
    expect(curve.get("points")).toEqual([
      [50, 100],
      [164.14213562373095, 185.85786437626905],
      [135.85786437626905, 214.14213562373095],
      [250, 300],
    ]);
    const label = layer.find((shape) => shape.get("_label"));
    expect(label);

    if (label) {
      expect(label.get("x")).toBe(250);
      expect(label.get("y")).toBe(300);
      expect(label.get("textAlign")).toBe("end");
      expect(label.getMatrix()).not.toEqual([1, 0, 0, 1, 0, 0]);
    }

    cubicMethods.update(layer, {
      startPoint: [50, 100],
      endPoint: [250, 300],
      source: node1,
      target: node2,
    });
    if (label) {
      expect(label.destroyed);
    }
  });

  it("reversed cubic should work", () => {});

  it("vCubic should work", () => {
    node1.set("x", 70);
    node1.set("y", 80);
    node2.set("x", 230);
    node2.set("y", 520);
    const layer = new EdgeLayer();
    const cubicMethods = getEdgeMethods("vCubic");
    const curve = cubicMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 500],
      label: {
        text: "text",
        autoRotate: true,
        offsetX: 10,
        fontSize: 16,
      },
      source: node1,
      target: node2,
    });
    expect(curve.get("points")).toEqual([
      [100, 100],
      [100, 300],
      [200, 300],
      [200, 500],
    ]);

    const label = layer.find((shape) => shape.get("_label"));
    expect(label);

    if (label) {
      expect(label.get("x")).toBe(160);
      expect(label.get("y")).toBe(300);
      expect(label.get("textAlign")).toBe("center");
      expect(label.getMatrix()).not.toEqual([1, 0, 0, 1, 0, 0]);
    }
    node2.set("x", 330);
    cubicMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [300, 500],
      label: {
        text: "text",
        autoRotate: true,
        offsetX: 10,
        fontSize: 16,
      },
      source: node1,
      target: node2,
    });
    expect(curve.get("points")).toEqual([
      [100, 100],
      [100, 300],
      [300, 300],
      [300, 500],
    ]);

    if (label) {
      expect(label.get("x")).toBe(210);
      expect(label.get("y")).toBe(300);
      expect(label.get("fontSize")).toBe(16);
      expect(label.get("textAlign")).toBe("center");
      expect(label.getMatrix()).not.toEqual([1, 0, 0, 1, 0, 0]);
    }
  });

  it("hCubic should work", () => {
    node2.set("x", 530);
    node2.set("y", 320);
    const layer = new EdgeLayer();
    const cubicMethods = getEdgeMethods("hCubic");
    const curve = cubicMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
      label: {
        text: "text",
        offsetX: 5,
        offsetY: 10,
      },
      source: node1,
      target: node2,
    });

    expect(curve.get("points")).toEqual([
      [100, 100],
      [300, 100],
      [300, 300],
      [500, 300],
    ]);
    const label = layer.find((shape) => shape.get("_label"));
    expect(label);
    if (label) {
      expect(label.get("x")).toBe(305);
      expect(label.get("y")).toBe(210);
      expect(label.get("textAlign")).toBe("center");
    }
    layer.destroy();
  });

  it("loop should work", () => {
    const node = new NodeLayer({
      x: 100,
      y: 200,
      width: 200,
      height: 100,
    });
    const layer = new EdgeLayer();
    const { startPoint, endPoint } = getDefaultLoopAnchors(node, {});
    expect(startPoint).toEqual([50, 150]);
    expect(endPoint).toEqual([150, 150]);
    const loopMethods = getEdgeMethods("loop");
    const path = loopMethods.init(layer, {
      source: node,
      startPoint,
      endPoint,
      loop: { radius: 0 },
    });
    expect(path.get("path")).toEqual([
      ["M", 50, 150],
      ["L", 50, 100],
      ["L", 150, 100],
      ["L", 150, 150],
    ]);

    loopMethods.update(layer, {
      source: node,
      startPoint,
      endPoint,
      loop: {
        dist: 25,
      },
    });
    expect(path.get("path")).toEqual([
      ["M", 50, 150],
      ["L", 50, 127],
      // ['A', 2, 2, 0, 0, 1, 52, 125],
      ["Q", 50, 125, 52, 125, 3.141592653589793],
      ["L", 148, 125],
      // ['A', 2, 2, 0, 0, 1, 150, 127],
      ["Q", 150, 125, 150, 127, 3.141592653589793],
      ["L", 150, 150],
    ]);
  });

  it("round loop should work", () => {
    const node = new NodeLayer({
      x: 100,
      y: 200,
      width: 200,
      height: 100,
    });
    const layer = new EdgeLayer();
    const { startPoint, endPoint } = getDefaultLoopAnchors(node, {});
    expect(startPoint).toEqual([50, 150]);
    expect(endPoint).toEqual([150, 150]);
    const loopMethods = getEdgeMethods("loop");
    const path = loopMethods.init(layer, {
      source: node,
      startPoint,
      endPoint,
      loop: { theme: "round" },
    });

    expect(path.get("path")).toEqual([
      ["M", 50, 150],
      ["L", 50, 150],
      ["A", 50, 50, 0, 0, 1, 150, 150],
      // ['L', 150, 150], // r = dist
    ]);

    const points = getDefaultLoopAnchors(node, {
      loop: { position: "right", theme: "round" },
    });
    expect(points.startPoint).toEqual([200, 175]);
    expect(points.endPoint).toEqual([200, 225]);
    loopMethods.update(layer, {
      source: node,
      startPoint: points.startPoint,
      endPoint: points.endPoint,
      loop: { position: "right", theme: "round" },
      strokeStyle: "blue",
    });
    expect(path.get("path")).toEqual([
      ["M", 200, 175],
      ["L", 225, 175],
      ["A", 25, 25, 0, 0, 1, 225, 225],
      ["L", 200, 225],
    ]);
    expect(path.get("strokeStyle")).toBe("blue");
  });

  it("arc loop should work", () => {
    const node = new NodeLayer({
      x: 100,
      y: 200,
      width: 200,
      height: 100,
    });
    const layer = new EdgeLayer();
    const { startPoint, endPoint } = getDefaultLoopAnchors(node, {});
    expect(startPoint).toEqual([50, 150]);
    expect(endPoint).toEqual([150, 150]);
    const loopMethods = getEdgeMethods("loop");
    const path = loopMethods.init(layer, {
      source: node,
      startPoint,
      endPoint,
      loop: { theme: "arc" },
    });
    expect(path.get("points")).toEqual([
      [50, 150],
      [100, 100],
      [150, 150],
    ]);

    const points = getDefaultLoopAnchors(node, {
      loop: { position: "left", theme: "arc" },
    });
    expect(points.startPoint).toEqual([0, 175]);
    expect(points.endPoint).toEqual([0, 225]);
    loopMethods.update(layer, {
      source: node,
      startPoint: points.startPoint,
      endPoint: points.endPoint,
      loop: { position: "left", theme: "arc" },
    });

    expect(path.get("points")).toEqual([
      [0, 175],
      [-50, 200],
      [0, 225],
    ]);
  });

  it("vLine should work", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("vLine");
    const line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
    });

    // console.log('L400',line.get('path'));
    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["V", 195],
      // ['A', 5, 5, 0, 0, 0, 105, 200],
      ["Q", 100, 200, 105, 200, 7.853981633974483],
      ["H", 495],
      // ['A', 5, 5, 0, 0, 1, 500, 205],
      ["Q", 500, 200, 500, 205, 7.853981633974483],
      ["V", 300],
    ]);

    lineMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
      styles: {
        curvePosition: 0.6,
      },
    });

    expect(line.get("path")).toEqual([
      // ['M', 100, 100],
      // ['V', 215],
      // ['A', 5, 5, 0, 0, 0, 105, 220],
      // ['H', 495],
      // ['A', 5, 5, 0, 0, 1, 500, 225],
      // ['V', 300],
      ["M", 100, 100],
      ["V", 215],
      ["Q", 100, 220, 105, 220, 7.853981633974483],
      ["H", 495],
      ["Q", 500, 220, 500, 225, 7.853981633974483],
      ["V", 300],
    ]);

    layer.destroy();
  });

  it("vLine with small dx should work", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("vLine");
    const line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [102, 300],
    });

    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["V", 199],
      ["Q", 100, 200, 101, 200, 1.5707963267948966],
      ["H", 101],
      ["Q", 102, 200, 102, 201, 1.5707963267948966],
      ["V", 300],
    ]);

    lineMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
    });

    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["V", 195],
      // ['A', 5, 5, 0, 0, 0, 105, 200],
      ["Q", 100, 200, 105, 200, 7.853981633974483],
      ["H", 495],
      // ['A', 5, 5, 0, 0, 1, 500, 205],
      ["Q", 500, 200, 500, 205, 7.853981633974483],
      ["V", 300],
    ]);

    lineMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [97, 50],
    });

    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["V", 76.5],
      // ['H', 97],
      ["Q", 100, 75, 98.5, 75, 2.356194490192345],
      ["H", 98.5],
      ["Q", 97, 75, 97, 73.5, 2.356194490192345],
      ["V", 50],
    ]);
  });

  it("hLine should work", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("hLine");
    const line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
    });

    expect(line.get("path")).toEqual([
      // ['M', 100, 100],
      // ['H', 295],
      // ['A', 5, 5, 0, 0, 1, 300, 105],
      // ['V', 295],
      // ['A', 5, 5, 0, 0, 0, 305, 300],
      // ['H', 500],
      ["M", 100, 100],
      ["H", 295],
      ["Q", 300, 100, 300, 105, 7.853981633974483],
      ["V", 295],
      ["Q", 300, 300, 305, 300, 7.853981633974483],
      ["H", 500],
    ]);

    lineMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
      styles: {
        curvePosition: 0.4,
      },
    });

    expect(line.get("path")).toEqual([
      // ['M', 100, 100],
      // ['H', 255],
      // ['A', 5, 5, 0, 0, 1, 260, 105],
      // ['V', 295],
      // ['A', 5, 5, 0, 0, 0, 265, 300],
      // ['H', 500],
      ["M", 100, 100],
      ["H", 255],
      ["Q", 260, 100, 260, 105, 7.853981633974483],
      ["V", 295],
      ["Q", 260, 300, 265, 300, 7.853981633974483],
      ["H", 500],
    ]);

    layer.destroy();
  });

  it("turningLine should work", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("turningLine");
    const line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
      controlPoints: [[100, 200]],
    });
    const pathToPrecision = (path: any[][]) =>
      path.map((arr: any[]) =>
        arr.map((elem: any) =>
          typeof elem === "number" ? elem.toFixed(10) : elem
        )
      );

    expect(pathToPrecision(line.get("path"))).toEqual(
      pathToPrecision([
        ["M", 100, 100],
        ["L", 100, 194.11098201660474],
        ["Q", 100, 200, 105.71318662981191, 201.428296657453, 10],
        // ['A', 7.542515290023976, 7.542515290023976, 0, 0, 0, 105.71318662981191, 201.428296657453],
        ["L", 500, 300],
      ])
    );
    expect(line.get("endArrow")).toBe(false);

    lineMethods.update(layer, {
      startPoint: [100, 100],
      endPoint: [500, 300],
      controlPoints: [[100, 200]],
      endArrow: true,
    });

    expect(pathToPrecision(line.get("path"))).toEqual(
      pathToPrecision([
        ["M", 100, 100],
        ["L", 100, 194.11098201660474],
        // ['A', 7.542515290023976, 7.542515290023976, 0, 0, 0, 105.71318662981191, 201.428296657453],
        ["Q", 100, 200, 105.71318662981191, 201.428296657453, 10],
        ["L", 500, 300],
      ])
    );
    expect(line.get("endArrow")).toBe(true);

    layer.destroy();
  });

  it("should work for unregister custom edge", () => {
    registerEdge("custom-edge", {});
    expect(getEdgeMethods("custom-edge").type).toBe("custom-edge");
    unRegisterEdge("custom-edge");
    expect(getEdgeMethods("custom-edge").type).toBe(EDGE_TYPES.LINE);
  });

  it("bugfix: updatePath should work for extended path", () => {
    let called = false;
    registerEdge("testLine", {
      extends: "line",
      afterUpdatePath(layer: any, configs: any) {
        called = true;
      },
    });
    const method = getEdgeMethods("textLine");
    const layer = new Layer();
    method.init(layer, {
      label: "test label",
      startPoint: [100, 100],
      endPoint: [200, 200],
    });
    const path = layer.children[0];
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 200, 200],
    ]);
    const label = layer.children[1];
    expect(label.get("x")).toBe(150);
    expect(label.get("y")).toBe(150);

    method.updatePath(layer, {
      label: "test label",
      startPoint: [100, 100],
      endPoint: [500, 200],
    });
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 500, 200],
    ]);
    expect(label.get("x")).toBe(300);
    expect(label.get("y")).toBe(150);
    expect(called);
  });

  it("bugfix: updatePath should work for extended curve", () => {
    let called = false;
    registerEdge("testCubic", {
      extends: "vCubic",
      afterUpdatePath(layer: any, configs: any) {
        called = true;
      },
    });
    const method = getEdgeMethods("testCubic");
    node2.set("x", 230);
    node2.set("y", 220);
    const layer = new Layer();
    method.init(layer, {
      label: "test label",
      startPoint: [100, 100],
      endPoint: [200, 200],
      source: node1,
      target: node2,
    });

    const path = layer.children[0];
    const label = layer.children[1];
    expect(path.get("points")).toEqual([
      [100, 100],
      [100, 150],
      [200, 150],
      [200, 200],
    ]);
    expect(label.get("x")).toBe(150);
    expect(label.get("y")).toBe(150);

    node2.set("x", 530);
    method.updatePath(layer, {
      label: "test label",
      startPoint: [100, 100],
      endPoint: [500, 200],
      source: node1,
      target: node2,
    });
    expect(called);
    expect(path.get("points")).toEqual([
      [100, 100],
      [100, 150],
      [500, 150],
      [500, 200],
    ]);
    expect(label.get("x")).toBe(300);
    expect(label.get("y")).toBe(150);
  });

  it("label background should work", () => {
    const layer = new EdgeLayer();
    const method = getEdgeMethods("line");
    method.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      label: {
        autoRotate: true,
        text: "test label",
        background: {
          fillStyle: "#ccc",
        },
      },
    });
    const label: any = layer.find((shape) => shape.get("_label"));
    const backShape: any = layer.find((shape) => shape.get("_background"));
    expect(backShape);
    expect(backShape.getMatrix()).toEqual(label.getMatrix());
    delete label.matrix;
    let bbox = label.getBBox();
    expect(backShape.get("left")).toBe(bbox.left);
    expect(backShape.get("top")).toBe(bbox.top);
    expect(backShape.get("width")).toBe(bbox.width);
    expect(Math.round(backShape.get("height"))).toBe(Math.round(bbox.height));
    expect(backShape.get("fillStyle")).toBe("#ccc");

    method.updatePath(layer, {
      label: {
        autoRotate: true,
        text: "test label",
        background: {
          fillStyle: "#ccc",
        },
      },
      startPoint: [100, 100],
      endPoint: [100, 200],
    });

    expect(backShape.destroyed).toBe(false);
    expect(backShape.getMatrix()).toEqual(label.getMatrix());
    delete label.matrix;
    bbox = label.getBBox();
    expect(backShape.get("left")).toBe(bbox.left);
    expect(backShape.get("top")).toBe(bbox.top);
    expect(backShape.get("width")).toBe(bbox.width);
    expect(Math.round(backShape.get("height"))).toBe(Math.round(bbox.height));

    method.update(layer, {
      label: {
        autoRotate: true,
        text: "update label",
        fontSize: 16,
        background: {
          fillStyle: "#fff",
          strokeStyle: "#666",
        },
      },
      startPoint: [100, 100],
      endPoint: [100, 200],
    });
    expect(backShape.destroyed).toBe(false);
    expect(backShape.getMatrix()).toEqual(label.getMatrix());
    delete label.matrix;
    bbox = label.getBBox();
    expect(backShape.get("left")).toBe(bbox.left);
    expect(backShape.get("top")).toBe(bbox.top);
    expect(backShape.get("width")).toBe(bbox.width);
    expect(Math.round(backShape.get("height"))).toBe(Math.round(bbox.height));
    expect(backShape.get("fillStyle")).toBe("#fff");
    expect(backShape.get("strokeStyle")).toBe("#666");

    method.update(layer, {
      label: {
        autoRotate: true,
        text: "update label",
        fontSize: 16,
        background: null,
      },
      startPoint: [100, 100],
      endPoint: [100, 200],
    });
    expect(backShape.destroyed);
  });

  it("bugfix: ArrowType configs should work", () => {
    const layer = new EdgeLayer();
    const method = getEdgeMethods("line");
    method.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      endArrow: {
        width: 10,
        height: 10,
      },
    });

    const path = layer.children[0];
    expect(path.get("endArrow")).toEqual({
      width: 10,
      height: 10,
    });

    method.update(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      endArrow: false,
    });
    expect(path.get("endArrow")).toBe(false);

    method.update(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      endArrow: {
        width: 4,
        height: 6,
      },
    });
    expect(path.get("endArrow")).toEqual({
      width: 4,
      height: 6,
    });
  });

  it("bugfix: straight turningLine should work", () => {
    const layer = new EdgeLayer();
    const method = getEdgeMethods("turningLine");
    method.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      controlPoints: [
        [100, 200],
        [120, 200],
        [150, 200],
        [180, 200],
      ],
    });
    let path = layer.children[0];
    expect(path.type).toBe("path");
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 100, 193.6338022763242],
      // ['A', 6.366197723675814, 6.366197723675814, 0, 0, 0, 106.36619772367581, 200,],
      ["Q", 100, 200, 106.36619772367581, 200, 10],
      ["L", 120, 200],
      ["L", 150, 200],
      ["L", 180, 200],
      ["L", 200, 200],
    ]);

    expect((path as Path).getPointAt(0.5)).toEqual({
      x: 101.59154943091895,
      y: 198.40845056908105,
    });

    layer.clear();
    method.init(layer, {
      startPoint: [100, 100],
      endPoint: [100, 200],
      controlPoints: [
        [100, 140],
        [100, 180],
      ],
    });
    path = layer.children[0];
    expect(path.type).toBe("path");
    expect(path.get("path")).toEqual([
      ["M", 100, 100],
      ["L", 100, 140],
      ["L", 100, 180],
      ["L", 100, 200],
    ]);

    expect((path as Path).getPointAt(0.5)).toEqual({ x: 100, y: 150 });
  });

  it("bugfix: hLine when dx or dy < 0 and radius > -2dx(or -2dy)  should work", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("hLine");
    const line = lineMethods.init(layer, {
      startPoint: [100, 200],
      endPoint: [400, 100],
      styles: { radius: 80 },
    });

    expect(line.get("path")).toEqual([
      ["M", 100, 200],
      ["H", 200],
      ["Q", 250, 200, 250, 150, 78.53981633974483],
      ["V", 150],
      ["Q", 250, 100, 300, 100, 78.53981633974483],
      ["H", 400],
    ]);

    lineMethods.update(layer, {
      startPoint: [150, 100],
      endPoint: [100, 150],
      styles: {
        curvePosition: 0.2,
        radius: 80,
      },
    });

    expect(line.get("path")).toEqual([
      ["M", 150, 100],
      ["H", 150],
      ["Q", 140, 100, 140, 110, 15.707963267948966],
      ["V", 140],
      ["Q", 140, 150, 130, 150, 15.707963267948966],
      ["H", 100],
    ]);
  });

  it("bugfix: vLine when dx or dy < 0 and radius > -2dx(or -2dy)  should work", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("vLine");
    const line = lineMethods.init(layer, {
      startPoint: [200, 100],
      endPoint: [100, 400],
      styles: { radius: 80 },
    });
    expect(line.get("path")).toEqual([
      ["M", 200, 100],
      ["V", 200],
      ["Q", 200, 250, 150, 250, 78.53981633974483],
      ["H", 150],
      ["Q", 100, 250, 100, 300, 78.53981633974483],
      ["V", 400],
    ]);

    lineMethods.update(layer, {
      startPoint: [100, 150],
      endPoint: [150, 100],
      styles: {
        curvePosition: 0.2,
        radius: 80,
      },
    });

    expect(line.get("path")).toEqual([
      ["M", 100, 150],
      ["V", 150],
      ["Q", 100, 140, 110, 140, 15.707963267948966],
      ["H", 140],
      ["Q", 150, 140, 150, 130, 15.707963267948966],
      ["V", 100],
    ]);
  });

  it("feat: when vLine dx = 0 only have V Path", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("vLine");
    const line = lineMethods.init(layer, {
      startPoint: [200, 100],
      endPoint: [200, 400],
      styles: { radius: 80 },
    });
    expect(line.get("path")).toEqual([
      ["M", 200, 100],
      ["V", 400],
    ]);
  });

  it("feat: when hLine dy = 0 only have H Path", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("hLine");
    const line = lineMethods.init(layer, {
      startPoint: [200, 100],
      endPoint: [400, 100],
      styles: { radius: 80 },
    });
    expect(line.get("path")).toEqual([
      ["M", 200, 100],
      ["H", 400],
    ]);
  });

  it("feat: hLine should work with curveOffset", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("hLine");
    let line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      styles: {
        radius: 4,
        curvePosition: 0,
        curveOffset: 20,
      },
    });
    const length = Math.PI * 2;
    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["H", 116],
      ["Q", 120, 100, 120, 104, length],
      ["V", 196],
      ["Q", 120, 200, 124, 200, length],
      ["H", 200],
    ]);

    layer.clear();
    line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      styles: {
        radius: 4,
        curvePosition: 0,
        curveOffset: -20,
      },
    });
    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["H", 146],
      ["Q", 150, 100, 150, 104, length],
      ["V", 196],
      ["Q", 150, 200, 154, 200, length],
      ["H", 200],
    ]);
  });

  it("feat: vLine should work with curveOffset", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("vLine");
    let line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      styles: {
        radius: 4,
        curvePosition: 0,
        curveOffset: 20,
      },
    });
    const length = Math.PI * 2;
    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["V", 116],
      ["Q", 100, 120, 104, 120, length],
      ["H", 196],
      ["Q", 200, 120, 200, 124, length],
      ["V", 200],
    ]);

    layer.clear();
    line = lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 200],
      styles: {
        radius: 4,
        curvePosition: 0,
        curveOffset: 120,
      },
    });

    expect(line.get("path")).toEqual([
      ["M", 100, 100],
      ["V", 146],
      ["Q", 100, 150, 104, 150, length],
      ["H", 196],
      ["Q", 200, 150, 200, 154, length],
      ["V", 200],
    ]);
  });

  it("bugfix: autoRotate edge should update background", () => {
    const layer = new EdgeLayer();
    const lineMethods = getEdgeMethods("hCubic");
    lineMethods.init(layer, {
      startPoint: [100, 100],
      endPoint: [200, 100],
      label: {
        text: "test label",
        autoRotate: true,
        background: {
          fillStyle: "#fff",
        },
      },
    });

    const [, rect, text] = layer.children;
    expect(rect.getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
    expect(text.getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);

    lineMethods.updatePath(layer, {
      startPoint: [100, 100],
      endPoint: [200, 50],
      label: {
        text: "test label",
        autoRotate: true,
        background: {
          fillStyle: "#fff",
        },
      },
    });
    expect(rect.getMatrix()).toEqual([
      0.7071067906141363, -0.7071067717589586, 0.7071067717589586,
      0.7071067906141363, -9.099026474042347, 128.03300646778357,
    ]);
    expect(text.getMatrix()).toEqual([
      0.7071067906141363, -0.7071067717589586, 0.7071067717589586,
      0.7071067906141363, -9.099026474042347, 128.03300646778357,
    ]);

    lineMethods.updatePath(layer, {
      startPoint: [100, 50],
      endPoint: [200, 50],
      label: {
        text: "test label",
        autoRotate: true,
        background: {
          fillStyle: "#fff",
        },
      },
    });
    expect(rect.getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
    expect(text.getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
  });
});
