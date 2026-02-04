import { EdgeStructure, NodeStructure } from "../../graph_structure";
import { Graph } from "../../graph";
import { cloneDeep, getDefaultBizData } from "../../utils";
import { Node, Group, Edge } from "../../models/entities";

type INodeData = NodeStructure["configs"];

type TNode = INodeData | { (id: string): any; [key: string]: any };
type TEdge = EdgeStructure | { source: any; target: any; [key: string]: any };

export function getCollapsableData(data: {
  nodes: TNode[];
  edges: TEdge[];
  groups: { children: string[]; [k: string]: any }[];
}) {
  const nodeMap = {};
  const groupMap = {};
  const edges: any = [];
  const nodes = data.nodes.concat();
  const visited = {};
  nodes.forEach((nodeData: any) => {
    nodeMap[nodeData.id] = nodeData;
  });

  data.groups.forEach((groupData: any) => {
    groupMap[groupData.id] = groupData;
  });

  function getGroupData(groupData: any, id: string) {
    const children = groupData.children;
    const childNodes: any = [];
    visited[id] = true;
    // 给分组中节点打标，后面删除这些节点
    children.forEach((childId: string) => {
      let nodeData = nodeMap[childId];
      // 如果是子分组，转为节点数据
      if (!nodeData) {
        nodeData = getGroupData(groupMap[childId], childId);
        groupMap[id] = nodeData;
      }
      nodeData.group = id;
      childNodes.push(nodeData);
    });
    // 分组处理成一个节点
    const groupConfigs = {
      ...groupData,
      id,
      childNodes,
      childEdges: [],
      // 避免 setDefaultNode & setDefaultGroup 互相影响
      __data: cloneDeep(groupData),
    };
    groupMap[id] = groupConfigs;
    nodeMap[id] = groupConfigs;
    nodes.push(groupConfigs);
    return groupConfigs;
  }

  data.groups.forEach((groupData: any, i: number) => {
    const id = groupData.id ?? `group_${i}`;
    if (visited[id]) {
      return;
    }
    getGroupData(groupData, id);
  });

  function getRootGroup(groupId: string) {
    let group = nodeMap[groupId];
    const route = [];
    while (group.group) {
      route.push(group.id);
      group = nodeMap[group.group];
    }
    route.push(group.id);
    return { group, route: route.length === 1 ? [] : route };
  }

  data.edges.forEach((edgeData: any) => {
    const { source, target } = edgeData;
    // 同分组内节点单独处理
    const directSourceGroup = nodeMap[source].group;
    const directTargetGroup = nodeMap[target].group;
    if (
      directSourceGroup !== undefined &&
      directSourceGroup === directTargetGroup
    ) {
      nodeMap[directSourceGroup].childEdges.push(edgeData);
      return;
    }
    // 处理一下单节点的自环
    if (source === target && nodeMap[source]) {
      edges.push(edgeData);
      return;
    }
    const { group: sourceGroup, route: sourceRoute } = getRootGroup(source);
    const { group: targetGroup, route: targetRoute } = getRootGroup(target);
    if (sourceRoute.length) {
      edgeData.sourceRoute = sourceRoute;
      edgeData.sourceIndex = sourceRoute.length - 2;
    }
    if (targetRoute.length) {
      edgeData.targetRoute = targetRoute;
      edgeData.targetIndex = targetRoute.length - 2;
    }
    // 分组内连线，直接收到分组节点上
    if (sourceGroup !== undefined && sourceGroup === targetGroup) {
      sourceGroup.childEdges.push(edgeData);
      return;
    }
    if (sourceGroup !== undefined) {
      edgeData.source = sourceGroup.id;
    }
    if (targetGroup !== undefined) {
      edgeData.target = targetGroup.id;
    }
    // 有分组的连线处理到分组上
    edges.push(edgeData);
  });
  return {
    nodes: nodes.filter((nodeData: any) => nodeData.group === undefined),
    edges,
  };
}

export function expandGroupNode(
  graph: Graph,
  node: Node,
  data?: {
    nodes: TNode[];
    edges: TEdge[];
  }
) {
  if (data) {
    node.set("__data", {
      ...getDefaultBizData(node),
      children: data.nodes.map((nodeData: any) => nodeData.id),
    });
    node.set("childNodes", data.nodes);
    node.set("childEdges", data.edges);
  }
  const { childNodes, childEdges } = node.configs;
  if (!childNodes || childNodes.length === 0) {
    return;
  }
  const autoDraw = graph.disableAutoDraw();
  const autoLayout = graph.disableAutoLayout();
  const outerEdges: any = [];
  // 添加分组内节点
  childNodes.forEach((nodeData: any) => {
    graph.add("node", nodeData);
  });
  // 添加分组内连线
  childEdges.forEach((edgeData: any) => {
    swapSource(edgeData);
    swapTarget(edgeData);
    const edge = graph.add("edge", edgeData);
    if (edgeData.source === edgeData.target) {
      edge.hide();
    }
  });
  node.edges.forEach((edge: any) => {
    outerEdges.push(edge.configs);
  });
  const groupId = node.belong ? node.belong.get("id") : "";
  graph.remove(node);
  const group = graph.add("group", {
    ...cloneDeep(node.configs.__data),
    __data: node.configs.__data,
    childNodes: node.configs.childNodes,
    childEdges: node.configs.childEdges,
    id: node.configs.id,
  });
  // group 并不会自动添加到父分组下，有分组时手动添加
  if (groupId) {
    graph.getGroupById(groupId).addChild(group);
  }
  const id = node.configs.id;
  // 添加组内到组外连线
  outerEdges.forEach((configs: any) => {
    configs.source === id && swapSource(configs);
    configs.target === id && swapTarget(configs);
    const edge = graph.add("edge", configs);
    if (configs.source === configs.target) {
      edge.hide();
    }
  });
  graph.enableAutoLayout(autoLayout);
  graph.enableAutoDraw(autoDraw);
  return group;
}

export function collapseGroup(graph: Graph, group: Group) {
  const configs = group.configs;
  const rawData = cloneDeep(configs.__data);
  const { childEdges, childNodes } = configs;
  if (!childNodes || childNodes.length === 0) {
    return;
  }
  const id = configs.id;
  const autoLayout = graph.disableAutoLayout();
  const autoDraw = graph.disableAutoDraw();
  const currentEdges = group.edges.map((edge) => edge.configs);
  const groupId = group.belong ? group.belong.get("id") : null;
  graph.remove(group);
  // 删除分组内连线
  childEdges.forEach((edgeData: any) => {
    const edge = graph.getEdgeById(edgeData.id);
    recoverEdge(edge, id);
    graph.remove(edge);
  });
  const groupNode = graph.add("node", {
    ...configs.__data,
    groupId,
    childNodes: configs.childNodes,
    childEdges: configs.childEdges,
    __data: rawData,
    id: configs.id,
  });
  // 原本连接到分组的连线连接到新节点上
  currentEdges.forEach((edgeData) => {
    graph.add("edge", edgeData);
  });
  // 代理所有相关连线到节点上
  graph.getEdges().forEach((edge: Edge) => {
    const { source, target } = recoverEdge(edge, id);
    if (source !== edge.get("source") || target !== edge.get("target")) {
      edge.updateSourceTarget(source, target);
      if (source === target) {
        edge.hide();
      } else {
        edge.show();
      }
    }
  });
  for (const childNode of childNodes) {
    const node = graph.getNodeById(childNode.id);
    if (node) {
      // 删除子节点
      graph.remove(graph.getNodeById(childNode.id));
    } else {
      // 删除子分组
      removeGroup(graph, graph.getGroupById(childNode.id));
    }
  }
  graph.enableAutoLayout(autoLayout);
  graph.enableAutoDraw(autoDraw);
  return groupNode;
}

function removeGroup(graph: Graph, group: Group) {
  const children = group.children;
  while (children.length) {
    const child = children[0];
    if (child.type === "group") {
      removeGroup(graph, child as Group);
    } else {
      child.destroy();
    }
  }
  group.destroy();
}

function recoverEdge(edge: Edge, id: string) {
  const { sourceRoute, targetRoute } = edge.configs;
  let { source, target } = edge.configs;
  const sourceIndex = sourceRoute ? sourceRoute.indexOf(id) : -1;
  const targetIndex = targetRoute ? targetRoute.indexOf(id) : -1;
  if (sourceIndex >= 0) {
    source = id;
    edge.configs.sourceIndex = sourceIndex - 1;
  }
  if (targetIndex >= 0) {
    target = id;
    edge.configs.targetIndex = targetIndex - 1;
  }
  return { source, target };
}

function swapSource(edgeConfigs: any) {
  if (edgeConfigs.sourceRoute && edgeConfigs.sourceIndex >= 0) {
    edgeConfigs.source = edgeConfigs.sourceRoute[edgeConfigs.sourceIndex];
    edgeConfigs.sourceIndex -= 1;
  }
}

function swapTarget(edgeConfigs: any) {
  if (edgeConfigs.targetRoute && edgeConfigs.targetIndex >= 0) {
    edgeConfigs.target = edgeConfigs.targetRoute[edgeConfigs.targetIndex];
    edgeConfigs.targetIndex -= 1;
  }
}
