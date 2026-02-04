import { Graph } from '../../../graph';
import { cloneDeep, uuid } from '../../../utils';
import { CommandBase } from '../../../components/stack/commands/base';

type ProcessRemoveArgs = {
    id: string;
};

export const ProcessRemoveCommand = Object.assign({}, CommandBase, {
  name: 'processRemove',
  shouldExecute(graph: Graph, args: ProcessRemoveArgs) {
    const entity = graph.getNodeById(args.id);
    if (entity) {
      if (entity.isDestroyed()) {
        console.error(`Node id ${entity.get('id')} is destroyed, remove failed.`);
        return false;
      }
    } else {
      console.error(`Can not find ${args.id} in node entityMap.`);
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: ProcessRemoveArgs) {
    const id = args.id;
    const node = graph.getNodeById(id);
    const sources = node.sources;
    const targets = node.targets;
    const edges = [] as { id: string, source: string, target: string, [key: string]: any }[];
    const originSourceIndexMap = {};
    sources.forEach((source: string) => {
      const node = graph.getNodeById(source);
      const originIndex = node.targets.indexOf(id);
      originSourceIndexMap[source] = originIndex;
      if (node.targets.length === 1) {
        targets.forEach((target: string) => {
          edges.push({ id: uuid(10), source, target });
        });
      }
    });

    targets.forEach((target: string) => {
      const node = graph.getNodeById(target);
      if (node.sources.length === 1) {
        sources.forEach((source: string) => {
          if (graph.getNodeById(source).targets.length > 1) { // 避免重复添加
            edges.push({ id: uuid(10), source, target });
          }
        });
      }
    });

    const removedEdges = node.edges.map((edge: any) => cloneDeep(edge.configs));

    return { ...args, edges, removedEdges, nodeConfigs: node.configs, originSourceIndexMap, originTargets: targets.concat() };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const { id, edges, originSourceIndexMap } = snapshot;
    graph.remove(graph.getNodeById(id));
    // 继承连线
    const targetsMap = {};
    if (edges.length > 0) {
      edges.forEach((configs: { source: string, target: string }) => {
        graph.add('edge', configs)
        const source = configs.source;
        if (originSourceIndexMap[source] !== undefined) {
          if (targetsMap[source] !== undefined) {
            targetsMap[source].push(configs.target);
          } else {
            targetsMap[source] = [configs.target];
          }
        }
      })
      // 将后继节点插入继承原节点的位置
      for (const [key, index] of Object.entries(originSourceIndexMap)) {
        if (targetsMap[key] === undefined) {
          continue;
        }
        const node = graph.getNodeById(key);
        const replaceLen = targetsMap[key].length;
        const targets = node.targets.slice(0, -replaceLen);
        targets.splice(index as number, 0, ...targetsMap[key]);
        node.targets = targets;
      }
    }
    // 清空选区
    return ({
      node: [],
      edge: [],
      group: [],
    });
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const { id, edges, removedEdges, nodeConfigs, originSourceIndexMap, originTargets } = snapshot;
    const node = graph.add('node', nodeConfigs);
    removedEdges.forEach((configs: any) => { graph.add('edge', configs) });
    node.targets = originTargets.concat();
    // 恢复节点位置
    for (const [key, index] of Object.entries(originSourceIndexMap)) {
      const node = graph.getNodeById(key);
      const targets = node.targets.slice(0, -1);
      targets.splice(index as number, 0, id);
      node.targets = targets;
    }

    if (edges.length > 0) {
      // 去除继承的连线
      edges.forEach((configs: { id: string }) => {
        graph.remove(graph.getEdgeById(configs.id));
      })
    }
  },
});