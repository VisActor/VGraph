import { NodeLayer } from "../../src";
import { NODE_TYPES } from "../../src/consts/node_types";
import {
  getNodeMethods,
  registerNode,
  unRegisterNode,
} from "../../src/models/factories";

describe("src/factories/base.ts", () => {
  it("base shape with default style should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const rectNode = getNodeMethods("rect");
    const keyShape = rectNode.init(layer, {
      type: "rect",
      label: {
        text: "text",
        textAlign: "left",
        textBaseline: "top",
      },
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });

    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-75);
    expect(keyShape.get("top")).toBe(-50);
    expect(keyShape.get("width")).toBe(150);
    expect(keyShape.get("height")).toBe(100);
    expect(keyShape.get("strokeStyle")).toBe("#E1E4EB");

    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("text")).toBe("text");
      expect(label.get("x")).toBe(-63);
      expect(label.get("y")).toBe(-50);
      expect(label.get("width")).toBe(126);
      // expect(label.get('height')).toBe(76);
      expect(label.get("textAlign")).toBe("left");
      expect(label.get("textBaseline")).toBe("top");
    }

    rectNode.update(layer, {
      type: "rect",
      label: {
        text: "update text",
        textAlign: "left",
        textBaseline: "top",
      },
      x: 100,
      y: 100,
      width: 50,
      height: 100,
      paddingLeft: 10,
    });

    expect(keyShape.get("left")).toBe(-25);
    expect(keyShape.get("width")).toBe(50);
    expect(label);
    if (label) {
      expect(label.get("text")).toBe("update text");
      expect(label.get("x")).toBe(-15);
      expect(label.get("y")).toBe(-50);
      expect(label.get("width")).toBe(28);
      // expect(label.get('height')).toBe(76);
    }

    layer.destroy();
  });

  it("base shape with custom styles should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const circleNode = getNodeMethods("circle");
    const keyShape = circleNode.init(layer, {
      type: "circle",
      label: {
        text: "label text",
        offsetX: 10,
        offsetY: 20,
        width: 100,
        height: 50,
        textOverflow: "ellipsis",
      },
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      linkCenter: true,
      fillStyle: "#fff",
      strokeStyle: "green",
    });
    expect(keyShape.type).toBe("circle");
    expect(keyShape.get("cx")).toBe(0);
    expect(keyShape.get("cy")).toBe(0);
    expect(keyShape.get("r")).toBe(100);
    expect(keyShape.get("strokeStyle")).toBe("green");
    expect(keyShape.get("fillStyle")).toBe("#fff");
    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("text")).toBe("label text");
      expect(label.get("x")).toBe(10);
      expect(label.get("y")).toBe(20);
      expect(label.get("textAlign")).toBe("start");
      expect(label.get("textBaseline")).toBe("middle");
    }

    circleNode.update(layer, {
      x: 100,
      y: 100,
      r: 100,
      linkCenter: true,
      fillStyle: "yellow",
      strokeStyle: "red",
    });
    expect(keyShape.get("strokeStyle")).toBe("red");
    expect(keyShape.get("fillStyle")).toBe("yellow");
    expect(label?.destroyed);
    layer.destroy();
  });

  it("default image shape configs should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });

    const imageNode = getNodeMethods("image");
    const keyShape = imageNode.init(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      paddingLeft: 10,
      image: {
        width: 80,
        height: 80,
        url: "xxxxx",
      },
      label: "default label",
    });
    expect(keyShape.type).toBe("rect");
    const image = layer.findById("nodeImage");
    expect(image).not.toBe(null);
    if (image) {
      expect(image.get("left")).toBe(-40);
      expect(image.get("top")).toBe(-40);
      expect(image.get("width")).toBe(80);
      expect(image.get("height")).toBe(80);
      expect(image.get("url")).toBe("xxxxx");
    }
    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("x")).toBe(0);
      expect(label.get("y")).toBe(54);
      // padding should not work for image node
      expect(label.get("width")).toBeUndefined();
      expect(label.get("text")).toBe("default label");
      expect(label.get("textAlign")).toBe("center");
    }

    imageNode.update(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      image: {
        width: 60,
        height: 80,
        url: "xxxxx",
      },
      label: {
        text: "default text",
        offsetX: 50,
        offsetY: 50,
      },
    });

    if (image) {
      expect(image.get("left")).toBe(-30);
    }
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("x")).toBe(50);
      expect(label.get("y")).toBe(100);
      expect(label.get("text")).toBe("default text");
    }
  });

  it("exnted node should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const titleNode = getNodeMethods("title");
    const keyShape = titleNode.init(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: "title node desc",
      title: "this is title",
    });

    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-75);
    expect(keyShape.get("top")).toBe(-50);
    expect(keyShape.get("width")).toBe(150);
    expect(keyShape.get("height")).toBe(100);
    expect(keyShape.get("strokeStyle")).toBe("#E1E4EB");

    const backRect = layer.findById("titleBackRect");
    expect(backRect).not.toBe(null);
    if (backRect) {
      expect(backRect.get("left")).toBe(-74.5);
      expect(backRect.get("top")).toBe(-49.5);
      expect(backRect.get("width")).toBe(149);
      expect(backRect.get("height")).toBe(24);
    }

    const title = layer.findById("titleText");
    expect(title).not.toBe(null);
    if (title) {
      expect(title.get("x")).toBe(-63);
      expect(title.get("y")).toBe(-38);
      expect(title.get("text")).toBe("this is title");
      expect(title.get("textAlign")).toBe("start");
      expect(title.get("textBaseline")).toBe("middle");
    }

    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("text")).toBe("title node desc");
      expect(label.get("x")).toBe(-63);
      expect(label.get("y")).toBe(-14);
      expect(label.get("width")).toBe(126);
      expect(label.get("height")).toBe(52);
      expect(label.get("textAlign")).toBe("left");
      expect(label.get("textBaseline")).toBe("top");
    }
  });

  it("tag node should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const tagNode = getNodeMethods("tag");
    const nodeConfigs = {
      x: 100,
      y: 100,
      label: "tag node desc",
      title: {
        text: "title",
        textAlign: "right",
      },
      theme: "outlined",
      color: "#F59400",
      radius: 4,
      icon: "&#xe68c;",
    };
    const keyShape = tagNode.init(layer, nodeConfigs);

    expect(layer.children.length).toBe(5);
    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-70);
    expect(keyShape.get("top")).toBe(-20);
    expect(keyShape.get("width")).toBe(140);
    expect(keyShape.get("height")).toBe(40);
    expect(keyShape.get("strokeStyle")).toBe("#F59400");

    const icon = layer.findById("iconShape");
    expect(icon).not.toBe(null);
    if (icon) {
      expect(icon.get("x")).toBe(-54);
      expect(icon.get("y")).toBe(0);
      expect(icon.get("size")).toBe(16);
      expect(icon.get("fillStyle")).toBe("#F59400");
    }

    const iconBackground = layer.findById("iconBackground");
    expect(iconBackground).not.toBe(null);
    if (iconBackground) {
      expect(iconBackground.get("left")).toBe(-69.5);
      expect(iconBackground.get("top")).toBe(-19.5);
      expect(iconBackground.get("width")).toBe(31);
      expect(iconBackground.get("height")).toBe(39);
      expect(iconBackground.get("fillStyle")).toBe("#fce4bf");
    }

    const titleText = layer.findById("titleText");
    expect(titleText).not.toBe(null);
    if (titleText) {
      expect(titleText.get("x")).toBe(58);
      expect(titleText.get("fillStyle")).toBe("#21252C");
    }
  });

  it("capsule node should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const capsuleNode = getNodeMethods("capsule");
    const keyShape = capsuleNode.init(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: {
        text: "capsule node desc",
        textAlign: "center",
      },
      theme: "filled",
      color: "#F59400",
      icon: "&#xe68c;",
    });
    expect(layer.children.length).toBe(4);
    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-75);
    expect(keyShape.get("top")).toBe(-50);
    expect(keyShape.get("width")).toBe(150);
    expect(keyShape.get("height")).toBe(100);
    expect(keyShape.get("radius")).toBe(50);
    expect(keyShape.get("strokeStyle")).toBe(null);

    const icon = layer.findById("iconShape");
    expect(icon).not.toBe(null);
    if (icon) {
      expect(icon.get("x")).toBe(-25);
      expect(icon.get("y")).toBe(0);
      expect(icon.get("size")).toBe(40);
      expect(icon.get("fillStyle")).toBe("#ffffff");
    }

    const iconBackground = layer.findById("iconBackground");
    expect(iconBackground).not.toBe(null);
    if (iconBackground) {
      expect(iconBackground.get("cx")).toBe(-25);
      expect(iconBackground.get("cy")).toBe(0);
      expect(iconBackground.get("r")).toBe(40);
      expect(iconBackground.get("fillStyle")).toBe("#f8af40");
    }

    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("x")).toBe(45);
      expect(label.get("y")).toBe(0);
    }
  });

  it("icon node should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const titleNode = getNodeMethods("icon");
    const keyShape = titleNode.init(layer, {
      x: 100,
      y: 100,
      width: 24,
      height: 24,
      label: "title node desc",
      radius: 4,
    });
    expect(layer.children.length).toBe(3);
    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-12);
    expect(keyShape.get("top")).toBe(-12);
    expect(keyShape.get("width")).toBe(24);
    expect(keyShape.get("height")).toBe(24);
    expect(keyShape.get("shadowBlur")).toBe(20);
    expect(keyShape.get("radius")).toEqual(4);

    const icon = layer.findById("iconShape");
    expect(icon).not.toBe(null);
    if (icon) {
      expect(icon.get("x")).toBe(0);
      expect(icon.get("y")).toBe(0);
      expect(icon.get("size")).toBe(12);
      expect(icon.get("fillStyle")).toBe("#7F8897");
    }
  });

  it("category node should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const titleNode = getNodeMethods("category");
    const keyShape = titleNode.init(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: "title node desc",
      color: "blue",
      strokeStyle: "#eee",
      radius: 4,
    });
    expect(layer.children.length).toBe(3);
    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-75);
    expect(keyShape.get("top")).toBe(-50);
    expect(keyShape.get("width")).toBe(150);
    expect(keyShape.get("height")).toBe(100);
    expect(keyShape.get("strokeStyle")).toBe("#eee");

    const category = layer.findById("categoryRect");
    expect(category).not.toBe(null);
    if (category) {
      expect(category.get("left")).toBe(-75);
      expect(category.get("top")).toBe(-50);
      expect(category.get("width")).toBe(4);
      expect(category.get("height")).toBe(100);
      expect(category.get("radius")).toEqual([4, 0, 0, 4]);
      expect(category.get("fillStyle")).toBe("blue");
    }
  });

  it("bugfix: category label text 宽度和 x 能正确计算", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const titleNode = getNodeMethods("category");
    const keyShape = titleNode.init(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: "title node desc",
      color: "blue",
      strokeStyle: "#eee",
      radius: 4,
    });
    expect(layer.children.length).toBe(3);
    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-75);
    expect(keyShape.get("top")).toBe(-50);
    expect(keyShape.get("width")).toBe(150);
    expect(keyShape.get("height")).toBe(100);
    expect(keyShape.get("strokeStyle")).toBe("#eee");

    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("text")).toBe("title node desc");
      expect(label.get("x")).toBe(-59);
      expect(label.get("y")).toBe(0);
      expect(label.get("width")).toBe(122);
      expect(label.get("textAlign")).toBe("left");
      expect(label.get("textBaseline")).toBe("middle");
    }

    titleNode.update(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: "title node desc",
      color: "blue",
      strokeStyle: "#eee",
      position: "top",
      radius: 4,
    });

    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("text")).toBe("title node desc");
      expect(label.get("x")).toBe(-63);
      expect(label.get("y")).toBe(0);
      expect(label.get("width")).toBe(126);
      expect(label.get("textAlign")).toBe("left");
      expect(label.get("textBaseline")).toBe("middle");
    }
  });

  it("bugfix: 原本无 label 通过更新新增 label 能正常更新销毁", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const rectNode = getNodeMethods("rect");
    rectNode.init(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    expect(layer.children.length).toBe(1);
    const keyShape = layer.children[0];
    expect(keyShape.type).toBe("rect");
    rectNode.update(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: "add label",
    });
    expect(layer.children.length).toBe(2);
    const label = layer.children[1];
    expect(label.get("_label"));
    expect(label.get("text")).toBe("add label");
    rectNode.update(layer, {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: "change label",
    });
    expect(label.get("_label"));
    expect(label.get("text")).toBe("change label");
  });

  it("node label rotate should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 10,
      height: 10,
    });
    const circleNode = getNodeMethods("circle");
    circleNode.init(layer, {
      x: 100,
      y: 100,
      width: 10,
      height: 10,
      label: {
        text: "rotate label",
        rotate: Math.PI / 4,
      },
    });
    const label = layer.children[1];
    expect(label.get("_label"));
    expect(label.get("text")).toBe("rotate label");
    expect(label.get("x")).toBe(0);
    expect(label.get("y")).toBe(0);
    expect(label.get("textAlign")).toBe("center");
    expect(label.getMatrix()).not.toEqual([1, 0, 0, 1, 0, 0]);

    circleNode.update(layer, {
      x: 100,
      y: 100,
      width: 10,
      height: 10,
      label: {
        text: "rotate label",
        textAlign: "left",
        offsetX: 10,
        rotate: (Math.PI / 4) * 3,
      },
    });

    expect(label.get("x")).toBe(-10);
    expect(label.get("y")).toBe(-0);
    expect(label.get("textAlign")).toBe("right");
    expect(label.getMatrix()).not.toEqual([1, 0, 0, 1, 0, 0]);
  });

  it("should work for unregister custom edge", () => {
    registerNode("custom-node", { shape() {} });
    expect(getNodeMethods("custom-node").type).toBe("custom-node");
    unRegisterNode("custom-node");
    expect(getNodeMethods("custom-node").type).toBe(NODE_TYPES.RECT);
  });

  it("default imageTag should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 140,
      height: 40,
    });
    const imageTagMethod = getNodeMethods("imageTag");
    imageTagMethod.init(layer, {
      x: 100,
      y: 100,
      width: 140,
      height: 40,
      strokeStyle: "#666",
      radius: 4,
      label: "tetetetetetet",
      image: "wwww",
    });
    expect(layer.children.length).toBe(3);
    const rect = layer.children[0];
    expect(rect.get("width")).toBe(140);
    expect(rect.get("height")).toBe(40);
    expect(rect.get("radius")).toBe(4);
    expect(rect.get("strokeStyle")).toBe("#666");
    expect(rect.get("fillStyle")).toBe("#fff");

    const text = layer.children[1];
    expect(text.get("width")).toBe(84);
    expect(text.get("text")).toBe("tetetetetetet");
    expect(text.get("textOverflow")).toBe("ellipsis");

    const img = layer.children[2];
    expect(img.get("left")).toBe(-58);
    expect(img.get("top")).toBe(-12);
    expect(img.get("height")).toBe(24);
    expect(img.get("width")).toBe(24);
    expect(img.get("url")).toBe("wwww");
  });

  it("custom imageTag should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 140,
      height: 40,
    });
    const imageTagMethod = getNodeMethods("imageTag");
    imageTagMethod.init(layer, {
      x: 100,
      y: 100,
      width: 140,
      height: 40,
      strokeStyle: "#666",
      radius: 4,
      label: {
        width: 50,
        text: "111",
        textAlign: "center",
      },
      image: {
        size: 16,
        cursor: "pointer",
        url: "wwww",
        task: "1111",
      },
    });
    expect(layer.children.length).toBe(3);
    const rect = layer.children[0];
    expect(rect.get("width")).toBe(140);
    expect(rect.get("height")).toBe(40);
    expect(rect.get("radius")).toBe(4);
    expect(rect.get("strokeStyle")).toBe("#666");
    expect(rect.get("fillStyle")).toBe("#fff");

    const text = layer.children[1];
    expect(text.get("width")).toBe(50);
    expect(text.get("text")).toBe("111");
    expect(text.get("textAlign")).toBe("center");
    expect(text.get("textOverflow")).toBe("ellipsis");

    const img = layer.children[2];
    expect(img.get("left")).toBe(-62);
    expect(img.get("top")).toBe(-8);
    expect(img.get("height")).toBe(16);
    expect(img.get("width")).toBe(16);
    expect(img.get("url")).toBe("wwww");
    expect(img.get("cursor")).toBe("pointer");
    expect(img.get("task")).toBe("1111");
  });

  it("bugfix: triggerId should be correctly set to keyShape", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 140,
      height: 40,
    });
    const rectMethod = getNodeMethods("rect");

    rectMethod.init(layer, {
      x: 100,
      y: 100,
      width: 140,
      height: 40,
      triggerId: "trigger",
    });

    expect(layer.children.length).toBe(1);
    expect(layer.children[0].type).toBe("rect");
    expect(layer.children[0].get("triggerId")).toBe("trigger");
    layer.clear();

    const imageTagMethod = getNodeMethods("imageTag");
    imageTagMethod.init(layer, {
      x: 100,
      y: 100,
      width: 140,
      height: 40,
      strokeStyle: "#666",
      triggerId: "trigger2",
      image: {
        size: 16,
        cursor: "pointer",
        url: "wwww",
        task: "1111",
        triggerId: "trigger3",
      },
    });

    expect(layer.children.length).toBe(2);
    expect(layer.children[0].type).toBe("rect");
    expect(layer.children[0].get("triggerId")).toBe("trigger2");
    expect(layer.children[1].type).toBe("image");
    expect(layer.children[1].get("triggerId")).toBe("trigger3");
  });

  it("bugfix: title method should not change title configs", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 140,
      height: 40,
    });
    const titleMethod = getNodeMethods("title");

    const titleConfigs: any = {
      text: "title",
      height: 28,
      fillStyle: "rgba(20, 20, 20, 0.9)",
      backgroundColor: "#E0E9FF",
      textOverflow: "ellipsis",
      cursor: "pointer",
    };

    titleMethod.init(layer, {
      type: "title",
      x: 500,
      y: 200,
      width: 176,
      height: 82,
      strokeStyle: "#E1E4E8",
      radius: 4,
      cursor: "pointer",
      title: titleConfigs,
      label: {
        text: "label",
        color: "rgba(20, 20, 20, 0.45)",
        fontSize: 10,
        triggerId: "executeNodeParams",
        cursor: "pointer",
      },
    });

    expect(titleConfigs.textBaseline).toBe(undefined);
    expect(layer.children[2].get("fillStyle")).toBe("#E0E9FF");
    expect(layer.children[3].get("fillStyle")).toBe("rgba(20, 20, 20, 0.9)");
    expect(layer.children[3].get("textBaseline")).toBe("middle");
    expect(layer.children[3].get("x")).toBe(-76);
    expect(layer.children[3].get("y")).toBe(-27);

    titleMethod.update(layer, {
      type: "title",
      x: 500,
      y: 200,
      width: 176,
      height: 82,
      strokeStyle: "#E1E4E8",
      radius: 4,
      cursor: "pointer",
      title: {
        ...titleConfigs,
        fillStyle: "#FFF",
        backgroundColor: "#F50",
      },
      label: {
        text: "label",
        color: "rgba(20, 20, 20, 0.45)",
        fontSize: 10,
        triggerId: "executeNodeParams",
        cursor: "pointer",
      },
    });

    expect(titleConfigs.textBaseline).toBe(undefined);
    expect(layer.children[2].get("fillStyle")).toBe("#F50");
    expect(layer.children[3].get("fillStyle")).toBe("#FFF");
    expect(layer.children[3].get("textBaseline")).toBe("middle");
    expect(layer.children[3].get("x")).toBe(-76);
    expect(layer.children[3].get("y")).toBe(-27);
  });

  it("rhombus node should work", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    const method = getNodeMethods("rhombus");
    const keyShape = method.init(layer, {
      label: "text",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
    expect(keyShape.type).toBe("rhombus");
    expect(keyShape.get("left")).toBe(-75);
    expect(keyShape.get("top")).toBe(-50);
    expect(keyShape.get("width")).toBe(150);
    expect(keyShape.get("height")).toBe(100);
    expect(keyShape.get("radius")).toBe(0);
    expect(keyShape.get("strokeStyle")).toBe("#E1E4EB");

    const label = layer.find((shape) => shape.get("_label"));
    expect(label).not.toBe(null);
    if (label) {
      expect(label.get("text")).toBe("text");
      expect(label.get("x")).toBe(0);
      expect(label.get("y")).toBe(0);
      expect(label.get("width")).toBe(126);
      expect(label.get("textAlign")).toBe("center");
      expect(label.get("textBaseline")).toBe("middle");
    }

    method.update(layer, {
      type: "rect",
      label: {
        text: "update text",
        textAlign: "left",
        textBaseline: "top",
      },
      x: 100,
      y: 100,
      width: 50,
      height: 100,
      radius: 8,
    });
    expect(keyShape.get("left")).toBe(-25);
    expect(keyShape.get("width")).toBe(50);
    expect(keyShape.get("radius")).toBe(8);
    expect(label);
    if (label) {
      expect(label.get("text")).toBe("update text");
      expect(label.get("x")).toBe(-13);
      expect(label.get("y")).toBe(-50);
      expect(label.get("width")).toBe(26);
    }
    layer.destroy();
  });

  it("bugfix: IMAGE_TAG should work with updateData", () => {
    const layer = new NodeLayer({
      x: 100,
      y: 100,
      width: 140,
      height: 40,
    });
    const imageTagMethod = getNodeMethods("imageTag");
    imageTagMethod.init(layer, {
      x: 100,
      y: 100,
      width: 140,
      height: 40,
      strokeStyle: "#666",
      radius: 4,
      label: "tetetetetetet",
      image: "wwww",
    });
    expect(layer.children.length).toBe(3);
    const rect = layer.children[0];
    expect(rect.get("width")).toBe(140);
    expect(rect.get("height")).toBe(40);
    expect(rect.get("radius")).toBe(4);
    expect(rect.get("strokeStyle")).toBe("#666");
    expect(rect.get("fillStyle")).toBe("#fff");

    const text = layer.children[1];
    expect(text.get("width")).toBe(84);
    expect(text.get("text")).toBe("tetetetetetet");
    expect(text.get("textOverflow")).toBe("ellipsis");

    const img = layer.children[2];
    expect(img.get("left")).toBe(-58);
    expect(img.get("top")).toBe(-12);
    expect(img.get("height")).toBe(24);
    expect(img.get("width")).toBe(24);
    expect(img.get("url")).toBe("wwww");
    imageTagMethod.update(layer, {
      x: 100,
      y: 100,
      width: 140,
      height: 40,
      strokeStyle: "#666",
      radius: 4,
      label: "tetetetetetet",
      image: {
        url: "http",
        size: 48,
      },
    });
    expect(img.get("left")).toBe(-46);
    expect(img.get("top")).toBe(-24);
    expect(img.get("height")).toBe(48);
    expect(img.get("width")).toBe(48);
    expect(img.get("url")).toBe("http");
  });
});
