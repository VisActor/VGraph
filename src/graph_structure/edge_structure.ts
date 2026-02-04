import { EdgeData } from '../typings/data'
import { NodeStructure } from './node_structure';
export class EdgeStructure {
  configs: EdgeData;
  source?: NodeStructure;
  target?: NodeStructure;

  constructor(edgeData: EdgeData) {
    this.configs = edgeData;
  }

  get(k: string) {
    return this.configs[k];
  }

  set(k: string, v: any) {
    this.configs[k] = v;
  }
}
