import { Graph } from '../../../graph';
import { Edge } from '../../../models/entities';
import { uuid } from '../../../utils';
import { CommandBase } from '../../../components/stack/commands/base';

type AddSourceArgs = {
  configs?: Record<string, any>;
  relativeNodeId: string;
};

export const AddSourceCommand = Object.assign({}, CommandBase, {
  name: 'addSource',
  shouldExecute(graph: Graph, args: AddSourceArgs) {
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
  getSnapshot(graph: Graph, args: AddSourceArgs) {
    let id = args.configs?.id;
    if (!id) {
      id = uuid(10);
      while (graph.entityMap.node[id]) {
        id = uuid(10);
      }
      args.configs = args.configs || {};
      args.configs.id = id;
    }
    const relativeId = args.relativeNodeId;
    const originSources = graph.getNodeById(relativeId).edges.filter((edge: Edge) => {
      return edge.get('target') === relativeId;
    });
    return {
      configs: args.configs,
      id,
      relativeNodeId: relativeId,
      edges: originSources.map((edge: Edge) => edge.configs)
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const { id, configs, relativeNodeId } = snapshot;
    graph.add('node', configs);
    const relativeNode = graph.getNodeById(relativeNodeId);
    // 继承原节点的前置节点
    relativeNode.sources.forEach((source: string) => {
      // 维护子节点的顺序
      const sourceNode = graph.getNodeById(source);
      const targets = sourceNode.targets;
      const index = targets.indexOf(relativeNodeId);
      targets[index] = id;
      graph.add('edge', {
        source,
        target: id
      });
    });

    // 打断原节点的前置节点
    for (let i = relativeNode.edges.length - 1; i >= 0; i--) {
      const edge = relativeNode.edges[i];
      if (edge.get('target') === relativeNodeId) {
        graph.remove(edge);
      }
    }

    // 新节点到源节点的连线
    graph.add('edge', {
      source: id,
      target: relativeNode.get('id'),
    });

    // 选中新增节点
    return {
      node: [snapshot.id],
      edge: [],
      group: []
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const indexMap = {};
    const node = graph.getNodeById(snapshot.id);
    for (const source of node.sources){
      const sourceNode = graph.getNodeById(source);
      const targets = sourceNode.targets;
      const index = targets.indexOf(node.get('id'));
      indexMap[source] = index;
    }
    snapshot.edges.forEach((edgeConfigs: any) => {
      if (indexMap[edgeConfigs.source] !== undefined) {
        const sourceNode = graph.getNodeById(edgeConfigs.source);
        const targets = sourceNode.targets;
        targets[indexMap[edgeConfigs.source]] = edgeConfigs.target;
      }
      graph.add('edge', edgeConfigs);
    });
    graph.remove(node);
  },
  redo(snapshot: AddSourceArgs, graph: Graph) {
    const selections = this.execute(snapshot, graph);
    return selections;
  }
});