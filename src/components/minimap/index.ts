import { Graph, TreeGraph } from '../../graph';
import { BBox, Canvas, Layer, Rect, Shape } from '../../renderer';
import { applyCss, isDragDist, MatrixUtils } from '../../utils';
import { ComponentBase } from '../base';
import { GRAPH_EVENTS } from '../../consts/meta_events';
import { Group, Node, Edge } from '../../models/entities';

export type MinimapOptions = {
  /**
   * The width of the minimap.
   * 小地图所占宽度
   */
  width: number;
  /**
   * The height of the minimap.
   * 小地图所占高度
   */
  height: number;
  /**
   * The DOM container of the minimap.
   * 小地图挂载的容器
   */
  container?: string | HTMLElement;
  /**
   * The extra class name of the container.
   * 给小地图容器额外增加类名
   */
  className?: string;
  /**
   * The display type of nodes in the graph.
   * 节点展示方式
   */
  type?: 'delegate' | 'keyShape';
  /**
   * Whether to display edges in the graph.
   * 是否在小地图中展示连线
   */
  showEdges?: boolean;
  /**
   * The css styles of the viewport.
   * 小地图视窗样式
   */
  viewportStyles?: { [key: string]: unknown };
  /**
   * The shape styles of nodes in the minimap.
   * 小地图中节点的绘图样式
   */
  getNodeStyles?: (node: Node) => Record<string, unknown>;
  /**
   * The shape styles of edges in the minimap.
   * 小地图中节点的绘图样式
   */
  getEdgeStyles?: (edge: Edge) => Record<string, unknown>;
  /**
   * The shape styles of groups in the minimap.
   * 小地图中节点的绘图样式
   */
  getGroupStyles?: (group: Group) => Record<string, unknown>;
  /**
   * Enable the minimap component.
   * 是否启用小地图
   */
  enable?: boolean;
  /**
   * Whether to hide the viewport when viewport is bigger than the view.
   * 是否在满屏时隐藏视窗，默认为 `true`
   */
  hideWindowWhenOverflow?: boolean;
};

export class Minimap extends ComponentBase {
  viewport: HTMLDivElement;
  container: HTMLDivElement;
  parentContainer: HTMLDivElement;
  canvas: Canvas;
  dragging = false;
  lastPositions: {x: number; y: number} | null = null;
  viewportStyles: { left: number; top: number; width: number; height: number };
  ratio = 1;
  canvasBox: BBox = { left: 0, top: 0, width: 0, height: 0 };

  groupMap: { [key: string]: Shape } = {};
  edgeMap: { [key: string]: Shape } = {};
  nodeMap: { [key: string]: Shape } = {};

  constructor(graph: Graph | TreeGraph, options: MinimapOptions) {
    super(graph, options);
    this.viewport = document.createElement('div');
    this.viewportStyles = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
    const { container, width, height } = this.options;
    let parent = container;
    if (typeof container === 'string') {
      parent = document.getElementById(container);
    }
    if (!parent) {
      parent = graph.get('container');
    }
    const outer = document.createElement('div');
    outer.style.width = `${width}px`;
    outer.style.height = `${height}px`;
    outer.style.overflow = 'hidden';
    parent.appendChild(outer);
    this.container = outer;
    this.parentContainer = parent;
    const canvas = new Canvas({
      container: outer,
      width: width - 4,
      height: height - 4,
      pixelRatio: graph.getCanvas().get('pixelRatio'),
    });
    this.canvas = canvas;
    this.init();
  }

  getEvents() {
    if (this.options.showEdges) {
      return {
        [GRAPH_EVENTS.TRANSFORMED]: 'updateViewport',
        // 当要展示连线时，layout 事件会导致连线尚未更新
        [GRAPH_EVENTS.CHANGE]: 'onChange',
        // refresh 事件后节点和连线位置能正确更新
        [GRAPH_EVENTS.REFRESHED]: 'updateCanvas',
      };
    }
    return {
      [GRAPH_EVENTS.TRANSFORMED]: 'updateViewport',
      [GRAPH_EVENTS.CHANGE]: 'updateCanvas',
    };
  }

  enable() {
    this.options.enable = true;
    this.updateCanvas();
  }

  disable() {
    this.options.enable = false;
  }

  onChange(type: string) {
    if (type !== GRAPH_EVENTS.LAYOUT_END) {
      this.updateCanvas();
    }
  }

  init() {
    const { width, height } = this.options;
    const canvas = this.canvas;
    // 点击画布定位 viewport
    // 看起来某些情况下会跟 viewport 的 mousedown 同时触发导致平移两次
    // canvas.on('click', (e) => {
    //   this.clickToCenter(e);
    // });

    applyCss(canvas.get('container'), {
      width: width - 4 + 'px',
      height: height - 4 + 'px',
      margin: '2px',
      overflow: 'visible',
    });
    this.canvas = canvas;
    const viewport = new Layer({ id: 'viewport' });
    const groupLayer = new Layer({ id: 'groupLayer' });
    const edgeLayer = new Layer({ id: 'edgeLayer' });
    const nodeLayer = new Layer({ id: 'nodeLayer' });

    viewport.add(groupLayer);
    viewport.add(edgeLayer);
    viewport.add(nodeLayer);
    canvas.add(viewport);
    this.initViewport();
    this.updateCanvas();
  }

  initViewport() {
    const { className, viewportStyles } = this.options;
    const container = this.canvas.get('container');
    const viewport = this.viewport;
    if (className) {
      viewport.classList.add(className);
    }
    applyCss(viewport, {
      position: 'absolute',
      left: '0',
      top: '0',
      boxSizing: 'border-box',
      ...viewportStyles,
    });
    container.appendChild(viewport);
    container.addEventListener('mousedown', this.onMouseDown.bind(this));
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    container.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    container.addEventListener('mouseup', this.onMouseLeave.bind(this));
  }

  updateCanvas() {
    const { width, height, enable, type, showEdges } = this.options;
    const canvas = this.canvas;
    const canvasWidth = this.graph.get('width');
    const canvasHeight = this.graph.get('height');
    const viewport = canvas.children[0];
    if (!enable || this.dragging) {
      return;
    }
    if (type === 'keyShape') {
      this.updateKeyShapes();
    } else {
      this.updateDelegateShapes();
    }
    showEdges && this.updateEdges();
    viewport.matrix = null;
    const bbox = this.graph.getGraphBBox();
    // 当图中元素很少时，不会在 minimap 中太大
    if (bbox.width < canvasWidth) {
      bbox.left -= (canvasWidth - bbox.width) / 2;
      bbox.width = canvasWidth;
    }
    if (bbox.height < canvasHeight) {
      bbox.top -= (canvasHeight - bbox.height) / 2;
      bbox.height = canvasHeight;
    }
    this.canvasBox = bbox;
    const ratio = Math.min(width / bbox.width, height / bbox.height, 1);
    this.ratio = ratio;
    viewport.translate(-bbox.left, -bbox.top);
    viewport.scale(ratio, ratio);
    const left = (width - bbox.width * ratio) / 2 - 2; // border 2px
    const top = (height - bbox.height * ratio) / 2 - 2;
    viewport.translate(left, top);
    canvas.draw();
    this.updateViewport();
  }

  updateViewport(e?: any) {
    // 对 TreeGraph 的 collapse 特殊处理
    if (e?.type === 'toggleCollapse') {
      this.updateCanvas();
      return;
    }
    const graph = this.graph;
    const ratio = this.ratio;
    const bbox = this.canvasBox;
    if (bbox.width === 0 && bbox.height === 0) {
      this.viewport.style.display = 'none';
      return;
    }
    let { width, height } = this.options;
    let left = (width - bbox.width * ratio) / 2 - 2; // border 2px
    let top = (height - bbox.height * ratio) / 2 - 2;
    const leftTop = graph.viewportToCanvas(0, 0);
    const rightBottom = graph.viewportToCanvas(graph.get('width'), graph.get('height'));

    width = (rightBottom.x - leftTop.x) * ratio;
    height = (rightBottom.y - leftTop.y) * ratio;
    left += (leftTop.x - this.canvasBox.left) * ratio;
    top += (leftTop.y - this.canvasBox.top) * ratio;

    this.setViewport(left, top, width, height);
  }

  updateEdges() {
    const edgeLayer = (this.canvas.children[0] as Layer).children[1] as Layer;
    const getEdgeStyles = this.options.getEdgeStyles;
    const edgeMap = this.graph.entityMap.edge;
    const map = this.edgeMap;
    const updatedIds: string[] = [];
    Object.keys(map).forEach((id: string) => {
      const entity = edgeMap[id];
      if (!entity) {
        map[id].destroy();
        delete map[id];
      } else {
        const keyShape = entity.getKeyShape();
        if (map[id].type !== keyShape.type) {
          map[id].destroy();
          delete map[id];
          return;
        }
        updatedIds.push(id);
        map[id].set('path', keyShape.get('path'));
        map[id].set('points', keyShape.get('points'));
        if (entity.isVisible()) {
          map[id].show();
        } else {
          map[id].hide();
        }
      }
    });
    Object.keys(edgeMap).forEach((id: string) => {
      const edge = edgeMap[id];
      if (!updatedIds.includes(id) && edge.isVisible()) {
        map[id] = edge.getKeyShape().clone();
        if (getEdgeStyles) {
          map[id].set(getEdgeStyles(edge));
        }
        edgeLayer.add(map[id]);
      }
    });
  }

  updateDelegateShapes() {
    const { getGroupStyles, getNodeStyles } = this.options;
    const groupLayer = (this.canvas.children[0] as Layer).children[0] as Layer;
    const nodeLayer = (this.canvas.children[0] as Layer).children[2] as Layer;
    const stylerMap = { node: getNodeStyles, group: getGroupStyles };
    const layerMap = { node: nodeLayer, group: groupLayer };
    this.updateLayer(getDrawingOrderEntities(this.graph), stylerMap, (id: string, entity: Node | Group) => {
      const bbox = entity.getBBox();
      const entityType = entity.type;
      const styles = stylerMap[entityType]?.(entity);
      const rect = new Rect({
        id,
        ...bbox,
        ...styles,
      });
      layerMap[entityType]?.add(rect);
      return rect;
    });
  }

  updateKeyShapes() {
    const groupLayer = (this.canvas.children[0] as Layer).children[0] as Layer;
    const nodeLayer = (this.canvas.children[0] as Layer).children[2] as Layer;
    const { getGroupStyles, getNodeStyles } = this.options;
    const stylerMap = { node: getNodeStyles, group: getGroupStyles };
    const layerMap = { node: nodeLayer, group: groupLayer };
    this.updateLayer(getDrawingOrderEntities(this.graph), stylerMap, (id: string, entity: Node | Group) => {
      const entityType = entity.type;
      const shape = entity.getKeyShape().clone();
      if (stylerMap[entityType]) {
        shape.set(stylerMap[entityType](entity));
      }
      if (entity.type === 'node') {
        const matrix = entity.layer.getMatrix();
        shape.setMatrix(matrix);
      }
      layerMap[entityType]?.add(shape);
      return shape;
    });
  }

  updateLayer(
    entities: (Group | Node)[],
    stylerMap: Record<string, (entity: Node | Group) => unknown>,
    callback: (id: string, entity: Node | Group) => Shape
  ) {
    const type = this.options.type;
    const updatedIds: string[] = [];
    const graphMap = { node: {}, group: {} };
    for (const entity of entities) {
      graphMap[entity.type][entity.get('id')] = entity;
    }
    const shapeMap = { node: this.nodeMap, group: this.groupMap };
    for (const entityType of ['node', 'group']) {
      const map = shapeMap[entityType];
      Object.keys(map).forEach((id: string) => {
        const entity = graphMap[entityType][id];
        if (!entity) {
          map[id].destroy();
          delete map[id];
        } else {
          if (entity.isVisible()) {
            map[id].show();
            if (type === 'delegate') {
              const bbox = entity.getBBox();
              map[id].matrix = null;
              map[id].set(bbox);
            } else {
              map[id].matrix = entity.layer.getMatrix();
              map[id].set(entity.getKeyShape().configs);
            }
            map[id].set(stylerMap[entityType]?.(entity));
            updatedIds.push(id);
          } else {
            map[id].hide();
          }
        }
      });
    }

    for (const entity of entities) {
      const id = entity.get('id');
      if (!updatedIds.includes(id) && entity.isVisible()) {
        shapeMap[entity.type][id] = callback(id, entity);
      }
    }
  }

  setViewport(left: number, top: number, width: number, height: number) {
    const viewport = this.viewport;
    const viewportStyles = {
      left,
      top,
      width,
      height,
    };
    let show = true;
    if (this.options.hideWindowWhenOverflow !== false && left <= 0 && top <= 0 && width > this.canvas.get('width') && height > this.canvas.get('height')) {
      show = false;
    }
    applyCss(viewport, {
      left: left + 'px',
      top: top + 'px',
      width: width + 'px',
      height: height + 'px',
      display: show ? 'block' : 'none',
    });
    this.viewportStyles = viewportStyles;
  }

  clickToCenter({ clientX, clientY }: { clientX: number, clientY: number}){
    const graph = this.graph;
    const bbox = this.viewport.getBoundingClientRect();
    const dx = bbox.x + bbox.width / 2 - clientX;
    const dy = bbox.y + bbox.height / 2 - clientY;
    const zoomRatio = graph.getZoomRatio();
    const ratio = this.ratio;
    graph.translate((dx / ratio) * zoomRatio, (dy / ratio) * zoomRatio);
  }

  onMouseDown(e: MouseEvent) {
    if (e.target !== this.viewport) {
      return;
    }
    this.options.enable = false;
    this.lastPositions = {x: e.clientX, y: e.clientY}
  }
  onMouseMove(e: MouseEvent) {
    if (!this.lastPositions) {
      return;
    }
    const refresh = isDragDist(this.lastPositions!, e);
    if (!refresh){
      return;
    }
    const viewportStyles = this.viewportStyles;
    let { left, top } = viewportStyles;
    const { width, height } = viewportStyles;
    let dx = this.lastPositions.x - e.clientX;
    let dy = this.lastPositions.y - e.clientY;

    const containerWidth = this.options.width;
    const containerHeight = this.options.height;
    if (width < containerWidth) {
      if (left - dx + 2 < 0) {
        // border 2px
        dx = left + 2;
      } else if (left - dx + width > containerWidth - 2) {
        dx = left + width - containerWidth + 2;
      }
    }

    if (height < containerHeight) {
      if (top - dy + 2 < 0) {
        dy = top + 2;
      } else if (top - dy + height > containerHeight - 2) {
        dy = top + height - containerHeight + 2;
      }
    }

    left -= dx;
    top -= dy;
    applyCss(this.viewport, {
      left: left + 'px',
      top: top + 'px',
    });
    viewportStyles.left = left;
    viewportStyles.top = top;
    this.lastPositions = {x: e.clientX, y: e.clientY};
    const ratio = this.ratio;
    const zoomRatio = this.graph.getZoomRatio();
    this.dragging = true;
    this.graph.translate((dx / ratio) * zoomRatio, (dy / ratio) * zoomRatio);
  }
  onMouseLeave(e: MouseEvent) {
    this.options.enable = true;
    if (!this.dragging && e.type === 'mouseup'){ // 点击 viewport 区域，非拖拽。以鼠标为中心定位 viewport。
      this.clickToCenter(e);
    }
    this.lastPositions = null;
    this.dragging = false;
  }

  getDefaultOptions() {
    return {
      enable: true,
      disableOne: false,
      showEdges: false,
      hideWindowWhenOverflow: true,
      viewportStyles: {
        border: '2px solid #5F95FF',
        background: 'rgba(48, 115, 242, 0.05)',
      },
      getNodeStyles: (node: any) => ({fillStyle: node.get('fillStyle') || node.get('color') || '#fff'}),
      getGroupStyles: () => {
        return { fillStyle: '#E4F7D2' };
      },
    };
  }

  beforeDestroy(): void {
    this.disable();
    this.canvas.destroy();
    this.parentContainer.removeChild(this.container);
  }
}

function getDrawingOrderEntities(graph: Graph | TreeGraph) {
  const groupContainer = graph.getGroupContainer();
  const nodeContainer = graph.getNodeContainer();
  const entities = [] as (Group | Node)[];
  function dfs(layer: Layer | Shape) {
    if (layer?.type === 'group') {
      entities.push(graph.getGroupById(layer.get('id')));
      for (const child of layer.children) {
        dfs(child);
      }
    } else if (layer?.type === 'node') {
      entities.push(graph.getNodeById(layer.get('id')));
    }
  }
  for (const layer of groupContainer.children) {
    dfs(layer);
  }

  for (const layer of nodeContainer.children) {
    dfs(layer);
  }
  return entities;
}
