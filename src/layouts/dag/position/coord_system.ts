
import { Graph } from '../../../graph';
import { Node, Edge } from '../../../models/entities';
import { GraphStructure, NodeStructure, EdgeStructure } from '../../../graph_structure';
const HORIZONTAL_RANKDIRS = ['LR', 'RL'];

const REVERSE_Y_RANKDIRS = ['BT', 'RL'];

export const coordSystem = {
  adjust(graph: GraphStructure | Graph, rankDir: 'TB' | 'BT' | 'LR' | 'RL') {
    if (!HORIZONTAL_RANKDIRS.includes(rankDir)) {
      return;
    }
    swapSize(graph);
  },
  revert(graph: GraphStructure | Graph, rankDir: 'TB' | 'BT' | 'LR' | 'RL') {
    if (REVERSE_Y_RANKDIRS.includes(rankDir)) {
      graph.getNodes().forEach((node: Node | NodeStructure) => {
        node.set('y', -node.get('y'));
      });
      graph.getEdges().forEach((edge: Edge | EdgeStructure) => {
        const controlPoints = edge.get('controlPoints');
        if (controlPoints) {
          controlPoints.forEach((point: number[]) => {
            point[1] *= -1;
          });
        }
      });
    }

    if (HORIZONTAL_RANKDIRS.includes(rankDir)) {
      swapCoords(graph);
      swapSize(graph);
    }
  },
  alignPeerNodes(
    layers: Node[][] | NodeStructure[][],
    align?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  ) {
    for (const layer of layers) {
      alignNodes((layer as Node[]).filter((node: Node | NodeStructure) => !node.get('dummy')), align ?? 'center');
    }
  },
};

function swapSize(graph: GraphStructure | Graph) {
  graph.getNodes().forEach((node: Node | NodeStructure) => {
    const { width, height } = node.configs;
    node.set('width', height);
    node.set('height', width);
  });
}

function swapCoords(graph: GraphStructure | Graph) {
  graph.getNodes().forEach((node: Node | NodeStructure) => {
    const { x, y } = node.configs;
    node.set('x', y);
    node.set('y', x);
  });

  graph.getEdges().forEach((edge: Edge | EdgeStructure) => {
    const controlPoints = edge.get('controlPoints');
    if (controlPoints) {
      for (let i = 0; i < controlPoints.length; i++) {
        controlPoints[i] = [controlPoints[i][1], controlPoints[i][0]];
      }
    }
  });
}

function alignNodes(nodes: Node[] | NodeStructure[], align: 'top' | 'bottom' | 'left' | 'right' | 'center') {
  if (!['top', 'bottom', 'left', 'right'].includes(align)) {
    return;
  }
  const minX = Math.min(...nodes.map((node) => node.configs.x - node.configs.width / 2));
  const maxX = Math.max(...nodes.map((node) => node.configs.x + node.configs.width / 2));
  const minY = Math.min(...nodes.map((node) => node.configs.y - node.configs.height / 2));
  const maxY = Math.max(...nodes.map((node) => node.configs.y + node.configs.height / 2));
  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = width / 2;
  const centerY = height / 2;
  nodes.forEach((node) => {
    switch (align) {
      case 'top':
        node.configs.y -= centerY - node.configs.height / 2;
        break;
      case 'bottom':
        node.configs.y += centerY - node.configs.height / 2;
        break;
      case 'left':
        node.configs.x -= centerX - node.configs.width / 2;
        break;
      case 'right':
        node.configs.x += centerX - node.configs.width / 2;
        break;
      default:
        break;
    }
  });
}
