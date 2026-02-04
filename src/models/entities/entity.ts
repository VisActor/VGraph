import { EventEmitter } from 'eventemitter3';
import { Circle, Icon, Layer, LayerBase, Rect, Shape, ShapeBase } from '../../renderer';
import { Group } from './group';
import { EVENTS, GRAPH_EVENTS } from '../../consts/meta_events';
import { AnchorConfigs, NodeIconConfigs } from '../../typings/model';
import { ShapeEvent } from '../../typings/event';
import { updateAppendSize, arrayAdd } from '../append_size';

export class Entity extends EventEmitter {
  type: 'entity' | 'edge' | 'node' | 'group' = 'entity';
  configs: any; // TODO, any 治理
  layer: any;
  graph: any;
  states: string[] = [];
  _styleCache: Record<string, unknown> = {};
  belong: Group | null = null;
  visible = true;
  // 父分组或祖先分组是否有被收起导致节点/分组不可见
  shutoff = false;

  constructor(configs: any, graph: any, container: Layer, temp = false) {
    super();
    this.graph = graph;
    this.configs = configs;
    // 如果是临时实体，不生成图形对象
    if (temp) {
      return;
    }
    this.mergeConfigs(configs);
    const layer = this.initLayer(this.configs);
    this.layer = layer;
    container.add(layer);
    this.bindEvents(layer);
  }

  protected initLayer(configs: any) {
    return new Layer();
  }

  protected bindEvents(layer: Layer) {
    const graph = this.graph;
    EVENTS.forEach((eventName) => {
      layer.on(eventName, (e) => {
        this.emit(eventName, e);
        const relatedTarget = e.target;
        graph.emit(`${this.type}:${eventName}`, {
          ...e,
          target: this,
          relatedTarget,
        });
      });
    });
  }

  initIconShapes(iconConfigs: NodeIconConfigs[]) {
    const layer = this.layer;
    const configs = this.configs;
    const icons: LayerBase[] = [];
    iconConfigs.forEach((iconCfgs: NodeIconConfigs) => {
      const styles = iconCfgs.setStyles(configs);
      const iconLayer = new LayerBase({});
      const icon = new Icon({
        ...styles,
        id: 'icon',
        x: 0,
        y: 0,
      });
      let bgShape = null;
      if (iconCfgs.setBgStyles) {
        const bgStyles = iconCfgs.setBgStyles(configs);
        const bgShapeStyles = {
          id: 'bgShape',
          fillStyle: '#fff',
          ...bgStyles.styles,
        };
        if (bgStyles.type === 'circle') {
          bgShape = new Circle({
            ...bgShapeStyles,
            cx: 0,
            cy: 0,
            r: 0,
          });
        } else {
          bgShape = new Rect({
            ...bgShapeStyles,
            left: 0,
            top: 0,
            width: 0,
            height: 0,
          });
        }
        iconLayer.add(bgShape);
      }
      iconLayer.set('showType', iconCfgs.show);
      iconLayer.add(icon);
      layer.add(iconLayer);
      icons.push(iconLayer);
      this.bindIconEvent(iconLayer, 'click', iconCfgs.onClick);
      this.bindIconEvent(iconLayer, 'mouseenter', iconCfgs.onMouseEnter);
      this.bindIconEvent(iconLayer, 'mouseleave', iconCfgs.onMouseLeave);
      if (iconCfgs.show === 'hover') {
        iconLayer.hide();
      }
    });
    this.setIconConfigs(iconConfigs, icons);
    layer.set('__icons', icons);
  }

  /**
   * 将由 0 - 1 定义的相对坐标转换成 layer 下的绝对坐标，不同的形状可能有所不同
   * @param relativePosition 相对坐标
   * @returns 实体所在图层下的绝对坐标
   */
  protected convertToAbsolutePosition(relativePosition: number[] | number): number[] {
    if (typeof relativePosition === 'number') {
      relativePosition = [relativePosition, relativePosition];
    }
    return relativePosition;
  }

  setIconConfigs(iconConfigs: NodeIconConfigs[], icons: LayerBase[]) {
    const appendSize = [0, 0, 0, 0];
    const layer = this.layer;
    const configs = this.configs;
    iconConfigs.forEach((iconCfgs: NodeIconConfigs, i: number) => {
      const styles = iconCfgs.setStyles(configs);
      const position = this.convertToAbsolutePosition(iconCfgs.position);
      const offset = iconCfgs.offsets ? iconCfgs.offsets : [0, 0];
      const iconLayer = icons[i];
      iconLayer.setMatrix([1, 0, 0, 1, 0, 0]);
      iconLayer.translate(position[0] + offset[0], position[1] + offset[1]);
      const icon = iconLayer.findById('icon');
      const bgShape = iconLayer.findById('bgShape');
      if (icon) {
        if (bgShape && iconCfgs.setBgStyles) {
          const bgStyles = iconCfgs.setBgStyles(configs);
          const iconBBox = icon.getBBox();
          const bgSize = bgStyles.size || styles.size || Math.max(iconBBox.width, iconBBox.height);
          if (bgShape.type === 'circle') {
            bgShape.set({
              ...bgStyles.styles,
              r: bgSize / 2,
            });
          } else {
            bgShape.set({
              ...bgStyles.styles,
              left: -bgSize / 2,
              top: -bgSize / 2,
              width: bgSize,
              height: bgSize,
            });
          }
        }
        if (iconCfgs.setStyles) {
          const iconStyles = iconCfgs.setStyles(configs);
          icon.set({ ...iconStyles });
        }
        const bbox = iconLayer.getBBox();
        updateAppendSize(appendSize, bbox, configs);
      }
    });
    layer.set('__iconAppendSize', appendSize);
  }

  bindIconEvent(layer: Layer, event: string, iconEvent?: (e: ShapeEvent, configs: any) => void) {
    const configs = this.configs;
    if (iconEvent) {
      layer.on(event, (e: ShapeEvent) => {
        e.relatedTarget = e.target;
        e.target = layer;
        iconEvent(e, configs);
      });
    }
  }

  updateData(configs: any) {}

  protected initAnchorShapes(anchorConfigs: AnchorConfigs[]) {}

  updateAnchorShapes(anchorConfigs?: AnchorConfigs[] | number[][]) {
    const anchors = this.layer.get('__anchors');
    if (anchors) {
      anchors.forEach((anchor: Shape) => {
        anchor.destroy();
      });
      this.layer.set('__anchors', null);
      this.layer.set('__anchorAppendSize', null);
    }
    if (anchorConfigs && !Array.isArray(anchorConfigs[0])) {
      this.initAnchorShapes(anchorConfigs as AnchorConfigs[]);
    }
  }

  updateIconShapes(iconConfigs?: NodeIconConfigs[]) {
    const layer = this.layer;
    const icons = layer.get('__icons');
    if (icons && !iconConfigs) {
      icons.forEach((icon: Shape) => {
        icon.destroy();
      });
      layer.set('__icons', null);
    } else if (!icons && iconConfigs) {
      this.initIconShapes(iconConfigs);
    } else if (icons && iconConfigs) {
      icons.forEach((icon: Shape) => {
        icon.destroy();
      });
      layer.set('__icons', null);
      this.initIconShapes(iconConfigs);
    }
  }

  updateLayerAppendSize() {
    const { __iconAppendSize, __anchorAppendSize, __labelAppendSize, customAppendSize } = this.layer.configs;
    const appendSize = [0, 0, 0, 0];
    if (__iconAppendSize) {
      arrayAdd(appendSize, __iconAppendSize);
    }
    if (__anchorAppendSize) {
      arrayAdd(appendSize, __anchorAppendSize);
    }
    if (__labelAppendSize) {
      arrayAdd(appendSize, __labelAppendSize);
    }
    if (customAppendSize) {
      arrayAdd(appendSize, customAppendSize);
    }
    if (appendSize.some((value) => value !== 0)) {
      this.layer.set('appendSize', appendSize);
    } else {
      this.layer.set('appendSize', null);
    }
  }

  protected mergeConfigs(configs: any) {
    return configs;
  }

  getDefaultConfigs(type: string, data?: any) {
    let configs = {};
    const setConfigs = this.graph.get(type);
    if (setConfigs) {
      configs = setConfigs(data || this.configs);
    }
    return configs;
  }

  setState(state: string, onlyState?: boolean) {
    const graph = this.graph;
    if (this.states.includes(state) && !onlyState) {
      return;
    }
    const emitGraphEvents = graph.get('emitGraphEvents');
    graph.emitEvent(GRAPH_EVENTS.STATE_START, {
      target: this,
      state,
    });
    graph.set('emitGraphEvents', false);

    if (onlyState) {
      this.clearStates();
    }
    this.states.push(state);
    this.onSetState(state, onlyState);
    graph.set('emitGraphEvents', emitGraphEvents);
    graph.emitEvent(GRAPH_EVENTS.STATE_END, {
      target: this,
      state,
    });
    graph.autoDraw();
  }

  protected onSetState(state: string, onlyState?: boolean) {
    this.states.push(state);
  }

  hasState(state: string) {
    return this.states.includes(state);
  }

  removeState(state: string) {
    const graph = this.graph;
    const index = this.states.indexOf(state);
    if (index < 0) {
      return;
    }
    const emitGraphEvents = graph.get('emitGraphEvents');
    graph.emitEvent(GRAPH_EVENTS.STATE_START, {
      target: this,
      state,
    });
    graph.set('emitGraphEvents', false);
    this.states.splice(index, 1);
    const states = this.states.concat();
    this.clearStates();
    if (states.length !== 0) {
      states.forEach((st) => {
        this.setState(st, false);
      });
    }
    graph.set('emitGraphEvents', emitGraphEvents);
    graph.emitEvent(GRAPH_EVENTS.STATE_END, {
      target: this,
      state,
    });
    this.graph.autoDraw();
  }

  convertGroupId(configs: any) {
    if (typeof configs.groupId === 'number') {
      configs.groupId = String(configs.groupId);
    }
    if (configs.groupId === '') {
      // 空字符串也视为空。
      delete configs.groupId;
    }
  }

  clearStates() {
    const graph = this.graph;
    graph.emitEvent(GRAPH_EVENTS.STATE_START, {
      target: this,
      state: '',
    });
    this.states = [];
    this.onClearStates();
    this._styleCache = {};
    graph.emitEvent(GRAPH_EVENTS.STATE_END, {
      target: this,
      state: '',
    });
    this.graph.autoDraw();
  }

  protected onClearStates() {}

  getCapture() {
    return this.layer.capture;
  }

  setCapture(capture: boolean) {
    this.layer.capture = capture;
  }

  recoverStates() {
    if (!this.states || this.states.length === 0) {
      return;
    }
    const states = this.states;
    this.states = [];
    this._styleCache = {};
    states.forEach((state: string) => {
      this.setState(state);
    });
  }

  cacheStyles(state: string, stateStyles: Record<string, unknown>) {
    const cache = this._styleCache || {};
    const keyShape = this.getKeyShape();
    Object.keys(stateStyles).forEach((k) => {
      if (!Object.prototype.hasOwnProperty.call(cache, k)) {
        cache[k] = keyShape.get(k);
      }
    });
    this._styleCache = cache;
  }

  getKeyShape() {
    return new ShapeBase({});
  }

  getLabel() {
    return this.layer.find((shape: Shape) => shape.get('_label'));
  }

  getBBox() {
    // 部分操作在节点位置坐标更新之后，但还未运行 graph.refresh 或 node.updatePosition
    // 就可能导致 layer 的坐标宽高与节点的坐标宽高不一致
    // 从而导致 getBBox 拿到的 box 是过时的，从而导致错误。
    // FDP 中为了兼容原始数据直接作为输入直接改了 node.configs.x
    const { x, y, width, height } = this.configs;
    if (this.layer.get('x') !== x || this.layer.get('y') !== y) {
      this.layer.set('x', x);
      this.layer.set('y', y);
    }
    if (width !== this.layer.width || height !== this.layer.height) {
      this.layer.directSet('width', width);
      this.layer.directSet('height', height);
    }
    return this.layer.getBBox();
  }

  get(k: string) {
    return this.configs[k];
  }

  set(k: string, v: any) {
    this.configs[k] = v;
  }

  setOpacity(opacity: number) {
    this.layer.set('opacity', opacity);
  }

  show() {
    if (this.visible) {
      return;
    }
    this.visible = true;
    if (!this.shutoff) {
      this.layer.show();
    }
    this.graph.emitEvent(GRAPH_EVENTS.VISIBILITY_END, { target: this });
  }

  hide() {
    if (!this.visible) {
      return;
    }
    this.visible = false;
    this.layer.hide();
    this.graph.emitEvent(GRAPH_EVENTS.VISIBILITY_END, { target: this });
  }

  toFront() {
    const layer = this.layer;
    const parent = layer.getParent();
    const index = parent.children.indexOf(layer);
    if (index >= 0) {
      parent.children.splice(index, 1);
    }
    parent.children.push(layer);
  }

  toBack() {
    const layer = this.layer;
    const parent = layer.getParent();
    const index = parent.children.indexOf(layer);
    if (index >= 0) {
      parent.children.splice(index, 1);
    }
    parent.children.unshift(layer);
  }

  isVisible() {
    return this.visible && !this.shutoff;
  }

  isAnimating() {
    return this.getKeyShape().animating;
  }

  isDestroyed() {
    return !this.layer || this.layer.destroyed;
  }

  destroy() {
    this.removeAllListeners();
    if (this.layer) {
      this.layer.destroy();
    }
  }
}
