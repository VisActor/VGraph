import { Graph, Layer, Rect, Text, Group, dragNode } from "../../src";

describe("src/entities/group", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultGroup() {
      return {
        strokeStyle: "blue",
        radius: 4,
        padding: [12, 12, 12, 12],
      };
    },
    setGroupStateStyles(state: string) {
      if (state === "hover") {
        return {
          fillStyle: "red",
        };
      }
      return { strokeStyle: "grey" };
    },
  });

  const group = graph.add("group", {
    id: "group1",
  });

  const node = graph.add("node", {
    id: "node",
    type: "rect",
    x: 100,
    y: 100,
    width: 10,
    height: 10,
  });

  it("create group should work", () => {
    const shape = group.getKeyShape();
    expect(shape.type).toBe("rect");
    expect(shape.get("strokeStyle")).toBe("blue");
    expect(shape.get("radius")).toBe(4);

    expect(group.getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
  });

  it("update should work", () => {
    group.updateData({
      fillStyle: "yellow",
      radius: 10,
    });

    const shape = group.getKeyShape();
    expect(shape.type).toBe("rect");
    expect(shape.get("strokeStyle")).toBe("blue");
    expect(shape.get("fillStyle")).toBe("yellow");
    expect(shape.get("radius")).toBe(10);

    expect(group.getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
  });

  it("add & remove child should work", () => {
    group.addChild(node);

    expect(group.children.length).toBe(1);
    expect(group.children[0]).toEqual(node);
    expect(node.belong).toEqual(group);

    expect(group.getBBox()).toEqual({
      left: 83,
      top: 83,
      width: 34,
      height: 34,
    });
  });

  it("getLinkPoint should work", () => {
    group.updateData({ radius: 4 });
    let point = group.getLinkPoint([100, 300]);
    expect(point).toEqual([100, 117.5]);
    point = group.getLinkPoint([300, 100]);
    expect(point).toEqual([117.5, 100]);
    point = group.getLinkPoint([0, 0]);
    expect(point).toEqual([82.5, 82.5]);

    group.updateData({
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
    });
    point = group.getLinkPoint([100, 300]);
    expect(point).toEqual([100, 117]);
    point = group.getLinkPoint([300, 100]);
    expect(point).toEqual([100, 83]);
    point = group.getLinkPoint([0, 0]);
    expect(point).toEqual([100, 83]);
    group.updateData({ radius: 10 });
  });

  it("set & remove state should work", () => {
    const rect = group.getKeyShape();
    group.setState("hover");
    expect(group.states).toEqual(["hover"]);
    expect(rect.get("strokeStyle")).toBe("blue");
    expect(rect.get("fillStyle")).toBe("red");

    group.setState("other");
    expect(group.states).toEqual(["hover", "other"]);
    expect(rect.get("strokeStyle")).toBe("grey");
    expect(rect.get("fillStyle")).toBe("red");

    group.clearStates();
    expect(rect.get("strokeStyle")).toBe("blue");
    expect(rect.get("fillStyle")).toBe("yellow");
    expect(rect.get("radius")).toBe(10);
  });

  it("group with title should work", () => {
    group.updateData({
      title: {
        text: { text: "test title" },
      },
    });
    expect(group.titleLayer).not.toBe(null);
    expect(group.titleLayer.getMatrix()).toEqual([1, 0, 0, 1, 83, 37]);
    expect(group.titleLayer.children.length).toBe(1);
    let text = group.titleLayer.children[0];
    expect(text).not.toBe(undefined);
    expect(text.get("text")).toBe("test title");
    expect(text.get("x")).toBe(12);
    expect(text.get("y")).toBe(23);
    expect(text.get("width")).toBe(10);
    expect(text.get("textAlign")).toBe("left");
    expect(text.get("textBaseline")).toBe("middle");

    group.updateData({
      titleSize: 24,
      title: {
        text: { text: "test title" },
        icon: { icon: "iconfont code" },
        background: { fillStyle: "#eee" },
      },
    });
    expect(group.titleLayer.children.length).toBe(3);
    const rect = group.titleLayer.children[0];
    const icon = group.titleLayer.children[1];
    text = group.titleLayer.children[2];
    expect(rect.type).toBe("rect");
    expect(rect.get("left")).toBe(0.5);
    expect(rect.get("top")).toBe(0.5);
    expect(rect.get("fillStyle")).toBe("#eee");
    expect(rect.get("width")).toBe(33);
    expect(rect.get("height")).toBe(23);
    expect(icon.get("icon")).toBe("iconfont code");
    expect(icon.get("x")).toBe(15);
    expect(icon.get("y")).toBe(12);
    expect(icon.get("fillStyle")).toBe("rgba(20, 20, 20, 0.65)");
    expect(group.titleLayer.getMatrix()).toEqual([1, 0, 0, 1, 83, 59]);
    group.updateData({
      title: null,
    });
    expect(group.titleLayer).toBe(null);
  });

  it("collapsed & expand should work", () => {
    group.updateData({
      titleSize: 24,
      title: {
        text: { text: "test title" },
        background: { fillStyle: "#eee" },
      },
    });

    group.collapse(false);
    expect(group.getBBox()).toEqual({
      left: 83,
      top: 59,
      width: 34,
      height: 24,
    });

    expect(group.get("collapsed"));
    expect(group.titleLayer.visible);
    expect(node.layer.visible).toBe(false);

    group.expand(false);

    expect(group.getBBox()).toEqual({
      left: 83,
      top: 59,
      width: 34,
      height: 58,
    });

    expect(group.get("collapsed")).toBe(false);
    expect(group.titleLayer.visible);
    expect(node.layer.visible).toBe(true);
  });

  it("collapse & expand with group edge should work", () => {
    const edge = graph.add("edge", {
      source: "group1",
      type: "loop",
      loop: { position: "left" },
    });
    expect(edge.getKeyShape().get("path")[0]).toEqual(["M", 83, 73.5]);
    expect(edge.getKeyShape().get("path")[5]).toEqual(["L", 83, 102.5]);
    group.collapse(false);
    expect(edge.getKeyShape().get("path")[0]).toEqual(["M", 83, 65]);
    expect(edge.getKeyShape().get("path")[5]).toEqual(["L", 83, 77]);
    group.expand(false);
    expect(edge.getKeyShape().get("path")[0]).toEqual(["M", 83, 73.5]);
    expect(edge.getKeyShape().get("path")[5]).toEqual(["L", 83, 102.5]);
    graph.remove(edge);
  });

  it("show & hide should work", () => {
    group.hide();
    expect(group.isVisible()).toBe(false);
    expect(group.layer.visible).toBe(false);
    expect(node.isVisible()).toBe(false);

    group.show();
    expect(group.isVisible());
    expect(group.layer.visible).toBe(true);
    expect(node.isVisible());
  });

  it("remove child should work", () => {
    group.removeChild(node, false);
    expect(group.children.length).toBe(0);
    expect(node.belong).toBe(null);

    expect(group.getBBox()).toEqual({
      left: 0,
      top: -24,
      width: 0,
      height: 24,
    });
  });

  it("bugfix: dragging the nodes in the group should work immediately and should be no side effects", () => {
    graph.set("linkCenter", true);
    const node1 = graph.add("node", {
      id: "node1",
      type: "rect",
      x: 380,
      y: 180,
      width: 10,
      height: 10,
      label: "node1",
      groupId: "group1",
    });
    const node2 = graph.add("node", {
      id: "node2",
      type: "rect",
      x: 600,
      y: 30,
      width: 10,
      height: 10,
      label: "node2",
    });
    const edge = graph.add("edge", {
      source: "node1",
      target: "node2",
      label: {
        text: "edge1",
        position: 0.5,
        autoRotate: true,
        fillStyle: "#666",
      },
    });
    expect(group.getBBox()).toEqual({
      left: 363,
      top: 139,
      width: 34,
      height: 58,
    });
    expect(group.children.length).toBe(1);
    expect(node1.edges.length).toEqual(1);
    expect(node2.edges.length).toEqual(1);
    expect(node1.configs.x).toBe(380);
    expect(node1.configs.y).toBe(180);
    expect(edge.getTerminal()).toEqual({
      startPoint: [380, 139],
      endPoint: [600, 30],
    });
    graph.addBehavior(dragNode, {
      shouldTrigger() {
        return true;
      },
    });
    graph.emit("node:mousedown", {
      target: node1,
      clientX: 0,
      clientY: 0,
    });
    graph.emit("mousemove", {
      target: node1,
      clientX: 5,
      clientY: 5,
    });
    graph.getBehavior("dragNode")!.onMouseUp();
    expect(group.getBBox()).toEqual({
      left: 368,
      top: 144,
      width: 34,
      height: 58,
    });
    expect(group.children.length).toBe(1);
    expect(node1.edges.length).toEqual(1);
    expect(node2.edges.length).toEqual(1);
    expect(node1.configs.x).toBe(385);
    expect(node1.configs.y).toBe(185);
    expect(edge.getTerminal()).toEqual({
      startPoint: [385, 144],
      endPoint: [600, 30],
    });
    group.removeChild(node1);
    expect(group.children.length).toBe(0);
    expect(group.getBBox()).toEqual({
      left: 0,
      top: -24,
      width: 0,
      height: 24,
    });
  });

  it("render custom title should work", () => {
    group.addChild(node);
    group.updateData({
      titleSize: 24,
      renderGroupTitle(group: any, layer: any, width: number) {
        const text = new Text({
          text: `${group.get("id")}-${!!group.get("collapsed")}`,
          x: 6,
          y: 12,
          width,
          fontSize: 20,
          textBaseline: "middle",
        });
        layer.add(text);
      },
    });

    expect(group.titleLayer.children.length).toBe(1);
    const text = group.titleLayer.children[0];
    expect(text.get("text")).toBe("group1-false");
    expect(group.bbox).toEqual({
      left: 83,
      top: 59,
      width: 34,
      height: 58,
    });

    group.collapse(false);
    expect(group.titleLayer.children[0].get("text")).toBe("group1-true");
    expect(group.bbox).toEqual({
      left: 83,
      top: 59,
      width: 34,
      height: 24,
    });
    group.expand(false);
    expect(group.titleLayer.children[0].get("text")).toBe("group1-false");
    expect(group.getBBox()).toEqual({
      left: 83,
      top: 59,
      width: 34,
      height: 58,
    });
  });

  it("fixXxx should work", () => {
    group.updateData({
      fixTop: 10,
      fixHeight: 100,
      titleSize: 0,
      title: null,
      renderGroupTitle: null,
    });
    expect(group.getBBox()).toEqual({
      left: 83,
      top: -2,
      width: 34,
      height: 124,
    });

    group.updateData({
      fixLeft: 0,
      fixWidth: 100,
    });

    expect(group.getBBox()).toEqual({
      left: -12,
      top: -2,
      width: 124,
      height: 124,
    });
    group.updateData({
      fixWidth: undefined,
      fixHeight: undefined,
    });

    expect(group.getBBox()).toEqual({
      left: -12,
      top: -2,
      width: 129,
      height: 119,
    });
  });

  it("add & remove group should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 20 };
      },
    });
    const node1 = graph.add("node", { id: "1" });
    const node2 = graph.add("node", { id: "2" });
    const node3 = graph.add("node", { id: "3" });
    const group = graph.add("group", {
      id: "group",
      children: ["1", "2"],
    });
    expect(group.children.length).toBe(2);
    expect(node1.belong).toEqual(group);
    expect(node2.belong).toEqual(group);
    expect(node3.belong).toBe(null);
    expect(group.getBBox()).toEqual({
      left: -70,
      top: -30,
      width: 140,
      height: 60,
    });

    graph.remove(group);
    expect(group.children.length).toBe(0);
    expect(group.layer.destroyed);
    expect(node1.belong).toBe(null);
    expect(node2.belong).toBe(null);
    expect(node3.belong).toBe(null);

    graph.destroy();
  });

  it("titlePosition should work for default title", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 20 };
      },
      setDefaultGroup(data) {
        return {
          strokeStyle: "#D9D9D9",
          fillStyle: "#FAFBFC",
          radius: 12,
          linkNode: true,
          titlePosition: "left",
          title: {
            text: { text: data.id, fillStyle: "#626978" },
            background: {
              fillStyle: "#F0F3F6",
            },
            icon: {
              icon: "&#xe60f;",
              fillStyle: "#626978",
              cursor: "pointer",
              size: 16,
            },
          },
        };
      },
    });

    graph.data({
      nodes: [{ id: "1" }],
      edges: [],
      groups: [
        {
          id: "group",
          children: ["1"],
        },
      ],
    });

    const group = graph.getGroupById("group");
    const title = group.titleLayer!;
    expect(title);
    expect(title.getBBox()).toEqual({
      left: -173.5,
      top: -29.5,
      width: 103,
      height: 59,
    });

    const backRect = title.children[0];
    expect(backRect.type).toBe("rect");
    expect(backRect.get("width")).toBe(103);
    const icon = title.children[1];
    expect(icon.type).toBe("icon");
    expect(icon.get("size")).toBe(16);
    expect(icon.get("x")).toBe(84);
    expect(icon.get("y")).toBe(30);
    const text = title.children[2];
    expect(text.type).toBe("text");
    expect(text.get("text")).toBe("group");
    expect(text.get("width")).toBe(60);
    expect(text.get("height")).toBe(40);

    graph.destroy();
  });

  it("titlePosition should work for custom title", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 20 };
      },
      setDefaultGroup() {
        return {
          titlePosition: "left",
          titleSize: 50,
          renderGroupTitle(group: any, layer: any, height: number) {
            const rect = new Rect({
              left: 0,
              top: 0,
              width: 50,
              height,
            });
            layer.add(rect);
          },
        };
      },
    });

    graph.add("node", { id: "1" });
    const group = graph.add("group", {
      id: "group",
      children: ["1"],
    });

    expect(group.getInnerBox()).toEqual({
      minX: -70,
      minY: -30,
      maxX: 70,
      maxY: 30,
    });

    expect(group.getBBox()).toEqual({
      left: -120,
      top: -30,
      width: 190,
      height: 60,
    });
    const layer = group.titleLayer;
    expect(layer.children.length).toBe(1);
    expect(layer.children[0].type).toBe("rect");
    expect(layer.children[0].getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 50,
      height: 60,
    });
    expect(group.titleWidth).toBe(50);

    group.collapse();
    expect(group.get("collapsed"));
    expect(group.getKeyShape().getBBox()).toEqual({
      left: -120,
      top: -30,
      width: 50,
      height: 60,
    });
    expect(group.get("__bbox")).toEqual({
      left: -120,
      top: -30,
      width: 190,
      height: 60,
    });

    group.expand();
    expect(group.get("collapsed")).toBe(false);
    expect(group.getKeyShape().getBBox()).toEqual({
      left: -120,
      top: -30,
      width: 190,
      height: 60,
    });

    group.collapse();
    expect(group.getKeyShape().getBBox()).toEqual({
      left: -120,
      top: -30,
      width: 50,
      height: 60,
    });
  });

  it("linkGroupOnCollapse should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 20 };
      },
      setDefaultEdge(edge) {
        return {
          id: edge.source + "-" + edge.target,
        };
      },
      setDefaultGroup() {
        return {
          padding: 20,
          linkNode: true,
          fillStyle: "#ccc",
          linkGroupOnCollapse: true,
        };
      },
    });

    // a -> group3:[b] -> group2 [c, group1:[d -> e ] ] ]
    const data: any = {
      nodes: [
        { label: "a", class: "type-TOP", id: "a", x: 100, y: 100 },
        { label: "b", class: "type-S", id: "b", x: 200, y: 100 },
        { label: "c", class: "type-NP", id: "c", x: 300, y: 200 },
        { label: "d", class: "type-DT", id: "d", x: 400, y: 300 },
        { label: "e", class: "type-TK", id: "e", x: 400, y: 400 },
      ],
      edges: [
        { source: "d", target: "e" },
        { source: "c", target: "d" },
        { source: "b", target: "a" },
        { source: "e", target: "b" },
        { source: "a", target: "e" },
      ],
      groups: [
        {
          id: "group1",
          children: ["d", "e"],
        },
        {
          id: "group2",
          children: ["group1", "c"],
        },
        {
          id: "group3",
          children: ["b"],
        },
      ],
    };

    graph.data(data);

    const group1 = graph.getGroupById("group1");
    const group2 = graph.getGroupById("group2");
    const group3 = graph.getGroupById("group3");

    // 嵌套 collapse
    group1.collapse();
    expect(group1.get("collapsed"));
    expect(graph.getNodeById("e").isVisible()).toBe(false);
    expect(group1.edges.length).toBe(3);

    expect(graph.getEdgeById("a-e").get("source")).toBe("a");
    expect(graph.getEdgeById("a-e").get("target")).toBe("group1");
    expect(graph.getEdgeById("a-e").isVisible()).toBe(true);

    expect(graph.getEdgeById("e-b").get("source")).toBe("group1");
    expect(graph.getEdgeById("e-b").get("target")).toBe("b");
    expect(graph.getEdgeById("e-b").isVisible()).toBe(true);

    expect(graph.getEdgeById("c-d").get("source")).toBe("c");
    expect(graph.getEdgeById("c-d").get("target")).toBe("group1");
    expect(graph.getEdgeById("c-d").isVisible()).toBe(true);

    expect(graph.getEdgeById("d-e").get("source")).toBe("d");
    expect(graph.getEdgeById("d-e").get("target")).toBe("e");
    expect(graph.getEdgeById("d-e").isVisible()).toBe(false);

    group2.collapse();
    expect(group2.edges.length).toBe(2);

    expect(graph.getEdgeById("a-e").get("source")).toBe("a");
    expect(graph.getEdgeById("a-e").get("target")).toBe("group2");
    expect(graph.getEdgeById("a-e").isVisible()).toBe(true);

    expect(graph.getEdgeById("e-b").get("source")).toBe("group2");
    expect(graph.getEdgeById("e-b").get("target")).toBe("b");
    expect(graph.getEdgeById("e-b").isVisible()).toBe(true);

    expect(graph.getEdgeById("c-d").get("source")).toBe("c");
    expect(graph.getEdgeById("c-d").get("target")).toBe("group1");
    expect(graph.getEdgeById("c-d").isVisible()).toBe(false);

    // 嵌套 expand
    group2.expand();
    expect(graph.getEdgeById("a-e").get("source")).toBe("a");
    expect(graph.getEdgeById("a-e").get("target")).toBe("group1");
    expect(graph.getEdgeById("a-e").isVisible()).toBe(true);

    expect(graph.getEdgeById("e-b").get("source")).toBe("group1");
    expect(graph.getEdgeById("e-b").get("target")).toBe("b");
    expect(graph.getEdgeById("e-b").isVisible()).toBe(true);

    expect(graph.getEdgeById("c-d").get("source")).toBe("c");
    expect(graph.getEdgeById("c-d").get("target")).toBe("group1");
    expect(graph.getEdgeById("c-d").isVisible()).toBe(true);

    group1.expand();
    expect(graph.getEdgeById("a-e").get("source")).toBe("a");
    expect(graph.getEdgeById("a-e").get("target")).toBe("e");
    expect(graph.getEdgeById("a-e").isVisible()).toBe(true);

    expect(graph.getEdgeById("e-b").get("source")).toBe("e");
    expect(graph.getEdgeById("e-b").get("target")).toBe("b");
    expect(graph.getEdgeById("e-b").isVisible()).toBe(true);

    expect(graph.getEdgeById("c-d").get("source")).toBe("c");
    expect(graph.getEdgeById("c-d").get("target")).toBe("d");
    expect(graph.getEdgeById("c-d").isVisible()).toBe(true);

    expect(graph.getEdgeById("d-e").get("source")).toBe("d");
    expect(graph.getEdgeById("d-e").get("target")).toBe("e");

    // 两头 collapse
    group1.collapse();
    group3.collapse();
    expect(group1.edges.length).toBe(3);
    expect(group3.edges.length).toBe(2);

    expect(graph.getEdgeById("b-a").get("source")).toBe("group3");
    expect(graph.getEdgeById("b-a").get("target")).toBe("a");
    expect(graph.getEdgeById("b-a").isVisible()).toBe(true);

    expect(graph.getEdgeById("e-b").get("source")).toBe("group1");
    expect(graph.getEdgeById("e-b").get("target")).toBe("group3");
    expect(graph.getEdgeById("e-b").isVisible()).toBe(true);

    group3.expand();
    expect(graph.getEdgeById("b-a").get("source")).toBe("b");
    expect(graph.getEdgeById("b-a").get("target")).toBe("a");
    expect(graph.getEdgeById("b-a").isVisible()).toBe(true);

    expect(graph.getEdgeById("e-b").get("source")).toBe("group1");
    expect(graph.getEdgeById("e-b").get("target")).toBe("b");
    expect(graph.getEdgeById("e-b").isVisible()).toBe(true);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    try {
      graph.destroy();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("has been destroyed")
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("bugfix: collapsed group should be correctly refreshed", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 100, height: 20 };
      },
      setDefaultGroup() {
        return {
          titleSize: 50,
          renderGroupTitle(group: any, layer: any, height: number) {
            const rect = new Rect({
              left: 0,
              top: 0,
              width: 50,
              height,
            });
            layer.add(rect);
          },
        };
      },
    });

    const node = graph.add("node", { id: "1", x: 100, y: 100 });
    const group = graph.add("group", {
      id: "group",
      children: ["1"],
    });

    expect(group.getBBox()).toEqual({
      left: 30,
      top: 20,
      width: 140,
      height: 110,
    });

    group.collapse();
    expect(group.getBBox()).toEqual({
      left: 30,
      top: 20,
      width: 140,
      height: 50,
    });

    node.updatePosition(200, 200);
    expect(group.getBBox()).toEqual({
      left: 130,
      top: 120,
      width: 140,
      height: 50,
    });

    group.set("fixLeft", 0);
    group.set("fixTop", 0);
    group.refreshBox();
    expect(group.getBBox()).toEqual({
      left: -20,
      top: -70,
      width: 290,
      height: 50,
    });

    group.set("fixWidth", 200);
    group.set("fixHeight", 200);
    group.refreshBox();

    expect(group.getBBox()).toEqual({
      left: -20,
      top: -70,
      width: 240,
      height: 290,
    });

    graph.destroy();
  });

  it("bugfix: group.updateData should set configs correctly", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
      setDefaultGroup() {
        return { fillStyle: "#fff", strokeStyle: "#666", padding: 20 };
      },
    });

    graph.add("node", { id: "1" });

    const group = graph.add("group", {
      children: ["1"],
    });

    expect(group.background.get("fillStyle")).toBe("#fff");
    expect(group.background.get("strokeStyle")).toBe("#666");
    expect(group.background.getBBox()).toEqual({
      left: -90.5,
      top: -40.5,
      width: 181,
      height: 81,
    });

    group.updateData({ fillStyle: "#ccc", padding: 10 });
    expect(group.background.get("fillStyle")).toBe("#ccc");
    expect(group.background.get("strokeStyle")).toBe("#666");
    expect(group.background.getBBox()).toEqual({
      left: -80.5,
      top: -30.5,
      width: 161,
      height: 61,
    });

    group.updateData({ padding: 30 });
    expect(group.background.get("fillStyle")).toBe("#fff");
    expect(group.background.get("strokeStyle")).toBe("#666");
    expect(group.background.getBBox()).toEqual({
      left: -100.5,
      top: -50.5,
      width: 201,
      height: 101,
    });

    graph.destroy();
  });

  it("getAnchorPosition should work with offsets", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
      setDefaultGroup() {
        return {
          fillStyle: "#fff",
          strokeStyle: "#666",
          padding: 20,
          anchors: [
            { position: [0, 0] },
            { position: [0, 0], offsets: [-10, 10] },
            { position: [1, 0.3], offsets: [30, -20] },
            { position: [1, 1], offsets: [30, -20] },
          ],
        };
      },
    });

    graph.add("node", { id: "1" });

    const group = graph.add("group", {
      children: ["1"],
    });
    expect(group.getAnchorPositions()).toEqual([
      [-90, -40],
      [-100, -30],
      [120, -36],
      [120, 20],
    ]);
    group.updateData({
      fixLeft: -100,
      fixTop: -100,
      fixWidth: 200,
      fixHeight: 200,
    });
    expect(group.getAnchorPositions()).toEqual([
      [-120, -120],
      [-130, -110],
      [150, -68],
      [150, 100],
    ]);
    graph.destroy();
  });

  it("bugfix: group.refreshBox should update edge position correctly", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return {
          width: 140,
          height: 40,
          anchors: [
            [0, 0.5],
            [1, 0.5],
          ],
        };
      },
      setDefaultGroup() {
        return {
          fillStyle: "#fff",
          strokeStyle: "#666",
          padding: 20,
          anchors: [{ position: [0, 0.5] }, { position: [1, 0.5] }],
        };
      },
    });

    graph.data({
      nodes: [
        { id: "1", x: 100, y: 100 },
        { id: "2", x: 300, y: 100 },
      ],
      edges: [{ source: "group", target: "2" }],
      groups: [
        {
          id: "group",
          children: ["1"],
        },
      ],
    });

    const edge = graph.getEdges()[0];
    expect(edge.getKeyShape().get("path")).toEqual([
      ["M", 190, 100],
      ["L", 230, 100],
    ]);

    graph.getNodeById("1").updateData({
      x: 0,
      y: 0,
      width: 180,
      height: 80,
    });
    expect(edge.getKeyShape().get("path")).toEqual([
      ["M", 110, 0],
      ["L", 230, 100],
    ]);
  });

  it("bugfix: bbox and getLinkPoint with empty child should work", () => {
    graph.set("linkCenter", false);
    const group = graph.add("group", {
      id: "group2",
    });
    group.updateData({ radius: undefined });
    expect(group.background.getBBox()).toEqual({
      left: -0.5,
      top: -0.5,
      width: 1,
      height: 1,
    });
    expect(group.getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    let point = group.getLinkPoint([100, 300]);
    expect(point).toEqual([0 + 0.5 / 3, 0.5]);
    group.updateData({
      fixLeft: 50,
      fixTop: 50,
    });
    expect(group.getBBox()).toEqual({
      left: 38, // due to setDefaultGroup padding = 12
      top: 38,
      width: 24,
      height: 24,
    });
    point = group.getLinkPoint([100, 100]);
    expect(point).toEqual([62.5, 62.5]);
    group.updateData({
      fixLeft: undefined,
      fixTop: undefined,
      fixWidth: 100,
      fixHeight: 100,
    });
    expect(group.getBBox()).toEqual({
      left: -12, //  due to setDefaultGroup padding = 12
      top: -12,
      width: 124,
      height: 124,
    });
    point = group.getLinkPoint([200, 200]);
    expect(point).toEqual([112.5, 112.5]);
  });

  it("bugfix: group expand & collapse with custom renderGroupTitle should work.", () => {
    const graph = new Graph({
      width: 1000,
      height: 800,
      container: div,
      setDefaultGroup() {
        return {
          strokeStyle: "blue",
          radius: 4,
          padding: [12, 12, 12, 12],
          fillStyle: "#0a0",
          titleSize: 30,
          renderGroupTitle(group: Group, layer: Layer, width: number) {
            // 定义标题文本
            const text = new Text({
              text: "Group",
              x: width / 2,
              y: 18,
              fontSize: 10,
              textBaseline: "middle",
              textAlign: "center",
              fillStyle: "#3073F2",
            });

            // 定义标题栏顶部色条
            const rect = new Rect({
              left: 0,
              top: 0,
              width: width,
              height: 4,
              radius: [6, 6, 0, 0],
              fillStyle: "#3073F2",
            });

            layer.add(rect);
            layer.add(text);
          },
        };
      },
      setGroupStateStyles(state: string) {
        if (state === "hover") {
          return {
            fillStyle: "red",
          };
        }
        return { strokeStyle: "grey" };
      },
    });
    graph.data({
      nodes: [
        { id: "1", x: 100, y: 100, width: 100, height: 100 },
        { id: "2", x: 300, y: 100, width: 100, height: 100 },
      ],
      edges: [{ source: "group", target: "2" }],
      groups: [
        {
          id: "group",
          children: ["1"],
        },
      ],
    });
    const group = graph.getGroupById("group");
    expect(group.titleLayer).toBeDefined();
    const bkShape = group.titleLayer!.children[0];
    expect(bkShape.get("fillStyle")).toBe("#3073F2");
    expect(group.background!.get("fillStyle")).toBe("#0a0");
    expect(group.background!.get("height")).toBe(154);
    group.collapse();
    // 颜色不变
    expect(bkShape.get("fillStyle")).toBe("#3073F2");
    expect(group.background!.get("fillStyle")).toBe("#0a0");
    expect(group.background!.get("height")).toBe(30);
    group.expand();
    expect(bkShape.get("fillStyle")).toBe("#3073F2");
    expect(group.background!.get("fillStyle")).toBe("#0a0");
    expect(group.background!.get("height")).toBe(154);
  });

  it("group without titleLayer should work with shutoff", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
      setDefaultGroup() {
        return {
          fillStyle: "#fff",
          strokeStyle: "#666",
        };
      },
    });

    // nested_collapse.html
    graph.data({
      nodes: [
        { label: "a", class: "type-TOP", id: "a", x: 100, y: 100 },
        { label: "b", class: "type-S", id: "b", x: 200, y: 100 },
        { label: "c", class: "type-NP", id: "c", x: 300, y: 200 },
        { label: "d", class: "type-DT", id: "d", x: 400, y: 300 },
        { label: "e", class: "type-TK", id: "e", x: 400, y: 400 },
      ],
      edges: [
        { source: "d", target: "e" },
        { source: "c", target: "d" },
        { source: "b", target: "a" },
        { source: "e", target: "b" },
        { source: "a", target: "e" },
      ],
      groups: [
        {
          id: "group1",
          children: ["d", "e"],
        },
        {
          id: "group2",
          children: ["group1", "c"],
        },
        {
          id: "group3",
          children: ["b"],
        },
      ],
    });

    const group1 = graph.getGroupById("group1");
    const group2 = graph.getGroupById("group2");
    const e = graph.getNodeById("e");
    e.hide();

    group1.collapse();
    expect(graph.getNodeById("d").isVisible()).toBe(false);
    expect(graph.getNodeById("d").visible).toBe(true);
    expect(graph.getNodeById("d").shutoff).toBe(true);
    expect(e.isVisible()).toBe(false);
    expect(e.visible).toBe(false);
    expect(e.shutoff).toBe(true);
    group2.collapse();
    expect(group1.shutoff).toBe(true);
    expect(group1.visible).toBe(true);
    expect(group1.configs.collapsed).toBe(true);
    group2.expand();
    expect(group1.shutoff).toBe(false);
    expect(group1.visible).toBe(true);
    expect(group1.configs.collapsed).toBe(true);
    expect(graph.getNodeById("d").isVisible()).toBe(false);
    expect(e.isVisible()).toBe(false);
    group1.expand();
    expect(graph.getNodeById("d").isVisible()).toBe(true);
    expect(e.isVisible()).toBe(false);
    expect(e.visible).toBe(false);
    expect(e.shutoff).toBe(false);
    graph.destroy();
  });

  it("group with titleLayer should work with shutoff", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
      setDefaultGroup(groupData: any) {
        return {
          fillStyle: "#fff",
          strokeStyle: "#666",
          title: {
            text: {
              text: groupData.id,
            },
            background: {
              fillStyle: "#3073FF",
            },
          },
        };
      },
    });

    // nested_collapse.html
    graph.data({
      nodes: [
        { label: "a", class: "type-TOP", id: "a", x: 100, y: 100 },
        { label: "b", class: "type-S", id: "b", x: 200, y: 100 },
        { label: "c", class: "type-NP", id: "c", x: 300, y: 200 },
        { label: "d", class: "type-DT", id: "d", x: 400, y: 300 },
        { label: "e", class: "type-TK", id: "e", x: 400, y: 400 },
      ],
      edges: [
        { source: "d", target: "e" },
        { source: "c", target: "d" },
        { source: "b", target: "a" },
        { source: "e", target: "b" },
        { source: "a", target: "e" },
      ],
      groups: [
        {
          id: "group1",
          children: ["d", "e"],
        },
        {
          id: "group2",
          children: ["group1", "c"],
        },
        {
          id: "group3",
          children: ["b"],
        },
      ],
    });

    const group1 = graph.getGroupById("group1");
    const group2 = graph.getGroupById("group2");
    const e = graph.getNodeById("e");
    e.hide();

    group1.collapse();
    expect(graph.getNodeById("d").isVisible()).toBe(false);
    expect(graph.getNodeById("d").visible).toBe(true);
    expect(graph.getNodeById("d").shutoff).toBe(true);
    expect(e.isVisible()).toBe(false);
    expect(e.visible).toBe(false);
    expect(e.shutoff).toBe(true);
    group2.collapse();
    expect(group1.shutoff).toBe(true);
    expect(group1.visible).toBe(true);
    expect(group1.configs.collapsed).toBe(true);
    group2.expand();
    expect(group1.shutoff).toBe(false);
    expect(group1.visible).toBe(true);
    expect(group1.configs.collapsed).toBe(true);
    expect(graph.getNodeById("d").isVisible()).toBe(false);
    expect(e.isVisible()).toBe(false);
    group1.expand();
    expect(graph.getNodeById("d").isVisible()).toBe(true);
    expect(e.isVisible()).toBe(false);
    expect(e.visible).toBe(false);
    expect(e.shutoff).toBe(false);
    group2.collapse();
    expect(graph.getNodeById("d").isVisible()).toBe(false);
    expect(graph.getNodeById("d").visible).toBe(true);
    expect(graph.getNodeById("d").shutoff).toBe(true);
    expect(e.isVisible()).toBe(false);
    expect(e.visible).toBe(false);
    expect(e.shutoff).toBe(true);
    graph.destroy();
  });

  it("bugfix: expand & collapse destroy titleLayer and group event emit in inner shape should work.", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
      setDefaultGroup(groupData: any) {
        return {
          fillStyle: "#fff",
          strokeStyle: "#666",
          titleSize: 32,
          renderGroupTitle(group: Group, layer: any, width: number) {
            const text = new Text({
              x: 40,
              y: 16,
              text: group.get("id"),
              width: width - 40 - 16,
              textOverflow: "ellipsis",
            });
            layer.set("__titleText", text);
            layer.add(text);
          },
        };
      },
    });
    graph.data({
      nodes: [
        { label: "a", class: "type-TOP", id: "a", x: 100, y: 100 },
        { label: "b", class: "type-S", id: "b", x: 200, y: 100 },
        { label: "c", class: "type-NP", id: "c", x: 300, y: 200 },
        { label: "d", class: "type-DT", id: "d", x: 400, y: 300 },
        { label: "e", class: "type-TK", id: "e", x: 400, y: 400 },
      ],
      edges: [
        { source: "d", target: "e" },
        { source: "c", target: "d" },
        { source: "b", target: "a" },
        { source: "e", target: "b" },
        { source: "a", target: "e" },
      ],
      groups: [
        {
          id: "group1",
          children: ["d", "e"],
        },
        {
          id: "group2",
          children: ["group1", "c"],
        },
        {
          id: "group3",
          children: ["b"],
        },
      ],
    });
    graph.on("group:click", (e) => {
      toggleGroup(e.target);
    });
    const group1 = graph.getGroupById("group1");
    const group2 = graph.getGroupById("group2");
    group1.collapse();
    group2.collapse();
    let text = group2.titleLayer!.get("__titleText");
    let target = text;
    while (target) {
      target.emit("click", {
        type: "click",
        bubbles: true,
        target: text,
      });
      target = target.getParent();
    }

    expect(graph.getNodeById("d").isVisible()).toBe(false);
    expect(graph.getNodeById("d").visible).toBe(true);
    expect(graph.getNodeById("d").shutoff).toBe(true);
    expect(group2.get("collapsed")).not.toBeTruthy();

    text = group1.titleLayer!.get("__titleText");
    target = text;
    while (target) {
      target.emit("click", {
        type: "click",
        bubbles: true,
        target: text,
      });
      target = target.getParent();
    }

    expect(group1.get("collapsed")).not.toBeTruthy();

    function toggleGroup(group: Group) {
      if (group.get("collapsed")) {
        // 节点状态为收起，故而展开节点
        group.expand();
      } else {
        // 节点状态为展开，故而收起节点
        group.collapse();
      }
      // 将被操作节点移回原位
      graph.refresh();
      graph.draw();
    }
  });

  it("isAnchorConnected should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode: () => ({
        width: 140,
        height: 40,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      }),
      setDefaultGroup: () => ({
        linkNode: false,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      }),
    });
    graph.data({
      nodes: [
        { id: "node1", x: 100, y: 100 },
        { id: "node2", x: 200, y: 100 },
        { id: "node3", x: 100, y: 200 },
      ],
      edges: [{ source: "group1", target: "node3" }],
      groups: [{ id: "group1", children: ["node1", "node2"] }],
    });
    const node1 = graph.getNodeById("node1");
    const node2 = graph.getNodeById("node2");
    const node3 = graph.getNodeById("node3");
    const group = graph.getGroupById("group1");

    expect(node1.isAnchorConnected(0)).toBe(false);
    expect(node1.isAnchorConnected(1)).toBe(false);
    expect(node2.isAnchorConnected(0)).toBe(false);
    expect(node2.isAnchorConnected(1)).toBe(false);
    expect(node3.isAnchorConnected(0)).toBe(true);
    expect(node3.isAnchorConnected(0, "source")).toBe(false);
    expect(node3.isAnchorConnected(0, "target")).toBe(true);
    expect(node3.isAnchorConnected(1)).toBe(false);
    expect(group.isAnchorConnected(0)).toBe(false);
    expect(group.isAnchorConnected(1)).toBe(true);
    expect(group.isAnchorConnected(1, "source")).toBe(true);
    expect(group.isAnchorConnected(1, "target")).toBe(false);

    graph.remove(graph.getEdges()[0]);
    expect(node1.isAnchorConnected(0)).toBe(false);
    expect(node1.isAnchorConnected(1)).toBe(false);
    expect(node2.isAnchorConnected(0)).toBe(false);
    expect(node2.isAnchorConnected(1)).toBe(false);
    expect(node3.isAnchorConnected(0)).toBe(false);
    expect(node3.isAnchorConnected(1)).toBe(false);
    expect(group.isAnchorConnected(0)).toBe(false);
    expect(group.isAnchorConnected(1)).toBe(false);

    graph.destroy();
  });

  it("bugfix: Use groupId or addChild API add child should work.", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode: () => ({
        width: 140,
        height: 40,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      }),
      setDefaultGroup: () => ({
        linkNode: false,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      }),
    });
    graph.data({
      nodes: [
        { id: "node1", x: 100, y: 100, groupId: "group1" },
        { id: "node2", x: 200, y: 100, groupId: "group1" },
        { id: "node3", x: 100, y: 200, groupId: "group2" },
      ],
      edges: [{ source: "group1", target: "node3" }],
      groups: [{ id: "group1", groupId: "group2" }, { id: "group2" }],
    });
    const node1 = graph.getNodeById("node1");
    const node2 = graph.getNodeById("node2");
    const node3 = graph.getNodeById("node3");
    const group1 = graph.getGroupById("group1");
    const group2 = graph.getGroupById("group2");

    // expect(node1.layer.parent).toBe(group1.layer);
    // expect(node2.layer.parent).toBe(group1.layer);

    expect(group1.get("children")).toEqual([node1.get("id"), node2.get("id")]);
    expect(group1.children[0]).toBe(node1);
    expect(group1.children[1]).toBe(node2);
    expect(group1.children[2]).toBeUndefined();

    expect(group2.get("children")).toEqual([group1.get("id"), node3.get("id")]);
    expect(group2.children[0]).toBe(group1);
    expect(group2.children[1]).toBe(node3);
    expect(group2.children[2]).toBeUndefined();
    expect(group1.layer.parent).toBe(group2.layer);

    group1.addChild(group2);
    expect(group1.get("children")).toEqual([
      node1.get("id"),
      node2.get("id"),
      group2.get("id"),
    ]);
    expect(group2.get("children")).toEqual([node3.get("id")]);
  });

  it("bugfix: add a group with fixWidth/Height but no children should work.", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultGroup: () => ({
        linkNode: false,
        padding: 0,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      }),
    });
    const group = graph.add("group", {
      fixLeft: 0,
      fixTop: 0,
      fixWidth: 200,
      fixHeight: 100,
      fillStyle: "#888",
    });
    expect(group.layer.children[0].get("width")).toBe(200);
    expect(group.layer.children[0].get("height")).toBe(100);
  });

  it("bugfix: remove top group should not destroy child  group layer.", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultGroup: () => ({
        linkNode: false,
        padding: 0,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      }),
    });
    graph.data({
      nodes: [
        {
          id: "1",
          width: 100,
          height: 30,
        },
        {
          id: "2",
          width: 100,
          height: 30,
        },
      ],
      edges: [],
      groups: [
        { id: "group1", children: ["1"] },
        { id: "group2", children: ["group1", "2"] },
      ],
    });
    const group1 = graph.getGroupById("group1");
    const group2 = graph.getGroupById("group2");
    graph.remove(group2);
    expect(group1.layer.destroyed).toBe(false);
  });

  it("collapsed group with x & y should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultGroup: () => ({
        linkNode: false,
        padding: 20,
        titleSize: 20,
      }),
    });
    graph.data({
      nodes: [
        {
          id: "1",
          x: 0,
          y: 0,
          width: 100,
          height: 30,
        },
      ],
      edges: [],
      groups: [{ id: "group1", children: ["1"] }],
    });
    const group1 = graph.getGroupById("group1");
    const rect = group1.background;
    expect(group1.getBBox()).toEqual({
      left: -70,
      top: -55,
      width: 140,
      height: 90,
    });
    expect(rect?.getBBox()).toEqual({
      left: -70,
      top: -55,
      width: 140,
      height: 90,
    });

    group1.collapse();
    group1.set("x", 300);
    group1.set("y", 300);
    graph.refresh();
    expect(group1.getBBox()).toEqual({
      left: 230,
      top: 290,
      width: 140,
      height: 20,
    });
    expect(rect?.getBBox()).toEqual({
      left: 230,
      top: 290,
      width: 140,
      height: 20,
    });
    group1.expand();
    expect(group1.getBBox()).toEqual({
      left: 230,
      top: 290,
      width: 140,
      height: 90,
    });
    expect(rect?.getBBox()).toEqual({
      left: 230,
      top: 290,
      width: 140,
      height: 90,
    });
  });

  it("Anchor shapes should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultGroup: () => ({
        linkNode: false,
        padding: 20,
        anchors: [
          {
            position: [0, 0.5],
            offsets: [5, -5],
            type: "dot",
            setStyles() {
              return { fillStyle: "red" };
            },
          },
          {
            position: [1, 0.5],
            type: "dot",
            setStyles() {
              return { fillStyle: "blue" };
            },
          },
        ],
      }),
    });
    graph.data({
      nodes: [
        {
          id: "1",
          x: 0,
          y: 0,
          width: 100,
          height: 30,
        },
      ],
      edges: [],
      groups: [{ id: "group1", children: ["1"] }],
    });
    const group = graph.getGroupById("group1");
    expect(group.layer.children.length).toBe(3);
    expect(group.layer.children[0].type).toBe("rect");
    expect(group.layer.children[1].type).toBe("circle");
    expect(group.layer.children[2].type).toBe("circle");
    expect(group.layer.children[1].get("fillStyle")).toBe("red");
    expect(group.layer.children[1].get("cx")).toBe(-65);
    expect(group.layer.children[1].get("cy")).toBe(-5);
    expect(group.layer.children[2].get("fillStyle")).toBe("blue");
    expect(group.layer.children[2].get("cx")).toBe(70);
    expect(group.layer.children[2].get("cy")).toBe(0);

    graph.add("node", {
      id: "2",
      x: 500,
      y: 500,
      width: 100,
      height: 30,
      groupId: "group1",
    });
    expect(group.layer.children[1].get("cx")).toBe(-65);
    expect(group.layer.children[1].get("cy")).toBe(245);
    expect(group.layer.children[2].get("cx")).toBe(570);
    expect(group.layer.children[2].get("cy")).toBe(250);

    group.updateData({
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    });
    expect(group.layer.children.length).toBe(1);
    expect(group.layer.children[0].type).toBe("rect");

    group.updateData({
      anchors: [
        {
          position: [0, 0.5],
          offsets: [5, -5],
          type: "dot",
          setStyles() {
            return { fillStyle: "#ccc" };
          },
        },
        {
          position: [1, 0.5],
          type: "dot",
          setStyles() {
            return { fillStyle: "#666" };
          },
        },
      ],
    });
    expect(group.layer.children.length).toBe(3);
    expect(group.layer.children[0].type).toBe("rect");
    expect(group.layer.children[1].type).toBe("circle");
    expect(group.layer.children[2].type).toBe("circle");
    expect(group.layer.children[1].get("fillStyle")).toBe("#ccc");
    expect(group.layer.children[2].get("fillStyle")).toBe("#666");
  });

  it("add & remove child should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultGroup: () => ({
        linkNode: false,
        padding: 20,
        anchors: [
          {
            position: [0, 0.5],
            offsets: [5, -5],
            type: "dot",
            setStyles() {
              return { fillStyle: "red" };
            },
          },
          {
            position: [1, 0.5],
            type: "dot",
            setStyles() {
              return { fillStyle: "blue" };
            },
          },
        ],
      }),
    });
    graph.data({
      nodes: [
        {
          id: "1",
          x: 0,
          y: 0,
          width: 100,
          height: 30,
        },
        {
          id: "2",
          x: 500,
          y: 500,
          width: 100,
          height: 30,
        },
      ],
      edges: [],
      groups: [
        { id: "group1", children: ["1"] },
        { id: "group2", children: ["group1", "2"] },
      ],
    });
    const node1 = graph.getNodeById("1");
    const node2 = graph.getNodeById("2");
    const group1 = graph.getGroupById("group1");
    expect(group1.children.length).toBe(1);
    expect(group1.children[0]).toBe(node1);
    expect(group1.get("children")).toEqual(["1"]);
    expect(node1.get("groupId")).toBe("group1");
    expect(node1.belong).toBe(group1);
    const group2 = graph.getGroupById("group2");
    expect(group2.children.length).toBe(2);
    expect(group2.children[1]).toBe(node2);
    expect(group2.children[0]).toBe(group1);
    expect(group1.get("groupId")).toBe("group2");
    expect(group1.belong).toBe(group2);

    group2.addChild(node1);
    expect(group2.children.length).toBe(3);
    expect(group2.get("children")).toEqual(["group1", "2", "1"]);
    expect(node1.get("groupId")).toBe("group2");
    expect(group1.children.length).toBe(0);
    expect(group1.get("children")).toEqual([]);

    group2.removeChild(group1, false);
    expect(group2.children.length).toBe(2);
    expect(group2.get("children")).toEqual(["2", "1"]);
    expect(group1.belong).toBe(null);
    expect(group1.get("groupId")).toBe(undefined);
  });
});
