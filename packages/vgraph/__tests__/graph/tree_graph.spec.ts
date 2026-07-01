import { TreeGraph, uuid } from "../../src";

import jsonData from "./tree_data.json";

describe("src/graph/tree_graph", () => {
  const div = document.createElement("div");
  const graph = new TreeGraph({
    width: 1000,
    height: 400,
    container: div,
    animate: false,
    setDefaultNode() {
      return {
        width: 40,
        height: 20,
      };
    },
  });
  const data = JSON.parse(JSON.stringify(jsonData));
  it("data should work", () => {
    graph.data(data);
    expect(graph.root).not.toBe(undefined);
    if (graph.root) {
      expect(graph.root.get("id")).toBe("Modeling Methods");
      expect(graph.root.get("depth")).toBe(0);
      const children = graph.root
        .get("children")
        .map((child: any) => graph.getNodeById(child.id));
      expect(children.length).toBe(3);
      expect(children[0].get("id")).toBe("Classification");
      expect(children[0].get("depth")).toBe(1);
      expect(children[1].get("id")).toBe("Consensus");
      expect(children[1].get("depth")).toBe(1);
      expect(children[2].get("id")).toBe("Regression");
      expect(children[2].get("depth")).toBe(1);
    }
    expect(Object.keys(graph.entityMap.node).length).toBe(31);
    expect(Object.keys(graph.entityMap.edge).length).toBe(30);
  });

  it("updateData should work", () => {
    graph.updateData({
      id: "Modeling Methods",
    });
    expect(graph.root).not.toBe(undefined);
    if (graph.root) {
      expect(graph.root.get("id")).toBe("Modeling Methods");
      expect(graph.root.get("depth")).toBe(0);
      expect(graph.root.get("children").length).toBe(0);
    }
    expect(Object.keys(graph.entityMap.node).length).toBe(1);
    expect(Object.keys(graph.entityMap.edge).length).toBe(0);

    graph.updateData(JSON.parse(JSON.stringify(jsonData)));
    expect(graph.root).not.toBe(undefined);
    expect(Object.keys(graph.entityMap.node).length).toBe(31);
    expect(Object.keys(graph.entityMap.edge).length).toBe(30);

    if (graph.root) {
      expect(graph.root.get("id")).toBe("Modeling Methods");
      expect(graph.root.get("children").length).toBe(3);
      const children = graph.root
        .get("children")
        .map((child: any) => graph.getNodeById(child.id));
      expect(children[0].get("id")).toBe("Classification");
      expect(children[0].get("depth")).toBe(1);
      expect(children[1].get("id")).toBe("Consensus");
      expect(children[1].get("depth")).toBe(1);
      expect(children[2].get("id")).toBe("Regression");
      expect(children[2].get("depth")).toBe(1);
    }
    const modifyData = JSON.parse(JSON.stringify(jsonData));
    modifyData.children.pop();
    modifyData.children[1].id = "test";
    modifyData.children[1].children[0].test = "test";
    graph.updateData(modifyData);
    expect(graph.root).not.toBe(undefined);
    expect(Object.keys(graph.entityMap.node).length).toBe(25);
    expect(Object.keys(graph.entityMap.edge).length).toBe(24);
    if (graph.root) {
      expect(graph.root.get("id")).toBe("Modeling Methods");
      expect(graph.root.get("children").length).toBe(2);
      const children = graph.root
        .get("children")
        .map((child: any) => graph.getNodeById(child.id));
      expect(children[0].get("id")).toBe("Classification");
      expect(children[0].get("depth")).toBe(1);
      expect(children[1].get("id")).toBe("test");
      expect(children[1].get("depth")).toBe(1);
      expect(children[1].get("children")[0].test).toBe("test");
    }
  });

  it("getEntityId should work", () => {
    let id = graph.getEntityId({}, "node");
    expect(typeof id === "string");
    id = graph.getEntityId({ id: null }, "node");
    expect(typeof id === "string");
    id = graph.getEntityId({ id: 0 }, "node");
    expect(id).toBe(0);
  });

  it("bugfix: node should uuid when id is not defined", () => {
    const graph = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
    });
    graph.data({});
    const nodes: any = graph.getNodes();
    expect(nodes.length).toBe(1);
    expect(typeof nodes[0].get("id") === "string");
  });

  it("bugfix: addChild to a leave node should work", () => {
    const graph = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return {
          width: 40,
          height: 20,
        };
      },
    });
    graph.data({ id: "root" });
    const root = graph.getNodeById("root");
    graph.addChild({ id: "child" }, root);
    expect((graph.treeData as any).children[0].id).toEqual("child");
  });

  it("getData should work", () => {
    const graph = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
    });
    graph.data({ id: "root", children: [{ id: "child1" }, { id: "child2" }] });
    let data = graph.getData();
    expect(data.nodes).toEqual([
      {
        id: "root",
        x: 0,
        y: 0,
        depth: 0,
        width: 140,
        height: 40,
      },
      {
        id: "child1",
        x: 0,
        y: 0,
        depth: 1,
        width: 140,
        height: 40,
      },
      {
        id: "child2",
        x: 0,
        y: 0,
        depth: 1,
        width: 140,
        height: 40,
      },
    ]);
    expect(data.edges.length).toBe(2);
    expect(data.edges[0].source).toBe("root");
    expect(data.edges[0].target).toBe("child1");
    expect(data.edges[1].source).toBe("root");
    expect(data.edges[1].target).toBe("child2");

    data = graph.getData((entity: any) => {
      if (entity.type === "node") {
        return { id: entity.get("id") };
      } else {
        return {
          source: entity.get("source"),
          target: entity.get("target"),
        };
      }
    });
    expect(data.nodes).toEqual([
      {
        id: "root",
      },
      {
        id: "child1",
      },
      {
        id: "child2",
      },
    ]);

    expect(data.edges).toEqual([
      {
        source: "root",
        target: "child1",
      },
      {
        source: "root",
        target: "child2",
      },
    ]);
  });

  it("getTreeData should work", () => {
    const graph = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
    });
    graph.data({ id: "root", children: [{ id: "child1" }, { id: "child2" }] });
    const data = graph.getTreeData();
    expect(data).toEqual({
      id: "root",
      x: 0,
      y: 0,
      depth: 0,
      width: 140,
      height: 40,
      children: [
        {
          id: "child1",
          x: 0,
          y: 0,
          depth: 1,
          width: 140,
          height: 40,
        },
        {
          id: "child2",
          x: 0,
          y: 0,
          depth: 1,
          width: 140,
          height: 40,
        },
      ],
    });
  });

  it("bugfix: edge type should work in TreeGraph", () => {
    const g = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode() {
        return { width: 140, height: 40 };
      },
      setDefaultEdge() {
        return { type: "hLine" };
      },
    });
    g.data({
      id: "parent",
      children: [{ id: "children" }],
    });
    const edge: any = g.getEdges()[0];
    expect(edge.get("type")).toBe("hLine");
  });

  it("coord transform should work", () => {
    const g = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultEdge() {
        return { type: "hLine" };
      },
    });
    let p = g.canvasToViewport(10, 10);
    let t = g.viewportToCanvas(10, 10);
    expect(p).toEqual({
      x: 10,
      y: 10,
    });
    expect(t).toEqual({
      x: 10,
      y: 10,
    });
    g.scale(2);
    p = g.canvasToViewport(10, 10);
    t = g.viewportToCanvas(10, 10);
    expect(p).toEqual({
      x: 20,
      y: 20,
    });
    expect(t).toEqual({
      x: 5,
      y: 5,
    });
    g.translate(10, 10);
    p = g.canvasToViewport(10, 10);
    t = g.viewportToCanvas(10, 10);
    expect(p).toEqual({
      x: 30,
      y: 30,
    });
    expect(t).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("bugfix: setDefaultNode specify id should work", () => {
    const treeGraph = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      setDefaultNode(nodeData: any) {
        return {
          id: nodeData.name,
          width: 140,
          height: 40,
        };
      },
    });

    treeGraph.data({
      name: "parent",
      children: [{ name: "child" }],
    });

    expect(treeGraph.getNodeById("parent")).not.toBe(undefined);
    expect(treeGraph.getNodeById("child")).not.toBe(undefined);

    treeGraph.destroy();
  });

  it("moveNode should work", () => {
    let moveNode = graph.getNodeById("Methods");
    const newParent = graph.getNodeById("Classification");
    expect(newParent.get("children").length).toBe(8);
    graph.moveNode(moveNode, newParent);
    expect(newParent.get("children").length).toBe(9);
    expect(moveNode.get("parent")).toBe(newParent);

    graph.collapse(newParent);
    moveNode = graph.getNodeById("Classifier fusion");
    graph.moveNode(moveNode, newParent);
    expect(newParent.get("children").length).toBe(10);
    expect(moveNode.get("parent")).toBe(newParent);
    expect(moveNode.visible).toBe(false);
  });

  it("get & setZoomRatio should work", () => {
    graph.resetMatrix();
    expect(graph.setZoomRatio(1.5));
    expect(graph.getZoomRatio()).toBe(1.5);
    expect(graph.getMatrix()).toEqual([1.5, 0, 0, 1.5, -250, -100]);

    graph.translate(200, 200);
    expect(graph.getMatrix()).toEqual([1.5, 0, 0, 1.5, -50, 100]);
    graph.setZoomRatio(1);
    expect(graph.getMatrix()).toEqual([
      1, 0, 0, 1, 133.33333333333337, 133.33333333333334,
    ]);
  });

  it("bugfix: add existed node should work", () => {
    graph.data({
      id: "root",
      children: [
        {
          id: "1",
          children: [{ id: "2" }],
        },
      ],
    });

    expect(graph.getNodes().length).toBe(3);
    const node2 = graph.getNodeById("2");
    expect(node2);
    graph.updateChildren([{ id: "2" }, { id: "1" }], graph.getNodeById("root"));
    expect(node2.isDestroyed());
    expect(graph.getNodes().length).toBe(3);
    expect(
      graph
        .getNodeById("root")
        .get("children")
        .map((node: any) => node.id)
    ).toEqual(["2", "1"]);

    graph.data({
      id: "root",
      children: [
        {
          id: "1",
          children: [{ id: "5" }],
        },
        {
          id: "2",
          children: [{ id: "3", children: [{ id: "4" }] }],
        },
      ],
    });

    graph.updateChildren(
      [{ id: "3" }, { id: "2" }, { id: "5" }],
      graph.getNodeById("1")
    );

    expect(graph.getNodes().length).toBe(5);
    expect(graph.getNodeById("4")).toBe(undefined);
    expect(
      graph
        .getNodeById("1")
        .get("children")
        .map((node: any) => node.id)
    ).toEqual(["3", "2", "5"]);
  });

  it("treeGraph with alignView should work", () => {
    graph.data(data);
    graph.alignView("lt");
    let bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(50);
    expect(bbox.top).toBeCloseTo(50, 10);

    graph.alignView("lc");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(50);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView("lb");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(50);
    expect(bbox.top + bbox.height).toBe(400 - 50);

    graph.alignView("rt");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(1000 - 50);
    expect(bbox.top).toBeCloseTo(50, 10);

    graph.alignView("rc");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(1000 - 50);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView("rb");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(1000 - 50);
    expect(bbox.top + bbox.height).toBe(400 - 50);

    graph.alignView("ct");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(500);
    expect(bbox.top).toBeCloseTo(50, 10);

    graph.alignView("cc");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(500);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView("cb");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(500);
    expect(bbox.top + bbox.height).toBe(400 - 50);
  });

  it("treeGraph with alignView after scale should work", () => {
    graph.data(data);
    graph.scale(0.3);
    graph.translate(1423, -4563);
    graph.alignView("lt");
    let bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(50);
    expect(bbox.top).toBe(50);

    graph.alignView("lc");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(50);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView("lb");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left).toBe(50);
    expect(bbox.top + bbox.height).toBe(400 - 50);

    graph.alignView("rt");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(1000 - 50);
    expect(bbox.top).toBe(50);

    graph.alignView("rc");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(1000 - 50);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView("rb");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + bbox.width).toBe(1000 - 50);
    expect(bbox.top + bbox.height).toBe(400 - 50);

    graph.alignView("ct");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(500);
    expect(bbox.top).toBe(50);

    graph.alignView("cc");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(500);
    expect(bbox.top + 0.5 * bbox.height).toBe(200);

    graph.alignView("cb");
    bbox = graph.getContainer().getBBox();
    expect(bbox.left + 0.5 * bbox.width).toBe(500);
    expect(bbox.top + bbox.height).toBe(400 - 50);
  });

  it("bugfix: setDefaultNode id should work with undefined", () => {
    graph.clear();
    graph.set("setDefaultNode", (nodeData: any) => ({
      id: undefined,
      width: 140,
      height: 40,
    }));
    graph.data(JSON.parse(JSON.stringify(jsonData)));
    expect(graph.root?.get("id")).not.toBe(undefined);
    expect(graph.root?.get("id")).not.toBe(jsonData.id);
  });

  it("bugfix: setDefaultNode id should work with uuid", () => {
    graph.clear();
    graph.set("setDefaultNode", (nodeData: any) => ({
      id: uuid(),
      width: 140,
      height: 40,
    }));
    graph.data(JSON.parse(JSON.stringify(jsonData)));
    expect(graph.root?.get("id")).not.toBe(undefined);
    expect(graph.root?.get("id")).not.toBe(jsonData.id);
  });

  it("bugfix: clear should set root and treeData to null.", () => {
    graph.clear();
    expect(graph.root).toBe(null);
    expect(graph.treeData).toBe(null);
    expect(graph.getNodes().length).toBe(0);
    graph.data(JSON.parse(JSON.stringify(jsonData)));
    expect(graph.root?.get("id")).not.toBe(undefined);
    expect(graph.root?.get("id")).not.toBe(jsonData.id);
    graph.clear();
    expect(graph.root).toBe(null);
    expect(graph.treeData).toBe(null);
    expect(graph.getNodes().length).toBe(0);
  });

  it("dom node should work", () => {
    const graph = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      renderMode: "dom",
      animate: false,
      setDefaultNode() {
        return {
          width: 40,
          height: 20,
        };
      },
    });

    graph.data({
      id: "a",
      children: [{ id: "b" }],
    });

    const a = graph.getNodeById("a");
    const b = graph.getNodeById("b");
    const edge = graph.getEdges()[0];
    expect(a.layer.children.length).toBe(0);
    expect(b.layer.children.length).toBe(0);
    expect(edge.layer.children.length).toBe(1);

    graph.addChild({ id: "c" }, a);
    expect(a.get("children").length).toBe(2);
    expect(a.layer.children.length).toBe(0);

    graph.removeChild(graph.getNodeById("c"), a);
    expect(a.get("children").length).toBe(1);
    expect(a.layer.children.length).toBe(0);

    graph.collapse(a);
    expect(a.get("collapsed"));
    expect(b.isVisible()).toBe(false);
    graph.expand(a);
    expect(a.get("collapsed")).toBe(false);
    expect(b.isVisible()).toBe(true);
  });

  it("bugfix: getTreeData children order should be correct", () => {
    const graph = new TreeGraph({
      width: 1000,
      height: 400,
      container: div,
      animate: false,
      setDefaultNode() {
        return {
          width: 40,
          height: 20,
        };
      },
    });

    graph.data({
      id: "root",
      children: [{ id: "a" }, { id: "b" }, { id: "c" }],
    });

    graph.moveNode(graph.getNodeById("c"), graph.getNodeById("root"), 1);
    const data = graph.getTreeData();
    expect(data.id).toBe("root");
    expect(data.children!.length).toBe(3);
    expect(data.children![0].id).toBe("a");
    expect(data.children![1].id).toBe("c");
    expect(data.children![2].id).toBe("b");
  });
});
