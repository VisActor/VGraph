import { Graph, TreeGraph } from '../../../graph';
import { SnapshotData } from '../../../typings/stack';
import { Edge, Node, Group } from '../../../models/entities';

export function isEmptySelections(selections: { node: string[]; edge: string[]; group: string[] }) {
  if (selections.node.length === 0 && selections.edge.length === 0 && selections.group.length === 0) {
    return true;
  }
  return false;
}

// 与删除相关的快照方法，例如删除节点时会删除相关连线则也需要保存快照
export function getSelectionsSnapshot(
  graph: Graph,
  selections: {
    node: string[];
    edge: string[];
    group: string[];
  },
  ungroup = false
) {
  const configs: any = {
    node: [],
    edge: [],
    group: [],
  };
  const maps: any = {
    node: {},
    edge: {},
    group: {},
  };

  function getGroupSnapshot(group: Group) {
    const groupId = group.get('id');
    if (maps.group[groupId]) {
      return;
    }
    maps.group[groupId] = true;
    if (!ungroup) {
      group.children.forEach((node: Node | Group) => {
        if (node.type === 'group') {
          getGroupSnapshot(node as Group);
          return;
        }
        const id = node.get('id');
        node.edges.forEach((edge: Edge) => {
          const id = edge.get('id');
          if (!maps.edge[id]) {
            configs.edge.push(getEdgeConfigs(edge));
            maps.edge[id] = true;
          }
        });
        if (!maps.node[id]) {
          configs.node.push(node.configs);
          maps.node[id] = true;
        }
      });
    }
    group.edges.forEach((edge: Edge) => {
      const id = edge.get('id');
      if (!maps.edge[id]) {
        configs.edge.push(getEdgeConfigs(edge));
        maps.edge[id] = true;
      }
    });
    // Group Children 应拷贝一份，避免 removeChild 和 addChild 时由于值传递导致 undo redo 不正确。
    configs.group.push({ ...group.configs, children: group.children.map((node: Node | Group) => node.get('id')) });
  }

  selections.group.forEach((id: string) => {
    const group = graph.getGroupById(id);
    if (!group) {
      return;
    }
    getGroupSnapshot(group);
  });

  selections.node.forEach((id: string) => {
    const node = graph.getNodeById(id);
    node.edges.forEach((edge: Edge) => {
      const id = edge.get('id');
      if (!maps.edge[id]) {
        configs.edge.push(getEdgeConfigs(edge));
        maps.edge[id] = true;
      }
    });
    if (!maps.node[id]) {
      configs.node.push(node.configs);
      maps.node[id] = true;
    }
  });

  selections.edge.forEach((id: string) => {
    const edge = graph.getEdgeById(id);
    if (!maps.edge[id]) {
      configs.edge.push(getEdgeConfigs(edge));
      maps.edge[id] = true;
    }
  });
  return configs;
}

// 与复制相关的快照方法，复制的是什么对象就是什么快照
export function getCleanSnapshot(
  graph: Graph,
  selections?: {
    node: string[];
    edge: string[];
    group: string[];
  }
) {
  if (!selections) {
    selections = graph.get('_selections');
  }
  const maps: any = {
    node: {},
    edge: {},
    group: {},
  };
  const configs: any = {
    node: [],
    edge: [],
    group: [],
  };

  let groupEdges: Edge[] = [];

  function getCleanGroupSnapshot(group: Group) {
    const groupId = group.get('id');
    if (maps.group[groupId]) {
      return;
    }
    maps.group[groupId] = true;
    const bbox = group.getBBox();
    group.configs.x = bbox.left + bbox.width / 2;
    group.configs.y = bbox.top + bbox.height / 2;
    group.configs.width = bbox.width;
    group.configs.height = bbox.height;
    group.children.forEach((node: Node | Group) => {
      if (node.type === 'group') {
        getCleanGroupSnapshot(node as Group);
        return;
      }
      const id = node.get('id');
      if (!maps.node[id]) {
        configs.node.push(node.configs);
        maps.node[id] = true;
      }
      groupEdges = groupEdges.concat(node.edges);
    });
    // 避免跨子分组的连线被忽略
    groupEdges.forEach((edge: Edge) => {
      const { source, target, id } = edge.configs;
      if ((maps.node[source] || maps.group[source]) && (maps.node[target] || maps.group[target]) && !maps.edge[id]) {
        configs.edge.push(getEdgeConfigs(edge));
        maps.edge[id] = true;
      }
    });
    configs.group.push(group.configs);
  }

  selections?.group.forEach((id: string) => {
    const group = graph.getGroupById(id);
    if (!group) {
      return;
    }
    getCleanGroupSnapshot(group);
  });

  // 避免复制的是子分组，粘贴的时候找不到
  configs.group.forEach((groupData: any) => {
    if (groupData.groupId && !maps.group[groupData.groupId]) {
      groupData.groupId = undefined;
    }
  });

  selections?.node.forEach((id: string) => {
    const node = graph.getNodeById(id);
    if (!maps.node[id]) {
      configs.node.push(node.configs);
      maps.node[id] = true;
    }
  });

  selections?.edge.forEach((id: string) => {
    const edge = graph.getEdgeById(id);
    if (!maps.edge[id]) {
      configs.edge.push(getEdgeConfigs(edge));
      maps.edge[id] = true;
    }
  });
  return configs;
}

function getEdgeConfigs(edge: Edge) {
  const { startPoint, endPoint } = edge.getTerminal();
  return {
    ...edge.configs,
    startPoint,
    endPoint,
  };
}

export function batchAdd(graph: Graph, addConfigs: { node: any[]; edge: any[]; group: any[] }) {
  ['node', 'group'].forEach((type: string) => {
    addConfigs[type]?.forEach((configs: any) => {
      //  应拷贝一份，避免 removeChild 和 addChild 时由于值传递导致 undo redo 不正确。
      graph.add(type as 'node' | 'edge' | 'group', { ...configs, children: configs.children?.concat() });
    });
  });
  addConfigs.edge?.forEach((configs: any) => {
    const { source, target } = configs;
    if (graph.getNodeById(source) || graph.getGroupById(source)) {
      delete configs.startPoint;
    } else {
      delete configs.source;
    }
    if (graph.getNodeById(target) || graph.getGroupById(target)) {
      delete configs.endPoint;
    } else {
      delete configs.target;
    }
    graph.add('edge', configs);
  });
}

export function batchAddRemote(graph: Graph, addConfigs: { node: any[]; edge: any[]; group: any[] }, treeLike = false) {
  ['node', 'group'].forEach((type: string) => {
    addConfigs[type]?.forEach((configs: any) => {
      graph.add(type as 'node' | 'edge' | 'group', { ...configs, children: configs.children?.concat() });
    });
  });
  const addedEdges = [] as Edge[];
  addConfigs.edge?.forEach((configs: any) => {
    const { source, target } = configs;
    if (graph.getNodeById(source) || graph.getGroupById(source)) {
      delete configs.startPoint;
    } else {
      delete configs.source;
    }
    if (graph.getNodeById(target) || graph.getGroupById(target)) {
      delete configs.endPoint;
    } else {
      delete configs.target;
    }
    const edge = graph.add('edge', configs);
    addedEdges.push(edge);
  });

  function hideDownStreamNodes(nodeId: string, addNodeMap: any, visitedMap: any) {
    const node = graph.getNodeById(nodeId);
    node.hide();
    visitedMap[nodeId] = true;
    for (const target of node.targets) {
      if (addNodeMap[target] && !visitedMap[target]) {
        hideDownStreamNodes(target, addNodeMap, visitedMap);
      }
    }
  }

  if (treeLike) {
    const addNodeMap = {};
    addConfigs.node.forEach(({ id: nodeId }: { id: string }) => {
      addNodeMap[nodeId] = true;
    });
    const rootNodes = addConfigs.node.filter(({ id: nodeId }: { id: string }) => {
      // 首先找到添加的节点中的根节点
      const node = graph.getNodeById(nodeId);
      for (const source of node.sources) {
        if (addNodeMap[source]) {
          return false;
        }
      }
      return true;
    }); // 通过 rootNodes 向下游节点依次操作。
    const visitedMap = {}; // 避免重复操作
    rootNodes.forEach(({ id: nodeId }: { id: string }) => {
      // 隐藏符合条件的根节点及其下游节点。
      const node = graph.getNodeById(nodeId);
      for (const source of node.sources) {
        const sourceNode = graph.getNodeById(source);
        if (!sourceNode?.isVisible() || sourceNode?.get('collapsed')) {
          hideDownStreamNodes(nodeId, addNodeMap, visitedMap);
          break;
        }
      }
    });
  }
  for (const edge of addedEdges) {
    const source = edge.get('source');
    const target = edge.get('target');
    const sourceNode = graph.getNodeById(source);
    const targetNode = graph.getNodeById(target);
    if (!sourceNode?.isVisible() || !targetNode?.isVisible()) {
      edge.hide();
    }
  }
}

export function batchRemove(graph: Graph, removeConfigs: { node: any[]; edge: any[]; group: any[] }) {
  const entityMap = graph.entityMap;
  ['edge', 'group', 'node'].forEach((type: string) => {
    removeConfigs[type]?.forEach((configs: any) => {
      const entity = entityMap[type][configs.id];
      entity && graph.remove(entity);
    });
  });
}

export function getStackSelections(graph: Graph | TreeGraph) {
  const currentSelections = graph.get('_selections');
  return {
    node: currentSelections.node.concat([]),
    edge: currentSelections.edge.concat([]),
    group: currentSelections.group.concat([]),
  };
}

export function generateSnapshot(graph: Graph | TreeGraph) {
  let snapshotData: SnapshotData = {};
  if (graph instanceof Graph) {
    snapshotData = graph.getData((entity: any) => {
      return { ...entity.configs };
    });
  } else {
    snapshotData = graph.getTreeData((entity: any) => {
      return { ...entity.configs };
    });
  }
  snapshotData.matrix = graph.getMatrix().concat();
  snapshotData.selections = getStackSelections(graph);
  return snapshotData;
}
