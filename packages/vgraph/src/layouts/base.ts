import { TreeData, ValidData } from "../typings/data";
import { Graph, TreeGraph } from "../graph";
import { GraphStructure } from "../graph_structure";

export interface ILayout {
  // 更新配置项
  setOptions: (options: Record<string, unknown>) => void;

  // 执行布局
  layout: (() => void) | ((data: ValidData) => void);

  // 设置布局数据
  data:
    | ((data: Graph | GraphStructure | ValidData) => void)
    | ((data: TreeData | TreeGraph) => void);

  // 获取当前数据
  getData: () => Graph | TreeData | GraphStructure | ValidData;

  // 数据更新
  updateData:
    | ((data: Graph | GraphStructure | ValidData) => void)
    | ((data: TreeData | TreeGraph) => void);

  // 重新布局，与layout的区别在于使用更少的迭代步骤，为新增节点赋予初始坐标而无需完全重新初始化等。
  // 一般是位于 updateData 之后进行的操作。
  reLayout: () => void;

  // 销毁layout实例
  destroy: () => void;
}

export class LayoutBase {
  // graph 对象
  graph: Graph | TreeData | GraphStructure;
  // 配置项
  options: Record<string, unknown> = {};

  constructor(
    configs: { graph?: Graph | TreeGraph | GraphStructure } & Record<
      string,
      unknown
    >
  ) {
    this.graph = configs.graph!;
  }

  setOptions(
    options: { graph?: Graph | TreeGraph | GraphStructure } & Record<
      string,
      unknown
    >
  ) {
    if (options.graph) {
      this.graph = options.graph;
      delete options.graph;
    }
    this.options = Object.assign(this.options, options);
    if (this.graph && this.graph.getNodes().length > 0) {
      this.layout();
    }
  }

  data(data: Graph | TreeGraph | GraphStructure) {
    if (data instanceof Graph || data instanceof GraphStructure) {
      this.graph = data;
    }
    this.layout();
  }

  layout(args?: Record<string, unknown>) {}

  destroy() {
    this.graph = null as unknown as Graph;
    this.options = null as any;
  }
}
