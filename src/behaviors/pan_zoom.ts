import { detectTrackPad } from '../utils';
import { ShapeEvent } from '../typings/event';
import { limitTranslate } from './limit_translate';
import { Node, Edge } from '../models/entities';
import { Shape } from '../renderer';
import { CANVAS_EVENTS } from '../consts/meta_events';

/**
 * Simultaneously adapt the pan and zoom behaviors for both mouse and touch pad.
 * 同时适配鼠标和触摸板的平移缩放交互
 */
export const panZoom: any = {
  type: 'panZoom',
  sensitivity: 2,
  keyShapeOnly: false,
  timer: 0,
  bboxTimer: 0,
  _bbox: null,
  zoom: true,
  keyShapeVisible: true,
  showKeyShapeDelay: 300,
  autoPreventDefault: true,
  limit: false,
  strict: false,
  xOnly: false,
  yOnly: false,
  padding: undefined,
  maxTranslateOffset: 35,
  zoomModifierKey: null,
  shouldHideEdge(edge: Edge) {
    return true;
  },
  getEvents() {
    return {
      touchstart: 'onTouchStart',
      touchmove: 'onTouchMove',
      touchend: 'onTouchEnd',
    };
  },
  init() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const dom = self.graph.canvas.getCanvasDom();
    self._event = (ev: WheelEvent) => {
      self.onWheel.call(self, ev);
    };

    dom.addEventListener('wheel', self._event);
  },

  beforePanZoom() {
    const graph = this.graph;
    const canvas = graph.getCanvas();
    const animating = graph.isAnimating();
    const { keyShapeOnly, keyShapeVisible } = this;
    if (keyShapeOnly || animating) {
      if (animating) {
        canvas.emit(CANVAS_EVENTS.PAN_ZOOM_START);
      }
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (keyShapeOnly && keyShapeVisible) {
        this.hideShapes();
      }
      this.timer = setTimeout(() => {
        keyShapeOnly && this.showShapes();
        animating && canvas.emit(CANVAS_EVENTS.PAN_ZOOM_END);
      }, this.showKeyShapeDelay);
    }
    if (this.limit) {
      if (!this._bbox) {
        this._bbox = this.graph.getGraphBBox(this.padding);
      }
      if (this.bboxTimer) {
        clearTimeout(this.bboxTimer);
      }
      this.bboxTimer = setTimeout(() => {
        this._bbox = null;
      }, 500);
    }
  },

  onWheel(ev: WheelEvent) {
    const graph = this.graph;
    if (this.shouldTrigger && !this.shouldTrigger.call(this, ev, graph)) {
      if (this.autoPreventDefault) {
        ev.preventDefault();
      }
      return;
    }
    this.beforePanZoom();
    this.graph.setCapture(false);
    const trackPadEvent = detectTrackPad(ev);
    // 禁止了缩放则滚动
    if (!this.zoom) {
      this.translate(ev);
      return;
    }
    // 鼠标滚轮缩放
    if (!trackPadEvent) {
      // 设置了 zoomModifierKey 但是没有按住时滚动
      if (this.zoomModifierKey && !ev[this.zoomModifierKey]) {
        this.translate(ev);
        return;
      }
      this.scale(ev);
      return;
    }
    // 双指捏合
    if (!trackPadEvent || ev.ctrlKey) {
      this.scale(ev);
      return;
    }
    // 两指平移
    this.translate(ev);
  },
  translate(ev: any) {
    const graph = this.graph;
    let x = ev.deltaX || ev.movementX;
    let y = ev.deltaY || ev.movementY;
    const maxTranslateOffset = this.maxTranslateOffset;
    // 鼠标滚轮滚速率过快修正
    if (x > maxTranslateOffset) {
      x = maxTranslateOffset;
    } else if (x < -maxTranslateOffset) {
      x = -maxTranslateOffset;
    }
    if (y > maxTranslateOffset) {
      y = maxTranslateOffset;
    } else if (y < -maxTranslateOffset) {
      y = -maxTranslateOffset;
    }
    if (
      Math.abs(ev.wheelDeltaX) <= Math.abs(ev.deltaX) &&
      Math.abs(ev.deltaX) !== 1.25 &&
      Math.abs(ev.wheelDeltaY) <= Math.abs(ev.deltaY) &&
      Math.abs(ev.deltaY) !== 1.25
    ) {
      // windows 两指平移
      // windows delta 普遍更大，因此 * 0.5
      x *= 0.5;
      y *= 0.5;
    }

    if (!y && navigator.userAgent.indexOf('Firefox') > -1) {
      y = (-ev.wheelDelta * 125) / 3;
    }
    if (this.limit) {
      const result = limitTranslate(graph, x, y, this.padding, this.strict, this._bbox);
      x = result.x;
      y = result.y;
    }
    const transX = this.yOnly ? 0 : -x;
    const transY = this.xOnly ? 0 : -y;
    graph.translate(transX, transY);
    this.graph.setCapture(true);
    if (!!transX || !!transY) {
      ev.preventDefault();
    }
  },

  scale(ev: any) {
    const graph = this.graph;
    const { clientX, clientY } = ev;
    const scaleCenter = graph.clientToViewport(clientX, clientY);
    const zoomRatio = graph.getZoomRatio();
    const sensitivity = this.sensitivity;
    let ratio;
    if (ev.wheelDelta > 0) {
      if (zoomRatio < 0.01) {
        ratio = 1 + 0.05 * sensitivity;
      } else if (zoomRatio < 0.5) {
        ratio = 1 + 0.03 * sensitivity;
      } else {
        ratio = 1 + 0.01 * sensitivity;
      }
    } else {
      if (zoomRatio > 5) {
        ratio = 1 - 0.05 * sensitivity;
      } else if (zoomRatio > 2) {
        ratio = 1 - 0.03 * sensitivity;
      } else {
        ratio = 1 - 0.01 * sensitivity;
      }
    }
    graph.scale(ratio, [scaleCenter.x, scaleCenter.y]);
    this.graph.setCapture(true);
    ev.preventDefault();
    return;
  },

  hideShapes() {
    this.keyShapeVisible = false;
    const shouldHideEdge = this.shouldHideEdge;
    this.graph.getNodes().forEach((node: Node) => {
      node.layer.children.forEach((shape: Shape) => {
        if (!shape.get('_keyShape')) {
          shape.hide();
        }
      });
    });
    this.graph.getEdges().forEach((edge: Edge) => {
      const hideKeyShape = shouldHideEdge(edge);
      edge.layer.children.forEach((shape: Shape) => {
        if (!shape.get('_keyShape')) {
          shape.hide();
        } else if (hideKeyShape) {
          shape.hide();
        }
      });
    });
  },

  showShapes() {
    this.keyShapeVisible = true;
    const graph = this.graph;
    graph.getNodes().forEach((node: Node) => {
      node.layer.children.forEach((shape: Shape) => {
        if (!shape.get('_keyShape')) {
          shape.show();
        }
      });
    });
    graph.getEdges().forEach((edge: Edge) => {
      edge.layer.children.forEach((shape: Shape) => {
        shape.show();
      });
    });
    graph.draw();
  },

  onTouchStart(e: ShapeEvent) {
    // e.nativeEvent.preventDefault();
    const evt = e.nativeEvent as TouchEvent;
    const touchInfo = this.getTouchInfo(evt);
    this.last = touchInfo;
    const x = touchInfo.reduce((acc: number, touch: Touch) => touch.clientX + acc, 0);
    const y = touchInfo.reduce((acc: number, touch: Touch) => touch.clientY + acc, 0);
    this.center = this.graph.canvas.clientToCanvas(x / touchInfo.length, y / touchInfo.length);
  },

  onTouchMove(e: ShapeEvent) {
    const evt = e.nativeEvent as TouchEvent;
    if (evt.touches && evt.touches.length !== 2) {
      return;
    }
    evt.preventDefault();
    this.beforePanZoom();
    const current = this.getTouchInfo(evt);
    const eventType = this.getGuesture(current, this.last);
    if (eventType) {
      if (eventType === 'drag') {
        this.touchTranslate(current);
      } else {
        this.touchZoom(current);
      }
    }
  },

  onTouchEnd() {
    this.center = null;
  },

  touchTranslate(curr: ShapeEvent) {
    const last = this.last;
    if (!last) {
      return;
    }
    const dx = curr[0].clientX - last[0].clientX;
    const dy = curr[0].clientY - last[0].clientY;
    if (Math.abs(dx) + Math.abs(dy) >= 5) {
      this.graph.translate(this.yOnly ? 0 : dx, this.xOnly ? 0 : dy);
      this.last = curr;
    }
  },

  touchZoom(curr: ShapeEvent) {
    const last = this.last;
    const graph = this.graph;
    const pixelRatio = graph.canvas.get('pixelRatio') || 1;
    const dist = this.getDistance(curr[0], curr[1]) / this.getDistance(last[0], last[1]);
    if (Math.abs(dist) > 0.05) {
      graph.scale(dist, [this.center.x / pixelRatio, this.center.y / pixelRatio]);
      this.last = curr;
    }
  },

  getGuesture(current: ShapeEvent[], last: ShapeEvent[]) {
    let touchEvent = null;
    const [currA, currB] = current;
    const [lastA, lastB] = last;
    if (!lastA || !lastB) {
      return null;
    }
    const diff = {
      clientX: currB.clientX - (lastB.clientX - lastA.clientX),
      clientY: currB.clientY - (lastB.clientY - lastA.clientY),
    };
    const a = this.getDistance(currA, lastA);
    const b = this.getDistance(currB, lastB);
    const c = this.getDistance(currA, diff);
    const cos = (a * a + b * b - c * c) / (2 * a * b);
    const rad = Math.acos(cos);
    if (rad <= Math.PI / 2 || !rad) {
      touchEvent = 'drag';
    } else {
      touchEvent = 'zoom';
    }
    return touchEvent;
  },

  getTouchInfo(e: TouchEvent) {
    return Object.values(e.touches).map((touch: Touch) => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
    }));
  },

  getDistance(pointA: ShapeEvent, pointB: ShapeEvent) {
    const x = pointB.clientX - pointA.clientX;
    const y = pointB.clientY - pointA.clientY;
    return Math.sqrt(x * x + y * y);
  },

  destroy() {
    const dom = this.graph.canvas.getCanvasDom();
    dom.removeEventListener('wheel', this._event);
  },
};
