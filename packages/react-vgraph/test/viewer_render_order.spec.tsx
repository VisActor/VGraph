import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Graph, Group, Node } from "@visactor/vgraph";
import { Viewer, ViewerProps } from "../src/viewer";

describe("<Viewer /> render order", () => {
  let graph: Graph;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    graph = new Graph({
      container,
      width: 600,
      height: 400,
      renderMode: "dom",
      setDefaultNode: () => ({
        width: 120,
        height: 40,
        anchors: [{ position: [1, 0.5], size: 8 }],
      }),
      setDefaultGroup: () => ({
        titleSize: 40,
        padding: [12, 12, 12, 12],
        strokeStyle: "#ccc",
        lineWidth: 2,
      }),
    });
    graph.data({
      nodes: [
        { id: "node-1", x: 200, y: 200 },
        { id: "node-2", x: 200, y: 200 },
      ],
      edges: [],
      groups: [{ id: "group-1", children: ["node-1"] }],
    });
    graph.refresh();
  });

  afterEach(() => {
    cleanup();
    graph.destroy();
    container.remove();
  });

  function props(): ViewerProps {
    return {
      graph,
      localRendering: false,
      setNode: (node) => <span>{node.get("id")}</span>,
      setGroupTitle: (group) => <span>{group.get("id")}</span>,
    };
  }

  function order() {
    const viewport = container.querySelector(".vgraph-viewer-viewport")!;
    return Array.from(viewport.children).map((child) => child.textContent);
  }

  it("renders group titles before nodes by default", () => {
    render(<Viewer {...props()} />);
    expect(order()).toEqual(["group-1", "node-1", "node-2"]);
  });

  it("calls the reverse callback with a fresh mixed array and renders its result", () => {
    const viewer = React.createRef<Viewer>();
    const inputs: string[][] = [];
    const reverse = jest.fn((items: (Node | Group)[]) => {
      inputs.push(items.map((item) => item.get("id")));
      return items.reverse();
    });
    render(<Viewer {...props()} ref={viewer} setRenderOrder={reverse} />);

    expect(reverse).toHaveBeenCalled();
    expect(inputs[inputs.length - 1]).toEqual(["group-1", "node-1", "node-2"]);
    expect(order()).toEqual(["node-2", "node-1", "group-1"]);
    const mixed = reverse.mock.calls[reverse.mock.calls.length - 1][0];
    expect(mixed).not.toBe(viewer.current!.state.showNodes);
    expect(mixed).not.toBe(viewer.current!.state.showGroups);
    expect(mixed).toEqual([
      graph.getNodeById("node-2"),
      graph.getNodeById("node-1"),
      graph.getGroupById("group-1"),
    ]);
    expect(
      viewer.current!.state.showNodes.map((node) => node.get("id"))
    ).toEqual(["node-1", "node-2"]);
    expect(
      viewer.current!.state.showGroups.map((group) => group.get("id"))
    ).toEqual(["group-1"]);
  });

  it("uses the current callback on prop updates and restores defaults when removed", () => {
    const reverse = jest.fn((items: (Node | Group)[]) => items.reverse());
    const view = render(<Viewer {...props()} setRenderOrder={reverse} />);
    reverse.mockClear();
    const interleave = jest.fn((items: (Node | Group)[]) => {
      const byId = new Map(items.map((item) => [item.get("id"), item]));
      return ["node-1", "group-1", "node-2"].map((id) => byId.get(id)!);
    });

    view.rerender(<Viewer {...props()} setRenderOrder={interleave} />);
    expect(interleave).toHaveBeenCalledTimes(1);
    expect(reverse).not.toHaveBeenCalled();
    expect(order()).toEqual(["node-1", "group-1", "node-2"]);

    interleave.mockClear();
    view.rerender(<Viewer {...props()} />);
    expect(interleave).not.toHaveBeenCalled();
    expect(order()).toEqual(["group-1", "node-1", "node-2"]);
  });

  it("passes only rendered nodes when no group title renderer is provided", () => {
    const reverse = jest.fn((items: (Node | Group)[]) => items.reverse());
    render(
      <Viewer {...props()} setGroupTitle={undefined} setRenderOrder={reverse} />
    );
    expect(reverse).toHaveBeenLastCalledWith([
      graph.getNodeById("node-2"),
      graph.getNodeById("node-1"),
    ]);
    expect(order()).toEqual(["node-2", "node-1"]);
  });

  it("calls the callback with an empty array when the graph is empty", () => {
    graph.data({ nodes: [], edges: [] });
    const reverse = jest.fn((items: (Node | Group)[]) => items.reverse());
    render(<Viewer {...props()} setRenderOrder={reverse} />);
    expect(reverse).toHaveBeenCalledWith([]);
    expect(order()).toEqual([]);
  });

  it("preserves node anchors, styles and event targets after reordering", () => {
    const nodeClick = jest.fn();
    const groupClick = jest.fn();
    graph.on("node:click", nodeClick);
    graph.on("group.title:click", groupClick);
    const view = render(
      <Viewer
        {...props()}
        setRenderOrder={(items) => items.reverse()}
        setNodeClassName={() => "custom-node"}
        setAnchor={() => <span>anchor</span>}
      />
    );
    const nodeElement = container.querySelector(".custom-node")!;
    expect(nodeElement.classList.contains("vgraph-viewer-node")).toBe(true);
    expect(nodeElement.querySelector(".vgraph-viewer-anchor")).not.toBeNull();
    expect((nodeElement as HTMLElement).style.pointerEvents).toBe("all");
    const title = container.querySelector(".vgraph-viewer-group-title")!;
    const bbox = graph.getGroupById("group-1")!.get("__titleBBox");
    expect((title as HTMLElement).style.width).toBe(`${bbox.width + 1}px`);

    fireEvent.click(view.getByText("node-2"));
    expect(nodeClick).toHaveBeenCalledTimes(1);
    expect(nodeClick.mock.calls[0][0].target).toBe(graph.getNodeById("node-2"));
    fireEvent.click(view.getByText("group-1"));
    expect(groupClick).toHaveBeenCalledTimes(1);
    expect(groupClick.mock.calls[0][0].target).toBe(
      graph.getGroupById("group-1")
    );
  });
});
