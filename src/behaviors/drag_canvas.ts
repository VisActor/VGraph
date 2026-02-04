import { Shape } from '../renderer';
import { isDragDist } from '../utils';
import { GraphEvent } from '../typings/event';
import { limitTranslate } from './limit_translate';
import { Node, Edge } from '../models/entities';
import { CANVAS_EVENTS } from '../consts/meta_events';

/**
 * Drag the blank area of the canvas to pan the canvas.
 * 拖拽画布空白区域来平移画布
 */
export const dragCanvas: any = {
  type: 'dragCanvas',
  lastPositions: null,
  keyShapeOnly: false,
  dragging: false,
  canvasOnly: true,
  limit: false,
  strict: false,
  overflowOnly: false,
  padding: undefined,
  shouldTrigger(e: any) {
    if (e.nativeEvent && (e.nativeEvent as MouseEvent).buttons === 2) {
      return false;
    }
    return true;
  },
  xOnly: false,
  yOnly: false,
  _bbox: null,
  shouldHideEdge(edge: Edge) {
    return true;
  },
  getEvents() {
    if (this.canvasOnly) {
      return {
        'canvas:mousedown': 'onMousedown',
        'canvas:touchstart': 'onMousedown',
        mousemove: 'onMousemove',
        touchmove: 'onMousemove',
        mouseup: 'onMouseup',
        touchend: 'onMouseup',
      };
    }
    return {
      mousedown: 'onMousedown',
      touchstart: 'onMousedown',
      mousemove: 'onMousemove',
      touchmove: 'onMousemove',
      mouseup: 'onMouseup',
      touchend: 'onMouseup',
    }
  },
  getGlobalEvents() {
    return {
      mouseup: 'onMouseup',
    };
  },

  onMousedown(e: GraphEvent) {
    let { clientX, clientY } = e;
    if (e.type === 'touchstart') {
      const evt = e.nativeEvent as TouchEvent;
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    }
    this.lastPositions = {
      x: clientX,
      y: clientY,
    };
    if (this.limit) {
      this._bbox = this.graph.getGraphBBox(this.padding);
    }
  },

  onMousemove(e: GraphEvent) {
    if (!this.lastPositions) {
      return;
    }

    const graph = this.graph;
    let { clientX, clientY } = e;
    if (e.type === 'touchmove') {
      const evt = e.nativeEvent as TouchEvent;
      if (evt.touches.length !== 1) {
        this.lastPositions = null;
        return;
      }
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    }

    const lastPositions = this.lastPositions;
    if (!this.dragging) {
      if (isDragDist(lastPositions, { clientX, clientY })) {
        if (this.shouldTrigger(e, graph)) {
          graph.getCanvas().emit(CANVAS_EVENTS.PAN_ZOOM_START);
          this.dragging = true;
          graph.container.capture = false;
        } else {
          this.lastPositions = null;
          return;
        }
      } else {
        return;
      }
    }
    if (this.keyShapeOnly) {
      this.hideShapes();
    }
    let x = lastPositions.x - clientX;
    let y = lastPositions.y - clientY;
    if (this.limit) {
      const result = limitTranslate(graph, x, y, this.padding, this.strict, this._bbox);
      x = result.x;
      y = result.y;
    }
    graph.translate(this.yOnly ? 0 : -x, this.xOnly ? 0 : -y);
    this.lastPositions = {
      x: clientX,
      y: clientY,
    };
  },

  onMouseup(e: GraphEvent) {
    const graph = this.graph;
    if (this.dragging) {
      graph.getCanvas().emit(CANVAS_EVENTS.PAN_ZOOM_END);
    }
    this.lastPositions = null;
    this.dragging = false;
    graph.container.capture = true;
    if (this.keyShapeOnly) {
      this.showShapes();
      this.graph.draw();
    }
  },

  hideShapes() {
    const shouldHideEdge = this.shouldHideEdge;
    this.graph.getNodes().forEach((node: Node) => {
      node.layer.children.forEach((shape: Shape) => {
        if (!shape.get('_keyShape')) {
          shape.hide();
        }
      });
    });
    this.graph.getEdges().forEach((edge: Edge) => {
      if (shouldHideEdge(edge)) {
        edge.hide();
      }
    });
  },

  showShapes() {
    this.graph.getNodes().forEach((node: Node) => {
      node.layer.children.forEach((shape: Shape) => {
        if (!shape.get('_keyShape')) {
          shape.show();
        }
      });
    });
    this.graph.getEdges().forEach((edge: Edge) => {
      edge.show();
    });
  },
};
