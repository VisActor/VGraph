import { Rect, TreeGraph, panZoom, attachableDragNode, Node, Text, brushSelect, CompactBox as Layout, GraphEvent } from '../../../src';
import data from '../../static/tree_data.json';
//import data from '../../flare.json';

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const groups = [
    ['Bagging', 'Boosting'],
    ['Different modeling methods', 'Different training sets', 'Different feature sets'],
    ['Consensus', 'Regression'],
  ];

  const PADDING = [12, 8, 12, 8];

  const layout = new Layout({
    direction: 'LR',
    size() {
      return [800, 600]
    },
    nodeSep() {
      return 20;
    },
    nodeSize() {
      return [140, 40];
    },
    rankSep() {
      return 60;
    }
  });

  const text = new Text({
    x: 0,
    y: 0,
    text: '',
    width: 300 - 24,
    height: 100 - 24,
  });

  const graph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    // animate: false,
    layout: {
      type: 'compactBox',
      options: {
        direction: 'TB',
        size() {
          return [800, 600];
        },
        nodeSep() {
          return 20;
        },
        nodeSize() {
          return [140, 40];
        },
        rankSep() {
          return 60;
        },
      },
    },
    fitViewAfterLayout: false,
    setDefaultNode(node: any) {
      const icons: any = [
        {
          setStyles(data: any) {
            return { fillStyle: '#3073FF', icon: expandIcon };
          },
          position: [1, 0.5],
          show: 'hover',
          offset: [28, 0],
        },
      ];
      if (node.children) {
        icons.push({
          setStyles(data: any) {
            const styles: any = {
              fillStyle: 'red',
              cursor: 'pointer',
            };
            if (data.collapsed) {
              styles.icon = collapseIcon;
            } else {
              styles.icon = expandIcon;
            }
            return styles;
          },
          position: [0.5, 1],
          // offset: [8, 0],
          show: 'hover',
          onClick(e: any, nodeData: any, node: Node) {
            const n = graph.getNodeById(nodeData.id);
            const icon = e.target.children[0];
            icon.set('collapsed', !n.get('collapsed'));
            graph.toggleCollapse(n, true);
            icon.set('icon', n.get('collapsed') ? collapseIcon : expandIcon);
            // updateRects();;
          },
        });
      }
      const label =
        node.id === 'Modeling Methods' || node.id === 'Multiple linear regression' ? node.id.repeat(10) : node.id;
      text.set('text', label);

      const bbox = text.getBBox();
      return {
        width: Math.min(bbox.width + 24, 300),
        height: Math.max(40, bbox.height + 24),
        strokeStyle: 'green',
        id: node.name || node.id,
        label: {
          text: label,
          width: bbox.width,
          height: bbox.height,
          textOverflow: 'ellipsis',
        },
        anchors: //[[0.5, 0], [0.5, 1]],
        [[0, 0.5], [1, 0.5]],
        // collapsed: node.id === 'Classification',
        // anchors: [{
        //   show: 'hover',
        //   position: [0, 0.5],
        //   setStyles() {
        //     return { size: 4, fillStyle: 'green' };
        //   },
        // }, {
        //   position: [1, 0.5],
        //   setStyles() {
        //     return { size: 4, fillStyle: 'green' };
        //   },
        //   onClick(e: any, nodeData: any) {
        //     console.log(e);
        //   }
        // }],
        icons,
      };
    },
    setNodeStateStyles() {
      return { strokeStyle: '#f50' };
    },
    setDefaultEdge() {
      return { type: 'hLine' }
    },
    setEdgeStateStyles() {
      return { strokeStyle: '#f50' };
    },
  });

  graph.on('node:click', (evt) => {
    const node = evt.target;
    const shape = node.getKeyShape().clone();
    shape.set('fillStyle', 'red');
    graph.draw();
  });

  graph.on('edge:click', (e) => {
    console.log(e.relatedTarget);
  });

  (window as any)._graph = graph;

  graph.data(data);
  const rects: Rect[] = [];
  // initRects();
  function initRects() {
    const container = graph.getGroupContainer();
    groups.forEach((item) => {
      const rect = new Rect({
        fillStyle: '#C6D8FF',
        strokeStyle: '#2367EA',
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        radius: 4,
        children: item,
      });
      container.add(rect);
      rect.on('click', (e) => {
        console.log(e);
      });
      rects.push(rect);
    });
    updateRects();
  }
  function updateRects() {
    rects.forEach((rect) => {
      const bbox = getBBox(rect);
      bbox && rect.set(bbox);
    });
    graph.draw();
  }

  function getBBox(rect: Rect) {
    const children = rect.get('children');
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    children.forEach((nodeId: string) => {
      const node = graph.getNodeById(nodeId);
      if (!node.isVisible()) {
        return;
      }
      const bbox = node.getBBox();
      const { left, top, width, height } = bbox;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);
    });
    if (minX === Infinity) {
      rect.hide();
      return null;
    }
    rect.show();
    return {
      left: minX - PADDING[3],
      top: minY - PADDING[0],
      width: maxX - minX + PADDING[1] + PADDING[3],
      height: maxY - minY + PADDING[0] + PADDING[2],
    };
  }

  // let moveNode: any;
  // let targetNode: any;
  // graph.addBehavior(dragCanvas);
  graph.addBehavior(brushSelect, {
    targets: ['edge'],
    onSelect(node: Node) {
      node.setState('select');
      return true;
    },
    onDeselect(node: Node) {
      node.removeState('select');
    },
    onChange() {},
  });
  graph.addBehavior(attachableDragNode, {
    layout,
    delegate: false,
    tempEdgeStyles: {
      strokeStyle: '#2367EA'
    },
    shouldTrigger(ev: GraphEvent) {
      // 根节点不可拖拽
      if (ev.target === graph.root) {
        return false;
      }
      return true;
    },
    onDragStart(node: Node) {
      // 隐藏被拖拽节点的子节点
      graph.setChildrenVisibility(node, false);
      // 将节点从父节点下移除
      graph.removeChild(node, node.get('parent'), false);
      graph.draw();
    },
    findClosestNode(node: Node) {
      const { x, y, id } = node.configs;
      let min = Infinity;
      let closest: any = null;
      graph.getNodes().forEach((node: Node) => {
        const nodeX = node.get('x');
        const nodeY = node.get('y');
        // 仅找被拖拽节点水平位置更前的可见节点
        if (nodeX > x || node.get('id') === id || !node.isVisible()) {
          return;
        }
        const dist = (x - nodeX) * (x - nodeX) + (y - nodeY) * (y - nodeY);
        if (dist < min) {
          min = dist;
          closest = node;
        }
      });
      return closest;
    },
    onDrop(node: Node, parent: Node) {
      const y = node.get('y');
      let index = -1;
      const childData = parent.get('children');
      for (let i = 0; i < childData.length - 1; i++) {
        const node = graph.getNodeById(childData[i].id) as Node;
        if (i === 0 && y < node.get('y')) {
          index = 0;
          break;
        }
        if (node.get('y') <= y && graph.getNodeById(childData[i + 1].id).get('y') > y) {
          index = i + 1;
          break;
        }
      }
      // 显示被拖拽节点的子节点
      if (!node.get('collapsed')) {
        graph.setChildrenVisibility(node, true);
      }
      console.log(node.get('id'), parent.get('id'), index);
      // 移动节点到被吸附节点下
      graph.moveNode(node, parent, index);
    }
  })
  graph.addBehavior(panZoom, { sensitivity: 4 });

})();
