import { LayoutBase, TreeData, Indented } from '../../src';

export class IndentForestLayout extends LayoutBase {
  indented: Indented;
  options: any;
  constructor(options: {
    indent: number;
    subIndent?: number;
    // Indented 配置项，不一一列出
    [k: string]: any;
  }) {
    super(options);
    this.indented = new Indented(options);
    this.options = Object.assign({
      indent: 50,
    }, options);
  }
  layout(data: any) {
    this.indented.layout(data);
    const subRoots = data.children;
    if (!subRoots || subRoots.length === 0) {
      return;
    }
    const { nodeSep, indent, subIndent } = this.options;
    const offset = subIndent ? (subIndent - indent) : 0;
    const fixY = subRoots[0].y;
    let maxWidth = getMaxWidth(subRoots[0]);
    offset && (subRoots[0].x -= offset);
    for (let i = 1; i < subRoots.length; i++) {
      const node = subRoots[i];
      const { x, y, width } = node;
      const offsetX = maxWidth + width / 2 + nodeSep(node) - x + offset;
      const offsetY = fixY - y;
      translateTree(node, offsetX, offsetY, node.collapsed ? (node.x + offsetX) : undefined, node.collapsed ? fixY : undefined);
      offset && (node.x -= offset);
      maxWidth = getMaxWidth(node);
    }
    return data;
  }
}

function getMaxWidth(data: any) {
  const { x, width } = data;
  let maxX = x + width / 2;
  if (data.collapsed) {
    return maxX;
  }
  data?.children?.forEach((child: TreeData) => {
    maxX = Math.max(getMaxWidth(child), maxX);
  });
  return maxX;
}

function translateTree(node: any, x: number, y: number, parentX?: number, parentY?: number) {
  if (parentX !== undefined) {
    node.x = parentX;
    node.y = parentY;
    node.children?.forEach((child: TreeData) => {
      translateTree(child, x, y, parentX, parentY);
    });
  } else {
    node.x += x;
    node.y += y;
    const fixX = node.collapsed ? node.x : undefined;
    const fixY = node.collapsed ? node.y : undefined;
    node.children?.forEach((child: TreeData) => {
      translateTree(child, x, y, fixX, fixY);
    });
  }
}
