import { Circle, Rect } from "../renderer";
import { isDragDist, insertStyles } from "../utils";
import { Node, Edge } from "../models/entities";
import { GRAPH_EVENTS } from "../consts/meta_events";
import { GraphEvent } from "../typings/event";
import { autoTranslate } from "./auto_translate";

const GRABBING_CLS = "vgraph-grabbing";

/**
 * Adsorptive drag-and-drop of a node.
 * 吸附式拖拽节点交互
 */
export const attachableDragNode: any = {
  type: "attachableDragNode",
  dragging: false,
  linkAnchor: false,
  autoTranslate: true,
  originPositions: null,
  lastPositions: null,
  // 拖拽节点
  target: null,
  // 触发拖拽的图形
  triggerShape: null,
  // 代理图形配置
  delegate: true,
  delegateStyles: null,
  // 临时引导线
  tempEdge: null,
  tempEdgeStyles: {},
  tempHidedEdges: [],
  // 吸附到哪个节点后
  parent: null,
  getTargetLinkPoint: null,
  // autoTranslate timer
  interval: null,
  init() {
    insertStyles(`
    .${GRABBING_CLS} {
      cursor: move!important;
      cursor: -webkit-grabbing!important;
      cursor:grabbing!important;
    }
    `);
    this.linkAnchor = !this.graph.get("linkCenter");
  },
  shouldTrigger() {
    return true;
  },
  shouldDrop() {
    return true;
  },
  onDragStart() {
    return;
  },
  onDragEnter() {
    return;
  },
  onDragLeave() {
    return;
  },
  onDrag() {
    return;
  },
  onDrop() {
    return;
  },
  onAttachNode(node: Node) {
    return node;
  },
  getEvents() {
    return {
      "node:mousedown": "onMouseDown",
      "node:mouseenter": "onMouseEnter",
      "node:mouseleave": "onMouseLeave",
      mousemove: "onMouseMove",
    };
  },

  getGlobalEvents() {
    return { mouseup: "onMouseUp" };
  },

  onMouseDown(ev: GraphEvent) {
    const target = ev.target;
    this.target = target;
    this.triggerShape = ev.relatedTarget;
    this.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    this.originPositions = {
      x: target.get("x"),
      y: target.get("y"),
    };
  },

  onMouseEnter(ev: GraphEvent) {
    if (this.dragging) {
      this.onDragEnter(ev.target, ev);
    }
  },

  onMouseLeave(ev: GraphEvent) {
    if (this.dragging) {
      this.onDragLeave(ev.target, ev);
    } else {
      this.graph.canvas.getCanvasDom().classList.remove(GRABBING_CLS);
    }
  },

  onMouseMove(ev: GraphEvent) {
    if (!this.lastPositions) {
      return;
    }
    const graph = this.graph;
    const refresh = isDragDist(this.lastPositions, ev);
    const target = this.target;
    if (!this.dragging) {
      if (refresh) {
        ev.target = target;
        if (this.shouldTrigger(ev, this.triggerShape)) {
          graph.emitEvent(GRAPH_EVENTS.MOVE_START, { targets: [target] });
          this.dragging = true;
          this.onDragStart(target, ev);
          graph.canvas.getCanvasDom().classList.add(GRABBING_CLS);
          if (this.delegate) {
            this.shape = this.initDelegateShape();
          } else {
            this.tempHidedEdges = [];
            this.target.edges.forEach((edge: Edge) => {
              edge.hide();
              this.tempHidedEdges.push(edge);
            });
            target.setCapture(false);
          }
          this.initTempEdge(target);
        } else {
          this.lastPositions = null;
          return;
        }
      } else {
        return;
      }
    }
    if (refresh) {
      this.updateNodePosition(ev);
      graph.emit(GRAPH_EVENTS.MOVING, { targets: [target] });
    }
    if (this.autoTranslate) {
      if (!this.tempEdge) {
        return;
      }
      this.clearInterval();
      const shapeBox = this.target.getBBox();
      this.interval = autoTranslate(graph, shapeBox, (x: number, y: number) => {
        graph.emit(GRAPH_EVENTS.MOVING, { targets: [target] });
        this.updateNode(-x, -y);
      });
    }
  },

  initTempEdge(target: Node) {
    const graph = this.graph;
    this.parent = graph.getNodeById(target.sources[0]) || this.getParent();
    const parent = this.parent;
    let startPoint = [0, 0];
    if (parent) {
      startPoint = [parent.get("x"), parent.get("y")];
    }
    const linkAnchor = this.linkAnchor;
    const edge = new Edge(
      {
        source:
          parent?.get("id") ||
          graph
            .getNodes()
            .find((node: Node) => node.get("id") !== target.get("id"))
            .get("id"),
        target: target.get("id"),
        startPoint: linkAnchor && parent ? undefined : startPoint,
        endPoint: linkAnchor ? undefined : [target.get("x"), target.get("y")],
        opacity: 0.5,
        temp: true,
        ...this.tempEdgeStyles,
      } as any,
      graph,
      graph.edgeContainer
    );
    if (!parent) {
      edge.hide();
    }
    this.tempEdge = edge;
  },

  updateNode(offsetX: number, offsetY: number) {
    const tempEdge = this.tempEdge;
    const linkAnchor = this.linkAnchor;
    if (this.delegate) {
      this.shape.translate(offsetX, offsetY);
      const matrix = this.shape.getMatrix();
      this.onDrag(this.target, matrix[4], matrix[5]);
      !linkAnchor && tempEdge.set("endPoint", [matrix[4], matrix[5]]);
    } else {
      const target = this.target;
      target.translate(offsetX, offsetY);
      this.onDrag(target);
      !linkAnchor &&
        tempEdge.set("endPoint", [target.configs.x, target.configs.y]);
    }
    this.updateParent();
    tempEdge.updatePosition();
    this.graph.draw();
  },

  updateNodePosition(ev: GraphEvent) {
    const { x, y } = this.lastPositions;
    const scale = this.graph.getZoomRatio();
    const offsetX = (ev.clientX - x) / scale;
    const offsetY = (ev.clientY - y) / scale;
    this.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    this.updateNode(offsetX, offsetY);
  },

  getParent() {
    const graph = this.graph;
    const target = this.target;
    const { x, y } = target.configs;
    if (this.findClosestNode) {
      this.parent = this.findClosestNode(this.target);
    } else {
      let minNode = null;
      let minDist = Infinity;
      graph.getNodes().forEach((node: Node) => {
        if (node.get("id") !== target.get("id")) {
          const dist = Math.sqrt(
            (x - node.get("x")) * (x - node.get("x")) +
              (y - node.get("y")) * (y - node.get("y"))
          );
          if (dist < minDist) {
            minNode = node;
            minDist = dist;
          }
        }
      });
      this.parent = this.onAttachNode(minNode);
    }
    return this.parent;
  },

  updateParent() {
    const target = this.target;
    const tempEdge = this.tempEdge;
    const linkAnchor = this.linkAnchor;
    this.getParent();
    if (this.parent === null) {
      tempEdge.hide();
    } else {
      if (tempEdge.get("source") !== this.parent.get("id")) {
        tempEdge.setSource(this.parent.get("id"));
      }
      tempEdge.set("startPoint", undefined);
      tempEdge.show();
      let startPoint = [this.parent.get("x"), this.parent.get("y")];
      if (this.getTargetLinkPoint) {
        startPoint = this.getTargetLinkPoint(target, this.parent);
      }
      this.parent && !linkAnchor && tempEdge.set("startPoint", startPoint);
    }
  },

  initDelegateShape() {
    const keyShape = this.target.getKeyShape();
    const bbox = this.target.getBBox();
    const container = this.graph.getNodeContainer();
    const configs = keyShape.configs;
    const shape =
      keyShape.type === "circle"
        ? new Circle({
            ...configs,
            cx: bbox.left + bbox.width / 2,
            cy: bbox.top + bbox.height / 2,
          })
        : new Rect({
            ...configs,
            left: bbox.left,
            top: bbox.top,
          });
    shape.capture = false;
    container.add(shape);
    if (this.delegateStyles) {
      shape.set(this.delegateStyles);
    }
    return shape;
  },

  onMouseUp(ev: GraphEvent) {
    const target = this.target;
    const graph = this.graph;
    this.clearInterval();
    // delegate
    if (this.shape) {
      if (this.shouldDrop(ev, target, this.parent)) {
        const matrix = this.shape.getMatrix();
        target.translate(matrix[4], matrix[5]);
        graph.emitEvent(GRAPH_EVENTS.MOVE_END, { targets: [target] });
        this.onDrop(target, this.parent, ev);
      }
      graph.getNodeContainer().remove(this.shape);
      graph.draw();
      this.shape = null;
    }
    if (this.dragging && target) {
      target.setCapture(true);
      this.tempEdge.destroy();
      this.tempHidedEdges?.forEach((edge: any) => {
        edge.show();
      });
      if (!this.shouldDrop(ev, target, this.parent)) {
        target.updatePosition(this.originPositions.x, this.originPositions.y);
      } else {
        graph.emitEvent(GRAPH_EVENTS.MOVE_END, { targets: [target] });
        this.onDrop(target, this.parent, ev);
      }
      this.graph.canvas.getCanvasDom().classList.remove(GRABBING_CLS);
      this.graph.draw();
    }
    this.tempHidedEdges = [];
    this.target = null;
    this.relatedTarget = null;
    this.dragging = false;
    this.lastPositions = null;
  },
  clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
};
