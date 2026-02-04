import { Graph } from '../../../graph';
import { Node, Edge } from '../../../models/entities';
import { CommandBase } from './base';
import { GRAPH_EVENTS } from '../../../consts/meta_events';
import { ACTION_TYPES } from '../../../consts/action_types';

type LayoutArgs = {
  layout: ((graph: Graph) => void);
}

function getPositions(graph: Graph) {
  const nodePositions: { id: string, x: number, y: number }[] = [];
  const edgePositions: { id: string, controlPoints: number[] }[] = [];
  graph.getNodes().forEach((node: Node) => {
    nodePositions.push({
      id: node.get('id'),
      x: node.get('x'),
      y: node.get('y'),
    });
  });
  graph.getEdges().forEach((edge: Edge) => {
    edgePositions.push({
      id: edge.get('id'),
      controlPoints: edge.get('controlPoints')
    });
  });
  return { nodePositions, edgePositions };
}

function recoverPositions(graph: Graph, positions: any) {
  const {nodePositions, edgePositions } = positions;
  const autoDraw = graph.disableAutoDraw();
  graph.set('emitGraphEvents', false);
  nodePositions.forEach((nodeData: { id: string, x: number, y: number }) => {
    const node = graph.getNodeById(nodeData.id);
    node.updateData({ x: nodeData.x, y: nodeData.y });
  });
  edgePositions.forEach((edgeData: { id: string, controlPoints: number[] }) => {
    const edge = graph.getEdgeById(edgeData.id);
    edge.set('controlPoints', edgeData.controlPoints);
  });
  graph.set('emitGraphEvents', true);
  graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
  graph.refresh();
  graph.enableAutoDraw(autoDraw);
}

export const LayoutCommand = Object.assign({}, CommandBase, {
  name: 'layout',
  savePosition: false,
  getSnapshot(graph: Graph, args: LayoutArgs) {
    const originPositions = getPositions(graph);
    const originMatrix = graph.getMatrix().concat([]);
    args.layout(graph);
    const currentPositions = getPositions(graph);
    const currentMatrix = graph.getMatrix();
    return {
      originPositions,
      originMatrix,
      currentPositions,
      currentMatrix,
    };
  },
  execute(snapshot: any, graph: Graph) {},
  undo(snapshot: any, graph: Graph) {
    const { originPositions, originMatrix } = snapshot;
    recoverPositions(graph, originPositions);
    graph.setMatrix(originMatrix.concat([]));
  },
  redo(snapshot: any, graph: Graph) {
    const { currentPositions, currentMatrix } = snapshot;
    recoverPositions(graph, currentPositions);
    graph.setMatrix(currentMatrix.concat([]));
  },
  getExecuteChanges(snapshot: any) {
    const { nodePositions, edgePositions } = snapshot.currentPositions;
    return {
      action: ACTION_TYPES.UPDATE,
      change: { node: nodePositions, edge: edgePositions }
    }
  },
  getUndoChanges(snapshot: any) {
    const { nodePositions, edgePositions } = snapshot.originPositions;
    return {
      action: ACTION_TYPES.UPDATE,
      change: { node: nodePositions, edge: edgePositions }
    }
  }
});