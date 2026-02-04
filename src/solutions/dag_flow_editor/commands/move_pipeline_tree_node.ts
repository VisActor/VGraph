import { Graph } from '../../../graph';
import { Edge } from '../../../models/entities';
import { CommandBase } from '../../../components/stack/commands/base';
import { ACTION_TYPES } from '../../../consts/action_types';

type MovePipelineTreeNodeArgs = {
  nodeId: string;
  parentId: string;
  index?: string;
};

export const MovePipelineTreeNodeCommand = Object.assign({}, CommandBase, {
  name: 'movePipelineTreeNode',
  shouldExecute(graph: Graph, args: MovePipelineTreeNodeArgs) {
    return true;
  },
  getSnapshot(graph: Graph, args: MovePipelineTreeNodeArgs) {
    const node = graph.getNodeById(args.nodeId);
    const formerParentId = node.sources[0];
    const formerParent = graph.getNodeById(formerParentId);
    const toParent = graph.getNodeById(args.parentId);
    const edge = node.edges.find((edge: Edge) => edge.get('source') === formerParentId)!;
    const edgeId = graph.getEntityId({}, 'edge');
    return {
      ...args,
      formerParentId,
      formerParentOrder: formerParent.targets.concat([]),
      toParentOrder: toParent.targets.concat([]),
      removeEdge: edge.configs,
      addEdge: {
        id: edgeId,
        source: args.parentId,
        target: args.nodeId,
      }
    };
  },

  execute(snapshot: Record<string, any>, graph: Graph) {
    const { removeEdge, addEdge, parentId, nodeId, index } = snapshot;
    const edge = graph.getEdgeById(removeEdge.id);
    graph.remove(edge);
    if (!isNaN(index)) {
      const parent = graph.getNodeById(parentId);
      parent.targets.splice(index, 0, nodeId);
    }
    graph.add('edge', {...addEdge});

    return {
      node: [snapshot.nodeId],
      edge: [],
      group: []
    };
  },

  undo(snapshot: Record<string, any>, graph: Graph) {
    const edge = graph.getEdgeById(snapshot.addEdge.id);
    graph.remove(edge);
    graph.add('edge', {...snapshot.removeEdge});
    const currentParent = graph.getNodeById(snapshot.parentId);
    currentParent.targets = snapshot.toParentOrder.concat([]);
    const formerParent = graph.getNodeById(snapshot.formerParentId);
    formerParent.targets = snapshot.formerParentOrder.concat([]);
  },

  getExecuteChanges(snapshot: Record<string, any>) {
    const { nodeId, formerParentOrder, toParentOrder, index } = snapshot;
    const formerTargets = formerParentOrder.concat([]);
    const i = formerTargets.indexOf(nodeId);
    if (i >= 0) {
      formerTargets.splice(i, 1);
    }
    const toTargets = toParentOrder.concat([]);
    if (!isNaN(index)) {
      toTargets.splice(index, 0, nodeId);
    } else {
      toTargets.push(nodeId);
    }
    return [{
      action: ACTION_TYPES.ADD,
      change: {
        node: [],
        edge: [snapshot.addEdge],
        group: [],
      },
    }, {
      action: ACTION_TYPES.UPDATE,
      change: {
        node: [{
          id: snapshot.formerParentId,
          targets: formerTargets,
        }, {
          id: snapshot.parentId,
          targets: toTargets,
        }],
        edge: [],
        group: []
      }
    }, {
      action: ACTION_TYPES.REMOVE,
      change: {
        node: [],
        edge: [snapshot.removeEdge],
        group: []
      }
    }];
  },
  getUndoChanges(snapshot: Record<string, any>) {
    return [{
      action: ACTION_TYPES.ADD,
      change: {
        node: [],
        edge: [snapshot.removeEdge],
        group: [],
      },
    }, {
      action: ACTION_TYPES.UPDATE,
      change: {
        node: [{
          id: snapshot.formerParentId,
          targets: snapshot.formerParentOrder,
        }, {
          id: snapshot.parentId,
          targets: snapshot.toParentOrder,
        }],
        edge: [],
        group: []
      }
    }, {
      action: ACTION_TYPES.REMOVE,
      change: {
        node: [],
        edge: [snapshot.addEdge],
        group: []
      }
    }];
  },
});