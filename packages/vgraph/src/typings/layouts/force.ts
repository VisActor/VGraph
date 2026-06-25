import { ForceBase } from "../../layouts";

export type ForceDirectedLayoutOptions = {
  /**
   * Specify forces of the layout, will use default forces if empty.
   * 自定义应用的力函数。如果未设置，则使用默认配置。
   */
  forces?: { [key: string]: ForceBase } | Map<string, ForceBase>;
  /**
   * The function will be called every tick of the layout.
   * 布局过程中每个步长的回调函数
   */
  onTick?: () => void;
  /**
   * Whether to use the intelligent method to configure forces.
   * 是否使用智能配置力函数
   */
  autoFDP?: boolean;
  /**
   * The function will be called when the layout is complete.
   * 布局完成后运行的回调函数
   */
  onEnd?: () => void;
  /**
   * Configure synchronous or asynchronous execution layout.
   * 配置同步或异步执行布局
   */
  async?: boolean;
  /**
   * Whether to execute the layout immediately. The default value is True.
   * 是否立即执行布局。默认为 True。
   */
  run?: boolean;
  /**
   * Stop layout automatically when layout is converged.
   * 收敛后自动停止布局
   */
  autoStop?: boolean;
  /**
   * Converge condition.
   * 收敛条件
   */
  stopDist?: number;
  /**
   * Alpha is roughly analogous to temperature in simulated annealing.
   * alpha 类似模拟退火中的温度
   */
  alpha?: number;
  /**
   * Alpha value when a simulation is restarted.
   * 重布局的 alpha 值。一般用于微调布局。
   */
  restartAlpha?: number;
  /**
   * Minimum alpha.When alpha reaches alphaMin, the simulation stops.
   * alpha 最小值，达到此值迭代结束
   */
  alphaMin?: number;
  /**
   * The maximum times of the simulation.
   * 最大迭代次数
   */
  maxIteration?: number;
  /**
   * Alpha decay rate which determines how quickly the simulation cools down.
   * alpha 衰减率，指定退火冷却的速率
   */
  alphaDecay?: number;
  /**
   * The target alpha.
   * alpha 衰减的目标值
   */
  alphaTarget?: number;
  /**
   * Each node's velocity decays after a tick.
   * 节点速率衰减值
   */
  velocityDecay?: number;
  /**
   * How many iterations in a tick.
   * 指定多少个迭代为一个步长
   */
  tickIterations?: number;
  /**
   * The center coordinate of the layout.
   * 指定布局中心
   */
  center?: { x: number; y: number };
  /**
   * The size of a node.
   * 节点大小。将影响力的配置
   */
  nodeSize?: number;
  /**
   * A value that is used to initialize a pseudorandom number generator.
   * 初始化随机数生成器的值
   */
  randomSeed?: number;
  /**
   * The method to assign initial coordinate of nodes.
   * 初始坐标分配方式，默认为`pivotMDS`
   */
  initMode?: string;
  /**
   * Whether to clear this option after calling onEnd to avoid subsequent calls.
   * 是否在调用 onEnd 后清空此配置避免后续调用
   */
  clearOnEndOnFirstCall?: boolean;

  /**
   * Fine-tune the custom force function provided by autoFDP or default forces.
   * 微调 autoFDP 或默认力函数的自定义力函数，在使用autoFDP或默认力函数时生效
   * @param forces
   * The `forces` is a Map of force functions provided by autoFDP or default forces.
   * autoFDP 或默认力函数给出的默认力函数
   * @returns {Map<string, ForceBase>}
   * The `customForces` is a Map of force functions.
   * 函数返回值为微调后的自定义力函数。
   */
  finetuneForces?: (forces: Map<string, ForceBase>) => Map<string, ForceBase>;
};
