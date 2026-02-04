import { Graph } from "../../src/graph";
import { GRAPH_EVENTS } from "../../src/consts/meta_events";
import { Snapline } from "../../src/components/node_mover/snapline";

describe("src/node_mover/snapline", () => {
  const graphDiv = document.createElement("div");
  document.body.append(graphDiv);

  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        width: 140,
        height: 40,
      };
    },
  });

  const node1 = graph.add("node", {
    id: "1",
    x: 100,
    y: 100,
  });

  const node2 = graph.add("node", {
    id: "2",
    x: 120,
    y: 120,
  });

  it("snapline should work with default options", () => {
    const snapline = new Snapline(graph);
    graph.emit(GRAPH_EVENTS.MOVE_START, {
      targets: [node2],
      clientX: 100,
      clientY: 100,
    });

    expect(snapline.bbox).toEqual({
      minX: 50,
      minY: 100,
      maxX: 190,
      maxY: 140,
    });

    // v
    graph.emit(GRAPH_EVENTS.MOVING, {
      offsetX: -20,
      offsetY: 0,
    });

    expect(snapline.container.children.length).toBe(1);
    expect(snapline.container.children[0].get("path")).toEqual([
      ["M", 100, 80],
      ["L", 100, 140],
    ]);
    expect(snapline.container.children[0].get("strokeStyle")).toBe("#3073FF");
    expect(snapline.container.children[0].get("lineWidth")).toBe(1);

    // h
    graph.emit(GRAPH_EVENTS.MOVING, {
      offsetX: 20,
      offsetY: -20,
    });
    expect(snapline.container.children.length).toBe(1);
    expect(snapline.container.children[0].get("path")).toEqual([
      ["M", 30, 100],
      ["L", 190, 100],
    ]);

    // l
    graph.emit(GRAPH_EVENTS.MOVING, {
      offsetX: 120,
      offsetY: 20,
    });
    expect(snapline.container.children.length).toBe(1);
    expect(snapline.container.children[0].get("path")).toEqual([
      ["M", 170, 80],
      ["L", 170, 140],
    ]);

    // r + t
    graph.emit(GRAPH_EVENTS.MOVING, {
      offsetX: -280,
      offsetY: 20,
    });
    expect(snapline.container.children.length).toBe(2);
    expect(snapline.container.children[0].get("path")).toEqual([
      ["M", 30, 80],
      ["L", 30, 160],
    ]);
    expect(snapline.container.children[1].get("path")).toEqual([
      ["M", -110, 120],
      ["L", 170, 120],
    ]);

    // r + b
    graph.emit(GRAPH_EVENTS.MOVING, {
      offsetX: 0,
      offsetY: -80,
    });
    expect(snapline.container.children.length).toBe(2);
    expect(snapline.container.children[0].get("path")).toEqual([
      ["M", 30, 40],
      ["L", 30, 120],
    ]);
    expect(snapline.container.children[1].get("path")).toEqual([
      ["M", -110, 80],
      ["L", 170, 80],
    ]);

    graph.emit(GRAPH_EVENTS.MOVE_END);
    expect(snapline.container.children.length).toBe(0);

    snapline.destroy();
  });
});
