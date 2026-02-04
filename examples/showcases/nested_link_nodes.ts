import { dragCanvas, Node, Graph, panZoom, Group, RawTooltip, DAGLayout, GroupUtils } from '../../src';
import data from '../static/simple_nested.json';

// (data as any).nodes = data.nodes.map((node) => ({
//   id: node.id,
//   label: node.NodeName
// }));

// (data as any).edges = data.edges.map((edge) => ({
//   source: edge.source,
//   target: edge.target,
//   output: edge.OutputRows,
// }));

// (data as any).groups = data.groups.map((group) => ({
//   id: group.id,
//   children: group.children
// }));

// console.log(JSON.stringify(data));

const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;';
// let data: any = data1;

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.1,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: 'rect',
        width: 100,
        height: 40,
        radius: 5,
        fillStyle: '#fff',
        text: node.name ?? node.id ?? 'null',
        color: node.childNodes ? '#3073F2' : '#E1E4E8',
        label: {
          width: 80,
          text: node.name ?? node.id ?? 'null',
          textOverflow: 'ellipsis',
        },
        rectWidth: 20,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
        icons: node.childNodes
          ? [
              {
                show: 'always',
                position: [1, 0.5],
                offset: [-16, 0],
                setStyles() {
                  return { fillStyle: '#666', icon: expandIcon, cursor: 'pointer' };
                },
              },
            ]
          : undefined,
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      const label: any = node.getLabel();
      if (state === 'hover') {
        label?.set('fillStyle', '#3370FF');
        return { strokeStyle: '#3370FF', shadowColor: 'rgba(27, 31, 35, 0.08)', shadowOffsetX: 2, shadowOffsetY: 4 };
      } else {
        label?.set('fillStyle', '#666');
        return {};
      }
    },
    setDefaultEdge(edge: any) {
      return {
        type: 'line',
        strokeStyle: '#ddd',
        label: edge.output
          ? {
              position: 0.1,
              textAlign: 'center',
              text: `${edge.output} Rows`,
              autoRotate: false,
            }
          : undefined,
        endArrow: {
          type: 'arrow',
          style: 'triangleSolid',
          size: 10,
          strokeStyle: '#ddd',
        },
      };
    },
    setDefaultGroup(group: any) {
      return {
        linkNode: true,
        fillStyle: '#F3F9FF',
        strokeStyle: '#3073F2',
        padding: 10,
        radius: [3, 3, 0, 0],
        title: {
          text: { text: group.id, fillStyle: '#fff' },
          background: {
            fillStyle: '#3073F2',
          },
          icon: {
            icon: collapseIcon,
            fillStyle: '#fff',
            cursor: 'pointer',
            size: 16,
            onClick: (e: any, group: Group) => {
              collapseGroup(group);
            },
          },
        },
      };
    },
  });
  graph.data(data);

  (window as any).__graph = graph;
  const dag = new DAGLayout({
    graph,
    rankDir: 'TB',
    nodeSep: 20,
    edgeSep: 10,
    rankSep: 50,
  });

  function expandNode(node: Node) {
    const group = GroupUtils.expandGroupNode(graph, node);
    dag.layout();
    graph.refresh();
    graph.focus(group);
  }

  function collapseGroup(group: Group) {
    const groupNode = GroupUtils.collapseGroup(graph, group);
    dag.layout();
    graph.refresh();
    graph.focus(groupNode);
    return groupNode;
  }

  graph.refresh();
  graph.fitView();
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);

  graph.on('node:click', (e) => {
    const node = e.target;
    if (node.get('childNodes') && e.relatedTarget?.type === 'icon') {
      expandNode(node);
      return;
    }
    console.log(node);
  });

  graph.on('node:mouseenter', (e) => {
    e.target.setState('hover');
  });

  graph.on('node:mouseleave', (e) => {
    e.target.removeState('hover');
    e.target.setState('default');
  });

  graph.on('group:click', (e) => {
    console.log(e.target);
  });

  const tooltip = new RawTooltip(graph, {
    styles: {
      border: '1px solid #ccc',
      padding: '8px',
      borderRadius: '4px',
      backgroundColor: '#fff',
    },
    content(entity: any, type: string) {
      if (type === 'edge') {
        return `From ${entity.get('source')} to ${entity.get('target')}`;
      }
      return `${entity.get('name')}: ${entity.get('class')}`;
    },
    target: 'edge',
  });
})();
