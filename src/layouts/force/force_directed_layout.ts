import { timer, Timer } from 'd3-timer';
import { Graph } from '../../graph';
import { EdgeData, NodeData, ValidData } from '../../typings/data';
import { LayoutBase } from '../base';
import { GraphStructure } from '../../graph_structure';
import { Node, Edge } from '../../models/entities';
import { randomSeed } from './utils';

import { ForceBase, ForceCenter, ForceCollision, ForceLink, ForceManyBody } from './force_func';
import { pivotMDSInit, randomInit, spiralInit } from './initial_layout';
import { ForceDirectedLayoutOptions } from '../../typings/layouts/force';
import { GRAPH_EVENTS } from '../../consts/meta_events';
import { autoFDP } from './auto_fdp';

export type ForceDirectedLayoutConfigs = {
  /**
   * The graph instance to be layout.
   * 图实例
   */
  graph?: Graph | GraphStructure;
} & ForceDirectedLayoutOptions;

const DEFAULT_NODE_SIZE = 20;

export const defaultForces = (edges?: EdgeData[], x?: number, y?: number, nodeSize = DEFAULT_NODE_SIZE) => {
  const distance = nodeSize * Math.log(nodeSize + 2);
  return new Map<string, ForceBase>([
    ['link', new ForceLink({ edges, options: { distance: distance } })],
    ['charge', new ForceManyBody({ options: { strength: -distance } })],
    ['collide', new ForceCollision({ options: { radius: (d: { width?: number })=> 0.5 * (d.width || nodeSize) + 2 } })],
    ['center', new ForceCenter({ options: { x, y } })],
  ]);
};


export class ForceDirectedLayout extends LayoutBase {
  graph: Graph | GraphStructure;
  nodes: NodeData[] = [];
  edges: EdgeData[] = [];
  forces: Map<string, ForceBase> = new Map();
  options = {
    async: true,
    run: true,
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
    center: { x: 400, y: 300 },
    nodeSize: undefined,
    randomSeed: 0,
    initMode: 'pivotMDS',
    autoFDP: false,
    finetuneForces: undefined as ForceDirectedLayoutConfigs['finetuneForces'],
    clearOnEndOnFirstCall: false,
  };
  onTick: (() => void) | undefined;
  onEnd: (() => void) | undefined;
  nowIteration = 0;
  maxIteration = 0;
  updateCount = 0;
  alpha = 1.0;
  forceMode: 'default' | 'custom' | 'auto' = 'default';
  stepper: Timer = {} as Timer;
  constructor(configs: ForceDirectedLayoutConfigs) {
    super(configs);
    const graph = configs.graph!;
    if (graph !== undefined) {
      if (configs.center === undefined) {
        this.options.center = {
          x: graph.get('width') / 2 || 400,
          y: graph.get('height') / 2 || 300,
        };
      }
      this.configData(graph);
    }
    this.graph = graph;
    this.bindUpdateEvents();
    if (configs.randomSeed) {
      this.options.randomSeed = configs.randomSeed;
      delete configs.randomSeed;
    }
    randomSeed(this.options.randomSeed);
    this.configForces(configs.forces);
    delete configs.forces;
    this.step = this.step.bind(this);
    this.setOptions(configs);
  }

  setOptions(configs: ForceDirectedLayoutConfigs) {
    if (configs.forces) {
      this.configForces(configs.forces);
    }
    if (configs.onTick) {
      this.onTick = configs.onTick;
    }
    if (configs.onEnd) {
      this.onEnd = configs.onEnd;
    }
    this.options = Object.assign(this.options, configs);
    this.maxIteration = this.options.maxIteration;
    this.alpha = this.options.alpha;
    if (configs.randomSeed !== undefined) {
      randomSeed(this.options.randomSeed);
    }
    if (this.options.run && this.graph && this.graph.getNodes().length > 0) {
      this.updateCount = Infinity;
      this.layout();
    }
  }

  layout() {
    if (this.options.async) {
      this.stop();
    }
    if (this.updateCount > 0){
      this.refreshData();
    }
    const graph = this.graph;
    graph instanceof Graph && graph.emitEvent(GRAPH_EVENTS.LAYOUT_START);
    const numEntities = this.nodes.length + this.edges.length;
    const ratio = this.updateCount / (numEntities || 1);
    const shouldForceStart = ratio > 0.2; // 是否强制重新布局，false 则微调。超过 20% 则强制重新布局
    this.updateCount = 0;
    if (shouldForceStart){
      this.initializeNodes(this.options.initMode);
      if (this.forceMode === 'default' || this.forceMode === 'auto'){
        this.configForces();
      }
    }
    if (this.options.async) {
      shouldForceStart ? this.restart(this.options.alpha, this.options.maxIteration) : this.restart();
    } else {
      while (this.nowIteration < this.maxIteration) {
        this.tick();
        if (this.onTick) {
          this.onTick();
        }
      }
      if (this.onEnd) {
        this.onEnd();
        if (this.options.clearOnEndOnFirstCall) {
          this.onEnd = undefined;
        }
      }
      graph instanceof Graph && graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
    }
  }

  private configData(data: Graph | GraphStructure | ValidData) {
    if (
      data instanceof Graph ||
      data instanceof GraphStructure ||
      data.constructor.name === 'Graph' ||
      data.constructor.name === 'GraphStructure'
    ) {
      this.nodes = (data as Graph).getNodes().map((node: Node) => node.configs as NodeData);
      this.edges = (data as Graph).getEdges().map((edge: Edge) => edge.configs as EdgeData);
    } else {
      this.nodes = data.nodes;
      if (data.edges) {
        this.edges = data.edges;
      }
    }
    this.initializeNodes(this.options.initMode);
  }

  private bindUpdateEvents(){
    const graph = this.graph;
    if (!graph || !(graph instanceof Graph)){
      return;
    }
    const SingleUpdateEvents = [
      GRAPH_EVENTS.ADD_END,
      GRAPH_EVENTS.REMOVE_END,
      GRAPH_EVENTS.UPDATE_END,
    ];
    SingleUpdateEvents.forEach((event: string) => {
      graph.on(event, (ev) => {
        if (event === GRAPH_EVENTS.ADD_END && ev.target.type === 'node'){
          const node = ev.target;
          node.set('x', Math.random() * 100);
          node.set('y', Math.random() * 100);
        }
        this.updateCount++;
      });
    });

    graph.on(GRAPH_EVENTS.CLEAR_END, () => {
      this.updateCount = Infinity;
      this.nodes = [];
      this.edges = [];
    });
    graph.on(GRAPH_EVENTS.DATA_END, () => {
      this.updateCount = Infinity;
    });

    graph.on(GRAPH_EVENTS.UPDATE_DATA_END, () => {
      const nodesMap = new Map();
      this.nodes.forEach((node: NodeData) => {
        nodesMap.set(node.id, true);
      });
      const edgesMap = new Map();
      this.edges.forEach((edge: EdgeData) => {
        edgesMap.set(edge.source + '-' + edge.target, true);
      });

      this.updateCount = 0;

      const nodes = graph.getNodes();
      const edges = graph.getEdges();
      for (const node of nodes){
        if (!nodesMap.get(node.get('id'))) {
          this.updateCount++;
        }
      }

      edges.forEach((edge: Edge) => {
        if (!edgesMap.get(edge.get('source') + '-' + edge.get('target'))) {
          this.updateCount++;
        }
      });
    });

  }

  private refreshData() {
    const graph = this.graph as Graph;
    this.nodes = graph.getNodes().map((node: Node) => node.configs as NodeData);
    this.edges = graph.getEdges().map((edge: Edge) => edge.configs as EdgeData);
    this.initializeForces();
  }

  // graph.updateData
  updateData(data: Graph | GraphStructure | ValidData) {
    this.stop();
    if (
      data instanceof Graph ||
      data instanceof GraphStructure ||
      data.constructor.name === 'Graph' ||
      data.constructor.name === 'GraphStructure'
    ) {
      this.nodes = (data as Graph).getNodes().map((node: Node) => node.configs as NodeData);
      this.edges = (data as Graph).getEdges().map((edge: Edge) => edge.configs as EdgeData);
    } else {
      this.nodes = data.nodes;
      if (data.edges) {
        this.edges = data.edges;
      }
    }
    this.nodes.forEach((n: NodeData) => {
      if (!n.x) {
        n.x = Math.random() * DEFAULT_NODE_SIZE;
      }
      if (!n.y) {
        n.y = Math.random() * DEFAULT_NODE_SIZE;
      }
      if (!n.vx) {
        n.vx = 0;
      }
      if (!n.vy) {
        n.vy = 0;
      }
      n.x = +n.x;
      n.y = +n.y;
      if (n.fx) {
        n.fx = +n.fx;
      }
      if (n.fx) {
        n.fy = +n.fy;
      }
    }); // 避免初始值为string类型的情况
    this.initializeForces();
  }
  getData() {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }

  // run simulation per step
  private step() {
    this.tick();
    if (this.onTick !== undefined) {
      this.onTick();
    }
    if (this.nowIteration >= this.maxIteration) {
      this.stepper.stop(); // 应该先 stop timer 再进入 onEnd 逻辑
      if (this.onEnd !== undefined) {
        this.onEnd();
        if (this.options.clearOnEndOnFirstCall) {
          this.onEnd = undefined;
        }
      }
      this.graph instanceof Graph && this.graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
    }
  }

  stop() {
    this.stepper?.stop?.(); // nodes 为空的情况可能未初始化。
  }
  start() {
    this.nowIteration = 0;
    if (Object.keys(this.stepper).length === 0) {
      this.stepper = timer(this.step);
    } else {
      this.stepper.restart(this.step);
    }
  }
  restart(restartAlpha?: number, restartIterations = 100) {
    this.nowIteration = 0;
    if (restartAlpha !== undefined) {
      this.alpha = restartAlpha;
    } else {
      this.alpha = this.options.restartAlpha;
    }
    if (restartIterations !== undefined) {
      this.maxIteration = restartIterations;
    }
    this.start();
  }

  destroy() {
    super.destroy();
    this.stop();
    this.nodes = [];
    this.edges = [];
  }

  private tick() {
    for (let i = 0; i < this.options.tickIterations; i++) {
      if (this.nowIteration >= this.maxIteration) {
        break;
      }
      this.alpha += (this.options.alphaTarget - this.alpha) * this.options.alphaDecay;
      this.nowIteration += 1;
      this.forces.forEach((force) => {
        force.run(this.alpha);
      });
      this.moveNodes();
    }
  }

  // private methods, move nodes by force.
  private moveNodes() {
    let sumMove = 0;
    let maxMove = 0;
    this.nodes.forEach((node) => {
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
      if (this.options.autoStop) {
        const dist = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        maxMove = Math.max(maxMove, dist);
        sumMove += dist;
      }
      node.vx *= 0.6;
      node.vy *= 0.6;
    });
    if (this.options.autoStop && this.isConverged(sumMove, maxMove)) {
      this.nowIteration = this.maxIteration;
    }
  }

  private isConverged(sumMove: number, maxMove: number) {
    const n = this.nodes.length;
    const minDist = this.options.stopDist ?? 0.01;
    // 平均移动长度和最大移动长度满足条件即认为收敛
    if (sumMove / n < minDist && maxMove < 10 * minDist) {
      return true;
    }
    return false;
  }

  // initialize
  initializeNodes(init?: string) {
    if (init === undefined) {
      init = 'random';
    }
    const nodeSize = this.options.nodeSize ?? (this.getMaxNodeSize() || DEFAULT_NODE_SIZE);
    if (init === 'spiral') {
      spiralInit(this.nodes, this.options.center, nodeSize);
    } else if (init === 'random') {
      randomInit(this.nodes, this.options.center, nodeSize);
    } else if (init === 'pivotMDS') {
      pivotMDSInit(this.nodes, this.edges, this.options.center, nodeSize);
    }
    this.nodes.forEach((n: NodeData) => {
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

  private getMaxNodeSize(){
    let maxNodeSize = 0;
    this.nodes?.forEach((node: NodeData) => {
      maxNodeSize = Math.max(maxNodeSize, node.width ?? 2 * node.r);
    });
    return maxNodeSize || DEFAULT_NODE_SIZE;
  }

  /**
   * 定义力，如果未给出，则使用默认的力。
   * @param forces - 力函数
   */
  configForces(forces?: { [key: string]: ForceBase } | Map<string, ForceBase>) {
    if (this.options.autoFDP){
      const graph = this.graph;
      const nodeSize = this.options.nodeSize ?? this.getMaxNodeSize();
      const { forces, zoomRatio} = autoFDP({nodes: this.nodes, edges: this.edges}, {graphSize:  [graph.get?.('width') ?? 800, graph.get?.('height') ?? 600], nodeSize});
      const customForces = this.options.finetuneForces?.(forces);
      this.forces = customForces ?? forces;
      if (graph instanceof Graph){
        graph.setMatrix([1, 0, 0, 1, 0, 0]);
        graph.scale(zoomRatio, [this.options.center.x, this.options.center.y]);
      }
      this.forceMode = 'auto';
    } else if (forces === undefined) {
      const nodeSize = this.options.nodeSize ?? this.getMaxNodeSize();
      const forces = defaultForces(this.edges, this.options.center.x, this.options.center.y, nodeSize);
      const customForces = this.options.finetuneForces?.(forces);
      this.forces = customForces ?? forces;
      this.forceMode = 'default';
    } else if (forces instanceof Map) {
      this.forces = forces;
      this.forceMode = 'custom';
    } else {
      this.forces = new Map(Object.entries(forces));
      this.forceMode = 'custom';
    }
    this.initializeForces();
  }
  initializeForces() {
    this.forces.forEach((force: ForceBase) => {
      force.initialize(this.nodes, this.edges); // force_link 需要 edges
    });
  }
  addForce(key: string, force: ForceBase) {
    this.forces.set(key, force);
  }
  removeForce(key: string) {
    this.forces.delete(key);
  }
  setForce(key: string, config: any) {
    const force = this.forces.get(key);
    if (force) {
      force.configure(config);
    } else {
      console.info(`force ${key} not found`);
    }
  }
  getForce(key: string) {
    return this.forces.get(key);
  }
  getForces() {
    return this.forces;
  }
}
