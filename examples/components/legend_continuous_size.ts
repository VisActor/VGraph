import { dragCanvas, dragNode, Graph, panZoom, ForceDirectedLayout } from '../../src';
import { ContinuousLegend } from '../../src/components';
import data from '../static/miserables.json';

const colors = [
  '#4c72b0',
  '#dd8452',
  '#55a868',
  '#c44e52',
  '#8172b3',
  '#937860',
  '#da8bc3',
  '#8c8c8c',
  '#ccb974',
  '#64b5cd',
  '#17becf',
];

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);
  const legendDiv = document.createElement('div');
  legendDiv.style.position = 'absolute';
  legendDiv.style.right = '10px';
  legendDiv.style.top = '10px';
  legendDiv.style.border = '1px solid #666';

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        type: 'circle',
        width: 15,
        height: 15,
        strokeStyle: null,
        fillStyle: colors[node.group % 11] || colors[0],
        opacity: 0.2,
      };
    },
    setDefaultEdge(edge) {
      return {
        lineWidth: edge.value / 3,
        strokeStyle: '#ccc',
      };
    },
  });
  graph.data(data);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  (window as any)._graph = graph;
  div.children[0].appendChild(legendDiv);
  const fdp = new ForceDirectedLayout({
    graph,
    onTick: () => {
      graph.refresh();
    },
  });

  const legend = new ContinuousLegend(graph, {
    container: legendDiv,
    encodeAttr: 'value',
    channel: 'lineWidth',
    target: 'edge',
    width: 300,
    height: 150,
    orient: 'horizontal',
    slide: {
      enable: true,
      filter: true
    }
  });
})();

