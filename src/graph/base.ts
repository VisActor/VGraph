import { EventEmitter } from 'eventemitter3';
import { BBox, Canvas, Layer, Point } from '../renderer';
import { normalizePadding } from '../utils';
import { GraphConfigs, AnimateConfigs, BehaviorConfigs, DownloadImageOptions } from '../typings/graph';
import { Node, Edge, Group, Entity } from '../models/entities';
import { BehaviorManager } from '../behaviors/manager';
import { EVENTS, GRAPH_EVENTS, CHANGE_EVENTS } from '../consts/meta_events';
import { animate } from '../animations/animate';
import { ComponentBase } from '../components/base';
import { getNonRepetitiveId, isRepeatedId } from '../utils/graph/entity_id';
import { GraphData } from '../typings/data';

export interface IGraph {
  data: (data: GraphData) => void;
  refresh: () => void;

  scale: (scale: number, center?: number[]) => void;
  translate: (x: number, y: number, draw: boolean) => void;
  changeSize: (width: number, height: number, draw: boolean) => void;

  focus: (
    entity: Node | Edge | Group,
    animate:
      | boolean
      | {
          duration?: number;
          onFinish?: () => void;
          easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
        }
  ) => void;
  focusPoint: (
    x: number,
    y: number,
    animate:
      | boolean
      | {
          duration?: number;
          onFinish?: () => void;
          easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
        }
  ) => void;
  fitView: () => void;
  getViewport: () => BBox;
  alignView: (align?: 'lt' | 'ct' | 'rt' | 'lc' | 'cc' | 'rc' | 'lb' | 'cb' | 'rb') => void;

  addBehavior: (behavior: BehaviorConfigs) => void;
  getBehavior: (type: string) => BehaviorConfigs | undefined;
  removeBehavior: (behavior: BehaviorConfigs | string) => void;

  getNodeById: (id: string) => Node | null;
  getEdgeById: (id: string) => Edge | null;
  getGroupById: (id: string) => Group | null;

  setState: (entity: Entity, state: string, onlyState?: boolean) => void;
  removeState: (entity: Entity, state: string) => void;

  set: ((name: string, value: unknown) => void) & ((data: Record<string, unknown>) => void);
  get: (name: string) => void;

  clear: () => void;
  destroy: () => void;
}

export class GraphBase extends EventEmitter implements IGraph {
  entityMap: {
    node: Record<string, Node>;
    edge: Record<string, Edge>;
    group: Record<string, Group>;
  } = { node: {}, edge: {}, group: {} };
  protected configs: GraphConfigs;
  protected behaviorManager: BehaviorManager;
  protected components: ComponentBase[] = [];
  protected canvas: Canvas;
  protected container: Layer;
  protected nodeContainer: Layer;
  protected edgeContainer: Layer;
  protected groupContainer: Layer;

  constructor(configs: GraphConfigs) {
    super();
    this.configs = this.mergeConfigs(configs);
    if (configs.animate !== false) {
      this.setAnimateConfigs(this.configs);
    }
    if (configs.layout) {
      this.configs.autoLayout = true;
    }
    const canvas = this.initCanvas(configs);
    const container = new Layer({
      id: 'container',
    });
    canvas.add(container);
    canvas.setViewportContainer(container);

    const groupLayer = new Layer({
      id: 'groupContainer',
    });
    const edgeLayer = new Layer({
      id: 'edgeContainer',
    });
    const nodeLayer = new Layer({
      id: 'nodeContainer',
    });

    container.add(groupLayer);
    container.add(edgeLayer);
    container.add(nodeLayer);

    this.container = container;
    this.groupContainer = groupLayer;
    this.edgeContainer = edgeLayer;
    this.nodeContainer = nodeLayer;
    this.canvas = canvas;
    if (this.configs.layout) {
      this.initLayout();
    }
    this.behaviorManager = new BehaviorManager(this);
    this.bindEvents();
  }

  // @override
  data(data: GraphData) {}

  /**
   * Updates the shapes and position of entities. Usually used after entity default configs changed.
   * 刷新视图。用于 graph 节点连线等外观配置变更，而数据不变的场景，图元的样式和位置会发生变化。
   */
  updateEntities() {
    const nodes = this.entityMap.node;
    const edges = this.entityMap.edge;
    const groups = this.entityMap.group;

    Object.values(nodes).forEach((node: Node) => {
      node.updateData(undefined, false);
    });

    Object.values(edges).forEach((edge: Edge) => {
      edge.updateData({});
    });

    Object.values(groups).forEach((group: Group) => {
      group.updateData({});
    });
    this.autoDraw();
  }

  /**
   * Incrementally update an entity in the graph.
   * 差量更新单个图中元素
   * @param {Entity} entity - An entity in the graph.
   * @param {any} configs - An object that contains the configuration data to update the `entity`.
   */
  update(entity: Entity, configs: any) {
    if (!entity) {
      return;
    }
    this.emitEvent(GRAPH_EVENTS.UPDATE_START, { target: entity, configs });
    entity.updateData(configs);
    this.autoDraw();
    this.emitEvent(GRAPH_EVENTS.UPDATE_END, { target: entity });
  }

  /**
   * Updates entity positions via data. Usually used after layout or animates.
   * 刷新视图。用于 graph 节点连线等外观配置变更，而数据不变的场景，节点样式不会发生变化。
   */
  refresh() {
    const nodes = this.entityMap.node;
    const edges = this.entityMap.edge;
    const groups = this.entityMap.group;
    Object.values(nodes).forEach((node: Node) => {
      node.updatePosition(undefined, undefined, true);
    });

    Object.values(groups).forEach((group: Group) => {
      group.refreshBox();
    });

    Object.values(edges).forEach((edge: Edge) => {
      edge.updatePosition();
    });
    this.emitEvent(GRAPH_EVENTS.REFRESHED);
    this.autoDraw();
  }

  /**
   * Decide if the graph should re-render automatically.
   * 根据 `autoDraw` 标识符决定是否重绘
   */
  autoDraw() {
    if (this.get('autoDraw')) {
      this.canvas.draw();
    }
  }

  /**
   * Disables the auto-draw feature and returns the previous state of `autoDraw`
   * 禁用自动重绘功能，通常用于批量操作提升性能。
   * @returns The `autoDraw` value before it was disabled.
   */
  disableAutoDraw() {
    const autoDraw = this.get('autoDraw');
    this.set('autoDraw', false);
    return autoDraw;
  }

  /**
   * Disables the auto layout feature of the graph.
   * 禁用图的自动布局功能，并返回之前的自动布局标识。
   * @returns The previous auto layout state before disabling.
   */

  disableAutoLayout() {
    const autoLayout = this.get('autoLayout');
    this.set('autoLayout', false);
    return autoLayout;
  }

  /**
   * Sets a boolean value for `autoDraw` and renders the canvas afterwards.
   * 配置自动重绘标识，并立即重绘一次。
   * @param [autoDraw=true] - The `autoDraw` parameter is a boolean value that determines whether
   * automatic drawing is enabled.
   */
  enableAutoDraw(autoDraw = true) {
    this.set('autoDraw', autoDraw);
    this.canvas.draw();
  }

  /**
   * Repaint the graph directly.
   * 重绘视图。
   */
  draw() {
    this.canvas.draw();
  }

  /**
   * Retrieves an entity ID based on provided configurations and type, ensuring it is unique.
   * 获取数据中的唯一 id，如果未配置则自动生成一个并返回
   * @param {any} configs - The `configs` parameter is of type `any` and is an object containing
   * configuration of node or edge or group.
   * @param {string} type - The `type` parameter is a string that represents the type of configs.
   * @returns a unique ID.
   */
  getEntityId(configs: any, type: string) {
    let id = configs?.id;
    if (typeof id === 'string' || typeof id === 'number') {
      if (isRepeatedId(id as string, type, this.entityMap)) {
        this.throw(`${type} id ${id} is already exist`);
      }
    } else {
      id = getNonRepetitiveId(type, this.entityMap);
    }
    return id;
  }

  /**
   * Add or replace the state of an entity.
   * 添加或替换节点/连线/分组的状态
   * @param {Entity} entity - The `entity` parameter represents a node or  edge or group.
   * @param {string} state - The `state` parameter in the `setState` function represents the new state
   * that you want to set for the entity.
   * @param [onlyState=false] - The `onlyState` parameter in the `setState` function is a boolean flag
   * that determines whether to replace the state  of the entity.
   */
  setState(entity: Entity, state: string, onlyState = false) {
    entity.setState(state, onlyState);
  }

  /**
   * Removes a specified state from an entity.
   * 删除节点/连线/分组的某个指定状态
   * @param {Entity} entity - Entity is an object representing an entity in a system or game. It likely
   * has properties and methods related to the entity's state and behavior.
   * @param {string} state - The `state` parameter in the `removeState` function refers to the specific
   * state that you want to remove from the `entity`.
   */
  removeState(entity: Entity, state: string) {
    entity.removeState(state);
  }

  private bindEvents() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    EVENTS.forEach((eventName: string) => {
      self.canvas.on(eventName, (e: any) => {
        const relatedTarget = e.target;
        e.target = this;
        e.relatedTarget = relatedTarget;
        self.emit(eventName, e);
        if (relatedTarget.type === 'canvas') {
          self.emit(`canvas:${eventName}`, e);
        }
      });
    });
    [GRAPH_EVENTS.DRAW_START, GRAPH_EVENTS.DRAW_END, GRAPH_EVENTS.ANIMATION_START, GRAPH_EVENTS.ANIMATION_END].forEach(
      (eventName: string) => {
        this.canvas.on(eventName, () => {
          this.emit(eventName);
        });
      }
    );
  }

  private initCanvas(configs: GraphConfigs) {
    let container: HTMLElement | string = configs.container;
    if (typeof container === 'string') {
      const div = document.getElementById(container);
      if (!div) {
        throw new Error(`Cannot find dom element id: ${configs.container}`);
      }
      container = div;
    }
    const canvas = new Canvas({
      container,
      width: configs.width,
      height: configs.height,
    });
    this.set('container', canvas.get('container'));
    return canvas;
  }

  private mergeConfigs(configs: GraphConfigs) {
    return Object.assign({}, this.getDefaultConfigs(configs), configs);
  }

  protected getDefaultConfigs(configs: GraphConfigs) {
    return {
      autoDraw: configs.renderMode !== 'dom',
      renderMode: 'canvas',
      animate: true,
      linkCenter: false,
      minRatio: 0.2,
      maxRatio: 10,
      padding: 50,
      throwError: true,
      emitGraphEvents: true,
    };
  }

  get(key: string) {
    return this.configs[key];
  }

  set(...args: any[]) {
    const [key, value] = args;
    if (typeof key === 'object') {
      for (const k of Object.keys(key)) {
        this.configs[k] = key[k];
      }
    } else {
      this.configs[key] = value;
    }
  }

  /**
   * Adjusts the graph viewport scale ratio, it's a relative ratio.
   * 缩放视图，这是一个相对缩放功能
   * @param {number} scale - Scale is an number representing the scale ratio you'd like to set.
   * @param {number} center - The `center` parameter sets the scale center coordinates.
   */
  scale(scale: number, center?: number[]) {
    const { minRatio, maxRatio } = this.configs;
    const container = this.container;
    const matrix = container.getMatrix();
    if (minRatio) {
      if (scale * matrix[0] < minRatio) {
        scale = minRatio / matrix[0];
      }
      if (scale * matrix[3] < minRatio) {
        scale = minRatio / matrix[3];
      }
    }
    if (maxRatio) {
      if (scale * matrix[0] > maxRatio) {
        scale = maxRatio / matrix[0];
      }
      if (scale * matrix[3] > maxRatio) {
        scale = maxRatio / matrix[3];
      }
    }

    if (center) {
      container.translate(-center[0], -center[1]);
    }
    container.scale(scale, scale);
    if (center) {
      container.translate(center[0], center[1]);
    }
    this.emit(GRAPH_EVENTS.TRANSFORMED, {
      type: 'scale',
      ratio: scale,
    });
    this.autoDraw();
  }

  /**
   * Adjusts the graph viewport scale ratio, it's a absolute ratio.
   * 缩放视图，传入的是绝对缩放值
   * @param {number} ratio - Ratio is an number representing the scale ratio you'd like to set.
   */
  setZoomRatio(ratio: number) {
    const { width, height, minRatio, maxRatio } = this.configs;
    if ((maxRatio && ratio > maxRatio) || (minRatio && ratio < minRatio)) {
      return;
    }
    const center = {
      x: width / 2,
      y: height / 2,
    };
    const r = ratio / this.getZoomRatio();
    const container = this.container;
    container.translate(-center.x, -center.y);
    container.scale(r, r);
    container.translate(center.x, center.y);
    this.emit(GRAPH_EVENTS.TRANSFORMED, {
      type: 'scale',
      ratio: r,
    });
    this.autoDraw();
  }

  /**
   * Provide access to the actual zoom ratio of the graph.
   * 获取当前视图的缩放比
   * @param {number} ratio - Ratio is an number representing the current scale ratio.
   */
  getZoomRatio() {
    const matrix = this.getMatrix();
    return matrix[0];
  }

  /**
   * Returns the matrix from the graph.
   * 获取当前视图的变换矩阵
   * @returns an array of number representing the matrix.
   */
  getMatrix() {
    return this.container.getMatrix();
  }

  /**
   * Sets a matrix to the graph.
   * 设置当前视图的变换矩阵，这是个绝对方法
   * @param {number[]} matrix - The `matrix` parameter in the `setMatrix` function is an array of
   * numbers representing a transformation matrix.
   */
  setMatrix(matrix: number[]) {
    this.container.setMatrix(matrix);
    this.emit(GRAPH_EVENTS.TRANSFORMED, {
      type: 'matrix',
    });
  }

  /**
   * Resets the transformation matrix of the graph.
   * 重置当前视图的变换矩阵。
   */
  resetMatrix() {
    const formerScale = this.container.getMatrix()[0];
    this.container.setMatrix([1, 0, 0, 1, 0, 0]);
    this.emit(GRAPH_EVENTS.TRANSFORMED, {
      type: 'scale',
      ratio: 1 / formerScale,
    });
  }

  /**
   * Adds a graph behavior with extra options. Options varies according to the behavior.
   * 添加一个交互，可以根据交互类型传入自定义配置项
   * @param {BehaviorConfigs} behavior - The `behavior` parameter in the `addBehavior` method represents the
   * behavior that you want to add to the behavior manager. It could be any type of behavior that you
   * want to associate with the object or component.
   * @param {Record<string, unknown>} [options] - The `options` parameter in the `addBehavior` method is an optional
   * parameter that can be used to customize the behavior in a specific way based on the provided options.
   */
  addBehavior(behavior: BehaviorConfigs, options?: Record<string, unknown>) {
    this.behaviorManager.add(behavior, options);
  }

  /**
   * Retrieves a behavior you added to the graph.
   * 获取已添加到图中的交互
   * @param {string} type - The `type` parameter in the `getBehavior` function is a string that
   * represents the name of the behavior you want to retrieve.
   * @returns The `getBehavior` function is returning the behavior associated with the provided `name`
   * from the `behaviorManager`.
   */
  getBehavior(type: string) {
    return this.behaviorManager.get(type);
  }

  /**
   * Removes a behavior you added to the graph based on the provided configuration or behavior name.
   * 根据交互配置或交互名称删除一个指定交互
   * @param {BehaviorConfigs | string} behavior - Can be a specified behavior configs or the type of the behavior.
   *
   */
  removeBehavior(behavior: BehaviorConfigs | string) {
    this.behaviorManager.remove(behavior);
  }

  /**
   * Enables a behavior you added to the graph.
   * 启用一个已添加到图中的交互
   * @param {string} name - A string that represents the name of the behavior you want to enable.
   */
  enableBehavior(name: string) {
    this.behaviorManager.enable(name);
  }

  /**
   * Disables a behavior you added to the graph.
   * 禁用一个已添加到图中的交互
   * @param {string} name - A string that represents the name of the behavior you want to disable.
   */
  disableBehavior(name: string) {
    this.behaviorManager.disable(name);
  }

  /**
   * Adds a plugin to the graph.
   * 向图中添加一个组件统一管理，内置组件一般不需要手动调用。
   * @param {ComponentBase} plugin - The `plugin` parameter is a component instance you want to add.
   */
  addComponent(plugin: ComponentBase) {
    this.components.push(plugin);
  }

  /**
   * Translate the container by the given x and y distances.
   * 平移视口
   * @param x The distance to translate in the x direction.
   * @param y The distance to translate in the y direction.
   */
  translate(x: number, y: number) {
    this.container.translate(x, y);
    this.emit(GRAPH_EVENTS.TRANSFORMED, {
      type: 'translate',
      x,
      y,
    });
    this.autoDraw();
  }

  /**
   * Gets the width and height of graph.
   * 获取视图大小
   * @returns The `getGraphSize` function is returning an object with the `width` and `height`
   * properties extracted from the `configs` object.
   */
  getGraphSize() {
    const { width, height } = this.configs;
    return { width, height };
  }

  /**
   * Change the size of the graph viewport.
   * 更新视图大小
   * @param width The desired width of the graph.
   * @param height The desired height of the graph.
   */
  changeSize(width: number, height: number) {
    this.configs.width = width;
    this.configs.height = height;
    this.canvas.changeSize(width, height);
    this.emit(GRAPH_EVENTS.CHANGE_SIZE, { width, height });
    this.autoDraw();
  }

  /**
   * Get the viewport information of the canvas.
   * 返回当前视窗中 canvas 的大小
   * @returns {BBox} The viewport information of the canvas is returned
   */
  getViewport(): BBox {
    return this.canvas.getViewport();
  }

  /**
   * Gets the bounding box of the graph, including all visible nodes and groups and border padding.
   * 获取 Graph 的 BBox，包括所有可见节点连线和分组。
   * @param { number | number[]} padding - 可选参数 padding, 可以是数字或包含四个元素的数组:[top, right, bottom, left]。
   * Optional parameter representing the padding around the graph. Can be a number or an array containing four elements: [top, right, bottom, left].
   * @returns 包含边界框信息的对象: { left, top, width, height }。
   * An object containing the bounding box information: { left, top, width, height }.
   */
  getBBox() {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const nodes = this.getNodes();
    const groups = this.getGroups();

    if (nodes.length === 0) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    }

    if (groups.length) {
      groups.forEach((group: Group) => {
        if (group.isVisible()) {
          const bbox = group.getBBox();
          if (bbox.width !== 0 && bbox.height !== 0) {
            minX = Math.min(bbox.left, minX);
            maxX = Math.max(bbox.left + bbox.width, maxX);
            minY = Math.min(bbox.top, minY);
            maxY = Math.max(bbox.top + bbox.height, maxY);
          }
        }
      });
    }

    nodes.forEach((node: Node) => {
      if (node.isVisible()) {
        const bbox = node.getBBox();
        if (bbox.width !== 0 && bbox.height !== 0) {
          minX = Math.min(bbox.left, minX);
          maxX = Math.max(bbox.left + bbox.width, maxX);
          minY = Math.min(bbox.top, minY);
          maxY = Math.max(bbox.top + bbox.height, maxY);
        }
      }
    });

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Gets the bounding box of the graph, including all visible nodes and groups and border padding.
   * 获取 Graph 的 BBox，包括所有可见节点和组以及视图的 padding 填充。
   * @param { number | number[]} padding - 可选参数 padding, 可以是数字或包含四个元素的数组:[top, right, bottom, left]。
   * Optional parameter representing the padding around the graph. Can be a number or an array containing four elements: [top, right, bottom, left].
   * @returns 包含边界框信息的对象: { left, top, width, height }。
   * An object containing the bounding box information: { left, top, width, height }.
   */
  getGraphBBox(padding?: number | number[]) {
    const { left, top, width, height } = this.getBBox();
    padding = normalizePadding(padding ?? this.get('padding'));
    return {
      left: left - padding[3],
      top: top - padding[0],
      width: width + padding[1] + padding[3],
      height: height + padding[0] + padding[2],
    };
  }

  /**
   * Focuses on a given entity and centers the view on it.
   * 移动视窗到指定节点为中心从而聚焦节点
   * @param {Node | Edge | Group} entity - The `entity` parameter can be of type `Node`, `Edge`, or
   * `Group`.
   * @param {boolean | { duration?: number, onFinish?:() => void; easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce'}} [animate] - The `animate` parameter is an optional parameter that determines whether
   * the focus operation should be animated or not. If a truthy value is provided for the `animate`
   * parameter, the focus operation will be animated.
   */
  focus(
    entity: Node | Edge | Group,
    animate?:
      | boolean
      | {
          duration?: number;
          onFinish?: () => void;
          easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
        }
  ) {
    const bbox = entity.getBBox();
    this.focusPoint(bbox.left + bbox.width / 2, bbox.top + bbox.height / 2, animate);
  }

  /**
   * Adjusts the view center to a specified point, with optional animation capabilities.
   * 指定一个 canvas 坐标为视窗中心
   * @param {number} x - The `x` parameter in the `focusPoint` function represents the x-coordinate of
   * the point you want to focus on within the canvas.
   * @param {number} y - The `y` parameter in the `focusPoint` function represents the y-coordinate of
   * the point to which the view will be focused or translated.
   * @param {boolean | { duration?: number, onFinish?:() => void; easing?: 'easelinear' | 'easeCubic' |
   * 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce'}} [animate] -  If `animate` is `false` or not provided,
   * the translation will be applied immediately without animation. If `animate` is `true` or specified animate configs, the focus operation will be animated.
   */
  focusPoint(
    x: number,
    y: number,
    animate?:
      | boolean
      | {
          duration?: number;
          onFinish?: () => void;
          easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
        }
  ) {
    const center = this.getViewCenter();
    const canvas = this.canvas;
    const canvasCenter = canvas.pointCoordToCanvas(center);
    const matrix = this.container.getMatrix();
    const offsetX = (canvasCenter.x - x) * matrix[0];
    const offsetY = (canvasCenter.y - y) * matrix[3];
    const translate = this.translate.bind(this);
    if (!animate) {
      translate(offsetX, offsetY);
    } else {
      let prevX = 0;
      let prevY = 0;
      const animateConfigs = {
        target: canvas,
        onFrame(ratio: number) {
          const curX = offsetX * ratio;
          const curY = offsetY * ratio;
          translate(curX - prevX, curY - prevY);
          prevX = curX;
          prevY = curY;
        },
        duration: 500,
        repeat: false,
      };
      if (typeof animate === 'object') {
        Object.assign(animateConfigs, animate);
      }
      canvas.animate(animateConfigs);
    }
    this.autoDraw();
  }

  /**
   * Enable or disable the capture of all mouse / touch events on graph.
   * 启用/禁用画布上的事件捕获
   * @param {boolean} capture - If `capture` is set to `true`, the element will capture the mouse events.
   */
  setCapture(capture: boolean) {
    this.canvas.setCapture(capture);
  }

  /**
   * Adjusts the scale and translation of the graph to fit its contents.
   * 将图中内容根据配置项中的宽高进行缩放平移，居中展示整个图
   */
  fitView() {
    const container = this.container;
    const padding = this.getViewPadding();
    const { width, height } = this.configs;
    container.setMatrix([1, 0, 0, 1, 0, 0]);
    const bbox = container.getBBox();
    const center = this.getViewCenter();
    container.translate(center.x - bbox.left - bbox.width / 2, center.y - bbox.top - bbox.height / 2);
    const w = width / (bbox.width + padding[1] + padding[3]);
    const h = height / (bbox.height + padding[0] + padding[2]);
    const ratio = Math.min(w, h);
    this.scale(ratio, [center.x, center.y]);
  }

  /**
   * Adjusts the view to fit all specified nodes.
   * 将图中内容根据配置项中的宽高进行缩放平移，居中展示指定的所有节点
   * @param {Node[]} nodes - The `fitViewByNodes` function takes an array of `Node` instances as input.
   */
  fitViewByNodes(nodes: Node[]) {
    const { width, height } = this.configs;
    const container = this.container;
    const padding = this.getViewPadding();
    container.setMatrix([1, 0, 0, 1, 0, 0]);
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    nodes.forEach((node: Node) => {
      const bbox = node.getBBox();
      minX = Math.min(minX, bbox.left);
      minY = Math.min(minY, bbox.top);
      maxX = Math.max(maxX, bbox.left + bbox.width);
      maxY = Math.max(maxY, bbox.top + bbox.height);
    });
    const bbox = {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    const center = this.getViewCenter();
    container.translate(center.x - bbox.left - bbox.width / 2, center.y - bbox.top - bbox.height / 2);
    const w = width / (bbox.width + padding[1] + padding[3]);
    const h = height / (bbox.height + padding[0] + padding[2]);
    const ratio = Math.min(w, h);
    this.scale(ratio, [center.x, center.y]);
  }

  /**
   * Translate canvas to align view borders
   * 将视图平移对齐。
   * @param {string} align - 对齐方式，可以是 'lt'、'ct'、'rt'、'lc'、'cc'、'rc'、'lb'、'cb'、'rb' 之一，默认为 'lt'。分别表示左上、中上、右上、左中、居中、右中、左下、中下、右下。
   * Alignment, can be 'lt', 'ct', 'rt', 'lc', 'cc', 'rc', 'lb', 'cb', 'rb', one of the default for 'lt'.
   * They indicate leftTop, centerTop, rightTop, ... rightBottom.
   */

  alignView(align: 'lt' | 'ct' | 'rt' | 'lc' | 'cc' | 'rc' | 'lb' | 'cb' | 'rb' = 'lt') {
    const container = this.container;
    const padding = this.getViewPadding();
    const originScale = this.getMatrix()[0];
    const { width, height } = this.configs;
    container.setMatrix([1, 0, 0, 1, 0, 0]);
    const bbox = container.getBBox();
    const center = this.getViewCenter();
    let translateX = 0,
      translateY = 0;
    let centerX = center.x,
      centerY = center.y;
    const x = align[0];
    const y = align[1];
    switch (x) {
      case 'l':
        centerX = center.x - width * 0.5 + padding[3];
        translateX = centerX - bbox.left;
        break;
      case 'c':
        centerX = center.x;
        translateX = centerX - bbox.left - bbox.width / 2;
        break;
      case 'r':
        centerX = center.x + width * 0.5 - padding[1];
        translateX = centerX - bbox.left - bbox.width;
        break;
      default:
        break;
    }
    switch (y) {
      case 't':
        centerY = center.y - height * 0.5 + padding[0];
        translateY = centerY - bbox.top;
        break;
      case 'c':
        centerY = center.y;
        translateY = centerY - bbox.top - bbox.height / 2;
        break;
      case 'b':
        centerY = center.y + height * 0.5 - padding[2];
        translateY = centerY - bbox.top - bbox.height;
        break;
      default:
        break;
    }
    container.translate(translateX, translateY);
    this.scale(originScale, [centerX, centerY]);
  }

  /**
   * Calculates the center coordinates of a view.
   * 获取视窗中心坐标
   * @returns The x and y coordinates of the center of the view, taking into account the padding configs.
   */
  getViewCenter() {
    const padding = this.getViewPadding();
    const { width, height } = this.configs;
    return {
      x: (width - padding[1] - padding[3]) / 2 + padding[3],
      y: (height - padding[0] - padding[2]) / 2 + padding[0],
    };
  }

  /**
   * Retrieves and normalizes the padding value for a view.
   * 获取画布的留白边配置
   * @returns Normalized padding value with [ top, right, bottom, left] padding value.
   */
  getViewPadding() {
    const padding = this.get('padding');
    return normalizePadding(padding);
  }

  /**
   * The function takes a MouseEvent or TouchEvent as input and delegates the event to the graph.
   * 将外部事件在画布上触发
   * @param {MouseEvent | TouchEvent} e - The native event to be delagted.
   */
  handleEvent(e: MouseEvent | TouchEvent) {
    const eventManager = this.canvas.eventManager;
    eventManager.handleEvent(e);
  }

  /**
   * Converts client coordinates to viewport coordinates.
   * 将浏览器坐标转换为视窗坐标
   * @param {number} clientX - The `clientX` parameter represents the x-coordinate value of the mouse pointer
   * @param {number} clientY - The `clientY` parameter represents the y-coordinate value of the mouse pointer
   * @returns A `Point` object with the `x` and `y` coordinates.
   */
  clientToViewport(clientX: number, clientY: number): Point {
    const canvas = this.canvas;
    const { x, y } = canvas.clientToCanvas(clientX, clientY);
    const pixelRatio = canvas.get('pixelRatio') || 1;
    return { x: x / pixelRatio, y: y / pixelRatio };
  }

  /**
   * Converts client coordinates to canvas coordinates.
   * 将浏览器坐标转换为画布坐标
   * @param {number} clientX - The `clientX` parameter represents the x-coordinate value of the mouse pointer
   * @param {number} clientY - The `clientY` parameter represents the y-coordinate value of the mouse pointer
   * @returns A Point object with the `x` and `y` coordinates.
   */
  clientToCanvas(clientX: number, clientY: number): Point {
    const viewPoint = this.clientToViewport(clientX, clientY);
    return this.viewportToCanvas(viewPoint.x, viewPoint.y);
  }

  /**
   * Converts canvas coordinates to viewport coordinates.
   * 将画布坐标转换为视窗坐标
   * @param {number} x - The `x` parameter represents the x-coordinate on the canvas.
   * @param {number} y - The `y` parameter represents the y-coordinate on the canvas.
   * @returns A Point object with the `x` and `y` coordinates.
   */
  canvasToViewport(x: number, y: number): Point {
    const canvas = this.canvas;
    return canvas.canvasCoordToPoint({ x, y });
  }

  /**
   * Converts canvas coordinates to client coordinates.
   * 将画布坐标转换为浏览器坐标
   * @param {number} x - The `x` parameter represents the x-coordinate on the canvas.
   * @param {number} y - The `y` parameter represents the y-coordinate on the canvas.
   * @returns A Point object with the `x` and `y` coordinates.
   */
  canvasToClient(x: number, y: number): Point {
    const point = this.canvasToViewport(x, y);
    const bbox = this.canvas.getCanvasDom().getBoundingClientRect();
    return {
      x: point.x + bbox.left,
      y: point.y + bbox.top,
    };
  }

  /**
   * Converts viewport coordinates to canvas coordinates
   * 将视窗坐标转换为画布坐标
   * @param {number} vx - The `vx` parameter represents the x-coordinate value in the viewport
   * coordinate system.
   * @param {number} vy - The `vy` parameter represents the y-coordinate in the viewport coordinate
   * system.
   * @returns A Point object with the `x` and `y` coordinates.
   */
  viewportToCanvas(vx: number, vy: number): Point {
    return this.canvas.pointCoordToCanvas({ x: vx, y: vy });
  }

  /**
   * Retrieves a Node instance from the graph based on the provided id.
   * 根据 id 获取节点实例
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of a
   * node in the entity map. The `getNodeById` function takes this `id` as an argument and returns the
   * corresponding node from the entity map based on that identifier.
   * @returns Node object or undefined.
   */
  getNodeById(id: string) {
    return this.entityMap.node[id];
  }

  /**
   * Retrieves a Edge instance from the graph based on the provided id.
   * 根据 id 获取连线实例
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of an edge.
   * @returns Edge object or undefined.
   */
  getEdgeById(id: string) {
    return this.entityMap.edge[id];
  }

  /**
   * Retrieves a Group instance from the graph based on the provided id.
   * 根据 id 获取分组实例
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of a group.
   * @returns Group object or undefined.
   */
  getGroupById(id: string) {
    return this.entityMap.group[id];
  }

  /**
   * Get the canvas renderer instance.
   * 获取画布实例
   * @returns Canvas renderer instance.
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Get the canvas dom object.
   * 获取真实绘制的 canvas 节点
   * @returns Canvas dom object.
   */
  getCanvasDom() {
    return this.canvas.getCanvasDom();
  }

  /**
   * Get the graph top-level layer including all the node, edge, group shapes.
   * 获取图中顶层容器
   * @returns Graph top-level layer.
   */
  getContainer() {
    return this.container;
  }

  /**
   * Get the graph group layer including all the group shapes.
   * 获取图中所有分组图形的容器
   * @returns Graph group layer.
   */
  getGroupContainer() {
    return this.groupContainer;
  }

  /**
   * Get the graph node layer including all the node shapes.
   * 获取图中所有节点图形的容器
   * @returns Graph node layer.
   */
  getNodeContainer() {
    return this.nodeContainer;
  }

  /**
   * Get the graph edge layer including all the node shapes.
   * 获取图中所有连线图形的容器
   * @returns Graph edge layer.
   */
  getEdgeContainer() {
    return this.edgeContainer;
  }

  /**
   * Get all the node instances map.
   * 以 Map 形式获取图中所有节点实例
   * @returns all node instances in the form of <id, Node> .
   */
  getNodeMap() {
    return this.entityMap.node;
  }

  /**
   * Get all the node instances in an array.
   * 以数组形式获取图中所有节点实例
   * @returns all node instances in the form of array.
   */
  getNodes(): Node[] {
    return Object.values(this.entityMap.node);
  }

  /**
   * Get all the edge instances in an array.
   * 以数组形式获取图中所有连线实例
   * @returns all edge instances in the form of array.
   */
  getEdges(): Edge[] {
    return Object.values(this.entityMap.edge);
  }

  /**
   * Get all the group instances in an array.
   * 以数组形式获取图中所有分组实例
   * @returns all group instances in the form of array.
   */
  getGroups(): Group[] {
    return Object.values(this.entityMap.group);
  }

  /**
   * Filter according to conditions and only display the entities of the specified type that meet the conditions.
   * 按条件筛选仅展示符合条件的图中指定类型的元素
   */
  filter(fn: (entity: Node | Edge | Group) => boolean, target: 'node' | 'edge' | 'group') {
    this.set('emitGraphEvents', false);
    (Object.values(this.entityMap[target]) as Node[] | Edge[] | Group[])?.forEach((entity: Node | Edge | Group) => {
      if (fn(entity)) {
        entity.show();
      } else {
        entity.hide();
      }
    });
    this.set('emitGraphEvents', true);
    this.emitEvent(GRAPH_EVENTS.VISIBILITY_END);
  }

  /**
   * Sets default animation configurations for a graph if not provided.
   * 配置标准化的统一动画配置
   * @param {GraphConfigs} configs - Graph configs including animate configs.
   */
  private setAnimateConfigs(configs: GraphConfigs) {
    const defaultAnimationConfigs = {
      duration: 500,
      repeat: false,
      delay: 0,
      easing: 'easelinear',
    };
    configs.animate = Object.assign(defaultAnimationConfigs, configs.animate);
  }

  /**
   * Animates the canvas based on the provided configurations.
   * 根据配置执行画布动画
   * @param {AnimateConfigs} configs - xGraph has well packed animates can be used by padding type and also general animates.
   * @returns A animate id which can be used to stop the animate.
   */
  animate(configs: AnimateConfigs) {
    return animate(this.canvas, configs);
  }

  /**
   * Check if graph has any ongoing animations
   * 返回画布是否有动画正在执行
   * @returns Returns true if graph is animating, else false.
   */
  isAnimating(): boolean {
    return this.canvas.animationManager.animating;
  }

  /**
   * Stops the one or all animations of this graph.
   * 终止指定动画或所有动画
   * @param {string} [uuid] - The animate id you'd like to stop. Will stop all the animates if empty.
   */
  stopAnimate(uuid?: string) {
    this.canvas.stopAnimate(uuid);
  }

  /**
   * Clears all nodes, edges, and groups in a graph.
   * 清空画布
   */
  clear() {
    this.emitEvent(GRAPH_EVENTS.CLEAR_START);
    this.getNodes().forEach((node: Node) => {
      node.edges = [];
      node.targets = [];
      node.sources = [];
    });
    this.getNodeContainer().children = [];
    this.getEdgeContainer().children = [];
    this.getGroupContainer().children = [];
    // 提前清空顶层容器，避免逐个清空导致复杂度上升至 O(N^2).

    Object.values(this.entityMap).forEach((entities: Record<string, Node | Edge | Group>) => {
      Object.values(entities).forEach((entity: Node | Edge | Group) => {
        // clear 有个特殊场景就是一份数据多次加工以 graph.data 的方式写入 graph。
        // 如果直接 clear 分组的 children 等数据丢失，需要一个标识位控制是否删除配置项
        entity.destroy(false);
      });
    });
    this.entityMap = { node: {}, edge: {}, group: {} };
    this.emitEvent(GRAPH_EVENTS.CLEAR_END);
  }

  /**
   * Emits meta events and change event base on the flag on the graph.
   * 发出一个原子事件，并可能进一步触发 change 事件
   * @param {string} type - Specifies the type of event being emitted.
   * @param [args] - The `args` parameter varies according to the type of event.
   */
  emitEvent(type: string, args?: Record<string, unknown>) {
    if (this.get('emitGraphEvents')) {
      this.emit(type, args);
      if (CHANGE_EVENTS[type]) {
        this.emit(GRAPH_EVENTS.CHANGE, { type, ...args });
      }
    }
  }

  /**
   * Add entity to a map according to id, throw an error if id already existed.
   * 添加实例到内部数据结构中，若 id 重复则抛出错误
   * @param {'node' | 'edge' | 'group'} type - The entity type.
   * @param {Node | Edge | Group} entity - The entity instance, whether it is a node, edge, or group.
   */
  protected addToMap(type: 'node' | 'edge' | 'group', entity: Node | Edge | Group) {
    const id = entity.get('id');
    const exist = this.entityMap[type][id];
    if (exist) {
      this.throw(`Duplicate ${type} id: ${id}, will ignore this entity`);
      return false;
    }
    this.entityMap[type][id] = entity;
    return true;
  }

  /**
   * Update render mode of nodes in this graph.
   * 更新节点的渲染模式
   * @param {string} mode - Specifies the new render mode of the graph.
   */
  updateRenderMode(mode: 'dom' | 'canvas') {
    this.set('renderMode', mode);
    if (mode === 'dom') {
      this.getNodes().forEach((node: Node) => {
        node.temp = true;
        node.layer.clear();
      });
    } else {
      this.getNodes().forEach((node: Node) => {
        node.temp = false;
        node.updateData(undefined, false);
      });
    }
    this.autoDraw();
  }

  /**
   * Throws an error with a specified message in dev mode, otherwise it logs the error message to the console.
   * 根据配置决定错误抛出形式
   * @param {string} errorMsg - A string that represents the error message.
   */
  protected throw(errorMsg: string) {
    if (this.get('throwError')) {
      throw new Error(errorMsg);
    } else {
      console.error(errorMsg);
    }
  }

  /**
   * Export an image with all the nodes, edges, groups drawn in canvas.
   * If you are using a different node rendering method, use a html to image util instead.
   * 导出画布上内容。如果采用了 canvas 以外的节点渲染方式，需配合 html to image 工具。
   * @param {string} [name] - The file name of the image
   * @param {number} [maxWidth] - Maximum width that the downloaded image should have.
   *  If the image's width exceeds this value, it will be resized to fit the width.
   * @param {number} [maxHeight] - Maximum height that the downloaded image should have.
   * If the height of the image exceeds this value, it will be resized to fit the height.
   * @param [onDownloadFinish] - A callback function that will be called after the image download process is finished.
   * @param {string}[backgroundColor] - Specify the background color, default is `transparent`.
   */
  downloadImage(
    name?: string,
    maxWidth?: number,
    maxHeight?: number,
    onDownloadFinish?: () => void,
    backgroundColor?: string
  ) {
    this.canvas.downloadImage(name, maxWidth, maxHeight, this.getViewPadding(), onDownloadFinish, backgroundColor);
  }

  /**
   * Export an image with image loading check in canvas, usually works with dom nodes export.
   * 进行图片加载确认后导出画布上内容，一般适用于大量 dom 节点导出。
   * @param {DownloadImageOptions} [options] - Export options.
   */
  downloadImageWithImgCheck(options?: DownloadImageOptions) {
    this.canvas.downloadImageWithImgCheck(options);
  }

  protected initLayout() {
    const layout = this.configs.layout as { type: string; options: any };
    // 直接传入的 layout 实例
    if (layout && !layout?.type) {
      this.set('layout', layout);
      return;
    }
    const layoutMap = this.getLayouts();
    if (!layoutMap[layout!.type]) {
      console.error(`Layout type ${layout!.type} does not exist`);
      return;
    }
    const inst = new layoutMap[layout!.type]({
      ...layout?.options,
      graph: this,
    });
    this.set('layout', inst);
  }

  protected getLayouts() {
    return {};
  }

  /**
   * Clear all the data and destroy various components and listeners of the graph.
   * 销毁整个图实例
   */
  destroy() {
    this.clear();
    this.behaviorManager.destroy();
    this.components.forEach((plugin: ComponentBase) => {
      try {
        plugin.destroy();
      } catch (e) {
        console.warn('plugin destroy exception:', e);
      }
    });
    this.components = [];
    this.canvas.destroy();
    this.removeAllListeners();
    this.entityMap = { node: {}, edge: {}, group: {} };
  }
}
