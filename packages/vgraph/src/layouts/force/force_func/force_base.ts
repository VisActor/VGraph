import { EdgeData, NodeData } from "../../../typings/data";
// Base class for all force algorithms.
// This class is not intended to be used directly.
// Instead, use one of the subclasses.

export class ForceBase {
  iterationCallback: (() => void) | undefined;
  nodes: NodeData[] = [];
  constructor() {
    return;
  }
  initialize(nodes: NodeData[], edges: EdgeData[]) {
    this.nodes = nodes;
  }
  run(alpha?: number) {
    return;
  }
  configure(configs?: any) {
    return;
  }
}
