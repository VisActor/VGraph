import { TreeGraph, dragCanvas, panZoom, Layer, Node, Rect, Text, CompactBox as Layout } from '../../../src';
import data from '../../static/tree_data.json';

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';

const RECT_SIZE = 20;

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const layout = new Layout({
    direction: 'TB',
    size() {
      return [800, 600]
    },
    nodeSep() {
      return 50;
    },
    nodeSize() {
      return [140, 40];
    },
    rankSep() {
      return 60;
    }
  });

  const graph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    animate: false,
    layout,
    fitViewAfterLayout: false,
    setDefaultNode(node: any) {
      const icons: any = [{
        setStyles(data: any) {
          return { fillStyle: '#3073FF', icon: expandIcon };
        },
        position: [1, 0.5],
        show: 'hover',
        offset: [28, 0],
      }];
      if (node.children) {
        icons.push({
          setStyles(data: any) {
            const styles: any = {
              fillStyle: 'red',
              cursor: 'pointer',
            }
            if (data.collapsed) {
              styles.icon = collapseIcon;
            } else {
              styles.icon = expandIcon;
            }
            return styles;
          },
          position: [1, 0.5],
          offset: [8, 0],
          show: 'hover',
          onClick(e: any, nodeData: any, node: Node) {
            const n = graph.getNodeById(nodeData.id);
            const icon = e.target.children[0];
            icon.set('collapsed', !n.get('collapsed'));
            graph.toggleCollapse(n);
            icon.set('icon', n.get('collapsed') ? collapseIcon : expandIcon);
          }
        });
      }
      return {
        width: 140,
        height: 40,
        strokeStyle: 'green',
        id: node.name || node.id,
        label: node.name || node.id,
        anchors: [[0.5, 0], [0.5, 1]]
      }
    },
    setNodeStateStyles() {
      return { strokeStyle: '#f50' };
    },
    setDefaultEdge() {
      return { type: 'vLine' }
    },
    setEdgeStateStyles() {
      return { strokeStyle: '#f50' };
    }
  });

  graph.addBehavior(panZoom, { sensitivity: 4 });
  graph.addBehavior(dragCanvas);

  graph.on('node:click', (evt) => {
    const node = evt.target;
    graph.toggleCollapse(node);
    layer.clear();
    refreshOperators(data);
    graph.draw();
  });

  (window as any)._graph = graph;

  graph.data(data);

  const layer = new Layer({
    id: 'operators'
  });

  graph.getContainer().add(layer);
  refreshOperators(data);
  graph.fitView();

  function refreshOperators(data: any) {
    if (!data.collapsed && data.children?.length > 1) {
      refreshChildOperators(data.children);
    }
  }

  function refreshChildOperators(children: any) {
    for (let i = 0; i < children.length - 1; i++) {
      const child = children[i];
      const sibling = children[i + 1];
      const { x, y } = child;
      const rect = new Rect({
        left: (sibling.x + x) / 2 - RECT_SIZE / 2,
        top: y - RECT_SIZE / 2,
        width: RECT_SIZE,
        height: RECT_SIZE,
        strokeStyle: '#ccc',
        radius: 2,
      });
      const text = new Text({
        text: '+',
        x: (sibling.x + x) / 2,
        y,
        textAlign: 'center',
        textBaseline: 'middle',
      });
      layer.add(rect);
      layer.add(text);
      refreshOperators(child);
    }
    refreshOperators(children[children.length - 1]);
  }

})();