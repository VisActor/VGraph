import { quadtree, QuadtreeLeaf } from "d3-quadtree";
import { jiggle, setNodesOption } from "../utils";
import { ForceBase } from "./force_base";
import { NodeData } from "../../../typings/data";

interface QuadtreeLeafCustom<T> extends QuadtreeLeaf<T> {
  [key: string]: any;
}

interface QuadtreeInternalNodeCustom<T>
  extends Array<
    QuadtreeInternalNodeCustom<T> | QuadtreeLeafCustom<T> | undefined
  > {
  length: 4;
  [key: string]: any;
}

// ManyBody Force.
// Commonly is a repulsive force.
// Parameters:
//  sourceNodes: The nodes for  the forces source from.
//  appliedNodes: The nodes of the force to be applied.
//  If not specified, the sourceNodes and appliedNodes are the same.
//  options:
//    strength: strength of the force.
//    theta: theta is the Barnes-Hut approximation criterion.
//    distanceMin: the minimum distance between nodes.

export class ForceManyBody extends ForceBase {
  sourceNodes: NodeData[] | undefined = undefined;
  appliedNodes: NodeData[] | undefined = undefined;
  options: {
    strength: number | number[] | ((nodeData: NodeData) => number);
    theta: number;
    distanceMin: number;
  } = {
    strength: -30,
    theta: 0.9,
    distanceMin: 1,
  };
  private strengths: Map<string, number> = new Map();
  private nowNode: NodeData = {} as NodeData;
  private theta2 = 0.81;
  private distanceMax2 = Infinity;
  private distanceMin2 = 1;
  private alpha = 1.0;
  private isCustomizedSourceNodes = false;
  private isCustomizedAppliedNodes = false;
  constructor(configs?: {
    nodes?: NodeData[];
    sourceNodes?: NodeData[];
    appliedNodes?: NodeData[];
    options?: Record<string, unknown>;
    iterationCallback?: () => void;
  }) {
    super();
    this.accumulate = this.accumulate.bind(this);
    this.apply = this.apply.bind(this);
    if (configs) {
      if (configs.nodes) {
        this.sourceNodes = configs.nodes;
        this.isCustomizedSourceNodes = true;
        this.appliedNodes = configs.nodes;
        this.isCustomizedAppliedNodes = true;
      }
      if (configs.sourceNodes) {
        this.sourceNodes = configs.sourceNodes;
        this.isCustomizedSourceNodes = true;
      }
      if (configs.appliedNodes) {
        this.appliedNodes = configs.appliedNodes;
        this.isCustomizedAppliedNodes = true;
      }
      this.options = Object.assign({}, this.options, configs.options);
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
  initialize(nodes: NodeData[]): void {
    this.nodes = nodes;
    this.strengths = new Map();

    if (!this.sourceNodes || this.isCustomizedSourceNodes === false) {
      this.sourceNodes = nodes;
    }
    if (!this.appliedNodes || this.isCustomizedAppliedNodes === false) {
      this.appliedNodes = nodes;
    }
    this.strengths = setNodesOption(this.sourceNodes, this.options.strength);
  }

  run(alpha?: number): void {
    if (alpha) {
      this.alpha = alpha;
    }
    const tree = quadtree(
      this.sourceNodes || [],
      (nodeData: NodeData) => nodeData.x,
      (nodeData: NodeData) => nodeData.y
    ).visitAfter(this.accumulate);
    if (this.appliedNodes) {
      this.appliedNodes.forEach((node) => {
        this.nowNode = node;
        tree.visit(this.apply);
      });
    }
  }
  accumulate(
    quad: QuadtreeLeafCustom<NodeData> | QuadtreeInternalNodeCustom<NodeData>
  ): void {
    let strength = 0;
    let q;
    let c;
    let weight = 0;
    let x;
    let y;
    let i;
    // For internal nodes, accumulate forces from child quadrants.

    if (quad.length) {
      for (x = y = i = 0; i < 4; ++i) {
        q = quad[i];
        if (q && Math.abs(q.value)) {
          c = Math.abs(q.value);
          strength += q.value;
          weight += c;
          x += c * q.x;
          y += c * q.y;
        }
      }
      quad.x = x / weight;
      quad.y = y / weight;
    }

    // For leaf nodes, accumulate forces from coincident quadrants.
    else {
      q = quad;
      q.x = q.data.x;
      q.y = q.data.y;
      do {
        strength += this.strengths.get(q.data.id) || 0;
        q = q.next;
      } while (q);
    }
    quad.value = strength;
  }
  apply(
    quad: QuadtreeLeafCustom<NodeData> | QuadtreeInternalNodeCustom<NodeData>,
    x1: number,
    _: number,
    x2: number
  ): boolean | undefined {
    // console.log(quad);

    if (!quad.value) {
      return true;
    }
    let x = quad.x - this.nowNode.x;
    let y = quad.y - this.nowNode.y;
    let w = x2 - x1;
    let l = x * x + y * y;
    // Apply the Barnes-Hut approximation if possible.
    // Limit forces for very close nodes; randomize direction if coincident.
    if ((w * w) / this.theta2 < l) {
      if (l < this.distanceMax2) {
        if (x === 0) {
          x = jiggle();
          l += x * x;
        }
        if (y === 0) {
          y = jiggle();
          l += y * y;
        }
        if (l < this.distanceMin2) {
          l = Math.sqrt(this.distanceMin2 * l);
        }
        this.nowNode.vx += (x * quad.value * this.alpha) / l;
        this.nowNode.vy += (y * quad.value * this.alpha) / l;
      }
      return true;
    }

    // Otherwise, process points directly.
    else if (quad.length) {
      return false;
    }

    // Limit forces for very close nodes; randomize direction if coincident.
    if (quad.data !== this.nowNode || quad.next) {
      if (x === 0) {
        x = jiggle();
        l += x * x;
      }
      if (y === 0) {
        y = jiggle();
        l += y * y;
      }
      if (l < this.distanceMin2) {
        l = Math.sqrt(this.distanceMin2 * l);
      }
    }

    do {
      if (quad.data !== this.nowNode) {
        w = ((this.strengths.get(quad.data.id) || 0) * this.alpha) / l;
        this.nowNode.vx += x * w;
        this.nowNode.vy += y * w;
      }
      quad = quad.next;
    } while (quad);
  }
  setStrengths(
    strength: number | number[] | ((nodeData: NodeData) => number)
  ): void {
    this.options.strength = strength;
    if (this.sourceNodes) {
      this.strengths = setNodesOption(this.sourceNodes, this.options.strength);
    }
  }
  configure(configs?: any): void {
    if (configs) {
      if (configs.nodes) {
        this.sourceNodes = configs.nodes;
        this.appliedNodes = configs.nodes;
      }
      if (configs.sourceNodes) {
        this.sourceNodes = configs.sourceNodes;
      }
      if (configs.appliedNodes) {
        this.appliedNodes = configs.appliedNodes;
      }
      this.options = Object.assign({}, this.options, configs.options);
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
}
