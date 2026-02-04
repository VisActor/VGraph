import { isPointInScreen, uuid } from '../utils';
import { GRAPH_EVENTS } from '../consts/meta_events';
import { Edge, Node } from '../models/entities';
import { GraphConfigs } from '../typings/graph';
import { TreeData } from '../typings/data';
import { GraphBase } from './base';
import { LAYOUT_TYPES } from '../consts/layout_types';
import { CompactBox, Dendrogram, MindMap, Indented } from '../layouts';
import { Point } from '../renderer';

export class TreeGraph extends GraphBase {
  root: Node | null = null;
  treeData: TreeData | null = null;
  /**
   * Set graph data. The existing data will be replaced.
   * 设置数据，如果当前已有数据将被替换
   * @param {TreeData} data - An object containing tree data.
   */
  data(data: TreeData) {
    this.emitEvent(GRAPH_EVENTS.DATA_START);
    this.set('emitGraphEvents', false);
    const autoDraw = this.disableAutoDraw();
    const autoLayout = this.disableAutoLayout();
    if (this.treeData) {
      this.clear();
    }
    // 在 layout 之前走一遍 setDefaultNode 防止在此设置 collapsed 等会影响布局的因素
    this.prepareData(data);
    const root = this.initNode(data, 0);
    this.layout(data);
    data.children && this.addChildren(data.children, root, root.get('collapsed'), false);
    this.root = root;
    this.treeData = data;
    this.refresh();
    if (this.configs.fitViewAfterLayout) {
      this.fitView();
    }
    this.beforePositionAnimate(data.x, data.y);
    if (this.get('animate')) {
      this.setPositionAnimate();
    } else {
      this.refresh();
    }
    this.set('emitGraphEvents', true);
    this.set('autoLayout', autoLayout);
    this.emitEvent(GRAPH_EVENTS.DATA_END);
    this.enableAutoDraw(autoDraw);
  }

  /**
   * Add children to a parent node.
   * 给指定父节点新增多个子节点或子树
   * @param {TreeData[]} data - An array of TreeData to be added.
   * @param {Node} parent - The parent node instance.
   * @param [hide=false] - Set node instances visibility
   * @param [appendData=true] - Whether to add data to root
   */
  addChildren(data: TreeData[], parent: Node, hide = false, appendData = true) {
    if (!data) {
      return;
    }
    const emitEvent = this.get('emitGraphEvents');
    const autoLayout = this.disableAutoLayout();
    this.emitEvent(GRAPH_EVENTS.ADD_START, { target: parent });
    this.set('emitGraphEvents', false);
    for (const child of data) {
      this.addChild(child, parent, hide, appendData);
    }
    this.set('emitGraphEvents', emitEvent);
    this.emitEvent(GRAPH_EVENTS.ADD_END, { target: parent });
    this.set('autoLayout', autoLayout);
    this.autoLayout(this.treeData, parent);
  }

  /**
   * Adds a child node to the specified parent.
   * 给指定父节点新增一个子节点或子树
   * @param {TreeData} data - The tree data that you want to add as a child node.
   * @param {Node} parent - The parent node instance.
   * @param [hide=false] - Set node instances visibility
   * @param [appendData=true] - Whether to add data to root
   * @returns The newly added node instance.
   */
  addChild(data: TreeData, parent: Node | string, hide = false, appendData = true) {
    if (!data) {
      return null;
    }
    let parentNode: Node;
    if (typeof parent === 'string') {
      parentNode = this.entityMap.node[parent];
      if (!parentNode) {
        this.throw(`Cannot find parent id: ${parent}`);
        return;
      }
    } else {
      parentNode = parent;
    }
    const autoLayout = this.disableAutoLayout();
    this.emitEvent(GRAPH_EVENTS.ADD_START, { target: parentNode });
    if (data.x === undefined) {
      data.x = parentNode.get('x');
    }
    if (data.y === undefined) {
      data.y = parentNode.get('y');
    }
    const existNode = this.getNodeById(data.id!);
    if (existNode) {
      this.removeChild(existNode, existNode.get('parent'));
    }
    const node = this.initNode(data, parentNode.get('depth') + 1);
    node.set('parent', parentNode);
    this.createEdge(parentNode.get('id'), data.id as string);
    if (data.children) {
      this.addChildren(data.children, node, hide ? hide : node.get('collapsed'), false);
    }

    if (hide) {
      node.hide();
    }
    if (appendData) {
      parentNode.configs.children = parentNode.configs.children || [];
      parentNode.configs.children.push(data);
    }
    this.emitEvent(GRAPH_EVENTS.ADD_END, { target: parentNode });
    this.set('autoLayout', autoLayout);
    this.autoLayout(this.treeData, parentNode);
    return node;
  }

  /**
   * Updates the shapes and position of entities in the graph.
   * 更新数据，包括增删图元，修改图元的位置，属性等。如果当前已有数据将进行 merge 操作。
   * @param {TreeData} data - data - An object containing tree data.
   */
  updateData(data: TreeData) {
    const autoDraw = this.disableAutoDraw();
    this.emitEvent(GRAPH_EVENTS.UPDATE_DATA_START);
    this.set('emitGraphEvents', false);
    const root = this.root;
    if (!root) {
      this.data(data);
    } else {
      const autoLayout = this.disableAutoLayout();
      this.prepareData(data);
      this.layout(data);
      this.updateChildren(data.children, root);
      root.updateData(data);
      this.refresh();
      this.set('autoLayout', autoLayout);
    }
    this.set('emitGraphEvents', true);
    this.emitEvent(GRAPH_EVENTS.UPDATE_DATA_END);
    this.enableAutoDraw(autoDraw);
  }

  /**
   * Updates all the children node instances of a parent node recursively.
   * 递归更新指定父节点下所有子节点
   * @param {TreeData[] | undefined} children - An array of `TreeData` objects indicates the children data to be updated.
   * @param {Node} parent - The parent node instance.
   * in the tree data structure to which you want to update or modify the children nodes. It represents
   * the parent node whose children nodes are being updated or modified.
   * @param [hide=false] - Set children node instances visibility
   */
  updateChildren(children: TreeData[] | undefined, parent: Node, hide = false) {
    this.emitEvent(GRAPH_EVENTS.UPDATE_START, { target: parent });
    const emitEvents = this.get('emitGraphEvents');
    this.set('emitGraphEvents', false);
    const autoLayout = this.disableAutoLayout();
    const childrenNodes: Node[] = [];
    parent.get('children')?.forEach((childData: TreeData) => {
      const node = this.getNodeById(childData.id!);
      node && childrenNodes.push(node);
    });
    // 清除子树
    if (!children && childrenNodes.length >= 0) {
      this.removeChildren(childrenNodes, parent);
      this.autoDraw();
      return;
    }
    // 新建子树
    if (children && childrenNodes.length === 0) {
      this.addChildren(children, parent, hide ? hide : parent.get('collapsed'), false);
      this.autoDraw();
      return;
    }
    const defaultNode = this.get('setDefaultNode');
    const ids = children!.map((child: any) => {
      if (defaultNode) {
        return defaultNode(child).id || child.id;
      }
      return child.id;
    });
    for (let i = childrenNodes.length - 1; i >= 0; i--) {
      const child = childrenNodes[i];
      if (!ids.includes(child.get('id'))) {
        this.removeChild(child, parent);
      }
    }
    for (let i = 0; i < children!.length; i++) {
      const child = children![i];
      const node = childrenNodes.find((n: Node) => n.get('id') === child.id);
      if (!node) {
        this.addChild(child, parent, false, false);
      } else {
        this.updateChildren(child.children, node);
        node.updateData(child);
        children![i] = node.configs;
      }
    }
    this.set('emitGraphEvents', emitEvents);
    this.emitEvent(GRAPH_EVENTS.UPDATE_END, { target: parent });
    parent.set('children', children);
    this.set('autoLayout', autoLayout);
    this.autoLayout(this.treeData, parent);
  }

  /**
   * Remove a child node of a specified parent.
   * 删除指定父节点的一个子节点或子树
   * @param {Node} child - The child node instance.
   * @param {Node} parent - The parent node instance.
   * @param {boolean} destroy - Whether to destroy the child node instance.
   */
  removeChild(child: Node, parent: Node | string, destroy = true) {
    this.emitEvent(GRAPH_EVENTS.REMOVE_START, { target: parent });
    const autoLayout = this.disableAutoLayout();
    let parentNode: Node;
    if (typeof parent === 'string') {
      parentNode = this.entityMap.node[parent];
      if (!parent) {
        this.throw(`Cannot find parent id: ${parent}`);
        return;
      }
    } else {
      parentNode = parent;
    }
    const siblingData = parentNode.get('children') || [];
    const children = (child.get('children') || []).map((child: TreeData) => {
      return this.getNodeById(child.id!);
    });
    destroy && this.removeChildren(children, child);
    const dataIndex = siblingData.findIndex((n: any) => n.id === child.get('id'));
    if (dataIndex >= 0) {
      siblingData.splice(dataIndex, 1);
    }
    this.emit('updateData', {
      type: 'remove',
      entity: child,
    });
    destroy && child.destroy();
    this.emitEvent(GRAPH_EVENTS.REMOVE_END, { target: parent });
    this.set('autoLayout', autoLayout);
    this.autoLayout(this.treeData, parentNode);
  }

  /**
   * Remove child nodes of a specified parent.
   * 删除指定父节点的多个子节点或子树
   * @param {Node[]} child - The child nodes instance.
   * @param {Node} parent - The parent node instance.
   */
  removeChildren(children: Node[], parent: Node) {
    if (!children || children.length === 0) {
      return;
    }
    const emitEvent = this.get('emitGraphEvents');
    const autoLayout = this.disableAutoLayout();
    this.emitEvent(GRAPH_EVENTS.REMOVE_START, { target: parent });
    this.set('emitGraphEvents', false);
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      this.removeChild(child, parent);
    }
    this.set('emitGraphEvents', emitEvent);
    this.emitEvent(GRAPH_EVENTS.REMOVE_END, { target: parent });
    this.set('autoLayout', autoLayout);
    this.autoLayout(this.treeData, parent);
  }

  /**
   * Collapses a node, optionally focusing on the collapsed node.
   * 收起指定节点下的子树，可配置聚焦节点
   * @param {Node} node - A node instance to be collapsed.
   * @param {boolean} [focusNode] - A boolean flag that determines whether the collapsing action should focus on the specified node.
   */
  collapse(node: Node, focusNode?: boolean) {
    if (node.get('collapsed')) {
      return;
    }
    const emitEvent = this.get('emitGraphEvents');
    this.set('emitGraphEvents', false);
    const position = this.getNodePosition(node);
    node.set('collapsed', true);
    if (this.get('animate')) {
      this.beforePositionAnimate();
    }
    let offsetX = 0;
    let offsetY = 0;
    if (focusNode) {
      const result = this.getNodeOffsets(node);
      offsetX = result.x;
      offsetY = result.y;
    } else {
      this.layout();
    }
    if (this.get('animate')) {
      node.layer.toFront();
      this.setNodePosition(node, node.get('x'), node.get('y'));
      this.setPositionAnimate(
        () => {
          this.setChildrenVisibility(node, false);
          const curPos = this.getNodePosition(node);
          if (!focusNode && !isPointInScreen(curPos, this.configs)) {
            this.translate(position.x - curPos.x, position.y - curPos.y);
          }
        },
        offsetX,
        offsetY
      );
    } else {
      this.setChildrenVisibility(node, false);
      this.nodeToPosition(node, position);
      this.refresh();
    }
    this.set('emitGraphEvents', emitEvent);
    if (offsetX || offsetY) {
      this.emit(GRAPH_EVENTS.TRANSFORMED, {
        type: 'toggleCollapse',
      });
    } else {
      this.emit(GRAPH_EVENTS.CHANGE, {});
    }
    this.autoDraw();
  }

  /**
   * Expands a node, optionally focusing on the expanded node.
   * 收起指定节点下的子树，可配置聚焦节点
   * @param {Node} node - A node instance to be expanded.
   * @param {boolean} [focusNode] - A boolean flag that determines whether the expanding action should focus on the specified node.
   */
  expand(node: Node, focusNode?: boolean) {
    if (!node.get('collapsed')) {
      return;
    }
    const emitEvent = this.get('emitGraphEvents');
    this.set('emitGraphEvents', false);
    const position = this.getNodePosition(node);
    node.set('collapsed', false);
    this.setChildrenVisibility(node, true);
    if (this.get('animate')) {
      this.setNodePosition(node, node.get('x'), node.get('y'));
      this.beforePositionAnimate();
    }
    let offsetX = 0;
    let offsetY = 0;
    if (focusNode) {
      const result = this.getNodeOffsets(node);
      offsetX = result.x;
      offsetY = result.y;
    } else {
      this.layout();
    }
    if (this.get('animate')) {
      node.layer.toFront();
      this.setPositionAnimate(
        () => {
          const curPos = this.getNodePosition(node);
          if (!focusNode && !isPointInScreen(curPos, this.configs)) {
            this.translate(position.x - curPos.x, position.y - curPos.y);
          }
        },
        offsetX,
        offsetY
      );
    } else {
      this.nodeToPosition(node, position);
      this.refresh();
    }
    this.set('emitGraphEvents', emitEvent);
    if (offsetX || offsetY) {
      // for 飞书人事：在调用本方法以后外部又调了一次更新节点宽高 -> layout -> refresh -> transform
      // 导致在少数情况下 react viewer 更新异常找不到节点。减少 viewer refresh 频率后缓解
      // TODO 是否所有更新情况应该先更新 matrix 再更新 layout?
      this.emit(GRAPH_EVENTS.TRANSFORMED, {
        type: 'toggleCollapse',
      });
    } else {
      this.emit(GRAPH_EVENTS.CHANGE, {});
    }
    this.autoDraw();
  }

  private getNodePosition(node: Node) {
    return this.canvasToViewport(node.get('x'), node.get('y'));
  }

  private getNodeOffsets(node: Node) {
    let originPosition = { x: 0, y: 0 };
    originPosition = this.getNodePosition(node);
    this.layout();
    const currentPosition = this.getNodePosition(node);
    return {
      x: originPosition.x - currentPosition.x,
      y: originPosition.y - currentPosition.y,
    };
  }

  private nodeToPosition(node: Node, position: { x: number; y: number }) {
    const currentPos = this.getNodePosition(node);
    this.translate(position.x - currentPos.x, position.y - currentPos.y);
  }

  private setNodePosition(node: Node, x: number | undefined, y: number | undefined) {
    node.set('x', x);
    node.set('y', y);
    const childNodes = node.get('children');
    if (childNodes && childNodes.length > 0) {
      childNodes.forEach((child: TreeData) => {
        const node = this.getNodeById(child.id!);
        this.setNodePosition(node, x, y);
      });
    }
  }

  /**
   * Toggle a the collapsed state of a node, optionally focusing on the expanded node.
   * 收起或展开指定节点下的子树，可配置聚焦节点
   * @param {Node} node - A node instance to be expanded.
   * @param {boolean} [focusNode] - A boolean flag that determines whether the expanding action should focus on the specified node.
   */
  toggleCollapse(node: Node, focusNode?: boolean) {
    if (node.get('collapsed')) {
      this.expand(node, focusNode);
    } else {
      this.collapse(node, focusNode);
    }
  }

  /**
   * Recursively shows or hides children nodes.
   * 设置指定节点下所有子节点的可见性
   * @param {Node} node - A node instance.
   * @param {boolean} visible - A boolean value that determines whether the children nodes should be set to be visible (`true`) or
   * hidden (`false`).
   */
  setChildrenVisibility(node: Node, visible: boolean) {
    this.set('emitGraphEvents', false);
    const children = node.get('children');
    if (children) {
      children.forEach((child: any) => {
        const childNode = this.getNodeById(child.id);
        if (visible) {
          childNode.show();
        } else {
          childNode.hide();
        }
        if (!childNode.get('collapsed')) {
          this.setChildrenVisibility(childNode, visible);
        }
      });
    }
    this.set('emitGraphEvents', true);
    this.emit(GRAPH_EVENTS.VISIBILITY_END);
  }

  autoLayout(data: TreeData | null = this.treeData, focus?: Node) {
    if (this.get('autoLayout')) {
      this.layout(data, focus);
    }
  }

  /**
   * Perform tree layout.
   * 执行一次布局
   */
  layout(data: TreeData | null = this.treeData, focus?: Node) {
    if (!data) {
      return;
    }
    this.emitEvent(GRAPH_EVENTS.LAYOUT_START);
    const autoLayout = this.disableAutoLayout();
    const layoutMethod = this.get('layout');
    if (layoutMethod) {
      let position: Point | null = null;
      if (focus) {
        const { left, top } = focus.getBBox();
        position = this.canvasToViewport(left, top);
      }
      layoutMethod.layout!(data);
      if (position) {
        const { left, top } = focus!.getBBox();
        const currentPosition = this.canvasToViewport(left, top);
        this.translate(position.x - currentPosition.x, position.y - currentPosition.y);
      }
      this.refresh();
    }
    this.set('autoLayout', autoLayout);
    this.emitEvent(GRAPH_EVENTS.LAYOUT_END);
  }

  /**
   * Sets the last position of each node in the entity map before animating.
   * 动画前准备，记录每个节点的当前位置
   * @param {number} [defaultX] - The default x-coordinate value for nodes if it is not provided.
   * @param {number} [defaultY] - The default y-coordinate value for nodes if it is not provided.
   */
  beforePositionAnimate(defaultX?: number, defaultY?: number) {
    if (this.get('animate')) {
      if (this.canvas.animating) {
        this.canvas.stopAnimate();
      }
      Object.values(this.entityMap.node).forEach((node: Node) => {
        node._lastPosition = {
          x: defaultX === undefined ? node.get('x') : defaultX,
          y: defaultY === undefined ? node.get('y') : defaultY,
        };
      });
    }
  }

  /**
   * Animate the position of nodes in a graph.
   * 节点位置动画，多用于布局和展开收起子节点后
   * @param [callback] - A function that will be called once the animation is finished.
   * @param [offsetX=0] - The horizontal offset by which the graph will be animated.
   * @param [offsetY=0] - The vertical offset by which the graph will be animated.
   */
  setPositionAnimate(callback?: () => void, offsetX = 0, offsetY = 0) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const graph = this;
    graph.setCapture(false);
    Object.values(this.entityMap.node).forEach((node: Node) => {
      const lastPosition = node._lastPosition as Record<string, number>;
      node._offsets = {
        x: node.get('x') - lastPosition.x,
        y: node.get('y') - lastPosition.y,
      };
    });
    const animateConfigs = this.get('animate');
    let lastX = 0;
    let lastY = 0;
    this.canvas.animate({
      ...animateConfigs,
      target: graph.canvas,
      onFrame(ratio: number) {
        Object.values(graph.entityMap.node).forEach((node: any) => {
          const lastPosition = node._lastPosition as Record<string, number>;
          // eslint-disable-next-line no-restricted-globals
          if (isNaN(lastPosition.x + node._offsets.x * ratio)) {
            console.error('animate onFrame with NaN ratio:', ratio);
          }
          node.set('x', lastPosition.x + node._offsets.x * ratio);
          node.set('y', lastPosition.y + node._offsets.y * ratio);
        });
        graph.refresh();
        if (offsetX || offsetY) {
          const curX = offsetX * ratio;
          const curY = offsetY * ratio;
          graph.translate(curX - lastX, curY - lastY);
          lastX = curX;
          lastY = curY;
        } else {
          graph.emit(GRAPH_EVENTS.ANIMATION_FRAME);
        }
      },
      onFinish() {
        Object.values(graph.entityMap.node).forEach((node: Node) => {
          delete node._lastPosition;
          delete node._offsets;
        });
        graph.setCapture(true);
        if (callback) {
          callback.call(graph);
        }
        if (animateConfigs.onFinish) {
          animateConfigs.onFinish(graph);
        }
        graph.emit(GRAPH_EVENTS.ANIMATION_FRAME);
      },
    });
  }

  /**
   * Set the layout of a graph and refreshes the layout.
   * @param {any} layout - A tree layout instance
   */
  setLayout(layout: any) {
    this.set('layout', layout);
    layout.setGraph(this);
    this.refreshLayout();
  }

  /**
   * Lay out the nodes and finally either animates the position or refreshes the layout.
   * 刷新布局，会根据配置展示布局动画或直接刷新视图
   */
  refreshLayout() {
    this.beforePositionAnimate();
    this.layout();
    if (this.configs.fitViewAfterLayout) {
      this.fitView();
    }
    if (this.get('animate')) {
      this.setPositionAnimate();
    } else {
      this.refresh();
    }
  }

  /**
   * Move a node to a specified parent
   * @param {Node} node - The node to be moved.
   * @param {Node} parent - The new parent node instance.
   * @param {number} parentIndex - Specify the order of child nodes of the parent.
   */
  moveNode(node: Node, parent: Node, parentIndex?: number) {
    const originParent = node.get('parent');
    const nodeId = node.get('id');
    if (originParent) {
      const children = originParent.get('children');
      const index = children.findIndex((c: any) => c.id === nodeId);
      if (index >= 0) {
        children.splice(index, 1);
      }
      const edge = node.edges.find((e) => e.get('source') === originParent.get('id'));
      if (edge) {
        edge.destroy();
      }
    }
    if (!parent.get('children')) {
      parent.set('children', []);
    }
    if (parentIndex === undefined || parentIndex < 0 || parentIndex > parent.get('children').length) {
      parent.get('children').push(node.configs);
    } else {
      parent.get('children').splice(parentIndex, 0, node.configs);
    }
    node.set('parent', parent);
    this.createEdge(parent.get('id'), nodeId);
    if (parent.get('collapsed')) {
      this.setChildrenVisibility(node, false);
      node.hide();
    }
    this.autoLayout(this.treeData, parent);
    this.refresh();
    this.autoDraw();
  }

  private createEdge(source: string, target: string) {
    let edge;
    const id = uuid();
    try {
      edge = new Edge(
        {
          id,
          source,
          target,
        },
        this,
        this.edgeContainer
      );
    } catch (e: any) {
      this.throw(e);
    }
    if (edge) {
      this.addToMap('edge', edge);
    }
  }

  /**
   * Update all nodes positions according to the data.
   * 根据数据更新所有节点位置
   * @param {TreeData} data - Tree like data which contains all nodes' coordinates.
   */
  updatePositions(data: TreeData) {
    const updateCoord = (data: TreeData) => {
      if (data.children) {
        for (const child of data.children) {
          updateCoord(child);
        }
      }
      const node = this.getNodeById(data.id!);
      node?.updatePosition(data.x, data.y);
    };
    updateCoord(data);
    Object.values(this.entityMap.edge).forEach((e: Edge) => {
      e.updatePosition();
    });
    this.autoDraw();
  }

  /**
   * Adjusts the scale and translation of the graph to fit its contents.
   * 将图中内容根据配置项中的宽高进行缩放平移，居中展示整个图
   */
  fitView() {
    const container = this.container;
    const center = this.getViewCenter();
    const padding = this.getViewPadding();
    const { width, height } = this.configs;
    const nodes = Object.values(this.entityMap.node);
    if (nodes.length === 0) {
      return;
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    // todo 如果支持了 group，这边要改一下
    nodes.forEach((node: Node) => {
      if (!node.isVisible()) {
        return;
      }
      const bbox = node.getBBox();
      minX = Math.min(bbox.left, minX);
      maxX = Math.max(bbox.left + bbox.width, maxX);
      minY = Math.min(bbox.top, minY);
      maxY = Math.max(bbox.top + bbox.height, maxY);
    });
    container.setMatrix([1, 0, 0, 1, 0, 0]);
    container.translate(center.x - (minX + maxX) / 2, center.y - (minY + maxY) / 2);
    const w = width / (maxX - minX + padding[1] + padding[3]);
    const h = height / (maxY - minY + padding[1] + padding[3]);
    const ratio = Math.min(w, h);
    this.scale(ratio, [center.x, center.y]);
  }

  private initNode(nodeData: any, depth: number) {
    nodeData.depth = depth;
    const node = new Node(nodeData, this, this.nodeContainer);
    const id = this.getEntityId(nodeData, 'node');
    // for Viewer 节点层叠次序 & miniMap order 次序
    node.layer?.set('id', id);
    nodeData.id = id;
    this.addToMap('node', node);
    return node;
  }

  private prepareData(data: TreeData) {
    const nodeFn = this.get('setDefaultNode');
    if (!nodeFn) {
      return;
    }
    function traverseData(data: TreeData) {
      if (data.children) {
        for (const child of data.children) {
          traverseData(child);
        }
      }
      return Object.assign(data, nodeFn(data));
    }
    traverseData(data);
  }

  /**
   * Export data from the graph.
   * 导出图中数据
   * @param [fn] - A filter that determines what to export.
   * @returns An object containing information about nodes, groups, and edges for a graph.
   */
  getData(fn?: (entity: Node | Edge) => Record<string, unknown>) {
    if (!fn) {
      fn = (entity: Node | Edge) => {
        if (entity.type !== 'node') {
          return entity.configs;
        }
        const result = {};
        for (const item in entity.configs) {
          if (item !== 'parent' && item !== 'children') {
            result[item] = entity.configs[item];
          }
        }
        return result;
      };
    }
    return {
      nodes: Object.values(this.entityMap.node).map(fn),
      edges: Object.values(this.entityMap.edge).map(fn),
    };
  }

  /**
   * Export tree like data from the graph.
   * 以树形结构导出图中数据
   * @param [fn] - A filter that determines what to export.
   * @returns An object containing information about nodes, groups, and edges for a graph.
   */
  getTreeData(fn?: (entity: Node | Edge) => Record<string, unknown>, data?: Node): TreeData {
    if (!fn) {
      fn = (entity: any) => {
        if (entity.type !== 'node') {
          return entity.configs;
        }
        const entityData: any = {};
        for (const item in entity.configs) {
          if (item !== 'parent' && item !== 'children') {
            entityData[item] = entity.configs[item];
          }
        }
        return entityData;
      };
    }
    if (!data) {
      if (!this.root) {
        return {};
      }
      data = this.root;
    }
    let children;
    if (data.configs.children) {
      children = data.configs.children.map((child: TreeData) => {
        const node = this.getNodeById(child.id!);
        if (!node) {
          console.warn(`Node id ${child.id} does not exist`);
          return null;
        }
        return this.getTreeData(fn, node);
      });
    }
    const result = fn(data);
    if (children && children.length !== 0) {
      result.children = children;
    }
    return result;
  }

  protected getLayouts() {
    return {
      [LAYOUT_TYPES.COMPACT_BOX]: CompactBox,
      [LAYOUT_TYPES.DENDROGRAM]: Dendrogram,
      [LAYOUT_TYPES.MIND_MAP]: MindMap,
      [LAYOUT_TYPES.INDENTED]: Indented,
    };
  }

  protected getDefaultConfigs(configs: GraphConfigs) {
    const defaultConfigs: any = super.getDefaultConfigs(configs);
    if (defaultConfigs.fitViewAfterLayout === undefined) {
      defaultConfigs.fitViewAfterLayout = true;
    }
    defaultConfigs.autoLayout = !!configs.layout;
    return defaultConfigs;
  }
  clear(): void {
    this.root = null;
    this.treeData = null;
    super.clear();
  }
}
