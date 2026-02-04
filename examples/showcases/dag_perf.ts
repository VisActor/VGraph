// import dagre from 'dagre';
import { EdgeConfigs, Graph, NodeConfigs, DAGLayout } from '../../src';
import dataraw from '../static/instance4.json';
import soda from '../static/soda.json';
const data5 = JSON.parse(JSON.stringify(dataraw));
(soda as any).edges = soda.links;
// const nodes = data5.nodes.map((d: any) => ({
//   id: d.id,
//   name: d.name,
//   rank: d.rank,
//   order: d.order,
// }));
// const nodeMap = {};
// nodes.forEach((d: any) => {
//   nodeMap[d.id] = d;
// });
// const edges = data5.edges.map((d: any) => ({
//   source: d.source,
//   target: d.target,
// }));
// const data: any = {
//   nodes,
//   edges,
// };
// const data = {
//   nodes: soda.nodes.map((node: any) => {
//     node.id += '';
//     return node;
//   }),
//   edges: soda.links.map((edge: any) => {
//     edge.source += '';
//     edge.target += '';
//     return edge;
//   }),
// };

const nodes = [] as NodeConfigs[];
const edges = [] as EdgeConfigs[];

for (let i = 0; i < 1000; i++) {
  nodes.push({ id: i + '' });
}

for (let i = 0; i < 800; i++) {
  if (999 - i > i) {
    edges.push({
      source: i + '',
      target: 999 - i + '',
    });
  } else {
    edges.push({
      source: 999 - i + '',
      target: i + '',
    });
  }
  edges.push({
    source: i + '',
    target: Math.round(Math.random() * (999 - i)) + i + '',
  });
}

const data: any = { nodes, edges };

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        id: node.id,
        width: 50,
        height: 30,
        radius: 5,
        label: {
          width: 50,
          text: node.name ?? node.id + '' ?? 'null',
          fontSize: 10,
        },
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      const label: any = node.layer.find((shape: any) => shape.type === 'text');
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
        type: 'line',
        strokeStyle: '#ddd',
        endArrow: {
          type: 'arrow',
          style: 'triangleSolid',
          size: 10,
          strokeStyle: '#ddd',
        },
      };
    },
  });
  graph.data(soda as any);
  (window as any).__graph = graph;
  console.log(graph.getNodes().length, graph.getEdges().length);
  console.time();
  new DAGLayout({
    graph,
    rankDir: 'TB',
    nodeSep: 20,
    edgeSep: 10,
    rankSep: 50,
    align: 'UL',
    ranker: 'feasibleTree',
  });
  console.timeEnd();
  // console.time();
  // const g = new dagre.graphlib.Graph();
  // g.setGraph({
  //   rankdir: 'TB',
  //   // ranker: 'longest-path',
  //   nodesep: 20,
  //   edgesep: 10,
  //   ranksep: 50,
  // });
  // g.setDefaultEdgeLabel(() => {
  //   return {};
  // });
  // data.nodes.forEach((node: any) => {
  //   node.width = 50;
  //   node.height = 30;
  //   g.setNode(node.id, node);
  // });

  // data.edges.forEach((edge: any) => {
  //   g.setEdge(edge.source, edge.target);
  // });
  // dagre.layout(g);
  // g.nodes().forEach((v: any, i: number) => {
  //   const n = g.node(v);
  //   data.nodes[i].x = n.x;
  //   data.nodes[i].y = n.y;
  // });
  // g.edges().forEach((e: any, i: number) => {
  //   const points = g.edge(e).points.map((p: any) => [p.x, p.y]);
  //   data.edges[i].controlPoints = points.slice(1, points.length - 1);
  // });
  // console.timeEnd();
  // graph.updateData(graphData.getData());
  // console.log(graphData);

  graph.refresh();
  graph.fitView();
  let activeNode: any;
  graph.on('node:mouseenter', (e) => {
    activeNode = e.target;
    e.target.setState('hover');
  });

  graph.on('node:mouseleave', (e) => {
    activeNode.removeState('hover');
    e.target.setState('default');
  });
})();
