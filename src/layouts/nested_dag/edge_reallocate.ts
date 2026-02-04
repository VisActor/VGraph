function LCA(sourceNode: any, targetNode: any) {
  let lcaSourceChild = sourceNode;
  let lcaTargetChild = targetNode;
  while (lcaSourceChild.parent !== lcaTargetChild.parent) {
    if (lcaSourceChild.depth < lcaTargetChild.depth) {
      lcaTargetChild = lcaTargetChild.parent; // target 在更下层, target 节点往上找
    } else if (lcaSourceChild.depth > lcaTargetChild.depth) {
      lcaSourceChild = lcaSourceChild.parent; // source 在更下层, source 节点往上找
    } else if (lcaSourceChild.depth === lcaTargetChild.depth) {
      // 同一深度, 一起往上
      lcaSourceChild = lcaSourceChild.parent;
      lcaTargetChild = lcaTargetChild.parent;
    } else {
      console.error('Error: Depth mismatch');
    }
  }
  return {
    lca: lcaSourceChild.parent,
    lcaSourceChild,
    lcaTargetChild,
  };
}

function dfsDepth(group: any, parent: any) {
  group.depth = parent.depth + 1;
  group.depthCoefficient = 0.01 ** group.depth;
  group.entityEdges = [];
  if (!group.children) {
    return;
  }
  for (const child of group.children) {
    dfsDepth(child, group);
  }
}

// 遍历所有边， 通过LCA算法找公共祖先，将节点的连线转换到具有相同父节点的同层节点上
export function edgeReallocate(edges: any[], rootGroup: any, entityMap: any) {
  for (const child of rootGroup.children) {
    dfsDepth(child, rootGroup);
  }
  for (const edge of edges) {
    const source = edge.get('source');
    const target = edge.get('target');
    const { lca, lcaSourceChild, lcaTargetChild } = LCA(entityMap[source], entityMap[target]);
    lca.edges.push({
      id: edge.get('id'),
      source: lcaSourceChild.id,
      originSource: source,
      target: lcaTargetChild.id,
      originTarget: target,
    });
  }
}
