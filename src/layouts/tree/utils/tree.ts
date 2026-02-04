import { postOrder } from './traverse';
const HORIZONTAL_RANKDIRS = ['LR', 'RL'];
const VERTICAL_RANKDIRS = ['TB', 'BT'];
const REVERSE_Y_RANKDIRS = ['BT', 'RL'];

export function getLeftLeaf(node: any) {
  let children;
  while (node.children) {
    children = node.children
    node = children[0]
  }
  return node;
}

export function getRightLeaf(node: any) {
  let children;
  while (node.children) {
    children = node.children
    node = children[children.length - 1]
  }
  return node;
}

export function shiftTree(data: any, offsetX: number, offsetY: number) {
  postOrder(data, (node: any) => {
    node.x += offsetX;
    node.y += offsetY;
  });
}

export function swapSize(data: any, rankDir = 'TB', defaultVertical = true) {
  if ((defaultVertical && !HORIZONTAL_RANKDIRS.includes(rankDir)) || (!defaultVertical && !VERTICAL_RANKDIRS.includes(rankDir))) {
    return;
  }
  postOrder(data, (node: any) => {
    const { width, height } = node;
    node.width = height;
    node.height = width;
  });
}

export function recoverCoord(data: any, rankDir = 'TB' , defaultVertical = true) {
  if (REVERSE_Y_RANKDIRS.includes(rankDir)) {
    postOrder(data, (node: any) => {
      node.y *= -1;
    });
  }

  if ((defaultVertical && HORIZONTAL_RANKDIRS.includes(rankDir)) || (!defaultVertical && VERTICAL_RANKDIRS.includes(rankDir))) {
    postOrder(data, (node: any) => {
      const { x, y, width, height } = node;
      node.x = y;
      node.y = x;
      node.width = height;
      node.height = width;
    });
  }
}