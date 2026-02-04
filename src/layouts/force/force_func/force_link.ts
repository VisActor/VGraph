import { EdgeData, NodeData } from '../../../typings/data';
import { jiggle, setLinksOption } from '../utils';
import { ForceBase } from './force_base';

// Link Force
// Commonly is an attractive force.
// Parameters:
// edges: links data
// options:
//  strength: force strength, can be a number, array or function
//  distance: edge distance, can be a number, array or function
//  bias: bias in source and target node, can be a number, array or function
/**
 * @class ForceLink
 * @extends ForceBase
 * @param {object} [edges] - links data
 * @param {object} [configs] - configs
 * @param {object} configs.options - options
 * @param {number | Array | Function} configs.options.strength
 * @param {number} configs.options.distance
 * @param {number} configs.options.bias
 */
export class ForceLink extends ForceBase {
  edges: EdgeData[] = [];
  idMap: (d: NodeData, i: number, nodes: NodeData[]) => any = (d: NodeData) => d.id;
  links: { source: NodeData; target: NodeData }[] = [];
  degrees: Map<string, number> = new Map<string, number>();
  options: {
    mode: 'FR' | 'd3' | 'linlog';
    strength?: number | number[] | ((d: { source: NodeData; target: NodeData }) => number);
    distance?: number | number[] | ((d: { source: NodeData; target: NodeData }) => number);
    bias?: number | number[] | ((d: { source: NodeData; target: NodeData }) => number);
    isCustomizedEdges?: false | true;
  } = {
    mode: 'd3',
    distance: 30,
    strength: ((d: { source: NodeData; target: NodeData }) => {
      const sourceDegree = this.degrees.get(d.source.id) ?? 1;
      const targetDegree = this.degrees.get(d.target.id) ?? 1;
      return 1 / Math.min(sourceDegree, targetDegree);
    }),
    bias: ((d: { source: NodeData; target: NodeData }) => {
      const sourceDegree = this.degrees.get(d.source.id) ?? 1;
      const targetDegree = this.degrees.get(d.target.id) ?? 1;
      return sourceDegree / (sourceDegree + targetDegree);
    }),
  };
  private alpha = 1.0;
  private distances: number[] = [];
  private strengths: number[] = [];
  private biases: number[] = [];
  private isCustomizedEdges = false;

  constructor(configs?: {
    edges?: EdgeData[];
    idMap?: (nodeData: NodeData, i: any, nodes: any) => any;
    options?: Record<string, unknown>; // {}
    iterationCallback?: () => void;
  }) {
    super();
    if (configs) {
      if (configs.edges === undefined) {
        this.edges = [];
      }
      if (configs.idMap) {
        this.idMap = configs.idMap;
      }
      if (configs.edges) {
        this.edges = configs.edges;
      } // force_link 这里是否默认沿用d3的传入edges的习惯还是统一默认用initialize还需要再考虑考虑，目前暂定沿用d3的使用习惯。
      this.options = Object.assign({}, this.options, configs.options);
      if (this.options.isCustomizedEdges) {
        this.isCustomizedEdges = this.options.isCustomizedEdges;
      } // 本来应该是通过是否传入configs.edges来判断，但为了兼容之前的，目前暂定沿用d3的使用习惯。
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }

  initialize(nodes: NodeData[], edges: EdgeData[]): void {
    this.nodes = nodes;

    if (this.isCustomizedEdges === false && edges) {
      this.edges = edges;
      // initialize 传入的 nodes 和 edges 一定是 graph 的 nodes 和 edges
    }
    // normaliza the edges to links
    // For each link, with source and target, which point to the node.
    const nodebyId = new Map(this.nodes.map((d, i) => [this.idMap(d, i, nodes), d]));
    if (this.edges.length > 0) {
      // normalize the edges to links
      this.edges.forEach((edge: EdgeData) => {
        if (
          edge.source !== undefined &&
          edge.target !== undefined &&
          typeof edge.source !== 'object' &&
          typeof edge.target !== 'object'
        ) {
          const source = nodebyId.get(edge.source) as NodeData;
          const target = nodebyId.get(edge.target) as NodeData;
          if (!this.degrees.has(source.id)) {
            this.degrees.set(source.id, 0);
          } 
          this.degrees.set(source.id, this.degrees.get(source.id)! + 1);
          if (!this.degrees.has(target.id)) {
            this.degrees.set(target.id, 0);
          } 
          this.degrees.set(target.id, this.degrees.get(target.id)! + 1);
          this.links.push({ source, target });
        } else if (typeof edge.source === 'object' && typeof edge.target === 'object') {
          const source = edge.source as NodeData;
          const target = edge.target as NodeData;
          if (!this.degrees.has(source.id)) {
            this.degrees.set(source.id, 0);
          } 
          this.degrees.set(source.id, this.degrees.get(source.id)! + 1);
          if (!this.degrees.has(target.id)) {
            this.degrees.set(target.id, 0);
          }
          this.degrees.set(target.id, this.degrees.get(target.id)! + 1);
          this.links.push({ source, target });
        }
      });
    }

    // set strength
    if (this.options.strength !== undefined) {
      this.strengths = setLinksOption(this.links, this.options.strength);
    }

    // set distance
    if (this.options.distance !== undefined) {
      this.distances = setLinksOption(this.links, this.options.distance);
    }

    // set bias
    if (this.options.bias !== undefined) {
      this.biases = setLinksOption(this.links, this.options.bias);
    }
  }

  run(alpha?: number): void {
    if (alpha) {
      this.alpha = alpha;
    }
    if (this.options.mode === 'FR') {
      this.links.forEach((link, i) => {
        const source = link.source;
        const target = link.target;
        const s = this.strengths[i] * this.alpha * 0.05;
        const d = this.distances[i];
        const b = this.biases[i];
        const x = target.vx - source.vx + target.x - source.x || jiggle();
        const y = target.vy - source.vy + target.y - source.y || jiggle();
        const l = Math.sqrt(x * x + y * y);
        let mvx = s * x * (l - d);
        let mvy = s * y * (l - d);
        const mvDist = Math.sqrt(mvx * mvx + mvy * mvy);
        if (mvDist > 0.5 * l) {
          mvx = ((0.5 * mvx) / mvDist) * l;
          mvy = ((0.5 * mvy) / mvDist) * l;
        }
        target.vx -= b * mvx;
        target.vy -= b * mvy;
        source.vx += (1 - b) * mvx;
        source.vy += (1 - b) * mvy;
      });
    } else if (this.options.mode === 'linlog') {
      this.links.forEach((link, i) => {
        const source = link.source;
        const target = link.target;
        const s = this.alpha * 20;
        const b = 0.5;
        const x = target.x - source.x || jiggle();
        const y = target.y - source.y || jiggle();
        const l = Math.sqrt(x * x + y * y);
        const mvx = (s * x) / l;
        const mvy = (s * y) / l;
        target.vx -= b * mvx;
        target.vy -= b * mvy;
        source.vx += (1 - b) * mvx;
        source.vy += (1 - b) * mvy;
      });
    } else {
      this.links.forEach((link, i) => {
        const source = link.source;
        const target = link.target;
        const s = this.strengths[i] * this.alpha;
        const d = this.distances[i];
        const b = this.biases[i];
        const x = target.vx - source.vx + target.x - source.x || jiggle();
        const y = target.vy - source.vy + target.y - source.y || jiggle();
        const l = Math.sqrt(x * x + y * y);
        const mvx = (s * x * (l - d)) / l;
        const mvy = (s * y * (l - d)) / l;
        target.vx -= b * mvx;
        target.vy -= b * mvy;
        source.vx += (1 - b) * mvx;
        source.vy += (1 - b) * mvy;
      });
    }
  }
  setStrength(strength: number | number[] | ((d: { source: NodeData; target: NodeData }) => number) | 'default'): void {
    if (strength === 'default') {
      this.options.strength = ((d: any) => {
        const sourceDegree = this.degrees.get(d.source.id) ?? 1;
        const targetDegree = this.degrees.get(d.target.id) ?? 1;
        return 1 / Math.min(sourceDegree, targetDegree);
      });
      this.strengths = setLinksOption(this.links, this.options.strength);
    } else {
      this.options.strength = strength;
      this.strengths = setLinksOption(this.links, this.options.strength);
    }
  }

  configure(configs?: any): void {
    if (configs.idMap) {
      this.idMap = configs.idMap;
    }
    if (configs.edges) {
      this.edges = configs.edges;
    }
    this.options = Object.assign({}, this.options, configs.options);
    if (configs.iterationCallback) {
      this.iterationCallback = configs.iterationCallback;
    }
  }
}
