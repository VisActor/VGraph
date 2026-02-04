import { GraphBase } from './base';
import { Group, Node, Edge, Entity } from '../models/entities';
import { LAYOUT_TYPES } from '../consts/layout_types';
import { GRAPH_EVENTS } from '../consts/meta_events';
import { DAGLayout, NestedDAG, ForceDirectedLayout, PipelineLayout } from '../layouts';
import { NodeConfigs, EdgeConfigs, GroupConfigs } from '../typings/model';
import { GraphData } from '../typings/data';
import { Point, Layer } from '../renderer';
import { GraphConfigs } from '../typings/graph';

export class Graph extends GraphBase {
  groupEdgeContainer: Layer;
  constructor(configs: GraphConfigs) {
    super(configs);
    const groupEdgeLayer = new Layer({ id: 'groupEdgeContainer' });
    this.container.add(groupEdgeLayer);
    groupEdgeLayer.toBack();
    this.groupEdgeContainer = groupEdgeLayer;
  }
  /**
   * Set graph data. The existing data will be replaced.
   * 设置数据，如果当前已有数据将被替换
   * @param {GraphData} data - An object containing information about nodes, groups, and edges for a graph.
   */
  data(data: GraphData) {
    this.emitEvent(GRAPH_EVENTS.DATA_START);
    this.set('emitGraphEvents', false);
    if (Object.keys(this.entityMap.node).length) {
      this.clear();
    }
    const autoDraw = this.disableAutoDraw();
    const { nodes, groups, edges } = data;
    this.initGroups(groups);
    this.initNodes(nodes);

    Object.values(this.entityMap.group).forEach((group: Group) => {
      group.addChildrenByIds(group.get('children'));
    });

    this.initEdges(edges);
    this.set('emitGraphEvents', true);
    this.emitEvent(GRAPH_EVENTS.DATA_END);
    this.autoLayout();
    this.enableAutoDraw(autoDraw);
  }

  /**
   * Updates the shapes and position of entities in the graph.
   * 更新数据，包括增删图元，修改图元的位置，属性等。如果当前已有数据将进行 merge 操作。
   * @param {GraphData} data - An object containing information about nodes, groups, and edges for a graph.
   */
  updateData(data: GraphData) {
    const autoDraw = this.disableAutoDraw();
    this.emitEvent(GRAPH_EVENTS.UPDATE_DATA_START);
    this.set('emitGraphEvents', false);
    const { nodes, groups, edges } = data;
    this.updateGroups(groups);
    this.updateNodes(nodes);
    this.updateEdges(edges);

    Object.values(this.entityMap.group).forEach((group: Group) => {
      group.updateChildrenByIds(group.get('children'));
    });
    this.set('emitGraphEvents', true);
    this.emitEvent(GRAPH_EVENTS.UPDATE_DATA_END);
    this.set('emitGraphEvents', false);
    this.autoLayout();
    this.set('emitGraphEvents', true);
    this.enableAutoDraw(autoDraw);
  }

  /**
   * Handle layout of the graph according to graph options, with the ability to focus on a specific entity.
   * 根据图中配置刷新图布局并按需聚焦于指定图元
   * @param {string} [id] - A string used to retrieve an node or group by ID.
   */
  autoLayout(id?: string) {
    if (this.get('autoLayout')) {
      this.layout(id);
    }
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
   * Configure automatic layout identification and automatically layout once immediately.
   * 配置自动布局标识，并立即自动布局一次。
   * @param [autoLayout=true] - A boolean value indicating whether to enable or disable the auto layout feature.
   */
  enableAutoLayout(autoLayout = true) {
    this.set('autoLayout', autoLayout);
    if (autoLayout) {
      this.autoLayout();
    }
  }

  /**
   * Handle layout of the graph, with the ability to focus on a specific entity.
   * 刷新图布局并按需聚焦于指定图元
   * @param {string} [id] - A string used to retrieve an node or group by ID.
   */
  layout(id?: string, args?: Record<string, unknown>) {
    const layoutMethod = this.get('layout');
    if (!layoutMethod) {
      return;
    }
    const autoLayout = this.disableAutoLayout();
    const entity = id ? this.getNodeById(id) || this.getGroupById(id) : null;
    let position: Point | null = null;
    if (entity) {
      const { left, top } = entity.getBBox();
      position = this.canvasToViewport(left, top);
    }
    const autoDraw = this.disableAutoDraw();
    this.emitEvent(GRAPH_EVENTS.LAYOUT_START);
    this.set('emitGraphEvents', false);
    layoutMethod?.layout(args);
    this.refresh();
    if (position) {
      const { left, top } = entity!.getBBox();
      const currentPosition = this.canvasToViewport(left, top);
      this.translate(position.x - currentPosition.x, position.y - currentPosition.y);
    }
    this.set('autoLayout', autoLayout);
    this.set('emitGraphEvents', true);
    this.emitEvent(GRAPH_EVENTS.LAYOUT_END);
    this.enableAutoDraw(autoDraw);
  }

  /**
   * Update node, edge, group positions based on the data.
   * 更新全量图元位置，不改变图元属性
   * @param {GraphData} data -  A data object contains information about the nodes that need to be updated.
   */
  updatePositions(data: GraphData) {
    const autoDraw = this.disableAutoDraw();
    const { nodes } = data;
    nodes.forEach((node: NodeConfigs) => {
      const n = this.getNodeById(node.id!);
      if (n) {
        n.updatePosition(node.x, node.y);
      }
    });

    Object.values(this.entityMap.group).forEach((group: Group) => {
      group.refreshBox();
    });

    Object.values(this.entityMap.edge).forEach((edge: Edge) => {
      edge.updatePosition();
    });
    this.enableAutoDraw(autoDraw);
  }

  /**
   * Creates and adds nodes, edges, or groups to a graph.
   * 根据配置数据新增一个实例
   * @param {'node' | 'edge' | 'group'} type - The `type` parameter specifies the type of entity to be
   * added, which can be either 'node', 'edge', or 'group'.
   * @param {any} configs - An object that contains the configuration settings for the entity being added.
   * @param {boolean} [temp] - A boolean flag that indicates whether the entity being added is temporary or not.
   * @returns Returns the entity that was created (Node, Edge, or Group).
   */
  add(type: 'node' | 'edge' | 'group', configs: any, temp?: boolean): any {
    this.emitEvent(GRAPH_EVENTS.ADD_START, { type });
    let entity;
    switch (type) {
      case 'node':
        entity = new Node(configs, this, this.nodeContainer, false, temp);
        break;
      case 'edge':
        try {
          entity = new Edge(configs, this, this.edgeContainer, temp);
        } catch (e: any) {
          this.throw(e);
        }
        break;
      case 'group':
        entity = new Group(configs, this, this.groupContainer, temp);
        // 由于可能嵌套，批量新增和更新都是单独处理，单个比较少，先写在外面
        // eslint-disable-next-line no-case-declarations
        const groupId = entity.get('groupId');
        if (groupId) {
          const group = this.getGroupById(configs.groupId);
          group.addChild(entity);
        }
        break;
      default:
        this.throw(`Unrecognized type: ${type}`);
        return;
    }
    if (!entity) {
      return;
    }
    const id = this.getEntityId(configs, type);
    configs.id = id;
    if (!this.addToMap(type, entity)) {
      return;
    }
    // for Viewer 节点层叠次序
    type !== 'edge' && entity.layer?.set('id', id);
    if (type === 'group') {
      if (configs.children) {
        (entity as Group).addChildrenByIds(configs.children);
      } else {
        (entity as Group).refreshBox();
      }
    }
    this.emitEvent(GRAPH_EVENTS.ADD_END, { target: entity });
    this.autoLayout();
    this.autoDraw();
    return entity;
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
    const shouldLayout = configs.width || configs.height || configs.r || configs.groupId || configs.children;
    entity.updateData(configs);
    shouldLayout && this.autoLayout(entity.get('id'));
    this.autoDraw();
    this.emitEvent(GRAPH_EVENTS.UPDATE_END, { target: entity });
  }

  /**
   * Removes an entity from a graph
   * 删除一个实例，此方法会同步删除实例对应的数据。
   * @param {Entity} entity - An entity instance that is being removed from a graph.
   */
  remove(entity: Entity) {
    if (!entity) {
      return;
    }
    this.emitEvent(GRAPH_EVENTS.REMOVE_START, { target: entity });
    const type = entity.type;
    entity.destroy();
    delete this.entityMap[type][entity.get('id')];
    this.autoLayout();
    this.autoDraw();
    this.emitEvent(GRAPH_EVENTS.REMOVE_END, { target: entity });
  }

  /**
   * Removes all duplicate edges in the graph temporarily.
   * 删除单条重复连线,保持节点上关系不变的内部方法
   * @param {Edge} edge - An edge entity to be removed from the graph.
   */
  removeDuplicateEdge(edge: Edge) {
    delete this.entityMap.edge[edge.get('id')];
    edge.destroy(false);
    this.autoDraw();
  }

  /**
   * Initializes groups with optional configurations.
   * @param {GroupConfigs[]} [groups] - The `groups` parameter is an array of group data.
   */
  private initGroups(groups?: GroupConfigs[]) {
    if (!groups) {
      return;
    }
    const groupContainer = this.getGroupContainer();
    for (const groupData of groups) {
      const g = new Group(groupData, this, groupContainer);
      groupData.id = this.getEntityId(groupData, 'group');
      this.addToMap('group', g);
      g.layer.set('id', groupData.id);
    }

    // 防止因分组前后顺序找不到分组，单独处理分组嵌套
    Object.values(this.entityMap.group).forEach((g: Group) => {
      const groupId = g.get('groupId');
      if (groupId) {
        const parentGroup = this.getGroupById(groupId);
        if (parentGroup) {
          parentGroup.addChild(g);
        }
      }
    });
  }

  /**
   * Initializes nodes with optional configurations.
   * @param {NodeConfigs[]} [nodes] - The `nodes` parameter is an array of node data.
   */
  private initNodes(nodes: NodeConfigs[]) {
    const nodeContainer = this.getNodeContainer();
    for (const nodeData of nodes) {
      const n = new Node(nodeData, this, nodeContainer, true);
      nodeData.id = this.getEntityId(nodeData, 'node');
      this.addToMap('node', n);
      // for Viewer 节点层叠次序
      n.layer?.set('id', nodeData.id);
    }
  }

  /**
   * Initializes edges with optional configurations.
   * @param {EdgeConfigs[]} [edges] - The `edges` parameter is an array of edge data.
   */
  private initEdges(edges: EdgeConfigs[]) {
    const edgeContainer = this.getEdgeContainer();
    for (const edge of edges) {
      try {
        const e = new Edge(edge, this, edgeContainer);
        edge.id = this.getEntityId(edge, 'edge');
        this.addToMap('edge', e);
      } catch (e: any) {
        this.throw(e);
      }
    }
  }

  /**
   * Update group entities based on the provided data.
   * @param {GroupConfigs[]} [groups] - The `groups` parameter is an array of group data.
   */
  private updateGroups(groups?: GroupConfigs[]) {
    const groupEntities = this.entityMap.group;
    const groupContainer = this.getGroupContainer();
    const visId = {};
    if (!groups) {
      Object.values(groupEntities).forEach((group: any) => {
        group.destroy();
      });
      return;
    }
    for (const groupData of groups) {
      let id = groupData.id!;
      let g = groupEntities[id];
      if (!g) {
        id = this.getEntityId(groupData, 'group');
        groupData.id = id;
        g = new Group(groupData, this, groupContainer);
        this.addToMap('group', g);
        g.layer?.set('id', id);
      } else {
        g.updateData(groupData);
      }
      visId[id] = true;
    }
    Object.keys(groupEntities).forEach((k) => {
      if (!visId[k]) {
        groupEntities[k].destroy();
      } else {
        groupEntities[k].updateGroup();
      }
    });
  }

  /**
   * Update node entities based on the provided data.
   * @param {NodeConfigs[]} [nodes] - The `nodes` parameter is an array of node data.
   */
  private updateNodes(nodes: NodeConfigs[]) {
    const nodeEntities = this.entityMap.node;
    const nodeContainer = this.getNodeContainer();
    const visId = {};
    const defaultNodeFn = this.get('setDefaultNode');
    for (const nodeData of nodes) {
      let id = nodeData.id;
      if (!id && defaultNodeFn) {
        id = defaultNodeFn(nodeData)?.id;
      }
      visId[id!] = true;
      let n = nodeEntities[id!];
      if (!n) {
        n = new Node(nodeData, this, nodeContainer, true);
        this.addToMap('node', n);
        // for Viewer 节点层叠次序
        n.layer?.set('id', id);
      } else {
        n.updateData(nodeData, false);
      }
    }
    Object.keys(nodeEntities).forEach((k) => {
      if (!visId[k]) {
        nodeEntities[k].destroy();
      }
    });
  }

  protected getLayouts() {
    return {
      [LAYOUT_TYPES.DAG]: DAGLayout,
      [LAYOUT_TYPES.NESTED_DAG]: NestedDAG,
      [LAYOUT_TYPES.FORCE]: ForceDirectedLayout,
      [LAYOUT_TYPES.PIPELINE]: PipelineLayout,
    };
  }

  /**
   * Update edge entities based on the provided data.
   * @param {EdgeConfigs[]} [edges] - The `edges` parameter is an array of edge data.
   */
  private updateEdges(edges: EdgeConfigs[]) {
    const edgeEntities = this.entityMap.edge;
    const edgeContainer = this.getEdgeContainer();
    const visId = {};
    const defaultEdgeFn = this.get('setDefaultEdge');
    for (const edgeData of edges) {
      let id = edgeData.id;
      if (!id && defaultEdgeFn) {
        id = defaultEdgeFn(edgeData)?.id;
      }
      let n = edgeEntities[id!];
      if (!n) {
        try {
          if (!id) {
            id = this.getEntityId(edgeData, 'edge');
          }
          edgeData.id = id;
          n = new Edge(edgeData, this, edgeContainer);
          this.addToMap('edge', n);
        } catch (e: any) {
          this.throw(e);
        }
      } else {
        n.updateData(edgeData);
      }
      visId[id!] = true;
    }
    Object.keys(edgeEntities).forEach((k) => {
      if (!visId[k]) {
        edgeEntities[k].destroy();
      }
    });
  }

  /**
   * Export data from the graph.
   * 导出图中数据
   * @param [fn] - A filter that determines what to export.
   * @returns An object containing information about nodes, groups, and edges for a graph.
   */
  getData(fn?: (entity: Node | Edge | Group) => Record<string, unknown>) {
    const result: GraphData = { nodes: [], edges: [] };
    if (!fn) {
      fn = (entity: Node | Edge | Group) => entity.configs;
    }
    result.nodes = Object.values(this.entityMap.node).map(fn);
    result.edges = Object.values(this.entityMap.edge).map(fn);
    result.groups = Object.values(this.entityMap.group).map(fn);
    return result;
  }
}
