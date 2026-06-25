// import { Edge, Graph, GraphEvent, Shape, Node, autoTranslate, Layer } from '@dp/topo';
import { Graph } from "../../graph";
import { IntersectUtil, Layer, Shape } from "../../renderer";
import { Node, Edge, Group } from "../../models/entities";
import { GraphEvent } from "../../typings/event";
import { GRAPH_EVENTS } from "../../consts/meta_events";
import { autoTranslate } from "../../behaviors/auto_translate";
import { isDragDist } from "../../utils";
import { ComponentBase } from "../base";
import { getMagnetAnchor } from "../../utils/behavior";

import { Stack } from "../stack";
import { Router } from "../router";
import { AnchorConfigs } from "../../typings/model";
import { ENTITY_TYPES, DOM_ANCHOR_SELECTOR } from "../../consts/entity_types";
import { isNodeShape } from "../../utils/shape";

export type EdgeEditorOptions = {
  /**
   * When the mouse touches graph edge, canvas will translate accordingly.
   * 鼠标触边时触发画布平移
   */
  autoTranslate?: boolean;
  /**
   * Whether to allow connecting to groups.
   * 是否开启连接到分组
   */
  group?: boolean;
  /**
   * Styles of the temporary edge during the dragging process.
   * 拖拽过程中临时连线的样式
   */
  tempEdgeStyles?: Record<string, unknown>;
  /**
   * The Router component instance.
   * 智能路由组件实例
   */
  router?: Router;
  /**
   * The Stack component instance.
   * 操作栈组件实例
   */
  stack?: Stack;
  /**
   * Whether to automatically snap to the closest anchor.
   * 是否自动吸附锚点
   */
  magnet?: boolean;
  /**
   * The minimum distance between mouse and the anchor to be snapped.
   * 自动吸附锚点的生效距离
   */
  magnetDist?: number;
  /**
   * Styles of the snapped anchor.
   * 被吸附锚点的样式
   */
  magnetAnchorStyles?: Record<string, unknown>;
  /**
   * Whether the selected edge can be edited
   * 是否可编辑连线的端点
   */
  editTerminal?: boolean;
  /**
   * Styles of anchors of the editing edge.
   * 处于连线编辑状态下连线两头锚点的样式
   */
  editAnchorStyles?: Record<string, unknown>;
  /**
   * Whether the edit should be triggered.
   * 判断是否可触发连线编辑
   */
  shouldTrigger?: (
    e: GraphEvent,
    shape: Shape,
    target: Node,
    edge?: Edge
  ) => boolean;
  /**
   * Whether the anchor can be snapped.
   * 判断是否可吸附
   */
  shouldMagnet?: (target: Node, anchor: AnchorConfigs, source: Node) => boolean;
  /**
   * Whether the edit can be complete.
   * 判断是否可完成编辑
   */
  shouldDrop?: (
    source: Node,
    target: Node,
    sourceAnchor: number,
    targetAnchor: number,
    edit: boolean
  ) => boolean;
  /**
   * A function will be called when the drag started.
   * 拖拽开始时触发的回调函数
   */
  onDragStart?: (node: Node, e: GraphEvent) => void;
  /**
   * The function triggered when passing through a node during the dragging process.
   * 拖拽过程中经过节点时触发的函数
   */
  onDragEnter?: (node: Node, e: GraphEvent) => void;
  /**
   * The function triggered when leaving a node during the dragging process.
   * 拖拽过程中离开节点时触发的函数
   */
  onDragLeave?: (node: Node, e: GraphEvent) => void;
  /**
   * The function continuously triggered during the dragging process.
   * 拖拽过程中持续触发的函数
   */
  onDrag?: (edge: Edge) => void;
  /**
   * The function triggered when the edit is complete.
   * 编辑完成的回调函数
   */
  onDrop?: (edge: Edge, edit: boolean) => void;
  /**
   * which anchors should be displayed during the dragging process.
   * 在拖拽过程中，哪些锚点应当显示
   */
  showAnchors?: (
    anchorConfigs: AnchorConfigs,
    anchorShape: Layer,
    node: Node,
    fromNode: Node
  ) => boolean;
  /**
   * Whether to allow dragging the edge to edit the node.
   * 是否允许直接拖拽连线来编辑节点
   */
  dragEdgeToEdit?: boolean;
  /**
   * Customize the configs of the edge to be added or updated.
   * 自定义新增/编辑的连线配置
   */
  getEdgeConfigs?: (
    configs: Record<string, string>,
    edit: boolean
  ) => Record<string, any>;
};

export class EdgeEditor extends ComponentBase {
  declare graph: Graph;
  router: Router | null = null; // Router
  stack: Stack | null = null; // Stack
  state = {
    target: null as Node | null,
    triggerShape: null as Shape | null,
    interval: null as null | ReturnType<typeof setInterval>,
    dragging: false,
    lastPositions: null as { x: number; y: number } | null,
    shape: null as Shape | null,
    startPoint: null as number[] | null,
    lastTarget: null as Node | null,
    lastShape: null as Shape | null,
    anchorIndex: undefined as number | undefined,
    edge: null as Edge | null,
    magnetAnchor: null as null | { shape: Shape; anchorConfigs: AnchorConfigs },
    anchorType: "target",
    edit: false,
    dragEdgeToEdit: false,
    // relatedTarget: null,
  };
  editLayer: Layer | null = null;
  constructor(graph: Graph, options: EdgeEditorOptions) {
    super(graph, options);
    this.graph = graph;
    if (options.router) {
      this.router = options.router;
    }
    if (options.stack) {
      this.stack = options.stack;
    }
  }
  getDefaultOptions() {
    return {
      autoTranslate: true,
      magnet: false,
      magnetDist: 28,
      editTerminal: true,
      shouldTrigger: () => {
        return true;
      },
      shouldDrop: (source: Node, target: Node) => {
        return !!source && !!target;
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
      tempEdgeStyles: {
        strokeStyle: "#3073F2",
        lineDash: [4, 4],
      },
      showAnchors: (anchor: Layer, node: Node) => true,
      shouldMagnet(target: Node, anchor: AnchorConfigs) {
        return true;
      },
    };
  }
  getEvents() {
    const events: Record<string, string> = {
      "node:mousedown": "onMouseDown",
      "node:mouseenter": "onMouseEnter",
      "node:mouseleave": "onMouseLeave",
      mousemove: "onMouseMove",
    };
    if (this.options.editTerminal) {
      if (this.options.dragEdgeToEdit) {
        events["edge:mousedown"] = "onEdgeMouseDown";
        events["edge:mouseup"] = "onEdgeMouseUp";
      } else {
        events[GRAPH_EVENTS.STATE_END] = "onStateChange";
        events[GRAPH_EVENTS.BATCH_STATE_END] = "onStateChange";
      }
    }
    if (this.options.group) {
      events["group:mousedown"] = "onMouseDown";
      events["group:mouseenter"] = "onMouseEnter";
      events["group:mouseleave"] = "onMouseLeave";
    }
    return events;
  }
  getGlobalEvents() {
    return { mouseup: "onMouseUp" };
  }
  onMouseDown(ev: any) {
    if (!this._enable) {
      return;
    }
    if (ev.nativeEvent.button === 2) {
      return;
    }
    const target = ev.target;
    this.state.target = ev.target;
    this.state.triggerShape = ev.relatedTarget;
    let originEdge = null;
    if (this.options.editTerminal) {
      originEdge = this.state.edge;
    }
    if (originEdge) {
      const triggerShape = ev.relatedTarget;
      const type =
        this.state.target === originEdge.source ? "source" : "target";
      const anchorIndex = Number(
        triggerShape?.get
          ? triggerShape.get("anchorIndex")
          : triggerShape
              ?.closest(DOM_ANCHOR_SELECTOR)
              ?.getAttribute("anchorindex")
      );

      if (
        (target !== originEdge.source && target !== originEdge.target) || // 不是连线上的节点不可编辑
        // 连接锚点不匹配不可编辑
        (originEdge.get(`${type}Anchor`) !== anchorIndex &&
          originEdge.get(`__${type}`) !== anchorIndex)
      ) {
        // 如果拖拽的并非该连线端点，则应该消除连线的选中状态，并进入新增逻辑。（主要出现在锚点的展示为 always 时）
        this.stack?.execute("select", { selections: [] });
        this.clearEdgeState();
      }
      this.state.edit = true;
    } else {
      this.state.edit = false;
    }
    this.state.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    this.state.lastTarget = ev.target; // 初始target应该从起始节点开始。而非 null 。
    target.set("disableNodeEvent", true);
  }
  onEdgeMouseDown(ev: GraphEvent) {
    const edge = ev.target as Edge;
    const { x, y } = this.graph.clientToCanvas(ev.clientX, ev.clientY);
    const { startPoint, endPoint } = edge.getTerminal();
    let target = edge.target as Node;
    let anchorIndex = edge.get("__target");
    if (
      (x - startPoint[0]) ** 2 + (y - startPoint[1]) ** 2 <
      (x - endPoint[0]) ** 2 + (y - endPoint[1]) ** 2
    ) {
      target = edge.source as Node;
      anchorIndex = edge.get("__source");
    }
    this.state.target = target;
    this.state.edge = edge;
    this.state.triggerShape = ev.relatedTarget!;
    this.state.triggerShape.set("anchorIndex", anchorIndex);
    this.state.edit = true;
    this.state.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    this.state.lastTarget = target as Node;
    target.set("disableNodeEvent", true);
  }
  onEdgeMouseUp() {
    if (!this.state.dragging) {
      this.state.lastPositions = null;
      this.state.target = null;
    }
  }
  onMouseEnter(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    if (this.state.dragging) {
      const node = ev.target as Node;
      this.options.onDragEnter!(node, ev);
      this.state.lastTarget = node;
    }
  }
  onMouseLeave(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    if (this.state.dragging) {
      this.options.onDragLeave!(ev.target as Node, ev);
      this.state.lastTarget = null;
    } else {
      this.graph.getCanvasDom().style.cursor = "default";
    }
  }
  onMouseMove(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    if (!this.state.lastPositions) {
      return;
    }
    this.state.lastShape = ev.relatedTarget!;
    const triggerShape = this.state.triggerShape;
    const refresh = isDragDist(this.state.lastPositions, ev);
    const graph = this.graph;
    if (!this.state.dragging) {
      if (refresh) {
        if (
          this.options.shouldTrigger!(
            ev,
            triggerShape!,
            this.state.target!,
            this.state.edge!
          )
        ) {
          this.graph.set("emitGraphEvents", false);
          const autoDraw = graph.disableAutoDraw();
          this.state.dragging = true;
          const anchorIndex = Number(
            triggerShape?.get
              ? triggerShape.get("anchorIndex")
              : triggerShape
                  ?.closest(DOM_ANCHOR_SELECTOR)
                  ?.getAttribute("anchorindex")
          );
          this.state.anchorIndex = anchorIndex;
          const target = this.state.target;
          const point = this.graph.clientToCanvas(ev.clientX, ev.clientY);
          graph.getNodes().forEach((node: Node) => {
            node.set("disableAnchors", true);
            node.set("disableIcons", true);
            node.showAnchors(this.options.showAnchors, target!);
          });
          if (this.options.group) {
            graph.getGroups().forEach((group: Group) => {
              group.set("disableAnchors", true);
              group.showAnchors(this.options.showAnchors, target!);
            });
          }
          if (triggerShape?.show) {
            triggerShape.show();
          }
          this.options.onDragStart!(target as Node, ev);
          // 新增连线
          if (!this.state.edge || !this.options.editTerminal) {
            this.state.edge = this.graph.add("edge", {
              ...this.options.tempEdgeStyles,
              source: this.state.target!.get("id"),
              sourceAnchor: anchorIndex,
              endPoint: [point.x, point.y],
            });
            this.state.anchorType = "target";
          } else {
            const edge = this.state.edge;
            // 编辑连线
            this.state.anchorType =
              this.state.target === edge.source ? "source" : "target"; // 自环有问题
            if (edge.source === edge.target) {
              if (edge.get("sourceAnchor") === anchorIndex) {
                this.state.anchorType = "source";
              } else if (edge.get("targetAnchor") === anchorIndex) {
                this.state.anchorType = "target";
              } else {
                console.error("EdgeEditor: edit error in the loop edge.");
              }
            }
            edge.configs[`origin${this.state.anchorType}Anchor`] =
              edge.configs[`${this.state.anchorType}Anchor`];
            edge.configs[`origin${this.state.anchorType}`] =
              edge.configs[this.state.anchorType];
            edge.configs.originCP = edge.configs.controlPoints;
            delete this.state.edge.configs[`${this.state.anchorType}Anchor`];
            delete this.state.edge[this.state.anchorType];
            if (this.options.editAnchorStyles && triggerShape?.get) {
              triggerShape?.set(triggerShape.get("_editStyleCache"));
              delete triggerShape.configs._editStyleCache;
            }
          }
          this.dealEdgeTempStyle(this.state.edge!, this.state.anchorType);
          this.state.edge!.setCapture(false);
          graph.enableAutoDraw(autoDraw);
        } else {
          this.state.target!.set("disableNodeEvent", false);
          this.state.target!.hideAnchors();
          return;
        }
      } else {
        return;
      }
    }
    if (refresh) {
      this.update(ev);
    }
    if (this.options.autoTranslate) {
      const edge = this.state.edge;
      if (!edge) {
        return;
      }
      const targetPoint =
        this.state.anchorType === "source" ? "startPoint" : "endPoint";
      this.clearInterval();
      const point = graph.clientToCanvas(ev.clientX, ev.clientY);
      this.state.interval = autoTranslate(
        graph,
        { left: point.x, top: point.y, width: 1, height: 1 },
        (x: number, y: number) => {
          const endPoint = edge.get(targetPoint);
          edge.set(targetPoint, [endPoint[0] - x, endPoint[1] - y]);
          edge.updatePosition();
          graph.draw();
        }
      );
    }
  }

  dealEdgeTempStyle(edge: Edge, type: string) {
    if (type === "source" && !edge.get("startArrow")) {
      edge.getKeyShape().set("startArrow", {
        type: "circle",
        width: 6,
        height: 6,
      });
      edge.set("_deleteTempStyle", "startArrow");
    } else if (type === "target" && !edge.get("endArrow")) {
      edge.getKeyShape().set("endArrow", {
        type: "circle",
        width: 6,
        height: 6,
      });
      edge.set("_deleteTempStyle", "endArrow");
    }
  }

  refreshMagnet(point: { x: number; y: number }) {
    const { magnetDist, shouldMagnet, group } = this.options;
    const { target } = this.state;
    const result = getMagnetAnchor(
      point,
      target!,
      this.graph,
      magnetDist,
      group
    );
    if (
      !result ||
      !shouldMagnet(
        result.node!,
        (result.node! as Node).get("anchors")[result.anchorIndex],
        target
      )
    ) {
      const lastTarget = this.state.lastTarget;
      if (!lastTarget) {
        return true;
      }
      this.recoverAnchorStyles();
      this.state.lastTarget = lastTarget;
      return true;
    }
    const node = result.node! as Node;
    const index = result?.anchorIndex;
    const configs = node?.get("anchors")[index];
    if (this.state.magnetAnchor) {
      if (configs === this.state.magnetAnchor.anchorConfigs) {
        return false;
      }
      this.recoverAnchorStyles();
    }
    const shape = node.layer.get("__anchors")?.[index];
    this.state.lastTarget = node;
    this.state.magnetAnchor = { shape, anchorConfigs: configs };
    const positions = node.getAnchorPositions();
    this.cacheAnchorStyles();
    if (this.state.anchorType === "source") {
      this.state.edge?.set("startPoint", positions[result.anchorIndex]);
    } else {
      this.state.edge?.set("endPoint", positions[result.anchorIndex]);
    }
    return false;
  }

  cacheAnchorStyles() {
    const magnetAnchorStyles = this.options.magnetAnchorStyles;
    const { shape, anchorConfigs } = this.state.magnetAnchor!;
    anchorConfigs.magnet = true;
    if (!shape) {
      return;
    }
    const cache = {};
    Object.keys(magnetAnchorStyles!).forEach((k: string) => {
      cache[k] = shape.get(k);
    });
    shape.set("__cacheMagnetStyles", cache);
    shape.set({ ...magnetAnchorStyles });
  }

  recoverAnchorStyles() {
    const configs = this.state.magnetAnchor;
    if (!configs) {
      return;
    }
    const { shape, anchorConfigs } = configs;
    anchorConfigs.magnet = false;
    this.state.magnetAnchor = null;
    this.state.lastTarget = null;
    if (!shape) {
      return;
    }
    shape.set(shape.get("__cacheMagnetStyles"));
    delete shape.configs.__cacheMagnetStyles;
  }

  update(ev: GraphEvent) {
    const graph = this.graph;
    const edge = this.state.edge!;
    const autoDraw = graph.disableAutoDraw();
    const magnet = this.options.magnet;

    this.state.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    const targetPoint =
      this.state.anchorType === "source" ? "startPoint" : "endPoint";
    const point = graph.clientToCanvas(ev.clientX, ev.clientY);
    let refresh = true;
    if (magnet) {
      refresh = this.refreshMagnet(point);
      graph.emit(GRAPH_EVENTS.CHANGE_ANCHOR);
    }
    if (refresh) {
      // 如果是从 magnet 脱离到 canvas 上的时候可能 lastTarget 还没消除
      // 如果 mousemove 事件的 relatedTarget 是 canvas 则是往节点外继续拖拽，清掉 lastTarget
      let { lastTarget } = this.state;
      if (magnet && lastTarget && !isNodeShape(ev.relatedTarget)) {
        lastTarget = null;
        this.state.lastTarget = null;
      }
      if (lastTarget) {
        edge.set(targetPoint, lastTarget.getLinkPoint([point.x, point.y]));
      } else {
        if (this.router) {
          // 有路由的情况下，端点对齐网格。
          const grid = this.router.grid;
          const step = grid!.getStep() || 10;
          if (point?.x) {
            point.x = Math.round(point.x / step) * step;
          }
          if (point?.y) {
            point.y = Math.round(point.y / step) * step;
          }
        }
        edge.set(targetPoint, [point.x, point.y]);
      }
    }
    if (this.router) {
      const ignoreMinDist =
        this.state.anchorType === "source" ? { start: true } : { end: true };
      this.router.updateEdgePath(
        edge,
        undefined,
        this.state.lastTarget ? {} : ignoreMinDist
      );
    }
    edge.updatePosition();
    this.options.onDrag!(edge);
    graph.enableAutoDraw(autoDraw);
  }

  onMouseUp(ev: GraphEvent) {
    if (!this._enable) {
      return;
    }
    const { edge, target, lastTarget, magnetAnchor } = this.state;
    const graph = this.graph;
    this.clearInterval();
    const autoDraw = graph.disableAutoDraw();
    if (!this.state.dragging) {
      target?.set("disableNodeEvent", false);
      graph.enableAutoDraw(autoDraw);
      this.graph.set("emitGraphEvents", true);
      this.state.target = null;
      this.state.lastPositions = null;
      return;
    }
    const targetPoint =
      this.state.anchorType === "source" ? "startPoint" : "endPoint";
    const point = edge?.get(targetPoint);
    const nodeAnchorIndex = point
      ? IntersectUtil.getNearestPoint(
          lastTarget?.getAnchorPositions?.() || [[]],
          point
        )
      : undefined;
    const targetAnchor = magnetAnchor
      ? magnetAnchor.anchorConfigs.index
      : nodeAnchorIndex;
    if (this.options.showAnchors) {
      graph.getNodes().forEach((node: Node) => {
        node.set("disableAnchors", false);
        node.set("disableIcons", false);
        node.hideAnchors();
      });
      if (this.options.group) {
        graph.getGroups().forEach((group: Group) => {
          group.set("disableAnchors", false);
          group.hideAnchors();
        });
      }
    }
    this.graph.set("emitGraphEvents", true);
    if (this.state.dragging && target) {
      target?.set("disableNodeEvent", false);
      this.recoverAnchorStyles();
      if (
        (this.state.anchorType === "target" &&
          !this.options.shouldDrop!(
            target,
            lastTarget!,
            edge!.get("sourceAnchor"),
            targetAnchor!,
            this.state.edit
          )) ||
        (this.state.anchorType === "source" &&
          !this.options.shouldDrop!(
            lastTarget!,
            target,
            targetAnchor!,
            edge!.get("targetAnchor"),
            this.state.edit
          ))
      ) {
        this.recoverEdge(edge);
      } else {
        const id = lastTarget ? lastTarget.get("id") : null;
        this.executeEdge(edge, id, targetAnchor);
      }
      graph.getCanvasDom().style.cursor = "default";
    }
    // CHANGE_ANCHOR 在 viewer 里是 throttle 重绘，可能编辑状态没清，强行清一次
    graph.emit(GRAPH_EVENTS.CHANGE_ANCHOR_END);
    graph.enableAutoDraw(autoDraw);
    this.state.target = null;
    this.state.dragging = false;
    this.state.lastPositions = null;
  }

  recoverEdge(edge: Edge | null) {
    if (!edge) {
      return;
    }
    const graph = this.graph;
    const { anchorType } = this.state;
    if (edge.get(`origin${anchorType}`) && this.options.editTerminal) {
      // 恢复原本连线
      this.recoverEditedEdge(edge);
    } else {
      // 新增连线
      graph.remove(edge!);
      // 避免两次从一个锚点拖出连线异常
      this.state.edge = null;
    }
  }

  recoverEditedEdge(edge: Edge, select = true) {
    const graph = this.graph;
    const { anchorType } = this.state;
    if (!this.options.editTerminal) {
      console.error(
        `Return from recover edited edge with source: ${edge.get(
          "source"
        )} & target: ${edge.get("target")}`
      );
      return;
    }
    edge.configs[`${this.state.anchorType}Anchor`] =
      edge.configs[`origin${this.state.anchorType}Anchor`];
    edge.configs[this.state.anchorType] =
      edge.configs[`origin${this.state.anchorType}`];
    edge.configs.controlPoints = edge.configs.originCP;
    delete edge.configs[`origin${this.state.anchorType}Anchor`];
    delete edge.configs[`origin${this.state.anchorType}`];
    delete edge.configs.originCP;
    delete edge.configs[
      this.state.anchorType === "source" ? "startPoint" : "endPoint"
    ];
    edge[anchorType] = graph.getNodeById(edge.configs[this.state.anchorType]);
    edge.updatePosition();
    const deleteStyle = edge.get("_deleteTempStyle");
    if (deleteStyle) {
      edge.getKeyShape().set(deleteStyle, undefined);
      delete edge.configs._deleteTempStyle;
    }
    // 编辑完成更新连线的时候仅需要恢复连线，更新锚点以后再选中节点
    select && this.stack?.execute("select", { selections: [edge] });
  }

  executeEdge(edge: Edge | null, targetId: string, targetAnchor?: number) {
    if (!edge) {
      return;
    }
    const graph = this.graph;
    const { anchorType, edit } = this.state;
    const configs = edge!.configs;
    const stack = this.stack;
    // 更新连线
    if (edit && this.options.editTerminal) {
      // 目前没有连线更新成游离连线的场景
      if (!targetId) {
        return;
      }
      let newConfigs: Record<string, unknown> = {};
      const otherAnchor = anchorType === "source" ? "target" : "source";
      newConfigs[anchorType] = targetId;
      newConfigs[`${anchorType}Anchor`] = targetAnchor;
      newConfigs.controlPoints = edge.get("controlPoints");
      newConfigs[otherAnchor] = edge.get(otherAnchor);
      newConfigs[`${otherAnchor}Anchor`] = edge.get(`${otherAnchor}Anchor`);
      delete newConfigs.__baseId;
      if (this.options.getEdgeConfigs) {
        newConfigs = this.options.getEdgeConfigs(newConfigs, edit);
      }
      this.recoverEditedEdge(edge, false);
      stack?.execute("update", {
        type: "edge",
        id: configs.id,
        configs: newConfigs,
      }) ?? edge.updateData(newConfigs);

      this.clearEdgeState();
      this.setEdgeState(edge);
      this.options.onDrop!(edge, edit);
    } else {
      // 新增连线
      Object.keys(this.options.tempEdgeStyles!).forEach((key: string) => {
        delete configs[key];
      });
      // 兼容拉出一根线再添加节点交互，允许先添加游离连线
      if (targetId) {
        delete configs.endPoint;
      }
      graph.remove(edge!);
      let newConfigs = {
        ...configs,
        target: targetId,
        targetAnchor,
      };
      if (this.options.getEdgeConfigs) {
        newConfigs = this.options.getEdgeConfigs(newConfigs, edit);
      }
      if (stack) {
        stack.execute("add", {
          type: "edge",
          configs: newConfigs,
        });
        const edge = graph.getEdgeById(graph.get("_selections").edge[0]);
        this.options.onDrop!(edge, edit);
      } else {
        const edge = graph.add("edge", newConfigs);
        this.options.onDrop!(edge, edit);
      }
    }
  }

  clearEdgeState() {
    const { edge } = this.state;
    const graph = this.graph;
    if (!edge) {
      return;
    }
    this.state.edge = null;
    const { source, target } = edge;
    edge.setCapture(true);
    if (!source || !target) {
      return;
    }
    graph.getNodes().forEach((node: Node) => {
      node.set("disableNodeEvent", false);
      node.hideAnchors();
    });
    if (this.options.group) {
      graph.getGroups().forEach((group: Group) => {
        group.set("disableNodeEvent", false);
        group.hideAnchors();
      });
    }

    // 恢复编辑态锚点样式
    const { __source, __target } = edge.configs;
    const sourceShape = source.layer.get("__anchors")?.[__source];
    const targetShape = target.layer.get("__anchors")?.[__target];
    if (!sourceShape || !targetShape || !this.options.editAnchorStyles) {
      return;
    }
    if (sourceShape.get("_editStyleCache")) {
      sourceShape.set(sourceShape.get("_editStyleCache"));
      delete sourceShape.configs._editStyleCache;
    }

    if (targetShape.get("_editStyleCache")) {
      targetShape.set(targetShape.get("_editStyleCache"));
      delete targetShape.configs._editStyleCache;
    }
    graph.draw();
    this.graph.emit(GRAPH_EVENTS.CHANGE_ANCHOR_END);
  }

  // 选中连线，编辑完连线更新，undo/redo 更新连线
  setEdgeState(target: Edge) {
    const graph = this.graph;
    this.state.edge = target;
    const sourceNode = target.source;
    const targetNode = target.target;
    if (!sourceNode || !targetNode) {
      return;
    }
    const { __source, __target } = target.configs;
    const sourceAnchors = sourceNode.layer.get("__anchors");
    const targetAnchors = targetNode.layer.get("__anchors");
    if (target.hasState("select")) {
      graph.getNodes().forEach((node: Node) => {
        node.set("disableNodeEvent", true);
      });
      // for react anchor state
      sourceNode.get("anchors")?.[__source] &&
        (sourceNode.get("anchors")[__source].visible = true);
      targetNode.get("anchors")?.[__target] &&
        (targetNode.get("anchors")[__target].visible = true);
      // for canvas anchor shape
      const sourceShape = sourceAnchors?.[__source];
      const targetShape = targetAnchors?.[__target];
      if (!sourceShape || !targetShape) {
        return;
      }
      sourceShape?.show();
      targetShape?.show();
      const anchorStyles = this.options.editAnchorStyles;
      if (anchorStyles) {
        this.cacheEditStyles(sourceShape, anchorStyles);
        this.cacheEditStyles(targetShape, anchorStyles);
      }
    }
  }

  cacheEditStyles(anchorShape: Shape, anchorStyles: Record<string, unknown>) {
    const cache: Record<string, unknown> = {};
    Object.keys(anchorStyles).forEach((key: string) => {
      cache[key] = anchorShape.get(key);
    });
    anchorShape.set(anchorStyles);
    anchorShape.set("_editStyleCache", cache);
  }

  onStateChange(e: { state: string; targets?: Edge[]; target: Edge }) {
    let target = e.targets || e.target;

    if (e.state !== "select") {
      return;
    }
    // 清除之前的 edge 遗留状态
    this.clearEdgeState();
    if (Array.isArray(target)) {
      if (target.length !== 1) {
        return;
      }
      target = target[0];
    }

    if (target.type !== ENTITY_TYPES.EDGE) {
      return;
    }
    this.setEdgeState(target);
    this.graph.draw();
    this.graph.emit(GRAPH_EVENTS.CHANGE_ANCHOR_END);
  }

  clearInterval() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
      this.state.interval = null;
    }
  }
}
