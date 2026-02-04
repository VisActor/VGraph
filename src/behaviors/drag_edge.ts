import { Layer } from '../renderer';
import { isDragDist } from '../utils';
import { getMagnetAnchor } from '../utils/behavior';
import { Node } from '../models/entities/node';
import { autoTranslate } from './auto_translate';
import { AnchorConfigs } from '../typings/model';
import { GraphEvent } from '../typings/event';
import { GRAPH_EVENTS } from '../consts/meta_events';

/**
 * Drag to add new edge.
 * 拖拽节点交互
 */
export const dragEdge: any = {
  type: 'dragEdge',
  dragging: false,
  originPositions: null,
  lastPositions: null,
  target: null,
  triggerShape: null,
  lastTarget: null,
  lastShape: null,
  interval: null,
  autoTranslate: true,
  // 是否开启吸附操作
  magnet: false,
  magnetDist: 28,
  // 是否能吸附当前锚点
  shouldMagnet(target: Node, anchor: AnchorConfigs) {
    return true;
  },
  // 被吸附锚点的样式
  magnetAnchorStyles: {},
  magnetAnchor: null,
  showAnchors: (anchor: Layer, node: Node) => true,
  shouldTrigger() {
    return true;
  },
  shouldDrop() {
    return true;
  },
  tempEdgeStyles: {
    strokeStyle: '#3073F2',
    lineDash: [4, 4],
  },
  onDragStart() { return; },
  onDragEnter() { return; },
  onDragLeave() { return; },
  onDrag() { return; },
  onDrop() { return; },
  getEvents() {
    return {
      'node:mousedown': 'onMouseDown',
      'node:mouseenter': 'onMouseEnter',
      'node:mouseleave': 'onMouseLeave',
      'mousemove': 'onMouseMove',
    };
  },
  getGlobalEvents() {
    return { mouseup: 'onMouseUp' };
  },
  onMouseDown(ev: GraphEvent) {
    if ((ev.nativeEvent as MouseEvent).button === 2) {
      return;
    }
    const target = ev.target;
    this.target = ev.target;
    this.triggerShape = ev.relatedTarget;
    this.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    this.originPositions = {
      x: target.get('x'),
      y: target.get('y'),
    }
    target.set('disableNodeEvent', true);
  },
  onMouseEnter(ev: GraphEvent) {
    if (this.dragging) {
      this.onDragEnter(ev.target, ev);
      this.lastTarget = ev.target;
    }
  },
  onMouseLeave(ev: GraphEvent) {
    if (this.dragging) {
      this.onDragLeave(ev.target, ev);
      this.lastTarget = null;
    }
    else {
      this.graph.canvas.getCanvasDom().style.cursor = 'default';
    }
  },
  onMouseMove(ev: GraphEvent) {
    if (!this.lastPositions) {
      return;
    }
    this.lastShape = ev.relatedTarget;
    const refresh = isDragDist(this.lastPositions, ev);
    const graph = this.graph;
    if (!this.dragging) {
      if (refresh) {
        if (this.shouldTrigger(ev, this.triggerShape, this.target)) {
          const autoDraw = graph.disableAutoDraw();
          this.dragging = true;
          const target = this.target;
          const point = this.graph.clientToCanvas(ev.clientX, ev.clientY);
          graph.getNodes().forEach((node: Node) => {
            node.set('disableAnchors', true);
            node.showAnchors(this.showAnchors);
          });
          if (this.triggerShape.show) {
            this.triggerShape.show();
          }
          graph.emit(GRAPH_EVENTS.CHANGE_ANCHOR);
          this.onDragStart(target, ev);
          this.edge = this.graph.add('edge', {
            ... this.tempEdgeStyles,
            source: this.target.get('id'),
            sourceAnchor: this.triggerShape.get('anchorIndex'),
            endPoint: [point.x, point.y],
          });
          this.edge.setCapture(false);
          graph.enableAutoDraw(autoDraw);
        } else {
          this.target.set('disableNodeEvent', false);
          this.target.hideAnchors();
          return;
        }
      } else {
        return;
      }
    }
    if (refresh) {
      this.update(ev);
    }
    if (this.autoTranslate) {
      const edge = this.edge;
      if (!edge) {
        return;
      }
      this.clearInterval();
      const point = graph.clientToCanvas(ev.clientX, ev.clientY);
      this.interval = autoTranslate(graph, { left: point.x, top: point.y, width: 1, height: 1 }, (x: number, y: number) => {
        const endPoint = edge.get('endPoint');
        this.recoverAnchorStyles();
        edge.set('endPoint', [endPoint[0] - x, endPoint[1] - y]);
        edge.updatePosition();
        graph.draw();
      });
    }
  },

  refreshMagnet(point: { x: number, y: number }) {
    const result = getMagnetAnchor(point, this.target, this.graph, this.magnetDist);
    if (!result || !this.shouldMagnet(result.node!, (result.node! as Node).get('anchors')[result.anchorIndex])) {
      this.recoverAnchorStyles();
      this.lastTarget = null;
      return true;
    }
    const node = result.node! as Node;
    const configs = node?.get('anchors')[result?.anchorIndex];
    if (this.magnetAnchor) {
      if (configs === this.magnetAnchor.anchor) {
        return false;
      }
      this.recoverAnchorStyles();
    }
    const shape = node.layer.get('__anchors')?.[result?.anchorIndex];
    this.lastTarget = node;
    this.magnetAnchor = { shape, anchorConfigs: configs };
    const positions = node.getAnchorPositions();
    this.cacheAnchorStyles();
    this.edge.set('endPoint', positions[result.anchorIndex]);
    // this.edge.set('targetAnchor', result.anchorIndex);
    return false;
  },

  cacheAnchorStyles() {
    const { shape, anchorConfigs } = this.magnetAnchor;
    anchorConfigs.magnet = true;
    if (!shape) {
      return;
    }
    const cache = {};
    Object.keys(this.magnetAnchorStyles).forEach((k: string) => {
      cache[k] = shape.get(k);
    });
    shape.set('__cacheMagnetStyles', cache);
    shape.set({ ...this.magnetAnchorStyles });
  },

  recoverAnchorStyles() {
    const configs = this.magnetAnchor;
    if (!configs) {
      return;
    }
    const { shape, anchorConfigs } = configs;
    anchorConfigs.magnet = false;
    if (!shape) {
      return;
    }
    shape.set(shape.get('__cacheMagnetStyles'));
    delete shape.configs.__cacheMagnetStyles;
    this.magnetAnchor = null;
    this.lastTarget = null;
  },

  update(ev: GraphEvent) {
    const graph = this.graph;
    const edge = this.edge;
    const autoDraw = graph.disableAutoDraw();
    this.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    const point = graph.clientToCanvas(ev.clientX, ev.clientY);
    let refresh = true;
    if (this.magnet) {
      refresh = this.refreshMagnet(point);
    }
    if (refresh) {
      if (this.lastTarget) {
        edge.set('endPoint', this.lastTarget.getLinkPoint([point.x, point.y]));
      } else {
        edge.set('endPoint', [point.x, point.y]);
      }
    }
    if (this.magnet) {
      graph.emit(GRAPH_EVENTS.CHANGE_ANCHOR);
    }
    edge.updatePosition();
    graph.enableAutoDraw(autoDraw);
  },

  onMouseUp(ev: GraphEvent) {
    const { graph, edge, target, lastTarget, lastShape } = this;
    this.clearInterval();
    const autoDraw = graph.disableAutoDraw();
    const targetAnchor = this.magnetAnchor ? this.magnetAnchor.anchorConfigs.index : lastShape?.get('anchorIndex');
    if (this.dragging && target) {
      if (!this.shouldDrop(target, lastTarget, edge.get('sourceAnchor'), targetAnchor) || !lastTarget) {
        graph.remove(edge);
      } else {
        this.onDrop(target, lastTarget);
        const configs = edge.configs;
        Object.keys(this.tempEdgeStyles).forEach((key: string) => {
          delete configs[key];
        });
        delete configs.endPoint;
        graph.remove(edge);
        graph.add('edge', {
          ...configs,
          target: lastTarget.get('id'),
          targetAnchor,
        });
      }
      graph.canvas.getCanvasDom().style.cursor = 'default';
    }
    target?.set('disableNodeEvent', false);
    graph.getNodes().forEach((node: Node) => {
      node.set('disableAnchors', false);
      node.hideAnchors();
    });
    this.recoverAnchorStyles();
    graph.emit(GRAPH_EVENTS.CHANGE_ANCHOR);
    graph.enableAutoDraw(autoDraw);
    this.target = null;
    this.targetAnchor = null;
    this.dragging = false;
    this.lastPositions = null;
  },
  clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
};
