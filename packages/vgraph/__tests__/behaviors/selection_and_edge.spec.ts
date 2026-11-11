import { Graph, brushSelect, dragEdge } from "../../src";

function createGraph() {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    setDefaultNode() {
      return {
        width: 60,
        height: 40,
        anchors: [
          {
            show: "always",
            position: [0.5, 0],
            setStyles() {
              return {
                fillStyle: "#fff",
              };
            },
          },
          {
            show: "always",
            position: [0.5, 1],
            setStyles() {
              return {
                fillStyle: "#fff",
              };
            },
          },
        ],
      };
    },
    setDefaultEdge() {
      return {
        lineWidth: 1,
      };
    },
  });

  graph.data({
    nodes: [
      { id: "a", x: 100, y: 100 },
      { id: "b", x: 220, y: 100 },
      { id: "c", x: 340, y: 100 },
    ],
    edges: [
      { id: "a-b", source: "a", target: "b" },
      { id: "b-c", source: "b", target: "c" },
    ],
    groups: [{ id: "group", children: ["a", "b"], padding: [12, 12, 12, 12] }],
  } as any);

  return graph;
}

describe("src/behaviors brushSelect and dragEdge focused workflows", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("brush selection should switch modes and include configured entity targets", () => {
    const graph = createGraph();
    const selected: string[] = [];
    const deselected: string[] = [];
    const onChange = jest.fn();

    graph.addBehavior(brushSelect, {
      targets: ["node", "edge", "group"],
      autoTranslate: false,
      onSelect(entity: any) {
        selected.push(`${entity.type}:${entity.get("id")}`);
        return true;
      },
      onDeselect(entity: any) {
        deselected.push(`${entity.type}:${entity.get("id")}`);
        return true;
      },
      onChange,
    });

    graph.emit("canvas:mousedown", {
      clientX: 40,
      clientY: 40,
      nativeEvent: { metaKey: false },
    });
    graph.emit("mousemove", {
      clientX: 280,
      clientY: 160,
    });

    const behavior = graph.getBehavior("brushSelect")!;
    expect(behavior.dragging).toBe(true);
    expect(selected).toEqual(
      expect.arrayContaining(["group:group", "edge:a-b"])
    );
    expect(selected).not.toEqual(expect.arrayContaining(["node:a", "node:b"]));

    behavior.changeMode({ type: "keydown", key: "Meta" } as KeyboardEvent);
    expect(behavior.mode).toBe("accurate");
    expect(selected).toEqual(expect.arrayContaining(["node:a", "node:b"]));
    expect(deselected).toEqual(expect.arrayContaining(["group:group"]));

    behavior.changeMode({ type: "keyup", key: "Meta" } as KeyboardEvent);
    expect(behavior.mode).toBe("default");

    graph.emit("mouseup", {});
    expect(onChange).toHaveBeenCalledWith(expect.any(Array));

    graph.removeBehavior(brushSelect);
    graph.destroy();
  });

  it("drag edge should reject guarded drags and recover magnet anchor styles", () => {
    const graph = createGraph();
    const source = graph.getNodeById("a");
    const target = graph.getNodeById("b");
    const sourceAnchor = source.layer.get("__anchors")[1];
    const onDrop = jest.fn();

    graph.addBehavior(dragEdge, {
      shouldTrigger: jest.fn(() => false),
    });
    graph.emit("node:mousedown", {
      target: source,
      relatedTarget: sourceAnchor,
      clientX: 100,
      clientY: 120,
      nativeEvent: { button: 0 },
    });
    graph.emit("mousemove", {
      target: source,
      relatedTarget: sourceAnchor,
      clientX: 120,
      clientY: 140,
    });

    expect(graph.getEdges()).toHaveLength(2);
    expect(source.get("disableNodeEvent")).toBe(false);
    graph.removeBehavior(dragEdge);

    graph.addBehavior(dragEdge, {
      magnet: true,
      magnetDist: 40,
      autoTranslate: false,
      magnetAnchorStyles: {
        fillStyle: "#f00",
      },
      onDrop,
    });

    graph.emit("node:mousedown", {
      target: source,
      relatedTarget: sourceAnchor,
      clientX: 100,
      clientY: 120,
      nativeEvent: { button: 0 },
    });
    graph.emit("mousemove", {
      target: source,
      relatedTarget: sourceAnchor,
      clientX: 220,
      clientY: 80,
    });

    const behavior = graph.getBehavior("dragEdge")!;
    expect(behavior.dragging).toBe(true);
    behavior.refreshMagnet({
      x: target.getAnchorPositions()[0][0],
      y: target.getAnchorPositions()[0][1],
    });
    expect(behavior.magnetAnchor?.anchorConfigs.magnet).toBe(true);
    expect(behavior.lastTarget).toBe(target);

    behavior.onMouseUp({} as any);

    expect(onDrop).toHaveBeenCalledWith(source, target);
    expect(graph.getEdges().map((edge) => edge.get("target"))).toContain("b");
    expect(target.get("anchors")[0].magnet).toBe(false);
    expect(behavior.magnetAnchor).toBeNull();
    expect(behavior.dragging).toBe(false);

    graph.removeBehavior(dragEdge);
    graph.destroy();
  });
});
