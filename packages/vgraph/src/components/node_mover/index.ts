import { Graph } from "../../graph";
import { BBox, Shape, IntersectUtil } from "../../renderer";
import { debounce, insertStyles, isDragDist } from "../../utils";
import { GRAPH_EVENTS } from "../../consts/meta_events";
import { autoTranslate } from "../../behaviors/auto_translate";
import { Edge, Node, Group } from "../../models/entities";
import { GraphEvent } from "../../typings/event";
import { ComponentBase } from "../base";

import { Stack } from "../stack";
import { Router } from "../router";
import { Snapline } from "./snapline";
import { getDuplicateEdgeConfigs } from "../../layouts/utils/duplicate_edges";

const GRABBING_CLS = "vgraph-grabbing";

export type NodeMoverOptions = {
  /**
   * The `autoTranslate` specifies whether the canvas should   automatically scroll when dragging a node out of the viewport.
   *
   * 默认开启。开启后，拖拽到视图边界后将自动平移画布以扩扩展视图边界。
   */
  autoTranslate?: boolean;
  /**
   * The `group` property specifies whether group can be dragged.
   *
   * 是否允许移动分组，默认为 false。
   */
  group?: boolean;
  /**
   * The `alignGrid` specifies whether the dragged node should always align to the grid after moving.
   *
   * 默认开启。开启后，拖拽节点的坐标将以网格大小的整数倍进行移动。
   */
  alignGrid?: boolean;
  /**
   * The `router` property is used to specify the intelligent routing component. When you pass a router
   * component to this property, moving nodes will trigger updates to the related `edges` for intelligent routing.
   *
   * 智能路由组件。传入后，移动节点将触发相关连线的智能路由更新。
   */
  router?: Router;
  /**
   * The `stack` property represents an operation stack. When this property is provided, it enables support for
   * undo and redo functionality for dragging nodes.
   *
   * 操作栈。传入后拖拽节点支持撤销重做。
   */
  stack?: Stack;
  /**
   * The `snapline` is used to configure alignment lines for snapping nodes to a grid or other alignment guides during dragging.
   *
   * 对齐线。
   */
  snapline?:
    | boolean
    | {
        styles?: Record<string, unknown>;
      };
  /**
   * The `debounce` specifies whether to use debouncing to update smart routing `edges` path.
   *
   * 默认关闭。是否开启路由更新的防抖。在移动的节点涉及较多连线时，连线的路由更新可能较为耗时，开启防抖配置可利于用户专注节点的拖拽避免频繁计算连线路由导致卡顿。
   */
  debounce?: boolean;
  /**
   * The `shouldTrigger` property is used to determine whether the drag operation should be triggered based on the event and shape provided.
   *
   * 返回是否应该进行拖拽。
   */
  shouldTrigger?: (e: GraphEvent, shape?: Shape) => boolean;
  /**
   * The `getLimitBox` property is used to define the bounding box that restricts the movement of the node within a specific range.
   *
   * 限制节点移动的范围。如果没有则可以任意移动。
   */
  getLimitBox?: (target: Node) => BBox | null;
  /**
   * The `shouldDrop` is a function that determines whether a node or group can be dropped in a specific location during a drag operation.
   *
   * 判断节点此时是否可放置。如果不可放置，则会回退至起始状态。
   */
  shouldDrop?: (e: GraphEvent, target?: Node) => boolean;
  /**
   * The `onDragStart` is a callback function that is triggered when the dragging of a node or group starts.
   *
   * 拖拽开始时触发的回调函数。
   */
  onDragStart?: (target: Node | Group, e: GraphEvent) => void;
  /**
   * The `onDragEnter` is a callback function that is triggered when the dragging process enters a node or group.
   *
   * 拖拽过程中进入节点/分组上方时触发的回调函数。
   */
  onDragEnter?: (target: Node | Group, e: GraphEvent) => void; //  FIXME: React Viewer 需要适配。 TODO: capture 为 false 的节点， dom 应该也不被捕获。
  /**
   * The `onDragLeave` is a callback function that is triggered when the dragging process moves away from a node or group.
   *
   * 拖拽过程中离开节点/分组上方时触发的回调函数。
   */
  onDragLeave?: (target: Node | Group, e: GraphEvent) => void;
  /**
   * The `onDrag` is a callback function that is triggered during the dragging process of a node or group.
   *
   * 拖拽过程中触发的回调函数。
   */
  onDrag?: (target: Node | Group, offsetX: number, offsetY: number) => void;
  /**
   * The `onDrop` is a callback function that is triggered after a node or group has been successfully dropped or placed in a new position.
   *
   * 拖拽完成后触发的回调函数。
   */
  onDrop?: (target: Node | Group) => void;
  /**
   * The `onDropFail` is a callback function that is triggered when a node or group is not successfully dropped due to the `shouldDrop` function returning false.
   *
   * 如果 shouldDrop 为 false，则放置失败，此时会触发该回调函数。
   */
  onDropFail?: (target: Node | Group) => void; //
};

export class NodeMover extends ComponentBase {
  router: Router | null = null; // Router
  stack: Stack | null = null; // Stack
  snapline: Snapline | null = null;
  isBatch = false; // 是否批量操作
  state = {
    target: null as Node | Group | null,
    nodes: null as Node[] | null,
    edges: null as Edge[] | null,
    groups: null as Group[] | null,
    triggerShape: null as Shape | null,
    interval: null as ReturnType<typeof setInterval> | null,
    dragging: false,
    lastPositions: null as { x: number; y: number } | null,
    originPositions: null as { x: number; y: number } | null,
    shape: null as Shape | null,
    draggingTimer: null as NodeJS.Timer | null,
    surplusOffset: { x: 0, y: 0 },
    debounce: false,
    limitBox: null,
    group: null,
    shapeBox: { left: 0, top: 0, width: 0, height: 0 },
  };
  stackArgs = {
    batch: false,
    targetId: undefined as string | undefined,
    lastPositions: {} as Record<string, { x: number; y: number }>,
    originMatrix: [1, 0, 0, 1, 0, 0],
    originPositions: {} as Record<string, { x: number; y: number }>,
    originGroupBox: {} as Record<
      string,
      { left: number; top: number; width: number; height: number }
    >,
    edgeOriginControlPointsMap: {} as Record<
      string,
      number[] | null | undefined
    >, // <id, controlPoints>
  };
  constructor(graph: Graph, options: NodeMoverOptions) {
    super(graph, options);
    if (options.router) {
      this.router = options.router;
    }
    if (options.stack) {
      this.stack = options.stack;
    }
    if (options.snapline !== false) {
      this.snapline = new Snapline(
        graph,
        options.snapline === true ? {} : options.snapline
      );
    }
    insertStyles(`
    .${GRABBING_CLS} {
      cursor: move!important;
      cursor: -webkit-grabbing!important;
      cursor:grabbing!important;
    }
    `);
    graph.set("_nodeMover", this);
  }

  getDefaultOptions() {
    return {
      autoTranslate: true,
      group: false,
      alignGrid: true,
      // 节点是否可以拖拽
      shouldTrigger: () => {
        return true;
      },
      // 限制节点活动范围
      getLimitBox: () => {
        return null;
      },
      // 节点是否可以被放置到当前为止
      shouldDrop: () => {
        return true;
      },
      onDragStart: () => {
        return;
      },
      onDragEnter: () => {
        return;
      },
      onDragLeave: () => {
        return;
      },
      onDrag: () => {
        return;
      },
      onDrop: () => {
        return;
      },
      onDropFail: () => {
        return;
      },
    };
  }
  getEvents() {
    let groupEvents = {};
    if (this.options.group) {
      groupEvents = {
        "group:mousedown": "onMouseDown",
      };
    }
    return {
      ...groupEvents,
      "node:mousedown": "onMouseDown",
      "node:mouseenter": "onMouseEnter",
      "node:mouseleave": "onMouseLeave",
      mousemove: "onMouseMove",
    };
  }
  getGlobalEvents() {
    return { mouseup: "onMouseUp" };
  }

  onMouseDown(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    const target = ev.target as Node;
    this.isBatch = false;
    this.state.target = target;
    this.state.triggerShape = ev.relatedTarget!;
    this.state.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
  }

  snapshot() {
    const target = this.state.target!;
    const { graph, stackArgs } = this;
    this.state.originPositions = {
      x: target.get("x"),
      y: target.get("y"),
    };
    const id = target.get("id");
    // 多选情况下 brushSelect 选中节点不选中分组，这时候拖拽节点分组是对应变大小。因此批量拖拽节点出分组不在默认交互中。
    // 当分组中所有节点都被选中时，则是分组整体平移。所以要存下节点所在的组，每次移动 refreshBox 一次。
    // TODO: 节点加入 & 移出分组 demo 实现 && brushSelect group & node 选中区分
    let nodeSelections = graph.get("_selections")?.node || [];
    let groupSelections = graph.get("_selections")?.group || [];
    if (target.type === "node" && !nodeSelections.includes(id)) {
      this.stack?.execute("select", { selections: [target] });
      nodeSelections = [id];
      groupSelections = [];
    } else if (target.type === "group" && !groupSelections.includes(id)) {
      // 处理直接拖拽单个分组的情况
      this.stack?.execute("select", { selections: [target] });
      nodeSelections = [];
      groupSelections = [id];
    }
    const nodes: Node[] = [];
    const groups: Group[] = [];
    const edges: Edge[] = [];
    // for stack
    const visit = {};
    const groupMap = {};
    // 清空 stackArgs 状态。
    stackArgs.edgeOriginControlPointsMap = {};
    stackArgs.originPositions = {};
    stackArgs.lastPositions = {};
    stackArgs.originGroupBox = {};
    function getEdgesSnapshot(entity: Node | Group) {
      for (const edge of entity.edges) {
        if (!visit[edge.get("id")]) {
          visit[edge.get("id")] = true;
          edges.push(edge);
          stackArgs.edgeOriginControlPointsMap[edge.get("id")] = edge
            .get("controlPoints")
            ?.map((d: number[]) => [d[0], d[1]]);
        }
      }
    }

    function getNodeSnapshot(nodeId: string, addGroup = true) {
      const node = graph.getNodeById(nodeId);
      nodes.push(node);
      stackArgs.originPositions[nodeId] = {
        x: node.get("x"),
        y: node.get("y"),
      };
      if (addGroup && node.belong) {
        getParentSnapshot(node);
      }
      getEdgesSnapshot(node);
    }

    function getParentSnapshot(entity: Node | Group) {
      if (entity.belong) {
        let group = entity;
        while (group.belong) {
          group = group.belong;
          getGroupSnapshot(group.get("id"), false);
        }
      }
    }

    function getGroupSnapshot(groupId: string, addChildren = true) {
      const group = graph.getGroupById(groupId);
      if (groupMap[groupId]) {
        return;
      }
      groupMap[groupId] = true;
      groups.push(group);
      stackArgs.originGroupBox[groupId] = group.getBBox();
      if (!addChildren) {
        return;
      }
      // TODO 目前没有 group 连线的场景，router 支持？
      // getEdgesSnapshot(group);
      for (const child of group.children) {
        if (child.type === "node") {
          getNodeSnapshot(child.get("id"), false);
        } else {
          getGroupSnapshot(child.get("id"));
        }
      }
      getEdgesSnapshot(group);
    }
    for (const nodeId of nodeSelections) {
      getNodeSnapshot(nodeId);
    }
    for (const groupId of groupSelections) {
      getGroupSnapshot(groupId);
      const group = graph.getGroupById(groupId);
      getParentSnapshot(group);
    }
    stackArgs.originMatrix = graph.getMatrix().concat([]);
    this.state.nodes = nodes;
    this.state.edges = edges;
    this.state.groups = groups;
    this.isBatch = nodes.length > 1;
    this.state.debounce =
      this.options.debounce === true ||
      (!!this.router &&
        (edges.length >= 15 || this.graph.getNodes().length > 200));
  }

  onMouseEnter(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    if (this.state.dragging) {
      this.options.onDragEnter(ev.target, ev);
    }
  }

  onMouseLeave(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    if (this.state.dragging) {
      this.options.onDragLeave(ev.target, ev);
    } else {
      this.graph.getCanvasDom().classList.remove(GRABBING_CLS);
    }
  }

  onMouseMove(ev: GraphEvent) {
    if (!this._enable || !this.state.lastPositions) {
      return;
    }
    const graph = this.graph;
    const refresh = isDragDist(this.state.lastPositions, ev);
    if (!this.state.dragging) {
      if (refresh) {
        const target = this.state.target as any;
        ev.target = target;
        if (this.options.shouldTrigger(ev, this.state.triggerShape)) {
          this.snapshot();
          this.state.limitBox = this.options.getLimitBox(target);
          // graph.emitEvent(GRAPH_EVENTS.MOVE_START, { target: ev.target });
          graph.emitEvent(GRAPH_EVENTS.MOVE_START, {
            batch: this.isBatch,
            targets: this.state.nodes,
          });
          this.state.dragging = true;
          // 缓存当前移动对象的整体 bbox
          this.getShapeBox();
          this.options.onDragStart(this.state.target, ev);
          this.graph.getCanvasDom().classList.add(GRABBING_CLS);
          this.state.target!.setCapture(false);
        } else {
          this.state.lastPositions = null;
          return;
        }
      } else {
        return;
      }
    }
    if (refresh) {
      this.updatePosition(ev);
    }
    if (this.options.autoTranslate && !(ev as any).mock) {
      this.clearInterval();
      this.state.interval = autoTranslate(
        graph,
        this.state.shapeBox,
        (x: number, y: number) => {
          const { moveX, moveY } = this.limitMove(-x, -y);
          this.state.target && this.updateNodes(moveX, moveY);
        }
      );
    }
  }

  getShapeBox() {
    const shapeBox = this.state.target!.getBBox();
    if (this.isBatch) {
      let { left, top } = shapeBox;
      const { width, height } = shapeBox;
      let right = left + width;
      let bottom = top + height;
      const nodes = this.state.nodes!;
      for (const node of nodes) {
        if (!node || node.isDestroyed()) {
          continue;
        }
        const bbox = node.getBBox();
        left = Math.min(bbox.left, left);
        right = Math.max(bbox.left + bbox.width, right);
        top = Math.min(bbox.top, top);
        bottom = Math.max(bbox.top + bbox.height, bottom);
      }
      shapeBox.left = left;
      shapeBox.top = top;
      shapeBox.width = right - left;
      shapeBox.height = bottom - top;
    }
    this.state.shapeBox = {
      ...shapeBox,
    };
  }

  updatePosition(ev: GraphEvent) {
    const { x, y } = this.state.lastPositions!;

    const scale = this.graph.getZoomRatio();
    const offsetX = (ev.clientX - x) / scale + this.state.surplusOffset.x;
    const offsetY = (ev.clientY - y) / scale + this.state.surplusOffset.y;
    this.state.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    const { moveX, moveY } = this.limitMove(offsetX, offsetY, ev);
    this.updateNodes(moveX, moveY);
  }

  limitMove(offsetX: number, offsetY: number, ev?: GraphEvent) {
    let moveX = offsetX;
    let moveY = offsetY;
    if (this.router && this.options.alignGrid) {
      const step = this.router.grid?.gridData.step ?? 10;
      moveX = Math.round(offsetX / step) * step;
      moveY = Math.round(offsetY / step) * step;
    }
    const target = this.state.target!;
    const limitBox = this.state.limitBox;
    if (limitBox) {
      const { left, top, width, height } = limitBox;
      const bbox = target.getBBox();
      // 正常拖拽的情况下，先判断鼠标位置
      if (ev) {
        const point = this.graph.clientToCanvas(ev.clientX, ev.clientY);
        if (point.x < left) {
          moveX = left - bbox.left;
        } else if (point.x > left + width) {
          moveX = left + width - bbox.left - bbox.width;
        }
        if (point.y < top) {
          moveY = top - bbox.top;
        } else if (point.y > top + height) {
          moveY = top + height - bbox.top - bbox.height;
        }
      }
      // autoTranslate & 鼠标位置合法情况下判断位移
      if (bbox.left + moveX < left) {
        moveX = left - bbox.left;
      } else if (bbox.left + bbox.width + moveX > left + width) {
        moveX = left + width - bbox.left - bbox.width;
      }
      if (bbox.top + moveY < top) {
        moveY = top - bbox.top;
      } else if (bbox.top + bbox.height + moveY > top + height) {
        moveY = top + height - bbox.top - bbox.height;
      }
    }
    if (this.options.alignGrid) {
      this.state.surplusOffset.x = offsetX - moveX;
      this.state.surplusOffset.y = offsetY - moveY;
    }
    return { moveX, moveY };
  }

  debounceRouter: () => void = debounce(() => {
    this.updateEdgePaths();
  }, 16);

  updateEdgePaths() {
    const edges = this.state.edges!;
    for (const edge of edges) {
      if (edge.get("__baseId")) {
        const baseEdge = this.graph.getEdgeById(edge.get("__baseId"));
        getDuplicateEdgeConfigs(baseEdge, edge.configs, edge.get("__count"));
      } else {
        this.router?.updateEdgePath(edge);
      }

      edge.updatePosition();
    }
  }

  updateNodes(offsetX: number, offsetY: number) {
    if (offsetX === 0 && offsetY === 0) {
      return;
    }
    const graph = this.graph;
    const target = this.state.target!;
    const { nodes, edges, groups, shapeBox, lastPositions } = this.state;

    const autoDraw = graph.disableAutoDraw();
    const selectedNode = {};
    for (const node of nodes!) {
      selectedNode[node.get("id")] = true;
      node.configs.x += offsetX;
      node.configs.y += offsetY;
      node.layer.set({
        x: node.configs.x,
        y: node.configs.y,
      });
    }

    shapeBox.left += offsetX;
    shapeBox.top += offsetY;

    const groupMap = {};
    for (const group of groups!) {
      groupMap[group.get("id")] = true;
      if (group.children.length === 0 && group.hasState("select")) {
        const { fixLeft, fixTop } = group.configs;
        if (fixLeft !== undefined) {
          group.set("fixLeft", fixLeft + offsetX);
        }
        if (fixTop !== undefined) {
          group.set("fixTop", fixTop + offsetY);
        }
      }
      group.refreshBox();
    }

    // 开启 group 的时候判断 group 的 intersect
    if (this.options.group) {
      let result: Group | null = null;
      let dist = 0;
      const point = graph.clientToCanvas(lastPositions!.x, lastPositions!.y);
      graph.getGroups().forEach((group: Group) => {
        if (groupMap[group.get("id")]) {
          // 正被拖拽的group，不处理
          return;
        }
        const bbox = group.getBBox();
        if (IntersectUtil.isRectIntersect(shapeBox, bbox)) {
          const currentDist = IntersectUtil.pointToRectDist(point, bbox);
          // 没有找到相交的 group，直接置对象
          if (!result) {
            result = group;
            dist = currentDist;
            // 已有相交，找离鼠标最近的
          } else if (dist > currentDist) {
            result = group;
            dist = currentDist;
          }
        }
      });
      if (!result && this.state.group) {
        this.options.onDragLeave(this.state.group);
      } else if (result && !this.state.group) {
        this.options.onDragEnter(result);
      } else if (result !== this.state.group) {
        this.options.onDragLeave(this.state.group);
        this.options.onDragEnter(result);
      }
      this.state.group = result;
    }

    graph.emitEvent(GRAPH_EVENTS.MOVING, {
      batch: this.isBatch,
      targets: nodes,
      offsetX,
      offsetY,
    });
    // source 和 target 都被选中，则连线的控制点随之一起平移。
    if (this.state.debounce) {
      for (const edge of edges!) {
        const sourceId = edge.get("source");
        const targetId = edge.get("target");
        if (selectedNode[sourceId] && selectedNode[targetId]) {
          const controlPoints = edge.get("controlPoints");
          if (controlPoints && controlPoints.length > 0) {
            for (const point of controlPoints) {
              point[0] += offsetX;
              point[1] += offsetY;
            }
          }
          edge.set("controlPoints", controlPoints);
        }
        edge.updatePosition();
      }
      this.router && this.debounceRouter();
    } else {
      this.updateEdgePaths();
    }

    this.options.onDrag(target, offsetX, offsetY);
    this.graph.enableAutoDraw(autoDraw);
  }

  onMouseUp(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    const target = this.state.target!;
    const graph = this.graph;
    let shouldDrop = false;
    this.clearInterval();
    const nodes = this.state.nodes!;
    if (this.state.dragging) {
      const autoDraw = this.graph.disableAutoDraw();
      const edgeMap = this.stackArgs.edgeOriginControlPointsMap;
      const groupMap = this.stackArgs.originGroupBox;
      target.setCapture(true);
      //  target 不可捕获后, ev.target 无法拿到移动的节点，所以这里需要添加 target 作为入参
      if (!this.options.shouldDrop(ev, target)) {
        for (const node of nodes) {
          if (!node || node.isDestroyed()) {
            continue;
          }
          const { x, y } = this.stackArgs.originPositions[node.get("id")];
          node.updatePosition(x, y);
          const edges = node.edges;
          for (const edge of edges) {
            edge.set("controlPoints", edgeMap[edge.get("id")]);
            edge.updatePosition();
          }
        }
        for (const group of this.state.groups!) {
          const id = group.get("id");
          group.setBBox(groupMap[id]);
        }
      } else {
        shouldDrop = true;
        this.updateEdgePaths();
        if (this.stack) {
          for (const node of nodes) {
            if (!node || node.isDestroyed()) {
              continue;
            }
            this.stackArgs.lastPositions[node.get("id")] = {
              x: node.get("x"),
              y: node.get("y"),
            };
          }
          this.stack.execute("moveNode", this.stackArgs);
        }
      }

      this.graph.enableAutoDraw(autoDraw);
      graph.emitEvent(GRAPH_EVENTS.MOVE_END, {
        batch: this.isBatch,
        targets: nodes,
      });

      //  因为 Grid 需要 MOVE_END 后才更新，所以最后再 onDrop
      if (shouldDrop) {
        this.options.onDrop(target);
      } else {
        this.options.onDropFail(target);
      }
      graph.getCanvasDom().classList.remove(GRABBING_CLS);
      this.state.surplusOffset = {
        x: 0,
        y: 0,
      };
    }
    this.state.group = null;
    this.state.target = null;
    this.state.dragging = false;
    this.state.lastPositions = null;
  }

  clearInterval() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
      this.state.interval = null;
    }
  }
  beforeDestroy() {
    this.snapline?.destroy();
    this.state = {
      target: null as Node | null,
      triggerShape: null as Shape | null,
      interval: null,
      nodes: null,
      edges: null,
      groups: null,
      dragging: false,
      lastPositions: null as { x: number; y: number } | null,
      originPositions: null as { x: number; y: number } | null,
      shape: null as Shape | null,
      draggingTimer: null,
      surplusOffset: { x: 0, y: 0 },
      debounce: false,
      limitBox: null,
      group: null,
      shapeBox: { left: 0, top: 0, width: 0, height: 0 },
    };
  }
}
