import {
  ForceBase,
  ForceCenter,
  ForceCollision,
  ForceLink,
  ForceManyBody,
  ForceX,
  ForceY,
  ForceRadial,
  InterClusterForce,
  IntraClusterForce,
} from "./force_func";
import { autoForces } from "./auto_force";
import { NodeData, EdgeData } from "../../typings/data";
import { pivotMDSInit, randomInit, spiralInit } from "./initial_layout";
import { isMultiComponentsForData, randomSeed } from "../utils";

const defaultForces = (
  edges: any[],
  x?: number,
  y?: number,
  nodeSize?: number
) => {
  return new Map<string, ForceBase>([
    ["link", new ForceLink({ edges, options: { distance: 30 } })],
    ["charge", new ForceManyBody({ options: { strength: -30 } })],
    [
      "collide",
      new ForceCollision({ options: { radius: nodeSize ? nodeSize / 2 : 10 } }),
    ],
    ["center", new ForceCenter({ options: { x, y } })],
  ]);
};

const ALL_FORCES = {
  center: ForceCenter,
  collision: ForceCollision,
  link: ForceLink,
  manyBody: ForceManyBody,
  x: ForceX,
  y: ForceY,
  radial: ForceRadial,
  inter: InterClusterForce,
  intra: IntraClusterForce,
};

const DEFAULT_OPTIONS = {
  autoForces: false,
  autoStop: true,
  stopDist: 0.01,
  alpha: 1,
  restartAlpha: 0.1,
  alphaMin: 0.001,
  maxIteration: 300,
  alphaDecay: 0.02276277904418933,
  alphaTarget: 0,
  velocityDecay: 0.6,
  tickIterations: 1,
  randomSeed: 0,
  initMode: "pivotMDS",
  postTickInterval: 0,
  nodeSize: 15,
  graphSize: [800, 600],
};

export type SyncFDPConfigs = {
  autoForces: boolean;
  autoStop: boolean;
  stopDist: number;
  alpha: number;
  restartAlpha: number;
  alphaMin: number;
  maxIteration: number;
  alphaDecay: number;
  alphaTarget: number;
  velocityDecay: number;
  tickIterations: number;
  randomSeed: number;
  initMode: "pivotMDS" | "spiral" | "random";
  postTickInterval: number;
  nodeSize: number;
  graphSize: number[];
  forces: Record<string, any> | string;
  center?: { x: number; y: number };
};

export function syncFDP(
  data: { nodes: NodeData[]; edges: EdgeData[] },
  options: SyncFDPConfigs
) {
  const configs = Object.assign({}, DEFAULT_OPTIONS, options);
  if (configs.randomSeed !== undefined) {
    randomSeed(configs.randomSeed);
  }
  initializeNodes(data, configs);
  configs.center = {
    x: configs.graphSize[0] / 2,
    y: configs.graphSize[1] / 2,
  };
  let forces: Map<string, any>;
  if (configs.autoForces || configs.forces === "auto") {
    const connected = isMultiComponentsForData(data);
    forces = autoForces(data.nodes, data.edges, connected, configs).forces;
  } else {
    forces = configForces(data, configs);
  }
  forces.forEach((force) => {
    force.initialize(data.nodes);
  });
  let nowIteration = 0;
  let alpha = configs.alpha;
  const nodeLen = data.nodes.length;
  function tick() {
    for (let i = 0; i < configs.tickIterations; i++) {
      if (nowIteration >= configs.maxIteration) {
        break;
      }
      alpha += (configs.alphaTarget - alpha) * configs.alphaDecay;
      nowIteration += 1;
      forces.forEach((force: ForceBase) => {
        force.run(alpha);
      });
      moveNodes();
    }
  }

  function moveNodes() {
    let sumMove = 0;
    let maxMove = 0;
    data.nodes.forEach((node: NodeData) => {
      if (node.fx) {
        node.x = node.fx;
      } else {
        node.x += node.vx;
      }
      if (node.fy) {
        node.y = node.fy;
      } else {
        node.y += node.vy;
      }
      if (configs.autoStop) {
        const dist = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        maxMove = Math.max(maxMove, dist);
        sumMove += dist;
      }
      node.vx *= 0.6;
      node.vy *= 0.6;
    });
    if (
      configs.autoStop &&
      isConverged(sumMove, maxMove, nodeLen, configs.stopDist)
    ) {
      nowIteration = configs.maxIteration;
    }
  }

  while (nowIteration < configs.maxIteration) {
    tick();
  }
}

function initializeNodes(
  data: { nodes: NodeData[]; edges: EdgeData[] },
  configs: SyncFDPConfigs
) {
  const { nodes, edges } = data;
  const { initMode, center } = configs;
  if (initMode === "spiral") {
    spiralInit(nodes, center);
  } else if (initMode === "pivotMDS") {
    pivotMDSInit(nodes, edges, center);
  } else {
    randomInit(nodes, center);
  }
  nodes.forEach((n: NodeData) => {
    n.x = +n.x;
    n.y = +n.y;
    if (n.fx) {
      n.fx = +n.fx;
    }
    if (n.fx) {
      n.fy = +n.fy;
    }
  }); // 避免初始值为string类型的情况
}

function configForces(
  data: { nodes: NodeData[]; edges: EdgeData[] },
  configs: SyncFDPConfigs
) {
  let forces: Map<string, any>;
  const forceConfigs = configs.forces;
  if (!forceConfigs) {
    forces = defaultForces(
      data.edges,
      configs.center!.x,
      configs.center!.y,
      configs.nodeSize!
    );
  } else {
    const edges = data.edges;
    forces = new Map();
    Object.keys(forceConfigs).forEach((type: string) => {
      const force = ALL_FORCES[type];
      if (force) {
        forces.set(type, new force({ edges, options: forceConfigs[type] }));
      }
    });
  }
  return forces;
}

function isConverged(
  sumMove: number,
  maxMove: number,
  n: number,
  minDist = 0.01
) {
  // 平均移动长度和最大移动长度满足条件即认为收敛
  if (sumMove / n < minDist && maxMove < 10 * minDist) {
    return true;
  }
  return false;
}
