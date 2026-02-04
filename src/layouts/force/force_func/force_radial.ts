import { NodeData } from '../../../typings/data';
import { jiggle, setNodesOption } from '../utils';
import { ForceBase } from './force_base';

// The different with CenterForce is:
//      CenterForce: move same distance for all nodes
//      ForceX: the force value is proportional to the distance between the node and specified x-coordinate.
export class ForceRadial extends ForceBase {
  options: {
    posX?: number | number[] | ((nodeData: NodeData) => number);
    posY?: number | number[] | ((nodeData: NodeData) => number);
    r?: number | number[] | ((nodeData: NodeData) => number);
    strength?: number | number[] | ((nodeData: NodeData) => number);
    minR?: number | number[] | ((nodeData: NodeData) => number);
    maxR?: number | number[] | ((nodeData: NodeData) => number);
    withAlpha?: boolean;
  } = {
    posX: 0,
    posY: 0,
    strength: 1,
    withAlpha: true,
  };
  private isCustomizedNodes = false;
  private strengths: Map<string, number> = new Map();
  private rs: Map<string, number> = new Map();
  private minRs: Map<string, number> = new Map();
  private maxRs: Map<string, number> = new Map();
  private posXs: Map<string, number> = new Map();
  private posYs: Map<string, number> = new Map();

  constructor(configs?: {
    nodes?: NodeData[];
    options?: {
      posX?: number | number[] | ((nodeData: NodeData) => number);
      posY?: number | number[] | ((nodeData: NodeData) => number);
      r?: number | number[] | ((nodeData: NodeData) => number);
      strength?: number | number[] | ((nodeData: NodeData) => number);
      minR?: number | number[] | ((nodeData: NodeData) => number);
      maxR?: number | number[] | ((nodeData: NodeData) => number);
      withAlpha?: boolean;
    };
    iterationCallback?: () => void;
  }) {
    super();
    if (configs) {
      if (configs.nodes) {
        this.nodes = configs.nodes;
        this.isCustomizedNodes = true;
      }
      if (configs.options) {
        this.options = Object.assign({}, this.options, configs.options);
      }
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
  initialize(nodes: NodeData[]): void {
    if (this.isCustomizedNodes === false) {
      this.nodes = nodes;
    }
    if (this.options.strength) {
      this.strengths = setNodesOption(this.nodes, this.options.strength);
    }
    if (this.options.posX) {
      this.posXs = setNodesOption(this.nodes, this.options.posX);
    }
    if (this.options.posY) {
      this.posYs = setNodesOption(this.nodes, this.options.posY);
    }
    if (this.options.r !== undefined) {
      this.rs = setNodesOption(this.nodes, this.options.r);
    } else if (this.options.minR !== undefined && this.options.maxR !== undefined) {
      this.minRs = setNodesOption(this.nodes, this.options.minR);
      this.maxRs = setNodesOption(this.nodes, this.options.maxR);
    } else {
      // Default
      this.options.r = 10;
      this.rs = setNodesOption(this.nodes, this.options.r);
    }
  }
  run(alpha?: number): void {
    let alphaTemp = alpha || 1;
    if (this.options.withAlpha === false) {
      alphaTemp = 1.0;
    } // 不随着simulation的alpha衰减
    this.nodes.forEach((node: NodeData, i: number) => {
      const r = this.rs.get(node.id);
      const strength = (this.strengths.get(node.id) || 0) * alphaTemp;
      if (r !== undefined) {
        const x = this.posXs.get(node.id) ?? 0;
        const y = this.posYs.get(node.id) ?? 0;
        const mvx = x - node.x - node.vx || jiggle();
        const mvy = y - node.y - node.vy || jiggle();
        const dist = Math.sqrt(mvx * mvx + mvy * mvy);
        const l = ((r - dist) / dist) * strength;
        node.vx -= mvx * l;
        node.vy -= mvy * l;
      } else {
        const x = this.posXs.get(node.id) ?? 0;
        const y = this.posYs.get(node.id) ?? 0;
        const mvx = x - node.x - node.vx || jiggle();
        const mvy = y - node.y - node.vy || jiggle();
        const dist = Math.sqrt(mvx * mvx + mvy * mvy);
        const deltaMax = (this.maxRs.get(node.id) ?? Infinity) - dist;
        const deltaMin = (this.minRs.get(node.id) ?? 0) - dist;
        const l = ((deltaMax > 0 ? (deltaMin < 0 ? 0 : deltaMin) : deltaMax) / dist) * strength;
        node.vx -= mvx * l;
        node.vy -= mvy * l;
      }
    });
    if (this.iterationCallback) {
      this.iterationCallback();
    }
  }
  setStrengths(strength: number | number[] | ((nodeData: NodeData) => number)): void {
    this.options.strength = strength;
    this.strengths = setNodesOption(this.nodes, this.options.strength);
  }
  configure(configs?: any): void {
    if (configs) {
      if (configs.nodes) {
        this.nodes = configs.nodes;
      }
      if (configs.options) {
        this.options = Object.assign({}, this.options, configs.options);
      }
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
}
