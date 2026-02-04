import { Node } from '../..//models/entities';
import { normalizePadding } from '../../utils/graph';

import { GraphStructure } from '../../graph_structure';

export function normalizePosition(group: any) {
  if (group.children) {
    const { x, y, width, height, padding, titleHeight } = group;
    if (!group.collapsed) {
      const offsetX = x - width / 2 + padding[3];
      const offsetY = y - height / 2 + padding[0] + (titleHeight ?? 0);
      let left = Infinity,
        top = Infinity;
      for (const child of group.children) {
        const { x, y, width, height } = child;
        left = Math.min(left, x - width / 2);
        top = Math.min(top, y - height / 2);
      }
      for (const child of group.children) {
        child.x += offsetX - left;
        child.y += offsetY - top;
        normalizePosition(child);
      }
      for (const edge of group.uniqueEdges) {
        if (edge.controlPoints) {
          edge.controlPoints = moveControlPoints(edge.controlPoints, offsetX - left, offsetY - top);
        }
      }
    }
  }
}

export function getBBoxForParent(subGraph: GraphStructure, parent: Node, padding?: number | number[]) {
  const nodes = subGraph.getNodes();
  if (!nodes.length) {
    return;
  }
  // const node = parent;
  padding = normalizePadding((parent.padding as number) ?? padding ?? 20) as number | number[];
  parent.padding = padding;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((node: any) => {
    const { x, y, width, height } = node.configs;
    minX = Math.min(x - width / 2, minX);
    maxX = Math.max(x + width / 2, maxX);
    minY = Math.min(y - height / 2, minY);
    maxY = Math.max(y + height / 2, maxY);
  });
  parent.width = maxX - minX + padding[1] + padding[3];
  parent.height = maxY - minY + padding[0] + padding[2] + (parent.titleHeight || 0);
}

function moveControlPoints(cp: any, offsetX: number, offsetY: number) {
  return cp.map((coord: any) => [coord[0] + offsetX, coord[1] + offsetY]);
} // 没有测试过
