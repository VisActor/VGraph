import { Graph, Trigger, GraphEvent } from "../../../src";

describe("Trigger util should work", () => {
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
        label: {
          text: nodeData.id,
          triggerId: "triggerLabel",
        },
      };
    },
  });

  graph.data({
    nodes: [
      {
        id: "1",
        x: 100,
        y: 100,
      },
      {
        id: "2",
        fillStyle: "#ccc",
        x: 200,
        y: 200,
      },
    ],
    edges: [
      {
        source: "1",
        target: "2",
      },
    ],
  });

  const node1 = graph.getNodeById("1");
  const edge1 = graph.getEdges()[0];

  it("hover should work", () => {
    let visible = false;
    let target = null;
    let shape = null;
    let style = null;
    const trigger = new Trigger(graph, {
      target: "node",
      onVisibleChange(show: boolean, e?: GraphEvent, entityBox?: any) {
        visible = show;
        target = e?.target;
        shape = e?.relatedTarget;
        style = entityBox;
      },
    });
    graph.emit("node:mouseenter", {
      nativeEvent: { clientX: 100, clientY: 100 },
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });

    expect(visible);
    expect(target).toBe(node1);
    expect(shape).toBe(null);
    expect(style).toEqual({
      left: 50,
      top: 90,
      width: 100,
      height: 20,
    });

    graph.emit("transformed");
    expect(visible).toBe(false);

    trigger.destroy();
    graph.emit("node:mouseenter", {
      nativeEvent: { clientX: 100, clientY: 100 },
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });
    expect(visible).toBe(false);
  });

  it("click should work", () => {
    let visible = false;
    let target = null;
    let shape = null;
    let style: any = null;
    const trigger = new Trigger(graph, {
      target: "node",
      trigger: "click",
      triggerId: "triggerLabel",
      onVisibleChange(show: boolean, e?: GraphEvent, entityBox?: any) {
        visible = show;
        target = e?.target;
        shape = e?.relatedTarget;
        style = entityBox;
      },
    });

    graph.emit("node:mouseenter", {
      nativeEvent: { clientX: 100, clientY: 100 },
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });

    expect(visible).toBe(false);

    graph.emit("node:click", {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });
    expect(visible).toBe(false);

    graph.emit("node:click", {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.getLabel(),
    });
    expect(target).toBe(node1);
    expect(shape).toBe(node1.getLabel());
    expect(style?.left).toBe(62);
    expect(style?.top).toBe(91);
    expect(style?.height).toBe(18);

    graph.emit("contextmenu");
    expect(visible).toBe(false);

    trigger.destroy();
    graph.emit("node:click", {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });

    expect(visible).toBe(false);
  });

  it("contextmenu should work", () => {
    let visible = false;
    let target = null;
    let shape = null;
    let style = null;
    const trigger = new Trigger(graph, {
      target: "node",
      trigger: "contextMenu",
      onVisibleChange(show: boolean, e?: GraphEvent, entityBox?: any) {
        visible = show;
        target = e?.target;
        shape = e?.relatedTarget;
        style = entityBox;
      },
    });

    graph.emit("node:contextmenu", {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });

    expect(visible).toBe(false);

    graph.emit("node:contextmenu", {
      nativeEvent: { clientX: 100, clientY: 100, button: 2 },
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });
    expect(visible).toBe(true);
    expect(target).toBe(node1);
    expect(shape).toBe(null);
    expect(style).toEqual({
      left: 50,
      top: 90,
      width: 100,
      height: 20,
    });

    trigger.destroy();
  });

  it("edge hover should use pointer position as tooltip box", () => {
    let visible = false;
    let style: any = null;
    const clientToViewport = jest
      .spyOn(graph, "clientToViewport")
      .mockReturnValue({ x: 12, y: 34 });
    edge1.getKeyShape().set("hitWidth", 16);
    const trigger = new Trigger(graph, {
      target: "edge",
      onVisibleChange(show: boolean, e?: GraphEvent, entityBox?: any) {
        visible = show;
        style = entityBox;
      },
    });

    graph.emit("edge:mouseenter", {
      clientX: 100,
      clientY: 120,
      nativeEvent: { clientX: 100, clientY: 120 },
      target: edge1,
    });

    expect(visible).toBe(true);
    expect(clientToViewport).toHaveBeenCalledWith(100, 120);
    expect(style).toEqual({
      left: 12,
      top: 34,
      width: 16,
      height: 16,
    });

    trigger.destroy();
    clientToViewport.mockRestore();
  });

  it("triggerId hover should support delayed show and ignore non-trigger shapes", () => {
    jest.useFakeTimers();
    let visible = false;
    const trigger = new Trigger(graph, {
      target: "node",
      triggerId: "triggerLabel",
      showDelay: 20,
      onVisibleChange(show: boolean) {
        visible = show;
      },
    });

    graph.emit("node:mouseover", {
      target: node1,
      relatedTarget: node1.get("keyShape"),
    });
    jest.advanceTimersByTime(30);
    expect(visible).toBe(false);

    graph.emit("node:mouseover", {
      target: node1,
      relatedTarget: node1.getLabel(),
    });
    expect(visible).toBe(false);
    jest.advanceTimersByTime(20);
    expect(visible).toBe(true);

    trigger.destroy();
    jest.useRealTimers();
  });

  it("popup container helpers should resolve selectors and include child targets", () => {
    const popup = document.createElement("div");
    const child = document.createElement("span");
    const outside = document.createElement("span");
    popup.className = "trigger-popup";
    popup.appendChild(child);
    document.body.appendChild(popup);
    document.body.appendChild(outside);
    const trigger = new Trigger(graph, {
      target: "node",
      popupContainer: ".trigger-popup",
      onVisibleChange() {
        return;
      },
    });

    expect(trigger.getPopupContainer()).toBe(popup);
    expect(trigger.includeTarget(popup, child)).toBe(true);
    expect(trigger.includeTarget(popup, outside)).toBe(false);
    expect(() => trigger.isTriggerShape(document.createElement("div"))).toThrow(
      "Trigger is meant for canvas entities."
    );

    trigger.destroy();
    document.body.removeChild(popup);
    document.body.removeChild(outside);
  });
});
