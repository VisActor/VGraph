import { Node, Graph, registerNode } from "../../src";
describe("src/entities/node.ts", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
  });

  const node = graph.add("node", {
    type: "rect",
    id: "rect",
    x: 100,
    y: 100,
    width: 60,
    height: 30,
  });

  it("add node should work", () => {
    expect(node instanceof Node);
    expect(node.get("x")).toBe(100);
    expect(node.get("y")).toBe(100);
    expect(node.get("width")).toBe(60);
    expect(node.layer).not.toBe(null);
    expect(node.layer.getMatrix()[4]).toBe(100);
    expect(node.layer.getMatrix()[5]).toBe(100);
    expect(node.layer.get("appendSize")).toEqual(null);
    expect(node.layer.children.length).toBe(1);
    expect(node.layer.children[0].type).toBe("rect");
    expect(node.getAnchorPositions().length).toBe(0);
    expect(node.getBBox()).toEqual({
      left: 70,
      top: 85,
      width: 60,
      height: 30,
    });
  });

  it("update data should work", () => {
    node.updateData({
      x: 150,
      height: 50,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
    });

    expect(node.get("x")).toBe(150);
    expect(node.layer.getMatrix()[4]).toBe(150);
    expect(node.layer.getMatrix()[5]).toBe(100);
    expect(node.layer.children[0].get("top")).toBe(-25);
    expect(node.layer.children[0].get("height")).toBe(50);

    expect(node.getAnchorPositions().length).toBe(2);
    expect(node.getAnchorPositions()).toEqual([
      [120, 100],
      [180, 100],
    ]);

    expect(node.getBBox()).toEqual({
      left: 120,
      top: 75,
      width: 60,
      height: 50,
    });
    expect(node.layer.get("appendSize")).toEqual(null);
  });

  it("getLinkPoint should work", () => {
    let point = node.getLinkPoint([200, 200]);
    expect(point).toEqual([180, 100]);
    point = node.getLinkPoint([150, 100]);
    expect(point).toEqual([120, 100]);
    point = node.getLinkPoint([0, 0]);
    expect(point).toEqual([120, 100]);
    point = node.getLinkPoint([50, 0]);
    expect(point).toEqual([120, 100]);

    // getLinkPoint with specific anchor
    point = node.getLinkPoint([200, 200], 0);
    expect(point).toEqual([120, 100]);
    point = node.getLinkPoint([150, 100], 1);
    expect(point).toEqual([180, 100]);
  });

  it("when node x y updated getLinkPoint should work", () => {
    const node = graph.add("node", {
      type: "rect",
      id: "rect2",
      x: 100,
      y: 100,
      width: 60,
      height: 30,
    });
    let point = node.getLinkPoint([200, 200]);
    // console.log(node.getLinkPoint([200, 200]), node.getLinkPoint([150, 100]), node.getLinkPoint([0, 0]), node.getLinkPoint([50, 0]));
    expect(point).toEqual([115, 115]);
    point = node.getLinkPoint([150, 100]);
    expect(point).toEqual([130, 100]);
    point = node.getLinkPoint([0, 0]);
    expect(point).toEqual([85, 85]);
    point = node.getLinkPoint([50, 0]);
    expect(point).toEqual([92.5, 85]);

    // node x y updated
    node.set("x", 300);
    node.set("y", 300);
    point = node.getLinkPoint([400, 400]);
    expect(point).toEqual([315, 315]);
    point = node.getLinkPoint([350, 300]);
    expect(point).toEqual([330, 300]);
    point = node.getLinkPoint([200, 200]);
    expect(point).toEqual([285, 285]);
    point = node.getLinkPoint([250, 200]);
    expect(point).toEqual([292.5, 285]);
  });

  it("getLinkPoint without anchor should work", () => {
    node.updateData({
      anchors: null,
    });
    let point = node.getLinkPoint([200, 200]);
    expect(point).toEqual([162.5, 125]);
    point = node.getLinkPoint([150, 10]);
    expect(point).toEqual([150, 75]);
    point = node.getLinkPoint([0, 0]);
    expect(point).toEqual([120, 80]);
    point = node.getLinkPoint([50, 0]);
    expect(point).toEqual([125, 75]);
  });

  it("setState & removeState should work", () => {
    const rect = node.getKeyShape();
    graph.set(
      "setNodeStateStyles",
      (state: string, nodeData: any, node: any) => {
        expect(node instanceof Node);
        if (state === "hover") {
          return {
            strokeStyle: "red",
            fillStyle: "yellow",
          };
        }
        if (state === "x") {
          return {
            lineWidth: 3,
            strokeStyle: "blue",
          };
        }
      }
    );

    node.setState("hover");
    expect(node.hasState("hover"));
    expect(rect.get("strokeStyle")).toBe("red");
    expect(rect.get("fillStyle")).toBe("yellow");
    expect(rect.get("lineWidth")).toBe(1);
    expect(node.states).toEqual(["hover"]);

    node.setState("x");
    expect(node.hasState("hover"));
    expect(node.hasState("x"));
    expect(rect.get("strokeStyle")).toBe("blue");
    expect(rect.get("fillStyle")).toBe("yellow");
    expect(rect.get("lineWidth")).toBe(3);
    expect(node.states).toEqual(["hover", "x"]);

    node.removeState("x");
    expect(node.hasState("hover"));
    expect(rect.get("strokeStyle")).toBe("red");
    expect(rect.get("fillStyle")).toBe("yellow");
    expect(node.states).toEqual(["hover"]);

    node.setState("x", true);
    expect(node.hasState("hover")).toBe(false);
    expect(rect.get("strokeStyle")).toBe("blue");
    expect(rect.get("fillStyle")).toBe("#fff");
    expect(rect.get("lineWidth")).toBe(3);
    expect(node.states).toEqual(["x"]);

    node.setState("z");
    expect(node.hasState("x"));
    expect(node.hasState("z"));
  });

  it("anchorShape should work for node", () => {
    const setStyles = (data: any) => {
      expect(data).toEqual(node.configs);
      return {
        size: 4,
      };
    };
    node.updateData({
      anchors: [
        {
          position: [0, 0.5],
          setStyles,
        },
        {
          position: [1, 0.5],
          setStyles,
        },
      ],
    });

    const layer = node.layer;
    const anchorShapes = layer.get("__anchors");
    expect(anchorShapes.length).toBe(2);
    expect(anchorShapes[0].get("cx")).toBe(-30);
    expect(anchorShapes[0].get("cy")).toBe(0);
    expect(anchorShapes[0].get("r")).toBe(2);
    expect(anchorShapes[1].get("cx")).toBe(30);
    expect(anchorShapes[1].get("cy")).toBe(0);
    expect(anchorShapes[1].get("r")).toBe(2);

    expect(layer.get("__anchorAppendSize")).toEqual([0, 2.5, 0, 2.5]);
    expect(layer.get("appendSize")).toEqual([0, 2.5, 0, 2.5]);
  });

  it("updateSize should work", () => {
    node.updateSize(100, 100);
    const layer = node.layer;
    expect(layer.get("width")).toBe(100);
    expect(layer.get("height")).toBe(100);

    const anchorShapes = layer.get("__anchors");
    expect(anchorShapes[0].get("cx")).toBe(-50);
    expect(anchorShapes[0].get("cy")).toBe(0);
    expect(anchorShapes[1].get("cx")).toBe(50);
    expect(anchorShapes[1].get("cy")).toBe(0);
    expect(layer.get("__anchorAppendSize")).toEqual([0, 2.5, 0, 2.5]);
    expect(layer.get("appendSize")).toEqual([0, 2.5, 0, 2.5]);
  });

  it("update anchors should work", () => {
    node.updateData({
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
    });

    const layer = node.layer;
    expect(node.layer.get("__anchors")).toBe(null);
    expect(node.getAnchorPositions()).toEqual([
      [150, 50],
      [150, 150],
    ]);
    expect(layer.get("__anchorAppendSize")).toBe(null);
    expect(layer.get("appendSize")).toEqual(null);
  });

  it("node with label should work", () => {
    const node1 = graph.add("node", {
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      label: {
        x: -100,
        y: -100,
        width: 10,
        height: 10,
      },
    });
    const layer = node1.layer;

    expect(layer.get("__labelAppendSize")).toEqual([50, 0, 0, 50]);
    expect(layer.get("appendSize")).toEqual([50, 0, 0, 50]);
  });

  it("node with icon & anchor should work", () => {
    const node1 = graph.add("node", {
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      anchors: [
        {
          position: [0.5, 0],
          setStyles() {
            return { size: 4 };
          },
        },
        {
          position: [0.5, 1],
          setStyles() {
            return { size: 6 };
          },
        },
      ],
      icons: [
        {
          position: [0, 0.5],
          offsets: [-5, -5],
          setStyles() {
            return { icon: "&#xe836;" };
          },
        },
        {
          position: [1, 0.5],
          setStyles() {
            return { icon: "&#xe836;" };
          },
        },
      ],
    });
    const layer = node1.layer;
    const anchors = layer.get("__anchors");
    const icons = layer.get("__icons");
    expect(anchors.length).toBe(2);
    expect(icons.length).toBe(2);

    expect(layer.get("__anchorAppendSize")).toEqual([2.5, 0, 3.5, 0]);
    expect(layer.get("__iconAppendSize")).toEqual([0, 8, 0, 13]);
    expect(layer.get("appendSize")).toEqual([2.5, 8, 3.5, 13]);
  });

  it("node with icons should work", () => {
    const iconNode = graph.add("node", {
      type: "rect",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      icons: [
        {
          show: "always",
          position: [0.5, 0],
          offsets: [0, -16],
          setStyles() {
            return {
              icon: "&#xe836;",
              size: 16,
            };
          },
        },
        {
          show: "always",
          position: [0.5, 1],
          setStyles() {
            return {
              left: 0,
              top: 50,
              icon: "&#xe836;",
              size: 16,
            };
          },
          setBgStyles() {
            return {
              type: "circle",
              size: 20,
            };
          },
        },
      ],
    });
    const layer = iconNode.layer;
    const icons = layer.get("__icons");
    expect(icons).not.toBe(undefined);
    expect(icons.length).toBe(2);
    const icon0BgShape = icons[0].findById("bgShape");
    expect(icon0BgShape).toBe(null);
    expect(icons[0].getMatrix()).toEqual([1, 0, 0, 1, 0, -66]);
    expect(icons[0].visible).toBe(true);
    const icon1BgShape = icons[1].findById("bgShape");
    expect(icon1BgShape).not.toBe(null);
    expect(icon1BgShape.get("r")).toBe(10);
    expect(icons[1].getMatrix()).toEqual([1, 0, 0, 1, 0, 50]);
    expect(icons[1].visible).toBe(true);
    expect(layer.get("__iconAppendSize")).toEqual([24, 0, 10, 0]);
  });

  it("node with hover icons should work", () => {
    const iconNode = graph.add("node", {
      type: "rect",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      icons: [
        {
          show: "hover",
          position: [0.5, 0],
          setStyles() {
            return {
              icon: "&#xe836;",
              size: 16,
            };
          },
        },
      ],
    });
    const layer = iconNode.layer;
    const icons = layer.get("__icons");
    expect(icons).not.toBe(undefined);
    expect(icons.length).toBe(1);
    const iconLayer = icons[0];
    expect(iconLayer.getMatrix()).toEqual([1, 0, 0, 1, 0, -50]);
    const icon = iconLayer.findById("icon");
    expect(icon.get("iconText")).not.toBe(undefined);
    expect(!icon.visible);
    expect(layer.get("__iconAppendSize")).toEqual([8, 0, 0, 0]);

    iconNode.emit("mouseenter");
    expect(icon.visible);
    iconNode.emit("mouseenter");
    expect(!icon.visible);

    iconNode.updateData({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      icons: null,
    });
    expect(icon.destroyed).toBe(true);
    expect(layer.get("__icons")).toBe(null);
  });

  it("tag node should work", () => {
    const nodeConfigs = {
      type: "tag",
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
      icons: [
        {
          setStyles(data: any) {
            return {
              fillStyle: "red",
              icon: "&#xe698;",
            };
          },
          setBgStyles(data: any): any {
            return {
              type: "rect",
              styles: {
                fillStyle: "#fff",
              },
            };
          },
          position: [0, 0.5],
          offset: [0, 0],
          show: "hover",
        },
      ],
    };
    const tagNode = graph.add("node", nodeConfigs);

    const layer = tagNode.layer;
    const keyShape = tagNode.keyShape;
    expect(layer.children.length).toBe(6);
    expect(keyShape.type).toBe("rect");
    expect(keyShape.get("left")).toBe(-70);
    expect(keyShape.get("top")).toBe(-20);
    expect(keyShape.get("width")).toBe(140);
    expect(keyShape.get("height")).toBe(40);
    expect(keyShape.get("strokeStyle")).toBe("#F59400");

    expect(layer.children[5].type).toBe("layer");
    expect(layer.children[5].getMatrix()).toEqual([1, 0, 0, 1, -70, 0]);
    expect(layer.children[5].findById("icon").type).toBe("icon");
    expect(layer.children[5].findById("icon").get("icon")).toBe("&#xe698;");
    expect(layer.children[5].findById("bgShape").type).toBe("rect");
    expect(layer.children[5].findById("bgShape").get("fillStyle")).toBe("#fff");

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

    // test icons update
    nodeConfigs.icons = [
      {
        setStyles(data: any) {
          return {
            fillStyle: "red",
            icon: "&#xe7a2;",
          };
        },
        setBgStyles(data: any) {
          return {
            styles: {
              fillStyle: "#000",
            },
          };
        },
        position: [1, 0.5],
        offset: [0, 0],
        show: "hover",
      },
    ];
    tagNode.updateData(nodeConfigs);
    expect(layer.children.length).toBe(6);
    expect(layer.children[5].getMatrix()).toEqual([1, 0, 0, 1, 70, 0]);
    expect(layer.children[5].findById("icon").get("icon")).toBe("&#xe7a2;");
    expect(layer.children[5].findById("bgShape").get("fillStyle")).toBe("#000");
  });

  it("hide & show should work", () => {
    const data = {
      nodes: [
        {
          id: "1",
          width: 140,
          height: 40,
        },
        {
          id: "2",
          width: 140,
          height: 40,
        },
      ],
      edges: [
        {
          id: "edge",
          source: "1",
          target: "2",
        },
      ],
    };
    graph.data(data);
    const node1 = graph.getNodeById("1");
    const edge = graph.getEdgeById("edge");
    node1.hide();
    expect(node1.isVisible()).toBe(false);
    expect(edge.isVisible()).toBe(false);

    node1.show();
    expect(node1.isVisible());
    expect(edge.isVisible());

    node1.hide();
    expect(node1.isVisible()).toBe(false);
    expect(edge.isVisible()).toBe(false);

    node1.show(false);
    expect(node1.isVisible());
    expect(edge.isVisible()).toBe(false);
  });

  it("destroy node should work", () => {
    const data = {
      nodes: [
        {
          id: "1",
          width: 10,
          height: 10,
        },
        {
          id: "2",
          width: 10,
          height: 10,
        },
        {
          id: "3",
          width: 10,
          height: 10,
        },
      ],
      edges: [
        {
          source: "1",
          target: "2",
        },
        {
          source: "1",
          target: "3",
        },
        {
          source: "2",
          target: "3",
        },
      ],
    };
    graph.data(data);
    const node1 = graph.getNodeById("1");
    const node2 = graph.getNodeById("2");
    const node3 = graph.getNodeById("3");
    expect(node2.sources).toEqual(["1"]);
    expect(node3.sources).toEqual(["1", "2"]);
    graph.remove(node1);
    expect(node2.sources).toEqual([]);
    expect(node3.sources).toEqual(["2"]);
  });

  it("merge configs should work", () => {
    const div2 = document.createElement("div");
    const graph2 = new Graph({
      width: 1000,
      height: 400,
      container: div2,
      setDefaultNode() {
        return {
          type: "circle",
          width: 10,
          height: 10,
          strokeStyle: "#fff",
          fillStyle: "#eee",
        };
      },
    });

    const node1 = graph2.add("node", { id: "1" });
    expect(node1.get("type")).toBe("circle");
    expect(node1.get("width")).toBe(10);
    expect(node1.get("height")).toBe(10);
    expect(node1.get("strokeStyle")).toBe("#fff");
    expect(node1.get("fillStyle")).toBe("#eee");

    const node3 = graph2.add("node", {
      type: "rect",
      id: "3",
      width: 60,
      height: 30,
      fillStyle: "#333",
    });
    const layer = node3.layer;
    expect(node3.get("type")).toBe("circle");
    expect(node3.get("width")).toBe(10);
    expect(node3.get("height")).toBe(10);
    expect(layer.get("width")).toBe(10);
    expect(layer.get("height")).toBe(10);
    expect(node3.get("strokeStyle")).toBe("#fff");
    expect(node3.get("fillStyle")).toBe("#eee");
  });

  it("scale should work", () => {
    const n = graph.add("node", {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    });

    expect(n.getBBox()).toEqual({
      left: 50,
      top: 50,
      width: 100,
      height: 100,
    });

    expect(n.getLinkPoint([250, 100])).toEqual([150, 100]);

    n.scale(1.1);
    expect(n.getBBox()).toEqual({
      left: 44.99999999999999,
      top: 44.99999999999999,
      width: 110.00000000000001,
      height: 110.00000000000001,
    });
    expect(n.getLinkPoint([250, 100])).toEqual([155, 100]);

    n.scale(0.8, 0.8);
    expect(n.getBBox()).toEqual({
      left: 55.99999999999999,
      top: 55.99999999999999,
      width: 88.00000000000001,
      height: 88.00000000000001,
    });
    expect(n.getLinkPoint([250, 100])).toEqual([144, 100]);
  });

  it("toFront & toBack should work", () => {
    const n = graph.getNodeById("2");
    const nodeLayer = graph.getNodeContainer();
    expect(nodeLayer.children[nodeLayer.children.length - 1]).not.toEqual(
      n.layer
    );
    n.toFront();
    expect(nodeLayer.children[nodeLayer.children.length - 1]).toEqual(n.layer);

    n.toBack();
    expect(nodeLayer.children[0]).toEqual(n.layer);
  });

  // 不再支持 r 的写法。
  // it('bugfix: circle node should work with r vs width & height', () => {
  //   const circle = graph.add('node', {
  //     type: 'circle',
  //     x: 200,
  //     y: 200,
  //     width: 20,
  //     height: 20,
  //   });
  //   expect(circle.getBBox()).toEqual({
  //     left: 190,
  //     top: 190,
  //     width: 20,
  //     height: 20,
  //   });
  //   expect(circle.getKeyShape().get('r')).toBe(10);

  //   circle.updateData({ r: 20 });
  //   expect(circle.getBBox()).toEqual({
  //     left: 180,
  //     top: 180,
  //     width: 40,
  //     height: 40,
  //   });
  //   expect(circle.getKeyShape().get('r')).toBe(20);

  //   circle.updateData({ width: 10, height: 10 });
  //   expect(circle.getBBox()).toEqual({
  //     left: 195,
  //     top: 195,
  //     width: 10,
  //     height: 10,
  //   });
  //   expect(circle.getKeyShape().get('r')).toBe(5);

  //   circle.updateData({ r: 50 });
  //   expect(circle.getBBox()).toEqual({
  //     left: 150,
  //     top: 150,
  //     width: 100,
  //     height: 100,
  //   });
  //   expect(circle.getKeyShape().get('r')).toBe(50);
  // });

  it("temp entities should work", () => {
    const nodeLen = graph.getNodes().length;
    // create temp node should work
    const n1 = graph.add(
      "node",
      { id: "tempNode", rank: 2, dummy: true },
      true
    );
    expect(graph.getNodeById("tempNode")).toEqual(n1);
    expect(graph.getNodes().length).toBe(nodeLen + 1);
    expect(n1.get("id")).toBe("tempNode");
    expect(n1.get("rank")).toBe(2);
    expect(n1.get("dummy")).toBe(true);
    expect(n1.keyShape).toBe(undefined);
    expect(n1.layer).toBe(undefined);
    const n2 = graph.add("node", { id: "tempNode1", rank: 2 }, true);

    // create temp edge with temp source & temp target
    const e1 = graph.add(
      "edge",
      { source: "tempNode", target: "tempNode1" },
      true
    );
    expect(e1.keyShape).toBe(null);
    expect(e1.source).toEqual(n1);
    expect(e1.target).toEqual(n2);
    expect(e1.get("source")).toEqual("tempNode");
    expect(e1.get("target")).toEqual("tempNode1");
    expect(n1.sources).toEqual([]);
    expect(n1.targets).toEqual(["tempNode1"]);
    expect(n2.sources).toEqual(["tempNode"]);
    expect(n2.targets).toEqual([]);

    // create temp edge with temp source & real target
    const e2 = graph.add("edge", { source: "tempNode", target: "2" }, true);
    expect(e2.keyShape).toBe(null);
    expect(n1.sources).toEqual([]);
    expect(n1.targets).toEqual(["tempNode1", "2"]);
    expect(n2.sources).toEqual(["tempNode"]);
    expect(n2.targets).toEqual([]);

    // remove temp edge
    graph.remove(e1);
    expect(n1.sources).toEqual([]);
    expect(n1.targets).toEqual(["2"]);
    expect(n2.sources).toEqual([]);
    expect(n2.targets).toEqual([]);

    // remove temp nodes & linked edge
    graph.remove(n1);
    expect(graph.getNodeById("tempNode")).toBe(undefined);
    expect(graph.getNodes().length).toBe(nodeLen + 1);
    const id = e2.get("id");
    expect(graph.getEdgeById(id)).toBe(undefined);
    expect(n2.sources).toEqual([]);
    expect(n2.targets).toEqual([]);

    graph.remove(n2);
    expect(graph.getNodeById("tempNode1")).toBe(undefined);
    expect(graph.getNodes().length).toBe(nodeLen);
  });

  it("hasState should work", () => {
    const n1 = graph.add("node", {
      id: "tempNode",
      rank: 2,
      dummy: true,
    });
    n1.setState("enabled");
    expect(n1.hasState("enabled"));
    expect(n1.hasState("disabled")).toBe(false);
    n1.setState("disabled", true);
    expect(n1.hasState("enabled")).toBe(false);
    expect(n1.hasState("disabled")).toBe(true);
  });

  it("bugfix: opacity states should resume", () => {
    graph.set("setNodeStateStyles", (state: string) => {
      if (state === "blur") {
        return { opacity: 0.2 };
      }
      if (state === "active") {
        return { opacity: 0.5 };
      }
    });
    const node = graph.add("node", { id: "test node" });
    node.setState("blur");
    expect(node.hasState("blur"));
    expect(node.getKeyShape().get("opacity")).toBe(0.2);

    node.setState("active");
    expect(node.hasState("blur"));
    expect(node.hasState("active"));
    expect(node.getKeyShape().get("opacity")).toBe(0.5);

    node.clearStates();
    expect(node.hasState("blur")).toBe(false);
    expect(node.hasState("active")).toBe(false);
    expect(node.getKeyShape().get("opacity")).toBe(undefined);
  });

  it("bugfix: states should resume after updateData()", () => {
    const node = graph.add("node", {
      id: "updateNode",
      label: "test update node",
    });
    node.setState("blur");
    expect(node.hasState("blur"));
    expect(node.getKeyShape().get("opacity")).toBe(0.2);
    expect(node.getLabel().get("text")).toBe("test update node");

    node.updateData({ label: null });
    expect(node.getLabel()).toBe(null);
    expect(node.hasState("blur"));
    expect(node.getKeyShape().get("opacity")).toBe(0.2);
    graph.clear();
  });

  it("bugfix: updateData should update icons", () => {
    const node = graph.add("node", {
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      icons: [
        {
          show: "always",
          position: [0, 0],
          setStyles() {
            return { icon: "11" };
          },
        },
      ],
    });

    let icons = node.layer.get("__icons");
    expect(icons.length).toBe(1);
    expect(icons[0].getMatrix()).toEqual([1, 0, 0, 1, -100, -40]);

    node.updateData({
      icons: [
        {
          show: "hover",
          position: [0.5, 0.5],
          setStyles() {
            return { icon: "22" };
          },
        },
        {
          show: "always",
          position: [0, 0],
          setStyles() {
            return { icon: "11" };
          },
        },
      ],
    });
    icons = node.layer.get("__icons");
    expect(icons.length).toBe(2);
    expect(icons[0].getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
    expect(icons[0].visible).toBe(false);
    expect(icons[1].getMatrix()).toEqual([1, 0, 0, 1, -100, -40]);
    expect(icons[1].visible).toBe(true);

    node.updateData({ icons: null });
    icons = node.layer.get("__icons");
    expect(icons).toBe(null);
  });

  it("update node width & height should update icons", () => {
    graph.clear();
    graph.set("setDefaultNode", (nodeData: any) => {
      return {
        width: nodeData.cols * 100,
        height: nodeData.rows * 20,
        icons: [
          {
            position: [0, 0],
            offsets: [10, -10],
            setStyles() {
              return { fillStyle: "#666", icon: "&#xe77a;" };
            },
          },
          {
            position: [1, 1],
            offsets: [-10, 10],
            setStyles() {
              return { fillStyle: "#ccc", icon: "&#xe77a;" };
            },
          },
        ],
      };
    });

    const node = graph.add("node", {
      cols: 1,
      rows: 2,
    });
    let icons = node.layer.get("__icons");
    expect(node.get("width")).toBe(100);
    expect(node.get("height")).toBe(40);
    expect(icons[0].matrix).toEqual([1, 0, 0, 1, -40, -30]);
    expect(icons[1].matrix).toEqual([1, 0, 0, 1, 40, 30]);

    node.updateData({
      cols: 2,
      rows: 1,
    });
    icons = node.layer.get("__icons");
    expect(node.get("width")).toBe(200);
    expect(node.get("height")).toBe(20);
    expect(icons[0].matrix).toEqual([1, 0, 0, 1, -90, -20]);
    expect(icons[1].matrix).toEqual([1, 0, 0, 1, 90, 20]);

    node.updateSize(300, 30);
    icons = node.layer.get("__icons");
    expect(node.get("width")).toBe(300);
    expect(node.get("height")).toBe(30);
    expect(icons[0].matrix).toEqual([1, 0, 0, 1, -140, -25]);
    expect(icons[1].matrix).toEqual([1, 0, 0, 1, 140, 25]);

    expect(node.isDestroyed()).toBe(false);

    graph.remove(node);
    expect(node.isDestroyed());
  });

  it("bugfix: node.sources & node.targets should work after edge removal", () => {
    graph.set("setDefaultNode", () => {
      return {
        width: 140,
        height: 40,
        anchors: [
          { position: [0, 0] },
          { position: [0, 0], offsets: [-10, 10] },
          { position: [1, 0.3], offsets: [30, -20] },
          { position: [1, 1], offsets: [30, -20] },
        ],
      };
    });

    graph.data({
      nodes: [{ id: "1" }, { id: "2" }, { id: "3" }],
      edges: [
        { source: "1", target: "2" },
        { source: "2", target: "3" },
        { source: "3", target: "1" },
      ],
    });
    const node1 = graph.getNodeById("1");
    expect(node1.sources).toEqual(["3"]);
    expect(node1.targets).toEqual(["2"]);

    const edge1 = graph.add("edge", {
      source: "1",
      target: "2",
    });
    const edge2 = graph.add("edge", {
      source: "3",
      target: "1",
    });
    expect(node1.sources).toEqual(["3"]);
    expect(node1.targets).toEqual(["2"]);

    graph.remove(edge1);
    expect(node1.targets).toEqual(["2"]);

    graph.remove(edge2);
    expect(node1.sources).toEqual(["3"]);

    const edge3 = graph.add("edge", {
      source: "1",
      target: "1",
    });
    expect(node1.sources).toEqual(["3"]);
    expect(node1.targets).toEqual(["2", "1"]);

    const edge4 = graph.add("edge", {
      source: "1",
      target: "1",
    });
    expect(node1.sources).toEqual(["3"]);
    expect(node1.targets).toEqual(["2", "1"]);

    graph.remove(edge3);
    expect(node1.sources).toEqual(["3"]);
    expect(node1.targets).toEqual(["2", "1"]);

    graph.remove(edge4);
    expect(node1.sources).toEqual(["3"]);
    expect(node1.targets).toEqual(["2"]);
    graph.clear();
  });

  it("anchor position should work with offsets", () => {
    const node = graph.add("node", {
      x: 0,
      y: 0,
    });

    const anchorPositions = node.getAnchorPositions();
    expect(anchorPositions).toEqual([
      [-70, -20],
      [-80, -10],
      [100, -28],
      [100, 0],
    ]);
    graph.clear();
  });

  it("bugfix: update width & height should refresh group bbox", () => {
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

    const node = graph.getNodeById("1");
    const group = graph.getGroupById("group");

    expect(group.getBBox()).toEqual({
      left: -90,
      top: -40,
      width: 180,
      height: 80,
    });

    node.updateData({
      x: 20,
      y: 20,
    });
    expect(group.getBBox()).toEqual({
      left: -70,
      top: -20,
      width: 180,
      height: 80,
    });

    node.updateData({
      width: 200,
      height: 80,
    });
    expect(group.getBBox()).toEqual({
      left: -100,
      top: -40,
      width: 240,
      height: 120,
    });
  });
  it("bugfix: update type should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
    });
    const node = graph.add("node", {
      id: "updateType1",
      type: "rect",
      width: 100,
      height: 20,
    });

    expect(node instanceof Node);
    expect(node.get("x")).toBe(0);
    expect(node.get("y")).toBe(0);
    expect(node.get("width")).toBe(100);
    expect(node.layer).not.toBe(null);
    expect(node.layer.getMatrix()[4]).toBe(0);
    expect(node.layer.getMatrix()[5]).toBe(0);
    expect(node.layer.get("appendSize")).toEqual(null);
    expect(node.layer.children.length).toBe(1);
    expect(node.layer.children[0].type).toBe("rect");
    expect(node.getAnchorPositions().length).toBe(0);
    expect(node.getBBox()).toEqual({
      left: -50,
      top: -10,
      width: 100,
      height: 20,
    });
    const keyShape = node.keyShape;
    expect(keyShape.type).toBe("rect");
    node.updateData({ type: "tag", icon: "&#xe68c;", label: "updateType1" });
    expect(node.layer.children.length).toBe(4);
    expect(node.layer.children[1].type).toBe("text"); // text
    expect(node.layer.children[1].get("fillStyle")).toBe("#21252C");
    expect(node.layer.children[2].type).toBe("rect"); // bgShape
    expect(node.layer.children[2].get("fillStyle")).toBe("#dfe1e5");
    expect(node.layer.children[3].type).toBe("icon"); // icon
    expect(node.layer.children[3].getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
    expect(node.layer.children[3].get("icon")).toBe("&#xe68c;");

    graph.destroy();
  });

  it("bugfix: Anchors should update appendSize correctly", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
    });
    let node = graph.add("node", {
      type: "rect",
      width: 100,
      height: 70,
      anchors: [
        {
          position: [0, 0],
          offsets: [10, 0],
          setStyles() {
            return {
              size: 10,
              hitWidth: 30,
              fillStyle: "#F3F9FF",
            };
          },
        },
        {
          position: [1, 0],
          offsets: [-10, 0],
          setStyles() {
            return {
              size: 10,
              hitWidth: 30,
              fillStyle: "#F3F9FF",
            };
          },
        },
      ],
    });
    expect(node.layer.get("__anchorAppendSize")).toEqual([20, 10, 0, 10]);
    expect(node.layer.get("appendSize")).toEqual([20, 10, 0, 10]);

    graph.remove(node);
    node = graph.add("node", {
      type: "rect",
      width: 100,
      height: 70,
      anchors: [
        {
          position: [0.5, 0],
          setStyles() {
            return {
              size: 20,
              hitWidth: 20,
              fillStyle: "#F3F9FF",
            };
          },
        },
        {
          position: [0.5, 1],
          setStyles() {
            return {
              size: 20,
              hitWidth: 20,
              fillStyle: "#F3F9FF",
            };
          },
        },
      ],
    });
    expect(node.layer.get("__anchorAppendSize")).toEqual([20, 0, 20, 0]);
    expect(node.layer.get("appendSize")).toEqual([20, 0, 20, 0]);
    graph.destroy();
  });

  it("bugfix: set width & height should sync to layer", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
    });

    const node = graph.add("node", {
      type: "rect",
      x: 100,
      y: 50,
      width: 100,
      height: 70,
    });
    node.set("width", 150);
    expect(node.layer.get("width")).toBe(150);
    expect(node.layer.get("height")).toBe(70);
    expect(node.layer.get("x")).toBe(100);
    expect(node.layer.get("y")).toBe(50);

    node.set("height", 200);
    expect(node.layer.get("width")).toBe(150);
    expect(node.layer.get("height")).toBe(200);
    expect(node.layer.get("x")).toBe(100);
    expect(node.layer.get("y")).toBe(50);

    node.set("x", 500);
    expect(node.layer.get("width")).toBe(150);
    expect(node.layer.get("height")).toBe(200);
    expect(node.layer.get("x")).toBe(500);
    expect(node.layer.get("y")).toBe(50);

    node.set("y", -100);
    expect(node.layer.get("width")).toBe(150);
    expect(node.layer.get("height")).toBe(200);
    expect(node.layer.get("x")).toBe(500);
    expect(node.layer.get("y")).toBe(-100);
  });

  it("isAnchorConnected should work", () => {
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode: () => ({
        width: 140,
        height: 40,
      }),
    });
    const node1 = graph.add("node", {
      id: "node1",
      x: 100,
      y: 50,
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
    });
    const node2 = graph.add("node", {
      id: "node2",
      x: 200,
      y: 200,
    });
    const edge = graph.add("edge", {
      source: "node1",
      target: "node2",
    });

    expect(node1.isAnchorConnected(0)).toBe(false);
    expect(node1.isAnchorConnected(1)).toBe(true);
    expect(node1.isAnchorConnected(1, "source")).toBe(true);
    expect(node1.isAnchorConnected(1, "target")).toBe(false);
    expect(node2.isAnchorConnected(0)).toBe(false);
    expect(node2.isAnchorConnected(1)).toBe(false);

    graph.remove(edge);
    expect(node1.isAnchorConnected(0)).toBe(false);
    expect(node1.isAnchorConnected(1)).toBe(false);
    expect(node2.isAnchorConnected(0)).toBe(false);
    expect(node2.isAnchorConnected(1)).toBe(false);

    graph.destroy();
  });

  it("bugfix: setState->updateData->removeState should recover styles", () => {
    registerNode("customNode", {
      type: "customNode",
      extends: "rect",
      shape() {},
      update() {},
    });
    const graph = new Graph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode: () => ({
        width: 140,
        height: 40,
        type: "customNode",
        strokeStyle: "#CCCCCC",
      }),
      setNodeStateStyles(state) {
        if (state === "active") {
          return {
            strokeStyle: "#3073FF",
          };
        }
      },
    });
    const node = graph.add("node", {
      id: "node1",
      x: 100,
      y: 50,
    });
    node.setState("active");
    expect(node.keyShape.get("strokeStyle")).toBe("#3073FF");
    node.updateData({ label: "label" });
    expect(node.keyShape.get("strokeStyle")).toBe("#3073FF");
    node.removeState("active");
    expect(node.keyShape.get("strokeStyle")).toBe("#CCCCCC");
    graph.destroy();
  });
});
