import { MindMapConfigs } from "../../typings/layouts/tree";
import { TreeData } from "../../typings/data";
import { CompactBox } from "./flex_compact_box";
import { LayoutBase } from "../base";
import { postOrder, preOrder } from "./utils/traverse";
import { recoverCoord, swapSize } from "./utils/tree";

export class MindMap extends LayoutBase {
  options = {
    direction: "TB" as "LR" | "RL" | "TB" | "BT",
    nodeSep(nodeData: TreeData) {
      return 20;
    },
    rankSep(nodeData: TreeData) {
      return 20;
    },
  };
  constructor(configs: MindMapConfigs) {
    super(configs);
    this.setOptions(configs);
  }
  layout(data: TreeData) {
    if (!data.children) {
      return data;
    }
    const options = this.options as MindMapConfigs & {
      tab?: number;
      compact?: boolean;
      setTreePosition?: (nodeData: TreeData) => {
        leftTree: TreeData;
        rightTree: TreeData;
      };
    };
    const treeSize = data.children.length;

    options.direction = options.direction ?? "LR";
    const direction = options.direction;
    preOrder(data, (node) => {
      getNodeSize(node, options);
    });
    if (options.compact) {
      swapSize(data, options.direction); // CompactBox 内部也有 swapSize 逻辑，由于 CompactBox 默认是按 TB 走的。 为避免 CompactBox 再走 swapSize 逻辑，这里统一在外部 swap。
    }
    let leftTree: TreeData = {
      id: data.id,
      width: data.width,
      height: data.height,
      children: [],
    };
    let rightTree: TreeData = {
      id: data.id,
      width: data.width,
      height: data.height,
      children: [],
    };
    if (options.setTreePosition) {
      const result = options.setTreePosition(data);
      leftTree = result.leftTree;
      rightTree = result.rightTree;
    } else {
      const rightTreeSize = Math.round(treeSize / 2);
      for (let i = 0; i < treeSize; i++) {
        const child = data.children[i];
        if (i >= rightTreeSize) {
          leftTree.children!.push(child);
        } else {
          rightTree.children!.push(child);
        }
      }
    }

    if (options.compact) {
      options.direction = direction;
      options.direction = "TB"; // 并让 CompactBox 内总是按 TB 布局，swapSize 相关逻辑由外部统一处理。
      const flex_compact_box = new CompactBox(options);
      leftTree = flex_compact_box.layout(leftTree)!;
      rightTree = flex_compact_box.layout(rightTree)!;
      const offsetX = rightTree.x! - leftTree.x!;
      data.x = rightTree.x;
      data.y = rightTree.y;
      postOrder(leftTree, (data) => {
        data.x += offsetX;
        data.y *= -1;
        data.position = "left";
      });
      postOrder(rightTree, (data) => {
        data.position = "right";
      });
      options.direction = direction;
      recoverCoord(data, options.direction);
      return;
    }

    swapSize(data, options.direction, false);
    layoutY(leftTree, options);
    layoutY(rightTree, options);
    leftTree._offsetY +=
      rightTree.posY + rightTree._offsetY - leftTree.posY - leftTree._offsetY;
    // 平移左子树，令根节点在左右子树计算得到的y坐标一致
    applyY(leftTree, 0);
    applyY(rightTree, 0);

    leftTree.x = 0;
    rightTree.x = 0;
    layoutX(leftTree, options, -1, -1, options.tab);
    layoutX(rightTree, options, 1, 1, options.tab);
    data.x = rightTree.x;
    data.y = rightTree.y;
    recoverCoord(data, options.direction, false);
    setCollapsedCoord(data);
    data.position = "root";
    return data;
  }
}

function applyY(tree: TreeData, accumulatedOffset: number) {
  accumulatedOffset += tree._offsetY;
  tree.y = tree.posY + accumulatedOffset || 0;
  if (tree.children) {
    for (const child of tree.children) {
      applyY(child, accumulatedOffset);
    }
  }
}

function layoutY(tree: TreeData, layoutOptions: any) {
  const children = tree.children;
  if (children && children.length > 0 && !tree.collapsed) {
    for (const child of children) {
      layoutY(child, layoutOptions);
    }
  }
  mergeChildren(tree, layoutOptions);
}

function mergeChildren(tree: TreeData, layoutOptions: any) {
  let offsetY = 0;
  let lastNodeSep = 0;
  let posY = 0;
  const children = tree.children;
  if (children && children.length > 0 && !tree.collapsed) {
    for (const child of children) {
      child._offsetY += offsetY;
      posY += child.posY + child._offsetY;
      offsetY += child.treeHeight;
      if (layoutOptions.nodeSep) {
        const nodeSep = layoutOptions.nodeSep!(child);
        lastNodeSep = nodeSep;
        offsetY += nodeSep;
      }
    }
  }
  const cnt = tree.children?.length || 1;
  offsetY -= lastNodeSep;
  tree.posY = posY / cnt;

  const size = getNodeSize(tree, layoutOptions);
  const treeTop = Math.min(0, tree.posY - size[1] / 2); // 子树构成的Box的上界限定义为0
  const treeBottom = Math.max(offsetY, tree.posY + size[1] / 2); // 子树构成的Box的下界限为offsetY

  tree.treeHeight = treeBottom - treeTop;
  tree._offsetY = -treeTop;
}

function layoutX(
  tree: TreeData,
  layoutOptions: any,
  step: -1 | 1,
  align: -1 | 0 | 1,
  tab?: number
) {
  const children = tree.children;
  const size = getNodeSize(tree, layoutOptions);
  const rankSep = layoutOptions.rankSep!(tree);
  const border = alignTab(tree.x! + (size[0] / 2 + rankSep) * step, step, tab);
  // alignTab 在宽度相差不大的情况下，可以将不同树的子节点也对齐
  // 如果没传入 tab, 则默认不对齐
  if (step > 0) {
    tree.position = "right";
  } else {
    tree.position = "left";
  }
  if (children && children.length > 0 && !tree.collapsed) {
    if (step * align > 0) {
      // 对齐方式和树的方向一致
      for (const child of children) {
        const childSize = getNodeSize(child, layoutOptions);
        child.x = border + (1 * (step * childSize[0])) / 2;
      }
      for (const child of children) {
        layoutX(child, layoutOptions, step, align, tab);
      }
    }
    // TODO: 对齐方式为居中或相反 （应该几乎没有场景，所以暂不实现）
  }
}

function getNodeSize(node: any, layoutOptions: any) {
  if (!isNaN(node.width) && !isNaN(node.height)) {
    return [node.width, node.height];
  }
  const size = layoutOptions.nodeSize(node);
  node.width = size[0];
  node.height = size[1];
  return size;
}

// 实验性功能
function alignTab(border: number, step: -1 | 1, tab?: number) {
  if (!tab) {
    return border;
  }
  const mod = border % tab;
  if (mod === 0) {
    return border;
  }
  return border + step * tab - mod;
}

function setCollapsedCoord(tree: TreeData, x?: number, y?: number) {
  if (x !== undefined && y !== undefined) {
    tree.x = x;
    tree.y = y;
    if (tree.collapsed) {
      tree.children?.forEach((child: TreeData) => {
        setCollapsedCoord(child, x, y);
      });
    }
  } else if (tree.collapsed) {
    tree.children?.forEach((child: TreeData) => {
      setCollapsedCoord(child, tree.x, tree.y);
    });
  } else {
    tree.children?.forEach((child: TreeData) => {
      setCollapsedCoord(child);
    });
  }
}
