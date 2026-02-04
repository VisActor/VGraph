import { Edge, Node } from '../../models/entities';
import { dragCanvas, panZoom } from '../../behaviors';
import { Graph } from '../../graph';
import { GraphEvent } from '../../typings/event';
import { TreeData } from '../../typings/data';
import { PipelineLayout } from '../../layouts/pipeline';
import {
  Scroller, ScrollerOptions,
  Stack,
  InsertNodeCommand,
  SelectCommand, UpdateCommand, BatchCommand, CopyCommand,
  getStackSelections,
  execClipboardEvent,
} from '../../components';
import {
  PasteAsChildrenCommand, MovePipelineTreeNodeCommand,
  ProcessRemoveCommand,
  AddSourceCommand, AddTargetCommand, AddSiblingCommand,
  RemovePipelineTreeCommand,
  ExpandNodeCommand,
  CollapseNodeCommand,
} from './commands';
import { normalizePadding } from '../../utils/graph';
import { Rect } from '../../renderer';
import { SnapshotData } from '../../typings/stack';
import { selectionIntoView } from '../utils/view';
import { getDefaultBizData, debounce } from '../../utils/common';
import { GRAPH_EVENTS } from '../../consts/meta_events';

const ROOT_ID = 'xgraphDagFlowRoot';

export type DAGFlowEditorOptions = {
    /**
   * The graph initial data.
   * 初始图数据。
   */
  data?: { nodes: Record<string, unknown>[], edges: Record<string, unknown>[] };
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
  renderMode?: 'canvas' | 'dom',
  /**
   * The default node style, same as Graph's setDefaultNode config.
   * 节点默认样式配置，同 Graph 同名配置。
   */
  setDefaultNode: (nodeData: any) => { [k: string]: any },
    /**
   * The default edge style, same as Graph's setDefaultEdge config.
   * 边默认样式配置，同 Graph 同名配置。
   */
  setDefaultEdge?: (edgeData: any) => { [k: string]: any },
    /**
   * The edge state styles, same as Graph's setEdgeStateStyles config.
   * 边状态样式配置，同 Graph 同名配置。
   */
  setNodeStateStyles?: (state: string, nodeData: any, node: Node) => { [k: string]: any },
    /**
   * The group style, same as Graph's setDefaultGroup config.
   * 分组样式配置，同 Graph 同名配置。
   */
  setEdgeStateStyles?: (state: string, edgeData: any, edge: Edge) => { [k: string]: any },

   /**
   * Callback function triggered when a node is clicked.
   * 当节点被点击时触发的回调函数。
   */
  onClickNode?: (node: Node, e: GraphEvent) => void;


  mask?: {
    enable: boolean;
    onVisibleChange?: (show: boolean) => void;
  };

  /**
   * The layout configuration.
   * 布局配置。
   */
  layout?: {
    rankSep?: number;
    nodeSep?: number;
    edgeSep?: number;
    rankDir?: 'TB' | 'LR';
    ignoreControlPoints?: boolean;
    coordAssignment?: 'compact';
  } | {
      rankSep?: number;
      nodeSep?: number;
      edgeSep?: number;
      rankDir?: 'TB' | 'LR';
      ignoreControlPoints?: boolean;
      coordAssignment:'treeLike';
      setTreePosition?: (data: TreeData) => { leftTree: TreeData, rightTree: TreeData };
  };

  /**
   * Callback function triggered when the graph data changes.
   * 当图数据发生变化时触发的回调函数。
   */
  onChange: () => void;

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
};

export class DAGFlowEditor {
  graph: Graph;
  stack: Stack;
  layout: any;
  options: DAGFlowEditorOptions;
  constructor(options: DAGFlowEditorOptions) {
    this.options = options;
    this.graph = this.initGraph(options);
    this.stack = this.initStack();
    this.layout = new PipelineLayout({
      ...options.layout,
      coordAssignment: options.layout?.coordAssignment || 'compact',
      rootId: ROOT_ID,
      graph: this.graph,
    });
    this.bindEvents();
    if (options.data) {
      this.setData(options.data);
    } else {
      this.initEmptyEditor();
    }
  }

  private initGraph(options: DAGFlowEditorOptions) {
    const { container, graphSize } = options;
    const padding = normalizePadding(options.padding || 40);
    this.options.padding = padding;
    const graph = new Graph({
      container,
      width: graphSize[0],
      height: graphSize[1],
      padding,
      renderMode: options.renderMode || 'canvas',
      setDefaultNode: options.setDefaultNode,
      setDefaultEdge: options.setDefaultEdge,
      setNodeStateStyles: options.setNodeStateStyles,
      setEdgeStateStyles: options.setEdgeStateStyles,
    });

    if (options.scroller && (options.scroller.enable === undefined || options.scroller.enable === true)) {
      let scrollerOptions = {
        panZoom: { zoom: false, strict: true }
      };
      if (options.scroller?.options) {
        scrollerOptions = Object.assign(scrollerOptions, options.scroller.options);
      }
      graph.set('_scroller', new Scroller(graph, scrollerOptions));
    } else {
      graph.addBehavior(dragCanvas, {
        limit: true
      });
      graph.addBehavior(panZoom, {
        limit: true
      });
    }
    return graph;
  }

  private initEmptyEditor() {
    const graph = this.graph;
    const node = graph.add('node', {
      id: 'initial',
    });
    const root = graph.add('node', {
      id: ROOT_ID,
    });
    graph.add('edge', {
      source: ROOT_ID,
      target: node.get('id')
    });
    root.setOpacity(0);
    root.hide();

    const { graphSize, padding } = this.options;
    const rankDir = this.layout.options.rankDir;
    if (rankDir === 'TB') {
      this.graph.translate(graphSize[0] / 2, padding![0] + node.get('height') / 2);
    } else {
      this.graph.translate(padding![3] + node.get('width') / 2, graphSize[1] / 2);
    }
  }

  /**
   * The function `setData` in DAGFlowEditor sets data for a graph, performs layout adjustments, and clears the stack.
   * @param data - The `setData` method you provided takes in an object `data` with two properties: `nodes` and `edges.
   * @param [fitView=true] - The `fitView` parameter is a boolean value that determines whether the graph should be
   * fitView after setting the data.
  */
  setData(data: { nodes: Record<string, unknown>[], edges: Record<string, unknown>[] }, fitView = true) {
    const graph = this.graph;
    graph.data(data);

    let node = graph.getNodeById(ROOT_ID);
    if (!node) {
      node = graph.add('node', { id: ROOT_ID });
      graph.getNodes().forEach((n: Node) => {
        if (n !== node && n.sources.length === 0) {
          graph.add('edge', {
            source: ROOT_ID,
            target: n.get('id'),
          });
        }
      });
    }
    node.setOpacity(0);
    node.hide();

    graph.getNodes().forEach((node: Node) => {
      if (node.get('targets')) {
        node.targets = node.get('targets');
        delete node.configs.targets;
      }
    });
    this.reLayout();
    if (this.options.scroller && this.options.scroller.enable !== false) {
      const padding = this.options.padding as number[];
      graph.setMatrix([1, 0, 0, 1, 0, 0]);
      const bbox = graph.getGraphBBox();
      graph.translate(padding![3] - bbox.left, padding![0] - bbox.top);
    } else {
      fitView && graph.fitView();
    }
    this.stack.clear();
  }

  /**
   * The `addSource` function adds a new node to the `relative node` as its parent node which id is `nodeId`.
   * @param {Record<string, any>} [configs] - The `configs` is an optional parameter that allows you to pass custom configs for newly node.
   * @param [linkChildren=true] - The `linkChildren` parameter  determines  whether the newly added node should be
   * linked to the `relative node`'s children nodes.
   */
  addSource(nodeId: string, configs?: Record<string, any>) {
    this.stack.execute('addSource', {
      configs,
      relativeNodeId: nodeId,
    });
    this.reLayout(nodeId);
    this.selectionIntoView();
    this.savePositionToStack();
    this.options.mask?.enable && this.showMask();
  }

  /**
   * The `addTarget` function adds a new node to the relative node as its child node which id is `nodeId`.
   * @param {string} nodeId - The `nodeId` parameter is a string that represents the relative node's ID.
   * @param {Record<string, any>} [configs] - The `configs` is an optional parameter that allows you to pass custom configs for newly node.
   * @param [linkChildren=true] - The `linkChildren` parameter  determines  whether the newly added node should be
   * linked to the `relative node`'s children nodes.
   */
  addTarget(nodeId: string, configs?: Record<string, any>, linkChildren = true) {
    this.stack.execute('addTarget', {
      configs,
      relativeNodeId: nodeId,
      linkChildren,
    });
    const node = this.graph.getNodeById(nodeId);
    if (node.get('collapsed')){
      this.executeExpandNode(nodeId);
    } else {
      this.reLayout(nodeId);
    }
    this.selectionIntoView();
    this.savePositionToStack();
    this.options.mask?.enable && this.showMask();
  }

  /**
   * The `addSiblingBefore` function adds a sibling node before a specified node, with optional configurations and child linking.
   * @param {string} nodeId - The `nodeId` is a string that represents the relative node before which a new sibling node will be added.
   * @param {Record<string, any>}  [configs] (optional) An object containing configurations for the new node.
   * @param [linkChildren=true] - (optional, default value is `true`) The `linkChildren` parameter determines whether the newly added sibling node
   * should be linked to the children of the existing node specified by `nodeId`.
   */
  addSiblingBefore(nodeId: string, configs?: Record<string, any>, linkChildren = true) {
    this.stack.execute('addSibling', {
      configs,
      relativeNodeId: nodeId,
      linkChildren,
      type: 'before'
    });
    this.reLayout(nodeId);
    this.selectionIntoView();
    this.savePositionToStack();
    this.options.mask?.enable && this.showMask();
  }

  /**
   * The `addSiblingBefore` function adds a sibling node after a specified node, with optional configurations and child linking.
   * @param nodeId - The ID of the node after which the new sibling node will be added.
   *
   * @param {Record<string, any>} [configs] - (optional) An object containing configurations for the new node.
   *
   * @param [linkChildren=true] - (optional, default value is `true`) The `linkChildren` parameter determines whether the newly added sibling node
   * should be linked to the children of the existing node specified by `nodeId`.
   */
  addSiblingAfter(nodeId: string, configs?: Record<string, any>, linkChildren = true) {
    this.stack.execute('addSibling', {
      configs,
      relativeNodeId: nodeId,
      linkChildren,
      type: 'after',
    });
    this.reLayout(nodeId);
    this.selectionIntoView();
    this.savePositionToStack();
    this.options.mask?.enable && this.showMask();
  }

  /**
   * The `addNode` function inserts a new node into the edge.
   * @param {Edge} edge - The `edge` determines the target edge for the new node being added.
   * @param [nodeConfigs] - (optional) An object containing configurations for the new node.
   * @param [position=0.5] - The `position` represents the position at which the new node will be inserted along the edge.
   * It is a value between 0 and 1, where 0 represents the start of the edge and 1 represents the end of the edge.
   */
  addNode(edge: Edge, nodeConfigs?: Record<string, any>, position = 0.5, ) {
    const source = edge.get('source');
    this.stack.execute('insertNode', {edge, nodeConfigs, position});
    this.reLayout(source);
    this.options.mask?.enable && this.showMask();
    this.savePositionToStack();
  }

  /**
 * The `batchChange` function executes a batch operation with undo and redo functionality.
 * @param configs formerData and currentData should be a SnapshotData from getSnapshot().
 * @param {SnapshotData} configs.formerData
 * @param {SnapshotData} configs.currentData
 */
  batchChange(configs: { formerData: SnapshotData, currentData: SnapshotData }) {
    const graph = this.graph;
    this.stack.execute('batch', {
      ...configs,
      afterUndo() {
        const root = graph.getNodeById(ROOT_ID);
        root.setOpacity(0);
        root.hide();
        graph.draw();
      },
      afterRedo() {
        const root = graph.getNodeById(ROOT_ID);
        root.setOpacity(0);
        root.hide();
        graph.draw();
      },
    });
  }

  /**
   * The function `selectionIntoView` in DAGFlowEditor scrolls the selected element into viewport with an optional `autoScale` parameter.
   * @param [autoScale=false] -`autoScale` is a boolean parameter, default value is false, that determines whether the viewport should
   * be automatically scaled to fit the selections into viewport.
   */
  selectionIntoView(autoScale = false) {
    selectionIntoView(this.graph, autoScale)
  }

  /**
   * This function retrieves the selected node from a graph object in DAGFlowEditor.
   * @returns The `getSelectedNode()` function returns the selected node from the graph. If a node is
   * selected, it will return the node object; otherwise, it will return `null`.
   */
  getSelectedNode() {
    const graph = this.graph;
    const nodeId = graph.get('_selections').node[0];
    return nodeId ? graph.getNodeById(nodeId) : undefined;
  }

  /**
   * The `moveTreeNode` function moves a node and its subtree nodes to a new parent node.
   * @param {string} nodeId - ID of the node that you want to move to a new parent node.
   * @param {string} parentId - ID of the parent node to which the node and its subtree nodes with the `nodeId` is being moved.
   * @param {number} index - The order of the node.
   */
  moveTreeNode(nodeId: string, parentId: string, index?: number) {
    this.stack.execute('movePipelineTreeNode', {
      nodeId,
      parentId,
      index,
    });
    this.reLayout(parentId);
    this.selectionIntoView();
    this.savePositionToStack();
  }

  /**
   * The `moveNode` moves a node to a specified position relative to another node.
   * @param {string} nodeId - The `nodeId` is a string that represents the node that you want to move .
   * @param {string} parentId - The `parentId` refers to the the parent node to which the node with the specified `nodeId` will be moved.
   * @param {'siblingBefore' | 'siblingAfter' | 'source' | 'target'} pos - The `pos` parameter determines the position where the node with
   * the specified `nodeId` will be moved relative to the node with the `parentId`. The possible values for `pos` are:
   * 'siblingBefore', 'siblingAfter', 'source' and 'target'.
   */
  moveNode(nodeId: string, parentId: string, pos: 'siblingBefore' | 'siblingAfter' | 'source' | 'target') {
    const graph = this.graph;
    const formerData = this.getSnapshot();
    const node = graph.getNodeById(nodeId);
    const configs = node.configs;
    const stack = this.stack;
    this.stack.execute('processRemove', { id: nodeId }, true);
    switch (pos) {
      case 'source':
        stack.execute('addSource', {
          configs: { ...configs },
          relativeNodeId: parentId,
        }, true);
        break;
      case 'target':
        stack.execute('addTarget', {
          configs: { ...configs },
          relativeNodeId: parentId,
        }, true);
        break;
      case 'siblingBefore':
        stack.execute('addSibling', {
          configs: { ...configs },
          relativeNodeId: parentId,
          type: 'before'
        }, true);
        break;
      case 'siblingAfter':
        stack.execute('addSibling', {
          configs: { ...configs },
          relativeNodeId: parentId,
          type: 'after'
        }, true);
        break;
      default:
        break;
    }

    this.reLayout(parentId);
    const currentData = this.getSnapshot();
    this.batchChange({ formerData, currentData });
  }


  /**
   * The function `removeNode` removes a node from a graph, optionally removing its children as well.
   * @param {string} nodeId - The `nodeId` is a string that represents the node that you want to remove.
   * @param {boolean} [removeChildren] - The `removeChildren` parameter is a boolean flag that indicates
   * whether to remove the children nodes along with the specified node.
   */
  removeNode(nodeId: string, removeChildren?: boolean) {
    const graph = this.graph;
    const node = graph.getNodeById(nodeId);
    const stack = this.stack;
    const focusId = node.sources[0] || node.targets[0];
    if (removeChildren) {
      const subTree = getSubtree(nodeId, graph);
      stack.execute('removePipelineTree', { nodeId, subTree });
    } else {
      stack.execute('processRemove', { id: nodeId });
    }
    this.reLayout(focusId);
    this.savePositionToStack();
  }

  /**
   * The `updateNode` function updates a node with the specified ID and configurations.
   * @param {string} nodeId - The `nodeId` is a string that represents the node that needs to be updated.
   * @param {any} configs - The `configs` is an object that contains the updated configuration settings for the node.
   */
  updateNode(nodeId: string, configs: any) {
    if (this.options.mask) {
      this.graph.get('mask')?.hide();
    }
    this.stack.execute('update', {
      id: nodeId,
      type: 'node',
      configs,
    });
  }


  private executeExpandNode(nodeId: string){
    const graph = this.graph;
    const node = graph.getNodeById(nodeId);
    if (!node.get('collapsed')) {
      return;
    }
    const autoDraw = graph.disableAutoDraw();
    node.set('collapsed', false);
    this.setNodeDownstreamVisibility(node, true);
    graph.emitEvent(GRAPH_EVENTS.LAYOUT_START);
    graph.set('emitGraphEvents', false);
    this.reLayout(nodeId);
    // TODO: 动画
    graph.refresh();
    graph.set('emitGraphEvents', true);
    graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
    graph.enableAutoDraw(autoDraw);
    this.graph.emitEvent(GRAPH_EVENTS.EXPAND_NODE_END, {target: node});
  }

  private executeCollapseNode(nodeId: string){
    const graph = this.graph;
    const node = graph.getNodeById(nodeId);
    if (node.get('collapsed')) {
      return;
    }

    const autoDraw = graph.disableAutoDraw();
    node.set('collapsed', true);
    this.setNodeDownstreamVisibility(node, false);
    graph.emitEvent(GRAPH_EVENTS.LAYOUT_START);
    graph.set('emitGraphEvents', false);
    // TODO: 动画
    this.reLayout(nodeId);
    graph.refresh();
    graph.set('emitGraphEvents', true);
    graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
    graph.enableAutoDraw(autoDraw);
    this.graph.emitEvent(GRAPH_EVENTS.COLLAPSE_NODE_END, {target: node});
  }

  /**
   * The function `expandNode` expands a node identified by its ID.
   * @param {string} nodeId - The `nodeId` parameter in the `expandNode` function is a string that
   * represents the unique identifier of the node that needs to be expanded.
   */
  expandNode(nodeId: string){
    this.executeExpandNode(nodeId);
    this.stack.execute('expandNode', {
      id: nodeId
    });
  }

  /**
   * The `collapseNode` function collapses a node identified by its ID.
   * @param {string} nodeId - The `nodeId` parameter is a string that represents the unique identifier of
   * the node that you want to collapse.
   */
  collapseNode(nodeId: string){
    this.executeCollapseNode(nodeId);
    this.stack.execute('collapseNode', {
      id: nodeId
    });
  }

  /**
   * The function `setNodeDownstreamVisibility` recursively sets the visibility of downstream nodes in a
   * graph based on a given node's visibility state.
   * @param {Node} node - The `node` parameter represents a specific node in a graph data structure.
   * @param [visible=true] - The `visible` parameter in the `setNodeDownstreamVisibility` function is a
   * boolean flag that determines whether the downstream nodes should be set as visible (`true`) or
   * hidden (`false`). When `visible` is set to `true`, the downstream nodes will be shown, and when set
   * to `false`, the downstream nodes will be hided.
   */
  setNodeDownstreamVisibility(node: Node, visible = true){
    const graph = this.graph;
    const visitedMap = {};
    function dfs(target: Node){
      if (visitedMap[target.get('id')]) {
        return;
      }
      visitedMap[target.get('id')] = true;
      if (visible){
        target.show();
      } else {
        target.hide();
      }
      if (!target.get('collapsed') || visible === false){
        target.targets.forEach(t => {
          // TODO：考虑带环的 DAG。
          dfs(graph.getNodeById(t));
        });
      }
    }
    node.targets.forEach(t => {
      dfs(graph.getNodeById(t));
    })
  }

  private bindEvents() {
    const { graph, stack, options } = this;
    if (options.onChange) {
      graph.on('stackchange', () => {
        options.onChange();
      });
    }

    graph.on('node:click', (e: GraphEvent) => {
      const node = e.target as Node;
      stack.execute('select', { selections: [node] });
      this.options.mask?.enable && this.showMask();
      options.onClickNode?.(node, e);
    });

    const remoteHandler = debounce(() => {
      this.reLayout(graph.get('_selections').node[0]);
    }, 16);

    graph.on('remotechanged', remoteHandler);

    if (options.mask?.enable) {
      const mask = new Rect({
        left: 0,
        top: 0,
        width: options.graphSize[0],
        height: options.graphSize[1],
        fixed: true,
        fillStyle: '#000',
        opacity: 0.5,
      });
      mask.hide();
      graph.getContainer().add(mask);
      graph.set('mask', mask);

      mask.on('click', () => {
        this.hideMask();
        stack.execute('select', { selections: [] });
        options.mask?.onVisibleChange?.(false);
      });
    }
  }

  /**
   * The `showMask` function shows the mask element in the graph.
   */
  showMask() {
    const graph = this.graph;
    const node = graph.getNodeById(graph.get('_selections').node[0]);
    const mask = graph.get('mask');
    if (graph.get('outerNode')) {
      this.hideMask();
    }
    graph.set('outerNode', node);
    graph.getContainer().add(node.layer);
    mask.show();
    this.options.mask?.onVisibleChange?.(true);
    graph.draw();
  }

  /**
   * The `hideMask` function hides the mask element in the graph.
   */
  hideMask() {
    const graph = this.graph;
    const node = graph.get('outerNode');
    graph.get('mask').hide();
    if (node) {
      graph.getNodeContainer().add(node.layer);
    }
    graph.draw();
  }

  /**
   * The `selectNode` function selects a node in the graph.
   * @param {string} nodeId - The `nodeId` is a string that represents the node should be selected.
   */
  selectNode(nodeId: string) {
    const node = this.graph.getNodeById(nodeId);
    this.stack.execute('select', { selections: [node] });
  }

  /**
   * The `reLayout` re-layouts nodes and focus on a specific node if provided.
   * @param {string} [focusId] - (optional) The `focusId` is the ID of a node in the graph that should be the focus of the layout operation.
   */
  reLayout(focusId?: string) {
    const { graph, layout } = this;
    const node = focusId ? graph.getNodeById(focusId) : null;
    const autoDraw = graph.disableAutoDraw();
    let position;
    // 记录节点原本的位置，用于布局后恢复定位，固定用户操作焦点
    if (node && !node.isDestroyed()) {
      position = this.getNodeRelativePos(node);
    }
    layout.layout(false);
    graph.refresh();
    if (position) {
      // 将被操作节点移回原位
      const currentPos = this.getNodeRelativePos(node!);
      graph.translate(position.x - currentPos.x, position.y - currentPos.y);
    }
    graph.getNodeById(ROOT_ID)?.edges.forEach((edge: Edge) => {
      edge.hide();
    });
    graph.enableAutoDraw(autoDraw);
  }

  getNodeRelativePos(node: Node) {
    const { x, y } = node.configs;
    return this.graph.canvasToViewport(x, y);
  }

  /**
   * The function `changeSize` adjusts the width and height of a graph element and redraws it.
   * @param {number} width - The `width` parameter represents the new width that you want to set for the
   * graph.
   * @param {number} height - The `height` parameter is a number that represents the desired height for
   * the graph.
   */
  changeSize(width: number, height: number) {
    const graph = this.graph;
    graph.get('mask')?.set({
      width,
      height
    });
    graph.changeSize(width, height);
    graph.draw();
  }

  private initStack() {
    return new Stack(this.graph, {
      treeLike: true,
      commands: {
        select: SelectCommand,
        addSource: AddSourceCommand,
        addTarget: AddTargetCommand,
        addSibling: AddSiblingCommand,
        processRemove: ProcessRemoveCommand,
        update: UpdateCommand,
        batch: BatchCommand,
        copy: CopyCommand,
        pasteAsChildren: PasteAsChildrenCommand,
        removePipelineTree: RemovePipelineTreeCommand,
        insertNode: InsertNodeCommand,
        movePipelineTreeNode: MovePipelineTreeNodeCommand,
        expandNode: ExpandNodeCommand,
        collapseNode: CollapseNodeCommand,
      },
    });
  }

  /**
   * The `undo` function allows for undoing specific actions based on the type of operation
   * stored in the stack.
   * @returns The `stackData` object is being returned from the `undo()` function.
   */
  undo() {
    const stack = this.stack;
    const at = stack.at;
    if (at < 0) {
      return;
    }
    const stackData = stack.undo();
    if (stackData) {
      switch (stackData.name) {
        case 'batch':
          this.graph.getNodes().forEach((node: Node) => {
            if (node.get('targets')) {
              node.targets = node.get('targets');
              delete node.configs.targets;
            }
          });
          this.reLayout();
          break;
        case 'expandNode':
          this.executeCollapseNode(stackData.data.id);
          break;
        case 'collapseNode':
          this.executeExpandNode(stackData.data.id);
          break;
        default:
          this.reLayout();
          break;
      }
    }
    return stackData;
  }

  /**
   * The `redo` function handles redoing actions for the editor by the command stack.
   * @returns The `redo()` function returns the `stackData` object after performing the redo operation on
   * the stack data.
   */
  redo() {
    const stackData: any = this.stack.redo();
    const graph = this.graph;
    if (stackData) {
      switch (stackData.name) {
        case 'batch':
          graph.getNodes().forEach((node: Node) => {
            if (node.get('targets')) {
              node.targets = node.get('targets');
              delete node.configs.targets;
            }
          });
          break;
        case 'expandNode':
          this.executeExpandNode(stackData.data.id);
          break;
        case 'collapseNode':
          this.executeCollapseNode(stackData.data.id);
          break;
        default:
          if (stackData.name !== 'update'){
            this.reLayout();
            stackData.data.redoMatrix && graph.setMatrix(stackData.data.redoMatrix);
          }
          break;
      }
    }
    graph.draw();
    return stackData;
  }

  /**
   * Asynchronously copies a node and its children if specified.
   * 复制节点及其子节点(可选)。
   * @param {Node} node - A node object that you want to copy. If not specified, the selected entity will be
   * copied.
   * 参数 node 为要复制的节点。
   * @param [children=false] - Determines whether to include the children of the specified node in the copy operation.
   * if node is empty, children parameter will be ignored.
   * children 为可选参数，默认为 false，用于指定是否包含指定节点的子节点。
   * @returns Returns a Promise that resolves to the `status` after executing the copy command.
   * 返回值为 Promise，resolve 为 status。
   */
  async copy(node: Node, children = false) {
    const { graph, stack } = this;
    this.selectNode(node.get('id'));
    if (children) {
      const selections = getAllChildrenSelections(node, graph);
      graph.set('_selections', selections);
    }
    return await execClipboardEvent({ type: 'copy', stack: stack }).then(
      (status) => {
        if (children) {
          graph.set('_selections', {
            node: [node.get('id')],
            edge: [],
            group: []
          });
        }
        return status;
      }
    );
  }

  /**
   * The `paste` function asynchronously pastes ndoes to a specific node with specified configurations and updates the
   * layout if successful.
   * @param {Node} node - The `node` parameter is an object that represents a node in a data structure.
   * It has a method `get` that retrieves the value of a specific property, in this case, the 'id'
   * property.
   * @param [edgeConfigs] - The `edgeConfigs` parameter in the `paste` function is an optional object
   * that contains configurations for edges.
   * @param [getNodeConfigs] - The `getNodeConfigs` parameter is a function that returns an object with key-value
   * pairs to override node configs to be pasted.
   * @returns The `paste` function returns a Promise that resolves to a boolean value (`status`).
   */
  async paste(node: Node, edgeConfigs?: Record<string, any>, getNodeConfigs?:(nodeData: any) => Record<string, any>) {
    const id = node.get('id');
    return await execClipboardEvent({
      type: 'paste',
      stack: this.stack,
      stackArgs: { parentId: id, edgeConfigs, getNodeConfigs },
      cmdName: 'pasteAsChildren',
    }).then(
      (status) => {
        if (status){
          const node = this.graph.getNodeById(id);
          if (node.get('collapsed')) {
            this.executeExpandNode(id);
          } else {
            this.reLayout(id);
          }

        }
        this.savePositionToStack();
        return status;
      }
    );
  }

  private savePositionToStack() {
    const stack = this.stack;
    const stackData = stack.stack[stack.at];
    if (stackData?.data) {
      stackData.data.redoMatrix = this.graph.getMatrix().concat([]);
    }
  }

  /**
   * The getGraph function returns the graph.
   * @returns The `graph` object is being returned.
   */
  getGraph() {
    return this.graph;
  }

  /**
   * The `exportData` function exports node and edge data from a graph, with optional customization
   * functions for node and edge configurations.
   * @param [nodeFn] - The `nodeFn` parameter is a function that takes an entity (either a Node or an
   * Edge) and a type ('node' or 'edge') as arguments and returns a Record<string, any> object containing
   * configurations for the entity. If `nodeFn` is not provided, it will use a default function.
   * @param [edgeFn] - The `edgeFn` parameter in the `exportData` method is a function that takes an
   * `Edge` entity as input and returns an object containing the data to be exported for that edge. If
   * `edgeFn` is not provided, it falls back to using the same function provided for `nodeFn`.
   * @returns The `exportData` method returns an object with two properties: `nodes` and `edges`. The
   * `nodes` property contains an array of objects representing nodes in the graph, while the `edges`
   * property contains an array of objects representing edges in the graph.
   */
  exportData(nodeFn?: (entity: Node | Edge, type: 'node' | 'edge') => Record<string, any>, edgeFn?: (entity: Edge) => Record<string, any>) {
    const graph = this.graph;
    function exportNode(node: Node) {
      const configs = (nodeFn || getDefaultBizData)(node, 'node');
      return {
        ...configs,
        sources: node.sources.concat([]),
        targets: node.targets.concat([])
      };
    }
    const result: { nodes: Record<string, any>, edges: Record<string, any> } = {
      nodes: [],
      edges: []
    };
    const root = graph.getNodeById(ROOT_ID);
    const firstRow = root.targets;
    // virtual root 不导出，用节点顺序代表第一层节点的位置关系
    firstRow.forEach((id: string) => {
      result.nodes.push(exportNode(graph.getNodeById(id)));
    });
    graph.getNodes().forEach((node: Node) => {
      if (firstRow.includes(node.get('id')) || node === root) {
        return;
      }
      result.nodes.push(exportNode(node));
    });
    graph.getEdges().forEach((edge: Edge) => {
      if (edge.get('source') === ROOT_ID) {
        return;
      }
      let configs = {};
      if (edgeFn || nodeFn) {
        configs = (edgeFn || nodeFn)!(edge, 'edge');
      }
      result.edges.push({
        ...configs,
        source: edge.get('source'),
        target: edge.get('target')
      });
    })
    return result;
  }

  /**
   * The `getSnapshot` function retrieves data from a graph and returns a snapshot containing node
   * configurations, targets, matrix data, and selections.
   * @returns The `getSnapshot()` function returns an object containing snapshot data from a graph. The
   * snapshot data includes configurations for nodes, edges and group entities in the graph, a matrix
   * representation of the graph, and selections from the graph stack.
   */
  getSnapshot() {
    let snapshotData: SnapshotData = {};
    const graph = this.getGraph();
    snapshotData = graph.getData((entity: any) => {
      if (entity.type === 'node') {
        return {
          ...entity.configs,
          targets: entity.targets.concat([]),
        }
      }
      return { ...entity.configs }
    });
    snapshotData.matrix = graph.getMatrix().concat();
    snapshotData.selections = getStackSelections(graph);
    return snapshotData;
  }

  /**
   * The `destroy` function calls the `destroy` method on the `graph` object.
   */
  destroy() {
    this.graph.destroy();
  }
}

let visited: string[] = [];

function getAllChildrenSelections(node: Node, graph: Graph) {
  const id = node.get('id');
  visited = [id];
  return dfsChildrenIds(node, graph, {
    node: [id],
    edge: [],
    group: []
  });
}

function dfsChildrenIds(node: Node, graph: Graph, selections: any) {
  const targets = node.targets;
  targets.forEach((target) => {
    const child = graph.getNodeById(target) as Node;
    const edges = child.edges.filter(
      (edge) => edge.get('source') === node.get('id')
    );
    edges.forEach((edge) => {
      if (!selections.edge.includes(edge.get('id'))) {
        selections.edge.push(edge.get('id'))
      }
    });
    if (visited.includes(target) || child.get('rank') <= node.get('rank')) {
      return;
    }
    visited.push(target);

    selections.node.push(target);

    dfsChildrenIds(child, graph, selections);
  });
  return selections;
}

function getSubtree(nodeId: string, graph: Graph) {
  const result = [];
  let nodes = [ nodeId ];

  while (nodes.length) {
    const nodeId = nodes.shift()!;
    const node = graph.getNodeById(nodeId);
    nodes = nodes.concat(node.targets);
    result.push(nodeId);
  }

  return result;
}
