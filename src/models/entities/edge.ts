import { EdgeLayer, Layer, NodeLayer, Shape } from '../../renderer';
import { Node } from './node';
import { EdgeConfigs } from '../../typings/model';
import { Entity } from './entity';
import { Group } from './group';
import { ENTITY_TYPES } from '../../consts/entity_types';
import { getEdgeMethods } from '../factories';
import { getDefaultLoopAnchors } from '../factories/path';
import { Graph, TreeGraph } from '../../graph';
import { EDGE_TYPES } from '../../consts/edge_types';
export interface IEdge {
  configs: EdgeConfigs;
  source: Node | Group | null;
  target: Node | Group | null;

  setState: (state: string, onlyState?: boolean) => void;
  updateData: (data: any) => void;
  updatePosition: () => void;

  show: () => void;
  hide: () => void;
  isVisible: () => boolean;

  setSource: (source: string) => void;
  setTarget: (target: string) => void;
  getSource: () => Node | Group | null;
  getTarget: () => Node | Group | null;

  destroy: () => void;
}

export class Edge extends Entity implements IEdge {
  type = ENTITY_TYPES.EDGE;
  // configs: EdgeConfigs = {};
  keyShape: Shape | null;
  // 边真实连接的实体
  source: Node | Group;
  target: Node | Group;

  constructor(configs: EdgeConfigs, graph: Graph | TreeGraph, container: Layer, temp?: boolean) {
    super(configs, graph, container, temp);
    const { source, target } = this.getRealLinkEntities(configs.source, configs.target);
    this.source = source;
    this.target = target;
    this.keyShape = null;
    if (temp) {
      return;
    }
    this.layer.set({ source: source?.layer, target: target?.layer });
    this.keyShape = this.initContent(this.layer, configs);
  }

  private initContent(layer: NodeLayer, configs: EdgeConfigs) {
    const shapeMethods = getEdgeMethods(configs.type, configs);
    const keyShape = shapeMethods.init(layer, this.getEdgeConfigs());
    return keyShape;
  }


  protected mergeConfigs(configs: any) {
    const defaultConfigs = this.getDefaultConfigs('setDefaultEdge');
    return Object.assign(configs, defaultConfigs);
  }

  protected initLayer(configs: any) {
    const layer = new EdgeLayer({ id: configs.id });
    return layer;
  }

  /**
    * Get the configuration information of the edge. The configuration information contains the calculated startPoint coordinates, endPoint coordinates, controlPoints, source, target, etc.
    * 获取边的配置信息。包含经过计算的起始点坐标、终止点、控制点、source、target 等信息
    * @returns {EdgeConfigs} edgeConfigs
   */
  private getEdgeConfigs() {
    let { startPoint, endPoint } = this.getTerminal();

    // 没有锚点的情况下，router 会将 startPoint 或 endPoint 添加进  controlPoints 避免控制点对 endPoint 影响
    // 所以需要将 startPoint 或 endPoint 从 controlPoints 去重
    // 为统一逻辑，在此统一去除相邻重复的控制点
    let controlPoints = this.configs.controlPoints;
    if (controlPoints) { // 合并起始点与终止点，并去除相邻重复的控制点
      let points = controlPoints.concat() ?? [];
      points.unshift(startPoint);
      points.push(endPoint);
      points = points.filter((item: number[], idx: number) => { // 去除相邻重复的点
        if (idx === 0) {
          return true;
        }
        return !(item[0] === points[idx - 1][0] && item[1] === points[idx - 1][1]); // 判断是否与上一个点重复
      });
      startPoint = points.shift();
      endPoint = points.pop() ?? startPoint; // 有可能去重之后只剩一个点
      if (points.length) {
        controlPoints = points;
      } else {
        controlPoints = undefined; // 无需控制点
      }
    }

    return {
      ...this.configs,
      controlPoints,
      source: this.source,
      target: this.target,
      startPoint,
      endPoint,
    };
  }

  /**
 * Updates the source and target nodes of the edge and updates the position.
 * 更新边的源节点和目标节点，并更新边的位置信息。
 */
  updateNodes() {
    const sourceId = this.configs.source;
    const targetId = this.configs.target;
    const { source, target } = this.getRealLinkEntities(sourceId, targetId);
    if (this.source !== source || this.target !== target) {
      this.source = source;
      this.target = target;
    }
    this.updatePosition();
  }

  /**
   * Updates the edge's configuration data.
   * 更新边的配置数据。
   * @param {Partial<EdgeConfigs>} data - The partial configuration data to update the edge with.
   * 要更新边的部分配置数据。
   */
  updateData(data: Partial<EdgeConfigs>) {
    const { type } = this.configs;
    const sourceId = this.configs.source;
    const targetId = this.configs.target;
    let newConfigs = Object.assign({}, this.configs, data);
    const defaultConfigs = this.getDefaultConfigs('setDefaultEdge', newConfigs);
    newConfigs = Object.assign(newConfigs, defaultConfigs, data);
    this.configs.type = newConfigs.type;

    // 可能存在 type 和 source target 均改变的情况，因此需要先考虑 source target 的变化.
    if (sourceId !== newConfigs.source || targetId !== newConfigs.target) {
      this.updateSourceTarget(newConfigs.source, newConfigs.target);
    }

    // Node removeEdge 之后再更新 configs， 否则 Node 无法正确更新。
    this.configs = newConfigs;

    if (newConfigs.type !== type) {
      this.layer.clear();
      this.keyShape = this.initContent(this.layer, newConfigs);
      this.recoverStates();
      return;
    }
    const shapeMethods = getEdgeMethods(type, newConfigs);
    shapeMethods.setStateStyles(this.layer, this._styleCache); // keyShape 恢复原有样式
    const keyShape = shapeMethods.update(this.layer, this.getEdgeConfigs());
    if (keyShape) {
      this.keyShape = keyShape;
    }
    this.recoverStates();
    this.graph.autoDraw();
  }

  /**
   * Updates the position of the edge based on its current configuration.
   * 根据当前配置更新边的位置。
   */
  updatePosition() {
    const shapeMethods = getEdgeMethods(this.configs.type, this.configs);
    const edgeConfigs = this.getEdgeConfigs();
    if (shapeMethods.updatePath) {
      shapeMethods.updatePath(this.layer, shapeMethods.getConfigsForShape(edgeConfigs));
    } else {
      this.layer.clear();
      this.keyShape = shapeMethods.init(this.layer, edgeConfigs);
    }
    this.graph.autoDraw();
  }

  protected onSetState(state: string, onlyState?: boolean) {
    const configs = this.configs;
    const setStateStyles = this.graph.get('setEdgeStateStyles');
    if (setStateStyles) {
      const stateStyles = setStateStyles(state, configs, this);
      if (!stateStyles) {
        return;
      }
      this.cacheStyles(state, stateStyles);
      const shapeMethods = getEdgeMethods(configs.type, this.configs);
      shapeMethods.setStateStyles(this.layer, stateStyles);
    }
  }

  protected onClearStates() {
    const shapeMethods = getEdgeMethods(this.configs.type, this.configs);
    shapeMethods.setStateStyles(this.layer, this._styleCache);
  }

  // FIXME: 自环的 setSource setTarget 由于 type 为 loop 不能正确更新
  // 场景较少暂不修复，建议用户使用 updateData 进行变更
  /**
   * Sets the source node of the edge.
   * 设置边的源节点。
   * @param {string} source - The ID of the source node to set.
   * 要设置的源节点的ID。
   */
  setSource(source: string) {
    delete this.configs.startPoint;
    this.updateSourceTarget(source, this.configs.target);
  }

  /**
   * Sets the target node of the edge.
   * 设置边的目标节点。
   * @param {string} target - The ID of the target node to set.
   * 要设置的目标节点的ID。
   */
  setTarget(target: string) {
    delete this.configs.endPoint;
    this.updateSourceTarget(this.configs.source, target);
  }

  /**
   * Updates the source and target nodes of the edge.
   * 更新边的源节点和目标节点。
   * @param {string} source - The ID of the new source node.
   * 新的源节点的ID。
   * @param {string} target - The ID of the new target node.
   * 新的目标节点的ID。
   */
  updateSourceTarget(source?: string, target?: string) {
    if (this.configs.source) {
      const originSource = this.getEntityById(this.configs.source);
      this.removeFromEntity(originSource);
    }
    if (this.configs.target) {
      const originTarget = this.getEntityById(this.configs.target);
      this.removeFromEntity(originTarget);
    }
    this.configs.source = source;
    this.configs.target = target;
    this.setTerminalNode();
  }

  protected setTerminalNode() {
    const sourceId = this.configs.source;
    const targetId = this.configs.target;
    const { source, target } = this.getRealLinkEntities(sourceId, targetId);
    this.source = source;
    this.target = target;
    this.layer.set({
      source: source.layer,
      target: target.layer,
    });
  }

  /**
   * Retrieves the terminal points (startPoint and endPoint) of the edge.
   * 获取边的终端点（起始点和终止点）。
   * @returns {{ startPoint: number[], endPoint: number[] }} - The terminal points of the edge.
   * 边的终端点。
   */
  getTerminal() {
    const source = this.source;
    const target = this.target;
    const configs = this.configs;
    const { startPoint, endPoint } = configs;

    if (startPoint && endPoint) {
      return {
        startPoint,
        endPoint,
      };
    }
    const controlPoints = this.configs.controlPoints;
    if (controlPoints?.length) {
      return {
        startPoint: startPoint ? startPoint : source!.getLinkPoint(controlPoints[0], configs.sourceAnchor, this, 'source'),
        endPoint: endPoint ? endPoint : target!.getLinkPoint(controlPoints[controlPoints.length - 1], configs.targetAnchor, this, 'target'),
      }
    }
    // 自环且没有控制点
    if (source === target) {
      return getDefaultLoopAnchors(source, this.configs);
    }
    const sourceCenter = startPoint || source!.getCenterPoint();
    const targetCenter = endPoint || target!.getCenterPoint();
    return {
      startPoint: startPoint ? startPoint : source!.getLinkPoint(targetCenter, configs.sourceAnchor, this, 'source'),
      endPoint: endPoint ? endPoint : target!.getLinkPoint(sourceCenter, configs.targetAnchor, this, 'target'),
    };
  }

  private getRealLinkEntities(sourceId?: string, targetId?: string) {
    if (this.get('startPoint') && this.get('endPoint')) {
      return {
        source: null,
        target: null,
      };
    }
    const graph = this.graph;
    const layer = this.layer;
    // 自环
    // eslint-disable-next-line eqeqeq
    if (this.configs.type === 'loop' || sourceId === targetId) {
      const node = this.getEntityById(sourceId || targetId!);
      this.addToEntity(node);
      this.configs.type = 'loop';
      return {
        source: node,
        target: node,
      };
    }

    const source = this.getEntityById(sourceId!);

    // 从一个节点引一条连线的情况
    // eslint-disable-next-line eqeqeq
    if (source && targetId == null && this.get('endPoint')) {
      return { source, target: null };
    }

    const target = this.getEntityById(targetId!);
    // 边所属的实体
    this.addToEntity(source);
    this.addToEntity(target);
    if (layer && this.shouldAddEdgeToBack(source, target)) {
      graph.groupEdgeContainer.add(layer);
    } else {
      layer && graph.edgeContainer.add(layer);
    }
    const sourceAncestors = this.getAncestors(source);
    const targetAncestors = this.getAncestors(target);
    for (let i = 0; i < targetAncestors.length; i++) {
      const index = sourceAncestors.indexOf(targetAncestors[i]);
      // 在同一个分组中
      if (index >= 0) { // index = 0, i = 0 情况下说明是嵌套关系，应该取它本身。
        return {
          source: this.getEntityById(sourceAncestors[index - 1 < 0 ? 0 : index - 1]),
          target: this.getEntityById(targetAncestors[i - 1 < 0 ? 0 : i - 1]),
        }
      }
    }

    // 没有共同分组，返回最外层分组
    return {
      source: this.getEntityById(sourceAncestors.pop()),
      target: this.getEntityById(targetAncestors.pop()),
    }
  }

  // FIXME: 需要找一种更好的方式来解决分组 keyShape，anchor与连线之间的层叠关系问题
  // 目前先回退到常见场景都正常的方式，多层嵌套分组层叠关系问题未解决
  private shouldAddEdgeToBack(source: Node | Group, target: Node | Group) {
    // 都是节点，不后置
    if (source.type === 'node' && target.type === 'node') {
      return false;
    }

    if (source.belong || target.belong) {
      return false;
    }
    // function getAncestors(node: Node | Group) {
    //   const ancestors = [node];
    //   while (node.belong) {
    //     ancestors.push(node.belong);
    //     node = node.belong;
    //   }
    //   return ancestors;
    // }
    // const sourceAncestors = getAncestors(source);
    // const targetAncestors = getAncestors(target);
    // // 属于同一个分组，不后置
    // for (const ancestor of targetAncestors) {
    //   const index = sourceAncestors.indexOf(ancestor);
    //   if (index >= 0) {
    //     return false;
    //   }
    // }
    return true;
  }

  /**
   * Adds an edge to the node or group and updates the sources and targets arrays accordingly.
   * 添加连线刷新节点或分组间的关联关系。
   * @param {Node|Group} entity - The entity to be updated.
   */
  private addToEntity(entity: Node | Group) {
    // 避免重复添加
    if (entity.edges.includes(this)) {
      return;
    }
    entity.edges.push(this);
    const { source, target } = this.configs;
    const id = entity.get('id');
    // 自环
    if (this.get('type') === EDGE_TYPES.LOOP && !entity.targets.includes(id)) {
      entity.targets.push(id);
      return;
    }
    if (source === id && target) {
      if (!entity.targets.includes(target)) {
        entity.targets.push(target);
      }
    } else if ( target === id && source) {
      if (!entity.sources.includes(source)) {
        entity.sources.push(source!);
      }
    }
  }

  /**
   * Removes the edge from the node or group and updates the sources and targets arrays accordingly.
   * 从节点或分组中移除指定边，更新关系。
   * @param {Node|Group} entity - The node or group to be updated.
   */
  private removeFromEntity(entity: Node | Group) {
    let index = entity.edges.indexOf(this);
    const id = entity.get('id');
    if (index >= 0) {
      entity.edges.splice(index, 1);
    }
    if (this.get('type') === EDGE_TYPES.LOOP) {
      let remove = true;
      entity.edges.forEach((edge: Edge) => {
        if (edge.get('type') === EDGE_TYPES.LOOP) {
          remove = false;
        }
      });
      if (remove) {
        index = entity.targets.indexOf(id);
        if (index >= 0) {
          entity.targets.splice(index, 1);
        }
      }
      return;
    }
    const { source, target } = this.configs;
    const tobeRemove = target === id ? 'source' : 'target';
    const removeValue = tobeRemove === 'source' ? source : target;
    const neighbor = source === id ? target : source;
    let remove = true;
    entity.edges.forEach((edge: Edge) => {
      if (edge.get(tobeRemove) === removeValue) {
        remove = false;
        return false;
      }
    });
    if (remove && neighbor) {
      const direction = source === id ? entity.targets : entity.sources;
      index = direction.indexOf(neighbor);
      if (index >= 0) {
        direction.splice(index, 1);
      }
    }
  }

  private getAncestors(entity: Entity) {
    const result = [];
    while (entity) {
      result.push(entity.get('id'));
      if (entity.belong && !entity.belong.get('linkNode')) {
        entity = entity.belong;
      } else {
        break;
      }
    }
    return result;
  }

  private getEntityById(id: string, report = true) {
    let entity = this.graph.getNodeById(id);
    if (!entity) {
      entity = this.graph.getGroupById(id);
      if (!entity) {
        if (report) {
          throw new Error(`Cannot find node or group, id :${id}`);
        }
        return null;
      }
    }
    return entity;
  }

  /**
   * Retrieves the source node entity of the edge.
   * 获取边的源节点节点实例。
   * @returns {Node | Group | null} - The source node entity of the edge.
   * 边的源节点节点实例。
   */
  getSource() {
    return this.source;
  }

  /**
   * Retrieves the target node entity of the edge.
   * 获取边的目标节点节点实例。
   * @returns {Node | Group | null} - The target node entity of the edge.
   * 边的目标节点节点实例。
   */
  getTarget() {
    return this.target;
  }
  /**
   * Retrieves the keyShape of the edge.
   * 获取边的关键形状。
   * @returns {Shape} - The keyShape of the edge.
   * 边实例的 keyShape。
   */
  getKeyShape() {
    return this.keyShape!;
  }

  /**
   * Destroys the edge.
   * 销毁边。
   */
  destroy(removeRelations = true) {
    const sourceNode = this.getEntityById(this.get('source'), false);
    const targetNode = this.getEntityById(this.get('target'), false);
    if (removeRelations) {
      if (sourceNode) {
        this.removeFromEntity(sourceNode);
      }
      if (targetNode) {
        this.removeFromEntity(targetNode);
      }
    } else {
      if (sourceNode) {
        const index = sourceNode.edges.indexOf(this);
        if (index >= 0) {
          sourceNode.edges.splice(index, 1);
        }
      }
      if (targetNode) {
        const index = targetNode.edges.indexOf(this);
        if (index >= 0) {
          targetNode.edges.splice(index, 1);
        }
      }
    }
    delete this.graph.entityMap.edge[this.get('id')];
    super.destroy();
  }
}
