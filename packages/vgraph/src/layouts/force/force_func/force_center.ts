import { NodeData } from "../../../typings/data";
import { ForceBase } from "./force_base";

// Center Force
// This force can be used to center the graph in the viewport by setting the x- and y- coordinate to the center of the viewport.
// Parameters:
//   options: {
//     x?: number;
//     y?: number;
//     strength?: number;
//   }
//   The x- and y- coordinate of the center of the viewport.
//   If either x or y is specified, the graph will be centered on the specified coordinate.
//   Otherwise, the center of the graph will be (0,0).
//   strength: The strength of the force.

export class ForceCenter extends ForceBase {
  options: { x: number; y: number; strength: number } = {
    x: 0,
    y: 0,
    strength: 1,
  };

  constructor(configs?: {
    options?: { x?: number; y?: number; strength?: number };
    iterationCallback?: () => void;
  }) {
    super();
    if (configs) {
      if (configs.options) {
        this.options = Object.assign({}, this.options, configs.options);
      }
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
  initialize(nodes: NodeData[]): void {
    this.nodes = nodes;
  }
  run(): void {
    let sumX = 0;
    let sumY = 0;
    const n = this.nodes.length;
    const x = this.options.x;
    const y = this.options.y;
    const strength = this.options.strength;

    // Calculate the center of the graph
    for (let i = 0; i < n; i++) {
      const node = this.nodes[i];
      sumX += node.x;
      sumY += node.y;
    }

    // Center the graph
    const moveX = (sumX / n - x) * strength;
    const moveY = (sumY / n - y) * strength;
    for (let i = 0; i < n; i++) {
      const node = this.nodes[i];
      node.x -= moveX;
      node.y -= moveY;
    }
  }
  setStrengths(strength: number): void {
    this.options.strength = strength;
  }
  configure(configs?: any | undefined): void {
    if (configs) {
      if (configs.options) {
        this.options = Object.assign({}, this.options, configs.options);
      }
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
}
