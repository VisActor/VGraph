import { NodeData } from '../../../typings/data';
import { setNodesOption } from '../utils';
import { ForceBase } from './force_base';

// The different with CenterForce is:
//      CenterForce: move same distance for all nodes
//      ForceX: the force value is proportional to the distance between the node and specified x-coordinate.
export class ForceX extends ForceBase {
  options: {
    x?: number | number[] | ((nodeData: NodeData) => number);
    strength?: number | number[] | ((nodeData: NodeData) => number);
    minX?: number | number[] | ((nodeData: NodeData) => number);
    maxX?: number | number[] | ((nodeData: NodeData) => number);
    withAlpha: boolean;
  } = {
    strength: 1,
    withAlpha: true,
  };
  private isCustomizedNodes = false;
  private strengths: Map<string, number> = new Map();
  private xs: Map<string, number> = new Map();
  private minXs: Map<string, number> = new Map();
  private maxXs: Map<string, number> = new Map();

  constructor(configs?: {
    nodes?: NodeData[];
    options?: {
      x?: number | number[] | ((nodeData: NodeData) => number);
      strength?: number | number[] | ((nodeData: NodeData) => number);
      minX?: number | number[] | ((nodeData: NodeData) => number);
      maxX?: number | number[] | ((nodeData: NodeData) => number);
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
    if (this.options.x !== undefined) {
      this.xs = setNodesOption(this.nodes, this.options.x);
    } else if (this.options.minX !== undefined && this.options.maxX !== undefined) {
      this.minXs = setNodesOption(this.nodes, this.options.minX);
      this.maxXs = setNodesOption(this.nodes, this.options.maxX);
    } else {
      // Default
      this.options.x = 0;
      this.xs = setNodesOption(this.nodes, this.options.x);
    }
  }
  run(alpha?: number): void {
    let alphaTemp = alpha || 1;
    if (this.options.withAlpha === false) {
      alphaTemp = 1.0;
    } // 不随着simulation的alpha衰减
    this.nodes.forEach((node: NodeData, i: number) => {
      const x = this.xs.get(node.id);
      const strength = (this.strengths.get(node.id) || 0) * alphaTemp;
      if (x !== undefined) {
        node.vx += (x - node.x - node.vx) * strength;
      } else {
        const minX = this.minXs.get(node.id) || 0;
        const maxX = this.maxXs.get(node.id) || 0;
        const minMove = Math.max(minX - node.x - node.vx, 0);
        const maxMove = Math.min(maxX - node.x - node.vx, 0);
        node.vx += minMove * strength;
        node.vx += maxMove * strength;
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
  setPositions(x: number | number[] | ((nodeData: NodeData) => number)): void {
    this.options.x = x;
    this.xs = setNodesOption(this.nodes, this.options.x);
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
