import { quadtree, QuadtreeLeaf } from 'd3-quadtree';
import { jiggle, setNodesOption } from '../utils';
import { ForceBase } from './force_base';
import { NodeData } from '../../../typings/data';

interface QuadtreeLeafCustom<T> extends QuadtreeLeaf<T> {
  [key: string]: any;
}

interface QuadtreeInternalNodeCustom<T>
  extends Array<QuadtreeInternalNodeCustom<T> | QuadtreeLeafCustom<T> | undefined> {
  length: 4;
  [key: string]: any;
}

// Collision Force
// This force can be used to prevent nodes from overlapping.
// Parameters:
//   options: {
//     radius: number | number[] | ((nodeData: NodeData) => number);
//     strength: number;
//   }
//  The radius of the nodes.
//  If radius is a number, the radius of each node will be the same.
//  If radius is a array, the radius of each node will be the value of the array at the index of the node.
//  If radius is a function, the radius of each node will be the return value of the function.
//  TODO: Square Collision

export class ForceCollision extends ForceBase {
  options: {
    strength: number;
    radius?: number | number[] | ((nodeData: NodeData) => number) | undefined;
    width?: number | number[] | ((nodeData: NodeData) => number); // TODO: Square Collision
    height?: number | number[] | ((nodeData: NodeData) => number); // TODO: Square Collision
  } = {
    radius: undefined,
    strength: 1,
  };

  private radii: Map<string, number> = new Map();
  private widths: Map<string, number> = new Map();
  private heights: Map<string, number> = new Map();
  private nowNode: NodeData = {} as NodeData;
  private visited: Map<string, boolean> = new Map();
  private xi = 0;
  private yi = 0;
  private ri = 0;
  constructor(configs?: { options?: { [key: string]: any }; iterationCallback?: () => void }) {
    super();
    // 绑定this
    // accumulate是在建树的时候调用的, 用于计算每个quad的半径
    // apply遍历每个节点的时候调用的，用于计算节点之间的碰撞
    this.accumulate = this.accumulate.bind(this);
    this.apply = this.apply.bind(this);
    if (configs) {
      this.options = Object.assign({}, this.options, configs.options);
      if (configs.iterationCallback) { this.iterationCallback = configs.iterationCallback; }
    }
  }

  // 初始化，在FDP实例构造时调用
  initialize(nodes: NodeData[]): void {
    this.nodes = nodes;
    if (this.options.radius) { this.radii = setNodesOption(this.nodes, this.options.radius); }
    else if (this.options.width && this.options.height) {
      this.widths = setNodesOption(this.nodes, this.options.width);
      this.heights = setNodesOption(this.nodes, this.options.height);
    } else {
      console.assert(false, '请传入半径或宽高参数');
      // TODO: 智能读取node的radius属性和width height属性
    }
  }

  // 计算碰撞
  run(): void {
    const tree = quadtree(
      this.nodes || [],
      (d) => d.x,
      (d) => d.y,
    ).visitAfter(this.accumulate);
    this.visited.clear();
    if (this.nodes) {
      this.nodes.forEach((node) => {
        this.nowNode = node;
        this.xi = node.x + node.vx;
        this.yi = node.y + node.vy;
        this.ri = this.radii.get(this.nowNode.id) ||
          0.5 * Math.max(this.widths.get(this.nowNode.id) || 0, this.heights.get(this.nowNode.id) || 0);
        this.visited.set(node.id, true);
        tree.visit(this.apply);
      });
    }
    if (this.iterationCallback) { this.iterationCallback(); }
  }

  // 计算每个quad的半径, 每个父节点的半径是子节点半径的最大值
  accumulate(quad: QuadtreeLeafCustom<NodeData> | QuadtreeInternalNodeCustom<NodeData>): void {
    if (quad.data) {
      // 说明是叶子节点，从源数据中取出半径
      quad.r =
        this.radii.get(quad.data.id) ||
        0.5 * Math.max(this.widths.get(quad.data.id) || 0, this.heights.get(quad.data.id) || 0);
      return;
    }

    // 说明是父节点
    for (let i = (quad.r = 0); i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }
  apply(
    quad: QuadtreeLeafCustom<NodeData> | QuadtreeInternalNodeCustom<NodeData>,
    x1: number, // quad的左上角x坐标
    y1: number, // quad的左上角y坐标
    x2: number, // quad的右下角x坐标
    y2: number, // quad的右下角y坐标
  ): any {
    const data = quad.data;
    const rj = quad.r;
    const ri = this.ri;
    const r = ri + rj;
    const ri2 = ri * ri;
    const rj2 = rj * rj;
    const strength = this.options.strength;
    const xi = this.xi;
    const yi = this.yi;
    // ri: 当前节点的半径
    // rj: 四叉树节点的半径
    // r: 两者之和
    // ri2: 当前节点的半径的平方
    // rj2: 四叉树节点的半径的平方
    // strength: 强度
    // xi: 当前节点的x坐标
    // yi: 当前节点的y坐标

    // 说明是叶子节点，需要计算是否碰撞
    if (data) {
      if (!this.visited.get(data.id)) {
        let x = xi - data.x - data.vx;
        let y = yi - data.y - data.vy;
        let l = x * x + y * y;
        if (l < r * r) {
          // 碰撞
          const w1 = this.widths.get(quad.data.id);
          const h1 = this.heights.get(quad.data.id);
          if (w1 !== undefined && h1 !== undefined) {
            const w2 = this.widths.get(this.nowNode.id) || 0;
            const h2 = this.heights.get(this.nowNode.id) || 0;
            const r2 = w2 / (w1 + w2) || 0;
            const lx = Math.abs(x) - 0.5 * (w1 + w2);
            const ly = Math.abs(y) - 0.5 * (h1 + h2);
            if (lx < 0 && ly < 0) {
              // need move
              if (lx > ly) {
                // move x
                // console.log(lx,ly);
                this.nowNode.vx -= r2 * lx * Math.sign(x);
                data.vx += (1 - r2) * lx * Math.sign(x);
              } else {
                // move y
                this.nowNode.vy -= r2 * ly * Math.sign(y);
                data.vy += (1 - r2) * ly * Math.sign(y);
              }
            }
          } else {
            if (x === 0) {
              x = jiggle();
              l += x * x;
            }
            if (y === 0) {
              y = jiggle();
              l += y * y;
            }
            l = ((r - (l = Math.sqrt(l))) / l) * strength;
            x *= l;
            y *= l;
            const r2 = rj2 / (ri2 + rj2);
            this.nowNode.vx += x * r2;
            this.nowNode.vy += y * r2;
            data.vx -= x * (1 - r2);
            data.vy -= y * (1 - r2);
          }
        }
      }
      return false;
    }

    // True: 四叉树节点与待计算节点的距离大于碰撞半径，则不可能碰撞，无需递归至下一节点
    // False: 四叉树节点与待计算节点的距离小于碰撞半径，则可能碰撞，需要递归至下一节点
    return x1 > xi + r || x2 < xi - r || y1 > yi + r || y2 < yi - r;
  }
  setStrength(strength: number): void {
    this.options.strength = strength;
  }
  setRadius(radius: number): void {
    this.options.radius = radius;
  }
  configure(configs?: any | undefined): void {
    if (configs) {
      this.options = Object.assign({}, this.options, configs.options);
      if (configs.iterationCallback) { this.iterationCallback = configs.iterationCallback; }
    }
  }
}
