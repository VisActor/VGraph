import { Node, Edge } from "../models/entities";
import { GraphEvent } from "../typings/event";
import { GRAPH_EVENTS } from "../consts/meta_events";

/**
 * Highlight direct correlations.
 * 高亮直接关联关系
 */
export const highlightRelations: any = {
  type: "highlightRelations",
  trigger: "hover",
  activeNodeState: "active",
  activeEdgeState: "active",
  blurNodeState: "blur",
  blurEdgeState: "blur",
  activeNode: null,
  shouldTrigger() {
    return true;
  },

  getEvents() {
    if (this.trigger === "hover") {
      return {
        "node:mouseenter": "onMouseEnter",
        "node:mouseleave": "onMouseLeave",
        change: "onChange",
        "move:start": "onChange",
      };
    }
    return {
      "node:click": "onClick",
      "canvas:click": "onCanvasClick",
      change: "onChange",
      "move:start": "onChange",
    };
  },

  onMouseEnter(ev: GraphEvent) {
    if (!this.shouldTrigger(ev, this.graph)) {
      return;
    }
    this.highlight(ev.target);
  },

  onMouseLeave(ev: GraphEvent) {
    this.recover();
  },

  onChange(ev: GraphEvent) {
    if (ev.type !== GRAPH_EVENTS.UPDATE_END) {
      this.activeNode && this.recover();
    }
  },

  onClick(ev: GraphEvent) {
    if (!this.shouldTrigger(ev, this.graph)) {
      return;
    }
    const node = ev.target;
    if (this.activeNode === node) {
      this.recover();
    } else {
      this.highlight(node);
    }
  },

  onCanvasClick() {
    this.recover();
  },

  highlight(node: Node) {
    const graph = this.graph;
    const { blurNodeState, blurEdgeState, activeNodeState, activeEdgeState } =
      this;
    graph.emit(GRAPH_EVENTS.BATCH_STATE_START, {
      targets: [node],
      state: activeNodeState,
    });
    const autoDraw = graph.disableAutoDraw();

    graph.getNodes().forEach((n: Node) => {
      n.setState(blurNodeState);
    });
    graph.getEdges().forEach((e: Edge) => {
      e.setState(blurEdgeState);
    });
    node.removeState(blurNodeState);
    node.setState(activeNodeState);
    node.edges.forEach((edge: Edge) => {
      edge.removeState(blurEdgeState);
      edge.toFront();
      edge.setState(activeEdgeState);
      edge.source.removeState(blurNodeState);
      edge.source.setState(activeNodeState);
      edge.target.removeState(blurNodeState);
      edge.target.setState(activeNodeState);
    });
    this.activeNode = node;
    graph.emit(GRAPH_EVENTS.BATCH_STATE_END, {
      targets: [node],
      state: activeNodeState,
    });
    this.graph.enableAutoDraw(autoDraw);
  },

  recover() {
    const activeNodeState = this.activeNodeState;
    const activeEdgeState = this.activeEdgeState;
    const blurNodeState = this.blurNodeState;
    const blurEdgeState = this.blurEdgeState;
    const graph = this.graph;
    const activeNode = this.activeNode;
    graph.emit(GRAPH_EVENTS.BATCH_STATE_START, {
      targets: [activeNode],
      state: activeNodeState,
    });
    const autoDraw = graph.disableAutoDraw();

    graph.getNodes().forEach((n: Node) => {
      n.removeState(activeNodeState);
      n.removeState(blurNodeState);
    });
    graph.getEdges().forEach((e: Edge) => {
      e.removeState(activeEdgeState);
      e.removeState(blurEdgeState);
    });
    graph.emit(GRAPH_EVENTS.BATCH_STATE_END, {
      targets: [activeNode],
      state: activeNodeState,
    });
    this.activeNode = null;
    graph.enableAutoDraw(autoDraw);
  },
};
