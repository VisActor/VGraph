import { Graph } from "../../src/graph";
import { Minimap } from "../../src/components/minimap";

describe("src/minimap", () => {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);
  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(nodeData) {
      return {
        width: 15,
        height: 15,
      };
    },
    setDefaultEdge(edgeData) {
      return {
        lineWidth: 1,
      };
    },
  });

  graph.add("node", {
    type: "rect",
    label: "add node",
    id: "node1",
    x: 0,
    y: 0,
  });

  it("delegate minimap should work", () => {
    const minimap = new Minimap(graph, {
      width: 200,
      height: 100,
      type: "delegate",
      getNodeStyles() {
        return { fillStyle: "#ccc", strokeStyle: "#666" };
      },
    });

    const canvas = minimap.canvas as any;
    const viewport = minimap.viewport;
    expect(viewport.style.border).toBe("2px solid #5f95ff");
    expect(viewport.style.background).toBe("rgba(48, 115, 242, 0.05)");
    expect(viewport.style.display).toBe("block");
    expect(viewport.style.left).toBe("98px");
    expect(viewport.style.top).toBe("48px");
    expect(minimap.canvasBox).toEqual({
      left: -400,
      top: -300,
      width: 800,
      height: 600,
    });

    expect(canvas.children[0].getMatrix()).toEqual([
      0.16666666666666666, 0, 0, 0.16666666666666666, 98, 48,
    ]);

    expect(canvas.children[0].children[2].children.length).toBe(1);
    const shape = canvas.children[0].children[2].children[0];
    expect(shape.get("fillStyle")).toBe("#ccc");
    expect(shape.get("strokeStyle")).toBe("#666");
    expect(shape.get("width")).toBe(15);
    expect(shape.get("height")).toBe(15);

    graph.translate(20, 20);
    expect(viewport.style.left).toBe("94.66666666666667px");
    expect(viewport.style.top).toBe("44.666666666666664px");

    minimap.destroy();
  });

  it("keyshape minimap should work", () => {
    const minimap = new Minimap(graph, {
      width: 200,
      height: 100,
      type: "keyShape",
    });

    const canvas = minimap.canvas as any;
    const viewport = minimap.viewport;
    expect(viewport.style.border).toBe("2px solid #5f95ff");
    expect(viewport.style.background).toBe("rgba(48, 115, 242, 0.05)");
    expect(viewport.style.display).toBe("block");
    expect(viewport.style.left).toBe("94.66666666666667px");
    expect(viewport.style.top).toBe("44.666666666666664px");
    expect(viewport.style.width).toBe("133.33333333333331px");
    expect(viewport.style.height).toBe("100px");

    expect(canvas.children[0].children[2].children.length).toBe(1);
    const shape = canvas.children[0].children[2].children[0];
    expect(shape.get("fillStyle")).toBe("#fff");
    expect(shape.get("strokeStyle")).toBe("#E1E4EB");
    expect(shape.get("width")).toBe(15);
    expect(shape.get("height")).toBe(15);

    graph.scale(2);
    expect(viewport.style.left).toBe("94.66666666666667px");
    expect(viewport.style.top).toBe("44.666666666666664px");
    expect(viewport.style.width).toBe("66.66666666666666px");
    expect(viewport.style.height).toBe("50px");

    minimap.destroy();
  });

  it("showEdges & setEdgeStyles should work", (done) => {
    const node2 = graph.add("node", {
      id: "node2",
      x: 100,
      y: 100,
    });
    graph.add("edge", {
      source: "node1",
      target: "node2",
    });
    const minimap = new Minimap(graph, {
      width: 200,
      height: 100,
      showEdges: true,
      getEdgeStyles(edge: any) {
        return {
          strokeStyle: "blue",
        };
      },
    });
    const canvas = minimap.canvas as any;
    expect(canvas.children[0].children[2].children.length).toBe(2);
    expect(canvas.children[0].children[1].children.length).toBe(1);
    const edge = canvas.children[0].children[1].children[0];
    expect(edge.get("strokeStyle")).toBe("blue");
    expect(edge.get("path")).toEqual(
      graph.getEdges()[0].getKeyShape().get("path")
    );

    node2.translate(300, 300);
    graph.emit("change");

    setTimeout(() => {
      expect(edge.get("strokeStyle")).toBe("blue");
      expect(edge.get("path")).toEqual(
        graph.getEdges()[0].getKeyShape().get("path")
      );
      done();
    }, 100);
  });
});
