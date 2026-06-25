/* eslint-disable no-restricted-globals */
import {
  BBox,
  GroupLayer,
  Layer,
  Rect,
  Text,
  ShapeBase,
  Icon,
  IntersectUtil,
} from "../../renderer";
import { normalizePadding } from "../../utils";
import {
  AnchorConfigs,
  GroupConfigs,
  GroupTitleConfigs,
} from "../../typings/model";
import { ENTITY_TYPES } from "../../consts/entity_types";
import { EVENTS, GRAPH_EVENTS } from "../../consts/meta_events";
import { Node } from "./node";
import { Edge } from "./edge";
import { Entity } from "./entity";
import LAYER_TYPES from "../../consts/layer_types";
import { ShapeEvent } from "../../typings/event";
import { getAnchorMethods } from "../factories";

const DEFAULT_TITLE_HEIGHT = 46;
const DEFAULT_TITLE_WIDTH = 104;
export interface IGroup {
  configs: GroupConfigs;
  layer: GroupLayer;
  keyShape: ShapeBase;
  children: (Node | Group)[];
  belong: IGroup | null;

  addChild: (child: Node | Group) => void;
  removeChild: (child: Node | Group) => void;
  isEmpty: () => void;

  getAnchorShapes: () => ShapeBase[] | null;
  getAnchorConfigs: () => AnchorConfigs[];
  getAnchorPoints: () => number[][];

  setState: (state: string, onlyState: boolean) => void;
  removeState: (state: string) => void;
  clearStates: () => void;

  collapse: (animate?: boolean) => void;
  expand: (animate?: boolean) => void;

  show: () => void;
  hide: () => void;
  isVisible: () => boolean;

  clear: () => void;
  destroy: () => void;
}

export class Group extends Entity {
  type = ENTITY_TYPES.GROUP;
  // configs: GroupEntityConfigs = {id: undefined as unknown as string}; // TODO, 先避免ts报错， 后续收敛到 getEntityId
  children: (Node | Group)[] = [];
  belong: Group | null = null;
  bbox: BBox | null = null;
  edges: Edge[] = [];
  visible = true;

  background: Rect | null;
  titleLayer: Layer | null;
  titleHeight = 0;
  titleWidth = 0;
  sources: string[] = [];
  targets: string[] = [];

  constructor(
    configs: GroupConfigs,
    graph: any,
    container: Layer,
    temp?: boolean
  ) {
    super(configs, graph, container, temp);
    this.set("collapsed", false);
    if (temp) {
      this.background = null;
      this.titleLayer = null;
      return;
    }
    const { background, titleLayer } = this.initContent(this.layer, configs);
    this.background = background;
    this.titleLayer = titleLayer;
    if (configs.titleSize) {
      this.titleWidth =
        this.get("titlePosition") === "left" ? configs.titleSize : 0;
      this.titleHeight =
        this.get("titlePosition") === "left" ? 0 : configs.titleSize;
    }
  }

  protected initLayer(configs: GroupConfigs) {
    const layer = new Layer({
      id: configs.id,
    });
    layer.type = LAYER_TYPES.GROUP;
    layer.set("type", LAYER_TYPES.GROUP); // 已废弃。仅为兼容可能使用了该属性的用户。
    return layer;
  }

  private initContent(layer: Layer, configs: GroupConfigs) {
    const backgroundConfigs = this.getBackgroundConfigs();
    const rect = new Rect({
      fillStyle: "#fff",
      ...backgroundConfigs,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    layer.add(rect);

    let titleLayer: Layer | null = null;
    if (configs.renderGroupTitle || configs.title) {
      titleLayer = new Layer({ id: `${configs.id}-title` });
      layer.add(titleLayer);
    }
    const anchorConfigs = configs.anchors;
    if (anchorConfigs && !Array.isArray(anchorConfigs[0])) {
      this.initAnchorShapes(configs.anchors as AnchorConfigs[]);
    }
    layer.on("mouseenter", (e) => {
      this.onMouseEnter();
    });
    layer.on("mouseleave", (e) => {
      this.onMouseLeave();
    });
    return { background: rect, titleLayer };
  }

  private initTitle(configs: GroupTitleConfigs, width: number, height: number) {
    const layer = this.titleLayer;
    const bkgConfigs = configs.background;
    const bkgSize = this.getBkgSize();
    const padding = this.getPadding();
    const titlePosition = this.get("titlePosition");
    let textWidth =
      titlePosition === "left" ? bkgSize - 24 : width - padding[1] - padding[3];
    const textHeight =
      titlePosition === "left" ? height - padding[0] : bkgSize - padding[0];
    if (bkgConfigs) {
      layer?.add(this.initTitleBackground(bkgConfigs, width, height, bkgSize));
    }
    if (configs.icon) {
      const size = configs.icon.size || 14;
      textWidth -= size + 4;
      const icon = new Icon({
        x:
          titlePosition === "left"
            ? bkgSize - 12 - size / 2
            : width - padding[1] - size / 2,
        y: titlePosition === "left" ? height / 2 : bkgSize / 2,
        size,
        icon: configs.icon.icon,
        fillStyle: configs.icon.fillStyle || "rgba(20, 20, 20, 0.65)",
        cursor: configs.icon.cursor,
        fontFamily: configs.icon.fontFamily || "iconfont",
        _icon: true,
      });
      layer?.add(icon);
      if (configs.icon.onClick) {
        icon.on("click", (e: ShapeEvent) => {
          configs.icon?.onClick?.(e, this);
        });
      }
    }

    const text = new Text({
      fillStyle: "rgba(20, 20, 20, 0.65)",
      fontSize: 14,
      x: titlePosition === "left" ? 12 : padding[3],
      y: titlePosition === "left" ? height / 2 : bkgSize / 2,
      textAlign: "left",
      textBaseline: "middle",
      width: textWidth,
      height: textHeight,
      ...configs.text,
    });
    text.directSet("_label", true);
    layer?.add(text);
    this.titleWidth = this.get("titlePosition") === "left" ? bkgSize : 0;
    this.titleHeight = this.get("titlePosition") === "left" ? 0 : bkgSize;
  }

  private getBkgSize() {
    const size = this.get("titleSize");
    if (size) {
      return size;
    }
    return this.get("titlePosition") === "left"
      ? DEFAULT_TITLE_WIDTH
      : DEFAULT_TITLE_HEIGHT;
  }

  private initTitleBackground(
    bkgConfigs: any,
    width: number,
    height: number,
    size: number
  ) {
    const { radius } = this.configs;
    const titlePosition = this.get("titlePosition");
    let rectWidth = width;
    let rectHeight = size;
    if (titlePosition === "left") {
      rectWidth = size;
      rectHeight = height;
    }
    const configs = {
      left: bkgConfigs.strokeStyle ? 0 : 0.5,
      top: bkgConfigs.strokeStyle ? 0 : 0.5,
      width: bkgConfigs.strokeStyle ? rectWidth : rectWidth - 1,
      height: bkgConfigs.strokeStyle ? rectHeight : rectHeight - 1,
      ...bkgConfigs,
    };
    if (typeof radius === "number") {
      configs.radius =
        titlePosition === "left"
          ? [radius, 0, 0, radius]
          : [radius, radius, 0, 0];
    }
    const rect = new Rect(configs);
    return rect;
  }

  protected bindEvents(layer: Layer) {
    const graph = this.graph;
    EVENTS.forEach((eventName) => {
      layer.on(eventName, (e) => {
        let target = e.target;
        const relatedTarget = e.target;
        let shouldEmit = true;
        let title = false;
        // 仅 emit group事件，屏蔽节点等事件
        while (target !== layer) {
          if (target === this.titleLayer) {
            title = true;
            shouldEmit = true;
            break;
          }
          // 目前 group 由于拾取需要用的是 layer，需要标识一下是 group layer
          if (target.get("type") === "group" || target.type === "node") {
            shouldEmit = false;
            break;
          }
          target = target.parent;
          if (!target) {
            // 嵌套场景下子 Group 事件触发了展开收起后导致 relatedTarget 被销毁
            // 此时子Group的事件已经触发过了，是由上层group layer触发进入，不再需要emit
            shouldEmit = false;
            break;
          }
        }
        if (!shouldEmit) {
          return;
        }
        this.emit(eventName, e);
        if (title) {
          graph.emit(`group.title:${eventName}`, {
            ...e,
            target: this,
            relatedTarget,
          });
        }
        graph.emit(`group:${eventName}`, {
          ...e,
          target: this,
          relatedTarget,
        });
      });
    });
  }

  getBackgroundConfigs() {
    const defaultConfigs = this.getDefaultConfigs("setDefaultGroup");
    const configs = this.configs;
    return {
      ...defaultConfigs,
      ...configs,
    };
  }

  /**
   * Adds a child entity (either a Node or another Group) to the current group.
   * 将子实体（节点或另一个分组）添加到当前分组。
   * @param {Node | Group} entity - The entity to be added as a child.
   * 要添加为子实体的节点或分组。
   * @param {boolean} [refresh=true] - Whether to refresh the bounding box of the group after adding the child.
   * 是否在添加子实体后刷新分组的边界框。
   */
  addChild(entity: Node | Group, refresh = true) {
    if (entity.belong) {
      entity.belong.removeChild(entity, false);
    } else if (this.belong === entity) {
      entity.removeChild(this, false);
    }
    this.children.push(entity);
    //  可能是通过 groupId 添加的，所以需要同步添加到 children 数组。
    const childId = entity.get("id");
    const childrenData = this.get("children");
    if (!childrenData) {
      this.set("children", [childId]);
    } else if (!childrenData.includes(childId)) {
      childrenData.push(childId);
    }
    // 嵌套 group 的情况子 group 应盖在父 group 上层，嵌套保证了节点之间的层叠关系
    if (entity.type === "group") {
      this.layer.add(entity.layer);
    }
    entity.belong = this;
    entity.set("groupId", this.get("id"));
    this.bbox = null;
    if (refresh) {
      this.refreshBox(true);
    }
    this.graph.autoDraw();
  }

  /**
   * Updates the end points of all edges connected to this group and its children.
   * 更新与此分组及其子节点连接的所有边的端点。
   */
  updateLinkEdgeEnd() {
    this.edges.forEach((edge) => {
      edge.updatePosition();
    });
    this.children.forEach((child) => {
      child.updateLinkEdgeEnd();
    });
  }

  /**
   * Updates the group's data with the provided configurations and refreshes the group BBox accordingly.
   * 使用提供的配置更新分组的数据，并相应地刷新分组的BBox。
   * @param {Partial<GroupConfigs>} configs - The configurations to update the group with.
   * 用于更新分组的配置。
   */
  updateData(configs: Partial<GroupConfigs>) {
    let newConfigs = Object.assign(this.configs, configs);
    this.convertGroupId(this.configs);
    const anchors = configs.anchors;
    const groupId = this.configs.groupId; // 原 groupId
    const defaultConfigs = this.getDefaultConfigs(
      "setDefaultGroup",
      newConfigs
    );
    newConfigs = Object.assign(newConfigs, defaultConfigs, configs);
    this.configs = newConfigs;
    this.convertGroupId(this.configs);
    if (newConfigs.titleSize) {
      if (newConfigs.titlePosition === "left") {
        this.titleWidth = newConfigs.titleSize;
      } else {
        this.titleHeight = newConfigs.titleSize;
      }
    }
    if (this.background) {
      const backgroundConfigs = this.getBackgroundConfigs();
      this.background!.set(backgroundConfigs);
    }
    if (anchors) {
      const anchorShapes = this.layer.get("__anchors");
      anchorShapes?.forEach((shape: ShapeBase) => {
        shape.destroy();
      });
      this.layer.set("__anchors", undefined);
      if (!Array.isArray(anchors[0])) {
        this.initAnchorShapes(anchors as AnchorConfigs[]);
      }
    }
    if (!this.titleLayer && (newConfigs.title || newConfigs.renderGroupTitle)) {
      this.titleLayer = new Layer({ id: `${newConfigs.id}-title` });
      this.layer.add(this.titleLayer);
    } else if (
      this.titleLayer &&
      !(newConfigs.title || newConfigs.renderGroupTitle)
    ) {
      this.destroyTitle();
      this.titleHeight = 0;
      this.titleWidth = 0;
    }
    if (configs.groupId !== groupId) {
      this.updateGroup();
    }
    if ("children" in configs) {
      // 有可能被 undo 置为 undefined
      this.updateChildrenByIds(configs.children ?? []);
    }
    this.refreshBox(true);
    this.graph.autoDraw();
  }

  // updateTitle(width: number) {
  //   const layer = this.titleLayer;
  //   let titleHeight = 0;
  //   const titleConfigs = this.configs.title;
  //   if (!layer) {
  //     return 0;
  //   }
  //   if (layer?.children.length === 0) {
  //     return this.initTitle(titleConfigs, width);
  //   }
  //   let rect = null;
  //   let text = layer.children[0];
  //   if (layer.children.length === 2) {
  //     rect = layer.children[0];
  //     text = layer.children[1];
  //   }
  //   text.set(titleConfigs.text);
  //   text.set('width', width);
  //   if (!rect && titleConfigs.background) {
  //     rect = this.initTitleBackground(titleConfigs.background, width);
  //     titleHeight = rect.get('height');
  //     text.set({
  //       y: titleHeight / 2,
  //       textBaseline: 'middle',
  //     });
  //     rect.set('width', width);
  //     layer.addBefore(rect, text);
  //   } else if (rect && !titleConfigs.background) {
  //     layer.remove(rect);
  //     text.set({
  //       y: 0,
  //       textBaseline: 'top',
  //     });
  //     titleHeight = text.getLineHeight();
  //   } else if (rect && titleConfigs.background) {
  //     rect.set(titleConfigs.background);
  //     rect.set('width', width);
  //     titleHeight = rect.get('height');
  //   }
  //   return titleHeight;
  // }

  /**
   * Updates the group's parent group based on the current group ID configuration.
   * 根据分组id更新该分组的父分组。
   */
  updateGroup() {
    this.convertGroupId(this.configs);
    const groupId = this.configs.groupId;
    if (this.belong && !groupId) {
      this.belong.removeChild(this, false);
    } else if (this.belong?.get("id") !== groupId) {
      const group = this.graph.getGroupById(groupId) as Group;
      group.addChild(this);
    }
  }

  protected onSetState(state: string) {
    const setStateStyles = this.graph.get("setGroupStateStyles");
    if (setStateStyles) {
      const stateStyles = setStateStyles(state, this.configs, this);
      if (!stateStyles) {
        return;
      }
      this.cacheStyles(state, stateStyles);
      this.background?.set(stateStyles);
    }
    this.graph.autoDraw();
  }

  protected onClearStates() {
    this.background?.set(this._styleCache);
  }

  /**
   * Retrieves the positions of all anchor points for the group.
   * 获取分组的所有锚点绘制位置。
   * @returns {number[][]} - An array of anchor positions, where each position is represented as an array of two numbers [x, y].
   * 锚点位置的数组，其中每个位置表示为一个包含两个数字的数组 [x, y]。
   */
  private getAnchorDrawPositions(): [number, number][] {
    const anchorConfigs = this.configs.anchors;
    if (!anchorConfigs) {
      return [];
    }
    let relativePositions = [];
    let offsets: number[][] = [];
    if (Array.isArray(anchorConfigs[0])) {
      relativePositions = anchorConfigs as number[][];
    } else {
      relativePositions = (anchorConfigs as AnchorConfigs[]).map(
        (shapeCfgs: AnchorConfigs) => shapeCfgs.position
      );
      offsets = (anchorConfigs as AnchorConfigs[]).map(
        (shapeCfgs: AnchorConfigs) => shapeCfgs.offsets || [0, 0]
      );
    }
    const { left, top, width, height } = this.getBBox();
    // 宽高可能未定义，避免 NaN.
    return relativePositions.map((pos: number[], i: number) => {
      const offset = offsets[i] || [0, 0];
      return [
        left + width * pos[0] + offset[0] || 0,
        top + height * pos[1] + offset[1] || 0,
      ];
    });
  }

  /**
   * Retrieves the positions of all anchor points for the group.
   * 获取分组的所有锚点位置。
   * @returns {number[][]} - An array of anchor positions, where each position is represented as an array of two numbers [x, y].
   * 锚点位置的数组，其中每个位置表示为一个包含两个数字的数组 [x, y]。
   */
  getAnchorPositions(): [number, number][] {
    const anchorConfigs = this.configs.anchors;
    if (!anchorConfigs) {
      return [];
    }
    const anchors = this.getAnchorDrawPositions();
    return anchors.map((pos: number[], i: number) => {
      const linkOffsets = anchorConfigs[i].linkOffsets || [0, 0];
      return [pos[0] + linkOffsets[0], pos[1] + linkOffsets[1]];
    });
  }

  updateAnchorPositions() {
    const anchorShapes = this.layer.get("__anchors");
    if (!anchorShapes || anchorShapes?.length === 0) {
      return;
    }
    const positions = this.getAnchorDrawPositions();
    const anchorConfigs = this.get("anchors");
    anchorShapes.forEach((anchorShape: ShapeBase) => {
      const i = anchorShape.get("anchorIndex");
      const anchorCfg = anchorConfigs[i];
      const anchorMethod = getAnchorMethods(anchorCfg.type);
      anchorMethod.updatePosition(anchorShape, positions[i]);
    });
  }

  /**
   * Retrieves the center point of the group's bounding box.
   * 获取分组边界框的中心点。
   * @returns {[number, number]} - The center point of the group's bounding box, represented as an array of two numbers [x, y].
   * 分组边界框的中心点，表示为一个包含两个数字的数组 [x, y]。
   */
  getCenterPoint(): [number, number] {
    const bbox = this.getBBox();
    return [bbox.left + bbox.width / 2, bbox.top + bbox.height / 2];
  }

  /**
   * Retrieves the link point for a given point on the group.
   * 获取给定坐标在分组上的最近可链接点。
   * @param {number[]} point - The point on the group for which to retrieve the link point.
   * 指定坐标。
   * @param {number} [anchorIndex] - The index of the anchor point to use
   * 要使用的锚点索引。
   * @param {Edge} [edge] - The edge to be used for retrieving the link point.
   * 要使用的边。
   * @returns {number[]} - The link point for the given point on the group, represented as an array of two numbers [x, y].
   * 给定点在分组上的链接点，表示为一个包含两个数字的数组 [x, y]。
   */
  getLinkPoint(
    point: number[],
    anchorIndex?: number,
    edge?: Edge,
    linkType?: "source" | "target"
  ) {
    const anchorPoints = this.getAnchorPositions();
    // const anchors = this.get('anchors');
    // anchorPoints.forEach((anchorPoint: number[], i: number) => {
    //   const linkOffsets = anchors[i].linkOffsets || [0, 0];
    //   anchorPoint[0] += linkOffsets[0];
    //   anchorPoint[1] += linkOffsets[1];
    // });
    const center = this.getCenterPoint();
    edge?.set(`__${linkType}`, undefined);
    if (anchorPoints.length === 0 && this.graph.get("linkCenter")) {
      return center;
    }
    if (anchorPoints.length > 0) {
      if (anchorIndex !== undefined && anchorPoints[anchorIndex]) {
        edge?.set(`__${linkType}`, anchorIndex);
        return anchorPoints[anchorIndex];
      }
      const index = IntersectUtil.getNearestPoint(anchorPoints, point);
      edge?.set(`__${linkType}`, index);
      return anchorPoints[index!];
    }
    return (
      IntersectUtil.getRectIntersect(
        this.background!.getBBox(),
        point,
        this.background!.get("radius")
      ) || center
    );
  }

  /**
   * Checks if the anchor at the specified index is connected to any edge.
   * 检查指定索引的锚点是否连接到任何边。
   * @param {number} index - The index of the anchor to check.
   * 要检查的锚点的索引。
   * @param {'source' | 'target'} [type] - The type of connection (source or target).
   * 连接类型（source 或 target）。
   * @returns {boolean} - Whether the anchor is connected to any edge.
   * 锚点是否连接到任何边。
   */
  isAnchorConnected(index: number, type?: "source" | "target") {
    const anchorConfigs = this.get("anchors");
    const edges = this.edges;
    if (!anchorConfigs?.[index] || edges.length === 0) {
      return false;
    }
    for (const edge of edges) {
      if (
        type !== "target" &&
        edge.source === this &&
        edge.get("__source") === index
      ) {
        return true;
      }
      if (
        type !== "source" &&
        edge.target === this &&
        edge.get("__target") === index
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * @deprecated
   * Adds the group to the specified group.
   * 已废弃：调用 parentGroup.addChild(group)。将该分组添加到指定的分组中。
   * @param {Group} group - The group to which the group should be added.
   * 要将该分组添加到的分组。
   */
  addToGroup(group: Group) {
    if (!group) {
      return;
    }
    group.addChild(this);
    this.graph.autoDraw();
  }

  /**
   * @deprecated
   * 已废弃：调用 parentGroup.removeChild(group)。Removes the group from the specified group.
   * 从指定的分组中移除该分组。
   * @param {Group} group - The group from which the group should be removed.
   * 要从该分组中移除的分组。
   */
  removeFromGroup(group: Group) {
    group.removeChild(this);
    this.graph.autoDraw();
  }

  /**
   * Removes a child entity (either a Node or another Group) from the current group.
   * 从当前分组中移除一个子实体（节点或另一个分组）。
   * @param {Node | Group} entity - The entity to be removed from the group.
   * 要从分组中移除的实体。
   * @param {boolean} [destroy=true] - Whether to destroy the entity after removing it from the group.
   * 是否在从分组中移除后销毁实体。
   * @param {boolean} [refresh=true] - Whether to refresh the bounding box of the group after removing the child.
   * 是否在移除子实体后刷新分组的边界框。
   */
  removeChild(
    entity: Node | Group,
    destroy = true,
    refresh = true,
    removeChild = true
  ) {
    let index = this.children.indexOf(entity);
    if (index >= 0) {
      if (entity.type === "group") {
        this.graph.groupContainer.add(entity.layer);
      }
      this.children.splice(index, 1);
      entity.belong = null;
      this.bbox = null;
    }
    // FIXME: 由于部分布局算法依赖 group.get('children')，所以 children 字段应与实际 graph children 同步
    if (removeChild) {
      index = this.get("children")?.indexOf(entity.get("id"));
      if (index >= 0) {
        this.get("children").splice(index, 1);
      }
    }
    if (destroy) {
      entity.destroy();
    } else {
      entity.set("groupId", undefined);
    }
    if (refresh) {
      this.refreshBox();
    }
  }

  private renderCustomTitle(width: number, height: number) {
    const { titlePosition, renderGroupTitle } = this.configs;
    if (titlePosition === "left") {
      renderGroupTitle(this, this.titleLayer, height);
    } else {
      renderGroupTitle(this, this.titleLayer, width);
    }
  }

  /**
   * Refreshes the bounding box of the group, updating its dimensions and position based on its content and title.
   * 刷新分组的边界框，根据其内容和标题更新其尺寸和位置。
   * @param {boolean} [forced=false] - Whether to force the refresh even if the bounding box hasn't changed.
   * 是否强制刷新，即使边界框没有改变。
   */
  refreshBox(forced?: boolean) {
    const originBox = this.bbox;
    const bbox = this.getInnerBox();
    const titleLayer = this.titleLayer;
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;
    if (
      forced ||
      !originBox ||
      originBox.left !== bbox.minX - this.titleWidth ||
      originBox.top !== bbox.minY - this.titleHeight ||
      originBox.width !== width + this.titleWidth ||
      originBox?.height !== height + this.titleHeight
    ) {
      this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_START, { target: this });
      if (titleLayer) {
        titleLayer.clear();
        if (this.configs.renderGroupTitle) {
          this.renderCustomTitle(width, height);
        } else {
          this.initTitle(this.configs.title!, width, height);
        }
        titleLayer.setMatrix([
          1,
          0,
          0,
          1,
          bbox.minX - this.titleWidth,
          bbox.minY - this.titleHeight,
        ]);
      }
      const top = bbox.minY - this.titleHeight;
      const totalWidth = width + this.titleWidth;
      const totalHeight = height + this.titleHeight;
      this.bbox = {
        left: bbox.minX - this.titleWidth,
        top,
        width: totalWidth,
        height: totalHeight,
      };
      this.background!.set({
        left: bbox.minX - this.titleWidth,
        top,
        width: totalWidth,
        height: totalHeight,
      });
      this.updateAnchorPositions();
      this.updateLinkEdgeEnd();
      if (this.belong) {
        this.belong.refreshBox();
      }
      this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_END, { target: this });
    }
    // 处理收起的分组在布局后的重定位
    if (this.get("collapsed") && !isNaN(this.get("x"))) {
      this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_START, { target: this });
      const left = this.get("x") - width / 2 - this.titleWidth / 2;
      const top = this.get("y") - height / 2 - this.titleHeight / 2;
      this.background?.set({ left, top });
      this.titleLayer?.setMatrix([1, 0, 0, 1, left, top]);
      this.bbox!.left = left;
      this.bbox!.top = top;
      this.updateAnchorPositions();
      if (this.belong) {
        this.belong.refreshBox();
      }
      delete this.configs.x;
      delete this.configs.y;
      this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_END, { target: this });
    }
  }

  /**
   * Retrieves the bounding box of the group, including its title.
   * 获取分组的边界框，包括其标题宽高。
   * @returns {BBox} - The bounding box of the group, including its title.
   * 分组的边界框，包括其标题宽高。
   */
  getBBox() {
    if (!this.bbox) {
      const titleHeight = this.titleHeight;
      const titleWidth = this.titleWidth;
      const { minX, minY, maxX, maxY } = this.getInnerBox();
      this.bbox = {
        left: minX - titleWidth,
        top: minY - titleHeight,
        width: maxX - minX + titleWidth,
        height: maxY - minY + titleHeight,
      };
    }
    return this.bbox;
  }

  /**
   * Retrieves the content box of the group, excluding the title and padding.
   * 获取分组的内容框，不包括标题和内边距。
   * @returns {BBox} - The content box of the group, excluding the title and padding.
   * 分组的内容框，不包括标题和内边距。
   */
  getContentBox() {
    const padding = this.getPadding();
    let bbox = this.bbox;
    if (!bbox) {
      bbox = this.getBBox();
    }
    const titleHeight = this.titleHeight;
    const titleWidth = this.titleWidth;
    const { left, top, width, height } = bbox;
    return {
      left: left + titleWidth + padding[3],
      top: top + titleHeight + padding[0],
      width: width - titleWidth - padding[1] - padding[3],
      height: height - titleHeight - padding[0] - padding[2],
    };
  }

  /**
   * Retrieves the padding configuration for the group.
   * 获取分组的内边距配置。
   * @returns {number[]} - The padding configuration, represented as an array of four numbers [top, right, bottom, left].
   * 内边距配置，表示为一个包含四个数字的数组 [上, 右, 下, 左]。
   */
  getPadding(): [number, number, number, number] {
    const configs = this.configs;
    return configs.padding !== undefined
      ? normalizePadding(configs.padding)
      : [20, 20, 20, 20];
  }

  /**
   * Retrieves the inner bounding box of the group, including padding but excluding the title.
   * 获取分组的内部边界框，不包括标题和内边距。
   * @returns {BBox} - The inner bounding box of the group, including padding but excluding the title.
   * 分组的内部边界框，包括内边距但不包括标题。
   */
  getInnerBox() {
    const padding = this.getPadding();
    const { fixLeft, fixTop, fixWidth, fixHeight, collapsed, titlePosition } =
      this.configs;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    if (this.children.length === 0) {
      if (fixLeft || fixTop || fixWidth || fixHeight) {
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;
      } else {
        return {
          minX: 0,
          maxX: 0,
          minY: 0,
          maxY: 0,
        };
      }
    } else {
      this.children.forEach((child) => {
        const { left, top, width, height } = child.getBBox();
        minX = Math.min(left, minX);
        minY = Math.min(top, minY);
        maxX = Math.max(left + width, maxX);
        maxY = Math.max(top + height, maxY);
      });
    }
    const box: Record<string, number> = {
      minX: (isNaN(fixLeft!) ? minX : fixLeft!) - padding[3],
      minY: (isNaN(fixTop!) ? minY : fixTop!) - padding[0],
    };
    maxX = this.children.length === 0 ? box.minX + padding[3] : maxX;
    maxY = this.children.length === 0 ? box.minY + padding[0] : maxY;
    box.maxX =
      (isNaN(fixWidth!) ? maxX : fixWidth! + box.minX + padding[3]) +
      padding[1];
    box.maxY =
      (isNaN(fixHeight!) ? maxY : fixHeight! + box.minY + padding[0]) +
      padding[2];

    if (isNaN(fixHeight!) && collapsed && titlePosition !== "left") {
      box.maxY = box.minY;
    }

    if (isNaN(fixWidth!) && collapsed && titlePosition === "left") {
      box.maxX = box.minX;
    }
    return box;
  }

  /**
   * Translates the group and its children by the specified x and y offsets.
   * 将分组及其子节点按指定的x和y偏移量进行平移。
   * @param {number} x - The x offset to translate the group by.
   * 分组要平移的x偏移量。
   * @param {number} y - The y offset to translate the group by.
   * 分组要平移的y偏移量。
   */
  translate(x: number, y: number) {
    if (this.bbox) {
      this.bbox.left += x;
      this.bbox.top += y;
      this.background!.set(this.bbox);
    }
    this.children.forEach((child: Node | Group) => {
      child.translate(x, y);
    });
  }

  /**
   * Retrieves the KeyShape of the group, which is typically the background shape.
   * 获取分组的KeyShape，通常是背景形状。
   * @returns {Shape} - The KeyShape of the group.
   * 分组的KeyShape。
   */
  getKeyShape() {
    return this.background!;
  }

  /**
   * Checks if the group is empty, i.e., has no child entities.
   * 检查分组是否为空，即没有子实体。
   * @returns {boolean} - Whether the group is empty.
   * 分组是否为空。
   */
  isEmpty() {
    return this.children.length === 0;
  }

  protected mergeConfigs(configs: any) {
    const defaultConfigs = this.getDefaultConfigs("setDefaultGroup");
    return Object.assign(configs, defaultConfigs);
  }

  /**
   * Destroys the title layer of the group, if it exists.
   * 销毁分组的标题图层（如果存在）。
   */
  destroyTitle() {
    const titleLayer = this.titleLayer;
    if (titleLayer) {
      titleLayer.destroy();
      this.titleLayer = null;
      this.titleHeight = 0;
      this.titleWidth = 0;
    }
  }

  /**
   * Adds child entities to the group by their IDs.
   * 根据ID将子实体添加到分组中。
   * @param {string[]} ids - The IDs of the child entities to be added.
   * 要添加的子实体的ID数组。
   */
  addChildrenByIds(ids: string[]) {
    if (!ids) {
      // group children 可能为空
      return;
    }
    const graph = this.graph;
    ids.forEach((id: string) => {
      const child = graph.getNodeById(id) || graph.getGroupById(id);
      if (child && child.belong !== this) {
        this.addChild(child, false);
      }
    });
    // 一个边界情况是 graph.data 时父分组在前，子分组在后，子节点上有 groupId 时已经是实际的 bbox 了
    // 因此走不到 refreshBox 的 shape 更新逻辑导致显示异常
    this.bbox = null;
    this.refreshBox();
  }

  /**
   * Updates the children of the group by their IDs.
   * 根据ID更新分组的子实体。
   * @param {string[]} ids - The IDs of the child entities to be updated.
   * 要更新的子实体的ID数组。
   */
  updateChildrenByIds(ids: string[]) {
    const graph = this.graph;
    const children = this.children;
    const updatedChildren: (Node | Group)[] = [];
    const existed: string[] = [];
    ids = ids ?? []; // fix for configs.children = undefined
    children.forEach((child: Node | Group) => {
      if (child.isDestroyed()) {
        return;
      }
      const id = child.get("id");
      if (!ids.includes(id)) {
        this.removeChild(child, false, false);
      } else {
        existed.push(id);
        updatedChildren.push(child);
      }
    });

    ids.forEach((id: string) => {
      if (!existed.includes(id)) {
        const child = graph.getNodeById(id) || graph.getGroupById(id);
        if (child) {
          this.addChild(child);
          updatedChildren.push(child);
        }
      }
    });
    this.children = updatedChildren;
    this.refreshBox();
  }

  /**
   * Removes child entities from the group by their IDs.
   * 根据ID从分组中移除子实体。
   * @param {string[]} ids - The IDs of the child entities to be removed.
   * 要移除的子实体的ID数组。
   * @param {boolean} [destroy=true] - Whether to destroy the entities after removing them from the group.
   * 是否在从分组中移除后销毁实体。
   */
  removeChildrenByIds(ids: string[], destroy = true) {
    const graph = this.graph;
    ids.forEach((id: string) => {
      const child = graph.getNodeById(id) || graph.getGroupById(id);
      if (child) {
        this.removeChild(child, destroy, false);
      }
    });
    this.refreshBox();
  }

  // 保留 title，连线直接连到标题，其余隐藏
  /**
   * Collapses the group.
   * 折叠分组.
   */
  collapse() {
    this.set("collapsed", true);
    // 没有标题直接隐藏
    if (!this.titleWidth && !this.titleHeight) {
      this.setShutoff(true);
      if (this.get("linkGroupOnCollapse")) {
        this.linkChildrenEdge();
      }
      return;
    }
    this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_START, { target: this });
    const bbox = this.getBBox();
    this.setShutoff(true, true);

    if (this.configs.renderGroupTitle) {
      this.titleLayer!.clear();
      this.renderCustomTitle(bbox.width, bbox.height);
    }
    // 记录当前 bbox，简化展开计算
    this.set("__bbox", { ...bbox });
    if (this.get("titlePosition") === "left") {
      bbox.width = this.titleWidth;
    } else {
      bbox.height = this.titleHeight;
    }
    this.bbox = bbox;
    // 隐藏子连线
    this.children.forEach((child: Node | Group) => {
      child.edges.forEach((edge: Edge) => {
        if (edge.source === this || edge.target === this) {
          edge.updatePosition();
          edge.show();
        }
      });
    });
    this.edges.forEach((edge: Edge) => {
      edge.updatePosition();
    });
    this.updateAnchorPositions();
    if (this.get("linkGroupOnCollapse")) {
      this.linkChildrenEdge();
    }
    this.graph.emit(GRAPH_EVENTS.CHANGE, {});
    this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_END, { target: this });
    this.graph.autoDraw();
  }

  protected initAnchorShapes(anchorConfigs: AnchorConfigs[]) {
    const layer = this.layer;
    const anchorShapes: ShapeBase[] = [];
    const anchorPositions = this.getAnchorDrawPositions();
    anchorConfigs.forEach((anchor: AnchorConfigs, i: number) => {
      anchor.visible = anchor.show !== "hover";
      anchor.index = i;
      // 兼容需要配置 position + offsets 而不需要锚点图形的情况
      if (!anchor.type && !anchor.setStyles) {
        return;
      }
      anchor.show = anchor.show ?? "always";
      if (anchor.type || anchor.setStyles) {
        const anchorMethod = getAnchorMethods(anchor.type);
        const shape = anchorMethod.init(
          layer,
          anchor,
          this.configs,
          anchorPositions[i]
        );
        shape.set("anchorIndex", i);
        anchorShapes.push(shape);
      }
    });
    layer.set("__anchors", anchorShapes);
  }

  /**
   * Shows the anchors of the group based on a filter function.
   * 根据过滤函数展示分组的锚点。
   * @param {function} [filter] - A function to filter which anchors to show.
   * 用于过滤展示哪些锚点的函数。
   * @param {Node} [node] - The group to which the anchors belong.
   * 锚点所属的分组。
   */
  showAnchors(
    filter?: (
      anchorConfigs: AnchorConfigs,
      anchor: Layer,
      group: Group,
      fromNode?: Node | Group
    ) => boolean,
    node?: Node | Group
  ) {
    const anchors = this.get("anchors");
    const anchorShapes = this.layer.get("__anchors");
    if (anchors) {
      anchors.forEach((anchor: AnchorConfigs, i: number) => {
        const shape = anchorShapes?.[i];
        if (filter) {
          if (filter(anchor, shape, this, node)) {
            anchor.visible = true;
            shape?.show();
          } else {
            anchor.visible = false;
            shape?.hide();
          }
        } else {
          anchor.visible = true;
          shape?.show();
        }
      });
    }
    this.graph.autoDraw();
  }

  /**
   * Hides the anchors of the node.
   * 隐藏节点的锚点。
   */
  hideAnchors() {
    const anchors = this.get("anchors");
    const anchorShapes = this.layer.get("__anchors");
    if (anchors) {
      anchors.forEach((anchor: AnchorConfigs, i: number) => {
        if (anchor.show !== "always") {
          anchor.visible = false;
          anchorShapes?.[i]?.hide();
        } else {
          anchor.visible = true;
          anchorShapes?.[i]?.show();
        }
      });
    }
    this.graph.autoDraw();
  }

  private linkChildrenEdge(group = this) {
    this.children.forEach((child: Node | Group) => {
      if (child.type === "group" && !child.get("collapsed")) {
        (child as Group).linkChildrenEdge(group);
      }
      child.edges.concat([]).forEach((edge: Edge) => {
        const source = edge.getSource();
        const target = edge.getTarget();
        const sourceAncestor = isAncestor(source!, group);
        const targetAncestor = isAncestor(target!, group);
        if (sourceAncestor && targetAncestor) {
          edge.hide();
          return;
        }
        if (sourceAncestor) {
          if (!edge.get("originSource")) {
            edge.set("originSource", source);
          }
          edge.setSource(group.get("id"));
        }
        if (targetAncestor) {
          if (!edge.get("originTarget")) {
            edge.set("originTarget", target);
          }
          edge.setTarget(group.get("id"));
        }
        edge.show();
        edge.updatePosition();
      });
    });
  }

  private recoverChildrenEdge() {
    this.children.forEach((child: Node | Group) => {
      if (child.type === "group" && !child.get("collapsed")) {
        (child as Group).recoverChildrenEdge();
      }
      child.edges.forEach((edge: Edge) => {
        this.recoverEdge(edge);
      });
    });
    this.edges.concat([]).forEach((edge: Edge) => {
      this.recoverEdge(edge);
    });
  }

  private recoverEdge(edge: Edge) {
    const originSource = edge.get("originSource");
    const originTarget = edge.get("originTarget");
    let sourceEntity;
    let targetEntity;
    if (originSource) {
      sourceEntity = getNearestVisibleParent(originSource);
    }
    if (originTarget) {
      targetEntity = getNearestVisibleParent(originTarget);
    }
    if (
      sourceEntity === targetEntity &&
      !(sourceEntity === originSource && targetEntity === originTarget) &&
      sourceEntity?.get("collapsed")
    ) {
      return;
    }
    if (originSource && isAncestor(originSource, this)) {
      if (sourceEntity === originSource) {
        delete edge.configs.originSource;
      }
      if (sourceEntity) {
        edge.setSource(sourceEntity.get("id"));
        edge.show();
        edge.updatePosition();
      }
    }
    if (originTarget && isAncestor(originTarget, this)) {
      if (targetEntity === originTarget) {
        delete edge.configs.originTarget;
      }
      if (targetEntity) {
        edge.setTarget(targetEntity.get("id"));
        edge.show();
        edge.updatePosition();
      }
    }
  }

  private hideGroupShapes() {
    const background = this.background;
    const titlePosition = this.get("titlePosition");
    if (this.configs.renderGroupTitle) {
      if (titlePosition === "left") {
        background!.set("width", this.titleWidth);
      } else {
        background!.set("height", this.titleHeight);
      }
      return;
    }
    // 内置配置调整视觉效果
    if (this.titleLayer) {
      const bkShape = this.titleLayer.children[0];
      if (bkShape?.type === "rect") {
        const fillStyle = bkShape.get("fillStyle");
        bkShape.set("fillStyle", background!.get("fillStyle"));
        background!.set("fillStyle", fillStyle);
        bkShape.hide();
      }
    }
    if (titlePosition === "left") {
      background!.set("width", this.titleWidth);
    } else {
      background!.set("height", this.titleHeight);
    }
  }

  /**
   * Sets the shutoff state of the group and its children.
   * 设置分组及其子节点的 shutoff 状态。 一般仅 vgraph 内部使用。
   * @param {boolean} shutoff - Whether to shut off the group.
   * 是否关闭分组。
   * @param {boolean} [self=false] - Whether to apply the shutoff state to the group itself.
   * 是否将 shutoff 状态应用于分组本身。
   */
  setShutoff(shutoff: boolean, self = false) {
    if (shutoff || !!this.get("collapsed") === shutoff) {
      this.children.forEach((child: Group | Node) => {
        child.setShutoff(shutoff);
      });
    }
    if (self) {
      if (shutoff) {
        this.hideGroupShapes();
      } else {
        this.showGroupShapes();
      }
    } else {
      this.shutoff = shutoff;
      if (shutoff) {
        this.layer.hide();
        this.edges.forEach((edge: Edge) => {
          edge.hide();
        });
      } else if (this.visible) {
        this.layer.show();
        this.edges.forEach((edge: Edge) => {
          edge.show();
        });
      }
    }
  }

  /**
   * Expands the group.
   * 展开分组。
   */
  expand() {
    this.set("collapsed", false);
    // 没有标题时直接隐藏
    if (!this.titleWidth && !this.titleHeight) {
      this.setShutoff(false);
      if (this.get("linkGroupOnCollapse")) {
        this.recoverChildrenEdge();
      }
      return;
    }
    this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_START, { target: this });
    // 恢复展开的 bbox
    const bbox = this.get("__bbox");
    if (this.bbox) {
      // 一般经过 NestedDAG 布局分组位置已经发生了变化，如果这边直接用原本的 left, top 容易丢失定位
      this.bbox.width = bbox.width;
      this.bbox.height = bbox.height;
    } else {
      this.bbox = bbox;
    }
    if (this.configs.renderGroupTitle) {
      this.titleLayer!.clear();
      this.renderCustomTitle(bbox.width, bbox.height);
    }
    this.titleLayer?.setMatrix([1, 0, 0, 1, bbox.left, bbox.top]);
    const autoDraw = this.graph.get("autoDraw");
    this.graph.set("autoDraw", false);
    this.setShutoff(false, true);
    // 更新背景矩形大小
    this.background!.set(this.bbox);
    this.updateAnchorPositions();
    // 恢复连线
    this.children.forEach((child: Node | Group) => {
      child.edges.forEach((edge: Edge) => {
        if (edge.isVisible()) {
          edge.updatePosition();
        }
      });
    });
    if (this.get("linkGroupOnCollapse")) {
      this.recoverChildrenEdge();
    }
    this.edges.forEach((edge: Edge) => {
      edge.updatePosition();
    });
    this.graph.set("autoDraw", autoDraw);
    this.graph.emit(GRAPH_EVENTS.CHANGE, {});
    this.graph.emit(GRAPH_EVENTS.GROUP_BBOX_END, { target: this });
    this.graph.autoDraw();
  }

  private hideEdgesForAnimate() {
    this.edges.forEach((edge: Edge) => {
      if (edge.isVisible()) {
        edge.set("_animateShow", true);
        edge.hide();
      }
    });
    this.children.forEach((child: Node | Group) => {
      if (child.type === "group") {
        (child as Group).hideEdgesForAnimate();
      } else {
        child.edges.forEach((edge: Edge) => {
          if (edge.isVisible()) {
            edge.set("_animateShow", true);
            edge.hide();
          }
        });
      }
    });
  }

  private onMouseEnter() {
    if (this.get("disableNodeEvent")) {
      return;
    }
    const anchors = this.layer.get("__anchors");

    if (anchors && !this.get("disableAnchors")) {
      anchors.forEach((anchor: ShapeBase) => {
        if (anchor.get("showType") === "hover") {
          anchor.show();
        }
      });
    }
    this.graph.draw();
  }

  private onMouseLeave() {
    if (this.get("disableNodeEvent")) {
      return;
    }
    const anchors = this.layer.get("__anchors");
    if (anchors && !this.get("disableAnchors")) {
      anchors.forEach((anchor: ShapeBase) => {
        if (anchor.get("showType") === "hover") {
          anchor.hide();
        }
      });
    }
    this.graph.draw();
  }

  private showEdgesForAnimate() {
    this.edges.forEach((edge: Edge) => {
      if (edge.get("_animateShow")) {
        edge.show();
        edge.updatePosition();
        delete edge.configs._animateShow;
      }
    });
    this.children.forEach((child: Node | Group) => {
      if (child.type === "group") {
        (child as Group).showEdgesForAnimate();
      } else {
        child.edges.forEach((edge: Edge) => {
          if (edge.get("_animateShow")) {
            edge.show();
            edge.updatePosition();
            delete edge.configs._animateShow;
          }
        });
      }
    });
  }

  private showGroupShapes() {
    const container = this.layer;
    if (!container.get("clip")) {
      const background = this.background;
      if (!this.configs.renderGroupTitle && this.titleLayer) {
        const bkShape = this.titleLayer.children[0];
        if (bkShape?.type === "rect") {
          const fillStyle = bkShape.get("fillStyle");
          bkShape.set("fillStyle", background!.get("fillStyle"));
          background!.set("fillStyle", fillStyle);
          bkShape.show();
        }
      }
    }
  }

  // 全部展示
  /**
   * Shows the group and all its child entities (nodes and groups) and edges.
   * 显示分组及其所有子实体（节点和分组）和边。
   */
  show() {
    if (this.visible) {
      return;
    }
    this.visible = true;
    this.layer.show();
    this.edges.forEach((edge: Edge) => {
      edge.show();
    });
    this.children.forEach((child: Node | Group) => {
      child.show();
    });
    this.graph.autoDraw();
  }

  // 全部隐藏
  /**
   * Hides the group and all its child entities (nodes and groups) and edges.
   * 隐藏分组及其所有子实体（节点和分组）和边。
   */
  hide() {
    if (!this.visible) {
      return;
    }
    this.visible = false;
    this.layer.hide();
    this.edges.forEach((edge: Edge) => {
      edge.hide();
    });
    this.children.forEach((child: Node | Group) => {
      child.hide();
    });
    this.graph.autoDraw();
  }

  /**
   * Sets the bounding box of the group and updates its background and title layer accordingly.
   * 设置分组的边界框，并相应地更新其背景和标题图层。
   * @param {Object} bbox - The bounding box object containing `left`, `top`, `width`, and `height` properties.
   * 包含 `left`, `top`, `width`, 和 `height` 属性的边界框对象。
   */
  setBBox(bbox: { left: number; top: number; width: number; height: number }) {
    const { left, top, width, height } = bbox;
    const originBox = this.bbox;
    if (
      originBox &&
      originBox.left === left &&
      originBox.top === top &&
      originBox.width === width &&
      originBox.height === height
    ) {
      return;
    }
    const titleLayer = this.titleLayer;
    this.bbox = bbox;
    this.background!.set(bbox);
    if (titleLayer) {
      titleLayer.clear();
      if (this.configs.renderGroupTitle) {
        this.renderCustomTitle(width, height);
      } else {
        this.initTitle(this.configs.title!, width, height);
      }
      titleLayer.setMatrix([1, 0, 0, 1, left, top]);
    }
  }

  /**
   * Retrieves the bounding box of the group's title.
   * 获取分组标题的边界框。
   * @returns {Object} - The bounding box object containing `left`, `top`, `width`, and `height` properties.
   * 包含 `left`, `top`, `width`, 和 `height` 属性的边界框对象。
   */
  getTitleBBox() {
    const bbox = { ...this.getBBox() };
    if (!this.get("titleSize")) {
      return {
        left: bbox.left,
        top: bbox.top,
        width: 0,
        height: 0,
      };
    }
    if (this.get("titlePosition") === "left") {
      bbox.width = this.titleWidth;
    } else {
      bbox.height = this.titleHeight;
    }
    return bbox;
  }

  /**
   * Destroys the group and cleans up all associated resources.
   * 销毁分组并清理所有相关资源。
   */
  destroy(removeChild = true) {
    if (this.belong) {
      this.belong.removeChild(this, false, true, removeChild);
    }
    const children = this.configs.children.concat([]);
    while (this.children.length) {
      const child = this.children[this.children.length - 1];
      this.removeChild(child, false, false);
    }
    while (this.edges.length) {
      this.edges.pop()?.destroy();
    }
    this.destroyTitle();
    this.configs.children = children;
    delete this.graph.entityMap.group[this.get("id")];
    super.destroy();
  }
}

function isAncestor(entity: Node | Group, group: Group) {
  let parent = entity.belong;
  while (parent) {
    if (parent === group) {
      return true;
    }
    parent = parent.belong;
  }
  return false;
}

function getNearestVisibleParent(entity: Node | Group) {
  if (entity.isVisible()) {
    return entity;
  }
  let parent = entity.belong;
  while (parent) {
    if (parent.isVisible()) {
      return parent;
    }
    parent = parent.belong;
  }
  return null;
}
