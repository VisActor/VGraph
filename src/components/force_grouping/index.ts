import { ForceCollision } from '../../layouts';
import { Graph } from '../../graph';
import { Circle, ShapeBase } from '../../renderer';
import { Node } from '../../models/entities';
import { GraphEvent } from '../../typings/event';
import { isDragDist } from '../../utils';

import { ComponentBase } from '../base';

const EVENTS = [
  'dblclick',
  'mouseover',
  'mouseout',
  'mousedown',
  'mouseup',
  'mousemove',
  'contextmenu',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
];

const defaultShapeStyles = {
  opacity: 0.05,
  fillStyle: '#cccccc',
  lineWidth: 2,
  strokeStyle: '#7f7f7f',
};

export class ForceDirectedGrouping extends ComponentBase {
  graph: Graph;
  groupShapes: { [key: string]: ShapeBase } = {}; // combo shapes
  _shapeEvents: { [key: string]: any };
  groups: { [key: string]: any } = {};
  groupsForForce: { [key: string]: any } = {};
  dummyGroupNodes: any[] = [];
  originKeys: (number | string)[] = []; // 涉及到透出的采用原始的Key而不是Object的keys。 因为Object的Keys会强制转为string类型从而导致不一致。
  groupVelocity: ReturnType<ForceDirectedGrouping['ConstructGroupVelocityFunc']>;

  constructor(config: {
    graph: Graph;
    options?: {
      /**
       * Get the group that each node belongs to.
       * 识别不同group的节点属性或方法
       */
      getGroupValue?: (nodeData: any) => any;
      /**
       * Styles of different groups
       * 不同分组的背景样式
       */
      shapeStyles?: (groupValue: any) => any;
      /**
       * Enable drag of the group shapes
       * 启用分组背景图形的拖拽交互
       */
      shapeDraggable?: boolean;
      /**
       * The extra padding radius between two groups
       * 配置分组之间额外的留白半径
       */
      extraPadding?: number;
    };
  }) {
    super(config.graph, config.options);
    this.graph = config.graph;
    this._shapeEvents = {};
    this.initGroups();
    this.createShapes();
    this.groupVelocity = this.ConstructGroupVelocityFunc();
  }

  getDefaultOptions() {
    return {
      getGroupValue: (d: any) => d.group,
      shapeStyles: (v: any) => {
        return {};
      },
      shapeDraggable: true,
      extraPadding: 10,
    };
  }

  private initGroups() {
    const groups = {};
    this.originKeys = []; // originKeys 始终与Group的变化同步。
    const nodes = this.graph.getNodes().map((n: Node) => n.configs);
    for (const node of nodes) {
      const value = this.options.getGroupValue(node);
      if (value !== undefined && !groups[value]) {
        // value 为 undefined 为游离
        this.originKeys.push(value);
        groups[value] = [];
        groups[value].push(node);
      } else if (groups[value]) {
        groups[value].push(node);
      }
    }
    this.groups = groups;
  }

  private createShapes() {
    this.cleanShapes();
    this.groupShapes = {};
    for (const key of this.originKeys) {
      const shape = new Circle({ ...defaultShapeStyles, ...this.options.shapeStyles(key), groupValue: key });
      this.groupShapes[key] = shape;
      for (const event of EVENTS) {
        shape.on(event, (ev: any) => {
          shape.emit(`groupshape:${event}`, ev);
        });
      }
      for (const event of Object.keys(this._shapeEvents)) {
        // 订阅用户所定义的事件
        shape.on(event, this._shapeEvents[event]);
      }
      if (this.options.shapeDraggable) {
        setDragShape(shape, this.graph);
      }
      this.graph.getContainer().add(shape);
      shape.toBack();
    }
  }
  private cleanShapes() {
    for (const key of Object.keys(this.groupShapes)) {
      const shape = this.groupShapes[key];
      this.graph.getContainer().remove(shape);
    }
  }

  private initDummyGroupNodes() {
    const dummyGroupNodes = [] as any;
    this.groupsForForce = {};
    const nonGroupNodes = this.graph
      .getNodes()
      .map((node: any) => node.configs)
      .filter((node: any) => this.options.getGroupValue(node) === undefined); // 非 Group 的零落节点

    for (const node of nonGroupNodes) {
      const { x, y, width, height, r } = node;
      dummyGroupNodes.push({
        id: 'dummyGroupNodes_' + node.id,
        x,
        y,
        vx: 0,
        vy: 0,
        r: r ?? width + this.options.extraPadding,
        width: width + 10,
        height: height + 10,
      });
      this.groupsForForce['dummyGroupNodes_' + node.id] = [node];
    }
    for (const key of Object.keys(this.groups)) {
      const group = this.groups[key];
      const { x, y, width, height, r } = getGroupBox(group);
      const node = {
        id: key,
        x,
        y,
        r: r + this.options.extraPadding,
        width: width + this.options.extraPadding,
        height: height + this.options.extraPadding,
        vx: 0,
        vy: 0,
        combo: true,
      };
      dummyGroupNodes.push(node);
      this.groupsForForce[key] = group;
    }
    this.dummyGroupNodes = dummyGroupNodes;
  }
  private updateDummyGroupNodes() {
    this.initDummyGroupNodes();
  }

  private ConstructGroupVelocityFunc() {
    let iteration = 0;
    let thresholdIteration = 200;
    const force = new ForceCollision({
      options: { radius: (d: any) => d.r },
    });
    function reset(threshold?: number) {
      iteration = 0;
      if (threshold) {
        thresholdIteration = threshold;
      }
    }
    function setThreshold(threshold: number) {
      thresholdIteration = threshold;
    }
    function getIteration() {
      return iteration;
    }
    // 这里是希望当 iteration > thresholdIteration 的时候才进行 groupVelocity。
    // 一方面是减少计算量，另一方面是避免布局初始阶段被 groupVelocity 破坏初始的全局结构。

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    // 这种写法似乎不太好。
    // 但这里还是希望用户使用可以通过 xxx.groupVelocity.reset 等进行 groupVelocity 的操作

    // 透出给 fdp 调用
    function groupVelocity() {
      iteration++;
      if (iteration > thresholdIteration) {
        that.updateDummyGroupNodes();
        force.initialize(that.dummyGroupNodes); // 半径的更新
        force.run(); // 虚拟节点的无重叠力的计算
        that.dummyGroupNodes.forEach((dummyNode: any) => {
          const comboName = dummyNode.id;
          const group = that.groupsForForce[comboName];
          for (const node of group) {
            const similarity = cosineSim(
              [node.x - dummyNode.x, node.y - dummyNode.y],
              [dummyNode.vx, dummyNode.vy],
              dummyNode.r
            );
            const alpha = Math.max(0.4, Math.min(1.0, -2 * similarity));
            node.vx += alpha * dummyNode.vx;
            node.vy += alpha * dummyNode.vy;
          }
        });
      }
    }
    groupVelocity.reset = reset;
    groupVelocity.setThreshold = setThreshold;
    groupVelocity.getIteration = getIteration;

    return groupVelocity;
  }

  updateShapes() {
    for (const key of Object.keys(this.groups)) {
      const shape = this.groupShapes![key];
      const group = this.groups[key];
      const { x, y, r } = getGroupBox(group, false);
      shape.set('cx', x || 400);
      shape.set('cy', y || 300);
      shape.set('r', r || 0);
      const matrix = shape.getMatrix();
      matrix[4] = 0;
      matrix[5] = 0;
      shape.setMatrix(matrix);
    }
  }

  // 数据更新
  updateData(graph: Graph) {
    this.graph = graph;
    this.initGroups();
    this.createShapes();
    this.groupVelocity.reset();
  }

  getGroups() {
    return this.groups;
  }
  getGroup(filter: (key: any) => boolean) {
    const groups = {};
    for (const key of this.originKeys) {
      if (filter(key)) {
        groups[key] = this.groups[key];
      }
    }
    return groups;
  }
  getAllGroupShapes() {
    return this.groupShapes;
  }
  getGroupShapes(filter: (key: any) => boolean) {
    const shapes = {};
    for (const key of this.originKeys) {
      if (filter(key)) {
        shapes[key] = this.groupShapes[key];
      }
    }
    return shapes;
  }
  hideShape(filter: (key: any) => boolean) {
    for (const key of this.originKeys) {
      if (filter(key)) {
        this.groupShapes[key].hide();
      }
    }
  }
  showShape(filter: (key: any) => boolean) {
    for (const key of this.originKeys) {
      if (filter(key)) {
        this.groupShapes[key].show();
      }
    }
  }

  setGetGroupValue(func: (nodeData: any) => any) {
    this.options.getGroupValue = func;
    this.initGroups();
    this.createShapes();
  }

  setOptions(options: {
    getGroupValue?: (nodeData: any) => any;
    shapeStyles?: (groupValue: any) => any;
    shapeDraggable?: boolean;
    extraPadding?: number;
  }) {
    this.mergeOptions(options);
    if (options.getGroupValue) {
      this.initGroups();
      this.createShapes();
    }
    if (options.shapeStyles) {
      this.createShapes();
    }
  }
  // moveNodes() {
  // 先不实现，后续有需求再实现
  // 是否有场景不会通过fdp调用？如果有，可以通过 moveNodes 来执行类似 fdp.moveNodes 的操作，将速度转变为位移。
  // }

  on(type: string, callback: any) {
    if (this._shapeEvents[type]) {
      this.off(type);
    }
    this._shapeEvents[type] = callback;
    for (const [, shape] of Object.entries(this.groupShapes)) {
      shape.on(type, callback);
    }
  }
  off(type: string) {
    if (this._shapeEvents[type]) {
      const callback = this._shapeEvents[type];
      for (const [, shape] of Object.entries(this.groupShapes)) {
        shape.off(type, callback);
      }
    }
    this._shapeEvents[type] = undefined;
  }
}

let dragging = null as any;
function setDragShape(shape: ShapeBase, graph: Graph) {
  function onMouseDown(ev: GraphEvent) {
    // const target = shape;
    if (dragging && !dragging.timeout) {
      return;
    }
    dragging = {};
    dragging.timeout = setTimeout(() => {
      dragging = {
        shape,
      };
      shape.emit('groupshape:dragstart', {
        ...ev,
        clientX: ev.clientX,
        clientY: ev.clientY,
        target: shape,
      });
    }, 200);
    shape.configs.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    if (!shape.configs.originPositions) {
      shape.configs.originPositions = {
        x: ev.clientX,
        y: ev.clientY,
      };
    }
  }
  function onMouseEnter(ev: GraphEvent) {
    if (dragging) {
      shape.emit('groupshape:dragenter', {
        ...ev,
        clientX: ev.clientX,
        clientY: ev.clientY,
        target: shape,
      });
    }
  }
  function onMouseLeave(ev: GraphEvent) {
    if (dragging) {
      shape.emit('groupshape:dragleave', {
        ...ev,
        clientX: ev.clientX,
        clientY: ev.clientY,
        target: shape,
      });
    }
  }

  function onMouseMove(ev: GraphEvent) {
    if (!dragging || shape !== dragging.shape) {
      return;
    }
    const refresh = isDragDist(shape.configs.lastPositions, ev);
    if (refresh) {
      ev.target = shape as any;
      updatePosition(ev);
      shape.emit('groupshape:drag', {
        ...ev,
        clientX: ev.clientX,
        clientY: ev.clientY,
        target: shape,
      });
      graph.draw();
    }
  }
  function updatePosition(ev: GraphEvent) {
    const { x, y } = shape.configs.lastPositions;
    const scale = graph.getZoomRatio();
    const offsetX = (ev.clientX - x) / scale;
    const offsetY = (ev.clientY - y) / scale;
    shape &&
      (shape.configs.lastPositions = {
        x: ev.clientX,
        y: ev.clientY,
      });
    shape?.translate(offsetX, offsetY);
  }
  function onMouseUp(ev: GraphEvent) {
    if (!dragging || shape !== dragging.shape) {
      if (dragging?.timeout) {
        clearTimeout(dragging.timeout);
      }
      return;
    }
    dragging = null;
    updatePosition(ev);
    shape.emit('groupshape:drop', {
      ...ev,
      clientX: ev.clientX,
      clientY: ev.clientY,
      target: shape,
    });
    shape.configs.lastPositions = undefined;
    shape.configs.originPositions = undefined;
    graph.refresh();
    graph.draw();
    return;
  }
  shape.on('mousedown', onMouseDown);
  shape.on('mouseenter', onMouseEnter);
  shape.on('mouseleave', onMouseLeave);
  // 为提升体验，mousemove 应当是全局的而不仅仅是响应shape的。
  graph.on('mousemove', onMouseMove);
  document.body.addEventListener('mouseup', onMouseUp as any);
}

function cosineSim(vec1: number[], vec2: number[], r: number) {
  const dotProduct = vec1[0] * vec2[0] + vec1[1] * vec2[1];
  const m2 = Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1]);
  if (dotProduct === 0) {
    return 0;
  }
  return dotProduct / (r * m2);
}
function getGroupBox(group: any[], withVelocity = true) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const node of group) {
    minX = Math.min(minX, node.x + +withVelocity * node.vx - node.width / 2);
    maxX = Math.max(maxX, node.x + +withVelocity * node.vx + node.width / 2);
    minY = Math.min(minY, node.y + +withVelocity * node.vy - node.height / 2);
    maxY = Math.max(maxY, node.y + +withVelocity * node.vy + node.height / 2);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    width,
    height,
    r: Math.sqrt(width * width + height * height) / 2,
  };
}
