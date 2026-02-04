import { EdgeStructure } from "./edge_structure";
import { NodeStructure } from "./node_structure";

import {
  EdgeData,
  GroupData,
  NodeData,
  GraphStructureData,
} from "../typings/data";
import { getNonRepetitiveId, isRepeatedId } from "../utils/graph/entity_id";

export { NodeStructure, EdgeStructure };

export class GraphStructure {
  directed?: boolean;
  entityMap: {
    node: { [x: string]: NodeStructure };
    edge: { [x: string]: EdgeStructure };
    group: { [x: string]: GroupData };
  } = {} as any;
  getNodeId?: (node: Partial<NodeData>) => string;
  getEdgeId?: (edge: Partial<EdgeData>) => string;
  getEdgeSource?: (edge: Partial<EdgeData>) => string;
  getEdgeTarget?: (edge: Partial<EdgeData>) => string;

  constructor(data: GraphStructureData) {
    this.directed = data.directed === undefined ? true : data.directed;
    this.getNodeId = data.getNodeId;
    this.getEdgeId = data.getEdgeId;
    this.getEdgeSource = data.getEdgeSource;
    this.getEdgeTarget = data.getEdgeTarget;
    this.normalizeData(data);
  }

  normalizeData(data: GraphStructureData) {
    this.entityMap = {
      node: {},
      edge: {},
      group: {},
    };
    data.nodes.forEach((node: Partial<NodeData>) => {
      return this.initNode(node);
    });
    data.edges.forEach((edge: Partial<EdgeData>) => {
      this.initEdge(edge);
    });
    if (data.groups) {
      data.groups.forEach((group: Partial<GroupData>) => {
        const groupData = data.getGroupData ? data.getGroupData(group) : group;
        let id = groupData.id;
        if (!id) {
          id = this.getEntityId(id, "group");
          groupData.id = id;
        }
        this.entityMap.group[groupData.id!] = groupData as GroupData;
        groupData.children?.forEach((childId: string) => {
          this.entityMap.node[childId].configs.groupId = group.id;
        });
      });
    }
  }

  getEntityId(configsId: string | undefined, type: string) {
    let id = configsId;
    if (typeof id === "string" || typeof id === "number") {
      if (isRepeatedId(id as string, type, this.entityMap)) {
        console.error(`${type} id ${id} is already exist`);
      }
    } else {
      id = getNonRepetitiveId(type, this.entityMap);
    }
    return id;
  }

  initNode(node: Partial<NodeData>, temp = false) {
    let id = node.id;
    if (!temp && this.getNodeId) {
      id = this.getNodeId(node);
    }
    id = this.getEntityId(id!, "node");
    node.id = id;
    const nodeInst = new NodeStructure(node as NodeData);
    this.entityMap.node[id!] = nodeInst;
    return nodeInst;
  }

  initEdge(edgeData: Partial<EdgeData>, temp = false) {
    const nodeMap = this.entityMap.node;
    let source = edgeData.source as string;
    let target = edgeData.target as string;
    let id = edgeData.id;
    if (!temp && !id && this.getEdgeId) {
      id = this.getEdgeId(edgeData);
    }
    id = this.getEntityId(id, "edge");
    if (!temp && !source && this.getEdgeSource) {
      source = this.getEdgeSource(edgeData);
    }
    if (!temp && !target && this.getEdgeTarget) {
      target = this.getEdgeTarget(edgeData);
    }
    // eslint-disable-next-line eqeqeq
    const sourceNode = source == null ? null : nodeMap[source];
    // eslint-disable-next-line eqeqeq
    const targetNode = target == null ? null : nodeMap[target];
    if (sourceNode && targetNode) {
      const edge = new EdgeStructure(
        Object.assign(edgeData, {
          id,
          source,
          target,
        })
      );
      edge.source = sourceNode;
      edge.target = targetNode;
      sourceNode.edges.push(edge);
      targetNode.edges.push(edge);
      if (!sourceNode.targets.includes(target)) {
        sourceNode.targets.push(target);
      }
      if (!targetNode.sources.includes(source)) {
        targetNode.sources.push(source);
      }
      this.entityMap.edge[id!] = edge;
      return edge;
    } else {
      throw new Error(
        `Cannot create edge which source is ${source} and target is ${target} `
      );
    }
  }

  add(type: "node" | "edge", configs: any, temp = false) {
    let entity;
    if (type === "node") {
      entity = this.initNode(configs, temp);
    } else {
      entity = this.initEdge(configs, temp);
    }
    return entity;
  }

  clone(type: "node" | "edge", entity: any) {
    if (type === "node") {
      const node = this.initNode(entity.configs);
      return node;
    } else {
      const edge = this.initEdge(entity.configs);
      return edge;
    }
  }

  remove(entity: NodeStructure | EdgeStructure) {
    const nodeMap = this.entityMap.node;
    // remove node
    if (entity instanceof NodeStructure) {
      const id = entity.get("id");
      while (entity.edges.length) {
        this.removeEdge(entity.edges.pop()!);
      }
      delete nodeMap[id];
    } else {
      // remove edge
      this.removeEdge(entity);
    }
  }

  removeEdge(edge: EdgeStructure) {
    const { source, target } = edge.configs;
    const sourceNode = edge.source!;
    const targetNode = edge.target!;
    let index = sourceNode.targets.indexOf(target);
    // source 关系
    if (index >= 0) {
      sourceNode.targets.splice(index, 1);
    }
    index = sourceNode.edges.indexOf(edge);
    if (index >= 0) {
      sourceNode.edges.splice(index, 1);
    }

    // target 关系
    index = targetNode.sources.indexOf(source);
    if (index >= 0) {
      targetNode.sources.splice(index, 1);
    }
    index = targetNode.edges.indexOf(edge);
    if (index >= 0) {
      targetNode.edges.splice(index, 1);
    }
    delete this.entityMap.edge[edge.get("id")];
  }

  removeDuplicateEdge(edge: any) {
    const sourceNode = edge.source!;
    const targetNode = edge.target!;
    let index = sourceNode.edges.indexOf(edge);
    if (index >= 0) {
      sourceNode.edges.splice(index, 1);
    }
    index = targetNode.edges.indexOf(edge);
    if (index >= 0) {
      targetNode.edges.splice(index, 1);
    }
    delete this.entityMap.edge[edge.get("id")];
    edge = null;
  }

  getNodeById(id: string) {
    return this.entityMap.node[id];
  }

  getNodeMap() {
    return this.entityMap.node;
  }

  getNodes(): NodeStructure[] {
    return Object.values(this.entityMap.node);
  }

  getEdgeMap() {
    return this.entityMap.edge;
  }

  getEdgeById(id: string) {
    return this.entityMap.edge[id];
  }

  // 这里虽然声明的是 EdgeStructure, 实际上是满足 EdgeStructure 需求的 EdgeData
  getEdges(): EdgeStructure[] {
    return Object.values(this.entityMap.edge);
  }

  getGroups() {
    return Object.values(this.entityMap.group);
  }

  getGroupById(id: string) {
    return this.entityMap.group[id];
  }

  set(k: string, v: any) {
    this[k] = v;
  }

  get(k: string) {
    return this[k];
  }

  getData() {
    return {
      nodes: this.getNodes().map((node: NodeStructure) => node.configs),
      edges: this.getEdges().map((edge: EdgeStructure) => edge.configs),
      groups: this.getGroups(),
    };
  }
}
