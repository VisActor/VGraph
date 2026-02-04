import { IntersectUtil, Path } from '../renderer';
import { isDragDist } from '../utils';
import { Node, Edge, Group } from '../models/entities';
import { autoTranslate } from './auto_translate';
import { ShapeEvent } from '../typings/event';

/**
 * Select entities in the graph by box selection.
 * 框选图中元素交互
 */
export const brushSelect: any = {
  type: 'brushSelect',
  canvasOnly: true,
  autoTranslate: true,
  targets: ['node'],
  bkgStyles: {
    fillStyle: '#3073F2',
    opacity: 0.2,
  },
  dragging: false,
  startPoint: null,
  lastPoint: null,
  rect: null,
  interval: null,
  selected: null,
  formerBox: null,
  mode: 'default' as 'default' | 'accurate',
  shouldTrigger(e: ShapeEvent) {
    if (e.nativeEvent && (e.nativeEvent as MouseEvent).buttons === 2) {
      return false;
    }
    return true;
  },
  onSelect() {
    return true;
  },
  onDeselect() {
    return true;
  },
  onChange() { },
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
    };
  },
  getGlobalEvents() {
    return {
      mouseup: 'onMouseup',
      keydown: 'changeMode',
      keyup: 'changeMode',
    };
  },
  changeMode(ev: KeyboardEvent){
    if (ev.type === 'keyup' && ev.key === 'Meta'){
      this.mode = 'default'; // 任意时刻清空
      this.lastPoint && this.update(this.lastPoint, true);
    }
    if (this.lastPoint && ev.type === 'keydown' && ev.key === 'Meta'){
      this.mode = 'accurate'; // 仅在框选期间触发
      this.update(this.lastPoint, true);
    }
  },
  onMousedown(e: ShapeEvent) {
    // 有右键框选场景，在 shouldTrigger 中判断
    // if (e.nativeEvent && (e.nativeEvent as MouseEvent).button === 2) {
    //   return;
    // }
    if (e.nativeEvent?.metaKey){
      this.mode = 'accurate';
    } else {
      this.mode = 'default';
    }
    const point = this.getClientPoint(e);
    this.startPoint = this.graph.clientToCanvas(point.x, point.y);
    this.lastPoint = point;
  },
  onMousemove(e: ShapeEvent) {
    if (!this.lastPoint) {
      return;
    }
    const graph = this.graph;
    const point = this.getClientPoint(e);
    if (isDragDist(this.lastPoint, { clientX: point.x, clientY: point.y })) {
      this.lastPoint = point;
      if (!this.dragging) {
        if (this.shouldTrigger(e, this.graph)) {
          this.dragging = true;
          this.initRect();
        } else {
          return;
        }
      }
      this.update(point);
    }
    if (this.autoTranslate && this.dragging) {
      this.clearInterval();
      const canvasPoint = this.graph.clientToCanvas(point.x, point.y);
      this.interval = autoTranslate(
        graph,
        {
          left: canvasPoint.x,
          top: canvasPoint.y,
          width: 1,
          height: 1,
        },
        () => {
          this.update(this.lastPoint);
        }
      );
    }
  },
  onMouseup() {
    this.clearInterval();
    if (this.dragging) {
      this.onChange(this.selected);
      this.rect.parentNode.remove();
      this.graph.draw();
    }
    this.dragging = false;
    this.lastPoint = null;
    this.startPoint = null;
  },
  initRect() {
    const { graph, startPoint } = this;
    const container = graph.get('container');
    const rect = document.createElement('div');
    const rectOuterDiv = document.createElement('div');
    container.appendChild(rectOuterDiv);
    rectOuterDiv.appendChild(rect);
    rectOuterDiv.style.position = 'absolute';
    rectOuterDiv.style.left = '0px';
    rectOuterDiv.style.top = '0px';
    rectOuterDiv.style.width = graph.get('width');
    rectOuterDiv.style.height = graph.get('height');
    const matrix = graph.getMatrix();
    rectOuterDiv.style.transform = `matrix(${matrix.join(',')})`;
    rect.onmousemove = (e: MouseEvent) => {
      graph.emit('mousemove', e);
    }
    rect.style.position = 'absolute';
    rect.style.left = `${startPoint.x}px`;
    rect.style.top = `${startPoint.y}px`;
    rect.style.width = '0px';
    rect.style.height = '0px';
    rect.style.zIndex = '999';
    rect.style.background = this.bkgStyles.fillStyle; // 兼容之前的配置的 style
    rect.style.border = '1px solid #3073F2';
    for (const key in this.bkgStyles) {
      if (key !== 'fillStyle') {
        rect.style[key] = this.bkgStyles[key];
      }
    }
    this.rect = rect;
    this.rect.getBBox = () => {
      return {
        left: parseFloat(this.rect.style.left),
        top: parseFloat(this.rect.style.top),
        width: parseFloat(this.rect.style.width),
        height: parseFloat(this.rect.style.height),
      }
    }
  },
  update(clientPoint: { x: number; y: number }, forced = false) {
    const { startPoint, graph, rect } = this;
    const autoDraw = graph.disableAutoDraw();
    const point = graph.clientToCanvas(clientPoint.x, clientPoint.y);
    const matrix = graph.getMatrix();
    rect.style.left = `${Math.min(startPoint.x, point.x)}px`;
    rect.style.top = `${Math.min(startPoint.y, point.y)}px`;
    rect.style.width = `${Math.abs(startPoint.x - point.x)}px`;
    rect.style.height = `${Math.abs(startPoint.y - point.y)}px`;
    rect.parentNode.style.transform = `matrix(${matrix.join(',')})`;
    this.updateSelected(forced);
    graph.enableAutoDraw(autoDraw);
  },
  updateSelected( forced = false) {
    if (this.selected?.length) {
      this.selected.forEach((entity: Node | Edge | Group) => {
        if (entity.type === 'edge') {
          this.isSelectedEdge(entity, true);
        } else {
          this.isSelected(entity, true);
        }
      });
    }
    const rectBox = this.rect.getBBox();
    const formerBox = this.formerBox;
    this.formerBox = rectBox;
    if (
      !forced &&
      formerBox?.left === rectBox.left &&
      formerBox?.top === rectBox.top &&
      formerBox?.width >= rectBox.width &&
      formerBox?.height >= rectBox.height
    ) {
      return;
    }
    this.selected = [];
    const { targets, graph } = this;
    if (targets.includes('group')) {
      graph.getGroups().forEach((group: Group) => {
        this.isSelected(group);
      });
    }
    if (targets.includes('node')) {
      graph.getNodes().forEach((node: Node) => {
        this.isSelected(node);
      });
    }
    if (targets.includes('edge')) {
      graph.getEdges().forEach((edge: Edge) => {
        this.isSelectedEdge(edge);
      });
    }
  },
  isSelectedEdge(edge: Edge, unselect = false) {
    const rectBox = this.rect.getBBox();
    const intersect = IntersectUtil.isPathIntersect(edge.getKeyShape() as Path, rectBox);
    if (!intersect) {
      unselect && this.onDeselect(edge);
    } else if (!unselect && this.onSelect(edge)) {
      this.selected.push(edge);
    }
  },
  isSelected(entity: Node | Edge | Group, unselect = false) {
    const bbox = entity.getBBox();
    const rectBox = this.rect.getBBox();
    const intersect = IntersectUtil.isRectIntersect(bbox, rectBox);
    let isSelect = intersect;
    if (entity.type === 'node') {
      isSelect = intersect && (this.mode === 'accurate' || !entity.belong);
    } else if (entity.type === 'group') {
      isSelect = intersect && (this.mode !== 'accurate' && !entity.belong);
    }
    if (!isSelect) {
      unselect && this.onDeselect(entity);
    } else if (!unselect && this.onSelect(entity)) {
      this.selected.push(entity);
    }
  },
  getClientPoint(e: ShapeEvent) {
    let { clientX, clientY } = e;
    if (e.type === 'touchstart') {
      const evt = e.nativeEvent as TouchEvent;
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    }
    return { x: clientX, y: clientY };
  },
  clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
};
