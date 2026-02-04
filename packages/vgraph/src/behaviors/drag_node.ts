import { Circle, Rect } from "../renderer";
import { isDragDist, insertStyles } from "../utils";
import { GRAPH_EVENTS } from "../consts/meta_events";
import { GraphEvent } from "../typings/event";
import { autoTranslate } from "./auto_translate";

const GRABBING_CLS = "vgraph-grabbing";

/**
 * Drag-and-drop node behavior.
 * 拖拽节点交互
 */
export const dragNode: any = {
  type: "dragNode",
  dragging: false,
  originPositions: null,
  lastPositions: null,
  target: null,
  triggerShape: null,
  delegate: true,
  // FIXME: 早期版本命名没有统一，就两种都支持。大版本更新的时候要将不带 s 的配置项废弃。
  delegateStyle: null,
  delegateStyles: null,
  interval: null,
  autoTranslate: true,
  init() {
    insertStyles(`
    .${GRABBING_CLS} {
      cursor: move!important;
      cursor: -webkit-grabbing!important;
      cursor:grabbing!important;
    }
    `);
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
    if (!this.dragging) {
      if (refresh) {
        ev.target = this.target;
        if (this.shouldTrigger(ev, this.triggerShape)) {
          graph.emitEvent(GRAPH_EVENTS.MOVE_START, { targets: [ev.target] });
          this.dragging = true;
          this.onDragStart(this.target, ev);
          this.graph.canvas.getCanvasDom().classList.add(GRABBING_CLS);
          if (this.delegate) {
            this.shape = this.initDelegateShape();
          } else {
            this.target.setCapture(false);
          }
        } else {
          this.lastPositions = null;
          return;
        }
      } else {
        return;
      }
    }
    if (refresh) {
      this.updatePosition(ev);
      graph.emit(GRAPH_EVENTS.MOVING, { targets: [this.target] });
    }
    if (this.autoTranslate) {
      this.clearInterval();
      const shapeBox = this.shape
        ? this.shape.getBBox()
        : this.target.getBBox();
      this.interval = autoTranslate(graph, shapeBox, (x: number, y: number) => {
        graph.emit(GRAPH_EVENTS.MOVING, { targets: [this.target] });
        this.updateNode(-x, -y);
      });
    }
  },
  updatePosition(ev: GraphEvent) {
    const { x, y } = this.lastPositions;
    const scale = this.graph.getZoomRatio();
    const offsetX = (ev.clientX - x) / scale;
    const offsetY = (ev.clientY - y) / scale;
    this.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    this.updateNode(offsetX, offsetY);
    this.graph.draw();
  },
  updateNode(offsetX: number, offsetY: number) {
    if (this.delegate) {
      this.shape.translate(offsetX, offsetY);
      const matrix = this.shape.getMatrix();
      this.onDrag(this.target, matrix[4], matrix[5]);
    } else {
      const target = this.target;
      target.translate(offsetX, offsetY);
      this.onDrag(target, target.configs.x, target.configs.y);
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
    if (this.delegateStyle) {
      shape.set(this.delegateStyle);
    }
    if (this.delegateStyles) {
      shape.set(this.delegateStyles);
    }
    return shape;
  },
  onMouseUp(ev: GraphEvent) {
    const target = this.target;
    const graph = this.graph;
    this.clearInterval();
    if (this.dragging) {
      // delegate
      if (this.shape) {
        if (this.shouldDrop(ev)) {
          const matrix = this.shape.getMatrix();
          target.translate(matrix[4], matrix[5]);
          this.onDrop(target);
        }
        graph.getNodeContainer().remove(this.shape);
        this.shape = null;
      } else {
        // keyshape
        target.setCapture(true);
        if (!this.shouldDrop(ev)) {
          target.updatePosition(this.originPositions.x, this.originPositions.y);
        } else {
          this.onDrop(target);
        }
      }
      graph.emitEvent(GRAPH_EVENTS.MOVE_END, { targets: [target] });
      graph.canvas.getCanvasDom().classList.remove(GRABBING_CLS);
      graph.draw();
    }
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
