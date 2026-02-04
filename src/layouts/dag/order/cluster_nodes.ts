import { Node } from '../../../models/entities';
import { NodeStructure } from '../../../graph_structure';
export function clusterNodes(nodes: Node[] | NodeStructure[]) {
  const clusters: any[] = [];
  const nodeMap: Record<string, Node | NodeStructure> = {};
  const visited: string[] = [];
  nodes.forEach((node: Node | NodeStructure) => {
    nodeMap[node.get('id')] = node;
    node.sourceCount = 0;
    node.targetCount = 0;
  });
  function dfsCluster(node: Node | NodeStructure, path: string[]) {
    const id = node.get('id');
    path.push(node.get('id'));
    visited.push(id);
    node.sources.forEach((nodeId: string) => {
      const parent = nodeMap[nodeId];
      if (parent && !visited.includes(nodeId)) {
        visited.push(nodeId);
        node.sourceCount++;
        parent.targetCount++;
        dfsCluster(parent, path);
      }
    });
    node.targets.forEach((nodeId: string) => {
      const child = nodeMap[nodeId];
      if (child && !visited.includes(nodeId)) {
        visited.push(nodeId);
        node.targetCount++;
        child.sourceCount++;
        dfsCluster(child, path);
      }
    });
  }
  nodes.forEach((node: Node | NodeStructure) => {
    const path: string[] = [];
    if (!visited.includes(node.get('id'))) {
      dfsCluster(node, path);
      if (path.length > 1) {
        clusters.push(
          path
            .map((nodeId: string) => nodeMap[nodeId])
            .sort((a: Node | NodeStructure, b: Node | NodeStructure) => (a.sourceCount - a.targetCount) - (b.sourceCount - b.targetCount)),
        );
      } else {
        clusters.push([node]);
      }
    }
  });
  return clusters;
}
