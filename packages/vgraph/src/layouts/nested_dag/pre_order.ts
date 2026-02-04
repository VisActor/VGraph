export function initOrder(group: any) {
  // 初始化 order
  if (group.children && !group.collapsed) {
    const keys = group.rankKeys;
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      group.rankMap[keys[i]].forEach((child: any, index: number) => {
        child.order = child._order ?? index;
        child.absoluteRank =
          child.parent.absoluteRank + child.depthCoefficient * child.rank;
        initOrder(child);
      });
      group.rankMap[keys[i]].sort((a: any, b: any) => a.order - b.order);
    }
  }
}

export function assignOrder(group: any) {
  group._order = group.order;
  if (group.children) {
    group.children.forEach((child: any, index: number) => {
      assignOrder(child);
    });
  }
}

// 按从上往下给节点排绝对序
export function adjustOrder(group: any) {
  const order = group.startOrder;
  if (group.children && !group.collapsed) {
    const keys = group.rankKeys;
    let maxOrder = -Infinity;
    for (const rank of keys) {
      let startOrder = order;
      group.rankMap[rank].forEach((child: any, index: number) => {
        child.startOrder = startOrder;
        child.absoluteOrder = startOrder;
        startOrder += adjustOrder(child);
      });
      // 取最长的层级
      maxOrder = Math.max(maxOrder, startOrder);
    }
    // group 的长度取决于最长的部分
    return maxOrder - order;
  } else {
    // 叶子节点长度为1
    return 1;
  }
}

// 考虑展开收起一致性。
// 如果是通过子节点递归获得，收起后没有子节点后顺序将发生变化。
// 因此考虑改为直接通过group的所有边进行计算（内部边跳过）。
function getBaryCenter(
  group: any,
  direction: "up" | "down" = "down",
  entityMap: Record<string, any>
) {
  let length = 0;
  let sum = 0;
  for (const edge of group.entityEdges) {
    const source = edge.get?.("source") ?? edge.source;
    const target = edge.get?.("target") ?? edge.target;
    const isSourceParent = isParent(source, group, entityMap);
    const isTargetParent = isParent(target, group, entityMap);
    if (isSourceParent && isTargetParent) {
      continue;
    }
    const otherNode = isSourceParent || source === group.id ? target : source;
    const absoluteRank = entityMap[group.id].absoluteRank;
    const otherRank = entityMap[otherNode].absoluteRank;

    if (
      (direction === "up" && otherRank > absoluteRank) ||
      (direction === "down" && otherRank < absoluteRank)
    ) {
      length += 1;
      sum += entityMap[otherNode].absoluteOrder;
    }
  }
  if (length !== 0) {
    group.baryCenter = sum / length;
    return group.baryCenter;
  } else {
    group.baryCenter = undefined;
    return undefined;
  }
}
function isParent(nodeId: string, group: any, entityMap: Record<string, any>) {
  const node = entityMap[nodeId];
  let parent = node.parent;
  while (parent) {
    if (parent === group) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}
export function sortByBaryCenter(
  group: any,
  direction: "up" | "down" = "down",
  entityMap: Record<string, any>
) {
  // 按照 baryCenter 中心排序
  if (!group.children || group.collapsed) {
    return;
  }
  const keys = group.rankKeys;
  const length = keys.length;
  for (let i = 0; i < length; i++) {
    const idx = direction === "up" ? length - 1 - i : i;
    for (const entity of group.rankMap[keys[idx]]) {
      // const baryCenter = this.getChildBaryCenter(entity, direction);
      const baryCenter = getBaryCenter(entity, direction, entityMap);
      entity.baryCenter = baryCenter;
    }
    let startOrder = group.startOrder;

    const rankEntities = group.rankMap[keys[idx]];
    const nodesWithBaryCenter = rankEntities
      .filter((d: any) => d.baryCenter !== undefined)
      .sort((a: any, b: any) => {
        return a.baryCenter - b.baryCenter;
      });
    const newRank = rankEntities;
    let index = 0;
    for (let i = 0; i < newRank.length; i++) {
      if (newRank[i].baryCenter !== undefined) {
        newRank[i] = nodesWithBaryCenter[index];
        index++;
      }
      // 没 baryCenter 的占据原来的位置
    }
    group.rankMap[keys[idx]] = newRank;
    group.rankMap[keys[idx]].forEach((entity: any, index: number) => {
      entity.order = index;
      entity.startOrder = startOrder;
      entity.absoluteOrder = startOrder;
      startOrder += adjustOrder(entity);
    });
  }
  if (group.children) {
    for (const child of group.children) {
      sortByBaryCenter(child, direction, entityMap);
    }
  }
}
