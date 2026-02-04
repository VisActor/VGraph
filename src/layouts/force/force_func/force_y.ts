import { NodeData } from '../../../typings/data';
import { setNodesOption } from '../utils';
import { ForceBase } from './force_base';

// Same with ForceX

export class ForceY extends ForceBase {
  options: {
    y?: number | number[] | ((nodeData: NodeData) => number);
    strength?: number | number[] | ((nodeData: NodeData) => number);
    minY?: number | number[] | ((nodeData: NodeData) => number);
    maxY?: number | number[] | ((nodeData: NodeData) => number);
    withAlpha: boolean;
  } = {
    strength: 1,
    withAlpha: true,
  };
  private isCustomizedNodes = false;
  private strengths: Map<string, number> = new Map();
  private ys: Map<string, number> = new Map();
  private minYs: Map<string, number> = new Map();
  private maxYs: Map<string, number> = new Map();

  constructor(configs?: {
    nodes?: NodeData[];
    options?: {
      y?: number | number[] | ((nodeData: NodeData) => number);
      strength?: number | number[] | ((nodeData: NodeData) => number);
      minY?: number | number[] | ((nodeData: NodeData) => number);
      maxY?: number | number[] | ((nodeData: NodeData) => number);
      withAlpha?: boolean;
    };
    iterationCallback?: () => void;
  }) {
    super();
    if (configs) {
      if (configs.nodes) {
        this.nodes = configs.nodes;
        this.isCustomizedNodes = false;
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
      this.strengths = setNodesOption(nodes, this.options.strength);
    }
    if (this.options.y !== undefined) {
      this.ys = setNodesOption(nodes, this.options.y);
    } else if (this.options.minY !== undefined && this.options.maxY !== undefined) {
      this.minYs = setNodesOption(this.nodes, this.options.minY);
      this.maxYs = setNodesOption(this.nodes, this.options.maxY);
    } else {
      // Default
      this.options.y = 0;
      this.ys = setNodesOption(this.nodes, this.options.y);
    }
  }
  run(alpha?: number): void {
    let alphaTemp = alpha || 1;
    if (this.options.withAlpha === false) {
      alphaTemp = 1.0;
    } // 不随着simulation的alpha衰减
    this.nodes.forEach((node: NodeData, i: number) => {
      const y = this.ys.get(node.id);
      const strength = (this.strengths.get(node.id) || 0) * alphaTemp;
      if (y !== undefined) {
        node.vy += (y - node.y - node.vy) * strength;
      } else {
        const minY = this.minYs.get(node.id) || 0;
        const maxY = this.maxYs.get(node.id) || 0;
        const minMove = Math.max(minY - node.y - node.vy, 0);
        const maxMove = Math.min(maxY - node.y - node.vy, 0);
        node.vy += minMove * strength;
        node.vy += maxMove * strength;
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
  setPositions(y: number | number[] | ((nodeData: NodeData) => number)): void {
    this.options.y = y;
    this.ys = setNodesOption(this.nodes, this.options.y);
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
