import { getFontByConfigs } from '../../../src/renderer/utils/text';
import { dragGroup } from './drag_group';

import {
  dragCanvas,
  Graph,
  panZoom,
  Text,
  highlightRelations,
  Group,
  Icon,
  textUtil,
  Edge,
  Minimap,
  LAYOUT_TYPES,
} from '../../../src';

import nestedDagData from '../../static/datata.json';
import case1 from '../../static/simple_nested_dag_dubug.json';
import { preOrder } from '../../../src/layouts/tree/utils/traverse';
const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;';

// const nodes = nestedDagData.nodes.filter((d) => !d.isGroup);
// nodes.map((d: any) => ((d.id = d.key), (d.width = 100), (d.height = 20)));
// const groups = nestedDagData.nodes.filter((d) => d.isGroup);
// groups.map((d: any) => (d.id = d.key));
// const groupMap = {};
// for (const group of groups) {
//   if (groupMap[group.key]) {
//     console.log('duplicate group:', group.key);
//   } else {
//     groupMap[group.key] = group;
//   }
// }
// const edges = nestedDagData.edges.concat();
// const edges: any[] = nestedDagData.edges.map((d) => {
//   return {
//     source: d.from,
//     target: d.to,
//   };
// }); // 规范化 egdes

// const topGroup = [] as any[];
// for (const group of groups) {
//   // 从 groups 构造 group 的嵌套关系
//   if (group.group) {
//     if (groupMap[group.group]) {
//       const parent = groupMap[group.group];
//       parent.children = parent.children || [];
//       parent.children.push(group);
//       (group as any).parent = parent;
//     } else {
//       console.log('group not found:', group.group);
//     }
//   } else {
//     topGroup.push(group);
//   }
// }

// for (const node of nodes) {
//   // 将叶子节点添加到 group 中
//   if (groupMap[node.group as string]) {
//     const parent = groupMap[node.group as string];
//     parent.children = parent.children || [];
//     parent.children.push(node);
//     (node as any).parent = parent;
//   } else {
//     console.log('group not found:', node.group);
//   }
// }
// const groupData: any = [];
// Object.keys(groupMap).forEach((key: any) => {
//   const group = groupMap[key];
//   group._children = group.children;
//   group.children = group.children.map((child: any) => child.id || child.key);
//   groupData.push(group);
// });
// console.log(groupData);

// const g = new GraphStructure({ nodes, edges, groups: groupData });  // GraphStructure 没处理嵌套
// const g = new GraphStructure({ nodes, edges });
const nodeMap = {} as any;
nestedDagData.nodes.map((d: any) => {
  nodeMap[d.id] = d;
});

// const groupNodes = [] as any;

// const colors = [
//   '#4c72b0',
//   '#8c8c8c',
//   '#25a868',
//   '#c44e52',
//   '#8172b3',
//   '#937860',
//   '#da8bc3',
//   '#d0ff8f',
//   '#ccb974',
//   '#64b5cd',
//   '#a305e5',
//   '#000000',
//   '#dd8452',
// ];
// console.log(nodes, edges, topGroup);
const changeTypeColor = {
  other: null,
  '#c44e52': '#c44e52',
  '#25a868': '#25a868',
  '#dd8452': '#dd8452',
};
const changeTypeIcon = {
  '#c44e52': '&#xe605;',
  '#25a868': '&#xe606;',
  '#dd8452': '&#xe601;',
};

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '1800px';
  document.body.append(div);
  const btn = document.createElement('button');
  btn.textContent = 'toggle edge';
  div.appendChild(btn);

  const minimapDiv = document.createElement('div');
  minimapDiv.style.position = 'absolute';
  minimapDiv.style.right = '10px';
  minimapDiv.style.top = '10px';
  minimapDiv.style.border = '1px solid #666';
  document.body.append(minimapDiv);

  const graph = new Graph({
    container: div,
    width: 1800,
    height: 800,
    minRatio: 0.01,
    maxRatio: 8,
    animate: false,
    layout: {
      type: 'nestedDag',
      options: {
        controlPoints: true,
        // groups: topGroup,
        dagOptions: {
          rankDir: 'LR',
          nodeSep: 30,
          edgeSep: 10,
          rankSep: 50,
          ranker: 'networkSimplex',
          allControlPoints: true,
          cache: true,
        },
      },
    },
    setDefaultNode(nodeData: any) {
      let icons = null as any;
      if (nodeData?.changeType) {
        const icon = changeTypeIcon[nodeData.changeType];
        icons = [
          {
            setStyles: (data: any) => {
              return {
                icon,
                size: 15,
                fillStyle: changeTypeColor[nodeData?.changeType ?? 'other'],
                fontFamily: 'coloriconfont',
              };
            },
            position: [0.9, 0.5],
          },
        ];
      }

      return {
        type: 'Rect',
        radius: 10,
        width: nodeData.width ?? 40,
        height: nodeData.height ?? 20,
        strokeStyle: '#4170F2',
        fillStyle: changeTypeColor[nodeData?.changeType ?? 'other'],
        label: {
          offsetX: nodeData?.changeType ? -6 : 0,
          width: nodeData.width - 30,
          text: nodeData.text ?? nodeData.id,
          fillStyle: '111',
          textOverflow: 'ellipsis',
          opacity: 1.0,
        },
        icons,
        anchors: [
          [0.0, 0.5],
          [1.0, 0.5],
          //   [0.5, 0.0],
          //   [0.5, 1.0],
        ],
        opacity: 0.3,
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      const label: any = node.layer.find((shape: any) => shape.type === 'text');
      // if (state === 'active') {
      //   console.log({ ...node.configs });
      // }
      if (state === 'hide') {
        return { fillStyle: data.color };
      }
      if (state === 'hover') {
        label.set('fillStyle', '#3370FF');
        return { strokeStyle: '#3370FF' };
      } else {
        label.set('fillStyle', '#666');
        return { strokeStyle: '#ccc' };
      }
    },
    setDefaultEdge(edge: any) {
      return {
        id: edge.source + '-' + edge.target,
        // type: 'quadratic',
        type: 'hLine',
        // type: 'hCubic',
        endArrow: {
          width: 9,
          height: 12,
        },
        strokeStyle: '#64b5cd',
        appendSize: 2,
        lineWidth: 2,
        opacity: 0.3,
      };
    },
    setEdgeStateStyles(state) {
      if (state === 'active') {
        return {
          opacity: 1.0,
          strokeStyle: '#64b5cd',
        };
      }
      return { opacity: 0.1 };
    },
    setDefaultGroup(groupData: any) {
      return {
        linkNode: true,
        fillStyle: '#fff',
        strokeStyle: '#DDE2E9',
        linkGroupOnCollapse: true,
        // padding: [10, 100, 100, 10],
        paddin: 20,
        radius: 4,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        capture: false,
        titleSize: 32,
        renderGroupTitle(group: Group, layer: any, width: number) {
          const icon = new Icon({
            x: 28,
            y: 16,
            fillStyle: '#595959',
            icon: group.get('collapsed') ? expandIcon : collapseIcon,
            cursor: 'pointer',
          });
          layer.add(icon);

          icon.on('click', () => {
            toggleGroup(group);
          });

          const text = new Text({
            x: 40,
            y: 16,
            text: group.get('id'),
            width: width - 40 - 16,
            textOverflow: 'ellipsis',
          });
          layer.add(text);
          return group.get('collapsed') ? 64 : 32;
        },
      };
    },
  });

  graph.addBehavior(panZoom, { sensitivity: 5 });
  //   graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: 'hide' });
  graph.addBehavior(dragCanvas, {
    // canvasOnly: false,
    // shouldTrigger: (e: any, shape: any) => {
    //   console.log(e.target,shape, e.relatedTarget.parent);
    //   if (e.target.type === 'node') {
    //     return false;
    //   }
    //   return true;
    // },
  });
  // graph.addBehavior(dragNode);
  graph.addBehavior(highlightRelations);
  graph.addBehavior(dragGroup);

  // const groupData: any = [];
  // Object.keys(groupMap).forEach((key: any) => {
  //   const group = groupMap[key];
  //   // group._children = group.children;
  //   group.children = group.children.map((child: any) => child.id || child.key);
  //   groupData.push(group);
  // });
  // // console.log(groupData);
  // console.log(groupData);
  // console.log(JSON.stringify({ nodes, edges: nestedDagData.edges, groups: groupData }))
  graph.data(nestedDagData);
  // graph.data(case1);

  graph.getGroups().map((group) => {
    if (!group.belong) {
      group.configs.__depth = 0;
      preOrder(group, (group, rank) => {
        if (group?.type === 'group') {
          if (group.belong) {
            group.configs.__depth = group.belong.configs.__depth + 1;
          }
        }
      });
    }
  });

  new Minimap(graph, {
    container: minimapDiv,
    width: 200,
    height: 150,
    type: 'delegate',
    showEdges: true,
    getNodeStyles(node) {
      return {
        // strokeStyle: '#d34a55',
        fillStyle: node.get('fillStyle') === null ? '#d34a55' : node.get('fillStyle'),
        lineWidth: 2,
        // r: 10,
      };
    },
    getEdgeStyles() {
      return {
        lineWidth: 2,
        opacity: 1,
        strokeStyle: '#5EA7C2',
      };
    },
    getGroupStyles(group: any) {
      return {
        fillStyle: group.get('__depth') % 2 ? '#fff' : '#eee',
        lineWidth: 5,
        // strokeStyle: group.get('__depth') % 2 ? '#ccc' : '#fff',
      };
    },
  });

  graph.refresh();
  graph.draw();

  graph.fitView();

  graph.on('edge:click', (e) => {
    console.log(e.target);
  });

  // graph.data(newData);
  (window as any).__graph = graph;
  document.fonts.ready.then(() => {
    graph.draw();
  });

  let showEdge = true;
  function toggleGroup(group: Group) {
    if (group.get('collapsed')) {
      group.expand();
      group.set('fixLeft', undefined);
      group.set('fixTop', undefined);
      group.set('fixWidth', undefined);
      group.set('fixHeight', undefined);

    } else {
      group.collapse();
      const font = getFontByConfigs(group.titleLayer?.children[1].configs);
      group.set('width', textUtil.getCharLen(group.get('label'), font) + 50); // 可以改变分组节点宽度
      !showEdge &&
        graph.getEdges().forEach((edge: Edge) => {
          edge.hide();
        });
      // group.set('fixWidth',textUtil.getCharLen(group.get('label'),font) + 50); // 可以改变分组节点宽度
      // group.set('height', 180); // 可以改变分组节点高度
      // group.set('fixHeight', 280); // 可以改变分组节点高度
      graph.draw();
    }
    graph.layout(group.get('id'), { rank: true, order: true });
    graph.refresh();
  }

  btn.onclick = () => {
    showEdge = !showEdge;
    if (showEdge) {
      graph.getEdges().forEach((edge: Edge) => {
        const source = edge.getSource();
        const target = edge.getTarget();
        if (source.isVisible() && target.isVisible()) {
          edge.show();
        }
      });
    } else {
      graph.getEdges().forEach((edge: Edge) => {
        edge.hide();
      });
    }
    graph.draw();
  };
})();
