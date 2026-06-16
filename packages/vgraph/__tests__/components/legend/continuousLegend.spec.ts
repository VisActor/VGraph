import { Graph } from "../../../src/graph";
import { ContinuousLegend as Legend } from "../../../src/components/legend";
import miserablesData from "../../../examples/static/miserables.json";
import trafficData from "../../../examples/static/traffic.json";

describe("src/legend", () => {
  const graphDiv = document.createElement("div");
  const legendDiv = document.createElement("div");

  it("should work with color mapping", () => {
    const edgeMap = (value: number, min: number, base: number) => {
      return (value - min) / base;
    };
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      minRatio: 0.3,
      maxRatio: 10,
      linkCenter: true,
      setDefaultNode(node) {
        return {
          type: "rect",
          radius: 2,
          width: 20,
          height: 20,
          fillStyle: "#4c72b0",
          anchors: [
            [0, 0.25],
            [0, 0.75],
            [0.25, 0],
            [0.25, 1],
            [0.75, 0],
            [0.75, 1],
            [1, 0.25],
            [1, 0.75],
          ],
        };
      },
      setDefaultEdge(edge) {
        return {
          lineWidth: 3,
          strokeStyle: [
            "#fff5f0",
            "#fee0d2",
            "#fcbba1",
            "#fc9272",
            "#fb6a4a",
            "#ef3b2c",
            "#cb181d",
            "#a50f15",
            "#67000d",
          ][Math.round(edgeMap(edge.volume, 4000, 24000) * 8)],
          endArrow: true,
          sourceAnchor: edge.sourceAnchor,
          targetAnchor: edge.targetAnchor,
        };
      },
    });
    graph.data(trafficData);

    const legend = new Legend(graph, {
      container: legendDiv,
      encodeAttr: "volume",
      color: {
        min: "#fff5f0",
        max: "#67000d",
      },
      target: "edge",
      width: 200,
      height: 100,
      title: {
        text: "Legend",
        background: {
          height: 20,
          fillStyle: "#eee",
        },
      },
      slide: {
        enable: true,
        filter: true,
      },
    });

    // 参数项配置
    const { target, encodeAttr, value, label, orient, rail, color, slide } =
      legend.options;
    expect(target).toBe("edge");
    expect(legend.encodeType).toBe("color");
    expect(encodeAttr).toBe("volume");
    expect(color).toEqual({
      max: "#67000d",
      min: "#fff5f0",
    });
    expect(value).toEqual({
      max: 23192,
      min: 4495,
    });
    expect(label).toEqual({
      max: "23192",
      min: "4495",
    });
    expect(orient).toBe("horizontal");
    expect(rail).toEqual({
      length: 80,
      size: 12,
    });
    expect(slide).toEqual({
      enable: true,
      filter: true,
      graphActiveState: "",
      graphBlurState: "",
    });
    // 图例元素
    const nodeLayer = legend.canvas.children[0].children[0];
    const railShape = nodeLayer.children[3];
    const maxLabel = nodeLayer.children[1];
    const railShapeBBox = railShape.getBBox();
    expect(nodeLayer.getMatrix()).toEqual([1, 0, 0, 1, 100, 60]);
    expect(railShapeBBox).toEqual({
      top: -6,
      left: -40,
      width: 80,
      height: 12,
    });
    expect(railShape.get("fillStyle")).toBe("l(0) 0:#fff5f0 1:#67000d");
    const maxLabelBBox = maxLabel.getBBox();
    expect(maxLabelBBox).toMatchObject({
      left: 48,
      top: -7.5,
      height: 15,
    });
    expect(maxLabelBBox.width).toBeCloseTo(27.8076171875, 3);
    // slide 交互
    const { filterValue, valueDiffer, canvas } = legend;
    const leftRect = nodeLayer.children[4];
    const rightRect = nodeLayer.children[5];
    const leftHandler = nodeLayer.children[6];
    const rightHandler = nodeLayer.children[7];
    expect(filterValue).toEqual([4495, 23192]);
    expect(valueDiffer).toBe(18697);
    leftHandler.emit("mousedown", {
      target: leftHandler,
      clientX: 0,
      clientY: 0,
    });
    canvas.emit("mousemove", {
      target: canvas,
      clientX: 20,
      clientY: 0,
    });
    canvas.emit("mouseup", {
      target: canvas,
      clientX: 20,
      clientY: 0,
    });
    expect(leftRect.getBBox()).toEqual({
      top: -6,
      left: -40,
      width: 20,
      height: 12,
    });
    expect(leftHandler.getBBox()).toEqual({
      top: -8,
      left: -22,
      width: 4,
      height: 16,
    });
    expect(legend.filterValue).toEqual([9169.25, 23192]);
    legend.graphTarget.forEach((item: any) => {
      if (
        item.get(encodeAttr) >= legend.filterValue[0] &&
        item.get(encodeAttr) <= legend.filterValue[1]
      ) {
        expect(item.visible).toBe(true);
      } else {
        expect(item.visible).toBe(false);
      }
    });

    rightHandler.emit("mousedown", {
      target: rightHandler,
      clientX: 80,
      clientY: 0,
    });
    canvas.emit("mousemove", {
      target: canvas,
      clientX: 10,
      clientY: 0,
    });
    canvas.emit("mouseup", {
      target: canvas,
      clientX: 10,
      clientY: 0,
    });
    expect(leftRect.getBBox()).toEqual({
      top: -6,
      left: -40,
      width: 10,
      height: 12,
    });
    expect(leftHandler.getBBox()).toEqual({
      top: -8,
      left: -32,
      width: 4,
      height: 16,
    });
    expect(rightRect.getBBox()).toEqual({
      top: -6,
      left: -30,
      width: 70,
      height: 12,
    });
    expect(rightHandler.getBBox()).toEqual({
      top: -8,
      left: -32,
      width: 4,
      height: 16,
    });
    expect(legend.filterValue).toEqual([6832.125, 6832.125]);
  });

  it("should work with size mapping", () => {
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      minRatio: 0.2,
      maxRatio: 8,
      linkCenter: true,
      setDefaultNode() {
        return {
          type: "circle",
          width: 15,
          height: 15,
        };
      },
      setDefaultEdge(edge) {
        return {
          lineWidth: edge.value / 3,
          strokeStyle: "#ccc",
        };
      },
    });
    graph.data(miserablesData);

    const legend = new Legend(graph, {
      container: legendDiv,
      encodeAttr: "value",
      value: {
        min: 0,
        max: 31,
      },
      size: {
        min: 0,
        max: 5,
      },
      target: "edge",
      width: 300,
      height: 150,
      orient: "horizontal",
    });
    // 参数项配置
    const { encodeAttr, value, label, size, slide } = legend.options;
    expect(encodeAttr).toBe("value");
    expect(legend.encodeType).toBe("size");
    expect(size).toEqual({
      min: 0,
      max: 5,
    });
    expect(value).toEqual({
      max: 31,
      min: 0,
    });
    expect(label).toEqual({
      max: "31",
      min: "0",
    });
    expect(slide).toEqual({
      enable: false,
      filter: true,
      graphActiveState: "",
      graphBlurState: "",
    });
    // 图例元素
    const nodeLayer = legend.canvas.children[0].children[0];
    const railShape = nodeLayer.children[3];
    const scaleShape = nodeLayer.children[4];
    expect(nodeLayer.getMatrix()).toEqual([1, 0, 0, 1, 150, 75]);
    expect(railShape.get("fillStyle")).toBe("#0050B3");
    expect(scaleShape.get("path")).toEqual([
      ["M", -40, -6],
      ["L", 40, -6],
      ["L", -40, 6],
      ["Z"],
    ]);
    // 交互数据
    expect(legend.filterValue).toEqual([0, 31]);
    expect(legend.valueDiffer).toBe(31);

    // log 映射
    const legend2 = new Legend(graph, {
      container: legendDiv,
      encodeAttr: "value",
      channel: "lineWidth",
      scale: {
        type: "log",
      },
      target: "edge",
      width: 300,
      height: 150,
      orient: "horizontal",
    });
    const size2 = legend2.options.size;
    expect(legend2.encodeType).toBe("size");
    expect(size2.min).toBeCloseTo(0.33);
    expect(size2.max).toBeCloseTo(10.33);
    expect(legend2.filterValue).toEqual([1, 31]);
    expect(legend2.valueDiffer).toBeCloseTo(Math.pow(10, 31) - Math.pow(10, 1));

    // pow 映射
    const legend3 = new Legend(graph, {
      container: legendDiv,
      encodeAttr: "value",
      channel: "lineWidth",
      scale: {
        type: "pow",
      },
      target: "edge",
      width: 300,
      height: 150,
      orient: "horizontal",
    });
    expect(legend3.filterValue).toEqual([1, 31]);
    expect(legend3.valueDiffer).toBeCloseTo(
      Math.pow(31, 0.5) - Math.pow(1, 0.5)
    );
  });
});
