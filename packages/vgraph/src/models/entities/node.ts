/* eslint-disable no-restricted-globals */
import { NodeLayer, Layer, Point, IntersectUtil, Shape } from "../../renderer";
import { NodeConfigs, AnchorConfigs } from "../../typings/model";
import { ENTITY_TYPES } from "../../consts/entity_types";
import { Entity } from "./entity";
import { Edge } from "./edge";
import { Group } from "./group";
import { getAnchorMethods, getNodeMethods } from "../factories";
import { updateAppendSize } from "../append_size";

type NodeEntityConfigs = NodeConfigs & {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export interface INode {
  configs: NodeEntityConfigs;
  layer: NodeLayer;
  keyShape: Shape;
  edges: Edge[];
  belong: Group | null;

  setState: (state: string, onlyState?: boolean) => void;
  removeState: (state: string) => void;
  clearStates: (state: string) => void;

  updateData: (data: any) => void;
  updatePosition: (x: number | undefined, y: number | undefined) => void;

  show: () => void;
  hide: () => void;
  isVisible: () => boolean;

  getAnchorPositions: () => [number, number][];
  getDirectParent: () => Group | null;
  getRootParent: () => Group | null;

  getEdges: () => Edge[];
  getLinkedNodes: () => Node[];

  destroy: () => void;
}

export class Node extends Entity implements INode {
  type = ENTITY_TYPES.NODE;
  // configs: NodeEntityConfigs; // TODO: 先避免ts报错，id 后续应当在 new Node 时通过 getEntityId 生成。
  keyShape: any;
  belong: Group | null = null;
  states: string[] = [];
  edges: Edge[] = [];
  sources: string[] = [];
  targets: string[] = [];
  temp: boolean;
  [key: string]: unknown;

  constructor(
    configs: NodeConfigs,
    graph: any,
    container: Layer,
    batching = false,
    temp = false
  ) {
    super(configs, graph, container, temp);
    if (temp || graph.get("renderMode") !== "canvas") {
      this.temp = true;
      if (configs.anchors && !Array.isArray(configs.anchors[0])) {
        (configs.anchors as AnchorConfigs[]).forEach(
          (anchor: AnchorConfigs, i: number) => {
            anchor.show = anchor.show ?? "always";
            anchor.visible = anchor.show !== "hover";
            anchor.index = i;
          }
        );
      }
    } else {
      this.temp = false;
      this.keyShape = this.initContent(this.layer, configs);
      if (configs.anchors && !Array.isArray(configs.anchors[0])) {
        this.initAnchorShapes(configs.anchors as AnchorConfigs[]);
      }
      if (configs.icons && Array.isArray(configs.icons)) {
        this.initIconShapes(configs.icons);
      }
      if (configs.hitWidth) {
        this.layer.set("hitWidth", configs.hitWidth);
      }
      this.updateLayerAppendSize();
    }

    this.convertGroupId(configs);
    if (configs.groupId) {
      const group = graph.getGroupById(configs.groupId);
      if (group) {
        group.addChild(this, !batching);
      }
    }
  }

  protected convertToAbsolutePosition(
    relativePosition: number[] | number
  ): number[] {
    const keyShape = this.getKeyShape();
    const { width, height } = keyShape.getBBox();
    const { lineWidth } = keyShape.configs;
    relativePosition = super.convertToAbsolutePosition(relativePosition);
    return [
      (width - lineWidth) * (relativePosition[0] - 0.5),
      (height - lineWidth) * (relativePosition[1] - 0.5),
    ];
  }

  protected mergeConfigs(configs: any) {
    const defaultConfigs = this.getDefaultConfigs("setDefaultNode");
    if (configs.x === undefined) {
      configs.x = 0;
    }
    if (configs.y === undefined) {
      configs.y = 0;
    }
    return Object.assign(configs, defaultConfigs);
  }

  protected initLayer(configs: NodeConfigs) {
    const layer = new NodeLayer({
      x: configs.x,
      y: configs.y,
      width: configs.width,
      height: configs.height,
    });
    return layer;
  }

  /**
   * Retrieves the layer for the node.
   * 获取节点的Layer。
   * @returns {NodeLayer} - The layer for the node.
   * 节点的layer。
   */
  getLayer() {
    return this.layer;
  }

  /**
   * Retrieves the center point of the node.
   * 获取节点的中心点。
   * @returns {[number, number]} - The center point of the node.
   * 节点的中心点。
   */
  getCenterPoint(): [number, number] {
    const configs = this.configs;
    return [configs.x, configs.y];
  }

  protected onSetState(state: string, onlyState?: boolean) {
    const configs = this.configs;
    const keyShape = this.keyShape;
    if (!keyShape || keyShape.destroyed) {
      return;
    }
    const setStateStyles = this.graph.get("setNodeStateStyles");
    if (setStateStyles) {
      const stateStyles = setStateStyles(state, configs, this);
      if (!stateStyles) {
        return;
      }
      this.cacheStyles(state, stateStyles);
      keyShape.set(stateStyles);
    }
    this.graph.autoDraw();
  }

  protected initContent(layer: NodeLayer, configs: NodeConfigs) {
    const shapeMethods = getNodeMethods(configs.type);
    const keyShape = shapeMethods.init(layer, this.configs);
    if (this.configs.icons || this.configs.anchors) {
      layer.on("mouseenter", (e) => {
        this.onMouseEnter();
      });
      layer.on("mouseleave", (e) => {
        this.onMouseLeave();
      });
    }
    return keyShape;
  }

  /**
   * Shows the anchors of the node based on a filter function.
   * 根据过滤函数展示节点的锚点。
   * @param {function} [filter] - A function to filter which anchors to show.
   * 用于过滤展示哪些锚点的函数。
   * @param {Node} [node] - The node to which the anchors belong.
   * 锚点所属的节点。
   */
  showAnchors(
    filter?: (
      anchorConfigs: AnchorConfigs,
      anchor: Layer,
      node: Node,
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

  private onMouseEnter() {
    if (this.get("disableNodeEvent")) {
      return;
    }
    const icons = this.layer.get("__icons");
    const anchors = this.layer.get("__anchors");
    let draw = false;
    if (icons && !this.get("disableIcons")) {
      icons.forEach((icon: Shape) => {
        if (icon.get("showType") === "hover") {
          draw = true;
          icon.show();
        }
      });
    }
    if (anchors && !this.get("disableAnchors")) {
      anchors.forEach((anchor: Shape) => {
        if (anchor.get("showType") === "hover") {
          draw = true;
          anchor.show();
        }
      });
    }
    if (draw) {
      this.graph.draw();
    }
  }

  private onMouseLeave() {
    if (this.get("disableNodeEvent")) {
      return;
    }
    const icons = this.layer.get("__icons");
    const anchors = this.layer.get("__anchors");
    let draw = false;
    if (icons && !this.get("disableIcons")) {
      icons.forEach((icon: Shape) => {
        if (icon.get("showType") === "hover") {
          draw = true;
          icon.hide();
        }
      });
    }
    if (anchors && !this.get("disableAnchors")) {
      anchors.forEach((anchor: Shape) => {
        if (anchor.get("showType") === "hover") {
          draw = true;
          anchor.hide();
        }
      });
    }
    if (draw) {
      this.graph.draw();
    }
  }

  /**
   * Retrieves the keyShape of the node.
   * 获取节点的 keyShape。
   * @returns {Shape} - The keyShape of the node.
   * 节点的 keyShape。
   */
  getKeyShape() {
    return this.keyShape || this.layer;
  }

  protected onClearStates() {
    if (!this.keyShape) {
      return;
    }
    const shapeMethods = getNodeMethods(this.configs.type);
    shapeMethods.setStateStyles(this.layer, this._styleCache);
  }

  /**
   * Updates the data of the node and optionally refreshes the group.
   * 更新节点的数据，并选择性地刷新分组。
   * @param {NodeConfigs} data - The new data to update the node with.
   * 要更新节点的新数据。
   * @param {boolean} [refreshGroup=true] - Whether to refresh the group after updating the data.
   * 是否在更新数据后刷新分组。
   */
  updateData(data: NodeConfigs | undefined, refreshGroup = true) {
    const autoDraw = this.graph.disableAutoDraw();
    const temp = this.temp;
    const { type, x, y, width, height, anchors } = this.configs;
    let newConfigs = Object.assign(this.configs, data);
    const defaultConfigs = this.getDefaultConfigs("setDefaultNode", newConfigs);
    newConfigs = Object.assign(newConfigs, defaultConfigs, data);
    this.convertGroupId(newConfigs);
    const { groupId } = newConfigs;
    this.configs = newConfigs;
    if (newConfigs.hitWidth) {
      this.layer.set("hitWidth", newConfigs.hitWidth);
    }
    let refresh = refreshGroup;
    // 根据配置更新锚点
    if (
      (data && Object.prototype.hasOwnProperty.call(data, "anchors")) ||
      newConfigs.width !== width ||
      newConfigs.height !== height
    ) {
      !temp && this.updateAnchorShapes(newConfigs.anchors);
      // 如果仅是宽高发生变化 且为 AnchorConfigs，anchors 显隐状态保留
      if (
        newConfigs.anchors &&
        !Array.isArray(newConfigs.anchors[0]) &&
        (!data || !Object.prototype.hasOwnProperty.call(data, "anchors"))
      ) {
        (newConfigs.anchors as AnchorConfigs[]).forEach(
          (anchor: AnchorConfigs, i: number) => {
            anchor.visible = (anchors as AnchorConfigs[])[i].visible;
          }
        );
      }
    } else {
      this.configs.anchors = anchors;
    }

    // 更新节点位置
    if (newConfigs.x !== x || newConfigs.y !== y) {
      this.layer.set({ x: newConfigs.x, y: newConfigs.y });
      refresh = true;
    }

    // 更新节点尺寸
    if (newConfigs.width !== width || newConfigs.height !== height) {
      this.updateSize(newConfigs.width, newConfigs.height);
      refresh = true;
    }

    if (refreshGroup) {
      // 根据配置更新分组
      if ((!this.belong && groupId) || this.belong?.get("id") !== groupId) {
        const group = this.graph.getGroupById(groupId);
        group.addChild(this, false);
      } else if (this.belong && !groupId) {
        this.belong.removeChild(this, false, false);
      }
    }

    if (refresh) {
      refresh &&
        this.edges.forEach((edge: Edge) => {
          edge.updatePosition();
        });
      this.belong?.refreshBox();
    }

    if (temp) {
      this.graph.enableAutoDraw(autoDraw);
      return;
    }

    // 节点类型切换或渲染模式
    if (newConfigs.type !== type || this.layer.children.length === 0) {
      this.layer.clear();
      this.keyShape = getNodeMethods(newConfigs.type).init(
        this.layer,
        newConfigs
      );
      if (newConfigs.icons) {
        this.initIconShapes(newConfigs.icons);
      }
      if (newConfigs.anchors && !Array.isArray(newConfigs.anchors[0])) {
        this.initAnchorShapes(newConfigs.anchors as AnchorConfigs[]);
      }
      this.recoverStates();
      this.graph.enableAutoDraw(autoDraw);
      return;
    }
    const shapeMethods = getNodeMethods(type);
    shapeMethods.setStateStyles(this.layer, this._styleCache); // keyShape 恢复原有样式
    const keyShape = shapeMethods.update(this.layer, newConfigs);
    if (keyShape) {
      this.keyShape = keyShape;
    }
    if (
      (data && Object.prototype.hasOwnProperty.call(data, "icons")) ||
      newConfigs.width !== width ||
      newConfigs.height !== height
    ) {
      this.updateIconShapes(newConfigs.icons);
    }
    this.updateLayerAppendSize();
    this.recoverStates();
    this.graph.enableAutoDraw(autoDraw);
  }

  /**
   * Sets a property of the node.
   * 设置节点的属性。
   * @param {string} k - The key of the property to set.
   * 要设置的属性的键。
   * @param {any} v - The value to set for the property.
   * 要为属性设置的值。
   */
  set(k: string, v: any) {
    super.set(k, v);
    const configs = this.configs;
    // 目前仅考虑布局中的临时操作，如果有场景需要改成 updateSize
    if (k === "width" || k === "height") {
      this.layer?.set({ width: configs.width, height: configs.height });
    } else if (k === "x" || k === "y") {
      // 目前仅考虑布局中的临时变更，如果有场景需要改成 updatePosition
      this.layer?.set({ x: configs.x, y: configs.y });
    }
  }

  /**
   * Updates the position of the node and optionally updates the positions of connected edges.
   * 更新节点的位置，并选择性地更新连接边的位置。
   * @param {number} [x=this.configs.x] - The new x-coordinate of the node.
   * 节点的新x坐标。
   * @param {number} [y=this.configs.y] - The new y-coordinate of the node.
   * 节点的新y坐标。
   * @param {boolean} [ignoreEdge=false] - Whether to ignore updating the positions of connected edges.
   * 是否忽略更新连接边的位置。
   */
  updatePosition(
    x: number = this.configs.x,
    y: number = this.configs.y,
    ignoreEdge = false
  ) {
    const configs = this.configs;
    configs.x = x;
    configs.y = y;
    this.layer.set({ x, y });
    if (!ignoreEdge) {
      this.edges.forEach((edge: Edge) => {
        edge.updatePosition();
      });
      if (this.belong) {
        this.belong.refreshBox();
      }
    }
    this.graph.autoDraw();
  }

  /**
   * Updates the size of the node and adjusts the positions of anchors and icons accordingly.
   * 更新节点的大小，并相应地调整锚点和icon的位置。
   * @param {number} width - The new width of the node.
   * 节点的新宽度。
   * @param {number} height - The new height of the node.
   * 节点的新高度。
   */
  updateSize(width: number, height: number) {
    const configs = this.configs;
    configs.width = width;
    configs.height = height;
    this.layer.set({ width, height });

    const anchors = this.layer.get("__anchors");
    const icons = this.layer.get("__icons");
    if (anchors?.length > 0) {
      const positions = this.getAnchorRelativePositions();
      const anchorConfigs = this.get("anchors");
      anchors.forEach((anchorShape: Shape) => {
        const i = anchorShape.get("anchorIndex");
        const anchorCfg = anchorConfigs[i];
        const anchorMethod = getAnchorMethods(anchorCfg.type);
        anchorMethod.updatePosition(anchorShape, positions[i]);
      });
    }
    if (icons) {
      const iconConfigs = this.configs.icons!;
      icons.forEach((icon: Layer, i: number) => {
        const iconCfg = iconConfigs[i];
        const offset = iconCfg.offsets ? iconCfg.offsets : [0, 0];
        const x = width * (iconCfg.position[0] - 0.5) + offset[0];
        const y = height * (iconCfg.position[1] - 0.5) + offset[1];
        icon.setMatrix([1, 0, 0, 1, x, y]);
      });
    }
  }

  /**
   * Retrieves the absolute positions of the anchors of the node.
   * 获取节点的锚点的绝对位置坐标。
   * @returns {[number, number][]} - The absolute positions of the anchors.
   * 锚点的绝对位置坐标。
   */
  getAnchorPositions(): [number, number][] {
    const anchorConfigs = this.get("anchors");
    if (!anchorConfigs) {
      return [];
    }
    let relativePositions = [];
    let offsets: number[][] = [];
    let linkOffsets: number[][] = [];
    if (Array.isArray(anchorConfigs[0])) {
      relativePositions = anchorConfigs;
    } else {
      relativePositions = anchorConfigs.map(
        (shapeCfgs: AnchorConfigs) => shapeCfgs.position
      );
      offsets = anchorConfigs.map(
        (shapeCfgs: AnchorConfigs) => shapeCfgs.offsets
      );
      linkOffsets = anchorConfigs.map(
        (anchorConfigs: AnchorConfigs) => anchorConfigs.linkOffsets
      );
    }
    const { x, y, width, height } = this.configs;
    return relativePositions.map((pos: number[], i: number) => {
      const offset = offsets[i] || [0, 0];
      const linkOffset = linkOffsets[i] || [0, 0];
      return [
        x + width * (pos[0] - 0.5) + offset[0] + linkOffset[0],
        y + height * (pos[1] - 0.5) + offset[1] + linkOffset[1],
      ];
    });
  }

  /**
   * Retrieves the relative positions of the anchors of the node.
   * 获取节点的锚点的相对位置坐标。
   * @returns {[number, number][]} - The relative positions of the anchors.
   * 锚点的绝对位置坐标。
   */
  getAnchorRelativePositions(): number[][] {
    const anchorConfigs = this.get("anchors");
    if (!anchorConfigs) {
      return [];
    }
    const { width, height } = this.configs;
    return anchorConfigs.map((anchorConfig: AnchorConfigs | number[]) => {
      if (Array.isArray(anchorConfig)) {
        const pos = anchorConfig as number[];
        return [width * (pos[0] - 0.5), height * (pos[1] - 0.5)];
      }
      const { position, offsets = [0, 0] } = anchorConfig;
      return [
        width * (position[0] - 0.5) + offsets[0],
        height * (position[1] - 0.5) + offsets[1],
      ];
    });
  }

  /**
   * Retrieves the link point of the node based on the given point, anchor index, edge, and link type.
   * 根据给定的点、锚点索引、边和连接类型获取节点的连接点。
   * @param {number[]} point - The point to calculate the link point from.
   * 用于计算连接点的点。
   * @param {number} [anchorIndex] - The index of the anchor point to use.
   * 要使用的锚点索引。
   * @param {Edge} [edge] - The edge associated with the link point.
   * 与连接点关联的边。
   * @param {'source' | 'target'} [linkType] - The type of link (source or target).
   * 连接类型（源或目标）。
   * @returns {[number, number]} - The calculated link point.
   * 计算出的连接点。
   */
  getLinkPoint(
    point: number[],
    anchorIndex?: number,
    edge?: Edge,
    linkType?: "source" | "target"
  ): [number, number] {
    const anchorPoints = this.getAnchorPositions();
    const matrix = this.layer.getMatrix();
    const center = [matrix[4], matrix[5]] as [number, number];
    if (this.isDestroyed()) {
      console.warn(`Node id: ${this.get("id")} has been destroyed`);
      return [0, 0];
    }
    if (isNaN(center[0]) || isNaN(center[1])) {
      this.graph.throw(
        `Invalid node coord, id: ${this.get("id")}, x: ${this.get(
          "x"
        )}, y: ${this.get("y")}`
      );
      return [0, 0];
    }
    if (isNaN(this.get("width")) && isNaN(this.get("r"))) {
      this.graph.throw(
        `Invalid node width, id: ${this.get("id")}, width: ${this.get("width")}`
      );
      return [0, 0];
    }
    if (isNaN(this.get("height")) && isNaN(this.get("r"))) {
      this.graph.throw(`Invalid node height, id: ${this.get("id")}`);
      return [0, 0];
    }
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
      return anchorPoints[index];
    }
    const keyShape = this.getKeyShape();
    const type = keyShape?.type;
    if (type === "circle") {
      return IntersectUtil.getCircleIntersect(this.getBBox(), point) || center;
    }
    const radius = keyShape.get("radius");
    return (
      IntersectUtil.getRectIntersect(this.getBBox(), point, radius) || center
    );
  }

  /**
   * Checks if the anchor at the specified index is connected to any edge.
   * 检查指定索引的锚点是否连接到任何边。
   * @param {number} index - The index of the anchor to check.
   * 要检查的锚点的索引。
   * @param {'source' | 'target'} [type] - The type of connection (source or target).
   * 连接类型（源或目标）。
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
   * Adds the node to a specified group and updates the group accordingly.
   * 已废弃：调用 group.addChild(node)。将节点添加到指定的分组，并相应地更新分组。
   * @param {Group} group - The group to add the node to.
   * 目标分组。
   * @param {boolean} [refreshGroup=true] - Whether to refresh the group after adding the node.
   * 是否在添加节点后刷新分组。
   */
  addToGroup(group: Group, refreshGroup = true) {
    group.addChild(this, refreshGroup);
    this.graph.autoDraw();
  }

  /**
   * @deprecated
   * Removes the node from its current group and updates the group accordingly.
   * 已废弃：请在 group 调用 group.removeChild(node)。从当前分组中移除节点，并相应地更新分组。
   * @param {boolean} [refreshGroup=true] - Whether to refresh the group after removing the node.
   * 是否在移除节点后刷新分组。
   */
  removeFromGroup(refreshGroup = true) {
    if (this.belong) {
      this.belong.removeChild(this, false, refreshGroup);
    }
    this.graph.autoDraw();
  }

  /**
   * Refresh the position of all edges connected to this node.
   * 更新与此节点连接的所有边的端点位置信息。
   */
  updateLinkEdgeEnd() {
    this.edges.forEach((edge) => {
      edge.updateNodes();
    });
  }

  /**
   * Translates the node by the specified offset and updates the positions of connected edges.
   * 按指定的偏移量平移节点，并更新连接边的位置。
   * @param {number} offsetX - The offset in the x-direction.
   * x方向的偏移量。
   * @param {number} offsetY - The offset in the y-direction.
   * y方向的偏移量。
   */
  translate(offsetX: number, offsetY: number) {
    this.configs.x += offsetX;
    this.configs.y += offsetY;
    this.layer.set({
      x: this.configs.x,
      y: this.configs.y,
    });
    this.edges.forEach((edge: Edge) => {
      edge.updatePosition();
    });
    if (this.belong) {
      this.belong.refreshBox();
    }
    this.graph.autoDraw();
  }

  /**
   * Scales the node by the specified ratios around a given center point and updates the positions of connected edges.
   * 按指定的比例缩放节点，并更新连接边的位置。
   * @param {number} ratioX - The scaling ratio in the x-direction.
   * x方向的缩放比例。
   * @param {number} [ratioY=ratioX] - The scaling ratio in the y-direction. If not provided, it defaults to ratioX.
   * y方向的缩放比例。如果未提供，则默认为ratioX。
   * @param {Point} [centerPoint] - The center point around which to scale the node. If not provided, it defaults to the node's current position.
   * 缩放节点的中心点。如果未提供，则默认为节点的当前位置。
   */
  scale(ratioX: number, ratioY?: number, centerPoint?: Point) {
    if (!ratioY) {
      ratioY = ratioX;
    }
    if (!centerPoint) {
      centerPoint = {
        x: this.configs.x,
        y: this.configs.y,
      };
    }
    const layer = this.layer;
    layer.translate(-centerPoint.x, -centerPoint.y);
    layer.scale(ratioX, ratioY);
    layer.translate(centerPoint.x, centerPoint.y);
    this.edges.forEach((edge: Edge) => {
      edge.updatePosition();
    });
    if (this.belong) {
      this.belong.refreshBox();
    }
    this.graph.autoDraw();
  }

  /**
   * Shows the node and optionally shows all edges connected to it.
   * 展示节点，并选择性地显示与之连接的所有边。
   * @param {boolean} [showEdges=true] - Whether to show all edges connected to the node.
   * 是否显示与节点连接的所有边。
   */
  show(showEdges = true) {
    super.show();
    if (showEdges) {
      this.edges.forEach((edge) => {
        if (edge.source?.visible && edge.target?.visible) {
          edge.show();
        }
      });
    }
  }

  /**
   * Hides the node and all edges connected to it.
   * 隐藏节点，并隐藏与之连接的所有边。
   */
  hide() {
    super.hide();
    this.edges.forEach((edge) => {
      edge.hide();
    });
  }

  /**
   * Sets the shutoff state of the node and updates its visibility and the visibility of connected edges accordingly.
   * 设置节点的 shutoff 状态，并相应地更新其可见性和连接边的可见性。
   * @param {boolean} shutoff - Whether to shut off the node.
   * 是否关闭节点。
   */
  setShutoff(shutoff: boolean) {
    this.shutoff = shutoff;
    if (!shutoff && this.visible) {
      this.layer.show();
      this.edges.forEach((edge) => {
        if (edge.source?.visible && edge.target?.visible) {
          edge.show();
        }
      });
      return;
    }
    if (shutoff) {
      this.layer.hide();
      this.edges.forEach((edge) => {
        if (edge.source?.visible && edge.target?.visible) {
          edge.hide();
        }
      });
    }
  }

  /**
   * Retrieves all edges connected to this node.
   * 获取与此节点连接的所有边。
   * @returns {Edge[]} - An array of edges connected to the node.
   * 与节点连接的 edges 数组。
   */
  getEdges() {
    return this.edges;
  }

  /**
   * Retrieves all nodes connected to this node.
   * 获取与此节点连接的所有节点。
   * @returns {Node[]} - An array of nodes connected to the node.
   * 与节点连接的 nodes 数组。
   */
  getLinkedNodes() {
    const graph = this.graph;
    const nodes: Node[] = this.sources.map((id: string) => {
      return graph.entityMap.node[id];
    });
    this.targets.forEach((id: string) => {
      nodes.push(graph.entityMap.node[id]);
    });
    return nodes;
  }

  /**
   * Retrieves the parent group of this node.
   * 获取此节点的父分组。
   * @returns {Group | null} - The parent group of the node, or null if the node has no parent.
   * 节点的父分组，如果节点没有父分组，则返回 null。
   */
  getDirectParent() {
    return this.belong;
  }

  /**
   * Retrieves the root parent of this node.
   * 获取此节点的根父分组。
   * @returns {Group | null} - The root parent of the node, or null if the node has no parent.
   * 节点的根父分组，如果节点没有父分组，则返回 null。
   */
  getRootParent() {
    let root = this.belong;
    while (root?.belong) {
      root = root.belong;
    }
    return root;
  }

  protected initAnchorShapes(anchorConfigs: AnchorConfigs[]) {
    const layer = this.layer;
    const anchorShapes: Shape[] = [];
    const anchorPositions = this.getAnchorRelativePositions();
    anchorConfigs.forEach((anchor: AnchorConfigs, i: number) => {
      anchor.visible = anchor.show !== "hover";
      anchor.index = i;
      // 兼容需要配置 position + offsets 而不需要锚点图形的情况
      if (!anchor.type && !anchor.setStyles) {
        return;
      }
      anchor.show = anchor.show ?? "always";
      const anchorMethod = getAnchorMethods(anchor.type);
      const shape = anchorMethod.init(
        layer,
        anchor,
        this.configs,
        anchorPositions[i]
      );
      shape.set("anchorIndex", i);
      anchorShapes.push(shape);
    });
    layer.set("__anchors", anchorShapes);
    const configs = this.configs;
    const appendSize = [0, 0, 0, 0];
    anchorShapes.forEach((shape: Shape, i: number) => {
      const { position, size } = shape.configs;
      const halfSize = size / 2;
      const hitWidth = shape.getHitWidth();
      const halfWidth = hitWidth / 2;
      updateAppendSize(
        appendSize,
        {
          left: position[0] - halfSize - halfWidth,
          top: position[1] - halfSize - halfWidth,
          width: size + hitWidth,
          height: size + hitWidth,
        },
        configs
      );
    });
    this.layer.set("__anchorAppendSize", appendSize);
  }

  /**
   * Destroys the node and all edges connected to it.
   * 销毁节点及其连接的所有边。
   */
  destroy(removeChild = true) {
    if (this.belong) {
      this.belong.removeChild(this, false, true, removeChild);
    }
    while (this.edges.length) {
      this.edges.pop()?.destroy();
    }
    delete this.graph.entityMap.node[this.get("id")];
    super.destroy();
  }
}
