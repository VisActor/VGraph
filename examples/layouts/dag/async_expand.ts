import {
  DAGLayout,
  Graph,
  Node,
  GroupUtils,
  uuid,
  dragCanvas,
  hideDetails,
  panZoom,
  Group,
} from '../../../src';
import data from '../../static/syntax_tree.json';

const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;';

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  // data = GroupUtils.getCollapsableData(data);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.1,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: 'rect',
        width: 86,
        height: 30,
        radius: 4,
        label: {
          width: 60,
          text: node.class ?? node.id ?? '-',
          // textBaseline: 'middle',
          // textAlign: 'center',
        },
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        icons: [
          {
            show: 'always',
            position: [1, 0.5],
            offset: [-10, 0],
            setStyles() {
              return { fillStyle: '#666', icon: expandIcon };
            },
          },
        ],
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      const label: any = node.getLabel();
      if (state === 'hover') {
        label?.set('fillStyle', '#3370FF');
        return { strokeStyle: '#3370FF' };
      } else {
        label?.set('fillStyle', '#666');
        return { strokeStyle: '#ccc' };
      }
    },
    setDefaultEdge(edge: any) {
      return {
        endArrow: true,
      };
    },
    setDefaultGroup(group: any) {
      return {
        linkNode: false,
        fillStyle: '#F3F9FF',
        strokeStyle: '#3073F2',
        padding: 10,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        title: {
          text: { text: group.class },
          background: {
            fillStyle: '#F0F3F6',
          },
          icon: {
            icon: collapseIcon,
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
    rankDir: 'LR',
    nodeSep: 80,
    edgeSep: 10,
    rankSep: 100,
  });

  function expandNode(node: Node) {
    let group: any;
    if (!node.get('childNodes')) {
      group = GroupUtils.expandGroupNode(graph, node, mockData());
    } else {
      group = GroupUtils.expandGroupNode(graph, node);
    }
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

  function mockData() {
    const nodes = [] as any[];
    const edges = [] as any[];
    const count = Math.random() * 5 + 1;
    for (let i = 0; i < count; i++) {
      const id = uuid(8);
      nodes.push({ id });
      if (i > 0) {
        edges.push({
          source: nodes[0].id,
          target: id,
        });
      }
    }
    return { nodes, edges };
  }

  graph.refresh();
  graph.fitView();
  graph.addBehavior(panZoom, { sensitivity: 5 });
  graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: 'hide' });
  graph.addBehavior(dragCanvas);
  let activeNode: any;

  graph.on('node:click', (e) => {
    const node = e.target;
    if (e.relatedTarget?.type === 'icon') {
      expandNode(node);
      return;
    }
    console.log(node);
  });

  graph.on('node:mouseenter', (e) => {
    activeNode = e.target;
    e.target.setState('hover');
  });

  graph.on('node:mouseleave', (e) => {
    activeNode.removeState('hover');
    e.target.setState('default');
  });
})();
