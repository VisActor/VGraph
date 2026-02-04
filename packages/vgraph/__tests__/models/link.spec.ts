import { LinkUtils, Graph, Text } from "../../src";

describe("/src/node_addons/link.ts", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 20,
        fillStyle: "#666",
      };
    },
  });

  const node = graph.add("node", { id: "111" });

  it("should work with default options", () => {
    let clicked = false;
    const linkLayer = LinkUtils.init(node.layer, {
      x: 0,
      y: 0,
      text: "link",
      onClick() {
        clicked = true;
      },
    });

    const text = linkLayer.children[0];
    expect(linkLayer.children.length).toBe(1);
    expect(text.type).toBe("text");
    expect(text.get("fillStyle")).toBe("#3073F2");
    expect(text.get("text")).toBe("link");
    linkLayer.emit("mouseenter");
    expect(text.get("fillStyle")).toBe("#5391F5");
    linkLayer.emit("mouseleave");
    expect(text.get("fillStyle")).toBe("#3073F2");
    linkLayer.emit("mousedown");
    expect(text.get("fillStyle")).toBe("#1E54C9");
    linkLayer.emit("mouseup");
    expect(text.get("fillStyle")).toBe("#3073F2");
    linkLayer.emit("click");
    expect(clicked);
    linkLayer.destroy();
  });

  it("should work with custom options", () => {
    let clicked = false;
    const linkLayer = LinkUtils.init(node.layer, {
      x: 0,
      y: 0,
      text: "very very long link",
      maxWidth: 50,
      icon: {
        icon: "1",
        size: 16,
      },
      label: {
        fontSize: 14,
      },
      onClick() {
        clicked = true;
      },
      defaultColor: "#666",
      hoverColor: "#ccc",
      activeColor: "#000",
    });
    const text = linkLayer.children[0];
    const icon = linkLayer.children[1];

    expect(linkLayer.children.length).toBe(2);
    expect(text.type).toBe("text");
    expect(text.get("fontSize")).toBe(14);
    expect(icon.type).toBe("icon");
    expect(icon.get("size")).toBe(16);
    expect(text.get("fillStyle")).toBe("#666");
    expect(icon.get("fillStyle")).toBe("#666");
    linkLayer.emit("mouseenter");
    expect(text.get("fillStyle")).toBe("#ccc");
    expect(icon.get("fillStyle")).toBe("#ccc");
    linkLayer.emit("mouseleave");
    expect(text.get("fillStyle")).toBe("#666");
    expect(icon.get("fillStyle")).toBe("#666");
    linkLayer.emit("mousedown");
    expect(text.get("fillStyle")).toBe("#000");
    expect(icon.get("fillStyle")).toBe("#000");
    linkLayer.emit("mouseup");
    expect(text.get("fillStyle")).toBe("#666");
    expect(icon.get("fillStyle")).toBe("#666");
    linkLayer.emit("click");
    expect(clicked);
  });

  it("should work with disabled options", () => {
    let clicked = false;
    const linkLayer = LinkUtils.init(node.layer, {
      x: 0,
      y: 0,
      text: "very very long link",
      disabled: true,
      maxWidth: 50,
      onClick() {
        clicked = true;
      },
    });

    const text = linkLayer.children[0] as Text;
    expect(linkLayer.children.length).toBe(1);
    expect(text.type).toBe("text");
    expect(text.get("fillStyle")).toBe("#9CC6FA");
    expect(text.getDrawText()[0]).not.toBe("very very long link");
    expect(text.getDrawText()[0].endsWith("..."));
    linkLayer.emit("mouseenter");
    expect(text.get("fillStyle")).toBe("#9CC6FA");
    linkLayer.emit("mousedown");
    expect(text.get("fillStyle")).toBe("#9CC6FA");
    linkLayer.emit("click");
    expect(clicked).toBe(false);
    linkLayer.destroy();
  });
});
