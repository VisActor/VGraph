import { Graph, Node, TreeGraph, Group } from "@visactor/vgraph";

const nodeEventMap = {
  onClick: "click",
  onDoubleClick: "dblclick",
  // onMouseEnter: 'mouseenter',
  onMouseOver: "mouseover",
  onMouseOut: "mouseout",
  // onMouseLeave: 'mouseleave',
  onMouseDown: "mousedown",
  onMouseUp: "mouseup",
  onMouseMove: "mousemove",
  onContextMenu: "contextmenu",
  onTouchStart: "touchstart",
  onTouchMove: "touchmove",
  onTouchEnd: "touchend",
};

const groupEventMap = {
  onClick: "click",
  onDoubleClick: "dblclick",
  onMouseDown: "mousedown",
  onMouseEnter: "mouseenter",
  onMouseLeave: "mouseleave",
  onMouseUp: "mouseup",
  onMouseMove: "mousemove",
  onContextMenu: "contextmenu",
  onTouchStart: "touchstart",
  onTouchMove: "touchmove",
  onTouchEnd: "touchend",
};

export function proxyNodeEvents(
  type: "node" | "anchor",
  graph: Graph | TreeGraph,
  node: Node
) {
  const events = {} as any;
  for (const [key, value] of Object.entries(nodeEventMap)) {
    events[key] = (e: any) => {
      if (value === "contextmenu") {
        e.preventDefault();
      }
      const relatedTarget = e.target;
      if (!node.layer.capture || node.isDestroyed()) {
        return;
      }
      if (value === "mousemove" || value === "touchmove") {
        graph.handleEvent(e.nativeEvent);
      }
      graph.emit(`node:${value}`, {
        ...e,
        target: node,
        relatedTarget,
      });
      graph.emit(value, {
        ...e,
        target: node,
        relatedTarget,
      });
      // if (additionalEvents[`${type}:${value}`]) {
      //   additionalEvents[`${type}:${value}`](type, graph, node, e);
      // }
    };
  }
  return events;
}

export function proxyGroupTitleEvents(graph: Graph | TreeGraph, group: Group) {
  const events: Record<string, any> = {};

  for (const [key, value] of Object.entries(groupEventMap)) {
    events[key] = (e: any) => {
      if (value === "contextmenu") {
        e.preventDefault();
      }
      if (!group.layer.capture || group.isDestroyed()) {
        return;
      }
      const relatedTarget = e.target;
      graph.emit(`group.title:${value}`, {
        ...e,
        target: group,
        relatedTarget,
      });
      if (value === "mouseenter" || value === "mouseleave") {
        return;
      }
      if (value === "mousemove" || value === "touchmove") {
        graph.handleEvent(e.nativeEvent);
        return;
      }
      graph.emit(`group:${value}`, {
        ...e,
        target: group,
        relatedTarget,
      });
    };
  }
  return events;
}
