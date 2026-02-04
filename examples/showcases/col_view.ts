import {
  Graph,
  panZoom,
  hideDetails,
  dragCanvas,
  Node,
  Edge,
  DAGLayout,
  GraphStructure,
  Group,
  GraphEvent,
} from '../../src';

const rankSep = 100;
const tableSep = 50;
const nodeWidth = 180;
const nodeHeight = 20;
const groupHeight = 20;

import data from '../static/col_view.json';

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  function customLayout(
    subGraph: Graph | GraphStructure,
    reuse?: { rank?: boolean; order?: boolean },
    rankOnly?: boolean
  ) {
    const nodeSep = subGraph.getNodes()[0].get('parent').id === '_nested_dag_mock_root' ? tableSep : 0;
    new DAGLayout({
      graph: subGraph,
      rankDir: 'LR',
      nodeSep: nodeSep,
      edgeSep: 10,
      rankSep: rankSep,
      ranker: reuse?.rank ? 'custom' : 'networkSimplex',
      order: reuse?.order ? 'custom' : 'minCross',
      rankOnly: rankOnly,
      cache: true,
    });
  }

  function toggleGroup(group: Group, graph: Graph) {
    if (group.get('collapsed')) {
      // 节点状态为收起，故而展开节点
      group.updateData({ 'radius': [4, 4, 0, 0] });
      group.expand();
      group.set('fixLeft', undefined);
      group.set('fixTop', undefined);
      group.set('fixWidth', undefined);
      group.set('fixHeight', undefined);
    } else {
      // 节点状态为展开，故而收起节点
      group.updateData({ 'radius': [4, 4, 4, 4] });
      group.collapse();
    }
    graph.layout(group.get('id'));
    graph.draw();
  }

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    autoLayout: true,
    layout: {
      type: 'nestedDag',
      options: {
        customLayout,
      },
    },
    setDefaultNode(node: any) {
      return {
        width: nodeWidth,
        height: nodeHeight,
        strokeStyle: null,
        label: node.id,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
      };
    },
    setNodeStateStyles(state: string, nodeData: any) {
      const node = graph.getNodeById(nodeData.id);
      const label = node.getLabel();
      if (state === 'highlight') {
        label.set('fillStyle', 'red');
        return {};
      } else {
        label.set('fillStyle', '#666');
        return {};
      }
    },
    setDefaultEdge() {
      return {
        type: 'line',
        strokeStyle: '#ddd',
        endArrow: true,
      };
    },
    setEdgeStateStyles(state: string) {
      if (state === 'highlight') {
        return { strokeStyle: '#666' };
      } else {
        return { opacity: 0.2 };
      }
    },
    setDefaultGroup(group: any) {
      return {
        linkNode: true,
        padding: [1, 1, 1, 1],
        radius: [4, 4, 0, 0],
        strokeStyle: '#3073FF',
        titleSize: groupHeight,
        title: {
          text: { text: group.id, fillStyle: '#FFF', x: 12 },
          background: {
            height: 20,
            strokeStyle: '#3073FF',
            fillStyle: '#3073FF',
          },
        },
      };
    },
    setGroupStateStyles(state: string, groupData: any) {
      const group = graph.getGroupById(groupData.id);
      const rect = group.titleLayer!.children[0];
      if (state === 'blur') {
        rect.set('fillStyle', '#eee');
        rect.set('strokeStyle', '#eee');
      } else {
        rect.set('fillStyle', groupData.depth === 0 ? '#25b864' : '#fff');
        rect.set('strokeStyle', '#666');
      }
      return {};
    },
  });
  (window as any)._graph = graph;
  graph.data(data);
  graph.refresh();
  graph.fitView();
  graph.addBehavior(panZoom);
  graph.addBehavior(hideDetails);
  graph.addBehavior(dragCanvas);

  graph.on('group:click', (e: GraphEvent) => {
    toggleGroup(e.target as Group, graph);
  })

  graph.on('node:click', (e: any) => {
    const target = e.target;
    Object.values(graph.entityMap.node).forEach((node: any) => {
      node.setState('blur', true);
    });
    Object.values(graph.entityMap.edge).forEach((edge: any) => {
      edge.setState('blur', true);
    });
    Object.values(graph.entityMap.group).forEach((group: any) => {
      group.setState('blur', true);
    });
    highlightNeibors(target, 'target');
    highlightNeibors(target, 'source');
  });

  graph.on('node:mouseenter', (e: any) => {
    highlightNeibors(e.target, 'source');
    highlightNeibors(e.target, 'target');
  });

  graph.on('node:mouseleave', (e: any) => {
    clearStates();
  });

  function highlightNeibors(target: any, type: string) {
    target.setState('highlight');
    // if (target.belong) {
    //   target.belong.setState('highlight', true);
    // }
    target.edges.forEach((edge: any) => {
      if (edge[type] !== target) {
        edge.setState('highlight', true);
        highlightNeibors(edge[type], type);
      }
    });
  }

  function clearStates() {
    graph.getNodes().forEach((node: Node) => {
      node.setState('default', true);
    });
    graph.getEdges().forEach((edge: Edge) => {
      edge.clearStates();
    });
  }
})();
