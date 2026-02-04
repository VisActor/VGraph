import { IndentedConfigs } from '../../typings/layouts/tree';
import { TreeData } from '../../typings/data';
import { LayoutBase } from '../base';
import { preOrder, postOrder } from './utils/traverse';
import { recoverCoord, swapSize } from './utils/tree';
/* 独有参数：
  indent: number;
  alignTop: boolean;
*/

export class Indented extends LayoutBase {
  rankMap: any = {};
  options = {
    direction: 'TB',
    nodeSep(nodeData: TreeData) {
      return 20;
    },
    rankSep(nodeData: TreeData) {
      return 20;
    },
    nodeSize(nodeData: TreeData) {
      return [140, 40];
    },
    indent: 20,
    alignTop: false,
  };
  constructor(configs: IndentedConfigs) {
    super(configs);
    this.setOptions(configs);
  }

  layout(data: TreeData) {
    this.rankMap = {};
    swapSize(data, this.options.direction, false);
    if (this.options.alignTop) {
      this.layoutIndentedTop(data);
    } else {
      this.layoutIndentedLR(data);
    }
    recoverCoord(data, this.options.direction, false);
    return data;
  }

  layoutIndentedLR(data: TreeData) {
    const { indent, nodeSep } = this.options;
    let y = 0;
    // 第一次遍历，初始坐标值
    preOrder(data, (node: any, rank: number) => {
      this.rankMap[rank] = this.rankMap[rank] || [];
      this.rankMap[rank].push(node);
      const [width, height] = this.getNodeSize(node);
      // 左对齐
      node.x = (indent ? indent * rank : rank) + width / 2;
      node.y = y;
      y += height + nodeSep(node);
    });
    if (!indent) {
      this.assignXs();
    }
  }

  layoutIndentedTop(data: TreeData) {
    const nodeSep = this.options.nodeSep;
    let y = 0;
    postOrder(data, (node: any, rank: number) => {
      this.rankMap[rank] = this.rankMap[rank] || [];
      this.rankMap[rank].push(node);
      const [width, height] = this.getNodeSize(node);
      const children = node.children;
      node.x = rank - width;
      if (children && children.length > 0 && !node.collapsed) {
        node.y = getMinY(children);
      } else {
        node.y = y;
        y += height + nodeSep(node);
      }
    });
    this.assignXs();
  }

  assignXs() {
    const rankMap = this.rankMap;
    const rankSep = this.options.rankSep;
    let x = 0;
    Object.keys(rankMap)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .forEach((rank: string) => {
        let maxWidth = 0;
        rankMap[rank].forEach((node: any) => {
          node.x = x + node.width / 2;
          maxWidth = Math.max(node.width + rankSep(node), maxWidth);
        });
        x += maxWidth;
      });
  }

  getNodeSize(node: TreeData) {
    if (!isNaN(node.width!) && !isNaN(node.height!)) {
      return [node.width!, node.height!];
    }
    const size = this.options.nodeSize!(node);
    node.width = size[0];
    node.height = size[1];
    return size;
  }
}

function getMinY(children: any) {
  return children.reduce((y: number, child: any) => Math.min(y, child.y), Infinity);
}
