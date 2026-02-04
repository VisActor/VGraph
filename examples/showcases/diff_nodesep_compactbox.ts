import { TreeGraph, panZoom, dragCanvas, fastrand } from '../../src';
import { CompactBox } from '../../src/layouts/tree';
// import {  } from '../../../src/layouts/utils';

const expandIcon = '&#xe613;';
const collapseIcon = '&#xe611;';
// 设置思维导图布局
const layout = new CompactBox({
  direction: 'LR',
  nodeSize(node: any) {
    return [node.width ?? 138, node.height ?? 40];
  },
  nodeSep(nodeData: any) {
    return nodeData.lastChild ? 120 : 20;
  },
  rankSep() {
    return 50;
  },
});

const div = document.createElement('div');
div.style.border = '1px solid #666';
div.style.width = '800px';
div.style.height = '600px';
document.body.append(div);

const width = div.offsetWidth;
const height = div.offsetHeight;

// 初始化 graph 实例
const graph = new TreeGraph({
  container: div,
  width,
  height,
  minRatio: 0.01,
  maxRatio: 8,
  animate: true,
  linkCenter: true,
  layout,
  setDefaultNode(node) {
    let icons = null as any;
    let fillColor = '#D9E3F8';
    if (node.children) {
      fillColor = '#F4E0CB';
      icons = [
        {
          setStyles(data: any) {
            const styles: any = {
              fillStyle: '#C96600',
              size: 10,
              cursor: 'pointer',
            };
            if (data.collapsed) {
              styles.icon = expandIcon;
            } else {
              styles.icon = collapseIcon;
            }
            return styles;
          },
          setBgStyles(data: any) {
            return {
              type: 'circle',
            };
          },
          position: [1, 0.5],
          offset: [0, 0],
          show: 'hover',
          onClick(e: any, nodeData: any) {
            const n = graph.getNodeById(nodeData.id);
            const icon = e.target.children[1];
            icon.set('icon', n.get('collapsed') ? collapseIcon : expandIcon);
            e.target.hide();
            graph.toggleCollapse(n);
          },
        },
      ];
    }
    return {
      width: 140,
      height: 40,
      radius: 4,
      strokeStyle: null,
      fillStyle: fillColor,
      label: node.id,
      icons,
    };
  },
  setNodeStateStyles(state) {
    if (state === 'active') {
      return {
        shadowColor: 'rgba(27, 31, 35, 0.12)',
        shadowBlur: 10,
        shadowOffsetY: 4,
      };
    }
  },
  setDefaultEdge() {
    return {
      type: 'hLine',
      strokeStyle: '#D1D5DA',
    };
  },
  setEdgeStateStyles(state, edgeConfigs, edge) {
    edge.toFront();
    const node = edge.target;
    if (state === 'active') {
      return {
        lineWidth: 2,
        strokeStyle: node.get('color'),
      };
    }
  },
});

const rand = fastrand();
rand.setSeed(123);

fetch('https://cdn-tos-cn.bytedance.net/obj/maat/img/emhvbmdmYWhhaS4xMjE3/file_1894eaa3dc997.json')
  .then((response) => response.json())
  .then((data) => {
    // 写入数据
    // const nodes = data.nodes;
    dfsLastChild(data);
    graph.data(data);
  });


function dfsLastChild(node: any){
  if (node.children){
    const length = node.children.length;
    node.children[length - 1].lastChild  = true;
    for (let i = 0; i < length; i++){
      dfsLastChild(node.children[i]);
    }
  }
}

// 添加交互
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
