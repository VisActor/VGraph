// 参考论文: A.J. van der Ploeg, Drawing Non-layered Tidy Trees in Linear Time, 2013

import { CompactBoxConfigs } from "../../typings/layouts/tree";
import { TreeData } from "../../typings/data";
import { LayoutBase } from "../base";
import { preOrder } from "./utils/traverse";
import { recoverCoord, swapSize } from "./utils/tree";
import { radialTree } from "./utils/radial";

type CompactTree = {
  data: any;
  w: number;
  h: number;
  x: number;
  y: number;
  nodeSep: number;
  rankSep: number;
  prelim: number; // 初步水平坐标
  mod: number; // 每个节点的整个子树应该水平移动多少
  shift: number; //
  change: number;
  children: CompactTree[];
  numOfChild: number;
  tl?: CompactTree; // 左子树
  tr?: CompactTree;
  el?: CompactTree; // 最左子辈节点
  er?: CompactTree; // 最右子辈节点
  // sum of modifiers at the extreme nodes
  msel: number;
  mser: number;
};

type IYL = {
  index: number;
  lowY: number;
  next?: IYL;
};

export class CompactBox extends LayoutBase {
  options = {
    direction: "TB" as "LR" | "RL" | "TB" | "BT",
    nodeSep(nodeData: TreeData) {
      return 20;
    },
    rankSep(nodeData: TreeData) {
      return 20;
    },
    radial: false,
    size: () => [500, 300],
    alignPeerNodes: false,
    alignParent: "mid" as "front" | "mid" | "back",
  };

  constructor(configs: CompactBoxConfigs) {
    super(configs);
    this.setOptions(configs);
  }

  layout(data: TreeData) {
    const options = this.options;
    preOrder(data, (data) => {
      getNodeSize(data, options);
    });
    swapSize(data, options.direction);
    const rankMap = getRankMap(data);
    const heightMap = getRankHeightMap(rankMap, options);
    const tree = initTree(data, 0, null, 0, heightMap, options);
    layout(tree, this.options.alignParent);
    applyPosition(tree, options);
    if (this.options.radial) {
      radialTree(data, this.options, this.options.size());
      return data;
    }
    recoverCoord(data, options.direction);
    return data;
  }
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

function getRankHeightMap(rankMap: { [k: string]: any }, options: any) {
  // 如果同层对齐，则取每层的最大值。如果无需同层对齐，则取 height + rankSep 的累积值。
  const heightMap = {};
  for (const rank of Object.keys(rankMap)) {
    const maxHeight = options.alignPeerNodes
      ? rankMap[rank].reduce((pre: number, cur: TreeData) => {
          const { height } = cur;
          return Math.max(pre, height + options.rankSep(cur));
        }, 0)
      : null;
    for (const tree of rankMap[rank]) {
      const { height } = tree;
      const rankSep = options.rankSep(tree);
      if (tree.children) {
        for (const child of tree.children) {
          heightMap[child.id] = maxHeight ?? height + rankSep;
        }
      }
    }
  }
  return heightMap;
}

function getRankMap(data: TreeData) {
  const rankMap: { [k: string]: any } = {};
  preOrder(data, (node: any, rank: number) => {
    if (!rankMap[rank]) {
      rankMap[rank] = [];
    }
    rankMap[rank].push(node);
  });
  return rankMap;
}

function applyPosition(node: CompactTree, options: any) {
  node.data.x = node.x + 0.5 * (node.w - node.nodeSep); // node.w 实际表示 node 的宽度 + node 右侧的 sep。
  node.data.y = node.y + 0.5 * (node.h - node.rankSep); // 同理
  for (const child of node.children) {
    applyPosition(child, options);
  }
}

function initTree(
  data: TreeData,
  index: number,
  parent: any,
  rank: number,
  heightMap: Record<string, number>,
  options: any
) {
  // 递归将 data 构造成 CompactTree 数据结构。
  const nodeSep = options.nodeSep(data);
  const rankSep = options.rankSep(data);
  const { width, height } = data;
  const root: any = {
    data,
    w: width + nodeSep,
    nodeSep: nodeSep,
    rankSep: rankSep,
    h: height + rankSep,
    x: 0,
    y: parent?.y + heightMap[data.id!] || -0.5 * height!,
    prelim: 0,
    mod: 0,
    change: 0,
    shift: 0,
    msel: 0,
    mser: 0,
    rank,
    numOfChild: 0,
    children: [],
  } as CompactTree;
  if (data.children && !data.collapsed) {
    root.children = [];
    data.children.forEach((child: any, i: number) => {
      root.children.push(
        initTree(child, i, root, rank + 1, heightMap, options)
      );
    });
    root.numOfChild = root.children.length;
  }
  return root;
}

function layout(t: CompactTree, alignParent: "front" | "mid" | "back") {
  firstWalk(t, alignParent);
  secondWalk(t, 0);
}

function firstWalk(t: CompactTree, alignParent: "front" | "mid" | "back") {
  if (t.numOfChild === 0) {
    setExtremes(t);
    return;
  }
  firstWalk(t.children[0], alignParent);
  // 在轮廓最小垂直坐标(IYL)和索引列表中创建兄弟。
  let ih = updateIYL(bottom(t.children[0].el!), 0, undefined);
  for (let i = 1; i < t.numOfChild; i++) {
    firstWalk(t.children[i], alignParent);
    // 存储最低垂直坐标，同时extremes仍指向当前子树。
    const minY = bottom(t.children[i].er!);
    separate(t, i, ih);
    ih = updateIYL(minY, i, ih);
  }
  positionRoot(t, alignParent);
  setExtremes(t);
}

function setExtremes(t: CompactTree) {
  if (t.numOfChild === 0) {
    t.el = t;
    t.er = t;
    t.msel = t.mser = 0;
  } else {
    t.el = t.children[0].el; // 最左侧节点
    t.msel = t.children[0].msel;
    t.er = t.children[t.numOfChild - 1].er; // 最右侧节点
    t.mser = t.children[t.numOfChild - 1].mser;
  }
}

function separate(t: any, i: number, ih: IYL) {
  let sr = t.children[i - 1];
  let mssr = sr.mod; // 右侧等高节点的兄弟节点子树的mod的和。

  let cl = t.children[i]; // 当前子树
  let mscl = cl.mod; // 左侧等高节点的当前子树的mod的和。
  while (sr !== undefined && cl !== undefined) {
    if (bottom(sr) > ih.lowY) {
      ih = ih.next!;
    }
    // 从sr的右边到cl的左边有多远?
    const dist = mssr + sr.prelim + sr.w - (mscl + cl.prelim);
    if (dist > 0) {
      mscl += dist;
      moveSubtree(t, i, ih.index, dist);
    }
    const sy = bottom(sr);
    const cy = bottom(cl);
    if (sy <= cy) {
      sr = nextRightContour(sr);
      if (sr !== undefined) {
        mssr += sr.mod;
      }
    }
    if (sy >= cy) {
      cl = nextLeftContour(cl);
      if (cl !== undefined) {
        mscl += cl.mod;
      }
    }
  }
  // Set threads and update extreme nodes.
  if (sr === undefined && cl !== undefined) {
    // In the first case, the current subtree must be taller than the left siblings.
    setLeftThread(t, i, cl, mscl);
  } else if (sr !== undefined && cl === undefined) {
    // In this case, the left siblings must be taller than the current subtree.
    setRightThread(t, i, sr, mssr);
  }
}

function moveSubtree(t: CompactTree, i: number, si: number, dist: number) {
  // Move subtree by changing mod.
  t.children[i].mod += dist;
  t.children[i].msel += dist;
  t.children[i].mser += dist;
  distributeExtra(t, i, si, dist);
}

function nextLeftContour(t: CompactTree) {
  return t.numOfChild === 0 ? t.tl : t.children[0];
}
function nextRightContour(t: CompactTree) {
  return t.numOfChild === 0 ? t.tr : t.children[t.numOfChild - 1];
}
function bottom(t: CompactTree) {
  return t.y + t.h;
}
function setLeftThread(
  t: CompactTree,
  i: number,
  cl: CompactTree,
  modsumcl: number
) {
  const li = t.children[0].el!;
  li.tl = cl;
  // Change mod so that the sum of modifier after following thread is correct.
  const diff = modsumcl - cl.mod - t.children[0].msel;
  li.mod += diff;
  li.prelim -= diff;
  // 更新 extreme node 及 他们的 mod 的合。 注： mod  为每个节点的整个子树应该水平移动多少
  t.children[0].el = t.children[i].el;
  t.children[0].msel = t.children[i].msel;
}

function setRightThread(
  t: CompactTree,
  i: number,
  sr: CompactTree,
  modsumsr: number
) {
  const ri = t.children[i].er!;
  ri.tr = sr;
  const diff = modsumsr - sr.mod - t.children[i].mser;
  ri.mod += diff;
  ri.prelim -= diff;
  t.children[i].er = t.children[i - 1].er;
  t.children[i].mser = t.children[i - 1].mser;
}

function positionRoot(
  t: CompactTree,
  alignParent: "front" | "mid" | "back" = "mid"
) {
  // 父节点对齐子节点。
  // mid 居中对齐
  // front 居前对齐
  // back 居后对齐
  if (alignParent === "mid") {
    t.prelim =
      (t.children[0].prelim +
        t.children[0].mod +
        t.children[t.numOfChild - 1].mod +
        t.children[t.numOfChild - 1].prelim +
        (t.children[t.numOfChild - 1].w -
          t.children[t.numOfChild - 1].nodeSep)) /
        2 -
      (t.w - t.nodeSep) / 2;
  } else if (alignParent === "front") {
    t.prelim = t.children[0].prelim + t.children[0].mod;
  } else if (alignParent === "back") {
    t.prelim =
      t.children[t.numOfChild - 1].mod +
      t.children[t.numOfChild - 1].prelim +
      (t.children[t.numOfChild - 1].w - t.children[t.numOfChild - 1].nodeSep) -
      (t.w - t.nodeSep);
  }
}

function secondWalk(t: CompactTree, modsum: number) {
  modsum += t.mod;
  // 设置绝对（非相对）水平坐标。
  t.x = t.prelim + modsum;
  addChildSpacing(t);
  for (let i = 0; i < t.numOfChild; i++) {
    secondWalk(t.children[i], modsum);
  }
}
function distributeExtra(t: CompactTree, i: number, si: number, dist: number) {
  // 均匀分配dist用于shift和change。
  if (si !== i - 1) {
    const nr = i - si;
    t.children[si + 1].shift += dist / nr;
    t.children[i].shift -= dist / nr;
    t.children[i].change -= dist - dist / nr;
  }
}
// 处理'change'和'shift'来为mod添加中间间距。
function addChildSpacing(t: CompactTree) {
  let d = 0;
  let modSumDelta = 0;
  for (let i = 0; i < t.numOfChild; i++) {
    d += t.children[i].shift;
    modSumDelta += d + t.children[i].change;
    t.children[i].mod += modSumDelta;
  }
}

function updateIYL(minY: number, i: number, ih?: IYL) {
  while (ih !== undefined && minY >= ih.lowY) {
    ih = ih.next;
  }
  return {
    index: i,
    lowY: minY,
    next: ih,
  };
}
