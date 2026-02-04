import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
} from '../../../src';
import ForceWorker from './force.worker.ts';
import viscoauthorRaw from '../../static/visCoauthor.json';
import calData from '../../static/california.json';
// const data = miserablesRaw;
const misData = {
  nodes: calData.nodes,
  edges: calData.links,
}
const visData = dealData(viscoauthorRaw);
let data:any = {
  nodes: calData.nodes,
  edges: calData.links,
};
// 可以尝试切换数据
const color = [
  '#4c72b0',
  '#dd8452',
  '#25a868',
  '#c44e52',
  '#8172b3',
  '#937860',
  '#da8bc3',
  '#8c8c8c',
  '#ccb974',
  '#64b5cd',
  '#a305e5',
  '#000000',
  '#d0ff8f',
];

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const btn = document.createElement('button');
  btn.textContent = 'toggle data';
  div.appendChild(btn);
  btn.onclick = () => {
    if (data === visData) {
      data = misData;
    } else {
      data = visData;
    }
    worker.postMessage({ data, options: {
      postTickInterval: 100,
      nodeSize: 15,
      maxIteration: 150,
      graphSize: [800, 600],
    } });
  };

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        type: 'circle',
        width: 15,
        height: 15,
        strokeStyle: '#fff',
        fillStyle: node.group ? color[node.group % 13]: color[0],
      };
    }, // 定制节点样式
    setNodeStateStyles(state) {
      if (state === 'active') {
        return {
          opacity: 1.0,
        };
      }
      return { opacity: 0.2 };
    },
    setDefaultEdge() {
      return {
        strokeStyle: '#ccc',
      };
    },
    setEdgeStateStyles(state) {
      if (state === 'active') {
        return {
          strokeStyle: '#A7A7A7',
        };
      }
      return { opacity: 0.2 };
    },
  });
  // 添加交互
  graph.addBehavior(highlightRelations);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  (window as any).graph = graph;
  const worker = new ForceWorker();
  console.time();
  worker.postMessage({ data, options: {
    maxIteration: 150,
    // autoForces: true,
    nodeSize: 15,
    graphSize: [800, 600],
    forces: {
      link: { distance: 30 },
      manyBody: { strength: -30 },
      collision: { radius: 8 },
      center: { x: 400, y: 300 }
    },
  } });
  worker.onmessage = (event: any) => {
    graph.set('autoDraw', false);
    graph.data(event.data.data);
    graph.set('autoDraw', true);
    graph.fitView();
    console.timeEnd();
    console.log(data.nodes.length, data.edges.length);
  };
  graph.removeBehavior('dragNode');
  return function cleanup() {
    graph.destroy();
  };
})();

function dealData(data: any) {
  const nodes = data.nodes;
  nodes.forEach((node: any) => {
    node.id = node.name;
  });
  data.links.forEach((edge: any) => {
    edge.source = nodes[edge.source].id;
    edge.target = nodes[edge.target].id;
  });
  data.edges = data.links;
  return data;
}
