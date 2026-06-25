import { NodeLayer } from "../../src";
import { ANCHOR_TYPES } from "../../src/consts/node_types";
import {
  getAnchorMethods,
  registerAnchor,
  unRegisterAnchor,
} from "../../src/models/factories";

describe("src/factories/anchors.ts", () => {
  const nodeConfigs = {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
  };
  const nodeLayer = new NodeLayer(nodeConfigs);
  it("should work for dot", () => {
    const dotMethods = getAnchorMethods("dot");
    const dot = dotMethods.init(
      nodeLayer,
      {
        type: "dot",
        show: "always",
        position: [1, 0.5],
        setStyles() {
          return {
            fillStyle: "red",
            size: 4,
          };
        },
      },
      nodeConfigs,
      [50, 0]
    );

    expect(dot.type).toBe("circle");
    expect(dot.get("cx")).toBe(50);
    expect(dot.get("cy")).toBe(0);
    expect(dot.get("r")).toBe(2);
    expect(dot.get("fillStyle")).toBe("red");
    expect(dot.get("strokeStyle")).toBe(undefined);

    dotMethods.updatePosition(dot, [-50, 50]);
    expect(dot.get("cx")).toBe(-50);
    expect(dot.get("cy")).toBe(50);
    expect(dot.get("r")).toBe(2);
  });

  it("should work for hover dot", () => {
    const dotMethods = getAnchorMethods("dot");
    const dot = dotMethods.init(
      nodeLayer,
      {
        type: "dot",
        show: "hover",
        position: [0.5, 0],
        setStyles() {
          return {
            strokeStyle: "green",
            fillStyle: "red",
            size: 4,
          };
        },
      },
      nodeConfigs,
      [0, -50]
    );

    expect(dot.type).toBe("circle");
    expect(dot.get("cx")).toBe(0);
    expect(dot.get("cy")).toBe(-50);
    expect(dot.get("r")).toBe(2);
    expect(dot.get("fillStyle")).toBe("red");
    expect(dot.get("strokeStyle")).toBe("green");
    expect(dot.visible).toBe(false);

    nodeLayer.emit("mouseenter");
    expect(dot.visible);
    nodeLayer.emit("mouseleave");
    expect(dot.visible).toBe(false);

    dotMethods.update(
      dot,
      {
        show: "hover",
        position: [1, 1],
        setStyles() {
          return {
            strokeStyle: "red",
            fillStyle: "green",
            size: 6,
          };
        },
      },
      nodeConfigs,
      [50, 50]
    );

    expect(dot.type).toBe("circle");
    expect(dot.get("cx")).toBe(50);
    expect(dot.get("cy")).toBe(50);
    expect(dot.get("r")).toBe(3);
    expect(dot.get("fillStyle")).toBe("green");
    expect(dot.get("strokeStyle")).toBe("red");
  });

  it("should work for unregister custom anchors", () => {
    registerAnchor("custom-anchor", {});
    expect(getAnchorMethods("custom-anchor").type).toBe("custom-anchor");
    unRegisterAnchor("custom-anchor");
    expect(getAnchorMethods("custom-anchor").type).toBe(ANCHOR_TYPES.DOT);
  });
});
