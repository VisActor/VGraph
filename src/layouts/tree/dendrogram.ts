import { LayoutBase } from '../base';
import { TreeData } from '../../typings/data';
import { radialTree } from './utils/radial';
import { postOrder } from './utils/traverse';
import { swapSize, recoverCoord } from './utils/tree';
import { DendrogramConfigs } from '../../typings/layouts/tree';

export class Dendrogram extends LayoutBase {
  options = {
    direction: 'TB' as 'LR' | 'RL' | 'TB' | 'BT',
    nodeSep(nodeData: TreeData) {
      return 20;
    },
    rankSep(nodeData: TreeData) {
      return 20;
    },
    radial: false,
    size: () => [500, 300],
  };
  constructor(configs: DendrogramConfigs) {
    super(configs);
    this.setOptions(configs);
  }

  layout(data: TreeData) {
    let previousNode: any = null;
    let x = 0;
    // 第一次遍历，初始坐标值
    postOrder(data, (node: any) => {
      const children = node.children;
      if (children && children.length > 0 && !node.collapsed) {
        node.x = getMeanX(children);
        node.y = getMinY(children);
      } else {
        node.x = previousNode ? (x += 1) : 0;
        node.y = 0;
        previousNode = node;
      }
    });

    if (this.options.radial) {
      radialTree(data, this.options, this.options.size());
      return data;
    }
    secondWalk(data, this.options);
    return data;
  }
}

export function secondWalk(data: TreeData, layoutOptions: any) {
  const rankMap: any = {};
  postOrder(data, (node: any) => {
    const rank = rankMap[node.y];
    getNodeSize(node, layoutOptions);
    if (rank) {
      rank.push(node);
    } else {
      rankMap[node.y] = [node];
    }
  });

  swapSize(data, layoutOptions.direction);

  let rankSize = 0;
  Object.keys(rankMap)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .forEach((rank: string) => {
      let maxSep = 0;
      rankMap[rank].forEach((node: any) => {
        const { rx, ry } = getScaleRatios(node, layoutOptions);
        node.x *= rx;
        node.y = rankSize + ry;
        maxSep = Math.max(ry + node.height / 2, maxSep);
      });
      rankSize += maxSep;
    });
  recoverCoord(data, layoutOptions.direction);
}

function getNodeSize(node: TreeData, layoutOptions: any) {
  if (!isNaN(node.width!) && !isNaN(node.height!)) {
    return [node.width, node.height];
  }
  const size = layoutOptions.nodeSize(node);
  node.width = size[0];
  node.height = size[1];
  return size;
}

export function shiftTree(data: any, offsetX: number, offsetY: number) {
  postOrder(data, (node: any) => {
    node.x += offsetX;
    node.y += offsetY;
  });
}

function getScaleRatios(node: any, layoutOptions: any) {
  let rx = node.width;
  let ry = node.height;
  if (layoutOptions.nodeSep) {
    rx += layoutOptions.nodeSep!(node);
  }
  if (layoutOptions.rankSep) {
    ry = node.height / 2 + layoutOptions.rankSep(node);
  }
  return { rx, ry };
}

function getMeanX(children: any) {
  return children.reduce((x: number, child: any) => x + child.x, 0) / children.length;
}

function getMinY(children: any) {
  return children.reduce((y: number, child: any) => Math.min(y, child.y), 0) - 1;
}
