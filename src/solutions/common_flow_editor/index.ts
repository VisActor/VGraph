import { Edge, Group, Node } from '../../models/entities';
import { dragCanvas, panZoom, multipleSelect } from '../../behaviors';
import { Graph } from '../../graph';
import {
  Scroller, ScrollerOptions, Stack, SelectCommand, UpdateCommand, BatchCommand,
  AddCommand, RemoveCommand, CopyCommand, CutCommand, PasteCommand, MoveNodeCommand, LayoutCommand,
  Grid, NodeMover, InsertNodeCommand, Background, Shortcuts, execClipboardEvent, generateSnapshot, getDefaultShortcuts,
  GridOptions, BackgroundOptions
} from '../../components';
import { normalizePadding } from '../../utils/graph';
import { Router } from '../../components/router';
import { EdgeEditor, EdgeEditorOptions } from '../../components/edge_editor';
import { EdgeData, GraphData, NodeData } from '../../typings/data';
import { HandlerOption } from '../../components/shortcuts';
import { NodeMoverOptions } from '../../components/node_mover';
import { StackSelections } from '../../typings/stack';
import { DOM_ANCHOR_SELECTOR } from '../../consts/entity_types';
import { selectionIntoView } from '../utils/view';
import { getDefaultBizData } from '../../utils';
import { GraphEvent } from '../../typings/event';

export type CommonFlowEditorOptions = {
  /**
   * The graph initial data.
   * 初始图数据。
   */
  data?: { nodes: Record<string, unknown>[], edges: Record<string, unknown>[], groups?: Record<string, unknown>[] };

  /**
   * The container of the graph.
   * 图容器。
   */
  container: string | HTMLDivElement;
  /**
   * The size of the graph, [width, height].
   * 图大小, [width, height]。
   */
  graphSize: number[];

  /**
   * The padding of the graph.
   * 图的 padding。
   */
  padding?: number | number[];
  /**
   * Use canvas or DOM to render nodes and group titles.
   * 是否使用 canvas 渲染节点和分组
   */
  renderMode?: 'canvas' | 'dom';

  /**
   * The default node style, same as Graph's setDefaultNode config.
   * 节点默认样式配置，同 Graph 同名配置。
   */
  setDefaultNode: (nodeData: any) => { [k: string]: any };
  /**
   * The default edge style, same as Graph's setDefaultEdge config.
   * 边默认样式配置，同 Graph 同名配置。
   */
  setDefaultEdge?: (edgeData: any) => { [k: string]: any };
  /**
   * The node state styles, same as Graph's setNodeStateStyles config.
   * 节点状态样式配置，同 Graph 同名配置。
   */
  setNodeStateStyles?: (state: string, nodeData: any, node: Node) => { [k: string]: any },
  /**
   * The edge state styles, same as Graph's setEdgeStateStyles config.
   * 边状态样式配置，同 Graph 同名配置。
   */
  setEdgeStateStyles?: (state: string, edgeData: any, edge: Edge) => { [k: string]: any },
  /**
   * The group style, same as Graph's setDefaultGroup config.
   * 分组样式配置，同 Graph 同名配置。
   */
  setDefaultGroup?: (groupData: any) => { [k: string]: any }; // 先开一个 Group 展示的口子。编辑先hold。
  /**
   * The group state styles, same as Graph's setGroupStateStyles config.
   * 分组状态样式配置，同 Graph 同名配置。
   */
  setGroupStateStyles?: (state: string, groupData: any, group: Group) => { [k: string]: any };

  /**
   * Scroller component options.
   * 滚动条组件配置，是否开启滚动条以及滚动条配置项。
   */
  scroller?: {
    /**
     * Whether to enable the scroller, default true.
     * 是否开启滚动条。
     */
    enable?: boolean;
    /**
     * The scroller options, same as Scroller's options.
     * 滚动条配置项，同 Scroller 的配置项。
     */
    options?: ScrollerOptions;
  };
  /**
   * Grid component options.
   * 数据网格配置，配合 Router 等组件加速计算。
   */
  grid?: {
    /**
     * Whether to enable the grid component, default true.
     * 是否开启数据网格，若不开启则无法正常使用 Router。
     */
    enable?: boolean;
    /**
     * The grid options, same as Grid component's options.
     * 数据网格配置项，同 Grid 组件的配置项。
     */
    options?: GridOptions;
  },
  /**
   * NodeMover component options.
   * 节点移动组件配置，是否开启节点移动以及节点移动配置项。
   */
  nodeMover?: {
    /**
     * Whether to enable the NodeMover, default true.
     * 是否开启 nodeMover 组件。
     */
    enable?: boolean;
    /**
     * The NodeMover options, same as NodeMover's options.
     * NodeMover 配置项，同 NodeMover 的配置项。
     */
    options?: NodeMoverOptions;
  },
  /**
   * EdgeEditor component options.
   * 连边编辑组件配置，是否开启拖拽编辑连线以及连线编辑组件配置项。
   */
  edgeEditor?: {
    /**
     * Whether to enable the EdgeEditor, default true.
     * 是否开启拖拽连线编辑组件。
     */
    enable?: boolean;
    /**
     * The EdgeEditor options, same as EdgeEditor's options.
     * 连线编辑组件配置项，同 EdgeEditor 的配置项。
     */
    options?: EdgeEditorOptions;
  };
  /**
   * Grid step number. It will affect the performance of the background and router components.
   * 网格一格的大小。影响背景组件和 Router 组件性能和精度。
   */
  // TODO 和 grid 配置项合并
  gridStep?: number;
  /**
   * Whether to enable the background, grid or dot.
   * 背景类型。
   */
  background?: 'grid' | 'dot' | 'none' | Partial<BackgroundOptions>;
  /**
   * Whether to enable the router, default true.
   * 是否开启智能路由。如果画布很大，连线很多，且 gridStep 较小，则会影响性能，默认开启。
   */
  router?: boolean;
  /**
   * Shortcuts config.
   * 快捷键配置。
   */
  shortcuts?: {
    /*
     * Whether to enable the shortcuts, default true.
     * 是否开启快捷键，以及自定义快捷键配置。
     */
    enable?: boolean;
    /*
     * Custom shortcuts config.
     * 自定义快捷键配置。
     */
    customShortcuts?: {
      [type: string]: HandlerOption;
    } | ((defaultShortcuts: { [type: string]: HandlerOption }, stack?: Stack) => {
      [type: string]: HandlerOption;
    });
  },
  /**
   * Editor mode, default 'edit'.
   * 图编辑模式，默认可编辑态 edit。
   */
  mode?: 'edit' | 'read' | string;
  /**
   * Customize selections.
   * 选区自定义。
   */
  select?: {
    /*
     * The entity types that can be selected.
     * 可选的图元类型
     */
    targets?: ('node' | 'edge' | 'group')[]
    /*
     * Whether to enable multiple choose.
     * 是否开启多选
     */
    multiple?: boolean;
    /*
     * Customize the key to select multiple entities.
     * 自定义点选辅助键
     */
    modifierKey?: string[];
    /*
     * Whether current entity can be selected.
     * 当前图元是否可以被选中
     */
    shouldSelectItem?: (ev: GraphEvent, selections: (Node|Edge|Group)[]) => boolean;
  }
};

// 自由编辑场景适当放宽 stack 的 capacity 。
const STACK_CAPACITY = 50;


export class CommonFlowEditor {
  graph: Graph;
  stack: Stack;
  options: CommonFlowEditorOptions;
  destroyed = false;
  lastMouseClient: number[] = [];
  components: {
    grid?: Grid,
    router?: Router,
    nodeMover?: NodeMover,
    edgeEditor?: EdgeEditor,
    scroller?: Scroller,
    background?: Background,
    shortcuts?: Shortcuts,
  } = {};
  constructor(options: CommonFlowEditorOptions) {
    this.options = options;
    this.graph = this.initGraph();
    this.stack = this.initStack();
    this.initEvents();
    this.initComponents();
  }


  private initGraph() {
    const options = Object.assign({}, this.getDefaultOptions(), this.options);
    this.options = options;
    const { container, graphSize } = options;
    const padding = normalizePadding(options.padding || 40);
    this.options.padding = padding;
    const graph = new Graph({
      container,
      width: graphSize[0],
      height: graphSize[1],
      renderMode: options.renderMode,
      padding,
      setDefaultNode: options.setDefaultNode,
      setDefaultEdge: options.setDefaultEdge,
      setNodeStateStyles: options.setNodeStateStyles,
      setEdgeStateStyles: options.setEdgeStateStyles,
      setDefaultGroup: options.setDefaultGroup,
      setGroupStateStyles: options.setGroupStateStyles,
    });
    if (options.scroller && (options.scroller.enable === undefined || options.scroller.enable === true)) {
      let scrollerOptions = {
        panZoom: { zoom: false, strict: true },
        dragCanvas: { limit: true },
      };
      if (options.scroller?.options) {
        scrollerOptions = Object.assign(scrollerOptions, options.scroller.options);
      }
      this.components.scroller = new Scroller(graph, scrollerOptions);
    } else {
      graph.addBehavior(dragCanvas, {
        limit: false
      });
      graph.addBehavior(panZoom, {
        limit: false
      });
    }
    if (options.data) {
      graph.data(options.data);
    }
    return graph;
  }


  private initComponents() {
    const defaultOptions = this.getDefaultOptions();
    const {
      mode,
      nodeMover,
      edgeEditor,
      background,
      shortcuts,
      grid,
    } = this.options;

    let routerComponent;
    // grid
    if (grid!.enable !== false) {
      const gridStep = this.options.gridStep || 10;
      const gridComponent = new Grid(this.graph, { ...grid!.options, step: gridStep, extraWidth: 0.5 * gridStep }); // extraWidth 设置为一个 0.5 step, 防止擦边连线
      this.components.grid = gridComponent;
      gridComponent.refresh();

      // router
      if (this.options.router !== false) {
        routerComponent = new Router(gridComponent, {
          minDist: gridStep > 10 ? 25 : 20,
        });
        this.components.router = routerComponent as any;
      }
    }

    // nodeMover
    if (nodeMover?.enable !== false) {
      const nodeMoverOptions = Object.assign(defaultOptions.nodeMover.options, nodeMover?.options || {});
      nodeMoverOptions.router = routerComponent;
      nodeMoverOptions.stack = this.stack;
      nodeMover!.options = nodeMoverOptions;
      const nodeMoverComponent = new NodeMover(this.graph, nodeMoverOptions);
      this.components.nodeMover = nodeMoverComponent;
    }

    // edgeEditor
    if (edgeEditor?.enable !== false) {
      const edgeEditorOptions = Object.assign(defaultOptions.edgeEditor.options, edgeEditor?.options || {});
      edgeEditorOptions.router = routerComponent;
      edgeEditorOptions.stack = this.stack;
      edgeEditor!.options = edgeEditorOptions;
      const edgeEditorComponent = new EdgeEditor(this.graph, edgeEditorOptions);
      this.components.edgeEditor = edgeEditorComponent;
    }

    // background
    if (background !== 'none') {
      let options;
      if (typeof background === 'string') {
        options = { type: background };
      } else {
        options = { type: 'dot', ...background }
      }
      const backGroundComponent = new Background(this.graph, options as BackgroundOptions);
      this.components.background = backGroundComponent;
    }

    if (shortcuts?.enable !== false) {
      let shortcutsHandlers = this.getDefaultShortcuts() as { [type: string]: HandlerOption; };
      if (shortcuts!.customShortcuts) {
        if ('function' === typeof shortcuts?.customShortcuts) {
          shortcutsHandlers = shortcuts?.customShortcuts(shortcutsHandlers, this.stack);
        } else {
          shortcutsHandlers = shortcuts?.customShortcuts as { [type: string]: HandlerOption; };
        }
      }
      shortcuts!.customShortcuts = shortcutsHandlers;
      const shortCutsComponent = new Shortcuts(shortcutsHandlers);
      this.components.shortcuts = shortCutsComponent as any;
    }

    this.stack.mode = mode!;
    if (mode === 'read') {
      this.components.edgeEditor?.disable();
      this.components.nodeMover?.disable();
    }
  }


  /**
 * Changes the mode of the editor.
 * @param {('edit' | 'read' | string)} mode - The mode to switch to. Can be 'edit', 'read', or a custom mode.
 * 切换编辑模式。
 */
  changeMode(mode: 'edit' | 'read' | string) {
    this.options.mode = mode;
    this.stack.mode = mode;
    if (mode === 'read') {
      this.components.edgeEditor?.disable();
      this.components.nodeMover?.disable();
    } else if (mode === 'edit') {
      this.components.nodeMover?.enable();
      this.components.edgeEditor?.enable();
    }
  }

  private getDefaultOptions() {
    return {
      mode: 'edit',
      gridStep: 10,
      router: true,
      renderMode: 'canvas',
      background: 'dot' as 'dot' | 'grid' | 'none',
      nodeMover: {
        enable: true,
        options: {
          shouldTrigger(ev: any, triggerShape: any) {
            if (!triggerShape) {
              return false;
            }
            if (!triggerShape.get) { // 由 Viewer 代理的事件

              if (['INPUT', 'TEXTAREA'].includes(triggerShape.tagName)) {
                return false;
              }
              // 祖先中含锚点类即为锚点
              return !triggerShape?.closest(DOM_ANCHOR_SELECTOR);
            }
            return !triggerShape?.get('_anchor');
          },
          shouldDrop: () => {
            return true;
          },
          alignGrid: true,
          snapline: true,
        } as NodeMoverOptions,
      },
      shortcuts: {
        enable: true,
        customShortcuts: (shortcuts: Record<string, HandlerOption>) => shortcuts,
      },
      grid: {
        enable: true,
        options: {},
      },
      edgeEditor: {
        enable: true,
        options: {
          editTerminal: true,
          editAnchorStyles: { // FIXME: Undo 有 Bug. TODO：后续修复.
            fillStyle: '#3073F2'
          },
          magnet: true,
          magnetAnchorStyles: {
            fillStyle: '#3073F2',
            strokeStyle: 'rgba(48, 115, 242, 0.2)',
            lineWidth: 8,
          },
          // 此解决方案仅允许点到点连线，游离连线可取 component 实例修改逻辑
          shouldDrop: (source: Node, target: Node) => {
            return !!source && !!target;
          },
          shouldTrigger(ev: any, triggerShape: any, node: Node) {
            if (!triggerShape) {
              return false;
            }
            if (!triggerShape.get) {
              return !!triggerShape?.closest(DOM_ANCHOR_SELECTOR);
            }
            const anchorIndex = triggerShape?.get('anchorIndex');
            if (anchorIndex === undefined) {
              return false;
            }
            return true;
          },
        } as EdgeEditorOptions
      },
    }
  }



  private getDefaultShortcuts() {
    const shortcuts = getDefaultShortcuts(this.stack);
    shortcuts.paste = {
      shortcut: '⌘+v, ctrl+v',
      handler: (event: KeyboardEvent | ClipboardEvent) => {
        this.stack.execute('paste', { event, position: this.getLastMousePosition() });
      }
    }
    return shortcuts;
  }


  private initStack() {
    const stack = new Stack(this.graph, {
      capacity: STACK_CAPACITY,
      commands: {
        add: AddCommand,
        select: SelectCommand,
        remove: RemoveCommand,
        copy: CopyCommand,
        cut: CutCommand,
        paste: PasteCommand,
        moveNode: MoveNodeCommand,
        batch: BatchCommand,
        update: UpdateCommand,
        insertNode: InsertNodeCommand,
        layout: LayoutCommand,
      }
    });
    const shouldExecute = () => {
      const selections = this.graph.get('_selections');
      if (selections?.node?.length === 0 && selections?.group?.length === 0) {
        return false;
      }
      return true;
    }
    stack.commands.copy.shouldExecute = shouldExecute;
    stack.commands.cut.shouldExecute = shouldExecute;
    return stack;
  }

  /**
   * Retrieves the list of commands stored in the stack.
   *
   * @returns {Array} The list of commands.
   * 获取 stack 中的 commands 列表。
   */
  getCommands() {
    return this.stack.commands;
  }


  private initEvents() {
    const selectOptions = this.options.select || {};
    const stack = this.stack;

    this.graph.addBehavior(multipleSelect, Object.assign({
      multiple: false,
      modifyState: false,
      clickCanvasToReset: true,
      onSelectionsChange(selections: (Node | Edge | Group)[]) {
        selections[0]?.toFront();
        stack.execute('select', { selections });
      },
    }, selectOptions));

    this.graph.on('mousemove', (e) => {
      this.lastMouseClient = [e.clientX, e.clientY];
    });
  }

  /**
   * Retrieves the last mouse position.
   *
   * @returns {Array} The last mouse position.
   * 获取鼠标最后在画布中的位置坐标。
   */
  getLastMousePosition() {
    const point = this.graph.clientToCanvas(this.lastMouseClient[0], this.lastMouseClient[1]);
    return [point.x, point.y];
  }



  /**
   * Aligns the grid.
   * 对齐网格。
   */
  alignGrid() {
    this.components.grid?.refresh(true);
  }


  /**
   * Refreshes the edges path (with router if available).
   * 使用智能路由（如果有）刷新边的路径。
   */
  refreshEdgesPath(edges?: Edge[]) {
    this.alignGrid();
    edges = edges ?? this.graph.getEdges();
    const router = this.components.router;
    if (router) {
      for (const edge of edges) {
        router.updateEdgePath(edge);
      }
    }
    this.graph.refresh();
  }

  /**
   * Undoes the last command in the stack.
   * 撤销操作栈中的最后一个命令。
   */
  undo() {
    return this.stack.undo();
  }

  /**
   * Redoes the last undone command in the stack.
   * 重做操作栈中最后一个被撤销的命令。
   */
  redo() {
    return this.stack.redo();
  }

  /**
   * Copies the selected entities to the clipboard.
   * 将选中的实体复制到剪贴板。
   * @returns {Promise<boolean>} A promise that resolves to the status of the copy operation.
   * 返回一个 Promise，值为复制操作是否成功。
   */
  async copy() {
    return await execClipboardEvent({ type: 'copy', stack: this.stack }).then(
      (status) => status
    );
  }

  /**
   * Cuts the selected entities to the clipboard.
   * 将选中的实体剪切到剪贴板。
   * @returns {Promise<boolean>} A promise that resolves to the status of the cut operation.
   * 返回一个 Promise，值为剪切操作是否成功。
   */
  async cut() {
    return await execClipboardEvent({ type: 'cut', stack: this.stack }).then(
      (status) => status
    );
  }

  /**
   * Pastes the entities from the clipboard.
   * 从剪贴板中粘贴实体。
   * @param {number[]} [position] The position to paste the entities.
   * @returns {Promise<boolean>} A promise that resolves to the status of the paste operation.
   * 返回一个 Promise，值为粘贴操作是否成功。
   */
  async paste(position?: number[]) {
    return await execClipboardEvent({ type: 'paste', stack: this.stack, stackArgs: { position } }).then(
      (status) => status
    );
  }


  /**
   * Adds a new node to the graph.
   * 向图中添加一个新节点。
   * @param {Omit<NodeData, 'id'>} nodeData - The data for the new node, excluding the 'id' field.
   * 新节点的数据，可以不包含 id 字段。
   */
  addNode(nodeData: Omit<NodeData, 'id'>) {
    return this.stack.execute('add', {
      type: 'node',
      configs: nodeData
    });
  }


  /**
   * Removes a node from the graph.
   * 从图中移除一个节点。
   * @param {Node} node - The node to be removed.
   * 要移除的节点。
   */
  removeNode(node: Node) {
    return this.stack.execute('remove', {
      entity: node
    });
  }

  /**
   * Selects a node in the graph.
   * 将图中的一个节点置为选中状态。
   * @param {Node} node - The node to be selected.
   * 要选择的节点。
   */
  selectNode(node: Node) {
    this.stack.execute('select', {
      selections: [node]
    });
  }

  /**
   * Updates the configuration of a node.
   * 更新节点的配置。
   * @param {Node} node - The node to be updated.
   * 要更新的节点。
   * @param {Record<string, any>} configs - The new configuration for the node.
   * 节点的新配置。
   */
  updateNode(node: Node, configs: Record<string, any>) {
    const id = node.get('id');
    return this.stack.execute('update', {
      type: 'node',
      id,
      configs
    });
  }

  /**
   * Inserts a new node into the graph at a specified position along an edge.
   * 在图中沿着一条边在指定位置插入一个新节点。
   * @param {any} edge - The edge along which the node will be inserted.
   * 新节点将插入的边。
   * @param {NodeData} [nodeConfigs] - The configuration for the new node.
   * 新节点的配置。
   * @param {number} [position] - The position along the edge where the node will be inserted.
   * 新节点将插入的边的位置。
   */
  insertNode(edge: any, nodeConfigs?: NodeData, position?: number) {
    return this.stack.execute('insertNode', { edge, nodeConfigs, position });
  }

  /**
   * Adds a new edge to the graph.
   * 向图中添加一条新边。
   * @param {EdgeData} edgeData - The data for the new edge.
   * 新边的数据。
   */
  addEdge(edgeData: EdgeData) {
    return this.stack.execute('add', {
      type: 'edge',
      configs: edgeData
    });
  }

  /**
   * Removes an edge from the graph.
   * 从图中移除一条边。
   * @param {Edge} edge - The edge to be removed.
   * 要移除的边。
   */
  removeEdge(edge: Edge) {
    return this.stack.execute('remove', {
      entity: edge
    });
  }

  /**
   * Selects an edge in the graph.
   * 将图中的一条边置为选中状态。
   * @param {Edge} edge - The edge to be selected.
   * 要选择的边。
   */
  selectEdge(edge: Edge) {
    this.stack.execute('select', {
      selections: [edge]
    });
  }

  /**
   * Updates the configuration of an edge.
   * 更新边的配置。
   * @param {Edge} edge - The edge to be updated.
   * 要更新的边。
   * @param {Record<string, any>} configs - The new configuration for the edge.
   * 边的新配置。
   */
  updateEdge(edge: Edge, configs: Record<string, any>) {
    const id = edge.get('id');
    return this.stack.execute('update', {
      type: 'edge',
      id,
      configs
    });
  }

  /**
   * Selects multiple entities (nodes, edges, or groups) in the graph.
   * 将图中的多个实体（节点、边或分组）置为选中状态。
   * @param {(Node | Edge | Group)[]} entities - The entities to be selected.
   * 要选择的实体数组。
   */
  selectEntities(entities: (Node | Edge | Group)[]) {
    this.stack.execute('select', {
      selections: entities
    });
  }

  /**
   * Updates the graph data and pushes the changes into the operation stack.
   * 更新图数据并将变更入操作栈。
   * @param {GraphData} data - The new graph data to be set.
   * 要设置的新图数据。
   */
  data(data: GraphData) {
    const formerData = this.getSnapshot();
    this.graph.data(data);
    const currentData = this.getSnapshot();
    this.batchChange({ formerData, currentData });
  }

  /**
   * Exports the graph data as a object data
   * 导出图数据为 object 数据
   * @param {Function} fn - The custom function to transform the entity data.
   * 自定义转换实体数据的函数。
   * @returns {Object} The exported graph data.
   * 导出的图数据。
   */
  exportData(fn?: (entity: Node | Edge) => Record<string, unknown>) {
    const graph = this.graph;
    fn = fn || getDefaultBizData;
    return {
      nodes: graph.getNodes().map(fn),
      edges: graph.getEdges().map(fn)
    }
  }

  /**
   * Applies a layout algorithm.
   * 执行布局算法。
   * @param {(graph: Graph) => void} layoutFn - The layout algorithm entity to be applied.
   * 要应用的布局算法。
   */
  layout(layoutFn: (graph: Graph) => void) {
    this.stack.execute('layout', { layout: layoutFn });
  }

  /**
   * Generates a snapshot of the current graph data.
   * 生成当前图数据的快照。
   * @returns {GraphData & { matrix?: number[]; selections?: StackSelections; }} The snapshot data.
   * 返回图数据的快照，包含矩阵和选择信息。
   */
  getSnapshot() {
    const snapshotData = generateSnapshot(this.graph) as GraphData & {
      matrix?: number[];
      selections?: StackSelections;
    };
    return snapshotData;
  }

  /**
   * Applies a batch of changes to the graph data.
   * 应用一组图数据的批量变更。
   * @param {Object} configs - The configuration object for the batch change.
   * 变更配置对象。
   */
  batchChange(configs: {
    /**
     * The former graph data.
     * 变更前的图数据。
     */
    formerData: GraphData,
    /**
     * The current graph data.
     * 变更后的图数据。
     */
    currentData: GraphData,}) {
    this.stack.execute('batch', {
      ...configs,
    });
  }

  /**
   * Moves the selected nodes, edges, and groups to the center of the viewport.
   * 将选择的节点、边、组移动到视口中心。
   * @param autoScale 是否自动缩放
   */
  selectionIntoView(autoScale = true) {
    selectionIntoView(this.graph, autoScale)
  }

  /**
   * EN: Get the currently selected nodes, edges, and groups.
   * 获取当前处于选中状态的节点、边、组。
   * @returns { { node: string[], edge: string[], group: string[] } }  The ID arrays of the currently selected nodes, edges, and groups.
   * 选中的节点、边、组的 ID 数组。
   */
  getSelection(): { node: string[], edge: string[], group: string[] } {
    return this.graph.get('_selections');
  }

  /**
   * Retrieves the current graph instance.
   * 获取当前的图实例。
   * @returns {Graph} The current graph instance.
   * 返回当前的图实例。
   */
  getGraph() {
    return this.graph;
  }


  /**
   * Retrieves the current stack instance.
   * 获取当前的 stack 实例。
   * @returns {Stack} The current stack instance.
   * 返回当前的 stack 实例。
   */
  getStack() {
    return this.stack;
  }

  /**
   * Retrieves a component by its name.
   * 根据名称获取组件。
   * @param {T} name - The name of the component to retrieve.
   * 要获取的组件的名称。
   * @returns {CommonFlowEditor['components'][T]} The component instance.
   * 返回组件实例。
   */
  getComponent<T extends keyof CommonFlowEditor['components']>(name: T): CommonFlowEditor['components'][T] {
    return this.components[name];
  }

  /**
   * Sets a component by its name.
   * 根据名称设置组件。
   * @param {T} name - The name of the component to set.
   * 要设置的组件的名称。
   * @param {CommonFlowEditor['components'][T]} component - The component instance to set.
   * 要设置的组件实例。
   */
  setComponent<T extends keyof CommonFlowEditor['components'], Component extends CommonFlowEditor['components'][T]>(name: T, component: Component) {
    this.components[name] = component;
  }

  /**
   * Changes the size of the graph.
   * 更改图的大小。
   * @param {number} width - The new width of the graph.
   * 新的图宽度。
   * @param {number} height - The new height of the graph.
   * 新的图高度。
   */
  changeSize(width: number, height: number) {
    const graph = this.graph;
    graph.changeSize(width, height);
    graph.draw();
  }


  /**
   * Clears the graph.
   * 清空图。
   * @returns {boolean} Whether the graph was cleared.
   * 操作是否成功。
   */
  clear() {
    if (this.options.mode !== 'edit') {
      return false;
    }
    const formerData = this.getSnapshot();
    this.graph.clear();
    this.graph.draw();
    const currentData = this.getSnapshot();
    this.batchChange({ formerData, currentData });
    return true;
  }

  /**
   * Destroys the graph.
   * 销毁图。
   */
  destroy() {
    this.graph.destroy();
    // 非 ComponentBase 由组件进行 destroy.
    this.components.shortcuts?.destroy();
    this.components.router?.destroy();
    this.destroyed = true;
  }
}
