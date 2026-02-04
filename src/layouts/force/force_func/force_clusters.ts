import { NodeData } from '../../../typings/data';
import { ForceBase } from '.';
import { jiggle, setNodesOption } from '../utils';

const IGNORE_GROUP = [undefined, null, 'ignore'];
export class IntraClusterForce extends ForceBase {
  groups: NodeData[][] = [];
  clusterMapping: (nodeData: NodeData) => string | number = (nodeData: NodeData) => nodeData.group;
  options: {
    mass?: number | number[] | ((nodeData: NodeData) => number);
    strength?: number | number[] | ((nodeData: NodeData) => number);
  } = {
    mass: 1,
    strength: 1,
  };
  private isCustomizedNodes = false;
  private strengths: Map<any, number> = new Map();
  private masses: Map<any, number> = new Map();
  constructor(configs?: {
    nodes?: NodeData[];
    clusterMapping?: (nodeData: NodeData) => number | string;
    options?: {
      mass?: number | number[] | ((nodeData: NodeData) => number);
      strength?: number | number[] | ((nodeData: NodeData) => number);
    };
    iterationCallback?: () => void;
  }) {
    super();
    if (configs) {
      if (configs.nodes) {
        this.nodes = configs.nodes;
        this.isCustomizedNodes = true;
      }
      if (configs.clusterMapping) {
        this.clusterMapping = configs.clusterMapping;
      }
      if (configs.options) {
        this.options = Object.assign({}, this.options, configs.options);
      }
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
  initialize(nodes: any) {
    if (this.isCustomizedNodes === false) {
      this.nodes = nodes;
    }
    if (this.options.strength) {
      this.strengths = setNodesOption(this.nodes, this.options.strength);
    }
    if (this.options.mass) {
      this.masses = setNodesOption(this.nodes, this.options.mass);
    }
    this.nodes = this.nodes.filter((nodeData: NodeData) => !IGNORE_GROUP.includes(this.clusterMapping(nodeData) as any));
    const groupNames = new Set(this.nodes.map(this.clusterMapping));
    const groups = [] as any;
    const groupsMap = new Map();
    groupNames.forEach((groupName: any) => {
      groupsMap.set(groupName, []);
    });
    this.nodes.forEach((node: any) => {
      const groupName = this.clusterMapping(node);
      groupsMap.get(groupName).push(node);
    });
    groupNames.forEach((groupName: any) => {
      groups.push(groupsMap.get(groupName));
    });
    this.groups = groups;
  }
  run(alpha: any) {
    this.groups.forEach((group: any) => {
      let sumX = 0;
      let sumY = 0;
      let sumMass = 0;
      group.forEach((node: any) => {
        const mass = this.masses.get(node.id) || 1;
        sumX += node.x * mass;
        sumY += node.y * mass;
        sumMass += mass;
      });
      const centerX = sumX / sumMass;
      const centerY = sumY / sumMass;
      group.forEach((node: any) => {
        const strength = (this.strengths.get(node.id) || 0) * (alpha || 1);
        node.vx += (centerX - node.x - node.vx) * strength;
        node.vy += (centerY - node.y - node.vy) * strength;
      });
    });
  }
  setStrengths(strength: number | number[] | ((nodeData: NodeData) => number)): void {
    this.options.strength = strength;
    this.strengths = setNodesOption(this.nodes, this.options.strength);
  }
  setMasses(mass: number | number[] | ((nodeData: NodeData) => number)): void {
    this.options.mass = mass;
    this.masses = setNodesOption(this.nodes, this.options.mass);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class InterClusterForce extends ForceBase {
  // TODO: NOT Finished
  groups: any[] = [];
  options: {
    mass?: number | number[] | ((nodeData: NodeData) => number);
    strength?: number | number[] | ((nodeData: NodeData) => number);
  } = {
    mass: 1,
    strength: -30,
  };
  private isCustomizedNodes = false;
  masses: Map<any, number> = new Map();
  strengths: Map<any, number> = new Map();
  clusterMapping: (nodeData: NodeData) => string | number = (nodeData: NodeData) => nodeData.group;
  distanceMin2 = 1;
  virtualNodes: NodeData[] = [];
  constructor(configs?: {
    nodes?: NodeData[];
    clusterMapping?: (nodeData: NodeData) => string | number;
    options?: {
      mass?: number | number[] | ((nodeData: NodeData) => number);
      strength?: number | number[] | ((nodeData: NodeData) => number);
    };
    iterationCallback?: () => void;
  }) {
    super();
    if (configs) {
      if (configs.nodes) {
        this.nodes = configs.nodes;
        this.isCustomizedNodes = true;
      }
      if (configs.clusterMapping) {
        this.clusterMapping = configs.clusterMapping;
      }
      if (configs.options) {
        this.options = Object.assign({}, this.options, configs.options);
      }
      if (configs.iterationCallback) {
        this.iterationCallback = configs.iterationCallback;
      }
    }
  }
  initialize(nodes: any) {
    if (this.isCustomizedNodes === false) {
      this.nodes = nodes;
    }
    if (this.options.strength !== undefined) {
      this.strengths = setNodesOption(this.nodes, this.options.strength);
    }
    if (this.options.mass !== undefined) {
      this.masses = setNodesOption(this.nodes, this.options.mass);
    }
    this.nodes = this.nodes.filter((nodeData: NodeData) => !IGNORE_GROUP.includes(this.clusterMapping(nodeData) as string));
    const groupNames = new Set(this.nodes.map(this.clusterMapping));
    const groups = [] as any;
    const groupsMap = new Map();
    groupNames.forEach((groupName: any) => {
      groupsMap.set(groupName, []);
    });
    this.nodes.forEach((node: any) => {
      const groupName = this.clusterMapping(node);
      groupsMap.get(groupName).push(node);
    });
    groupNames.forEach((groupName: any) => {
      // 每个group都有一个虚拟的node，用来计算repulsive force
      // 虚拟node的位置是group的中心，可以简化计算(m*(n-m)=>(n-m))
      // 虚拟节点对所有节点都有一个推力
      const group = groupsMap.get(groupName);
      const virtualNode = { id: groupName, x: 0, y: 0, vx: 0, vy: 0, strength: 0 };
      const sumStrength = group.reduce((sum: any, node: any) => {
        sum += this.strengths.get(node.id);
        return sum;
      }, 0);
      groups.push(group);
      virtualNode.strength = sumStrength / group.length;
      this.virtualNodes.push(virtualNode);
    });
    this.groups = groups;
  }
  run(alpha: any) {
    this.groups.forEach((group: any, index: number) => {
      const virtualNode = this.virtualNodes[index];
      let sumX = 0;
      let sumY = 0;
      let sumMass = 0;
      const isThisGroup = new Map();
      group.forEach((node: any) => {
        isThisGroup.set(node.id, true);
        const mass = this.masses.get(node.id) || 1;
        sumX += node.x * mass;
        sumY += node.y * mass;
        sumMass += mass;
      });
      const centerX = sumX / sumMass;
      const centerY = sumY / sumMass;
      virtualNode.x = centerX;
      virtualNode.y = centerY;
      const strength = (virtualNode.strength ?? -30) * (alpha ?? 1);
      this.nodes.forEach((node: any) => {
        if (isThisGroup.get(node.id)) {
          return;
        }
        const mass = this.masses.get(node.id) || 1;
        const dx = node.x - centerX || jiggle();
        const dy = node.y - centerY || jiggle();
        const d = Math.sqrt(dx * dx + dy * dy + this.distanceMin2);
        const fx = (strength * dx) / d;
        const fy = (strength * dy) / d;
        node.vx -= fx / mass;
        node.vy -= fy / mass;
      });
    });
  }
  configure(configs?: any): void {
    if (configs) {
      if (configs.nodes) {
        this.nodes = configs.nodes;
      }
      if (configs.clusterMapping) {
        this.clusterMapping = configs.clusterMapping;
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
