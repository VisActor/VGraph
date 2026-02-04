import { NodeData } from '../typings/data';
import { EdgeStructure } from './edge_structure';

export class NodeStructure {
  [x: string]: any;
  configs: NodeData;
  sources: string[];
  targets: string[];
  edges: EdgeStructure[];

  constructor(configs: NodeData) {
    this.configs = configs;
    this.sources = configs.sources || [];
    this.targets = configs.targets || [];
    this.edges = [];
  }

  get(key: string): any {
    return this.configs[key];
  }

  set(key: string, value: unknown) {
    this.configs[key] = value;
  }

  getSources() {
    return this.sources;
  }

  getTargets() {
    return this.targets;
  }

  addSource(id: string) {
    this.sources.push(id);
  }

  addTarget(id: string) {
    this.targets.push(id);
  }

  getEdges() {
    return this.edges;
  }

  getData() {
    return this.configs;
  }
}
