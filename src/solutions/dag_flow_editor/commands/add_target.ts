import { ACTION_TYPES } from '../../../consts/action_types';
import { Graph } from '../../../graph';
import { Edge } from '../../../models/entities';
import { CommandBase } from '../../../components/stack/commands/base';


type AddTargetArgs = {
  configs?: Record<string, any>;
  relativeNodeId: string;
  linkChildren?: boolean;
};

export const AddTargetCommand = Object.assign({}, CommandBase, {
  name: 'addTarget',
  shouldExecute(graph: Graph, args: AddTargetArgs) {
    const id = args.configs?.id;
    if (id && graph.entityMap.node[id]) {
      console.error(`Duplicate node id ${id}, add failed.`);
      return false;
    }
    if (!graph.getNodeById(args.relativeNodeId)) {
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: AddTargetArgs) {
    const id = graph.getEntityId(args.configs ?? {}, 'node');
    args.configs = args.configs || {};
    args.configs.id = id;
    const relativeId = args.relativeNodeId;
    const relativeNode = graph.getNodeById(args.relativeNodeId);
    const targetIndexMap = {};

    const relativeEdgeId = graph.getEntityId({}, 'edge');
    const addedEdgesConfigs = [{ id: relativeEdgeId, source: relativeId, target: id }];

    relativeNode.targets.forEach((target: string, index: number) => {
      if (args.linkChildren !== false) {
        const edgeId = graph.getEntityId({}, 'edge');
        addedEdgesConfigs.push({ id: edgeId, source: id, target })
      }
      targetIndexMap[target] = index;
    });
    const originSources = relativeNode.edges.filter((edge: Edge) => {
      return edge.get('source') === relativeId;
    });
    originSources.sort((a: Edge, b: Edge) => { return targetIndexMap[a.get('target')] - targetIndexMap[b.get('target')] });

    return {
      configs: args.configs,
      id,
      relativeTargets: relativeNode.targets.concat([]),
      addedEdgesConfigs,
      relativeNodeId: relativeId,
      removedEdges: args.linkChildren !== false ? originSources.map((edge: Edge) => edge.configs) : [],
      linkChildren: args.linkChildren
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const { configs, addedEdgesConfigs, removedEdges } = snapshot;
    graph.add('node', configs);
    for (const configs of addedEdgesConfigs) {
      graph.add('edge', configs);
    }
    for (const edge of removedEdges) {
      graph.remove(graph.getEdgeById(edge.id));
    }

    // 选中新增节点
    return {
      node: [snapshot.id],
      edge: [],
      group: []
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    graph.remove(graph.getNodeById(snapshot.id));
    if (snapshot.linkChildren !== false) {
      snapshot.removedEdges.forEach((edgeConfigs: any) => {
        graph.add('edge', edgeConfigs);
      });
    }
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    let targets = [snapshot.id];
    if (!snapshot.remvoeEdges) {
      targets = snapshot.relativeTargets.concat([]);
      targets.push(snapshot.id);
    }
    const actionChanges = [{
      action: ACTION_TYPES.ADD,
      change: {
        node: [snapshot.configs],
        edge: snapshot.addedEdgesConfigs
      },
    }, {
      action: ACTION_TYPES.UPDATE,
      change: {
        node: [{
          id: snapshot.relativeNodeId,
          targets,
        }],
        edge: [],
      }
    }] as { action: string; change: Record<string, any>; }[];
    if (snapshot.removedEdges?.length > 0) {
      actionChanges.push({
        action: ACTION_TYPES.REMOVE,
        change: {
          edge: snapshot.removedEdges
        },
      })
    }
    return actionChanges;
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const actionChanges = [{
      action: ACTION_TYPES.REMOVE,
      change: {
        node: [snapshot.configs],
        edge: snapshot.addedEdgesConfigs
      },
    }, {
      action: ACTION_TYPES.UPDATE,
      change: {
        node: [{
          id: snapshot.relativeNodeId,
          targets: snapshot.relativeTargets
        }],
        edge: [],
      }
    }] as { action: string; change: Record<string, any>; }[];
    if (snapshot.removedEdges?.length > 0) {
      actionChanges.push({
        action: ACTION_TYPES.ADD,
        change: {
          edge: snapshot.removedEdges
        },
      })
    }
    return actionChanges;
  },
});